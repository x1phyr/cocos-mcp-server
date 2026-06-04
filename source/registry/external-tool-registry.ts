import { ToolDefinition, ToolResponse } from '../types';
import { BUILTIN_TOOL_CATEGORIES } from './builtin-categories';

export interface ExternalToolInput {
    name: string;
    description: string;
    inputSchema: object;
}

export interface RegisterExternalToolsPayload {
    providerId: string;
    namespace?: string;
    invokeMessage: string;
    tools: ExternalToolInput[];
}

export interface ExternalProviderRegistration {
    providerId: string;
    namespace: string;
    invokeMessage: string;
    tools: ExternalToolInput[];
}

export interface RegisterResult {
    success: boolean;
    error?: string;
    registeredToolNames?: string[];
}

const TOOL_NAME_PATTERN = /^[a-zA-Z][a-zA-Z0-9_]*$/;
const PROVIDER_ID_PATTERN = /^[a-zA-Z][a-zA-Z0-9_-]*$/;

export function validateRegisterPayload(payload: RegisterExternalToolsPayload): string | null {
    if (!payload || typeof payload !== 'object') {
        return 'payload must be an object';
    }
    if (!payload.providerId || typeof payload.providerId !== 'string') {
        return 'providerId is required';
    }
    if (!PROVIDER_ID_PATTERN.test(payload.providerId)) {
        return 'providerId must match [a-zA-Z][a-zA-Z0-9_-]*';
    }
    if (!payload.invokeMessage || typeof payload.invokeMessage !== 'string') {
        return 'invokeMessage is required';
    }
    const namespace = payload.namespace?.trim() || payload.providerId;
    if (!PROVIDER_ID_PATTERN.test(namespace)) {
        return 'namespace must match [a-zA-Z][a-zA-Z0-9_-]*';
    }
    if (BUILTIN_TOOL_CATEGORIES.has(namespace)) {
        return `namespace "${namespace}" conflicts with built-in category`;
    }
    if (!Array.isArray(payload.tools) || payload.tools.length === 0) {
        return 'tools must be a non-empty array';
    }
    const seen = new Set<string>();
    for (const tool of payload.tools) {
        if (!tool || typeof tool !== 'object') {
            return 'each tool must be an object';
        }
        if (!tool.name || typeof tool.name !== 'string' || !TOOL_NAME_PATTERN.test(tool.name)) {
            return `invalid tool name "${tool.name}"`;
        }
        if (seen.has(tool.name)) {
            return `duplicate tool name "${tool.name}"`;
        }
        seen.add(tool.name);
        if (!tool.description || typeof tool.description !== 'string') {
            return `tool "${tool.name}" requires description`;
        }
        if (!tool.inputSchema || typeof tool.inputSchema !== 'object') {
            return `tool "${tool.name}" requires inputSchema object`;
        }
    }
    return null;
}

export function buildFullToolName(namespace: string, shortName: string): string {
    return `${namespace}_${shortName}`;
}

export class ExternalToolRegistry {
    private providers = new Map<string, ExternalProviderRegistration>();
    private fullNameIndex = new Map<string, ExternalProviderRegistration>();

    register(payload: RegisterExternalToolsPayload): RegisterResult {
        const validationError = validateRegisterPayload(payload);
        if (validationError) {
            return { success: false, error: validationError };
        }

        const namespace = payload.namespace?.trim() || payload.providerId;
        const registration: ExternalProviderRegistration = {
            providerId: payload.providerId,
            namespace,
            invokeMessage: payload.invokeMessage,
            tools: payload.tools.map((t) => ({ ...t })),
        };

        this.unregister(payload.providerId);

        const registeredToolNames: string[] = [];
        for (const tool of registration.tools) {
            const fullName = buildFullToolName(namespace, tool.name);
            if (this.fullNameIndex.has(fullName)) {
                return {
                    success: false,
                    error: `tool name "${fullName}" already registered`,
                };
            }
            this.fullNameIndex.set(fullName, registration);
            registeredToolNames.push(fullName);
        }

        this.providers.set(payload.providerId, registration);
        console.log(
            `[ExternalToolRegistry] Registered provider "${payload.providerId}" with ${registeredToolNames.length} tool(s)`
        );
        return { success: true, registeredToolNames };
    }

    unregister(providerId: string): boolean {
        const existing = this.providers.get(providerId);
        if (!existing) {
            return false;
        }
        for (const tool of existing.tools) {
            const fullName = buildFullToolName(existing.namespace, tool.name);
            this.fullNameIndex.delete(fullName);
        }
        this.providers.delete(providerId);
        console.log(`[ExternalToolRegistry] Unregistered provider "${providerId}"`);
        return true;
    }

    getProvider(providerId: string): ExternalProviderRegistration | undefined {
        return this.providers.get(providerId);
    }

    listProviders(): ExternalProviderRegistration[] {
        return Array.from(this.providers.values());
    }

    getMcpToolDefinitions(): ToolDefinition[] {
        const definitions: ToolDefinition[] = [];
        for (const provider of this.providers.values()) {
            for (const tool of provider.tools) {
                definitions.push({
                    name: buildFullToolName(provider.namespace, tool.name),
                    description: tool.description,
                    inputSchema: tool.inputSchema,
                });
            }
        }
        return definitions;
    }

    getToolConfigsForManager(): { category: string; name: string; description: string }[] {
        const configs: { category: string; name: string; description: string }[] = [];
        for (const provider of this.providers.values()) {
            for (const tool of provider.tools) {
                configs.push({
                    category: provider.namespace,
                    name: tool.name,
                    description: tool.description,
                });
            }
        }
        return configs;
    }

    resolveFullToolName(fullName: string): {
        registration: ExternalProviderRegistration;
        shortName: string;
    } | null {
        const registration = this.fullNameIndex.get(fullName);
        if (!registration) {
            return null;
        }
        const prefix = `${registration.namespace}_`;
        if (!fullName.startsWith(prefix)) {
            return null;
        }
        const shortName = fullName.slice(prefix.length);
        if (!registration.tools.some((t) => t.name === shortName)) {
            return null;
        }
        return { registration, shortName };
    }

    async invokeExternalTool(fullName: string, args: unknown): Promise<ToolResponse> {
        const resolved = this.resolveFullToolName(fullName);
        if (!resolved) {
            return { success: false, error: `External tool not found: ${fullName}` };
        }

        const { registration, shortName } = resolved;
        try {
            const result = await Editor.Message.request(
                registration.providerId,
                registration.invokeMessage,
                { tool: shortName, args: args ?? {} }
            );
            return normalizeToolResponse(result);
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : String(error);
            return {
                success: false,
                error: `External provider "${registration.providerId}" failed: ${message}`,
            };
        }
    }
}

export function normalizeToolResponse(result: unknown): ToolResponse {
    if (result && typeof result === 'object' && 'success' in result) {
        return result as ToolResponse;
    }
    return { success: true, data: result };
}

let sharedRegistry: ExternalToolRegistry | null = null;

export function getExternalToolRegistry(): ExternalToolRegistry {
    if (!sharedRegistry) {
        sharedRegistry = new ExternalToolRegistry();
    }
    return sharedRegistry;
}

export function resetExternalToolRegistryForTests(): void {
    sharedRegistry = new ExternalToolRegistry();
}
