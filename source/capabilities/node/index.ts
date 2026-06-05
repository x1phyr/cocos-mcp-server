import { createBuiltinCapability } from '../create-builtin-capability';
import { NodeTools } from './tools';

export { NodeTools };

export function createNodeCapability() {
    return createBuiltinCapability('node', NodeTools);
}
