"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.methods = void 0;
exports.load = load;
exports.unload = unload;
const server_1 = require("./mcp/server");
const settings_1 = require("./core/settings");
const tool_manager_1 = require("./config/tool-manager");
const builtin_registry_1 = require("./bridge/builtin-registry");
const capability_manager_1 = require("./bridge/capability-manager");
let mcpServer = null;
let toolManager;
let capabilityManager;
function notifyToolsChanged() {
    const broadcast = Editor.Message
        .broadcast;
    if (typeof broadcast === 'function') {
        broadcast.call(Editor.Message, 'mcp-tools-changed');
    }
}
function syncMcpEnabledTools() {
    if (mcpServer && toolManager) {
        const enabledTools = toolManager.getEnabledTools();
        mcpServer.updateEnabledTools(enabledTools);
    }
}
function applyRegistryChange() {
    if (toolManager) {
        toolManager.syncBuiltinToolsFromRegistry(capabilityManager.exportBuiltinToolConfigs());
        toolManager.syncExternalToolsFromRegistry(capabilityManager.getExternalToolConfigsForManager());
    }
    if (mcpServer) {
        syncMcpEnabledTools();
        mcpServer.refreshToolList();
    }
    notifyToolsChanged();
}
function createMcpServer(settings) {
    return new server_1.MCPServer(settings, capabilityManager);
}
/**
 * @en Registration method for the main process of Extension
 * @zh 为扩展的主进程的注册方法
 */
exports.methods = {
    /**
     * @en Open the MCP server panel
     * @zh 打开 MCP 服务器面板
     */
    openPanel() {
        Editor.Panel.open('cocos-mcp-server');
    },
    openToolManager() {
        Editor.Panel.open('cocos-mcp-server.tool-manager');
    },
    /**
     * @en Start the MCP server
     * @zh 启动 MCP 服务器
     */
    async startServer() {
        if (mcpServer) {
            const enabledTools = toolManager.getEnabledTools();
            mcpServer.updateEnabledTools(enabledTools);
            await mcpServer.start();
        }
        else {
            console.warn('[MCP插件] mcpServer 未初始化');
        }
    },
    /**
     * @en Stop the MCP server
     * @zh 停止 MCP 服务器
     */
    async stopServer() {
        if (mcpServer) {
            mcpServer.stop();
            notifyToolsChanged();
        }
        else {
            console.warn('[MCP插件] mcpServer 未初始化');
        }
    },
    /**
     * @en Get server status
     * @zh 获取服务器状态
     */
    getServerStatus() {
        const status = mcpServer ? mcpServer.getStatus() : { running: false, port: 0, clients: 0 };
        const settings = mcpServer ? mcpServer.getSettings() : (0, settings_1.readSettings)();
        return Object.assign(Object.assign({}, status), { settings: settings });
    },
    /**
     * @en Update server settings
     * @zh 更新服务器设置
     */
    updateSettings(settings) {
        (0, settings_1.saveSettings)(settings);
        if (mcpServer) {
            mcpServer.stop();
            mcpServer = createMcpServer(settings);
            applyRegistryChange();
            mcpServer.start().catch((err) => {
                console.error('[MCP插件] Failed to restart MCP server after settings update:', err);
            });
        }
        else {
            mcpServer = createMcpServer(settings);
            applyRegistryChange();
            mcpServer.start().catch((err) => {
                console.error('[MCP插件] Failed to start MCP server after settings update:', err);
            });
        }
    },
    /**
     * @en Get tools list
     * @zh 获取工具列表
     */
    getToolsList() {
        return mcpServer ? mcpServer.getAvailableTools() : [];
    },
    getFilteredToolsList() {
        if (!mcpServer)
            return [];
        const enabledTools = toolManager.getEnabledTools();
        mcpServer.updateEnabledTools(enabledTools);
        return mcpServer.getFilteredTools(enabledTools);
    },
    /**
     * @en Get server settings
     * @zh 获取服务器设置
     */
    async getServerSettings() {
        return mcpServer ? mcpServer.getSettings() : (0, settings_1.readSettings)();
    },
    /**
     * @en Get server settings (alternative method)
     * @zh 获取服务器设置（替代方法）
     */
    async getSettings() {
        return mcpServer ? mcpServer.getSettings() : (0, settings_1.readSettings)();
    },
    async getToolManagerState() {
        return toolManager.getToolManagerState();
    },
    async createToolConfiguration(name, description) {
        try {
            const config = toolManager.createConfiguration(name, description);
            syncMcpEnabledTools();
            return { success: true, id: config.id, config };
        }
        catch (error) {
            throw new Error(`创建配置失败: ${error.message}`);
        }
    },
    async updateToolConfiguration(configId, updates) {
        try {
            const result = toolManager.updateConfiguration(configId, updates);
            syncMcpEnabledTools();
            return result;
        }
        catch (error) {
            throw new Error(`更新配置失败: ${error.message}`);
        }
    },
    async deleteToolConfiguration(configId) {
        try {
            toolManager.deleteConfiguration(configId);
            syncMcpEnabledTools();
            return { success: true };
        }
        catch (error) {
            throw new Error(`删除配置失败: ${error.message}`);
        }
    },
    async setCurrentToolConfiguration(configId) {
        try {
            toolManager.setCurrentConfiguration(configId);
            syncMcpEnabledTools();
            if (mcpServer) {
                mcpServer.refreshToolList();
            }
            return { success: true };
        }
        catch (error) {
            throw new Error(`设置当前配置失败: ${error.message}`);
        }
    },
    async updateToolStatus(category, toolName, enabled) {
        try {
            const currentConfig = toolManager.getCurrentConfiguration();
            if (!currentConfig) {
                throw new Error('没有当前配置');
            }
            toolManager.updateToolStatus(currentConfig.id, category, toolName, enabled);
            syncMcpEnabledTools();
            return { success: true };
        }
        catch (error) {
            throw new Error(`更新工具状态失败: ${error.message}`);
        }
    },
    async updateToolStatusBatch(updates) {
        try {
            console.log(`[Main] updateToolStatusBatch called with updates count:`, updates ? updates.length : 0);
            const currentConfig = toolManager.getCurrentConfiguration();
            if (!currentConfig) {
                throw new Error('没有当前配置');
            }
            toolManager.updateToolStatusBatch(currentConfig.id, updates);
            syncMcpEnabledTools();
            return { success: true };
        }
        catch (error) {
            throw new Error(`批量更新工具状态失败: ${error.message}`);
        }
    },
    async exportToolConfiguration(configId) {
        try {
            return { configJson: toolManager.exportConfiguration(configId) };
        }
        catch (error) {
            throw new Error(`导出配置失败: ${error.message}`);
        }
    },
    async importToolConfiguration(configJson) {
        try {
            const config = toolManager.importConfiguration(configJson);
            syncMcpEnabledTools();
            return config;
        }
        catch (error) {
            throw new Error(`导入配置失败: ${error.message}`);
        }
    },
    async getEnabledTools() {
        return toolManager.getEnabledTools();
    },
    /**
     * @en Register external MCP tools from another extension
     * @zh 注册其他扩展提供的 MCP 工具
     */
    registerExternalTools(payload) {
        const result = capabilityManager.registerExternal(payload);
        if (result.success) {
            applyRegistryChange();
        }
        return result;
    },
    /**
     * @en Unregister all tools from an external provider
     * @zh 注销外部扩展的全部工具
     */
    unregisterExternalTools(payload) {
        if (!(payload === null || payload === void 0 ? void 0 : payload.providerId)) {
            return { success: false, removed: false };
        }
        const removed = capabilityManager.unregisterExternal(payload.providerId);
        if (removed) {
            applyRegistryChange();
        }
        return { success: true, removed };
    },
    /**
     * @en List registered external tool providers
     * @zh 列出已注册的外部工具提供方
     */
    listExternalTools() {
        return {
            providers: capabilityManager.listExternalProviders(),
            tools: capabilityManager.getExternalMcpToolDefinitions(),
        };
    },
};
/**
 * @en Method Triggered on Extension Startup
 * @zh 扩展启动时触发的方法
 */
