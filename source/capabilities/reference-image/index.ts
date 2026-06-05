import { createBuiltinCapability } from '../create-builtin-capability';
import { ReferenceImageTools } from './tools';

export { ReferenceImageTools };

export function createReferenceImageCapability() {
    return createBuiltinCapability('referenceImage', ReferenceImageTools);
}
