/**
 * Local user config directory (Electron userData, or Cocos Creator default paths).
 * Mirrors source/core/config-path.ts for CLI scripts (deploy-mcp, etc.).
 */
const fs = require('fs');
const os = require('os');
const path = require('path');

const MCP_SETTINGS_FILE = '.cocos-mcp-server-mcp-settings.json';
const TOOL_MANAGER_SETTINGS_FILE = '.cocos-mcp-server-tool-manager.json';

function resolveCreatorUserDataFallback() {
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

function getUserConfigDir() {
    try {
        const Electron = require('electron');
        if (Electron.remote && Electron.remote.app) {
            return Electron.remote.app.getPath('userData');
        }
        if (Electron.app) {
            return Electron.app.getPath('userData');
        }
    } catch {
        // CLI / tests — no Electron
    }
    return resolveCreatorUserDataFallback();
}

function ensureUserConfigDir() {
    const dir = getUserConfigDir();
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
    return dir;
}

function getMcpServerSettingsPath() {
    return path.join(getUserConfigDir(), MCP_SETTINGS_FILE);
}

function getToolManagerSettingsPath() {
    return path.join(getUserConfigDir(), TOOL_MANAGER_SETTINGS_FILE);
}

function readMcpServerSettingsJson() {
    const settingsPath = getMcpServerSettingsPath();
    if (!fs.existsSync(settingsPath)) {
        return null;
    }
    try {
        return JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
    } catch (error) {
        console.warn(`Warning: could not read ${settingsPath}: ${error.message}`);
        return null;
    }
}

function migrateLegacyProjectSettings(projectPath) {
    if (!projectPath || !fs.existsSync(projectPath)) {
        return;
    }
    ensureUserConfigDir();
    const legacyDir = path.join(projectPath, 'settings');
    const pairs = [
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
                console.warn(`[MCP] Failed to migrate ${legacyPath}: ${error.message}`);
            }
        }
    }
}

module.exports = {
    MCP_SETTINGS_FILE,
    TOOL_MANAGER_SETTINGS_FILE,
    getUserConfigDir,
    ensureUserConfigDir,
    getMcpServerSettingsPath,
    getToolManagerSettingsPath,
    readMcpServerSettingsJson,
    migrateLegacyProjectSettings,
    resolveCreatorUserDataFallback,
};
