import { createBuiltinCapability } from '../create-builtin-capability';
import { ProjectTools } from './tools';

export { ProjectTools };

export function createProjectCapability() {
    return createBuiltinCapability('project', ProjectTools);
}
