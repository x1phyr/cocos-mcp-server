import { createBuiltinCapability } from '../create-builtin-capability';
import { SceneViewTools } from './tools';

export { SceneViewTools };

export function createSceneViewCapability() {
    return createBuiltinCapability('sceneView', SceneViewTools);
}
