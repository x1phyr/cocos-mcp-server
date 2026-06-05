import { ToolDefinition, ToolResponse } from '../types';
import { buildFullToolName, ProviderKind } from './register-types';

export interface RegistryToolEntry {
    providerId: string;
    namespace: string;
    shortName: string;
    description: string;
    inputSchema: object;
    kind: ProviderKind;
}

export interface ProviderSession {
    providerId: string;
    kind: ProviderKind;
    namespace: string;
    tools: RegistryToolEntry[];
    connectedAt: number;
}

export type InvokeHandler = (
    providerId: string,
    shortName: string,
    args: unknown
) => Promise<ToolResponse>;

export class ToolRegistry {
    private providers = new Map<string, ProviderSession>();
    private fullNameIndex = new Map<string, RegistryToolEntry>();

    constructor(private readonly invokeHandler: InvokeHandler) {}

    syncProvider(
        providerId: string,
        kind: ProviderKind,
        namespace: string,
        tools: Omit<RegistryToolEntry, 'providerId' | 'kind' | 'namespace'>[]
    ): { success: boolean; error?: string; registeredToolNames?: string[] } {
        const registeredToolNames: string[] = [];
        const entries: RegistryToolEntry[] = [];
        const seenShortNames = new Set<string>();

        for (const tool of tools) {
            if (seenShortNames.has(tool.shortName)) {
                return {
                    success: false,
                    error: `duplicate tool short name "${tool.shortName}" in provider`,
                };
            }
            seenShortNames.add(tool.shortName);

            const fullName = buildFullToolName(namespace, tool.shortName);
            const existing = this.fullNameIndex.get(fullName);
            if (existing && existing.providerId !== providerId) {
                return {
                    success: false,
                    error: `tool name "${fullName}" already registered`,
                };
            }
            entries.push({
                providerId,
                kind,
                namespace,
                shortName: tool.shortName,
                description: tool.description,
                inputSchema: tool.inputSchema,
            });
            registeredToolNames.push(fullName);
        }

        this.removeProvider(providerId);
        for (const entry of entries) {
            const fullName = buildFullToolName(namespace, entry.shortName);
            this.fullNameIndex.set(fullName, entry);
        }
        this.providers.set(providerId, {
            providerId,
            kind,
            namespace,
            tools: entries,
            connectedAt: Date.now(),
        });

        return { success: true, registeredToolNames };
    }

    removeProvider(providerId: string): boolean {
        const existing = this.providers.get(providerId);
        if (!existing) {
            return false;
        }
        for (const tool of existing.tools) {
            const fullName = buildFullToolName(existing.namespace, tool.shortName);
            this.fullNameIndex.delete(fullName);
        }
        this.providers.delete(providerId);
        return true;
    }

    clearAll(): void {
        this.providers.clear();
        this.fullNameIndex.clear();
    }

    listProviders(): ProviderSession[] {
        return Array.from(this.providers.values());
    }

    listProvidersByKind(kind: ProviderKind): ProviderSession[] {
        return this.listProviders().filter((p) => p.kind === kind);
    }

    getMcpToolDefinitions(): ToolDefinition[] {
        const definitions: ToolDefinition[] = [];
        for (const entry of this.fullNameIndex.values()) {
            definitions.push({
                name: buildFullToolName(entry.namespace, entry.shortName),
                description: entry.description,
                inputSchema: entry.inputSchema,
            });
        }
        return definitions;
    }

    getMcpToolDefinitionsByKind(kind: ProviderKind): ToolDefinition[] {
        const definitions: ToolDefinition[] = [];
        for (const entry of this.fullNameIndex.values()) {
            if (entry.kind === kind) {
                definitions.push({
                    name: buildFullToolName(entry.namespace, entry.shortName),
                    description: entry.description,
                    inputSchema: entry.inputSchema,
                });
            }
        }
        return definitions;
    }

    getToolConfigsForManager(kind?: ProviderKind): { category: string; name: string; description: string }[] {
        const configs: { category: string; name: string; description: string }[] = [];
        for (const entry of this.fullNameIndex.values()) {
            if (kind && entry.kind !== kind) {
                continue;
            }
            configs.push({
                category: entry.namespace,
                name: entry.shortName,
                description: entry.description,
            });
        }
        return configs;
    }

    resolveFullToolName(fullName: string): { providerId: string; shortName: string; namespace: string } | null {
        const entry = this.fullNameIndex.get(fullName);
        if (!entry) {
            return null;
        }
        return {
            providerId: entry.providerId,
            shortName: entry.shortName,
            namespace: entry.namespace,
        };
    }

    async invoke(fullName: string, args: unknown): Promise<ToolResponse> {
        const resolved = this.resolveFullToolName(fullName);
        if (!resolved) {
            return { success: false, error: `Tool ${fullName} not found` };
        }
        return this.invokeHandler(resolved.providerId, resolved.shortName, args);
    }
}
