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
const path = __importStar(require("path"));
const constants_1 = require("./constants");
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
function getSettingsPath() {
    return path.join(Editor.Project.path, 'settings', 'mcp-server.json');
}
function getToolManagerSettingsPath() {
    return path.join(Editor.Project.path, 'settings', 'tool-manager.json');
}
function ensureSettingsDir() {
    const settingsDir = path.dirname(getSettingsPath());
    if (!fs.existsSync(settingsDir)) {
        fs.mkdirSync(settingsDir, { recursive: true });
    }
}
function readSettings() {
    try {
        ensureSettingsDir();
        const settingsFile = getSettingsPath();
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
        ensureSettingsDir();
        const settingsFile = getSettingsPath();
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
// 工具管理器设置相关函数
function readToolManagerSettings() {
    try {
        ensureSettingsDir();
        const settingsFile = getToolManagerSettingsPath();
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
        ensureSettingsDir();
        const settingsFile = getToolManagerSettingsPath();
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
        // 验证配置格式
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2V0dGluZ3MuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zb3VyY2UvY29yZS9zZXR0aW5ncy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFrQ0Esb0NBWUM7QUFFRCxvQ0FTQztBQUVELDhEQWFDO0FBR0QsMERBWUM7QUFFRCwwREFTQztBQUVELDBEQUVDO0FBRUQsMERBWUM7QUFwSEQsdUNBQXlCO0FBQ3pCLDJDQUE2QjtBQUM3QiwyQ0FBK0M7QUFHL0MsTUFBTSxnQkFBZ0IsR0FBc0I7SUFDeEMsSUFBSSxFQUFFLDRCQUFnQjtJQUN0QixTQUFTLEVBQUUsS0FBSztJQUNoQixjQUFjLEVBQUUsS0FBSztJQUNyQixjQUFjLEVBQUUsQ0FBQyxHQUFHLENBQUM7SUFDckIsY0FBYyxFQUFFLEVBQUU7Q0FDckIsQ0FBQztBQTJHTyw0Q0FBZ0I7QUF6R3pCLE1BQU0sNkJBQTZCLEdBQXdCO0lBQ3ZELGNBQWMsRUFBRSxFQUFFO0lBQ2xCLGVBQWUsRUFBRSxFQUFFO0lBQ25CLGNBQWMsRUFBRSxDQUFDO0NBQ3BCLENBQUM7QUFxR3lCLHNFQUE2QjtBQW5HeEQsU0FBUyxlQUFlO0lBQ3BCLE9BQU8sSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLElBQUksRUFBRSxVQUFVLEVBQUUsaUJBQWlCLENBQUMsQ0FBQztBQUN6RSxDQUFDO0FBRUQsU0FBUywwQkFBMEI7SUFDL0IsT0FBTyxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsSUFBSSxFQUFFLFVBQVUsRUFBRSxtQkFBbUIsQ0FBQyxDQUFDO0FBQzNFLENBQUM7QUFFRCxTQUFTLGlCQUFpQjtJQUN0QixNQUFNLFdBQVcsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLGVBQWUsRUFBRSxDQUFDLENBQUM7SUFDcEQsSUFBSSxDQUFDLEVBQUUsQ0FBQyxVQUFVLENBQUMsV0FBVyxD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RywwQkFBMEIsRUFBRSxDQUFDO1FBQ2xELEVBQUUsQ0FBQyxhQUFhLENBQUMsWUFBWSxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsUUFBUSxFQUFFLElBQUksRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQ3RFLENBQUM7SUFBQyxPQUFPLENBQUMsRUFBRSxDQUFDO1FBQ1QsT0FBTyxDQUFDLEtBQUssQ0FBQyx1Q0FBdUMsRUFBRSxDQUFDLENBQUMsQ0FBQztRQUMxRCxNQUFNLENBQUMsQ0FBQztJQUNaLENBQUM7QUFDTCxDQUFDO0FBRUQsU0FBZ0IsdUJBQXVCLENBQUMsTUFBeUI7SUFDN0QsT0FBTyxJQUFJLENBQUMsU0FBUyxDQUFDLE1BQU0sRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDLENBQUM7QUFDM0MsQ0FBQztBQUVELFNBQWdCLHVCQUF1QixDQUFDLFVBQWtCO0lBQ3RELElBQUksQ0FBQztRQUNELE1BQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsVUFBVSxDQUFDLENBQUM7UUFDdEMsU0FBUztRQUNULElBQUksQ0FBQyxNQUFNLENBQUMsRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUM7WUFDN0QsTUFBTSxJQUFJLEtBQUssQ0FBQyw4QkFBOEIsQ0FBQyxDQUFDO1FBQ3BELENBQUM7UUFDRCxPQUFPLE1BQU0sQ0FBQztJQUNsQixDQUFDO0lBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQztRQUNULE9BQU8sQ0FBQyxLQUFLLENBQUMscUNBQXFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7UUFDeEQsTUFBTSxJQUFJLEtBQUssQ0FBQyxnREFBZ0QsQ0FBQyxDQUFDO0lBQ3RFLENBQUM7QUFDTCxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0ICogYXMgZnMgZnJvbSAnZnMnO1xuaW1wb3J0ICogYXMgcGF0aCBmcm9tICdwYXRoJztcbmltcG9ydCB7IERFRkFVTFRfTUNQX1BPUlQgfSBmcm9tICcuL2NvbnN0YW50cyc7XG5pbXBvcnQgeyBNQ1BTZXJ2ZXJTZXR0aW5ncywgVG9vbE1hbmFnZXJTZXR0aW5ncywgVG9vbENvbmZpZ3VyYXRpb24sIFRvb2xDb25maWcgfSBmcm9tICcuLi90eXBlcyc7XG5cbmNvbnN0IERFRkFVTFRfU0VUVElOR1M6IE1DUFNlcnZlclNldHRpbmdzID0ge1xuICAgIHBvcnQ6IERFRkFVTFRfTUNQX1BPUlQsXG4gICAgYXV0b1N0YXJ0OiBmYWxzZSxcbiAgICBlbmFibGVEZWJ1Z0xvZzogZmFsc2UsXG4gICAgYWxsb3dlZE9yaWdpbnM6IFsnKiddLFxuICAgIG1heENvbm5lY3Rpb25zOiAxMFxufTtcblxuY29uc3QgREVGQVVMVF9UT09MX01BTkFHRVJfU0VUVElOR1M6IFRvb2xNYW5hZ2VyU2V0dGluZ3MgPSB7XG4gICAgY29uZmlndXJhdGlvbnM6IFtdLFxuICAgIGN1cnJlbnRDb25maWdJZDogJycsXG4gICAgbWF4Q29uZmlnU2xvdHM6IDVcbn07XG5cbmZ1bmN0aW9uIGdldFNldHRpbmdzUGF0aCgpOiBzdHJpbmcge1xuICAgIHJldHVybiBwYXRoLmpvaW4oRWRpdG9yLlByb2plY3QucGF0aCwgJ3NldHRpbmdzJywgJ21jcC1zZXJ2ZXIuanNvbicpO1xufVxuXG5mdW5jdGlvbiBnZXRUb29sTWFuYWdlclNldHRpbmdzUGF0aCgpOiBzdHJpbmcge1xuICAgIHJldHVybiBwYXRoLmpvaW4oRWRpdG9yLlByb2plY3QucGF0aCwgJ3NldHRpbmdzJywgJ3Rvb2wtbWFuYWdlci5qc29uJyk7XG59XG5cbmZ1bmN0aW9uIGVuc3VyZVNldHRpbmdzRGlyKCk6IHZvaWQge1xuICAgIGNvbnN0IHNldHRpbmdzRGlyID0gcGF0aC5kaXJuYW1lKGdldFNldHRpbmdzUGF0aCgpKTtcbiAgICBpZiAoIWZzLmV4aXN0c1N5bmMoc2V0dGluZ3NEaXIpKSB7XG4gICAgICAgIGZzLm1rZGlyU3luYyhzZXR0aW5nc0RpciwgeyByZWN1cnNpdmU6IHRydWUgfSk7XG4gICAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gcmVhZFNldHRpbmdzKCk6IE1DUFNlcnZlclNldHRpbmdzIHtcbiAgICB0cnkge1xuICAgICAgICBlbnN1cmVTZXR0aW5nc0RpcigpO1xuICAgICAgICBjb25zdCBzZXR0aW5nc0ZpbGUgPSBnZXRTZXR0aW5nc1BhdGgoKTtcbiAgICAgICAgaWYgKGZzLmV4aXN0c1N5bmMoc2V0dGluZ3NGaWxlKSkge1xuICAgICAgICAgICAgY29uc3QgY29udGVudCA9IGZzLnJlYWRGaWxlU3luYyhzZXR0aW5nc0ZpbGUsICd1dGY4Jyk7XG4gICAgICAgICAgICByZXR1cm4geyAuLi5ERUZBVUxUX1NFVFRJTkdTLCAuLi5KU09OLnBhcnNlKGNvbnRlbnQpIH07XG4gICAgICAgIH1cbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoJ0ZhaWxlZCB0byByZWFkIHNldHRpbmdzOicsIGUpO1xuICAgIH1cbiAgICByZXR1cm4gREVGQVVMVF9TRVRUSU5HUztcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHNhdmVTZXR0aW5ncyhzZXR0aW5nczogTUNQU2VydmVyU2V0dGluZ3MpOiB2b2lkIHtcbiAgICB0cnkge1xuICAgICAgICBlbnN1cmVTZXR0aW5nc0RpcigpO1xuICAgICAgICBjb25zdCBzZXR0aW5nc0ZpbGUgPSBnZXRTZXR0aW5nc1BhdGgoKTtcbiAgICAgICAgZnMud3JpdGVGaWxlU3luYyhzZXR0aW5nc0ZpbGUsIEpTT04uc3RyaW5naWZ5KHNldHRpbmdzLCBudWxsLCAyKSk7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgICBjb25zb2xlLmVycm9yKCdGYWlsZWQgdG8gc2F2ZSBzZXR0aW5nczonLCBlKTtcbiAgICAgICAgdGhyb3cgZTtcbiAgICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiB2YWxpZGF0ZU1jcFNlcnZlclNldHRpbmdzKHNldHRpbmdzOiBQYXJ0aWFsPE1DUFNlcnZlclNldHRpbmdzPik6IHN0cmluZyB8IG51bGwge1xuICAgIGNvbnN0IHBvcnQgPSBzZXR0aW5ncy5wb3J0O1xuICAgIGlmIChwb3J0ID09PSB1bmRlZmluZWQgfHwgIU51bWJlci5pc0ludGVnZXIocG9ydCkgfHwgcG9ydCA8IDEwMjQgfHwgcG9ydCA+IDY1NTM1KSB7XG4gICAgICAgIHJldHVybiAn56uv5Y+j5b+F6aG75pivIDEwMjTigJM2NTUzNSDkuYvpl7TnmoTmlbTmlbAnO1xuICAgIH1cbiAgICBjb25zdCBtYXhDb25uZWN0aW9ucyA9IHNldHRpbmdzLm1heENvbm5lY3Rpb25zO1xuICAgIGlmIChcbiAgICAgICAgbWF4Q29ubmVjdGlvbnMgIT09IHVuZGVmaW5lZCAmJlxuICAgICAgICAoIU51bWJlci5pc0ludGVnZXIobWF4Q29ubmVjdGlvbnMpIHx8IG1heENvbm5lY3Rpb25zIDwgMSB8fCBtYXhDb25uZWN0aW9ucyA+IDEwMClcbiAgICApIHtcbiAgICAgICAgcmV0dXJuICfmnIDlpKfov57mjqXmlbDlv4XpobvmmK8gMeKAkzEwMCDkuYvpl7TnmoTmlbTmlbAnO1xuICAgIH1cbiAgICByZXR1cm4gbnVsbDtcbn1cblxuLy8g5bel5YW3566h55CG5Zmo6K6+572u55u45YWz5Ye95pWwXG5leHBvcnQgZnVuY3Rpb24gcmVhZFRvb2xNYW5hZ2VyU2V0dGluZ3MoKTogVG9vbE1hbmFnZXJTZXR0aW5ncyB7XG4gICAgdHJ5IHtcbiAgICAgICAgZW5zdXJlU2V0dGluZ3NEaXIoKTtcbiAgICAgICAgY29uc3Qgc2V0dGluZ3NGaWxlID0gZ2V0VG9vbE1hbmFnZXJTZXR0aW5nc1BhdGgoKTtcbiAgICAgICAgaWYgKGZzLmV4aXN0c1N5bmMoc2V0dGluZ3NGaWxlKSkge1xuICAgICAgICAgICAgY29uc3QgY29udGVudCA9IGZzLnJlYWRGaWxlU3luYyhzZXR0aW5nc0ZpbGUsICd1dGY4Jyk7XG4gICAgICAgICAgICByZXR1cm4geyAuLi5ERUZBVUxUX1RPT0xfTUFOQUdFUl9TRVRUSU5HUywgLi4uSlNPTi5wYXJzZShjb250ZW50KSB9O1xuICAgICAgICB9XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgICBjb25zb2xlLmVycm9yKCdGYWlsZWQgdG8gcmVhZCB0b29sIG1hbmFnZXIgc2V0dGluZ3M6JywgZSk7XG4gICAgfVxuICAgIHJldHVybiBERUZBVUxUX1RPT0xfTUFOQUdFUl9TRVRUSU5HUztcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHNhdmVUb29sTWFuYWdlclNldHRpbmdzKHNldHRpbmdzOiBUb29sTWFuYWdlclNldHRpbmdzKTogdm9pZCB7XG4gICAgdHJ5IHtcbiAgICAgICAgZW5zdXJlU2V0dGluZ3NEaXIoKTtcbiAgICAgICAgY29uc3Qgc2V0dGluZ3NGaWxlID0gZ2V0VG9vbE1hbmFnZXJTZXR0aW5nc1BhdGgoKTtcbiAgICAgICAgZnMud3JpdGVGaWxlU3luYyhzZXR0aW5nc0ZpbGUsIEpTT04uc3RyaW5naWZ5KHNldHRpbmdzLCBudWxsLCAyKSk7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgICBjb25zb2xlLmVycm9yKCdGYWlsZWQgdG8gc2F2ZSB0b29sIG1hbmFnZXIgc2V0dGluZ3M6JywgZSk7XG4gICAgICAgIHRocm93IGU7XG4gICAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gZXhwb3J0VG9vbENvbmZpZ3VyYXRpb24oY29uZmlnOiBUb29sQ29uZmlndXJhdGlvbik6IHN0cmluZyB7XG4gICAgcmV0dXJuIEpTT04uc3RyaW5naWZ5KGNvbmZpZywgbnVsbCwgMik7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpbXBvcnRUb29sQ29uZmlndXJhdGlvbihjb25maWdKc29uOiBzdHJpbmcpOiBUb29sQ29uZmlndXJhdGlvbiB7XG4gICAgdHJ5IHtcbiAgICAgICAgY29uc3QgY29uZmlnID0gSlNPTi5wYXJzZShjb25maWdKc29uKTtcbiAgICAgICAgLy8g6aqM6K+B6YWN572u5qC85byPXG4gICAgICAgIGlmICghY29uZmlnLmlkIHx8ICFjb25maWcubmFtZSB8fCAhQXJyYXkuaXNBcnJheShjb25maWcudG9vbHMpKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0ludmFsaWQgY29uZmlndXJhdGlvbiBmb3JtYXQnKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gY29uZmlnO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgY29uc29sZS5lcnJvcignRmFpbGVkIHRvIHBhcnNlIHRvb2wgY29uZmlndXJhdGlvbjonLCBlKTtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdJbnZhbGlkIEpTT04gZm9ybWF0IG9yIGNvbmZpZ3VyYXRpb24gc3RydWN0dXJlJyk7XG4gICAgfVxufVxuXG5leHBvcnQgeyBERUZBVUxUX1NFVFRJTkdTLCBERUZBVUxUX1RPT0xfTUFOQUdFUl9TRVRUSU5HUyB9OyJdfQ==