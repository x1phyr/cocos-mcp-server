import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';

const MCP_SETTINGS_FILE = '.cocos-mcp-server-mcp-settings.json';
const TOOL_MANAGER_SETTINGS_FILE = '.cocos-mcp-server-tool-manager.json';

function resolveCreatorUserDataFallback(): string {
    const home = os.homedir();
    switch (process.platform) {
        case 'darwin':
            return path.join(home, 'Library', 'Application Support', 'CocosCreator');
        case 'win32':
            return path.join(
                process.env.APPDATA || path.join(home, 'AppData', 'Roaming'),
                'CocosCreator'
            );
        default:
            return path.join(home, '.config', 'CocosCreator');
    }
}

/** Electron userData when inside Creator; otherwise Cocos Creator default userData path. */
export function getUserConfigDir(): string {
    try {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const Electron = require('electron') as {
            remote?: { app?: { getPath: (name: string) => string } };
            app?: { getPath: (name: string) => string };
        };
        if (Electron.remote?.app) {
            return Electron.remote.app.getPath('userData');
        }
        if (Electron.app) {
            return Electron.app.getPath('userData');
        }
    } catch {
        // CLI / unit tests
    }
    return resolveCreatorUserDataFallback();
}

export function ensureUserConfigDir(): void {
    const dir = getUserConfigDir();
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
}

export function getMcpServerSettingsPath(): string {
    return path.join(getUserConfigDir(), MCP_SETTINGS_FILE);
}

export function getToolManagerSettingsPath(): string {
    return path.join(getUserConfigDir(), TOOL_MANAGER_SETTINGS_FILE);
}

function getLegacyProjectSettingsDir(): string | null {
    try {
        if (typeof Editor !== 'undefined' && Editor.Project?.path) {
            return path.join(Editor.Project.path, 'settings');
        }
    } catch {
        // Editor not available
    }
    return null;
}

/** One-time copy from `<project>/settings/*.json` when local user files do not exist yet. */
export function migrateLegacyProjectSettingsIfNeeded(): void {
    const legacyDir = getLegacyProjectSettingsDir();
    if (!legacyDir) {
        return;
    }
    ensureUserConfigDir();
    const pairs: [string, string][] = [
        ['mcp-server.json', getMcpServerSettingsPath()],
        ['tool-manager.json', getToolManagerSettingsPath()],
    ];
    for (const [legacyName, targetPath] of pairs) {
        const legacyPath = path.join(legacyDir, legacyName);
        if (!fs.existsSync(targetPath) && fs.existsSync(legacyPath)) {
            try {
                fs.copyFileSync(legacyPath, targetPath);
                console.log(`[MCP] Migrated settings: ${legacyPath} -> ${targetPath}`);
            } catch (error) {
                console.warn(`[MCP] Failed to migrate ${legacyPath}:`, error);
            }
        }
    }
}
