import { createBuiltinCapability } from '../create-builtin-capability';
import { ValidationTools } from './tools';

export { ValidationTools };

export function createValidationCapability() {
    return createBuiltinCapability('validation', ValidationTools);
}
