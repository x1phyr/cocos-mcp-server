import { ToolResponse } from '../types';

export interface ProviderToolDefinition {
    name: string;
    description: string;
    inputSchema: object;
    namespace: string;
}

export interface CocosCapabilityPlugin {
    readonly providerId: string;
    getTools(): ProviderToolDefinition[];
    callTool(shortName: string, args: unknown): Promise<ToolResponse>;
}

export type { ProviderKind } from '../registry/register-types';
