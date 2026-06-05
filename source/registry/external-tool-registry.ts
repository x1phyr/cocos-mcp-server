import { ToolDefinition, ToolResponse } from '../types';
import {
    CapabilityManager,
    getCapabilityManager,
    resetCapabilityManagerForTests,
} from '../bridge/capability-manager';
import { normalizeToolResponse } from '../bridge/adapters/external-message-adapter';

export {
    ExternalToolInput,
    RegisterExternalToolsPayload,
    ExternalProviderRegistration,
    RegisterResult,
    validateRegisterPayload,
    buildFullToolName,
} from './register-types';

export { normalizeToolResponse };

/**
 * Isolated external-tool registry for unit tests (no built-in plugins).
 * @deprecated Prefer CapabilityManager in application code.
 */
export class ExternalToolRegistry {
    private readonly manager: CapabilityManager;

    constructor() {
        this.manager = new CapabilityManager();
    }

    register(payload: import('./register-types').RegisterExternalToolsPayload) {
        return this.manager.registerExternal(payload);
    }

    unregister(providerId: string): boolean {
        return this.manager.unregisterExternal(providerId);
    }

    getProvider(providerId: string) {
        return this.manager.listExternalProviders().find((p) => p.providerId === providerId);
    }

    listProviders() {
        return this.manager.listExternalProviders();
    }

    getMcpToolDefinitions(): ToolDefinition[] {
        return this.manager.getExternalMcpToolDefinitions();
    }

    getToolConfigsForManager() {
        return this.manager.getExternalToolConfigsForManager();
    }

    resolveFullToolName(fullName: string) {
        const resolved = this.manager.resolveFullToolName(fullName);
        if (!resolved) {
            return null;
        }
        const registration = this.manager.listExternalProviders().find(
            (p) => p.providerId === resolved.providerId
        );
        if (!registration) {
            return null;
        }
        return { registration, shortName: resolved.shortName };
    }

    async invokeExternalTool(fullName: string, args: unknown): Promise<ToolResponse> {
        if (!this.resolveFullToolName(fullName)) {
            return { success: false, error: `External tool not found: ${fullName}` };
        }
        return this.manager.invokeByFullName(fullName, args);
    }
}

export function getExternalToolRegistry(): ExternalToolRegistryFacade {
    const manager = getCapabilityManager();
    return createExternalFacade(manager);
}

function createExternalFacade(manager: CapabilityManager): ExternalToolRegistryFacade {
    return {
        register: (payload) => manager.registerExternal(payload),
        unregister: (providerId) => manager.unregisterExternal(providerId),
        getProvider: (providerId) =>
            manager.listExternalProviders().find((p) => p.providerId === providerId),
        listProviders: () => manager.listExternalProviders(),
        getMcpToolDefinitions: () => manager.getExternalMcpToolDefinitions(),
        getToolConfigsForManager: () => manager.getExternalToolConfigsForManager(),
        resolveFullToolName: (fullName) => {
            const resolved = manager.resolveFullToolName(fullName);
            if (!resolved) {
                return null;
            }
            const registration = manager.listExternalProviders().find(
                (p) => p.providerId === resolved.providerId
            );
            if (!registration) {
                return null;
            }
            return { registration, shortName: resolved.shortName };
        },
        invokeExternalTool: (fullName, args) => manager.invokeByFullName(fullName, args),
    };
}

export interface ExternalToolRegistryFacade {
    register(payload: import('./register-types').RegisterExternalToolsPayload): import('./register-types').RegisterResult;
    unregister(providerId: string): boolean;
    getProvider(providerId: string): import('./register-types').ExternalProviderRegistration | undefined;
    listProviders(): import('./register-types').ExternalProviderRegistration[];
    getMcpToolDefinitions(): ToolDefinition[];
    getToolConfigsForManager(): { category: string; name: string; description: string }[];
    resolveFullToolName(fullName: string): {
        registration: import('./register-types').ExternalProviderRegistration;
        shortName: string;
    } | null;
    invokeExternalTool(fullName: string, args: unknown): Promise<ToolResponse>;
}

export function resetExternalToolRegistryForTests(): void {
    resetCapabilityManagerForTests();
}