function load() {
    console.log('Cocos MCP Server extension loaded');
    capabilityManager = (0, builtin_registry_1.createDefaultCapabilityManager)();
    (0, capability_manager_1.setCapabilityManager)(capabilityManager);
    toolManager = new tool_manager_1.ToolManager(capabilityManager.exportBuiltinToolConfigs());
    const settings = (0, settings_1.readSettings)();
    mcpServer = createMcpServer(settings);
    applyRegistryChange();
    const enabledTools = toolManager.getEnabledTools();
    mcpServer.updateEnabledTools(enabledTools);
    if (settings.autoStart) {
        mcpServer.start().catch((err) => {
            console.error('Failed to auto-start MCP server:', err);
        });
    }
}
/**
 * @en Method triggered when uninstalling the extension
 * @zh 卸载扩展时触发的方法
 */
function unload() {
    if (mcpServer) {
        mcpServer.stop();
        mcpServer = null;
    }
    if (capabilityManager) {
        capabilityManager.clearAll();
    }
    (0, capability_manager_1.resetCapabilityManagerForTests)();
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NvdXJjZS9tYWluLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQXNUQSxvQkFxQkM7QUFNRCx3QkFTQztBQTFWRCx5Q0FBeUM7QUFDekMsOENBQTZEO0FBRTdELHdEQUFvRDtBQU1wRCxnRUFBMkU7QUFDM0Usb0VBQW1HO0FBRW5HLElBQUksU0FBUyxHQUFxQixJQUFJLENBQUM7QUFDdkMsSUFBSSxXQUF3QixDQUFDO0FBQzdCLElBQUksaUJBQW9DLENBQUM7QUFFekMsU0FBUyxrQkFBa0I7SUFDdkIsTUFBTSxTQUFTLEdBQUksTUFBTSxDQUFDLE9BQXNFO1NBQzNGLFNBQVMsQ0FBQztJQUNmLElBQUksT0FBTyxTQUFTLEtBQUssVUFBVSxFQUFFLENBQUM7UUFDbEMsU0FBUyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBTyxFQUFFLG1CQUFtQixDQUFDLENBQUM7SUFDeEQsQ0FBQztBQUNMLENBQUM7QUFFRCxTQUFTLG1CQUFtQjtJQUN4QixJQUFJLFNBQVMsSUFBSSxXQUFXLEVBQUUsQ0FBQztRQUMzQixNQUFNLFlBQVksR0FBRyxXQUFXLENBQUMsZUFBZSxFQUFFLENBQUM7UUFDbkQsU0FBUyxDQUFDLGtCQUFrQixDQUFDLFlBQVksQ0FBQyxDQUFDO0lBQy9DLENBQUM7QUFDTCxDQUFDO0FBRUQsU0FBUyxtQkFBbUI7SUFDeEIsSUFBSSxXQUFXLEVBQUUsQ0FBQztRQUNkLFdBQVcsQ0FBQyw0QkFBNEIsQ0FBQyxpQkFBaUIsQ0FBQyx3QkFBd0IsRUFBRSxDQUFDLENBQUM7UUFDdkYsV0FBVyxDQUFDLDZCQUE2QixDQUNyQyxpQkFBaUIsQ0FBQyxnQ0FBZ0MsRUFBRSxDQUN2RCxDQUFDO0lBQ04sQ0FBQztJQUNELElBQUksU0FBUyxFQUFFLENBQUM7UUFDWixtQkFBbUIsRUFBRSxDQUFDO1FBQ3RCLFNBQVMsQ0FBQyxlQUFlLEVBQUUsQ0FBQztJQUNoQyxDQUFDO0lBQ0Qs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QyxDQUFDLEdBQUcsRUFBRSxFQUFFO1lBQzVCLE9BQU8sQ0FBQyxLQUFLLENBQUMsa0NBQWtDLEVBQUUsR0FBRyxDQUFDLENBQUM7UUFDM0QsQ0FBQyxDQUFDLENBQUM7SUFDUCxDQUFDO0FBQ0wsQ0FBQztBQUVEOzs7R0FHRztBQUNILFNBQWdCLE1BQU07SUFDbEIsSUFBSSxTQUFTLEVBQUUsQ0FBQztRQUNaLFNBQVMsQ0FBQyxJQUFJLEVBQUUsQ0FBQztRQUNqQixTQUFTLEdBQUcsSUFBSSxDQUFDO0lBQ3JCLENBQUM7SUFDRCxJQUFJLGlCQUFpQixFQUFFLENBQUM7UUFDcEIsaUJBQWlCLENBQUMsUUFBUSxFQUFFLENBQUM7SUFDakMsQ0FBQztJQUNELElBQUEsbURBQThCLEdBQUUsQ0FBQztBQUNyQyxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgTUNQU2VydmVyIH0gZnJvbSAnLi9tY3Avc2VydmVyJztcbmltcG9ydCB7IHJlYWRTZXR0aW5ncywgc2F2ZVNldHRpbmdzIH0gZnJvbSAnLi9jb3JlL3NldHRpbmdzJztcbmltcG9ydCB7IE1DUFNlcnZlclNldHRpbmdzIH0gZnJvbSAnLi90eXBlcyc7XG5pbXBvcnQgeyBUb29sTWFuYWdlciB9IGZyb20gJy4vY29uZmlnL3Rvb2wtbWFuYWdlcic7XG5pbXBvcnQge1xuICAgIFJlZ2lzdGVyRXh0ZXJuYWxUb29sc1BheWxvYWQsXG4gICAgUmVnaXN0ZXJSZXN1bHQsXG59IGZyb20gJy4vcmVnaXN0cnkvZXh0ZXJuYWwtdG9vbC1yZWdpc3RyeSc7XG5pbXBvcnQgeyBDYXBhYmlsaXR5TWFuYWdlciB9IGZyb20gJy4vYnJpZGdlL2NhcGFiaWxpdHktbWFuYWdlcic7XG5pbXBvcnQgeyBjcmVhdGVEZWZhdWx0Q2FwYWJpbGl0eU1hbmFnZXIgfSBmcm9tICcuL2JyaWRnZS9idWlsdGluLXJlZ2lzdHJ5JztcbmltcG9ydCB7IHNldENhcGFiaWxpdHlNYW5hZ2VyLCByZXNldENhcGFiaWxpdHlNYW5hZ2VyRm9yVGVzdHMgfSBmcm9tICcuL2JyaWRnZS9jYXBhYmlsaXR5LW1hbmFnZXInO1xuXG5sZXQgbWNwU2VydmVyOiBNQ1BTZXJ2ZXIgfCBudWxsID0gbnVsbDtcbmxldCB0b29sTWFuYWdlcjogVG9vbE1hbmFnZXI7XG5sZXQgY2FwYWJpbGl0eU1hbmFnZXI6IENhcGFiaWxpdHlNYW5hZ2VyO1xuXG5mdW5jdGlvbiBub3RpZnlUb29sc0NoYW5nZWQoKTogdm9pZCB7XG4gICAgY29uc3QgYnJvYWRjYXN0ID0gKEVkaXRvci5NZXNzYWdlIGFzIHsgYnJvYWRjYXN0PzogKG5hbWU6IHN0cmluZywgLi4uYXJnczogdW5rbm93bltdKSA9PiB2b2lkIH0pXG4gICAgICAgIC5icm9hZGNhc3Q7XG4gICAgaWYgKHR5cGVvZiBicm9hZGNhc3QgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgYnJvYWRjYXN0LmNhbGwoRWRpdG9yLk1lc3NhZ2UsICdtY3AtdG9vbHMtY2hhbmdlZCcpO1xuICAgIH1cbn1cblxuZnVuY3Rpb24gc3luY01jcEVuYWJsZWRUb29scygpOiB2b2lkIHtcbiAgICBpZiAobWNwU2VydmVyICYmIHRvb2xNYW5hZ2VyKSB7XG4gICAgICAgIGNvbnN0IGVuYWJsZWRUb29scyA9IHRvb2xNYW5hZ2VyLmdldEVuYWJsZWRUb29scygpO1xuICAgICAgICBtY3BTZXJ2ZXIudXBkYXRlRW5hYmxlZFRvb2xzKGVuYWJsZWRUb29scyk7XG4gICAgfVxufVxuXG5mdW5jdGlvbiBhcHBseVJlZ2lzdHJ5Q2hhbmdlKCk6IHZvaWQge1xuICAgIGlmICh0b29sTWFuYWdlcikge1xuICAgICAgICB0b29sTWFuYWdlci5zeW5jQnVpbHRpblRvb2xzRnJvbVJlZ2lzdHJ5KGNhcGFiaWxpdHlNYW5hZ2VyLmV4cG9ydEJ1aWx0aW5Ub29sQ29uZmlncygpKTtcbiAgICAgICAgdG9vbE1hbmFnZXIuc3luY0V4dGVybmFsVG9vbHNGcm9tUmVnaXN0cnkoXG4gICAgICAgICAgICBjYXBhYmlsaXR5TWFuYWdlci5nZXRFeHRlcm5hbFRvb2xDb25maWdzRm9yTWFuYWdlcigpXG4gICAgICAgICk7XG4gICAgfVxuICAgIGlmIChtY3BTZXJ2ZXIpIHtcbiAgICAgICAgc3luY01jcEVuYWJsZWRUb29scygpO1xuICAgICAgICBtY3BTZXJ2ZXIucmVmcmVzaFRvb2xMaXN0KCk7XG4gICAgfVxuICAgIG5vdGlmeVRvb2xzQ2hhbmdlZCgpO1xufVxuXG5mdW5jdGlvbiBjcmVhdGVNY3BTZXJ2ZXIoc2V0dGluZ3M6IE1DUFNlcnZlclNldHRpbmdzKTogTUNQU2VydmVyIHtcbiAgICByZXR1cm4gbmV3IE1DUFNlcnZlcihzZXR0aW5ncywgY2FwYWJpbGl0eU1hbmFnZXIpO1xufVxuXG4vKipcbiAqIEBlbiBSZWdpc3RyYXRpb24gbWV0aG9kIGZvciB0aGUgbWFpbiBwcm9jZXNzIG9mIEV4dGVuc2lvblxuICogQHpoIOS4uuaJqeWxleeahOS4u+i/m+eoi+eahOazqOWGjOaWueazlVxuICovXG5leHBvcnQgY29uc3QgbWV0aG9kczogeyBba2V5OiBzdHJpbmddOiAoLi4uYW55OiBhbnkpID0+IGFueSB9ID0ge1xuICAgIC8qKlxuICAgICAqIEBlbiBPcGVuIHRoZSBNQ1Agc2VydmVyIHBhbmVsXG4gICAgICogQHpoIOaJk+W8gCBNQ1Ag5pyN5Yqh5Zmo6Z2i5p2/XG4gICAgICovXG4gICAgb3BlblBhbmVsKCkge1xuICAgICAgICBFZGl0b3IuUGFuZWwub3BlbignY29jb3MtbWNwLXNlcnZlcicpO1xuICAgIH0sXG5cbiAgICBvcGVuVG9vbE1hbmFnZXIoKSB7XG4gICAgICAgIEVkaXRvci5QYW5lbC5vcGVuKCdjb2Nvcy1tY3Atc2VydmVyLnRvb2wtbWFuYWdlcicpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBAZW4gU3RhcnQgdGhlIE1DUCBzZXJ2ZXJcbiAgICAgKiBAemgg5ZCv5YqoIE1DUCDmnI3liqHlmahcbiAgICAgKi9cbiAgICBhc3luYyBzdGFydFNlcnZlcigpIHtcbiAgICAgICAgaWYgKG1jcFNlcnZlcikge1xuICAgICAgICAgICAgY29uc3QgZW5hYmxlZFRvb2xzID0gdG9vbE1hbmFnZXIuZ2V0RW5hYmxlZFRvb2xzKCk7XG4gICAgICAgICAgICBtY3BTZXJ2ZXIudXBkYXRlRW5hYmxlZFRvb2xzKGVuYWJsZWRUb29scyk7XG4gICAgICAgICAgICBhd2FpdCBtY3BTZXJ2ZXIuc3RhcnQoKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNvbnNvbGUud2FybignW01DUOaPkuS7tl0gbWNwU2VydmVyIOacquWIneWni+WMlicpO1xuICAgICAgICB9XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEBlbiBTdG9wIHRoZSBNQ1Agc2VydmVyXG4gICAgICogQHpoIOWBnOatoiBNQ1Ag5pyN5Yqh5ZmoXG4gICAgICovXG4gICAgYXN5bmMgc3RvcFNlcnZlcigpIHtcbiAgICAgICAgaWYgKG1jcFNlcnZlcikge1xuICAgICAgICAgICAgbWNwU2VydmVyLnN0b3AoKTtcbiAgICAgICAgICAgIG5vdGlmeVRvb2xzQ2hhbmdlZCgpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY29uc29sZS53YXJuKCdbTUNQ5o+S5Lu2XSBtY3BTZXJ2ZXIg5pyq5Yid5aeL5YyWJyk7XG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQGVuIEdldCBzZXJ2ZXIgc3RhdHVzXG4gICAgICogQHpoIOiOt+WPluacjeWKoeWZqOeKtuaAgVxuICAgICAqL1xuICAgIGdldFNlcnZlclN0YXR1cygpIHtcbiAgICAgICAgY29uc3Qgc3RhdHVzID0gbWNwU2VydmVyID8gbWNwU2VydmVyLmdldFN0YXR1cygpIDogeyBydW5uaW5nOiBmYWxzZSwgcG9ydDogMCwgY2xpZW50czogMCB9O1xuICAgICAgICBjb25zdCBzZXR0aW5ncyA9IG1jcFNlcnZlciA/IG1jcFNlcnZlci5nZXRTZXR0aW5ncygpIDogcmVhZFNldHRpbmdzKCk7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAuLi5zdGF0dXMsXG4gICAgICAgICAgICBzZXR0aW5nczogc2V0dGluZ3MsXG4gICAgICAgIH07XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEBlbiBVcGRhdGUgc2VydmVyIHNldHRpbmdzXG4gICAgICogQHpoIOabtOaWsOacjeWKoeWZqOiuvue9rlxuICAgICAqL1xuICAgIHVwZGF0ZVNldHRpbmdzKHNldHRpbmdzOiBNQ1BTZXJ2ZXJTZXR0aW5ncykge1xuICAgICAgICBzYXZlU2V0dGluZ3Moc2V0dGluZ3MpO1xuICAgICAgICBpZiAobWNwU2VydmVyKSB7XG4gICAgICAgICAgICBtY3BTZXJ2ZXIuc3RvcCgpO1xuICAgICAgICAgICAgbWNwU2VydmVyID0gY3JlYXRlTWNwU2VydmVyKHNldHRpbmdzKTtcbiAgICAgICAgICAgIGFwcGx5UmVnaXN0cnlDaGFuZ2UoKTtcbiAgICAgICAgICAgIG1jcFNlcnZlci5zdGFydCgpLmNhdGNoKChlcnIpID0+IHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKCdbTUNQ5o+S5Lu2XSBGYWlsZWQgdG8gcmVzdGFydCBNQ1Agc2VydmVyIGFmdGVyIHNldHRpbmdzIHVwZGF0ZTonLCBlcnIpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBtY3BTZXJ2ZXIgPSBjcmVhdGVNY3BTZXJ2ZXIoc2V0dGluZ3MpO1xuICAgICAgICAgICAgYXBwbHlSZWdpc3RyeUNoYW5nZSgpO1xuICAgICAgICAgICAgbWNwU2VydmVyLnN0YXJ0KCkuY2F0Y2goKGVycikgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ1tNQ1Dmj5Lku7ZdIEZhaWxlZCB0byBzdGFydCBNQ1Agc2VydmVyIGFmdGVyIHNldHRpbmdzIHVwZGF0ZTonLCBlcnIpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQGVuIEdldCB0b29scyBsaXN0XG4gICAgICogQHpoIOiOt+WPluW3peWFt+WIl+ihqFxuICAgICAqL1xuICAgIGdldFRvb2xzTGlzdCgpIHtcbiAgICAgICAgcmV0dXJuIG1jcFNlcnZlciA/IG1jcFNlcnZlci5nZXRBdmFpbGFibGVUb29scygpIDogW107XG4gICAgfSxcblxuICAgIGdldEZpbHRlcmVkVG9vbHNMaXN0KCkge1xuICAgICAgICBpZiAoIW1jcFNlcnZlcikgcmV0dXJuIFtdO1xuXG4gICAgICAgIGNvbnN0IGVuYWJsZWRUb29scyA9IHRvb2xNYW5hZ2VyLmdldEVuYWJsZWRUb29scygpO1xuICAgICAgICBtY3BTZXJ2ZXIudXBkYXRlRW5hYmxlZFRvb2xzKGVuYWJsZWRUb29scyk7XG5cbiAgICAgICAgcmV0dXJuIG1jcFNlcnZlci5nZXRGaWx0ZXJlZFRvb2xzKGVuYWJsZWRUb29scyk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEBlbiBHZXQgc2VydmVyIHNldHRpbmdzXG4gICAgICogQHpoIOiOt+WPluacjeWKoeWZqOiuvue9rlxuICAgICAqL1xuICAgIGFzeW5jIGdldFNlcnZlclNldHRpbmdzKCkge1xuICAgICAgICByZXR1cm4gbWNwU2VydmVyID8gbWNwU2VydmVyLmdldFNldHRpbmdzKCkgOiByZWFkU2V0dGluZ3MoKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQGVuIEdldCBzZXJ2ZXIgc2V0dGluZ3MgKGFsdGVybmF0aXZlIG1ldGhvZClcbiAgICAgKiBAemgg6I635Y+W5pyN5Yqh5Zmo6K6+572u77yI5pu/5Luj5pa55rOV77yJXG4gICAgICovXG4gICAgYXN5bmMgZ2V0U2V0dGluZ3MoKSB7XG4gICAgICAgIHJldHVybiBtY3BTZXJ2ZXIgPyBtY3BTZXJ2ZXIuZ2V0U2V0dGluZ3MoKSA6IHJlYWRTZXR0aW5ncygpO1xuICAgIH0sXG5cbiAgICBhc3luYyBnZXRUb29sTWFuYWdlclN0YXRlKCkge1xuICAgICAgICByZXR1cm4gdG9vbE1hbmFnZXIuZ2V0VG9vbE1hbmFnZXJTdGF0ZSgpO1xuICAgIH0sXG5cbiAgICBhc3luYyBjcmVhdGVUb29sQ29uZmlndXJhdGlvbihuYW1lOiBzdHJpbmcsIGRlc2NyaXB0aW9uPzogc3RyaW5nKSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBjb25zdCBjb25maWcgPSB0b29sTWFuYWdlci5jcmVhdGVDb25maWd1cmF0aW9uKG5hbWUsIGRlc2NyaXB0aW9uKTtcbiAgICAgICAgICAgIHN5bmNNY3BFbmFibGVkVG9vbHMoKTtcbiAgICAgICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IHRydWUsIGlkOiBjb25maWcuaWQsIGNvbmZpZyB9O1xuICAgICAgICB9IGNhdGNoIChlcnJvcjogYW55KSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYOWIm+W7uumFjee9ruWksei0pTogJHtlcnJvci5tZXNzYWdlfWApO1xuICAgICAgICB9XG4gICAgfSxcblxuICAgIGFzeW5jIHVwZGF0ZVRvb2xDb25maWd1cmF0aW9uKGNvbmZpZ0lkOiBzdHJpbmcsIHVwZGF0ZXM6IGFueSkge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgY29uc3QgcmVzdWx0ID0gdG9vbE1hbmFnZXIudXBkYXRlQ29uZmlndXJhdGlvbihjb25maWdJZCwgdXBkYXRlcyk7XG4gICAgICAgICAgICBzeW5jTWNwRW5hYmxlZFRvb2xzKCk7XG4gICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgICB9IGNhdGNoIChlcnJvcjogYW55KSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYOabtOaWsOmFjee9ruWksei0pTogJHtlcnJvci5tZXNzYWdlfWApO1xuICAgICAgICB9XG4gICAgfSxcblxuICAgIGFzeW5jIGRlbGV0ZVRvb2xDb25maWd1cmF0aW9uKGNvbmZpZ0lkOiBzdHJpbmcpIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIHRvb2xNYW5hZ2VyLmRlbGV0ZUNvbmZpZ3VyYXRpb24oY29uZmlnSWQpO1xuICAgICAgICAgICAgc3luY01jcEVuYWJsZWRUb29scygpO1xuICAgICAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogdHJ1ZSB9O1xuICAgICAgICB9IGNhdGNoIChlcnJvcjogYW55KSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYOWIoOmZpOmFjee9ruWksei0pTogJHtlcnJvci5tZXNzYWdlfWApO1xuICAgICAgICB9XG4gICAgfSxcblxuICAgIGFzeW5jIHNldEN1cnJlbnRUb29sQ29uZmlndXJhdGlvbihjb25maWdJZDogc3RyaW5nKSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICB0b29sTWFuYWdlci5zZXRDdXJyZW50Q29uZmlndXJhdGlvbihjb25maWdJZCk7XG4gICAgICAgICAgICBzeW5jTWNwRW5hYmxlZFRvb2xzKCk7XG4gICAgICAgICAgICBpZiAobWNwU2VydmVyKSB7XG4gICAgICAgICAgICAgICAgbWNwU2VydmVyLnJlZnJlc2hUb29sTGlzdCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogdHJ1ZSB9O1xuICAgICAgICB9IGNhdGNoIChlcnJvcjogYW55KSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYOiuvue9ruW9k+WJjemFjee9ruWksei0pTogJHtlcnJvci5tZXNzYWdlfWApO1xuICAgICAgICB9XG4gICAgfSxcblxuICAgIGFzeW5jIHVwZGF0ZVRvb2xTdGF0dXMoY2F0ZWdvcnk6IHN0cmluZywgdG9vbE5hbWU6IHN0cmluZywgZW5hYmxlZDogYm9vbGVhbikge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgY29uc3QgY3VycmVudENvbmZpZyA9IHRvb2xNYW5hZ2VyLmdldEN1cnJlbnRDb25maWd1cmF0aW9uKCk7XG4gICAgICAgICAgICBpZiAoIWN1cnJlbnRDb25maWcpIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ+ayoeacieW9k+WJjemFjee9ricpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB0b29sTWFuYWdlci51cGRhdGVUb29sU3RhdHVzKGN1cnJlbnRDb25maWcuaWQsIGNhdGVnb3J5LCB0b29sTmFtZSwgZW5hYmxlZCk7XG4gICAgICAgICAgICBzeW5jTWNwRW5hYmxlZFRvb2xzKCk7XG5cbiAgICAgICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IHRydWUgfTtcbiAgICAgICAgfSBjYXRjaCAoZXJyb3I6IGFueSkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGDmm7TmlrDlt6XlhbfnirbmgIHlpLHotKU6ICR7ZXJyb3IubWVzc2FnZX1gKTtcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICBhc3luYyB1cGRhdGVUb29sU3RhdHVzQmF0Y2godXBkYXRlczogYW55W10pIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGBbTWFpbl0gdXBkYXRlVG9vbFN0YXR1c0JhdGNoIGNhbGxlZCB3aXRoIHVwZGF0ZXMgY291bnQ6YCwgdXBkYXRlcyA/IHVwZGF0ZXMubGVuZ3RoIDogMCk7XG5cbiAgICAgICAgICAgIGNvbnN0IGN1cnJlbnRDb25maWcgPSB0b29sTWFuYWdlci5nZXRDdXJyZW50Q29uZmlndXJhdGlvbigpO1xuICAgICAgICAgICAgaWYgKCFjdXJyZW50Q29uZmlnKSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCfmsqHmnInlvZPliY3phY3nva4nKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdG9vbE1hbmFnZXIudXBkYXRlVG9vbFN0YXR1c0JhdGNoKGN1cnJlbnRDb25maWcuaWQsIHVwZGF0ZXMpO1xuICAgICAgICAgICAgc3luY01jcEVuYWJsZWRUb29scygpO1xuXG4gICAgICAgICAgICByZXR1cm4geyBzdWNjZXNzOiB0cnVlIH07XG4gICAgICAgIH0gY2F0Y2ggKGVycm9yOiBhbnkpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihg5om56YeP5pu05paw5bel5YW354q25oCB5aSx6LSlOiAke2Vycm9yLm1lc3NhZ2V9YCk7XG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgYXN5bmMgZXhwb3J0VG9vbENvbmZpZ3VyYXRpb24oY29uZmlnSWQ6IHN0cmluZykge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgcmV0dXJuIHsgY29uZmlnSnNvbjogdG9vbE1hbmFnZXIuZXhwb3J0Q29uZmlndXJhdGlvbihjb25maWdJZCkgfTtcbiAgICAgICAgfSBjYXRjaCAoZXJyb3I6IGFueSkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGDlr7zlh7rphY3nva7lpLHotKU6ICR7ZXJyb3IubWVzc2FnZX1gKTtcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICBhc3luYyBpbXBvcnRUb29sQ29uZmlndXJhdGlvbihjb25maWdKc29uOiBzdHJpbmcpIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGNvbnN0IGNvbmZpZyA9IHRvb2xNYW5hZ2VyLmltcG9ydENvbmZpZ3VyYXRpb24oY29uZmlnSnNvbik7XG4gICAgICAgICAgICBzeW5jTWNwRW5hYmxlZFRvb2xzKCk7XG4gICAgICAgICAgICByZXR1cm4gY29uZmlnO1xuICAgICAgICB9IGNhdGNoIChlcnJvcjogYW55KSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYOWvvOWFpemFjee9ruWksei0pTogJHtlcnJvci5tZXNzYWdlfWApO1xuICAgICAgICB9XG4gICAgfSxcblxuICAgIGFzeW5jIGdldEVuYWJsZWRUb29scygpIHtcbiAgICAgICAgcmV0dXJuIHRvb2xNYW5hZ2VyLmdldEVuYWJsZWRUb29scygpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBAZW4gUmVnaXN0ZXIgZXh0ZXJuYWwgTUNQIHRvb2xzIGZyb20gYW5vdGhlciBleHRlbnNpb25cbiAgICAgKiBAemgg5rOo5YaM5YW25LuW5omp5bGV5o+Q5L6b55qEIE1DUCDlt6XlhbdcbiAgICAgKi9cbiAgICByZWdpc3RlckV4dGVybmFsVG9vbHMocGF5bG9hZDogUmVnaXN0ZXJFeHRlcm5hbFRvb2xzUGF5bG9hZCk6IFJlZ2lzdGVyUmVzdWx0IHtcbiAgICAgICAgY29uc3QgcmVzdWx0ID0gY2FwYWJpbGl0eU1hbmFnZXIucmVnaXN0ZXJFeHRlcm5hbChwYXlsb2FkKTtcbiAgICAgICAgaWYgKHJlc3VsdC5zdWNjZXNzKSB7XG4gICAgICAgICAgICBhcHBseVJlZ2lzdHJ5Q2hhbmdlKCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQGVuIFVucmVnaXN0ZXIgYWxsIHRvb2xzIGZyb20gYW4gZXh0ZXJuYWwgcHJvdmlkZXJcbiAgICAgKiBAemgg5rOo6ZSA5aSW6YOo5omp5bGV55qE5YWo6YOo5bel5YW3XG4gICAgICovXG4gICAgdW5yZWdpc3RlckV4dGVybmFsVG9vbHMocGF5bG9hZDogeyBwcm92aWRlcklkOiBzdHJpbmcgfSk6IHsgc3VjY2VzczogYm9vbGVhbjsgcmVtb3ZlZDogYm9vbGVhbiB9IHtcbiAgICAgICAgaWYgKCFwYXlsb2FkPy5wcm92aWRlcklkKSB7XG4gICAgICAgICAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgcmVtb3ZlZDogZmFsc2UgfTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCByZW1vdmVkID0gY2FwYWJpbGl0eU1hbmFnZXIudW5yZWdpc3RlckV4dGVybmFsKHBheWxvYWQucHJvdmlkZXJJZCk7XG4gICAgICAgIGlmIChyZW1vdmVkKSB7XG4gICAgICAgICAgICBhcHBseVJlZ2lzdHJ5Q2hhbmdlKCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogdHJ1ZSwgcmVtb3ZlZCB9O1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBAZW4gTGlzdCByZWdpc3RlcmVkIGV4dGVybmFsIHRvb2wgcHJvdmlkZXJzXG4gICAgICogQHpoIOWIl+WHuuW3suazqOWGjOeahOWklumDqOW3peWFt+aPkOS+m+aWuVxuICAgICAqL1xuICAgIGxpc3RFeHRlcm5hbFRvb2xzKCk6IHtcbiAgICAgICAgcHJvdmlkZXJzOiBSZXR1cm5UeXBlPENhcGFiaWxpdHlNYW5hZ2VyWydsaXN0RXh0ZXJuYWxQcm92aWRlcnMnXT47XG4gICAgICAgIHRvb2xzOiBSZXR1cm5UeXBlPENhcGFiaWxpdHlNYW5hZ2VyWydnZXRFeHRlcm5hbE1jcFRvb2xEZWZpbml0aW9ucyddPjtcbiAgICB9IHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHByb3ZpZGVyczogY2FwYWJpbGl0eU1hbmFnZXIubGlzdEV4dGVybmFsUHJvdmlkZXJzKCksXG4gICAgICAgICAgICB0b29sczogY2FwYWJpbGl0eU1hbmFnZXIuZ2V0RXh0ZXJuYWxNY3BUb29sRGVmaW5pdGlvbnMoKSxcbiAgICAgICAgfTtcbiAgICB9LFxufTtcblxuLyoqXG4gKiBAZW4gTWV0aG9kIFRyaWdnZXJlZCBvbiBFeHRlbnNpb24gU3RhcnR1cFxuICogQHpoIOaJqeWxleWQr+WKqOaXtuinpuWPkeeahOaWueazlVxuICovXG5leHBvcnQgZnVuY3Rpb24gbG9hZCgpIHtcbiAgICBjb25zb2xlLmxvZygnQ29jb3MgTUNQIFNlcnZlciBleHRlbnNpb24gbG9hZGVkJyk7XG5cbiAgICBjYXBhYmlsaXR5TWFuYWdlciA9IGNyZWF0ZURlZmF1bHRDYXBhYmlsaXR5TWFuYWdlcigpO1xuICAgIHNldENhcGFiaWxpdHlNYW5hZ2VyKGNhcGFiaWxpdHlNYW5hZ2VyKTtcblxuICAgIHRvb2xNYW5hZ2VyID0gbmV3IFRvb2xNYW5hZ2VyKGNhcGFiaWxpdHlNYW5hZ2VyLmV4cG9ydEJ1aWx0aW5Ub29sQ29uZmlncygpKTtcblxuICAgIGNvbnN0IHNldHRpbmdzID0gcmVhZFNldHRpbmdzKCk7XG4gICAgbWNwU2VydmVyID0gY3JlYXRlTWNwU2VydmVyKHNldHRpbmdzKTtcblxuICAgIGFwcGx5UmVnaXN0cnlDaGFuZ2UoKTtcblxuICAgIGNvbnN0IGVuYWJsZWRUb29scyA9IHRvb2xNYW5hZ2VyLmdldEVuYWJsZWRUb29scygpO1xuICAgIG1jcFNlcnZlci51cGRhdGVFbmFibGVkVG9vbHMoZW5hYmxlZFRvb2xzKTtcblxuICAgIGlmIChzZXR0aW5ncy5hdXRvU3RhcnQpIHtcbiAgICAgICAgbWNwU2VydmVyLnN0YXJ0KCkuY2F0Y2goKGVycikgPT4ge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcignRmFpbGVkIHRvIGF1dG8tc3RhcnQgTUNQIHNlcnZlcjonLCBlcnIpO1xuICAgICAgICB9KTtcbiAgICB9XG59XG5cbi8qKlxuICogQGVuIE1ldGhvZCB0cmlnZ2VyZWQgd2hlbiB1bmluc3RhbGxpbmcgdGhlIGV4dGVuc2lvblxuICogQHpoIOWNuOi9veaJqeWxleaXtuinpuWPkeeahOaWueazlVxuICovXG5leHBvcnQgZnVuY3Rpb24gdW5sb2FkKCkge1xuICAgIGlmIChtY3BTZXJ2ZXIpIHtcbiAgICAgICAgbWNwU2VydmVyLnN0b3AoKTtcbiAgICAgICAgbWNwU2VydmVyID0gbnVsbDtcbiAgICB9XG4gICAgaWYgKGNhcGFiaWxpdHlNYW5hZ2VyKSB7XG4gICAgICAgIGNhcGFiaWxpdHlNYW5hZ2VyLmNsZWFyQWxsKCk7XG4gICAgfVxuICAgIHJlc2V0Q2FwYWJpbGl0eU1hbmFnZXJGb3JUZXN0cygpO1xufVxuIl19