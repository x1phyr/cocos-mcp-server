import { createBuiltinCapability } from '../create-builtin-capability';
import { SceneTools } from './tools';

export { SceneTools };

export function createSceneCapability() {
    return createBuiltinCapability('scene', SceneTools);
}
