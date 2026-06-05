import { ToolExecutor, ToolResponse } from '../../types';
import { CocosCapabilityPlugin, ProviderToolDefinition } from '../capability-plugin';

export class BuiltinCategoryAdapter implements CocosCapabilityPlugin {
    readonly providerId: string;

    constructor(
        private readonly category: string,
        private readonly executor: ToolExecutor
    ) {
        this.providerId = `cocos-builtin-${category}`;
    }

    getTools(): ProviderToolDefinition[] {
        return this.executor.getTools().map((tool) => ({
            name: tool.name,
            description: tool.description,
            inputSchema: tool.inputSchema,
            namespace: this.category,
        }));
    }

    async callTool(shortName: string, args: unknown): Promise<ToolResponse> {
        return this.executor.execute(shortName, args ?? {});
    }
}
