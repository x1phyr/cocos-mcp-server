import { BuiltinCategoryAdapter } from '../bridge/adapters/builtin-category-adapter';
import { CocosCapabilityPlugin } from '../bridge/capability-plugin';
import { ToolExecutor } from '../types';

export function createBuiltinCapability(
    category: string,
    ExecutorClass: new () => ToolExecutor
): CocosCapabilityPlugin {
    return new BuiltinCategoryAdapter(category, new ExecutorClass());
}
