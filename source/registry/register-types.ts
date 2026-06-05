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

export type ProviderKind = 'builtin' | 'external';

const TOOL_NAME_PATTERN = /^[a-zA-Z][a-zA-Z0-9_]*$/;
const PROVIDER_ID_PATTERN = /^[a-zA-Z][a-zA-Z0-9_-]*$/;
export const BUILTIN_PROVIDER_ID_PREFIX = 'cocos-builtin-';

export function isReservedProviderId(providerId: string): boolean {
    return providerId.startsWith(BUILTIN_PROVIDER_ID_PREFIX);
}

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
    if (isReservedProviderId(payload.providerId)) {
        return `providerId "${payload.providerId}" is reserved for built-in providers`;
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
