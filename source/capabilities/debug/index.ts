import { createBuiltinCapability } from '../create-builtin-capability';
import { DebugTools } from './tools';

export { DebugTools };

export function createDebugCapability() {
    return createBuiltinCapability('debug', DebugTools);
}
