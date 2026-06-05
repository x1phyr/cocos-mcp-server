import { ToolDefinition, ToolResponse } from '../types';
import {
    ExternalProviderRegistration,
    RegisterExternalToolsPayload,
    RegisterResult,
    validateRegisterPayload,
} from '../registry/register-types';
import { ToolRegistry } from '../registry/tool-registry';
import { CocosCapabilityPlugin, ProviderKind } from './capability-plugin';
import { ExternalMessageAdapter } from './adapters/external-message-adapter';

export interface ProviderSummary {
    providerId: string;
    kind: ProviderKind;
    namespace: string;
    toolCount: number;
}

interface PluginEntry {
    plugin: CocosCapabilityPlugin;
    kind: ProviderKind;
}

export class CapabilityManager {
    private readonly registry: ToolRegistry;
    private readonly plugins = new Map<string, PluginEntry>();

    constructor() {
        this.registry = new ToolRegistry((providerId, shortName, args) =>
            this.callTool(providerId, shortName, args)
        );
    }

    registerPlugin(plugin: CocosCapabilityPlugin, kind: ProviderKind): RegisterResult {
        const syncResult = this.syncPluginToRegistry(plugin, kind);
        if (!syncResult.success) {
            return syncResult;
        }
        this.plugins.set(plugin.providerId, { plugin, kind });
        console.log(
            `[CapabilityManager] Registered ${kind} provider "${plugin.providerId}" with ${syncResult.registeredToolNames?.length ?? 0} tool(s)`
        );
        return syncResult;
    }

    registerExternal(payload: RegisterExternalToolsPayload): RegisterResult {
        const validationError = validateRegisterPayload(payload);
        if (validationError) {
            return { success: false, error: validationError };
        }

        const existing = this.plugins.get(payload.providerId);
        if (existing?.kind === 'builtin') {
            return {
                success: false,
                error: `providerId "${payload.providerId}" is registered as a built-in provider`,
            };
        }

        const adapter = new ExternalMessageAdapter(payload);

        const syncResult = this.syncPluginToRegistry(adapter, 'external');
        if (!syncResult.success) {
            return syncResult;
        }

        this.plugins.set(adapter.providerId, { plugin: adapter, kind: 'external' });
        console.log(
            `[CapabilityManager] Registered external provider "${adapter.providerId}" with ${syncResult.registeredToolNames?.length ?? 0} tool(s)`
        );
        return syncResult;
    }

    unregisterExternal(providerId: string): boolean {
        const entry = this.plugins.get(providerId);
        if (!entry || entry.kind !== 'external') {
            return false;
        }
        this.plugins.delete(providerId);
        this.registry.removeProvider(providerId);
        console.log(`[CapabilityManager] Unregistered external provider "${providerId}"`);
        return true;
    }

    removePlugin(providerId: string): boolean {
        const entry = this.plugins.get(providerId);
        if (!entry || entry.kind !== 'external') {
            return false;
        }
        this.plugins.delete(providerId);
        return this.registry.removeProvider(providerId);
    }

    clearAll(): void {
        this.plugins.clear();
        this.registry.clearAll();
    }

    async callTool(providerId: string, shortName: string, args: unknown): Promise<ToolResponse> {
        const entry = this.plugins.get(providerId);
        if (!entry) {
            return { success: false, error: `Provider not found: ${providerId}` };
        }
        return entry.plugin.callTool(shortName, args);
    }

    async invokeByFullName(fullName: string, args: unknown): Promise<ToolResponse> {
        return this.registry.invoke(fullName, args);
    }

    getAllMcpDefinitions(): ToolDefinition[] {
        return this.registry.getMcpToolDefinitions();
    }

    getExternalMcpToolDefinitions(): ToolDefinition[] {
        return this.registry.getMcpToolDefinitionsByKind('external');
    }

    getExternalToolConfigsForManager(): { category: string; name: string; description: string }[] {
        return this.registry.getToolConfigsForManager('external');
    }

    listExternalProviders(): ExternalProviderRegistration[] {
        const registrations: ExternalProviderRegistration[] = [];
        for (const entry of this.plugins.values()) {
            if (entry.kind !== 'external') {
                continue;
            }
            const adapter = entry.plugin as ExternalMessageAdapter;
            if (typeof adapter.getRegistration === 'function') {
                registrations.push(adapter.getRegistration());
            }
        }
        return registrations;
    }

    resolveFullToolName(fullName: string) {
        return this.registry.resolveFullToolName(fullName);
    }

    getProviderSummaries(): ProviderSummary[] {
        return this.registry.listProviders().map((session) => ({
            providerId: session.providerId,
            kind: session.kind,
            namespace: session.namespace,
            toolCount: session.tools.length,
        }));
    }

    exportBuiltinToolConfigs(): { category: string; name: string; description: string }[] {
        return this.registry.getToolConfigsForManager('builtin');
    }

    private syncPluginToRegistry(plugin: CocosCapabilityPlugin, kind: ProviderKind): RegisterResult {
        const tools = plugin.getTools();
        if (tools.length === 0) {
            return { success: false, error: 'provider must expose at least one tool' };
        }

        const namespace = tools[0].namespace;
        for (let i = 1; i < tools.length; i++) {
            if (tools[i].namespace !== namespace) {
                return {
                    success: false,
                    error: `provider "${plugin.providerId}" exposes mixed namespaces (${namespace} vs ${tools[i].namespace})`,
                };
            }
        }

        const syncResult = this.registry.syncProvider(
            plugin.providerId,
            kind,
            namespace,
            tools.map((tool) => ({
                shortName: tool.name,
                description: tool.description,
                inputSchema: tool.inputSchema,
            }))
        );

        if (!syncResult.success) {
            return syncResult;
        }

        return {
            success: true,
            registeredToolNames: syncResult.registeredToolNames,
        };
    }
}

let sharedManager: CapabilityManager | null = null;

export function getCapabilityManager(): CapabilityManager {
    if (!sharedManager) {
        sharedManager = new CapabilityManager();
    }
    return sharedManager;
}

export function setCapabilityManager(manager: CapabilityManager): void {
    sharedManager = manager;
}

export function resetCapabilityManagerForTests(): void {
    sharedManager = new CapabilityManager();
}
