"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserConfigDir = getUserConfigDir;
exports.ensureUserConfigDir = ensureUserConfigDir;
exports.getMcpServerSettingsPath = getMcpServerSettingsPath;
exports.getToolManagerSettingsPath = getToolManagerSettingsPath;
exports.migrateLegacyProjectSettingsIfNeeded = migrateLegacyProjectSettingsIfNeeded;
const fs = __importStar(require("fs"));
const os = __importStar(require("os"));
const path = __importStar(require("path"));
const MCP_SETTINGS_FILE = '.cocos-mcp-server-mcp-settings.json';
const TOOL_MANAGER_SETTINGS_FILE = '.cocos-mcp-server-tool-manager.json';
function resolveCreatorUserDataFallback() {
    const home = os.homedir();
    switch (process.platform) {
        case 'darwin':
            return path.join(home, 'Library', 'Application Support', 'CocosCreator');
        case 'win32':
            return path.join(process.env.APPDATA || path.join(home, 'AppData', 'Roaming'), 'CocosCreator');
        default:
            return path.join(home, '.config', 'CocosCreator');
    }
}
/** Electron userData when inside Creator; otherwise Cocos Creator default userData path. */
function getUserConfigDir() {
    var _a;
    try {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const Electron = require('electron');
        if ((_a = Electron.remote) === null || _a === void 0 ? void 0 : _a.app) {
            return Electron.remote.app.getPath('userData');
        }
        if (Electron.app) {
            return Electron.app.getPath('userData');
        }
    }
    catch (_b) {
        // CLI / unit tests
    }
    return resolveCreatorUserDataFallback();
}
function ensureUserConfigDir() {
    const dir = getUserConfigDir();
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
}
function getMcpServerSettingsPath() {
    return path.join(getUserConfigDir(), MCP_SETTINGS_FILE);
}
function getToolManagerSettingsPath() {
    return path.join(getUserConfigDir(), TOOL_MANAGER_SETTINGS_FILE);
}
function getLegacyProjectSettingsDir() {
    var _a;
    try {
        if (typeof Editor !== 'undefined' && ((_a = Editor.Project) === null || _a === void 0 ? void 0 : _a.path)) {
            return path.join(Editor.Project.path, 'settings');
        }
    }
    catch (_b) {
        // Editor not available
    }
    return null;
}
/** One-time copy from `<project>/settings/*.json` when local user files do not exist yet. */
function migrateLegacyProjectSettingsIfNeeded() {
    const legacyDir = getLegacyProjectSettingsDir();
    if (!legacyDir) {
        return;
    }
    ensureUserConfigDir();
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
            }
            catch (error) {
                console.warn(`[MCP] Failed to migrate ${legacyPath}:`, error);
            }
        }
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29uZmlnLXBhdGguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zb3VyY2UvY29yZS9jb25maWctcGF0aC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQXVCQSw0Q0FpQkM7QUFFRCxrREFLQztBQUVELDREQUVDO0FBRUQsZ0VBRUM7QUFjRCxvRkFxQkM7QUExRkQsdUNBQXlCO0FBQ3pCLHVDQUF5QjtBQUN6QiwyQ0FBNkI7QUFFN0IsTUFBTSxpQkFBaUIsR0FBRyxxQ0FBcUMsQ0FBQztBQUNoRSxNQUFNLDBCQUEwQixHQUFHLHFDQUFxQyxDQUFDO0FBRXpFLFNBQVMsOEJBQThCO0lBQ25DLE1BQU0sSUFBSSxHQUFHLEVBQUUsQ0FBQyxPQUFPLEVBQUUsQ0FBQztJQUMxQixRQUFRLE9BQU8sQ0FBQyxRQUFRLEVBQUUsQ0FBQztRQUN2QixLQUFLLFFBQVE7WUFDVCxPQUFPLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLFNBQVMsRUFBRSxxQkFBcUIsRUFBRSxjQUFjLENBQUMsQ0FBQztRQUM3RSxLQUFLLE9BQU87WUFDUixPQUFPLElBQUksQ0FBQyxJQUFJLENBQ1osT0FBTyxDQUFDLEdBQUcsQ0FBQyxPQUFPLElBQUksSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsU0FBUyxFQUFFLFNBQVMsQ0FBQyxFQUM1RCxjQUFjLENBQ2pCLENBQUM7UUFDTjtZQUNJLE9BQU8sSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsU0FBUyxFQUFFLGNBQWMsQ0FBQyxDQUFDO0lBQzFELENBQUM7QUFDTCxDQUFDO0FBRUQsNEZBQTRGO0FBQzVGLFNBQWdCLGdCQUFnQjs7SUFDNUIsSUFBSSxDQUFDO1FBQ0QsaUVBQWlFO1FBQ2pFLE1BQU0sUUFBUSxHQUFHLE9BQU8sQ0FBQyxVQUFVLENBR2xDLENBQUM7UUFDRixJQUFJLE1BQUEsUUFBUSxDQUFDLE1BQU0sMENBQUUsR0FBRyxFQUFFLENBQUM7WUFDdkIsT0FBTyxRQUFRLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsVUFBVSxDQUFDLENBQUM7UUFDbkQsQ0FBQztRQUNELElBQUksUUFBUSxDQUFDLEdBQUcsRUFBRSxDQUFDO1lBQ2YsT0FBTyxRQUFRLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxVQUFVLENBQUMsQ0FBQztRQUM1QyxDQUFDO0lBQ0wsQ0FBQztJQUFDLFdBQU0sQ0FBQztRQUNMLG1CQUFtQjtJQUN2QixDQUFDO0lBQ0QsT0FBTyw4QkFBOEIsRUFBRSxDQUFDO0FBQzVDLENBQUM7QUFFRCxTQUFnQixtQkFBbUI7SUFDL0IsTUFBTSxHQUFHLEdBQUcsZ0JBQWdCLEVBQUUsQ0FBQztJQUMvQixJQUFJLENBQUMsRUFBRSxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDO1FBQ3RCLEVBQUUsQ0FBQyxTQUFTLENBQUMsR0FBRyxFQUFFLEVBQUUsU0FBUyxFQUFFLElBQUksRUFBRSxDQUFDLENBQUM7SUFDM0MsQ0FBQztBQUNMLENBQUM7QUFFRCxTQUFnQix3QkFBd0I7SUFDcEMsT0FBTyxJQUFJLENBQUMsSUFBSSxDQUFDLGdCQUFnQixFQUFFLEVBQUUsaUJBQWlCLENBQUMsQ0FBQztBQUM1RCxDQUFDO0FBRUQsU0FBZ0IsMEJBQTBCO0lBQ3RDLE9BQU8sSUFBSSxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsRUFBRSxFQUFFLDBCQUEwQixDQUFDLENBQUM7QUFDckUsQ0FBQztBQUVELFNBQVMsMkJBQTJCOztJQUNoQyxJQUFJLENBQUM7UUFDRCxJQUFJLE9BQU8sTUFBTSxLQUFLLFdBQVcsS0FBSSxNQUFBLE1BQU0sQ0FBQyxPQUFPLDBDQUFFLElBQUksQ0FBQSxFQUFFLENBQUM7WUFDeEQsT0FBTyxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsSUFBSSxFQUFFLFVBQVUsQ0FBQyxDQUFDO1FBQ3RELENBQUM7SUFDTCxDQUFDO0lBQUMsV0FBTSxDQUFDO1FBQ0wsdUJBQXVCO0lBQzNCLENBQUM7SUFDRCxPQUFPLElBQUksQ0FBQztBQUNoQixDQUFDO0FBRUQsNkZBQTZGO0FBQzdGLFNBQWdCLG9DQUFvQztJQUNoRCxNQUFNLFNBQVMsR0FBRywyQkFBMkIsRUFBRSxDQUFDO0lBQ2hELElBQUksQ0FBQyxTQUFTLEVBQUUsQ0FBQztRQUNiLE9BQU87SUFDWCxDQUFDO0lBQ0QsbUJBQW1CLEVBQUUsQ0FBQztJQUN0QixNQUFNLEtBQUssR0FBdUI7UUFDOUIsQ0FBQyxpQkFBaUIsRUFBRSx3QkFBd0IsRUFBRSxDQUFDO1FBQy9DLENBQUMsbUJBQW1CLEVBQUUsMEJBQTBCLEVBQUUsQ0FBQztLQUN0RCxDQUFDO0lBQ0YsS0FBSyxNQUFNLENBQUMsVUFBVSxFQUFFLFVBQVUsQ0FBQyxJQUFJLEtBQUssRUFBRSxDQUFDO1FBQzNDLE1BQU0sVUFBVSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUFFLFVBQVUsQ0FBQyxDQUFDO1FBQ3BELElBQUksQ0FBQyxFQUFFLENBQUMsVUFBVSxDQUFDLFVBQVUsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxVQUFVLENBQUMsVUFBVSxDQUFDLEVBQUUsQ0FBQztZQUMxRCxJQUFJLENBQUM7Z0JBQ0QsRUFBRSxDQUFDLFlBQVksQ0FBQyxVQUFVLEVBQUUsVUFBVSxDQUFDLENBQUM7Z0JBQ3hDLE9BQU8sQ0FBQyxHQUFHLENBQUMsNEJBQTRCLFVBQVUsT0FBTyxVQUFVLEVBQUUsQ0FBQyxDQUFDO1lBQzNFLENBQUM7WUFBQyxPQUFPLEtBQUssRUFBRSxDQUFDO2dCQUNiLE9BQU8sQ0FBQyxJQUFJLENBQUMsMkJBQTJCLFVBQVUsR0FBRyxFQUFFLEtBQUssQ0FBQyxDQUFDO1lBQ2xFLENBQUM7UUFDTCxDQUFDO0lBQ0wsQ0FBQztBQUNMLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgKiBhcyBmcyBmcm9tICdmcyc7XG5pbXBvcnQgKiBhcyBvcyBmcm9tICdvcyc7XG5pbXBvcnQgKiBhcyBwYXRoIGZyb20gJ3BhdGgnO1xuXG5jb25zdCBNQ1BfU0VUVElOR1NfRklMRSA9ICcuY29jb3MtbWNwLXNlcnZlci1tY3Atc2V0dGluZ3MuanNvbic7XG5jb25zdCBUT09MX01BTkFHRVJfU0VUVElOR1NfRklMRSA9ICcuY29jb3MtbWNwLXNlcnZlci10b29sLW1hbmFnZXIuanNvbic7XG5cbmZ1bmN0aW9uIHJlc29sdmVDcmVhdG9yVXNlckRhdGFGYWxsYmFjaygpOiBzdHJpbmcge1xuICAgIGNvbnN0IGhvbWUgPSBvcy5ob21lZGlyKCk7XG4gICAgc3dpdGNoIChwcm9jZXNzLnBsYXRmb3JtKSB7XG4gICAgICAgIGNhc2UgJ2Rhcndpbic6XG4gICAgICAgICAgICByZXR1cm4gcGF0aC5qb2luKGhvbWUsICdMaWJyYXJ5JywgJ0FwcGxpY2F0aW9uIFN1cHBvcnQnLCAnQ29jb3NDcmVhdG9yJyk7XG4gICAgICAgIGNhc2UgJ3dpbjMyJzpcbiAgICAgICAgICAgIHJldHVybiBwYXRoLmpvaW4oXG4gICAgICAgICAgICAgICAgcHJvY2Vzcy5lbnYuQVBQREFUQSB8fCBwYXRoLmpvaW4oaG9tZSwgJ0FwcERhdGEnLCAnUm9hbWluZycpLFxuICAgICAgICAgICAgICAgICdDb2Nvc0NyZWF0b3InXG4gICAgICAgICAgICApO1xuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgcmV0dXJuIHBhdGguam9pbihob21lLCAnLmNvbmZpZycsICdDb2Nvc0NyZWF0b3InKTtcbiAgICB9XG59XG5cbi8qKiBFbGVjdHJvbiB1c2VyRGF0YSB3aGVuIGluc2lkZSBDcmVhdG9yOyBvdGhlcndpc2UgQ29jb3MgQ3JlYXRvciBkZWZhdWx0IHVzZXJEYXRhIHBhdGguICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0VXNlckNvbmZpZ0RpcigpOiBzdHJpbmcge1xuICAgIHRyeSB7XG4gICAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvbm8tcmVxdWlyZS1pbXBvcnRzXG4gICAgICAgIGNvbnN0IEVsZWN0cm9uID0gcmVxdWlyZSgnZWxlY3Ryb24nKSBhcyB7XG4gICAgICAgICAgICByZW1vdGU/OiB7IGFwcD86IHsgZ2V0UGF0aDogKG5hbWU6IHN0cmluZykgPT4gc3RyaW5nIH0gfTtcbiAgICAgICAgICAgIGFwcD86IHsgZ2V0UGF0aDogKG5hbWU6IHN0cmluZykgPT4gc3RyaW5nIH07XG4gICAgICAgIH07XG4gICAgICAgIGlmIChFbGVjdHJvbi5yZW1vdGU/LmFwcCkge1xuICAgICAgICAgICAgcmV0dXJuIEVsZWN0cm9uLnJlbW90ZS5hcHAuZ2V0UGF0aCgndXNlckRhdGEnKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoRWxlY3Ryb24uYXBwKSB7XG4gICAgICAgICAgICByZXR1cm4gRWxlY3Ryb24uYXBwLmdldFBhdGgoJ3VzZXJEYXRhJyk7XG4gICAgICAgIH1cbiAgICB9IGNhdGNoIHtcbiAgICAgICAgLy8gQ0xJIC8gdW5pdCB0ZXN0c1xuICAgIH1cbiAgICByZXR1cm4gcmVzb2x2ZUNyZWF0b3JVc2VyRGF0YUZhbGxiYWNrKCk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBlbnN1cmVVc2VyQ29uZmlnRGlyKCk6IHZvaWQge1xuICAgIGNvbnN0IGRpciA9IGdldFVzZXJDb25maWdEaXIoKTtcbiAgICBpZiAoIWZzLmV4aXN0c1N5bmMoZGlyKSkge1xuICAgICAgICBmcy5ta2RpclN5bmMoZGlyLCB7IHJlY3Vyc2l2ZTogdHJ1ZSB9KTtcbiAgICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRNY3BTZXJ2ZXJTZXR0aW5nc1BhdGgoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gcGF0aC5qb2luKGdldFVzZXJDb25maWdEaXIoKSwgTUNQX1NFVFRJTkdTX0ZJTEUpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0VG9vbE1hbmFnZXJTZXR0aW5nc1BhdGgoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gcGF0aC5qb2luKGdldFVzZXJDb25maWdEaXIoKSwgVE9PTF9NQU5BR0VSX1NFVFRJTkdTX0ZJTEUpO1xufVxuXG5mdW5jdGlvbiBnZXRMZWdhY3lQcm9qZWN0U2V0dGluZ3NEaXIoKTogc3RyaW5nIHwgbnVsbCB7XG4gICAgdHJ5IHtcbiAgICAgICAgaWYgKHR5cGVvZiBFZGl0b3IgIT09ICd1bmRlZmluZWQnICYmIEVkaXRvci5Qcm9qZWN0Py5wYXRoKSB7XG4gICAgICAgICAgICByZXR1cm4gcGF0aC5qb2luKEVkaXRvci5Qcm9qZWN0LnBhdGgsICdzZXR0aW5ncycpO1xuICAgICAgICB9XG4gICAgfSBjYXRjaCB7XG4gICAgICAgIC8vIEVkaXRvciBub3QgYXZhaWxhYmxlXG4gICAgfVxuICAgIHJldHVybiBudWxsO1xufVxuXG4vKiogT25lLXRpbWUgY29weSBmcm9tIGA8cHJvamVjdD4vc2V0dGluZ3MvKi5qc29uYCB3aGVuIGxvY2FsIHVzZXIgZmlsZXMgZG8gbm90IGV4aXN0IHlldC4gKi9cbmV4cG9ydCBmdW5jdGlvbiBtaWdyYXRlTGVnYWN5UHJvamVjdFNldHRpbmdzSWZOZWVkZWQoKTogdm9pZCB7XG4gICAgY29uc3QgbGVnYWN5RGlyID0gZ2V0TGVnYWN5UHJvamVjdFNldHRpbmdzRGlyKCk7XG4gICAgaWYgKCFsZWdhY3lEaXIpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBlbnN1cmVVc2VyQ29uZmlnRGlyKCk7XG4gICAgY29uc3QgcGFpcnM6IFtzdHJpbmcsIHN0cmluZ11bXSA9IFtcbiAgICAgICAgWydtY3Atc2VydmVyLmpzb24nLCBnZXRNY3BTZXJ2ZXJTZXR0aW5nc1BhdGgoKV0sXG4gICAgICAgIFsndG9vbC1tYW5hZ2VyLmpzb24nLCBnZXRUb29sTWFuYWdlclNldHRpbmdzUGF0aCgpXSxcbiAgICBdO1xuICAgIGZvciAoY29uc3QgW2xlZ2FjeU5hbWUsIHRhcmdldFBhdGhdIG9mIHBhaXJzKSB7XG4gICAgICAgIGNvbnN0IGxlZ2FjeVBhdGggPSBwYXRoLmpvaW4obGVnYWN5RGlyLCBsZWdhY3lOYW1lKTtcbiAgICAgICAgaWYgKCFmcy5leGlzdHNTeW5jKHRhcmdldFBhdGgpICYmIGZzLmV4aXN0c1N5bmMobGVnYWN5UGF0aCkpIHtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgZnMuY29weUZpbGVTeW5jKGxlZ2FjeVBhdGgsIHRhcmdldFBhdGgpO1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGBbTUNQXSBNaWdyYXRlZCBzZXR0aW5nczogJHtsZWdhY3lQYXRofSAtPiAke3RhcmdldFBhdGh9YCk7XG4gICAgICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybihgW01DUF0gRmFpbGVkIHRvIG1pZ3JhdGUgJHtsZWdhY3lQYXRofTpgLCBlcnJvcik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG59XG4iXX0=