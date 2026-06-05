import { createBuiltinCapability } from '../create-builtin-capability';
import { BroadcastTools } from './tools';

export { BroadcastTools };

export function createBroadcastCapability() {
    return createBuiltinCapability('broadcast', BroadcastTools);
}
