import { createBuiltinCapability } from '../create-builtin-capability';
import { ServerTools } from './tools';

export { ServerTools };

export function createServerCapability() {
    return createBuiltinCapability('server', ServerTools);
}
