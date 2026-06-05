import { createBuiltinCapability } from '../create-builtin-capability';
import { SceneAdvancedTools } from './tools';

export { SceneAdvancedTools };

export function createSceneAdvancedCapability() {
    return createBuiltinCapability('sceneAdvanced', SceneAdvancedTools);
}
