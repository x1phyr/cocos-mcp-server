import { MCPServer } from './mcp/server';
import { readSettings, saveSettings, validateMcpServerSettings } from './core/settings';
import { MCPServerSettings } from './types';
import { ToolManager } from './config/tool-manager';
import {
    RegisterExternalToolsPayload,
    RegisterResult,
} from './registry/external-tool-registry';
import { CapabilityManager } from './bridge/capability-manager';
import { createDefaultCapabilityManager } from './bridge/builtin-registry';
import { setCapabilityManager, resetCapabilityManagerForTests } from './bridge/capability-manager';

let mcpServer: MCPServer | null = null;
let toolManager: ToolManager;
let capabilityManager: CapabilityManager;

function notifyToolsChanged(): void {
    const broadcast = (Editor.Message as { broadcast?: (name: string, ...args: unknown[]) => void })
        .broadcast;
    if (typeof broadcast === 'function') {
        broadcast.call(Editor.Message, 'mcp-tools-changed');
    }
}

function syncMcpEnabledTools(): void {
    if (mcpServer && toolManager) {
        const enabledTools = toolManager.getEnabledTools();
        mcpServer.updateEnabledTools(enabledTools);
    }
}

function applyRegistryChange(): void {
    if (toolManager) {
        toolManager.syncBuiltinToolsFromRegistry(capabilityManager.exportBuiltinToolConfigs());
        toolManager.syncExternalToolsFromRegistry(
            capabilityManager.getExternalToolConfigsForManager()
        );
    }
    if (mcpServer) {
        syncMcpEnabledTools();
        mcpServer.refreshToolList();
    }
    notifyToolsChanged();
}

function createMcpServer(settings: MCPServerSettings): MCPServer {
    return new MCPServer(settings, capabilityManager);
}

/**
 * @en Registration method for the main process of Extension
 * @zh 为扩展的主进程的注册方法
 */
export const methods: { [key: string]: (...any: any) => any } = {
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
        } else {
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
        } else {
            console.warn('[MCP插件] mcpServer 未初始化');
        }
    },

    /**
     * @en Get server status
     * @zh 获取服务器状态
     */
    getServerStatus() {
        const status = mcpServer ? mcpServer.getStatus() : { running: false, port: 0, clients: 0 };
        const settings = mcpServer ? mcpServer.getSettings() : readSettings();
        return {
            ...status,
            settings: settings,
        };
    },

    /**
     * @en Update server settings (save to disk; restart only if already running)
     * @zh 更新服务器设置（保存到磁盘；仅在服务器运行中时重启）
     */
    updateSettings(settings: MCPServerSettings) {
        const validationError = validateMcpServerSettings(settings);
        if (validationError) {
            throw new Error(validationError);
        }
        saveSettings(settings);
        if (mcpServer && mcpServer.getStatus().running) {
            // 服务器正在运行，用新设置重启
            mcpServer.stop();
            mcpServer = createMcpServer(settings);
            applyRegistryChange();
            mcpServer.start().catch((err) => {
                console.error('[MCP插件] Failed to restart MCP server after settings update:', err);
            });
        } else {
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
        if (!mcpServer) return [];

        const enabledTools = toolManager.getEnabledTools();
        mcpServer.updateEnabledTools(enabledTools);

        return mcpServer.getFilteredTools(enabledTools);
    },

    /**
     * @en Get server settings
     * @zh 获取服务器设置
     */
    async getServerSettings() {
        return mcpServer ? mcpServer.getSettings() : readSettings();
    },

    /**
     * @en Get server settings (alternative method)
     * @zh 获取服务器设置（替代方法）
     */
    async getSettings() {
        return mcpServer ? mcpServer.getSettings() : readSettings();
    },

    async getToolManagerState() {
        return toolManager.getToolManagerState();
    },

    async createToolConfiguration(name: string, description?: string) {
        try {
            const config = toolManager.createConfiguration(name, description);
            syncMcpEnabledTools();
            return { success: true, id: config.id, config };
        } catch (error: any) {
            throw new Error(`创建配置失败: ${error.message}`);
        }
    },

    async updateToolConfiguration(configId: string, updates: any) {
        try {
            const result = toolManager.updateConfiguration(configId, updates);
            syncMcpEnabledTools();
            return result;
        } catch (error: any) {
            throw new Error(`更新配置失败: ${error.message}`);
        }
    },

    async deleteToolConfiguration(configId: string) {
        try {
            toolManager.deleteConfiguration(configId);
            syncMcpEnabledTools();
            return { success: true };
        } catch (error: any) {
            throw new Error(`删除配置失败: ${error.message}`);
        }
    },

    async setCurrentToolConfiguration(configId: string) {
        try {
            toolManager.setCurrentConfiguration(configId);
            syncMcpEnabledTools();
            if (mcpServer) {
                mcpServer.refreshToolList();
            }
            return { success: true };
        } catch (error: any) {
            throw new Error(`设置当前配置失败: ${error.message}`);
        }
    },

    async updateToolStatus(category: string, toolName: string, enabled: boolean) {
        try {
            const currentConfig = toolManager.getCurrentConfiguration();
            if (!currentConfig) {
                throw new Error('没有当前配置');
            }

            toolManager.updateToolStatus(currentConfig.id, category, toolName, enabled);
            syncMcpEnabledTools();

            return { success: true };
        } catch (error: any) {
            throw new Error(`更新工具状态失败: ${error.message}`);
        }
    },

    async updateToolStatusBatch(updates: any[]) {
        try {
            console.log(`[Main] updateToolStatusBatch called with updates count:`, updates ? updates.length : 0);

            const currentConfig = toolManager.getCurrentConfiguration();
            if (!currentConfig) {
                throw new Error('没有当前配置');
            }

            toolManager.updateToolStatusBatch(currentConfig.id, updates);
            syncMcpEnabledTools();

            return { success: true };
        } catch (error: any) {
            throw new Error(`批量更新工具状态失败: ${error.message}`);
        }
    },

    async exportToolConfiguration(configId: string) {
        try {
            return { configJson: toolManager.exportConfiguration(configId) };
        } catch (error: any) {
            throw new Error(`导出配置失败: ${error.message}`);
        }
    },

    async importToolConfiguration(configJson: string) {
        try {
            const config = toolManager.importConfiguration(configJson);
            syncMcpEnabledTools();
            return config;
        } catch (error: any) {
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
    registerExternalTools(payload: RegisterExternalToolsPayload): RegisterResult {
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
    unregisterExternalTools(payload: { providerId: string }): { success: boolean; removed: boolean } {
        if (!payload?.providerId) {
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
    listExternalTools(): {
        providers: ReturnType<CapabilityManager['listExternalProviders']>;
        tools: ReturnType<CapabilityManager['getExternalMcpToolDefinitions']>;
    } {
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
export function load() {
    console.log('Cocos MCP Server extension loaded');

    capabilityManager = createDefaultCapabilityManager();
    setCapabilityManager(capabilityManager);

    toolManager = new ToolManager(capabilityManager.exportBuiltinToolConfigs());

    const settings = readSettings();
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
export function unload() {
    if (mcpServer) {
        mcpServer.stop();
        mcpServer = null;
    }
    if (capabilityManager) {
        capabilityManager.clearAll();
    }
    resetCapabilityManagerForTests();
}
