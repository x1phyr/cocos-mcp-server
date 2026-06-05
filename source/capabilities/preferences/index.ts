import { createBuiltinCapability } from '../create-builtin-capability';
import { PreferencesTools } from './tools';

export { PreferencesTools };

export function createPreferencesCapability() {
    return createBuiltinCapability('preferences', PreferencesTools);
}
