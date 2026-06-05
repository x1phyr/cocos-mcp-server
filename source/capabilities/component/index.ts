import { BuiltinCategoryAdapter } from '../../bridge/adapters/builtin-category-adapter';
import { CocosCapabilityPlugin } from '../../bridge/capability-plugin';
import { getSharedComponentTools } from './shared';
import { ComponentTools } from './tools';

export { ComponentTools };
export { getSharedComponentTools } from './shared';

export function createComponentCapability(): CocosCapabilityPlugin {
    return new BuiltinCategoryAdapter('component', getSharedComponentTools());
}
