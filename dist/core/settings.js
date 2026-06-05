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
exports.DEFAULT_TOOL_MANAGER_SETTINGS = exports.DEFAULT_SETTINGS = void 0;
exports.readSettings = readSettings;
exports.saveSettings = saveSettings;
exports.validateMcpServerSettings = validateMcpServerSettings;
exports.readToolManagerSettings = readToolManagerSettings;
exports.saveToolManagerSettings = saveToolManagerSettings;
exports.exportToolConfiguration = exportToolConfiguration;
exports.importToolConfiguration = importToolConfiguration;
const fs = __importStar(require("fs"));
const constants_1 = require("./constants");
const config_path_1 = require("./config-path");
const DEFAULT_SETTINGS = {
    port: constants_1.DEFAULT_MCP_PORT,
    autoStart: false,
    enableDebugLog: false,
    allowedOrigins: ['*'],
    maxConnections: 10
};
exports.DEFAULT_SETTINGS = DEFAULT_SETTINGS;
const DEFAULT_TOOL_MANAGER_SETTINGS = {
    configurations: [],
    currentConfigId: '',
    maxConfigSlots: 5
};
exports.DEFAULT_TOOL_MANAGER_SETTINGS = DEFAULT_TOOL_MANAGER_SETTINGS;
function readSettings() {
    try {
        (0, config_path_1.migrateLegacyProjectSettingsIfNeeded)();
        (0, config_path_1.ensureUserConfigDir)();
        const settingsFile = (0, config_path_1.getMcpServerSettingsPath)();
        if (fs.existsSync(settingsFile)) {
            const content = fs.readFileSync(settingsFile, 'utf8');
            return Object.assign(Object.assign({}, DEFAULT_SETTINGS), JSON.parse(content));
        }
    }
    catch (e) {
        console.error('Failed to read settings:', e);
    }
    return DEFAULT_SETTINGS;
}
function saveSettings(settings) {
    try {
        (0, config_path_1.ensureUserConfigDir)();
        const settingsFile = (0, config_path_1.getMcpServerSettingsPath)();
        fs.writeFileSync(settingsFile, JSON.stringify(settings, null, 2));
    }
    catch (e) {
        console.error('Failed to save settings:', e);
        throw e;
    }
}
function validateMcpServerSettings(settings) {
    const port = settings.port;
    if (port === undefined || !Number.isInteger(port) || port < 1024 || port > 65535) {
        return '端口必须是 1024–65535 之间的整数';
    }
    const maxConnections = settings.maxConnections;
    if (maxConnections !== undefined &&
        (!Number.isInteger(maxConnections) || maxConnections < 1 || maxConnections > 100)) {
        return '最大连接数必须是 1–100 之间的整数';
    }
    return null;
}
function readToolManagerSettings() {
    try {
        (0, config_path_1.migrateLegacyProjectSettingsIfNeeded)();
        (0, config_path_1.ensureUserConfigDir)();
        const settingsFile = (0, config_path_1.getToolManagerSettingsPath)();
        if (fs.existsSync(settingsFile)) {
            const content = fs.readFileSync(settingsFile, 'utf8');
            return Object.assign(Object.assign({}, DEFAULT_TOOL_MANAGER_SETTINGS), JSON.parse(content));
        }
    }
    catch (e) {
        console.error('Failed to read tool manager settings:', e);
    }
    return DEFAULT_TOOL_MANAGER_SETTINGS;
}
function saveToolManagerSettings(settings) {
    try {
        (0, config_path_1.ensureUserConfigDir)();
        const settingsFile = (0, config_path_1.getToolManagerSettingsPath)();
        fs.writeFileSync(settingsFile, JSON.stringify(settings, null, 2));
    }
    catch (e) {
        console.error('Failed to save tool manager settings:', e);
        throw e;
    }
}
function exportToolConfiguration(config) {
    return JSON.stringify(config, null, 2);
}
function importToolConfiguration(configJson) {
    try {
        const config = JSON.parse(configJson);
        if (!config.id || !config.name || !Array.isArray(config.tools)) {
            throw new Error('Invalid configuration format');
        }
        return config;
    }
    catch (e) {
        console.error('Failed to parse tool configuration:', e);
        throw new Error('Invalid JSON format or configuration structure');
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2V0dGluZ3MuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zb3VyY2UvY29yZS9zZXR0aW5ncy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUF3QkEsb0NBYUM7QUFFRCxvQ0FTQztBQUVELDhEQWFDO0FBRUQsMERBYUM7QUFFRCwwREFTQztBQUVELDBEQUVDO0FBRUQsMERBV0M7QUExR0QsdUNBQXlCO0FBQ3pCLDJDQUErQztBQUMvQywrQ0FLdUI7QUFHdkIsTUFBTSxnQkFBZ0IsR0FBc0I7SUFDeEMsSUFBSSxFQUFFLDRCQUFnQjtJQUN0QixTQUFTLEVBQUUsS0FBSztJQUNoQixjQUFjLEVBQUUsS0FBSztJQUNyQixjQUFjLEVBQUUsQ0FBQyxHQUFHLENBQUM7SUFDckIsY0FBYyxFQUFFLEVBQUU7Q0FDckIsQ0FBQztBQTRGTyw0Q0FBZ0I7QUExRnpCLE1BQU0sNkJBQTZCLEdBQXdCO0lBQ3ZELGNBQWMsRUFBRSxFQUFFO0lBQ2xCLGVBQWUsRUFBRSxFQUFFO0lBQ25CLGNBQWMsRUFBRSxDQUFDO0NBQ3BCLENBQUM7QUFzRnlCLHNFQUE2QjtBQXBGeEQsU0FBZ0IsWUFBWTtJQUN4QixJQUFJLENBQUM7UUFDRCxJQUFBLGtEQUFvQyxHQUFFLENBQUM7UUFDdkMsSUFBQSxpQ0FBbUIsR0FBRSxDQUFDO1FBQ3RCLE1BQU0sWUFBWSxHQUFHLElBQUEsc0NBQXdCLEdBQUUsQ0FBQztRQUNoRCxJQUFJLEVBQUUsQ0FBQyxVQUFVLENBQUMsWUFBWSxDQUFDLEVBQUUsQ0FBQztZQUM5QixNQUFNLE9BQU8sR0FBRyxFQUFFLENBQUMsWUFBWSxDQUFDLFlBQVksRUFBRSxNQUFNLENBQUMsQ0FBQztZQUN0RCx1Q0FBWSxnQkFBZ0IsR0FBSyxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxFQUFHO1FBQzNELENBQUM7SUFDTCxDQUFDO0lBQUMsT0FBTyxDQUFDLEVBQUUsQ0FB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QixDQUFDLFVBQWtCO0lBQ3RELElBQUksQ0FBQztRQUNELE1BQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsVUFBVSxDQUFDLENBQUM7UUFDdEMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQztZQUM3RCxNQUFNLElBQUksS0FBSyxDQUFDLDhCQUE4QixDQUFDLENBQUM7UUFDcEQsQ0FBQztRQUNELE9BQU8sTUFBTSxDQUFDO0lBQ2xCLENBQUM7SUFBQyxPQUFPLENBQUMsRUFBRSxDQUFDO1FBQ1QsT0FBTyxDQUFDLEtBQUssQ0FBQyxxQ0FBcUMsRUFBRSxDQUFDLENBQUMsQ0FBQztRQUN4RCxNQUFNLElBQUksS0FBSyxDQUFDLGdEQUFnRCxDQUFDLENBQUM7SUFDdEUsQ0FBQztBQUNMLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgKiBhcyBmcyBmcm9tICdmcyc7XG5pbXBvcnQgeyBERUZBVUxUX01DUF9QT1JUIH0gZnJvbSAnLi9jb25zdGFudHMnO1xuaW1wb3J0IHtcbiAgICBlbnN1cmVVc2VyQ29uZmlnRGlyLFxuICAgIGdldE1jcFNlcnZlclNldHRpbmdzUGF0aCxcbiAgICBnZXRUb29sTWFuYWdlclNldHRpbmdzUGF0aCxcbiAgICBtaWdyYXRlTGVnYWN5UHJvamVjdFNldHRpbmdzSWZOZWVkZWQsXG59IGZyb20gJy4vY29uZmlnLXBhdGgnO1xuaW1wb3J0IHsgTUNQU2VydmVyU2V0dGluZ3MsIFRvb2xNYW5hZ2VyU2V0dGluZ3MsIFRvb2xDb25maWd1cmF0aW9uLCBUb29sQ29uZmlnIH0gZnJvbSAnLi4vdHlwZXMnO1xuXG5jb25zdCBERUZBVUxUX1NFVFRJTkdTOiBNQ1BTZXJ2ZXJTZXR0aW5ncyA9IHtcbiAgICBwb3J0OiBERUZBVUxUX01DUF9QT1JULFxuICAgIGF1dG9TdGFydDogZmFsc2UsXG4gICAgZW5hYmxlRGVidWdMb2c6IGZhbHNlLFxuICAgIGFsbG93ZWRPcmlnaW5zOiBbJyonXSxcbiAgICBtYXhDb25uZWN0aW9uczogMTBcbn07XG5cbmNvbnN0IERFRkFVTFRfVE9PTF9NQU5BR0VSX1NFVFRJTkdTOiBUb29sTWFuYWdlclNldHRpbmdzID0ge1xuICAgIGNvbmZpZ3VyYXRpb25zOiBbXSxcbiAgICBjdXJyZW50Q29uZmlnSWQ6ICcnLFxuICAgIG1heENvbmZpZ1Nsb3RzOiA1XG59O1xuXG5leHBvcnQgZnVuY3Rpb24gcmVhZFNldHRpbmdzKCk6IE1DUFNlcnZlclNldHRpbmdzIHtcbiAgICB0cnkge1xuICAgICAgICBtaWdyYXRlTGVnYWN5UHJvamVjdFNldHRpbmdzSWZOZWVkZWQoKTtcbiAgICAgICAgZW5zdXJlVXNlckNvbmZpZ0RpcigpO1xuICAgICAgICBjb25zdCBzZXR0aW5nc0ZpbGUgPSBnZXRNY3BTZXJ2ZXJTZXR0aW5nc1BhdGgoKTtcbiAgICAgICAgaWYgKGZzLmV4aXN0c1N5bmMoc2V0dGluZ3NGaWxlKSkge1xuICAgICAgICAgICAgY29uc3QgY29udGVudCA9IGZzLnJlYWRGaWxlU3luYyhzZXR0aW5nc0ZpbGUsICd1dGY4Jyk7XG4gICAgICAgICAgICByZXR1cm4geyAuLi5ERUZBVUxUX1NFVFRJTkdTLCAuLi5KU09OLnBhcnNlKGNvbnRlbnQpIH07XG4gICAgICAgIH1cbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoJ0ZhaWxlZCB0byByZWFkIHNldHRpbmdzOicsIGUpO1xuICAgIH1cbiAgICByZXR1cm4gREVGQVVMVF9TRVRUSU5HUztcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHNhdmVTZXR0aW5ncyhzZXR0aW5nczogTUNQU2VydmVyU2V0dGluZ3MpOiB2b2lkIHtcbiAgICB0cnkge1xuICAgICAgICBlbnN1cmVVc2VyQ29uZmlnRGlyKCk7XG4gICAgICAgIGNvbnN0IHNldHRpbmdzRmlsZSA9IGdldE1jcFNlcnZlclNldHRpbmdzUGF0aCgpO1xuICAgICAgICBmcy53cml0ZUZpbGVTeW5jKHNldHRpbmdzRmlsZSwgSlNPTi5zdHJpbmdpZnkoc2V0dGluZ3MsIG51bGwsIDIpKTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoJ0ZhaWxlZCB0byBzYXZlIHNldHRpbmdzOicsIGUpO1xuICAgICAgICB0aHJvdyBlO1xuICAgIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHZhbGlkYXRlTWNwU2VydmVyU2V0dGluZ3Moc2V0dGluZ3M6IFBhcnRpYWw8TUNQU2VydmVyU2V0dGluZ3M+KTogc3RyaW5nIHwgbnVsbCB7XG4gICAgY29uc3QgcG9ydCA9IHNldHRpbmdzLnBvcnQ7XG4gICAgaWYgKHBvcnQgPT09IHVuZGVmaW5lZCB8fCAhTnVtYmVyLmlzSW50ZWdlcihwb3J0KSB8fCBwb3J0IDwgMTAyNCB8fCBwb3J0ID4gNjU1MzUpIHtcbiAgICAgICAgcmV0dXJuICfnq6/lj6Plv4XpobvmmK8gMTAyNOKAkzY1NTM1IOS5i+mXtOeahOaVtOaVsCc7XG4gICAgfVxuICAgIGNvbnN0IG1heENvbm5lY3Rpb25zID0gc2V0dGluZ3MubWF4Q29ubmVjdGlvbnM7XG4gICAgaWYgKFxuICAgICAgICBtYXhDb25uZWN0aW9ucyAhPT0gdW5kZWZpbmVkICYmXG4gICAgICAgICghTnVtYmVyLmlzSW50ZWdlcihtYXhDb25uZWN0aW9ucykgfHwgbWF4Q29ubmVjdGlvbnMgPCAxIHx8IG1heENvbm5lY3Rpb25zID4gMTAwKVxuICAgICkge1xuICAgICAgICByZXR1cm4gJ+acgOWkp+i/nuaOpeaVsOW/hemhu+aYryAx4oCTMTAwIOS5i+mXtOeahOaVtOaVsCc7XG4gICAgfVxuICAgIHJldHVybiBudWxsO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcmVhZFRvb2xNYW5hZ2VyU2V0dGluZ3MoKTogVG9vbE1hbmFnZXJTZXR0aW5ncyB7XG4gICAgdHJ5IHtcbiAgICAgICAgbWlncmF0ZUxlZ2FjeVByb2plY3RTZXR0aW5nc0lmTmVlZGVkKCk7XG4gICAgICAgIGVuc3VyZVVzZXJDb25maWdEaXIoKTtcbiAgICAgICAgY29uc3Qgc2V0dGluZ3NGaWxlID0gZ2V0VG9vbE1hbmFnZXJTZXR0aW5nc1BhdGgoKTtcbiAgICAgICAgaWYgKGZzLmV4aXN0c1N5bmMoc2V0dGluZ3NGaWxlKSkge1xuICAgICAgICAgICAgY29uc3QgY29udGVudCA9IGZzLnJlYWRGaWxlU3luYyhzZXR0aW5nc0ZpbGUsICd1dGY4Jyk7XG4gICAgICAgICAgICByZXR1cm4geyAuLi5ERUZBVUxUX1RPT0xfTUFOQUdFUl9TRVRUSU5HUywgLi4uSlNPTi5wYXJzZShjb250ZW50KSB9O1xuICAgICAgICB9XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgICBjb25zb2xlLmVycm9yKCdGYWlsZWQgdG8gcmVhZCB0b29sIG1hbmFnZXIgc2V0dGluZ3M6JywgZSk7XG4gICAgfVxuICAgIHJldHVybiBERUZBVUxUX1RPT0xfTUFOQUdFUl9TRVRUSU5HUztcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHNhdmVUb29sTWFuYWdlclNldHRpbmdzKHNldHRpbmdzOiBUb29sTWFuYWdlclNldHRpbmdzKTogdm9pZCB7XG4gICAgdHJ5IHtcbiAgICAgICAgZW5zdXJlVXNlckNvbmZpZ0RpcigpO1xuICAgICAgICBjb25zdCBzZXR0aW5nc0ZpbGUgPSBnZXRUb29sTWFuYWdlclNldHRpbmdzUGF0aCgpO1xuICAgICAgICBmcy53cml0ZUZpbGVTeW5jKHNldHRpbmdzRmlsZSwgSlNPTi5zdHJpbmdpZnkoc2V0dGluZ3MsIG51bGwsIDIpKTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoJ0ZhaWxlZCB0byBzYXZlIHRvb2wgbWFuYWdlciBzZXR0aW5nczonLCBlKTtcbiAgICAgICAgdGhyb3cgZTtcbiAgICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBleHBvcnRUb29sQ29uZmlndXJhdGlvbihjb25maWc6IFRvb2xDb25maWd1cmF0aW9uKTogc3RyaW5nIHtcbiAgICByZXR1cm4gSlNPTi5zdHJpbmdpZnkoY29uZmlnLCBudWxsLCAyKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGltcG9ydFRvb2xDb25maWd1cmF0aW9uKGNvbmZpZ0pzb246IHN0cmluZyk6IFRvb2xDb25maWd1cmF0aW9uIHtcbiAgICB0cnkge1xuICAgICAgICBjb25zdCBjb25maWcgPSBKU09OLnBhcnNlKGNvbmZpZ0pzb24pO1xuICAgICAgICBpZiAoIWNvbmZpZy5pZCB8fCAhY29uZmlnLm5hbWUgfHwgIUFycmF5LmlzQXJyYXkoY29uZmlnLnRvb2xzKSkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdJbnZhbGlkIGNvbmZpZ3VyYXRpb24gZm9ybWF0Jyk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGNvbmZpZztcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoJ0ZhaWxlZCB0byBwYXJzZSB0b29sIGNvbmZpZ3VyYXRpb246JywgZSk7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignSW52YWxpZCBKU09OIGZvcm1hdCBvciBjb25maWd1cmF0aW9uIHN0cnVjdHVyZScpO1xuICAgIH1cbn1cblxuZXhwb3J0IHsgREVGQVVMVF9TRVRUSU5HUywgREVGQVVMVF9UT09MX01BTkFHRVJfU0VUVElOR1MgfTtcbiJdfQ==