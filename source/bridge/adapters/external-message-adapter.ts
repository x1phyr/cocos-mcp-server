import { ToolResponse } from '../../types';
import {
    ExternalProviderRegistration,
    RegisterExternalToolsPayload,
} from '../../registry/register-types';
import { CocosCapabilityPlugin, ProviderToolDefinition } from '../capability-plugin';

export function normalizeToolResponse(result: unknown): ToolResponse {
    if (result && typeof result === 'object' && 'success' in result) {
        const candidate = result as ToolResponse;
        if (typeof candidate.success === 'boolean') {
            return candidate;
        }
        return { success: false, error: 'External provider returned invalid success field' };
    }
    return { success: true, data: result };
}

export class ExternalMessageAdapter implements CocosCapabilityPlugin {
    readonly providerId: string;
    private readonly registration: ExternalProviderRegistration;

    constructor(payload: RegisterExternalToolsPayload) {
        const namespace = payload.namespace?.trim() || payload.providerId;
        this.providerId = payload.providerId;
        this.registration = {
            providerId: payload.providerId,
            namespace,
            invokeMessage: payload.invokeMessage,
            tools: payload.tools.map((t) => ({ ...t })),
        };
    }

    getRegistration(): ExternalProviderRegistration {
        return this.registration;
    }

    getTools(): ProviderToolDefinition[] {
        return this.registration.tools.map((tool) => ({
            name: tool.name,
            description: tool.description,
            inputSchema: tool.inputSchema,
            namespace: this.registration.namespace,
        }));
    }

    async callTool(shortName: string, args: unknown): Promise<ToolResponse> {
        try {
            const result = await Editor.Message.request(
                this.registration.providerId,
                this.registration.invokeMessage,
                { tool: shortName, args: args ?? {} }
            );
            return normalizeToolResponse(result);
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : String(error);
            return {
                success: false,
                error: `External provider "${this.registration.providerId}" failed: ${message}`,
            };
        }
    }
}
