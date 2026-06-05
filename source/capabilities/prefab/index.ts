import { createBuiltinCapability } from '../create-builtin-capability';
import { PrefabTools } from './tools';

export { PrefabTools };

export function createPrefabCapability() {
    return createBuiltinCapability('prefab', PrefabTools);
}
