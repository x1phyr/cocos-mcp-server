import { CocosCapabilityPlugin } from './capability-plugin';
import { CapabilityManager } from './capability-manager';
import { createSceneCapability } from '../capabilities/scene';
import { createNodeCapability } from '../capabilities/node';
import { createComponentCapability } from '../capabilities/component';
import { createPrefabCapability } from '../capabilities/prefab';
import { createProjectCapability } from '../capabilities/project';
import { createDebugCapability } from '../capabilities/debug';
import { createPreferencesCapability } from '../capabilities/preferences';
import { createServerCapability } from '../capabilities/server';
import { createBroadcastCapability } from '../capabilities/broadcast';
import { createSceneAdvancedCapability } from '../capabilities/scene-advanced';
import { createSceneViewCapability } from '../capabilities/scene-view';
import { createReferenceImageCapability } from '../capabilities/reference-image';
import { createAssetAdvancedCapability } from '../capabilities/asset-advanced';
import { createValidationCapability } from '../capabilities/validation';

const BUILTIN_CAPABILITY_FACTORIES: (() => CocosCapabilityPlugin)[] = [
    createSceneCapability,
    createNodeCapability,
    createComponentCapability,
    createPrefabCapability,
    createProjectCapability,
    createDebugCapability,
    createPreferencesCapability,
    createServerCapability,
    createBroadcastCapability,
    createSceneAdvancedCapability,
    createSceneViewCapability,
    createReferenceImageCapability,
    createAssetAdvancedCapability,
    createValidationCapability,
];

export function createBuiltinCapabilities(): CocosCapabilityPlugin[] {
    return BUILTIN_CAPABILITY_FACTORIES.map((factory) => factory());
}

/** @deprecated Use createBuiltinCapabilities */
export function createBuiltinPlugins(): CocosCapabilityPlugin[] {
    return createBuiltinCapabilities();
}

export function createDefaultCapabilityManager(): CapabilityManager {
    const manager = new CapabilityManager();
    const failures: string[] = [];

    for (const capability of createBuiltinCapabilities()) {
        const result = manager.registerPlugin(capability, 'builtin');
        if (!result.success) {
            failures.push(`${capability.providerId}: ${result.error ?? 'unknown error'}`);
        }
    }

    if (failures.length > 0) {
        console.error(
            `[CapabilityManager] Failed to register ${failures.length} built-in provider(s):\n` +
                failures.map((f) => `  - ${f}`).join('\n')
        );
    }

    return manager;
}
