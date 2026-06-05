import { createBuiltinCapability } from '../create-builtin-capability';
import { AssetAdvancedTools } from './tools';

export { AssetAdvancedTools };

export function createAssetAdvancedCapability() {
    return createBuiltinCapability('assetAdvanced', AssetAdvancedTools);
}
