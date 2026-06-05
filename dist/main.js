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
     * @en Update server settings (save to disk; restart only if already running)
     * @zh 更新服务器设置（保存到磁盘；仅在服务器运行中时重启）
     */
    updateSettings(settings) {
        const validationError = (0, settings_1.validateMcpServerSettings)(settings);
        if (validationError) {
            throw new Error(validationError);
        }
        (0, settings_1.saveSettings)(settings);
        if (mcpServer && mcpServer.getStatus().running) {
            // 服务器正在运行，用新设置重启
            mcpServer.stop();
            mcpServer = createMcpServer(settings);
            applyRegistryChange();
            mcpServer.start().catch((err) => {
                console.error('[MCP插件] Failed to restart MCP server after settings update:', err);
            });
        }
        else {
            // 服务器未运行，重建实例以使用新设置（下次 start 时生效）
            mcpServer = createMcpServer(settings);
            applyRegistryChange();
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NvdXJjZS9tYWluLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQXlUQSxvQkFxQkM7QUFNRCx3QkFTQztBQTdWRCx5Q0FBeUM7QUFDekMsOENBQXdGO0FBRXhGLHdEQUFvRDtBQU1wRCxnRUFBMkU7QUFDM0Usb0VBQW1HO0FBRW5HLElBQUksU0FBUyxHQUFxQixJQUFJLENBQUM7QUFDdkMsSUFBSSxXQUF3QixDQUFDO0FBQzdCLElBQUksaUJBQW9DLENBQUM7QUFFekMsU0FBUyxrQkFBa0I7SUFDdkIsTUFBTSxTQUFTLEdBQUksTUFBTSxDQUFDLE9BQXNFO1NBQzNGLFNBQVMsQ0FBQztJQUNmLElBQUksT0FBTyxTQUFTLEtBQUssVUFBVSxFQUFFLENBQUM7UUFDbEMsU0FBUyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBTyxFQUFFLG1CQUFtQixDQUFDLENBQUM7SUFDeEQsQ0FBQztBQUNMLENBQUM7QUFFRCxTQUFTLG1CQUFtQjtJQUN4QixJQUFJLFNBQVMsSUFBSSxXQUFXLEVBQUUsQ0FBQztRQUMzQixNQUFNLFlBQVksR0FBRyxXQUFXLENBQUMsZUFBZSxFQUFFLENBQUM7UUFDbkQsU0FBUyxDQUFDLGtCQUFrQixDQUFDLFlBQVksQ0FBQyxDQUFDO0lBQy9DLENBQUM7QUFDTCxDQUFDO0FBRUQsU0FBUyxtQkFBbUI7SUFDeEIsSUFBSSxXQUFXLEVBQUUsQ0FBQztRQUNkLFdBQVcsQ0FBQyw0QkFBNEIsQ0FBQyxpQkFBaUIsQ0FBQyx3QkFBd0IsRUFBRSxDQUFDLENBQUM7UUFDdkYsV0FBVyxDQUFDLDZCQUE2QixDQUNyQyxpQkFBaUIsQ0FBQyxnQ0FBZ0MsRUFBRSxDQUN2RCxDQUFDO0lBQ04sQ0FBQztJQUNELElBQUksU0FBUyxFQUFFLENBQUM7UUFDWixtQkFBbUIsRUFBRSxDQUFDO1FBQ3RCLFNBQVMsQ0FBQyxlQUFlLEVBQUUsQ0FBQztJQUNoQyxDQUFDO0lBQ0Qs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QUMsU0FBUyxFQUFFLENBQUM7UUFDckIsU0FBUyxDQUFDLEtBQUssRUFBRSxDQUFDLEtBQUssQ0FBQyxDQUFDLEdBQUcsRUFBRSxFQUFFO1lBQzVCLE9BQU8sQ0FBQyxLQUFLLENBQUMsa0NBQWtDLEVBQUUsR0FBRyxDQUFDLENBQUM7UUFDM0QsQ0FBQyxDQUFDLENBQUM7SUFDUCxDQUFDO0FBQ0wsQ0FBQztBQUVEOzs7R0FHRztBQUNILFNBQWdCLE1BQU07SUFDbEIsSUFBSSxTQUFTLEVBQUUsQ0FBQztRQUNaLFNBQVMsQ0FBQyxJQUFJLEVBQUUsQ0FBQztRQUNqQixTQUFTLEdBQUcsSUFBSSxDQUFDO0lBQ3JCLENBQUM7SUFDRCxJQUFJLGlCQUFpQixFQUFFLENBQUM7UUFDcEIsaUJBQWlCLENBQUMsUUFBUSxFQUFFLENBQUM7SUFDakMsQ0FBQztJQUNELElBQUEsbURBQThCLEdBQUUsQ0FBQztBQUNyQyxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgTUNQU2VydmVyIH0gZnJvbSAnLi9tY3Avc2VydmVyJztcbmltcG9ydCB7IHJlYWRTZXR0aW5ncywgc2F2ZVNldHRpbmdzLCB2YWxpZGF0ZU1jcFNlcnZlclNldHRpbmdzIH0gZnJvbSAnLi9jb3JlL3NldHRpbmdzJztcbmltcG9ydCB7IE1DUFNlcnZlclNldHRpbmdzIH0gZnJvbSAnLi90eXBlcyc7XG5pbXBvcnQgeyBUb29sTWFuYWdlciB9IGZyb20gJy4vY29uZmlnL3Rvb2wtbWFuYWdlcic7XG5pbXBvcnQge1xuICAgIFJlZ2lzdGVyRXh0ZXJuYWxUb29sc1BheWxvYWQsXG4gICAgUmVnaXN0ZXJSZXN1bHQsXG59IGZyb20gJy4vcmVnaXN0cnkvZXh0ZXJuYWwtdG9vbC1yZWdpc3RyeSc7XG5pbXBvcnQgeyBDYXBhYmlsaXR5TWFuYWdlciB9IGZyb20gJy4vYnJpZGdlL2NhcGFiaWxpdHktbWFuYWdlcic7XG5pbXBvcnQgeyBjcmVhdGVEZWZhdWx0Q2FwYWJpbGl0eU1hbmFnZXIgfSBmcm9tICcuL2JyaWRnZS9idWlsdGluLXJlZ2lzdHJ5JztcbmltcG9ydCB7IHNldENhcGFiaWxpdHlNYW5hZ2VyLCByZXNldENhcGFiaWxpdHlNYW5hZ2VyRm9yVGVzdHMgfSBmcm9tICcuL2JyaWRnZS9jYXBhYmlsaXR5LW1hbmFnZXInO1xuXG5sZXQgbWNwU2VydmVyOiBNQ1BTZXJ2ZXIgfCBudWxsID0gbnVsbDtcbmxldCB0b29sTWFuYWdlcjogVG9vbE1hbmFnZXI7XG5sZXQgY2FwYWJpbGl0eU1hbmFnZXI6IENhcGFiaWxpdHlNYW5hZ2VyO1xuXG5mdW5jdGlvbiBub3RpZnlUb29sc0NoYW5nZWQoKTogdm9pZCB7XG4gICAgY29uc3QgYnJvYWRjYXN0ID0gKEVkaXRvci5NZXNzYWdlIGFzIHsgYnJvYWRjYXN0PzogKG5hbWU6IHN0cmluZywgLi4uYXJnczogdW5rbm93bltdKSA9PiB2b2lkIH0pXG4gICAgICAgIC5icm9hZGNhc3Q7XG4gICAgaWYgKHR5cGVvZiBicm9hZGNhc3QgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgYnJvYWRjYXN0LmNhbGwoRWRpdG9yLk1lc3NhZ2UsICdtY3AtdG9vbHMtY2hhbmdlZCcpO1xuICAgIH1cbn1cblxuZnVuY3Rpb24gc3luY01jcEVuYWJsZWRUb29scygpOiB2b2lkIHtcbiAgICBpZiAobWNwU2VydmVyICYmIHRvb2xNYW5hZ2VyKSB7XG4gICAgICAgIGNvbnN0IGVuYWJsZWRUb29scyA9IHRvb2xNYW5hZ2VyLmdldEVuYWJsZWRUb29scygpO1xuICAgICAgICBtY3BTZXJ2ZXIudXBkYXRlRW5hYmxlZFRvb2xzKGVuYWJsZWRUb29scyk7XG4gICAgfVxufVxuXG5mdW5jdGlvbiBhcHBseVJlZ2lzdHJ5Q2hhbmdlKCk6IHZvaWQge1xuICAgIGlmICh0b29sTWFuYWdlcikge1xuICAgICAgICB0b29sTWFuYWdlci5zeW5jQnVpbHRpblRvb2xzRnJvbVJlZ2lzdHJ5KGNhcGFiaWxpdHlNYW5hZ2VyLmV4cG9ydEJ1aWx0aW5Ub29sQ29uZmlncygpKTtcbiAgICAgICAgdG9vbE1hbmFnZXIuc3luY0V4dGVybmFsVG9vbHNGcm9tUmVnaXN0cnkoXG4gICAgICAgICAgICBjYXBhYmlsaXR5TWFuYWdlci5nZXRFeHRlcm5hbFRvb2xDb25maWdzRm9yTWFuYWdlcigpXG4gICAgICAgICk7XG4gICAgfVxuICAgIGlmIChtY3BTZXJ2ZXIpIHtcbiAgICAgICAgc3luY01jcEVuYWJsZWRUb29scygpO1xuICAgICAgICBtY3BTZXJ2ZXIucmVmcmVzaFRvb2xMaXN0KCk7XG4gICAgfVxuICAgIG5vdGlmeVRvb2xzQ2hhbmdlZCgpO1xufVxuXG5mdW5jdGlvbiBjcmVhdGVNY3BTZXJ2ZXIoc2V0dGluZ3M6IE1DUFNlcnZlclNldHRpbmdzKTogTUNQU2VydmVyIHtcbiAgICByZXR1cm4gbmV3IE1DUFNlcnZlcihzZXR0aW5ncywgY2FwYWJpbGl0eU1hbmFnZXIpO1xufVxuXG4vKipcbiAqIEBlbiBSZWdpc3RyYXRpb24gbWV0aG9kIGZvciB0aGUgbWFpbiBwcm9jZXNzIG9mIEV4dGVuc2lvblxuICogQHpoIOS4uuaJqeWxleeahOS4u+i/m+eoi+eahOazqOWGjOaWueazlVxuICovXG5leHBvcnQgY29uc3QgbWV0aG9kczogeyBba2V5OiBzdHJpbmddOiAoLi4uYW55OiBhbnkpID0+IGFueSB9ID0ge1xuICAgIC8qKlxuICAgICAqIEBlbiBPcGVuIHRoZSBNQ1Agc2VydmVyIHBhbmVsXG4gICAgICogQHpoIOaJk+W8gCBNQ1Ag5pyN5Yqh5Zmo6Z2i5p2/XG4gICAgICovXG4gICAgb3BlblBhbmVsKCkge1xuICAgICAgICBFZGl0b3IuUGFuZWwub3BlbignY29jb3MtbWNwLXNlcnZlcicpO1xuICAgIH0sXG5cbiAgICBvcGVuVG9vbE1hbmFnZXIoKSB7XG4gICAgICAgIEVkaXRvci5QYW5lbC5vcGVuKCdjb2Nvcy1tY3Atc2VydmVyLnRvb2wtbWFuYWdlcicpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBAZW4gU3RhcnQgdGhlIE1DUCBzZXJ2ZXJcbiAgICAgKiBAemgg5ZCv5YqoIE1DUCDmnI3liqHlmahcbiAgICAgKi9cbiAgICBhc3luYyBzdGFydFNlcnZlcigpIHtcbiAgICAgICAgaWYgKG1jcFNlcnZlcikge1xuICAgICAgICAgICAgY29uc3QgZW5hYmxlZFRvb2xzID0gdG9vbE1hbmFnZXIuZ2V0RW5hYmxlZFRvb2xzKCk7XG4gICAgICAgICAgICBtY3BTZXJ2ZXIudXBkYXRlRW5hYmxlZFRvb2xzKGVuYWJsZWRUb29scyk7XG4gICAgICAgICAgICBhd2FpdCBtY3BTZXJ2ZXIuc3RhcnQoKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNvbnNvbGUud2FybignW01DUOaPkuS7tl0gbWNwU2VydmVyIOacquWIneWni+WMlicpO1xuICAgICAgICB9XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEBlbiBTdG9wIHRoZSBNQ1Agc2VydmVyXG4gICAgICogQHpoIOWBnOatoiBNQ1Ag5pyN5Yqh5ZmoXG4gICAgICovXG4gICAgYXN5bmMgc3RvcFNlcnZlcigpIHtcbiAgICAgICAgaWYgKG1jcFNlcnZlcikge1xuICAgICAgICAgICAgbWNwU2VydmVyLnN0b3AoKTtcbiAgICAgICAgICAgIG5vdGlmeVRvb2xzQ2hhbmdlZCgpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY29uc29sZS53YXJuKCdbTUNQ5o+S5Lu2XSBtY3BTZXJ2ZXIg5pyq5Yid5aeL5YyWJyk7XG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQGVuIEdldCBzZXJ2ZXIgc3RhdHVzXG4gICAgICogQHpoIOiOt+WPluacjeWKoeWZqOeKtuaAgVxuICAgICAqL1xuICAgIGdldFNlcnZlclN0YXR1cygpIHtcbiAgICAgICAgY29uc3Qgc3RhdHVzID0gbWNwU2VydmVyID8gbWNwU2VydmVyLmdldFN0YXR1cygpIDogeyBydW5uaW5nOiBmYWxzZSwgcG9ydDogMCwgY2xpZW50czogMCB9O1xuICAgICAgICBjb25zdCBzZXR0aW5ncyA9IG1jcFNlcnZlciA/IG1jcFNlcnZlci5nZXRTZXR0aW5ncygpIDogcmVhZFNldHRpbmdzKCk7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAuLi5zdGF0dXMsXG4gICAgICAgICAgICBzZXR0aW5nczogc2V0dGluZ3MsXG4gICAgICAgIH07XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEBlbiBVcGRhdGUgc2VydmVyIHNldHRpbmdzIChzYXZlIHRvIGRpc2s7IHJlc3RhcnQgb25seSBpZiBhbHJlYWR5IHJ1bm5pbmcpXG4gICAgICogQHpoIOabtOaWsOacjeWKoeWZqOiuvue9ru+8iOS/neWtmOWIsOejgeebmO+8m+S7heWcqOacjeWKoeWZqOi/kOihjOS4reaXtumHjeWQr++8iVxuICAgICAqL1xuICAgIHVwZGF0ZVNldHRpbmdzKHNldHRpbmdzOiBNQ1BTZXJ2ZXJTZXR0aW5ncykge1xuICAgICAgICBjb25zdCB2YWxpZGF0aW9uRXJyb3IgPSB2YWxpZGF0ZU1jcFNlcnZlclNldHRpbmdzKHNldHRpbmdzKTtcbiAgICAgICAgaWYgKHZhbGlkYXRpb25FcnJvcikge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKHZhbGlkYXRpb25FcnJvcik7XG4gICAgICAgIH1cbiAgICAgICAgc2F2ZVNldHRpbmdzKHNldHRpbmdzKTtcbiAgICAgICAgaWYgKG1jcFNlcnZlciAmJiBtY3BTZXJ2ZXIuZ2V0U3RhdHVzKCkucnVubmluZykge1xuICAgICAgICAgICAgLy8g5pyN5Yqh5Zmo5q2j5Zyo6L+Q6KGM77yM55So5paw6K6+572u6YeN5ZCvXG4gICAgICAgICAgICBtY3BTZXJ2ZXIuc3RvcCgpO1xuICAgICAgICAgICAgbWNwU2VydmVyID0gY3JlYXRlTWNwU2VydmVyKHNldHRpbmdzKTtcbiAgICAgICAgICAgIGFwcGx5UmVnaXN0cnlDaGFuZ2UoKTtcbiAgICAgICAgICAgIG1jcFNlcnZlci5zdGFydCgpLmNhdGNoKChlcnIpID0+IHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKCdbTUNQ5o+S5Lu2XSBGYWlsZWQgdG8gcmVzdGFydCBNQ1Agc2VydmVyIGFmdGVyIHNldHRpbmdzIHVwZGF0ZTonLCBlcnIpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAvLyDmnI3liqHlmajmnKrov5DooYzvvIzph43lu7rlrp7kvovku6Xkvb/nlKjmlrDorr7nva7vvIjkuIvmrKEgc3RhcnQg5pe255Sf5pWI77yJXG4gICAgICAgICAgICBtY3BTZXJ2ZXIgPSBjcmVhdGVNY3BTZXJ2ZXIoc2V0dGluZ3MpO1xuICAgICAgICAgICAgYXBwbHlSZWdpc3RyeUNoYW5nZSgpO1xuICAgICAgICB9XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEBlbiBHZXQgdG9vbHMgbGlzdFxuICAgICAqIEB6aCDojrflj5blt6XlhbfliJfooahcbiAgICAgKi9cbiAgICBnZXRUb29sc0xpc3QoKSB7XG4gICAgICAgIHJldHVybiBtY3BTZXJ2ZXIgPyBtY3BTZXJ2ZXIuZ2V0QXZhaWxhYmxlVG9vbHMoKSA6IFtdO1xuICAgIH0sXG5cbiAgICBnZXRGaWx0ZXJlZFRvb2xzTGlzdCgpIHtcbiAgICAgICAgaWYgKCFtY3BTZXJ2ZXIpIHJldHVybiBbXTtcblxuICAgICAgICBjb25zdCBlbmFibGVkVG9vbHMgPSB0b29sTWFuYWdlci5nZXRFbmFibGVkVG9vbHMoKTtcbiAgICAgICAgbWNwU2VydmVyLnVwZGF0ZUVuYWJsZWRUb29scyhlbmFibGVkVG9vbHMpO1xuXG4gICAgICAgIHJldHVybiBtY3BTZXJ2ZXIuZ2V0RmlsdGVyZWRUb29scyhlbmFibGVkVG9vbHMpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBAZW4gR2V0IHNlcnZlciBzZXR0aW5nc1xuICAgICAqIEB6aCDojrflj5bmnI3liqHlmajorr7nva5cbiAgICAgKi9cbiAgICBhc3luYyBnZXRTZXJ2ZXJTZXR0aW5ncygpIHtcbiAgICAgICAgcmV0dXJuIG1jcFNlcnZlciA/IG1jcFNlcnZlci5nZXRTZXR0aW5ncygpIDogcmVhZFNldHRpbmdzKCk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEBlbiBHZXQgc2VydmVyIHNldHRpbmdzIChhbHRlcm5hdGl2ZSBtZXRob2QpXG4gICAgICogQHpoIOiOt+WPluacjeWKoeWZqOiuvue9ru+8iOabv+S7o+aWueazle+8iVxuICAgICAqL1xuICAgIGFzeW5jIGdldFNldHRpbmdzKCkge1xuICAgICAgICByZXR1cm4gbWNwU2VydmVyID8gbWNwU2VydmVyLmdldFNldHRpbmdzKCkgOiByZWFkU2V0dGluZ3MoKTtcbiAgICB9LFxuXG4gICAgYXN5bmMgZ2V0VG9vbE1hbmFnZXJTdGF0ZSgpIHtcbiAgICAgICAgcmV0dXJuIHRvb2xNYW5hZ2VyLmdldFRvb2xNYW5hZ2VyU3RhdGUoKTtcbiAgICB9LFxuXG4gICAgYXN5bmMgY3JlYXRlVG9vbENvbmZpZ3VyYXRpb24obmFtZTogc3RyaW5nLCBkZXNjcmlwdGlvbj86IHN0cmluZykge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgY29uc3QgY29uZmlnID0gdG9vbE1hbmFnZXIuY3JlYXRlQ29uZmlndXJhdGlvbihuYW1lLCBkZXNjcmlwdGlvbik7XG4gICAgICAgICAgICBzeW5jTWNwRW5hYmxlZFRvb2xzKCk7XG4gICAgICAgICAgICByZXR1cm4geyBzdWNjZXNzOiB0cnVlLCBpZDogY29uZmlnLmlkLCBjb25maWcgfTtcbiAgICAgICAgfSBjYXRjaCAoZXJyb3I6IGFueSkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGDliJvlu7rphY3nva7lpLHotKU6ICR7ZXJyb3IubWVzc2FnZX1gKTtcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICBhc3luYyB1cGRhdGVUb29sQ29uZmlndXJhdGlvbihjb25maWdJZDogc3RyaW5nLCB1cGRhdGVzOiBhbnkpIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGNvbnN0IHJlc3VsdCA9IHRvb2xNYW5hZ2VyLnVwZGF0ZUNvbmZpZ3VyYXRpb24oY29uZmlnSWQsIHVwZGF0ZXMpO1xuICAgICAgICAgICAgc3luY01jcEVuYWJsZWRUb29scygpO1xuICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgICAgfSBjYXRjaCAoZXJyb3I6IGFueSkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGDmm7TmlrDphY3nva7lpLHotKU6ICR7ZXJyb3IubWVzc2FnZX1gKTtcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICBhc3luYyBkZWxldGVUb29sQ29uZmlndXJhdGlvbihjb25maWdJZDogc3RyaW5nKSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICB0b29sTWFuYWdlci5kZWxldGVDb25maWd1cmF0aW9uKGNvbmZpZ0lkKTtcbiAgICAgICAgICAgIHN5bmNNY3BFbmFibGVkVG9vbHMoKTtcbiAgICAgICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IHRydWUgfTtcbiAgICAgICAgfSBjYXRjaCAoZXJyb3I6IGFueSkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGDliKDpmaTphY3nva7lpLHotKU6ICR7ZXJyb3IubWVzc2FnZX1gKTtcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICBhc3luYyBzZXRDdXJyZW50VG9vbENvbmZpZ3VyYXRpb24oY29uZmlnSWQ6IHN0cmluZykge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgdG9vbE1hbmFnZXIuc2V0Q3VycmVudENvbmZpZ3VyYXRpb24oY29uZmlnSWQpO1xuICAgICAgICAgICAgc3luY01jcEVuYWJsZWRUb29scygpO1xuICAgICAgICAgICAgaWYgKG1jcFNlcnZlcikge1xuICAgICAgICAgICAgICAgIG1jcFNlcnZlci5yZWZyZXNoVG9vbExpc3QoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IHRydWUgfTtcbiAgICAgICAgfSBjYXRjaCAoZXJyb3I6IGFueSkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGDorr7nva7lvZPliY3phY3nva7lpLHotKU6ICR7ZXJyb3IubWVzc2FnZX1gKTtcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICBhc3luYyB1cGRhdGVUb29sU3RhdHVzKGNhdGVnb3J5OiBzdHJpbmcsIHRvb2xOYW1lOiBzdHJpbmcsIGVuYWJsZWQ6IGJvb2xlYW4pIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGNvbnN0IGN1cnJlbnRDb25maWcgPSB0b29sTWFuYWdlci5nZXRDdXJyZW50Q29uZmlndXJhdGlvbigpO1xuICAgICAgICAgICAgaWYgKCFjdXJyZW50Q29uZmlnKSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCfmsqHmnInlvZPliY3phY3nva4nKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdG9vbE1hbmFnZXIudXBkYXRlVG9vbFN0YXR1cyhjdXJyZW50Q29uZmlnLmlkLCBjYXRlZ29yeSwgdG9vbE5hbWUsIGVuYWJsZWQpO1xuICAgICAgICAgICAgc3luY01jcEVuYWJsZWRUb29scygpO1xuXG4gICAgICAgICAgICByZXR1cm4geyBzdWNjZXNzOiB0cnVlIH07XG4gICAgICAgIH0gY2F0Y2ggKGVycm9yOiBhbnkpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihg5pu05paw5bel5YW354q25oCB5aSx6LSlOiAke2Vycm9yLm1lc3NhZ2V9YCk7XG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgYXN5bmMgdXBkYXRlVG9vbFN0YXR1c0JhdGNoKHVwZGF0ZXM6IGFueVtdKSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhgW01haW5dIHVwZGF0ZVRvb2xTdGF0dXNCYXRjaCBjYWxsZWQgd2l0aCB1cGRhdGVzIGNvdW50OmAsIHVwZGF0ZXMgPyB1cGRhdGVzLmxlbmd0aCA6IDApO1xuXG4gICAgICAgICAgICBjb25zdCBjdXJyZW50Q29uZmlnID0gdG9vbE1hbmFnZXIuZ2V0Q3VycmVudENvbmZpZ3VyYXRpb24oKTtcbiAgICAgICAgICAgIGlmICghY3VycmVudENvbmZpZykge1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcign5rKh5pyJ5b2T5YmN6YWN572uJyk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHRvb2xNYW5hZ2VyLnVwZGF0ZVRvb2xTdGF0dXNCYXRjaChjdXJyZW50Q29uZmlnLmlkLCB1cGRhdGVzKTtcbiAgICAgICAgICAgIHN5bmNNY3BFbmFibGVkVG9vbHMoKTtcblxuICAgICAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogdHJ1ZSB9O1xuICAgICAgICB9IGNhdGNoIChlcnJvcjogYW55KSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYOaJuemHj+abtOaWsOW3peWFt+eKtuaAgeWksei0pTogJHtlcnJvci5tZXNzYWdlfWApO1xuICAgICAgICB9XG4gICAgfSxcblxuICAgIGFzeW5jIGV4cG9ydFRvb2xDb25maWd1cmF0aW9uKGNvbmZpZ0lkOiBzdHJpbmcpIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIHJldHVybiB7IGNvbmZpZ0pzb246IHRvb2xNYW5hZ2VyLmV4cG9ydENvbmZpZ3VyYXRpb24oY29uZmlnSWQpIH07XG4gICAgICAgIH0gY2F0Y2ggKGVycm9yOiBhbnkpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihg5a+85Ye66YWN572u5aSx6LSlOiAke2Vycm9yLm1lc3NhZ2V9YCk7XG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgYXN5bmMgaW1wb3J0VG9vbENvbmZpZ3VyYXRpb24oY29uZmlnSnNvbjogc3RyaW5nKSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBjb25zdCBjb25maWcgPSB0b29sTWFuYWdlci5pbXBvcnRDb25maWd1cmF0aW9uKGNvbmZpZ0pzb24pO1xuICAgICAgICAgICAgc3luY01jcEVuYWJsZWRUb29scygpO1xuICAgICAgICAgICAgcmV0dXJuIGNvbmZpZztcbiAgICAgICAgfSBjYXRjaCAoZXJyb3I6IGFueSkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGDlr7zlhaXphY3nva7lpLHotKU6ICR7ZXJyb3IubWVzc2FnZX1gKTtcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICBhc3luYyBnZXRFbmFibGVkVG9vbHMoKSB7XG4gICAgICAgIHJldHVybiB0b29sTWFuYWdlci5nZXRFbmFibGVkVG9vbHMoKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQGVuIFJlZ2lzdGVyIGV4dGVybmFsIE1DUCB0b29scyBmcm9tIGFub3RoZXIgZXh0ZW5zaW9uXG4gICAgICogQHpoIOazqOWGjOWFtuS7luaJqeWxleaPkOS+m+eahCBNQ1Ag5bel5YW3XG4gICAgICovXG4gICAgcmVnaXN0ZXJFeHRlcm5hbFRvb2xzKHBheWxvYWQ6IFJlZ2lzdGVyRXh0ZXJuYWxUb29sc1BheWxvYWQpOiBSZWdpc3RlclJlc3VsdCB7XG4gICAgICAgIGNvbnN0IHJlc3VsdCA9IGNhcGFiaWxpdHlNYW5hZ2VyLnJlZ2lzdGVyRXh0ZXJuYWwocGF5bG9hZCk7XG4gICAgICAgIGlmIChyZXN1bHQuc3VjY2Vzcykge1xuICAgICAgICAgICAgYXBwbHlSZWdpc3RyeUNoYW5nZSgpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEBlbiBVbnJlZ2lzdGVyIGFsbCB0b29scyBmcm9tIGFuIGV4dGVybmFsIHByb3ZpZGVyXG4gICAgICogQHpoIOazqOmUgOWklumDqOaJqeWxleeahOWFqOmDqOW3peWFt1xuICAgICAqL1xuICAgIHVucmVnaXN0ZXJFeHRlcm5hbFRvb2xzKHBheWxvYWQ6IHsgcHJvdmlkZXJJZDogc3RyaW5nIH0pOiB7IHN1Y2Nlc3M6IGJvb2xlYW47IHJlbW92ZWQ6IGJvb2xlYW4gfSB7XG4gICAgICAgIGlmICghcGF5bG9hZD8ucHJvdmlkZXJJZCkge1xuICAgICAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIHJlbW92ZWQ6IGZhbHNlIH07XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgcmVtb3ZlZCA9IGNhcGFiaWxpdHlNYW5hZ2VyLnVucmVnaXN0ZXJFeHRlcm5hbChwYXlsb2FkLnByb3ZpZGVySWQpO1xuICAgICAgICBpZiAocmVtb3ZlZCkge1xuICAgICAgICAgICAgYXBwbHlSZWdpc3RyeUNoYW5nZSgpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IHRydWUsIHJlbW92ZWQgfTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQGVuIExpc3QgcmVnaXN0ZXJlZCBleHRlcm5hbCB0b29sIHByb3ZpZGVyc1xuICAgICAqIEB6aCDliJflh7rlt7Lms6jlhoznmoTlpJbpg6jlt6Xlhbfmj5DkvpvmlrlcbiAgICAgKi9cbiAgICBsaXN0RXh0ZXJuYWxUb29scygpOiB7XG4gICAgICAgIHByb3ZpZGVyczogUmV0dXJuVHlwZTxDYXBhYmlsaXR5TWFuYWdlclsnbGlzdEV4dGVybmFsUHJvdmlkZXJzJ10+O1xuICAgICAgICB0b29sczogUmV0dXJuVHlwZTxDYXBhYmlsaXR5TWFuYWdlclsnZ2V0RXh0ZXJuYWxNY3BUb29sRGVmaW5pdGlvbnMnXT47XG4gICAgfSB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBwcm92aWRlcnM6IGNhcGFiaWxpdHlNYW5hZ2VyLmxpc3RFeHRlcm5hbFByb3ZpZGVycygpLFxuICAgICAgICAgICAgdG9vbHM6IGNhcGFiaWxpdHlNYW5hZ2VyLmdldEV4dGVybmFsTWNwVG9vbERlZmluaXRpb25zKCksXG4gICAgICAgIH07XG4gICAgfSxcbn07XG5cbi8qKlxuICogQGVuIE1ldGhvZCBUcmlnZ2VyZWQgb24gRXh0ZW5zaW9uIFN0YXJ0dXBcbiAqIEB6aCDmianlsZXlkK/liqjml7bop6blj5HnmoTmlrnms5VcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGxvYWQoKSB7XG4gICAgY29uc29sZS5sb2coJ0NvY29zIE1DUCBTZXJ2ZXIgZXh0ZW5zaW9uIGxvYWRlZCcpO1xuXG4gICAgY2FwYWJpbGl0eU1hbmFnZXIgPSBjcmVhdGVEZWZhdWx0Q2FwYWJpbGl0eU1hbmFnZXIoKTtcbiAgICBzZXRDYXBhYmlsaXR5TWFuYWdlcihjYXBhYmlsaXR5TWFuYWdlcik7XG5cbiAgICB0b29sTWFuYWdlciA9IG5ldyBUb29sTWFuYWdlcihjYXBhYmlsaXR5TWFuYWdlci5leHBvcnRCdWlsdGluVG9vbENvbmZpZ3MoKSk7XG5cbiAgICBjb25zdCBzZXR0aW5ncyA9IHJlYWRTZXR0aW5ncygpO1xuICAgIG1jcFNlcnZlciA9IGNyZWF0ZU1jcFNlcnZlcihzZXR0aW5ncyk7XG5cbiAgICBhcHBseVJlZ2lzdHJ5Q2hhbmdlKCk7XG5cbiAgICBjb25zdCBlbmFibGVkVG9vbHMgPSB0b29sTWFuYWdlci5nZXRFbmFibGVkVG9vbHMoKTtcbiAgICBtY3BTZXJ2ZXIudXBkYXRlRW5hYmxlZFRvb2xzKGVuYWJsZWRUb29scyk7XG5cbiAgICBpZiAoc2V0dGluZ3MuYXV0b1N0YXJ0KSB7XG4gICAgICAgIG1jcFNlcnZlci5zdGFydCgpLmNhdGNoKChlcnIpID0+IHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ0ZhaWxlZCB0byBhdXRvLXN0YXJ0IE1DUCBzZXJ2ZXI6JywgZXJyKTtcbiAgICAgICAgfSk7XG4gICAgfVxufVxuXG4vKipcbiAqIEBlbiBNZXRob2QgdHJpZ2dlcmVkIHdoZW4gdW5pbnN0YWxsaW5nIHRoZSBleHRlbnNpb25cbiAqIEB6aCDljbjovb3mianlsZXml7bop6blj5HnmoTmlrnms5VcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHVubG9hZCgpIHtcbiAgICBpZiAobWNwU2VydmVyKSB7XG4gICAgICAgIG1jcFNlcnZlci5zdG9wKCk7XG4gICAgICAgIG1jcFNlcnZlciA9IG51bGw7XG4gICAgfVxuICAgIGlmIChjYXBhYmlsaXR5TWFuYWdlcikge1xuICAgICAgICBjYXBhYmlsaXR5TWFuYWdlci5jbGVhckFsbCgpO1xuICAgIH1cbiAgICByZXNldENhcGFiaWxpdHlNYW5hZ2VyRm9yVGVzdHMoKTtcbn1cbiJdfQ==