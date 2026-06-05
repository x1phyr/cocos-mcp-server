"use strict";
/* eslint-disable vue/one-component-per-file */
Object.defineProperty(exports, "__esModule", { value: true });
const fs_extra_1 = require("fs-extra");
const path_1 = require("path");
const constants_1 = require("../../core/constants");
const settings_1 = require("../../core/settings");
const builtin_categories_1 = require("../../registry/builtin-categories");
const vue_1 = require("vue");
const panelDataMap = new WeakMap();
function buildMcpSettings(settings) {
    return {
        port: Number(settings.port),
        autoStart: settings.autoStart,
        enableDebugLog: settings.debugLog,
        allowedOrigins: ['*'],
        maxConnections: Number(settings.maxConnections),
    };
}
module.exports = Editor.Panel.define({
    listeners: {
        show() {
            var _a, _b;
            console.log('[MCP Panel] Panel shown');
            void ((_a = this._refreshStatus) === null || _a === void 0 ? void 0 : _a.call(this));
            void ((_b = this._refreshTools) === null || _b === void 0 ? void 0 : _b.call(this));
        },
        hide() {
            console.log('[MCP Panel] Panel hidden');
        },
    },
    template: (0, fs_extra_1.readFileSync)((0, path_1.join)(__dirname, '../../../static/template/default/index.html'), 'utf-8'),
    style: (0, fs_extra_1.readFileSync)((0, path_1.join)(__dirname, '../../../static/style/default/index.css'), 'utf-8'),
    $: {
        app: '#app',
        panelTitle: '#panelTitle',
    },
    ready() {
        const panelHost = this;
        if (this.$.app) {
            const app = (0, vue_1.createApp)({});
            app.config.compilerOptions.isCustomElement = (tag) => tag.startsWith('ui-');
            app.component('McpServerApp', (0, vue_1.defineComponent)({
                setup() {
                    const activeTab = (0, vue_1.ref)('server');
                    const serverRunning = (0, vue_1.ref)(false);
                    const serverStatus = (0, vue_1.ref)('已停止');
                    const connectedClients = (0, vue_1.ref)(0);
                    const httpUrl = (0, vue_1.ref)('');
                    const isProcessing = (0, vue_1.ref)(false);
                    const serverActionError = (0, vue_1.ref)('');
                    const settingsFeedback = (0, vue_1.ref)('');
                    const settingsFeedbackKind = (0, vue_1.ref)('');
                    const settings = (0, vue_1.ref)({
                        port: constants_1.DEFAULT_MCP_PORT,
                        autoStart: false,
                        debugLog: false,
                        maxConnections: 10,
                    });
                    const availableTools = (0, vue_1.ref)([]);
                    const toolCategories = (0, vue_1.ref)([]);
                    const externalProviders = (0, vue_1.ref)([]);
                    const settingsChanged = (0, vue_1.ref)(false);
                    const statusClass = (0, vue_1.computed)(() => ({
                        'status-running': serverRunning.value,
                        'status-stopped': !serverRunning.value,
                    }));
                    const totalTools = (0, vue_1.computed)(() => availableTools.value.length);
                    const enabledTools = (0, vue_1.computed)(() => availableTools.value.filter((t) => t.enabled).length);
                    const disabledTools = (0, vue_1.computed)(() => totalTools.value - enabledTools.value);
                    const builtinToolCount = (0, vue_1.computed)(() => availableTools.value.filter((t) => builtin_categories_1.BUILTIN_TOOL_CATEGORIES.has(t.category)).length);
                    const externalToolCount = (0, vue_1.computed)(() => totalTools.value - builtinToolCount.value);
                    const sortedToolCategories = (0, vue_1.computed)(() => {
                        const builtins = toolCategories.value
                            .filter((c) => builtin_categories_1.BUILTIN_TOOL_CATEGORIES.has(c))
                            .sort();
                        const external = toolCategories.value
                            .filter((c) => !builtin_categories_1.BUILTIN_TOOL_CATEGORIES.has(c))
                            .sort();
                        return [...builtins, ...external];
                    });
                    const settingsValidationError = (0, vue_1.computed)(() => (0, settings_1.validateMcpServerSettings)(buildMcpSettings(settings.value)));
                    const serverToggleLabel = (0, vue_1.computed)(() => {
                        if (isProcessing.value) {
                            return serverRunning.value ? '正在停止…' : '正在启动…';
                        }
                        return serverRunning.value ? '停止服务器' : '启动服务器';
                    });
                    const isExternalCategory = (category) => !builtin_categories_1.BUILTIN_TOOL_CATEGORIES.has(category);
                    const refreshServerStatus = async () => {
                        const result = await Editor.Message.request('cocos-mcp-server', 'get-server-status');
                        if (result) {
                            serverRunning.value = result.running;
                            serverStatus.value = result.running ? '运行中' : '已停止';
                            connectedClients.value = result.clients || 0;
                            httpUrl.value = result.running ? `http://127.0.0.1:${result.port}` : '';
                            if (result.settings) {
                                settings.value = {
                                    port: result.settings.port || constants_1.DEFAULT_MCP_PORT,
                                    autoStart: result.settings.autoStart || false,
                                    debugLog: result.settings.enableDebugLog || false,
                                    maxConnections: result.settings.maxConnections || 10,
                                };
                                settingsChanged.value = false;
                            }
                        }
                    };
                    const loadExternalSummary = async () => {
                        var _a;
                        try {
                            const result = await Editor.Message.request('cocos-mcp-server', 'mcp-list-external-tools');
                            externalProviders.value = (_a = result === null || result === void 0 ? void 0 : result.providers) !== null && _a !== void 0 ? _a : [];
                        }
                        catch (error) {
                            console.error('[Vue App] Failed to load external tools summary:', error);
                            externalProviders.value = [];
                        }
                    };
                    const loadToolManagerState = async () => {
                        try {
                            const result = await Editor.Message.request('cocos-mcp-server', 'getToolManagerState');
                            if (result && result.success) {
                                availableTools.value = result.availableTools || [];
                                const categories = new Set(availableTools.value.map((tool) => tool.category));
                                toolCategories.value = Array.from(categories);
                            }
                            await loadExternalSummary();
                        }
                        catch (error) {
                            console.error('[Vue App] Failed to load tool manager state:', error);
                        }
                    };
                    panelHost._refreshTools = loadToolManagerState;
                    panelHost._refreshStatus = refreshServerStatus;
                    const switchTab = (tabName) => {
                        activeTab.value = tabName;
                        if (tabName === 'tools') {
                            void loadToolManagerState();
                        }
                    };
                    const toggleServer = async () => {
                        if (isProcessing.value) {
                            return;
                        }
                        isProcessing.value = true;
                        serverActionError.value = '';
                        try {
                            if (serverRunning.value) {
                                await Editor.Message.request('cocos-mcp-server', 'stop-server');
                            }
                            else {
                                const validationError = (0, settings_1.validateMcpServerSettings)(buildMcpSettings(settings.value));
                                if (validationError) {
                                    serverActionError.value = validationError;
                                    return;
                                }
                                await Editor.Message.request('cocos-mcp-server', 'update-settings', buildMcpSettings(settings.value));
                                await Editor.Message.request('cocos-mcp-server', 'start-server');
                            }
                            await refreshServerStatus();
                        }
                        catch (error) {
                            serverActionError.value = (error === null || error === void 0 ? void 0 : error.message) || String(error);
                        }
                        finally {
                            isProcessing.value = false;
                        }
                    };
                    const saveSettings = async () => {
                        settingsFeedback.value = '';
                        settingsFeedbackKind.value = '';
                        const validationError = (0, settings_1.validateMcpServerSettings)(buildMcpSettings(settings.value));
                        if (validationError) {
                            settingsFeedback.value = validationError;
                            settingsFeedbackKind.value = 'error';
                            return;
                        }
                        if (serverRunning.value) {
                            settingsFeedback.value = '请先停止服务器再修改端口';
                            settingsFeedbackKind.value = 'error';
                            return;
                        }
                        try {
                            isProcessing.value = true;
                            await Editor.Message.request('cocos-mcp-server', 'update-settings', buildMcpSettings(settings.value));
                            settingsChanged.value = false;
                            settingsFeedback.value = '设置已保存';
                            settingsFeedbackKind.value = 'success';
                            await refreshServerStatus();
                        }
                        catch (error) {
                            settingsFeedback.value = (error === null || error === void 0 ? void 0 : error.message) || '保存设置失败';
                            settingsFeedbackKind.value = 'error';
                        }
                        finally {
                            isProcessing.value = false;
                        }
                    };
                    const copyUrl = async () => {
                        try {
                            await navigator.clipboard.writeText(httpUrl.value);
                            settingsFeedback.value = 'HTTP 地址已复制';
                            settingsFeedbackKind.value = 'success';
                        }
                        catch (error) {
                            console.error('[Vue App] Failed to copy URL:', error);
                        }
                    };
                    const updateToolStatus = async (category, name, enabled) => {
                        const toolIndex = availableTools.value.findIndex((t) => t.category === category && t.name === name);
                        if (toolIndex === -1) {
                            return;
                        }
                        const previous = availableTools.value[toolIndex].enabled;
                        availableTools.value[toolIndex].enabled = enabled;
                        availableTools.value = [...availableTools.value];
                        try {
                            const result = await Editor.Message.request('cocos-mcp-server', 'updateToolStatus', category, name, enabled);
                            if (!result || !result.success) {
                                availableTools.value[toolIndex].enabled = previous;
                                availableTools.value = [...availableTools.value];
                            }
                        }
                        catch (error) {
                            availableTools.value[toolIndex].enabled = previous;
                            availableTools.value = [...availableTools.value];
                            console.error('[Vue App] Failed to update tool status:', error);
                        }
                    };
                    const saveChanges = async () => {
                        const updates = availableTools.value.map((tool) => ({
                            category: String(tool.category),
                            name: String(tool.name),
                            enabled: Boolean(tool.enabled),
                        }));
                        await Editor.Message.request('cocos-mcp-server', 'updateToolStatusBatch', updates);
                    };
                    const selectAllTools = async () => {
                        availableTools.value.forEach((tool) => (tool.enabled = true));
                        await saveChanges();
                    };
                    const deselectAllTools = async () => {
                        availableTools.value.forEach((tool) => (tool.enabled = false));
                        await saveChanges();
                    };
                    const toggleCategoryTools = async (category, enabled) => {
                        availableTools.value.forEach((tool) => {
                            if (tool.category === category) {
                                tool.enabled = enabled;
                            }
                        });
                        await saveChanges();
                    };
                    const getToolsByCategory = (category) => {
                        return availableTools.value.filter((tool) => tool.category === category);
                    };
                    const getCategoryDisplayName = (category) => {
                        if (isExternalCategory(category)) {
                            return `外部 · ${category}`;
                        }
                        const categoryNames = {
                            scene: '场景工具',
                            node: '节点工具',
                            component: '组件工具',
                            prefab: '预制体工具',
                            project: '项目工具',
                            debug: '调试工具',
                            preferences: '偏好设置工具',
                            server: '服务器工具',
                            broadcast: '广播工具',
                            sceneAdvanced: '高级场景工具',
                            sceneView: '场景视图工具',
                            referenceImage: '参考图片工具',
                            assetAdvanced: '高级资源工具',
                            validation: '验证工具',
                        };
                        return categoryNames[category] || category;
                    };
                    (0, vue_1.watch)(settings, () => {
                        settingsChanged.value = true;
                        if (settingsFeedbackKind.value === 'success') {
                            settingsFeedback.value = '';
                            settingsFeedbackKind.value = '';
                        }
                    }, { deep: true });
                    let statusPollTimer = null;
                    (0, vue_1.onMounted)(async () => {
                        await loadToolManagerState();
                        await refreshServerStatus();
                        statusPollTimer = setInterval(() => {
                            if (activeTab.value === 'server' && !isProcessing.value) {
                                void refreshServerStatus();
                            }
                        }, 3000);
                    });
                    (0, vue_1.onUnmounted)(() => {
                        if (statusPollTimer) {
                            clearInterval(statusPollTimer);
                            statusPollTimer = null;
                        }
                        panelHost._refreshTools = undefined;
                        panelHost._refreshStatus = undefined;
                    });
                    return {
                        activeTab,
                        serverRunning,
                        serverStatus,
                        connectedClients,
                        httpUrl,
                        isProcessing,
                        serverActionError,
                        settingsFeedback,
                        settingsFeedbackKind,
                        settings,
                        availableTools,
                        toolCategories,
                        sortedToolCategories,
                        externalProviders,
                        settingsChanged,
                        settingsValidationError,
                        serverToggleLabel,
                        statusClass,
                        totalTools,
                        enabledTools,
                        disabledTools,
                        builtinToolCount,
                        externalToolCount,
                        switchTab,
                        toggleServer,
                        saveSettings,
                        copyUrl,
                        loadToolManagerState,
                        updateToolStatus,
                        selectAllTools,
                        deselectAllTools,
                        saveChanges,
                        toggleCategoryTools,
                        getToolsByCategory,
                        getCategoryDisplayName,
                        isExternalCategory,
                    };
                },
                template: (0, fs_extra_1.readFileSync)((0, path_1.join)(__dirname, '../../../static/template/vue/mcp-server-app.html'), 'utf-8'),
            }));
            app.mount(this.$.app);
            panelDataMap.set(this, app);
            const addBroadcastListener = Editor.Message.addBroadcastListener;
            if (typeof addBroadcastListener === 'function') {
                panelHost._toolsBroadcastUnsubscribe = addBroadcastListener.call(Editor.Message, 'mcp-tools-changed', () => {
                    var _a;
                    void ((_a = panelHost._refreshTools) === null || _a === void 0 ? void 0 : _a.call(panelHost));
                });
            }
            console.log('[MCP Panel] Vue3 app mounted successfully');
        }
    },
    beforeClose() {
        if (typeof this._toolsBroadcastUnsubscribe === 'function') {
            this._toolsBroadcastUnsubscribe();
        }
    },
    close() {
        const app = panelDataMap.get(this);
        if (app) {
            app.unmount();
        }
    },
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zb3VyY2UvcGFuZWwvZGVmYXVsdC9pbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUEsK0NBQStDOztBQUUvQyx1Q0FBd0M7QUFDeEMsK0JBQTRCO0FBQzVCLG9EQUF3RDtBQUN4RCxrREFBZ0U7QUFDaEUsMEVBQTRFO0FBRTVFLDZCQUFvRztBQUVwRyxNQUFNLFlBQVksR0FBRyxJQUFJLE9BQU8sRUFBWSxDQUFDO0FBc0I3QyxTQUFTLGdCQUFnQixDQUFDLFFBQXdCO0lBQzlDLE9BQU87UUFDSCxJQUFJLEVBQUUsTUFBTSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUM7UUFDM0IsU0FBUyxFQUFFLFFBQVEsQ0FBQyxTQUFTO1FBQzdCLGNBQWMsRUFBRSxRQUFRLENBQUMsUUFBUTtRQUNqQyxjQUFjLEVBQUUsQ0FBQyxHQUFHLENBQUM7UUFDckIsY0FBYyxFQUFFLE1BQU0sQ0FBQyxRQUFRLENBQUMsY0FBYyxDQUFDO0tBQ2xELENBQUM7QUFDTixDQUFDO0FBU0QsTUFBTSxDQUFDLE9BQU8sR0FBRyxNQUFNLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQztJQUNqQyxTQUFTLEVBQUU7UUFDUCxJQUFJOztZQUNBLE9BQU8sQ0FBQyxHQUFHLENBQUMseUJBQXlCLENBQUMsQ0FBQztZQUN2QyxLQUFLLENBQUEsTUFBQSxJQUFJLENBQUMsY0FBYyxvREFBSSxDQUFBLENBQUM7WUFDN0IsS0FBSyxDQUFBLE1BQUEsSUFBSSxDQUFDLGFBQWEsb0RBQUksQ0FBQSxDQUFDO1FBQ2hDLENBQUM7UUFDRCxJQUFJO1lBQ0EsT0FBTyxDQUFDLEdBQUcsQ0FBQywwQkFBMEIsQ0FBQyxDQUFDO1FBQzVDLENBQUM7S0FDSjtJQUNELFFBQVEsRUFBRSxJQUFBLHVCQUFZLEVBQUMsSUFBQSxXQUFJLEVBQUMsU0FBUyxFQUFFLDZDQUE2QyxDQUFDLEVBQUUsT0FBTyxDQUFDO0lBQy9GLEtB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QUFBLFNBQVMsQ0FBQyxhQUFhLHlEQUFJLENBQUEsQ0FBQztnQkFDckMsQ0FBQyxDQUNKLENBQUM7WUFDTixDQUFDO1lBRUQsT0FBTyxDQUFDLEdBQUcsQ0FBQywyQ0FBMkMsQ0FBQyxDQUFDO1FBQzdELENBQUM7SUFDTCxDQUFDO0lBQ0QsV0FBVztRQUNQLElBQUksT0FBTyxJQUFJLENBQUMsMEJBQTBCLEtBQUssVUFBVSxFQUFFLENBQUM7WUFDeEQsSUFBSSxDQUFDLDBCQUEwQixFQUFFLENBQUM7UUFDdEMsQ0FBQztJQUNMLENBQUM7SUFDRCxLQUFLO1FBQ0QsTUFBTSxHQUFHLEdBQUcsWUFBWSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUNuQyxJQUFJLEdBQUcsRUFBRSxDQUFDO1lBQ04sR0FBRyxDQUFDLE9BQU8sRUFBRSxDQUFDO1FBQ2xCLENBQUM7SUFDTCxDQUFDO0NBQ0osQ0FBQyxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyogZXNsaW50LWRpc2FibGUgdnVlL29uZS1jb21wb25lbnQtcGVyLWZpbGUgKi9cblxuaW1wb3J0IHsgcmVhZEZpbGVTeW5jIH0gZnJvbSAnZnMtZXh0cmEnO1xuaW1wb3J0IHsgam9pbiB9IGZyb20gJ3BhdGgnO1xuaW1wb3J0IHsgREVGQVVMVF9NQ1BfUE9SVCB9IGZyb20gJy4uLy4uL2NvcmUvY29uc3RhbnRzJztcbmltcG9ydCB7IHZhbGlkYXRlTWNwU2VydmVyU2V0dGluZ3MgfSBmcm9tICcuLi8uLi9jb3JlL3NldHRpbmdzJztcbmltcG9ydCB7IEJVSUxUSU5fVE9PTF9DQVRFR09SSUVTIH0gZnJvbSAnLi4vLi4vcmVnaXN0cnkvYnVpbHRpbi1jYXRlZ29yaWVzJztcbmltcG9ydCB7IE1DUFNlcnZlclNldHRpbmdzIH0gZnJvbSAnLi4vLi4vdHlwZXMnO1xuaW1wb3J0IHsgY3JlYXRlQXBwLCBBcHAsIGRlZmluZUNvbXBvbmVudCwgcmVmLCBjb21wdXRlZCwgb25Nb3VudGVkLCBvblVubW91bnRlZCwgd2F0Y2ggfSBmcm9tICd2dWUnO1xuXG5jb25zdCBwYW5lbERhdGFNYXAgPSBuZXcgV2Vha01hcDxhbnksIEFwcD4oKTtcblxuaW50ZXJmYWNlIFRvb2xDb25maWcge1xuICAgIGNhdGVnb3J5OiBzdHJpbmc7XG4gICAgbmFtZTogc3RyaW5nO1xuICAgIGVuYWJsZWQ6IGJvb2xlYW47XG4gICAgZGVzY3JpcHRpb246IHN0cmluZztcbn1cblxuaW50ZXJmYWNlIEV4dGVybmFsUHJvdmlkZXJTdW1tYXJ5IHtcbiAgICBwcm92aWRlcklkOiBzdHJpbmc7XG4gICAgbmFtZXNwYWNlOiBzdHJpbmc7XG4gICAgdG9vbHM6IHsgbmFtZTogc3RyaW5nOyBkZXNjcmlwdGlvbjogc3RyaW5nIH1bXTtcbn1cblxuaW50ZXJmYWNlIFBhbmVsSG9zdCB7XG4gICAgJDogeyBhcHA/OiBIVE1MRWxlbWVudCB9O1xuICAgIF9yZWZyZXNoVG9vbHM/OiAoKSA9PiB2b2lkIHwgUHJvbWlzZTx2b2lkPjtcbiAgICBfcmVmcmVzaFN0YXR1cz86ICgpID0+IHZvaWQgfCBQcm9taXNlPHZvaWQ+O1xuICAgIF90b29sc0Jyb2FkY2FzdFVuc3Vic2NyaWJlPzogKCkgPT4gdm9pZDtcbn1cblxuZnVuY3Rpb24gYnVpbGRNY3BTZXR0aW5ncyhzZXR0aW5nczogU2VydmVyU2V0dGluZ3MpOiBNQ1BTZXJ2ZXJTZXR0aW5ncyB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgcG9ydDogTnVtYmVyKHNldHRpbmdzLnBvcnQpLFxuICAgICAgICBhdXRvU3RhcnQ6IHNldHRpbmdzLmF1dG9TdGFydCxcbiAgICAgICAgZW5hYmxlRGVidWdMb2c6IHNldHRpbmdzLmRlYnVnTG9nLFxuICAgICAgICBhbGxvd2VkT3JpZ2luczogWycqJ10sXG4gICAgICAgIG1heENvbm5lY3Rpb25zOiBOdW1iZXIoc2V0dGluZ3MubWF4Q29ubmVjdGlvbnMpLFxuICAgIH07XG59XG5cbmludGVyZmFjZSBTZXJ2ZXJTZXR0aW5ncyB7XG4gICAgcG9ydDogbnVtYmVyO1xuICAgIGF1dG9TdGFydDogYm9vbGVhbjtcbiAgICBkZWJ1Z0xvZzogYm9vbGVhbjtcbiAgICBtYXhDb25uZWN0aW9uczogbnVtYmVyO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IEVkaXRvci5QYW5lbC5kZWZpbmUoe1xuICAgIGxpc3RlbmVyczoge1xuICAgICAgICBzaG93KHRoaXM6IFBhbmVsSG9zdCkge1xuICAgICAgICAgICAgY29uc29sZS5sb2coJ1tNQ1AgUGFuZWxdIFBhbmVsIHNob3duJyk7XG4gICAgICAgICAgICB2b2lkIHRoaXMuX3JlZnJlc2hTdGF0dXM/LigpO1xuICAgICAgICAgICAgdm9pZCB0aGlzLl9yZWZyZXNoVG9vbHM/LigpO1xuICAgICAgICB9LFxuICAgICAgICBoaWRlKCkge1xuICAgICAgICAgICAgY29uc29sZS5sb2coJ1tNQ1AgUGFuZWxdIFBhbmVsIGhpZGRlbicpO1xuICAgICAgICB9LFxuICAgIH0sXG4gICAgdGVtcGxhdGU6IHJlYWRGaWxlU3luYyhqb2luKF9fZGlybmFtZSwgJy4uLy4uLy4uL3N0YXRpYy90ZW1wbGF0ZS9kZWZhdWx0L2luZGV4Lmh0bWwnKSwgJ3V0Zi04JyksXG4gICAgc3R5bGU6IHJlYWRGaWxlU3luYyhqb2luKF9fZGlybmFtZSwgJy4uLy4uLy4uL3N0YXRpYy9zdHlsZS9kZWZhdWx0L2luZGV4LmNzcycpLCAndXRmLTgnKSxcbiAgICAkOiB7XG4gICAgICAgIGFwcDogJyNhcHAnLFxuICAgICAgICBwYW5lbFRpdGxlOiAnI3BhbmVsVGl0bGUnLFxuICAgIH0sXG4gICAgcmVhZHkodGhpczogUGFuZWxIb3N0KSB7XG4gICAgICAgIGNvbnN0IHBhbmVsSG9zdCA9IHRoaXM7XG5cbiAgICAgICAgaWYgKHRoaXMuJC5hcHApIHtcbiAgICAgICAgICAgIGNvbnN0IGFwcCA9IGNyZWF0ZUFwcCh7fSk7XG4gICAgICAgICAgICBhcHAuY29uZmlnLmNvbXBpbGVyT3B0aW9ucy5pc0N1c3RvbUVsZW1lbnQgPSAodGFnKSA9PiB0YWcuc3RhcnRzV2l0aCgndWktJyk7XG5cbiAgICAgICAgICAgIGFwcC5jb21wb25lbnQoXG4gICAgICAgICAgICAgICAgJ01jcFNlcnZlckFwcCcsXG4gICAgICAgICAgICAgICAgZGVmaW5lQ29tcG9uZW50KHtcbiAgICAgICAgICAgICAgICAgICAgc2V0dXAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBhY3RpdmVUYWIgPSByZWYoJ3NlcnZlcicpO1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3Qgc2VydmVyUnVubmluZyA9IHJlZihmYWxzZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBzZXJ2ZXJTdGF0dXMgPSByZWYoJ+W3suWBnOatoicpO1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgY29ubmVjdGVkQ2xpZW50cyA9IHJlZigwKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGh0dHBVcmwgPSByZWYoJycpO1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgaXNQcm9jZXNzaW5nID0gcmVmKGZhbHNlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHNlcnZlckFjdGlvbkVycm9yID0gcmVmKCcnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHNldHRpbmdzRmVlZGJhY2sgPSByZWYoJycpO1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3Qgc2V0dGluZ3NGZWVkYmFja0tpbmQgPSByZWY8J3N1Y2Nlc3MnIHwgJ2Vycm9yJyB8ICcnPignJyk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHNldHRpbmdzID0gcmVmPFNlcnZlclNldHRpbmdzPih7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcG9ydDogREVGQVVMVF9NQ1BfUE9SVCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhdXRvU3RhcnQ6IGZhbHNlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlYnVnTG9nOiBmYWxzZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtYXhDb25uZWN0aW9uczogMTAsXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgYXZhaWxhYmxlVG9vbHMgPSByZWY8VG9vbENvbmZpZ1tdPihbXSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCB0b29sQ2F0ZWdvcmllcyA9IHJlZjxzdHJpbmdbXT4oW10pO1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgZXh0ZXJuYWxQcm92aWRlcnMgPSByZWY8RXh0ZXJuYWxQcm92aWRlclN1bW1hcnlbXT4oW10pO1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3Qgc2V0dGluZ3NDaGFuZ2VkID0gcmVmKGZhbHNlKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3Qgc3RhdHVzQ2xhc3MgPSBjb21wdXRlZCgoKSA9PiAoe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICdzdGF0dXMtcnVubmluZyc6IHNlcnZlclJ1bm5pbmcudmFsdWUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJ3N0YXR1cy1zdG9wcGVkJzogIXNlcnZlclJ1bm5pbmcudmFsdWUsXG4gICAgICAgICAgICAgICAgICAgICAgICB9KSk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHRvdGFsVG9vbHMgPSBjb21wdXRlZCgoKSA9PiBhdmFpbGFibGVUb29scy52YWx1ZS5sZW5ndGgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgZW5hYmxlZFRvb2xzID0gY29tcHV0ZWQoKCkgPT4gYXZhaWxhYmxlVG9vbHMudmFsdWUuZmlsdGVyKCh0KSA9PiB0LmVuYWJsZWQpLmxlbmd0aCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBkaXNhYmxlZFRvb2xzID0gY29tcHV0ZWQoKCkgPT4gdG90YWxUb29scy52YWx1ZSAtIGVuYWJsZWRUb29scy52YWx1ZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBidWlsdGluVG9vbENvdW50ID0gY29tcHV0ZWQoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgKCkgPT4gYXZhaWxhYmxlVG9vbHMudmFsdWUuZmlsdGVyKCh0KSA9PiBCVUlMVElOX1RPT0xfQ0FURUdPUklFUy5oYXModC5jYXRlZ29yeSkpLmxlbmd0aFxuICAgICAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGV4dGVybmFsVG9vbENvdW50ID0gY29tcHV0ZWQoKCkgPT4gdG90YWxUb29scy52YWx1ZSAtIGJ1aWx0aW5Ub29sQ291bnQudmFsdWUpO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBzb3J0ZWRUb29sQ2F0ZWdvcmllcyA9IGNvbXB1dGVkKCgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBidWlsdGlucyA9IHRvb2xDYXRlZ29yaWVzLnZhbHVlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5maWx0ZXIoKGMpID0+IEJVSUxUSU5fVE9PTF9DQVRFR09SSUVTLmhhcyhjKSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLnNvcnQoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBleHRlcm5hbCA9IHRvb2xDYXRlZ29yaWVzLnZhbHVlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5maWx0ZXIoKGMpID0+ICFCVUlMVElOX1RPT0xfQ0FURUdPUklFUy5oYXMoYykpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5zb3J0KCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIFsuLi5idWlsdGlucywgLi4uZXh0ZXJuYWxdO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHNldHRpbmdzVmFsaWRhdGlvbkVycm9yID0gY29tcHV0ZWQoKCkgPT5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YWxpZGF0ZU1jcFNlcnZlclNldHRpbmdzKGJ1aWxkTWNwU2V0dGluZ3Moc2V0dGluZ3MudmFsdWUpKVxuICAgICAgICAgICAgICAgICAgICAgICAgKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3Qgc2VydmVyVG9nZ2xlTGFiZWwgPSBjb21wdXRlZCgoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGlzUHJvY2Vzc2luZy52YWx1ZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gc2VydmVyUnVubmluZy52YWx1ZSA/ICfmraPlnKjlgZzmraLigKYnIDogJ+ato+WcqOWQr+WKqOKApic7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBzZXJ2ZXJSdW5uaW5nLnZhbHVlID8gJ+WBnOatouacjeWKoeWZqCcgOiAn5ZCv5Yqo5pyN5Yqh5ZmoJztcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBpc0V4dGVybmFsQ2F0ZWdvcnkgPSAoY2F0ZWdvcnk6IHN0cmluZykgPT4gIUJVSUxUSU5fVE9PTF9DQVRFR09SSUVTLmhhcyhjYXRlZ29yeSk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHJlZnJlc2hTZXJ2ZXJTdGF0dXMgPSBhc3luYyAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgRWRpdG9yLk1lc3NhZ2UucmVxdWVzdCgnY29jb3MtbWNwLXNlcnZlcicsICdnZXQtc2VydmVyLXN0YXR1cycpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChyZXN1bHQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2VydmVyUnVubmluZy52YWx1ZSA9IHJlc3VsdC5ydW5uaW5nO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZXJ2ZXJTdGF0dXMudmFsdWUgPSByZXN1bHQucnVubmluZyA/ICfov5DooYzkuK0nIDogJ+W3suWBnOatoic7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbm5lY3RlZENsaWVudHMudmFsdWUgPSByZXN1bHQuY2xpZW50cyB8fCAwO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBodHRwVXJsLnZhbHVlID0gcmVzdWx0LnJ1bm5pbmcgPyBgaHR0cDovLzEyNy4wLjAuMToke3Jlc3VsdC5wb3J0fWAgOiAnJztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHJlc3VsdC5zZXR0aW5ncykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2V0dGluZ3MudmFsdWUgPSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcG9ydDogcmVzdWx0LnNldHRpbmdzLnBvcnQgfHwgREVGQVVMVF9NQ1BfUE9SVCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhdXRvU3RhcnQ6IHJlc3VsdC5zZXR0aW5ncy5hdXRvU3RhcnQgfHwgZmFsc2UsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVidWdMb2c6IHJlc3VsdC5zZXR0aW5ncy5lbmFibGVEZWJ1Z0xvZyB8fCBmYWxzZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtYXhDb25uZWN0aW9uczogcmVzdWx0LnNldHRpbmdzLm1heENvbm5lY3Rpb25zIHx8IDEwLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNldHRpbmdzQ2hhbmdlZC52YWx1ZSA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgbG9hZEV4dGVybmFsU3VtbWFyeSA9IGFzeW5jICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBFZGl0b3IuTWVzc2FnZS5yZXF1ZXN0KFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ2NvY29zLW1jcC1zZXJ2ZXInLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ21jcC1saXN0LWV4dGVybmFsLXRvb2xzJ1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBleHRlcm5hbFByb3ZpZGVycy52YWx1ZSA9IHJlc3VsdD8ucHJvdmlkZXJzID8/IFtdO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ1tWdWUgQXBwXSBGYWlsZWQgdG8gbG9hZCBleHRlcm5hbCB0b29scyBzdW1tYXJ5OicsIGVycm9yKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZXh0ZXJuYWxQcm92aWRlcnMudmFsdWUgPSBbXTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBsb2FkVG9vbE1hbmFnZXJTdGF0ZSA9IGFzeW5jICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBFZGl0b3IuTWVzc2FnZS5yZXF1ZXN0KFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ2NvY29zLW1jcC1zZXJ2ZXInLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ2dldFRvb2xNYW5hZ2VyU3RhdGUnXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChyZXN1bHQgJiYgcmVzdWx0LnN1Y2Nlc3MpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGF2YWlsYWJsZVRvb2xzLnZhbHVlID0gcmVzdWx0LmF2YWlsYWJsZVRvb2xzIHx8IFtdO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgY2F0ZWdvcmllcyA9IG5ldyBTZXQoYXZhaWxhYmxlVG9vbHMudmFsdWUubWFwKCh0b29sKSA9PiB0b29sLmNhdGVnb3J5KSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0b29sQ2F0ZWdvcmllcy52YWx1ZSA9IEFycmF5LmZyb20oY2F0ZWdvcmllcyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXdhaXQgbG9hZEV4dGVybmFsU3VtbWFyeSgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ1tWdWUgQXBwXSBGYWlsZWQgdG8gbG9hZCB0b29sIG1hbmFnZXIgc3RhdGU6JywgZXJyb3IpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIHBhbmVsSG9zdC5fcmVmcmVzaFRvb2xzID0gbG9hZFRvb2xNYW5hZ2VyU3RhdGU7XG4gICAgICAgICAgICAgICAgICAgICAgICBwYW5lbEhvc3QuX3JlZnJlc2hTdGF0dXMgPSByZWZyZXNoU2VydmVyU3RhdHVzO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBzd2l0Y2hUYWIgPSAodGFiTmFtZTogc3RyaW5nKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYWN0aXZlVGFiLnZhbHVlID0gdGFiTmFtZTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAodGFiTmFtZSA9PT0gJ3Rvb2xzJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2b2lkIGxvYWRUb29sTWFuYWdlclN0YXRlKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgdG9nZ2xlU2VydmVyID0gYXN5bmMgKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChpc1Byb2Nlc3NpbmcudmFsdWUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpc1Byb2Nlc3NpbmcudmFsdWUgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNlcnZlckFjdGlvbkVycm9yLnZhbHVlID0gJyc7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHNlcnZlclJ1bm5pbmcudmFsdWUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGF3YWl0IEVkaXRvci5NZXNzYWdlLnJlcXVlc3QoJ2NvY29zLW1jcC1zZXJ2ZXInLCAnc3RvcC1zZXJ2ZXInKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHZhbGlkYXRpb25FcnJvciA9IHZhbGlkYXRlTWNwU2VydmVyU2V0dGluZ3MoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYnVpbGRNY3BTZXR0aW5ncyhzZXR0aW5ncy52YWx1ZSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAodmFsaWRhdGlvbkVycm9yKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2VydmVyQWN0aW9uRXJyb3IudmFsdWUgPSB2YWxpZGF0aW9uRXJyb3I7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXdhaXQgRWRpdG9yLk1lc3NhZ2UucmVxdWVzdChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnY29jb3MtbWNwLXNlcnZlcicsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ3VwZGF0ZS1zZXR0aW5ncycsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYnVpbGRNY3BTZXR0aW5ncyhzZXR0aW5ncy52YWx1ZSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhd2FpdCBFZGl0b3IuTWVzc2FnZS5yZXF1ZXN0KCdjb2Nvcy1tY3Atc2VydmVyJywgJ3N0YXJ0LXNlcnZlcicpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGF3YWl0IHJlZnJlc2hTZXJ2ZXJTdGF0dXMoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGNhdGNoIChlcnJvcjogYW55KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNlcnZlckFjdGlvbkVycm9yLnZhbHVlID0gZXJyb3I/Lm1lc3NhZ2UgfHwgU3RyaW5nKGVycm9yKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGZpbmFsbHkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpc1Byb2Nlc3NpbmcudmFsdWUgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBzYXZlU2V0dGluZ3MgPSBhc3luYyAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2V0dGluZ3NGZWVkYmFjay52YWx1ZSA9ICcnO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNldHRpbmdzRmVlZGJhY2tLaW5kLnZhbHVlID0gJyc7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgdmFsaWRhdGlvbkVycm9yID0gdmFsaWRhdGVNY3BTZXJ2ZXJTZXR0aW5ncyhidWlsZE1jcFNldHRpbmdzKHNldHRpbmdzLnZhbHVlKSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHZhbGlkYXRpb25FcnJvcikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZXR0aW5nc0ZlZWRiYWNrLnZhbHVlID0gdmFsaWRhdGlvbkVycm9yO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZXR0aW5nc0ZlZWRiYWNrS2luZC52YWx1ZSA9ICdlcnJvcic7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHNlcnZlclJ1bm5pbmcudmFsdWUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2V0dGluZ3NGZWVkYmFjay52YWx1ZSA9ICfor7flhYjlgZzmraLmnI3liqHlmajlho3kv67mlLnnq6/lj6MnO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZXR0aW5nc0ZlZWRiYWNrS2luZC52YWx1ZSA9ICdlcnJvcic7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaXNQcm9jZXNzaW5nLnZhbHVlID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXdhaXQgRWRpdG9yLk1lc3NhZ2UucmVxdWVzdChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICdjb2Nvcy1tY3Atc2VydmVyJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICd1cGRhdGUtc2V0dGluZ3MnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYnVpbGRNY3BTZXR0aW5ncyhzZXR0aW5ncy52YWx1ZSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2V0dGluZ3NDaGFuZ2VkLnZhbHVlID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNldHRpbmdzRmVlZGJhY2sudmFsdWUgPSAn6K6+572u5bey5L+d5a2YJztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2V0dGluZ3NGZWVkYmFja0tpbmQudmFsdWUgPSAnc3VjY2Vzcyc7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGF3YWl0IHJlZnJlc2hTZXJ2ZXJTdGF0dXMoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGNhdGNoIChlcnJvcjogYW55KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNldHRpbmdzRmVlZGJhY2sudmFsdWUgPSBlcnJvcj8ubWVzc2FnZSB8fCAn5L+d5a2Y6K6+572u5aSx6LSlJztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2V0dGluZ3NGZWVkYmFja0tpbmQudmFsdWUgPSAnZXJyb3InO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZmluYWxseSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlzUHJvY2Vzc2luZy52YWx1ZSA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGNvcHlVcmwgPSBhc3luYyAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXdhaXQgbmF2aWdhdG9yLmNsaXBib2FyZC53cml0ZVRleHQoaHR0cFVybC52YWx1ZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNldHRpbmdzRmVlZGJhY2sudmFsdWUgPSAnSFRUUCDlnLDlnYDlt7LlpI3liLYnO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZXR0aW5nc0ZlZWRiYWNrS2luZC52YWx1ZSA9ICdzdWNjZXNzJztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKCdbVnVlIEFwcF0gRmFpbGVkIHRvIGNvcHkgVVJMOicsIGVycm9yKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCB1cGRhdGVUb29sU3RhdHVzID0gYXN5bmMgKGNhdGVnb3J5OiBzdHJpbmcsIG5hbWU6IHN0cmluZywgZW5hYmxlZDogYm9vbGVhbikgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHRvb2xJbmRleCA9IGF2YWlsYWJsZVRvb2xzLnZhbHVlLmZpbmRJbmRleChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKHQpID0+IHQuY2F0ZWdvcnkgPT09IGNhdGVnb3J5ICYmIHQubmFtZSA9PT0gbmFtZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHRvb2xJbmRleCA9PT0gLTEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBwcmV2aW91cyA9IGF2YWlsYWJsZVRvb2xzLnZhbHVlW3Rvb2xJbmRleF0uZW5hYmxlZDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhdmFpbGFibGVUb29scy52YWx1ZVt0b29sSW5kZXhdLmVuYWJsZWQgPSBlbmFibGVkO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGF2YWlsYWJsZVRvb2xzLnZhbHVlID0gWy4uLmF2YWlsYWJsZVRvb2xzLnZhbHVlXTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBFZGl0b3IuTWVzc2FnZS5yZXF1ZXN0KFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ2NvY29zLW1jcC1zZXJ2ZXInLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ3VwZGF0ZVRvb2xTdGF0dXMnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2F0ZWdvcnksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuYW1lLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZW5hYmxlZFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoIXJlc3VsdCB8fCAhcmVzdWx0LnN1Y2Nlc3MpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGF2YWlsYWJsZVRvb2xzLnZhbHVlW3Rvb2xJbmRleF0uZW5hYmxlZCA9IHByZXZpb3VzO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXZhaWxhYmxlVG9vbHMudmFsdWUgPSBbLi4uYXZhaWxhYmxlVG9vbHMudmFsdWVdO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXZhaWxhYmxlVG9vbHMudmFsdWVbdG9vbEluZGV4XS5lbmFibGVkID0gcHJldmlvdXM7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGF2YWlsYWJsZVRvb2xzLnZhbHVlID0gWy4uLmF2YWlsYWJsZVRvb2xzLnZhbHVlXTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcignW1Z1ZSBBcHBdIEZhaWxlZCB0byB1cGRhdGUgdG9vbCBzdGF0dXM6JywgZXJyb3IpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHNhdmVDaGFuZ2VzID0gYXN5bmMgKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHVwZGF0ZXMgPSBhdmFpbGFibGVUb29scy52YWx1ZS5tYXAoKHRvb2wpID0+ICh7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhdGVnb3J5OiBTdHJpbmcodG9vbC5jYXRlZ29yeSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5hbWU6IFN0cmluZyh0b29sLm5hbWUpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbmFibGVkOiBCb29sZWFuKHRvb2wuZW5hYmxlZCksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGF3YWl0IEVkaXRvci5NZXNzYWdlLnJlcXVlc3QoJ2NvY29zLW1jcC1zZXJ2ZXInLCAndXBkYXRlVG9vbFN0YXR1c0JhdGNoJywgdXBkYXRlcyk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBzZWxlY3RBbGxUb29scyA9IGFzeW5jICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhdmFpbGFibGVUb29scy52YWx1ZS5mb3JFYWNoKCh0b29sKSA9PiAodG9vbC5lbmFibGVkID0gdHJ1ZSkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGF3YWl0IHNhdmVDaGFuZ2VzKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBkZXNlbGVjdEFsbFRvb2xzID0gYXN5bmMgKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGF2YWlsYWJsZVRvb2xzLnZhbHVlLmZvckVhY2goKHRvb2wpID0+ICh0b29sLmVuYWJsZWQgPSBmYWxzZSkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGF3YWl0IHNhdmVDaGFuZ2VzKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCB0b2dnbGVDYXRlZ29yeVRvb2xzID0gYXN5bmMgKGNhdGVnb3J5OiBzdHJpbmcsIGVuYWJsZWQ6IGJvb2xlYW4pID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhdmFpbGFibGVUb29scy52YWx1ZS5mb3JFYWNoKCh0b29sKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICh0b29sLmNhdGVnb3J5ID09PSBjYXRlZ29yeSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdG9vbC5lbmFibGVkID0gZW5hYmxlZDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGF3YWl0IHNhdmVDaGFuZ2VzKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBnZXRUb29sc0J5Q2F0ZWdvcnkgPSAoY2F0ZWdvcnk6IHN0cmluZykgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBhdmFpbGFibGVUb29scy52YWx1ZS5maWx0ZXIoKHRvb2wpID0+IHRvb2wuY2F0ZWdvcnkgPT09IGNhdGVnb3J5KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGdldENhdGVnb3J5RGlzcGxheU5hbWUgPSAoY2F0ZWdvcnk6IHN0cmluZyk6IHN0cmluZyA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGlzRXh0ZXJuYWxDYXRlZ29yeShjYXRlZ29yeSkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGDlpJbpg6ggwrcgJHtjYXRlZ29yeX1gO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBjYXRlZ29yeU5hbWVzOiB7IFtrZXk6IHN0cmluZ106IHN0cmluZyB9ID0ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzY2VuZTogJ+WcuuaZr+W3peWFtycsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5vZGU6ICfoioLngrnlt6XlhbcnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb21wb25lbnQ6ICfnu4Tku7blt6XlhbcnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwcmVmYWI6ICfpooTliLbkvZPlt6XlhbcnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwcm9qZWN0OiAn6aG555uu5bel5YW3JyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVidWc6ICfosIPor5Xlt6XlhbcnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwcmVmZXJlbmNlczogJ+WBj+Wlveiuvue9ruW3peWFtycsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNlcnZlcjogJ+acjeWKoeWZqOW3peWFtycsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyb2FkY2FzdDogJ+W5v+aSreW3peWFtycsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNjZW5lQWR2YW5jZWQ6ICfpq5jnuqflnLrmma/lt6XlhbcnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzY2VuZVZpZXc6ICflnLrmma/op4blm77lt6XlhbcnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZWZlcmVuY2VJbWFnZTogJ+WPguiAg+WbvueJh+W3peWFtycsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFzc2V0QWR2YW5jZWQ6ICfpq5jnuqfotYTmupDlt6XlhbcnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YWxpZGF0aW9uOiAn6aqM6K+B5bel5YW3JyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBjYXRlZ29yeU5hbWVzW2NhdGVnb3J5XSB8fCBjYXRlZ29yeTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIHdhdGNoKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNldHRpbmdzLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2V0dGluZ3NDaGFuZ2VkLnZhbHVlID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHNldHRpbmdzRmVlZGJhY2tLaW5kLnZhbHVlID09PSAnc3VjY2VzcycpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNldHRpbmdzRmVlZGJhY2sudmFsdWUgPSAnJztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNldHRpbmdzRmVlZGJhY2tLaW5kLnZhbHVlID0gJyc7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHsgZGVlcDogdHJ1ZSB9XG4gICAgICAgICAgICAgICAgICAgICAgICApO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgc3RhdHVzUG9sbFRpbWVyOiBSZXR1cm5UeXBlPHR5cGVvZiBzZXRJbnRlcnZhbD4gfCBudWxsID0gbnVsbDtcblxuICAgICAgICAgICAgICAgICAgICAgICAgb25Nb3VudGVkKGFzeW5jICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhd2FpdCBsb2FkVG9vbE1hbmFnZXJTdGF0ZSgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGF3YWl0IHJlZnJlc2hTZXJ2ZXJTdGF0dXMoKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0YXR1c1BvbGxUaW1lciA9IHNldEludGVydmFsKCgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGFjdGl2ZVRhYi52YWx1ZSA9PT0gJ3NlcnZlcicgJiYgIWlzUHJvY2Vzc2luZy52YWx1ZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdm9pZCByZWZyZXNoU2VydmVyU3RhdHVzKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LCAzMDAwKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICBvblVubW91bnRlZCgoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHN0YXR1c1BvbGxUaW1lcikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjbGVhckludGVydmFsKHN0YXR1c1BvbGxUaW1lcik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0YXR1c1BvbGxUaW1lciA9IG51bGw7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhbmVsSG9zdC5fcmVmcmVzaFRvb2xzID0gdW5kZWZpbmVkO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhbmVsSG9zdC5fcmVmcmVzaFN0YXR1cyA9IHVuZGVmaW5lZDtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFjdGl2ZVRhYixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZXJ2ZXJSdW5uaW5nLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNlcnZlclN0YXR1cyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25uZWN0ZWRDbGllbnRzLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGh0dHBVcmwsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaXNQcm9jZXNzaW5nLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNlcnZlckFjdGlvbkVycm9yLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNldHRpbmdzRmVlZGJhY2ssXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2V0dGluZ3NGZWVkYmFja0tpbmQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2V0dGluZ3MsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYXZhaWxhYmxlVG9vbHMsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdG9vbENhdGVnb3JpZXMsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc29ydGVkVG9vbENhdGVnb3JpZXMsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZXh0ZXJuYWxQcm92aWRlcnMsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2V0dGluZ3NDaGFuZ2VkLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNldHRpbmdzVmFsaWRhdGlvbkVycm9yLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNlcnZlclRvZ2dsZUxhYmVsLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0YXR1c0NsYXNzLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRvdGFsVG9vbHMsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZW5hYmxlZFRvb2xzLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRpc2FibGVkVG9vbHMsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnVpbHRpblRvb2xDb3VudCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBleHRlcm5hbFRvb2xDb3VudCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzd2l0Y2hUYWIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdG9nZ2xlU2VydmVyLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNhdmVTZXR0aW5ncyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb3B5VXJsLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxvYWRUb29sTWFuYWdlclN0YXRlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHVwZGF0ZVRvb2xTdGF0dXMsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2VsZWN0QWxsVG9vbHMsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVzZWxlY3RBbGxUb29scyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzYXZlQ2hhbmdlcyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0b2dnbGVDYXRlZ29yeVRvb2xzLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGdldFRvb2xzQnlDYXRlZ29yeSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBnZXRDYXRlZ29yeURpc3BsYXlOYW1lLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlzRXh0ZXJuYWxDYXRlZ29yeSxcbiAgICAgICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIHRlbXBsYXRlOiByZWFkRmlsZVN5bmMoXG4gICAgICAgICAgICAgICAgICAgICAgICBqb2luKF9fZGlybmFtZSwgJy4uLy4uLy4uL3N0YXRpYy90ZW1wbGF0ZS92dWUvbWNwLXNlcnZlci1hcHAuaHRtbCcpLFxuICAgICAgICAgICAgICAgICAgICAgICAgJ3V0Zi04J1xuICAgICAgICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICApO1xuXG4gICAgICAgICAgICBhcHAubW91bnQodGhpcy4kLmFwcCk7XG4gICAgICAgICAgICBwYW5lbERhdGFNYXAuc2V0KHRoaXMsIGFwcCk7XG5cbiAgICAgICAgICAgIGNvbnN0IGFkZEJyb2FkY2FzdExpc3RlbmVyID0gKFxuICAgICAgICAgICAgICAgIEVkaXRvci5NZXNzYWdlIGFzIHsgYWRkQnJvYWRjYXN0TGlzdGVuZXI/OiAobmFtZTogc3RyaW5nLCBjYjogKCkgPT4gdm9pZCkgPT4gKCkgPT4gdm9pZCB9XG4gICAgICAgICAgICApLmFkZEJyb2FkY2FzdExpc3RlbmVyO1xuICAgICAgICAgICAgaWYgKHR5cGVvZiBhZGRCcm9hZGNhc3RMaXN0ZW5lciA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgICAgIHBhbmVsSG9zdC5fdG9vbHNCcm9hZGNhc3RVbnN1YnNjcmliZSA9IGFkZEJyb2FkY2FzdExpc3RlbmVyLmNhbGwoXG4gICAgICAgICAgICAgICAgICAgIEVkaXRvci5NZXNzYWdlLFxuICAgICAgICAgICAgICAgICAgICAnbWNwLXRvb2xzLWNoYW5nZWQnLFxuICAgICAgICAgICAgICAgICAgICAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2b2lkIHBhbmVsSG9zdC5fcmVmcmVzaFRvb2xzPy4oKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdbTUNQIFBhbmVsXSBWdWUzIGFwcCBtb3VudGVkIHN1Y2Nlc3NmdWxseScpO1xuICAgICAgICB9XG4gICAgfSxcbiAgICBiZWZvcmVDbG9zZSh0aGlzOiBQYW5lbEhvc3QpIHtcbiAgICAgICAgaWYgKHR5cGVvZiB0aGlzLl90b29sc0Jyb2FkY2FzdFVuc3Vic2NyaWJlID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICB0aGlzLl90b29sc0Jyb2FkY2FzdFVuc3Vic2NyaWJlKCk7XG4gICAgICAgIH1cbiAgICB9LFxuICAgIGNsb3NlKCkge1xuICAgICAgICBjb25zdCBhcHAgPSBwYW5lbERhdGFNYXAuZ2V0KHRoaXMpO1xuICAgICAgICBpZiAoYXBwKSB7XG4gICAgICAgICAgICBhcHAudW5tb3VudCgpO1xuICAgICAgICB9XG4gICAgfSxcbn0pO1xuIl19