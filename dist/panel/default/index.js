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
                    let isLoadingSettings = false; // 防止从服务器加载设置时误触 settingsChanged
                    const statusClass = (0, vue_1.computed)(() => ({
                        running: serverRunning.value,
                        stopped: !serverRunning.value,
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
                        try {
                            const result = await Editor.Message.request('cocos-mcp-server', 'get-server-status');
                            if (result) {
                                serverRunning.value = result.running;
                                serverStatus.value = result.running ? '运行中' : '已停止';
                                connectedClients.value = result.clients || 0;
                                httpUrl.value = result.running ? `http://127.0.0.1:${result.port}` : '';
                                if (result.settings) {
                                    isLoadingSettings = true;
                                    settings.value = {
                                        port: result.settings.port || constants_1.DEFAULT_MCP_PORT,
                                        autoStart: result.settings.autoStart || false,
                                        debugLog: result.settings.enableDebugLog || false,
                                        maxConnections: result.settings.maxConnections || 10,
                                    };
                                    settingsChanged.value = false;
                                    // nextTick 确保 watch 被跳过
                                    setTimeout(() => { isLoadingSettings = false; }, 0);
                                }
                            }
                        }
                        catch (error) {
                            console.error('[Vue App] Failed to refresh server status:', error);
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
                    // --- 分类折叠状态 (默认全部折叠) ---
                    const collapsedCategories = (0, vue_1.ref)(new Set());
                    // 初始化时全部折叠
                    (0, vue_1.watch)(sortedToolCategories, (cats) => {
                        const newSet = new Set();
                        cats.forEach((c) => newSet.add(c));
                        collapsedCategories.value = newSet;
                    }, { immediate: true });
                    const isCategoryCollapsed = (category) => {
                        return collapsedCategories.value.has(category);
                    };
                    const toggleCategoryCollapse = (category) => {
                        const newSet = new Set(collapsedCategories.value);
                        if (newSet.has(category)) {
                            newSet.delete(category);
                        }
                        else {
                            newSet.add(category);
                        }
                        collapsedCategories.value = newSet;
                    };
                    const expandAllCategories = () => {
                        collapsedCategories.value = new Set();
                    };
                    const collapseAllCategories = () => {
                        const newSet = new Set();
                        sortedToolCategories.value.forEach((c) => newSet.add(c));
                        collapsedCategories.value = newSet;
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
                        if (isLoadingSettings) {
                            return;
                        }
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
                        collapsedCategories,
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
                        isCategoryCollapsed,
                        toggleCategoryCollapse,
                        expandAllCategories,
                        collapseAllCategories,
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zb3VyY2UvcGFuZWwvZGVmYXVsdC9pbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUEsK0NBQStDOztBQUUvQyx1Q0FBd0M7QUFDeEMsK0JBQTRCO0FBQzVCLG9EQUF3RDtBQUN4RCxrREFBZ0U7QUFDaEUsMEVBQTRFO0FBRTVFLDZCQUFvRztBQUVwRyxNQUFNLFlBQVksR0FBRyxJQUFJLE9BQU8sRUFBWSxDQUFDO0FBc0I3QyxTQUFTLGdCQUFnQixDQUFDLFFBQXdCO0lBQzlDLE9BQU87UUFDSCxJQUFJLEVBQUUsTUFBTSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUM7UUFDM0IsU0FBUyxFQUFFLFFBQVEsQ0FBQyxTQUFTO1FBQzdCLGNBQWMsRUFBRSxRQUFRLENBQUMsUUFBUTtRQUNqQyxjQUFjLEVBQUUsQ0FBQyxHQUFHLENBQUM7UUFDckIsY0FBYyxFQUFFLE1BQU0sQ0FBQyxRQUFRLENBQUMsY0FBYyxDQUFDO0tBQ2xELENBQUM7QUFDTixDQUFDO0FBU0QsTUFBTSxDQUFDLE9BQU8sR0FBRyxNQUFNLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQztJQUNqQyxTQUFTLEVBQUU7UUFDUCxJQUFJOztZQUNBLE9BQU8sQ0FBQyxHQUFHLENBQUMseUJBQXlCLENBQUMsQ0FBQztZQUN2QyxLQUFLLENBQUEsTUFBQSxJQUFJLENBQUMsY0FBYyxvREFBSSxDQUFBLENBQUM7WUFDN0IsS0FBSyxDQUFBLE1BQUEsSUFBSSxDQUFDLGFBQWEsb0RBQUksQ0FBQSxDQUFDO1FBQ2hDLENBQUM7UUFDRCxJQUFJO1lBQ0EsT0FBTyxDQUFDLEdBQUcsQ0FBQywwQkFBMEIsQ0FBQyxDQUFDO1FBQzVDLENBQUM7S0FDSjtJQUNELFFBQVEsRUFBRSxJQUFBLHVCQUFZLEVBQUMsSUFBQSxXQUFJLEVBQUMsU0FBUyxFQUFFLDZDQUE2QyxDQUFDLEVBQUUsT0FBTyxDQUFDO0lBQy9GLEtB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QUFDO0lBQ0wsQ0FBQztDQUNKLENBQUMsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qIGVzbGludC1kaXNhYmxlIHZ1ZS9vbmUtY29tcG9uZW50LXBlci1maWxlICovXG5cbmltcG9ydCB7IHJlYWRGaWxlU3luYyB9IGZyb20gJ2ZzLWV4dHJhJztcbmltcG9ydCB7IGpvaW4gfSBmcm9tICdwYXRoJztcbmltcG9ydCB7IERFRkFVTFRfTUNQX1BPUlQgfSBmcm9tICcuLi8uLi9jb3JlL2NvbnN0YW50cyc7XG5pbXBvcnQgeyB2YWxpZGF0ZU1jcFNlcnZlclNldHRpbmdzIH0gZnJvbSAnLi4vLi4vY29yZS9zZXR0aW5ncyc7XG5pbXBvcnQgeyBCVUlMVElOX1RPT0xfQ0FURUdPUklFUyB9IGZyb20gJy4uLy4uL3JlZ2lzdHJ5L2J1aWx0aW4tY2F0ZWdvcmllcyc7XG5pbXBvcnQgeyBNQ1BTZXJ2ZXJTZXR0aW5ncyB9IGZyb20gJy4uLy4uL3R5cGVzJztcbmltcG9ydCB7IGNyZWF0ZUFwcCwgQXBwLCBkZWZpbmVDb21wb25lbnQsIHJlZiwgY29tcHV0ZWQsIG9uTW91bnRlZCwgb25Vbm1vdW50ZWQsIHdhdGNoIH0gZnJvbSAndnVlJztcblxuY29uc3QgcGFuZWxEYXRhTWFwID0gbmV3IFdlYWtNYXA8YW55LCBBcHA+KCk7XG5cbmludGVyZmFjZSBUb29sQ29uZmlnIHtcbiAgICBjYXRlZ29yeTogc3RyaW5nO1xuICAgIG5hbWU6IHN0cmluZztcbiAgICBlbmFibGVkOiBib29sZWFuO1xuICAgIGRlc2NyaXB0aW9uOiBzdHJpbmc7XG59XG5cbmludGVyZmFjZSBFeHRlcm5hbFByb3ZpZGVyU3VtbWFyeSB7XG4gICAgcHJvdmlkZXJJZDogc3RyaW5nO1xuICAgIG5hbWVzcGFjZTogc3RyaW5nO1xuICAgIHRvb2xzOiB7IG5hbWU6IHN0cmluZzsgZGVzY3JpcHRpb246IHN0cmluZyB9W107XG59XG5cbmludGVyZmFjZSBQYW5lbEhvc3Qge1xuICAgICQ6IHsgYXBwPzogSFRNTEVsZW1lbnQgfTtcbiAgICBfcmVmcmVzaFRvb2xzPzogKCkgPT4gdm9pZCB8IFByb21pc2U8dm9pZD47XG4gICAgX3JlZnJlc2hTdGF0dXM/OiAoKSA9PiB2b2lkIHwgUHJvbWlzZTx2b2lkPjtcbiAgICBfdG9vbHNCcm9hZGNhc3RVbnN1YnNjcmliZT86ICgpID0+IHZvaWQ7XG59XG5cbmZ1bmN0aW9uIGJ1aWxkTWNwU2V0dGluZ3Moc2V0dGluZ3M6IFNlcnZlclNldHRpbmdzKTogTUNQU2VydmVyU2V0dGluZ3Mge1xuICAgIHJldHVybiB7XG4gICAgICAgIHBvcnQ6IE51bWJlcihzZXR0aW5ncy5wb3J0KSxcbiAgICAgICAgYXV0b1N0YXJ0OiBzZXR0aW5ncy5hdXRvU3RhcnQsXG4gICAgICAgIGVuYWJsZURlYnVnTG9nOiBzZXR0aW5ncy5kZWJ1Z0xvZyxcbiAgICAgICAgYWxsb3dlZE9yaWdpbnM6IFsnKiddLFxuICAgICAgICBtYXhDb25uZWN0aW9uczogTnVtYmVyKHNldHRpbmdzLm1heENvbm5lY3Rpb25zKSxcbiAgICB9O1xufVxuXG5pbnRlcmZhY2UgU2VydmVyU2V0dGluZ3Mge1xuICAgIHBvcnQ6IG51bWJlcjtcbiAgICBhdXRvU3RhcnQ6IGJvb2xlYW47XG4gICAgZGVidWdMb2c6IGJvb2xlYW47XG4gICAgbWF4Q29ubmVjdGlvbnM6IG51bWJlcjtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBFZGl0b3IuUGFuZWwuZGVmaW5lKHtcbiAgICBsaXN0ZW5lcnM6IHtcbiAgICAgICAgc2hvdyh0aGlzOiBQYW5lbEhvc3QpIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdbTUNQIFBhbmVsXSBQYW5lbCBzaG93bicpO1xuICAgICAgICAgICAgdm9pZCB0aGlzLl9yZWZyZXNoU3RhdHVzPy4oKTtcbiAgICAgICAgICAgIHZvaWQgdGhpcy5fcmVmcmVzaFRvb2xzPy4oKTtcbiAgICAgICAgfSxcbiAgICAgICAgaGlkZSgpIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdbTUNQIFBhbmVsXSBQYW5lbCBoaWRkZW4nKTtcbiAgICAgICAgfSxcbiAgICB9LFxuICAgIHRlbXBsYXRlOiByZWFkRmlsZVN5bmMoam9pbihfX2Rpcm5hbWUsICcuLi8uLi8uLi9zdGF0aWMvdGVtcGxhdGUvZGVmYXVsdC9pbmRleC5odG1sJyksICd1dGYtOCcpLFxuICAgIHN0eWxlOiByZWFkRmlsZVN5bmMoam9pbihfX2Rpcm5hbWUsICcuLi8uLi8uLi9zdGF0aWMvc3R5bGUvZGVmYXVsdC9pbmRleC5jc3MnKSwgJ3V0Zi04JyksXG4gICAgJDoge1xuICAgICAgICBhcHA6ICcjYXBwJyxcbiAgICAgICAgcGFuZWxUaXRsZTogJyNwYW5lbFRpdGxlJyxcbiAgICB9LFxuICAgIHJlYWR5KHRoaXM6IFBhbmVsSG9zdCkge1xuICAgICAgICBjb25zdCBwYW5lbEhvc3QgPSB0aGlzO1xuXG4gICAgICAgIGlmICh0aGlzLiQuYXBwKSB7XG4gICAgICAgICAgICBjb25zdCBhcHAgPSBjcmVhdGVBcHAoe30pO1xuICAgICAgICAgICAgYXBwLmNvbmZpZy5jb21waWxlck9wdGlvbnMuaXNDdXN0b21FbGVtZW50ID0gKHRhZykgPT4gdGFnLnN0YXJ0c1dpdGgoJ3VpLScpO1xuXG4gICAgICAgICAgICBhcHAuY29tcG9uZW50KFxuICAgICAgICAgICAgICAgICdNY3BTZXJ2ZXJBcHAnLFxuICAgICAgICAgICAgICAgIGRlZmluZUNvbXBvbmVudCh7XG4gICAgICAgICAgICAgICAgICAgIHNldHVwKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgYWN0aXZlVGFiID0gcmVmKCdzZXJ2ZXInKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHNlcnZlclJ1bm5pbmcgPSByZWYoZmFsc2UpO1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3Qgc2VydmVyU3RhdHVzID0gcmVmKCflt7LlgZzmraInKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGNvbm5lY3RlZENsaWVudHMgPSByZWYoMCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBodHRwVXJsID0gcmVmKCcnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGlzUHJvY2Vzc2luZyA9IHJlZihmYWxzZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBzZXJ2ZXJBY3Rpb25FcnJvciA9IHJlZignJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBzZXR0aW5nc0ZlZWRiYWNrID0gcmVmKCcnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHNldHRpbmdzRmVlZGJhY2tLaW5kID0gcmVmPCdzdWNjZXNzJyB8ICdlcnJvcicgfCAnJz4oJycpO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBzZXR0aW5ncyA9IHJlZjxTZXJ2ZXJTZXR0aW5ncz4oe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBvcnQ6IERFRkFVTFRfTUNQX1BPUlQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYXV0b1N0YXJ0OiBmYWxzZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZWJ1Z0xvZzogZmFsc2UsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbWF4Q29ubmVjdGlvbnM6IDEwLFxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGF2YWlsYWJsZVRvb2xzID0gcmVmPFRvb2xDb25maWdbXT4oW10pO1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgdG9vbENhdGVnb3JpZXMgPSByZWY8c3RyaW5nW10+KFtdKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGV4dGVybmFsUHJvdmlkZXJzID0gcmVmPEV4dGVybmFsUHJvdmlkZXJTdW1tYXJ5W10+KFtdKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHNldHRpbmdzQ2hhbmdlZCA9IHJlZihmYWxzZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgaXNMb2FkaW5nU2V0dGluZ3MgPSBmYWxzZTsgLy8g6Ziy5q2i5LuO5pyN5Yqh5Zmo5Yqg6L296K6+572u5pe26K+v6KemIHNldHRpbmdzQ2hhbmdlZFxuXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBzdGF0dXNDbGFzcyA9IGNvbXB1dGVkKCgpID0+ICh7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcnVubmluZzogc2VydmVyUnVubmluZy52YWx1ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdG9wcGVkOiAhc2VydmVyUnVubmluZy52YWx1ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgdG90YWxUb29scyA9IGNvbXB1dGVkKCgpID0+IGF2YWlsYWJsZVRvb2xzLnZhbHVlLmxlbmd0aCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBlbmFibGVkVG9vbHMgPSBjb21wdXRlZCgoKSA9PiBhdmFpbGFibGVUb29scy52YWx1ZS5maWx0ZXIoKHQpID0+IHQuZW5hYmxlZCkubGVuZ3RoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGRpc2FibGVkVG9vbHMgPSBjb21wdXRlZCgoKSA9PiB0b3RhbFRvb2xzLnZhbHVlIC0gZW5hYmxlZFRvb2xzLnZhbHVlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGJ1aWx0aW5Ub29sQ291bnQgPSBjb21wdXRlZChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAoKSA9PiBhdmFpbGFibGVUb29scy52YWx1ZS5maWx0ZXIoKHQpID0+IEJVSUxUSU5fVE9PTF9DQVRFR09SSUVTLmhhcyh0LmNhdGVnb3J5KSkubGVuZ3RoXG4gICAgICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgZXh0ZXJuYWxUb29sQ291bnQgPSBjb21wdXRlZCgoKSA9PiB0b3RhbFRvb2xzLnZhbHVlIC0gYnVpbHRpblRvb2xDb3VudC52YWx1ZSk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHNvcnRlZFRvb2xDYXRlZ29yaWVzID0gY29tcHV0ZWQoKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGJ1aWx0aW5zID0gdG9vbENhdGVnb3JpZXMudmFsdWVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLmZpbHRlcigoYykgPT4gQlVJTFRJTl9UT09MX0NBVEVHT1JJRVMuaGFzKGMpKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAuc29ydCgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGV4dGVybmFsID0gdG9vbENhdGVnb3JpZXMudmFsdWVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLmZpbHRlcigoYykgPT4gIUJVSUxUSU5fVE9PTF9DQVRFR09SSUVTLmhhcyhjKSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLnNvcnQoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gWy4uLmJ1aWx0aW5zLCAuLi5leHRlcm5hbF07XG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3Qgc2V0dGluZ3NWYWxpZGF0aW9uRXJyb3IgPSBjb21wdXRlZCgoKSA9PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhbGlkYXRlTWNwU2VydmVyU2V0dGluZ3MoYnVpbGRNY3BTZXR0aW5ncyhzZXR0aW5ncy52YWx1ZSkpXG4gICAgICAgICAgICAgICAgICAgICAgICApO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBzZXJ2ZXJUb2dnbGVMYWJlbCA9IGNvbXB1dGVkKCgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoaXNQcm9jZXNzaW5nLnZhbHVlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBzZXJ2ZXJSdW5uaW5nLnZhbHVlID8gJ+ato+WcqOWBnOatouKApicgOiAn5q2j5Zyo5ZCv5Yqo4oCmJztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHNlcnZlclJ1bm5pbmcudmFsdWUgPyAn5YGc5q2i5pyN5Yqh5ZmoJyA6ICflkK/liqjmnI3liqHlmagnO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGlzRXh0ZXJuYWxDYXRlZ29yeSA9IChjYXRlZ29yeTogc3RyaW5nKSA9PiAhQlVJTFRJTl9UT09MX0NBVEVHT1JJRVMuaGFzKGNhdGVnb3J5KTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgcmVmcmVzaFNlcnZlclN0YXR1cyA9IGFzeW5jICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBFZGl0b3IuTWVzc2FnZS5yZXF1ZXN0KCdjb2Nvcy1tY3Atc2VydmVyJywgJ2dldC1zZXJ2ZXItc3RhdHVzJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChyZXN1bHQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNlcnZlclJ1bm5pbmcudmFsdWUgPSByZXN1bHQucnVubmluZztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNlcnZlclN0YXR1cy52YWx1ZSA9IHJlc3VsdC5ydW5uaW5nID8gJ+i/kOihjOS4rScgOiAn5bey5YGc5q2iJztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbm5lY3RlZENsaWVudHMudmFsdWUgPSByZXN1bHQuY2xpZW50cyB8fCAwO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaHR0cFVybC52YWx1ZSA9IHJlc3VsdC5ydW5uaW5nID8gYGh0dHA6Ly8xMjcuMC4wLjE6JHtyZXN1bHQucG9ydH1gIDogJyc7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAocmVzdWx0LnNldHRpbmdzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaXNMb2FkaW5nU2V0dGluZ3MgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNldHRpbmdzLnZhbHVlID0ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwb3J0OiByZXN1bHQuc2V0dGluZ3MucG9ydCB8fCBERUZBVUxUX01DUF9QT1JULFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhdXRvU3RhcnQ6IHJlc3VsdC5zZXR0aW5ncy5hdXRvU3RhcnQgfHwgZmFsc2UsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlYnVnTG9nOiByZXN1bHQuc2V0dGluZ3MuZW5hYmxlRGVidWdMb2cgfHwgZmFsc2UsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1heENvbm5lY3Rpb25zOiByZXN1bHQuc2V0dGluZ3MubWF4Q29ubmVjdGlvbnMgfHwgMTAsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZXR0aW5nc0NoYW5nZWQudmFsdWUgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBuZXh0VGljayDnoa7kv50gd2F0Y2gg6KKr6Lez6L+HXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7IGlzTG9hZGluZ1NldHRpbmdzID0gZmFsc2U7IH0sIDApO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcignW1Z1ZSBBcHBdIEZhaWxlZCB0byByZWZyZXNoIHNlcnZlciBzdGF0dXM6JywgZXJyb3IpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGxvYWRFeHRlcm5hbFN1bW1hcnkgPSBhc3luYyAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgRWRpdG9yLk1lc3NhZ2UucmVxdWVzdChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICdjb2Nvcy1tY3Atc2VydmVyJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICdtY3AtbGlzdC1leHRlcm5hbC10b29scydcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZXh0ZXJuYWxQcm92aWRlcnMudmFsdWUgPSByZXN1bHQ/LnByb3ZpZGVycyA/PyBbXTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKCdbVnVlIEFwcF0gRmFpbGVkIHRvIGxvYWQgZXh0ZXJuYWwgdG9vbHMgc3VtbWFyeTonLCBlcnJvcik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGV4dGVybmFsUHJvdmlkZXJzLnZhbHVlID0gW107XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgbG9hZFRvb2xNYW5hZ2VyU3RhdGUgPSBhc3luYyAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgRWRpdG9yLk1lc3NhZ2UucmVxdWVzdChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICdjb2Nvcy1tY3Atc2VydmVyJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICdnZXRUb29sTWFuYWdlclN0YXRlJ1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAocmVzdWx0ICYmIHJlc3VsdC5zdWNjZXNzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhdmFpbGFibGVUb29scy52YWx1ZSA9IHJlc3VsdC5hdmFpbGFibGVUb29scyB8fCBbXTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGNhdGVnb3JpZXMgPSBuZXcgU2V0KGF2YWlsYWJsZVRvb2xzLnZhbHVlLm1hcCgodG9vbCkgPT4gdG9vbC5jYXRlZ29yeSkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdG9vbENhdGVnb3JpZXMudmFsdWUgPSBBcnJheS5mcm9tKGNhdGVnb3JpZXMpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGF3YWl0IGxvYWRFeHRlcm5hbFN1bW1hcnkoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKCdbVnVlIEFwcF0gRmFpbGVkIHRvIGxvYWQgdG9vbCBtYW5hZ2VyIHN0YXRlOicsIGVycm9yKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAgICAgICAgICAgICBwYW5lbEhvc3QuX3JlZnJlc2hUb29scyA9IGxvYWRUb29sTWFuYWdlclN0YXRlO1xuICAgICAgICAgICAgICAgICAgICAgICAgcGFuZWxIb3N0Ll9yZWZyZXNoU3RhdHVzID0gcmVmcmVzaFNlcnZlclN0YXR1cztcblxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3Qgc3dpdGNoVGFiID0gKHRhYk5hbWU6IHN0cmluZykgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFjdGl2ZVRhYi52YWx1ZSA9IHRhYk5hbWU7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHRhYk5hbWUgPT09ICd0b29scycpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdm9pZCBsb2FkVG9vbE1hbmFnZXJTdGF0ZSgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHRvZ2dsZVNlcnZlciA9IGFzeW5jICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoaXNQcm9jZXNzaW5nLnZhbHVlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaXNQcm9jZXNzaW5nLnZhbHVlID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZXJ2ZXJBY3Rpb25FcnJvci52YWx1ZSA9ICcnO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChzZXJ2ZXJSdW5uaW5nLnZhbHVlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhd2FpdCBFZGl0b3IuTWVzc2FnZS5yZXF1ZXN0KCdjb2Nvcy1tY3Atc2VydmVyJywgJ3N0b3Atc2VydmVyJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCB2YWxpZGF0aW9uRXJyb3IgPSB2YWxpZGF0ZU1jcFNlcnZlclNldHRpbmdzKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJ1aWxkTWNwU2V0dGluZ3Moc2V0dGluZ3MudmFsdWUpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHZhbGlkYXRpb25FcnJvcikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNlcnZlckFjdGlvbkVycm9yLnZhbHVlID0gdmFsaWRhdGlvbkVycm9yO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGF3YWl0IEVkaXRvci5NZXNzYWdlLnJlcXVlc3QoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ2NvY29zLW1jcC1zZXJ2ZXInLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICd1cGRhdGUtc2V0dGluZ3MnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJ1aWxkTWNwU2V0dGluZ3Moc2V0dGluZ3MudmFsdWUpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXdhaXQgRWRpdG9yLk1lc3NhZ2UucmVxdWVzdCgnY29jb3MtbWNwLXNlcnZlcicsICdzdGFydC1zZXJ2ZXInKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhd2FpdCByZWZyZXNoU2VydmVyU3RhdHVzKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBjYXRjaCAoZXJyb3I6IGFueSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZXJ2ZXJBY3Rpb25FcnJvci52YWx1ZSA9IGVycm9yPy5tZXNzYWdlIHx8IFN0cmluZyhlcnJvcik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBmaW5hbGx5IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaXNQcm9jZXNzaW5nLnZhbHVlID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3Qgc2F2ZVNldHRpbmdzID0gYXN5bmMgKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNldHRpbmdzRmVlZGJhY2sudmFsdWUgPSAnJztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZXR0aW5nc0ZlZWRiYWNrS2luZC52YWx1ZSA9ICcnO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHZhbGlkYXRpb25FcnJvciA9IHZhbGlkYXRlTWNwU2VydmVyU2V0dGluZ3MoYnVpbGRNY3BTZXR0aW5ncyhzZXR0aW5ncy52YWx1ZSkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICh2YWxpZGF0aW9uRXJyb3IpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2V0dGluZ3NGZWVkYmFjay52YWx1ZSA9IHZhbGlkYXRpb25FcnJvcjtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2V0dGluZ3NGZWVkYmFja0tpbmQudmFsdWUgPSAnZXJyb3InO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlzUHJvY2Vzc2luZy52YWx1ZSA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGF3YWl0IEVkaXRvci5NZXNzYWdlLnJlcXVlc3QoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnY29jb3MtbWNwLXNlcnZlcicsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAndXBkYXRlLXNldHRpbmdzJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJ1aWxkTWNwU2V0dGluZ3Moc2V0dGluZ3MudmFsdWUpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNldHRpbmdzQ2hhbmdlZC52YWx1ZSA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZXR0aW5nc0ZlZWRiYWNrLnZhbHVlID0gJ+iuvue9ruW3suS/neWtmCc7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNldHRpbmdzRmVlZGJhY2tLaW5kLnZhbHVlID0gJ3N1Y2Nlc3MnO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhd2FpdCByZWZyZXNoU2VydmVyU3RhdHVzKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBjYXRjaCAoZXJyb3I6IGFueSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZXR0aW5nc0ZlZWRiYWNrLnZhbHVlID0gZXJyb3I/Lm1lc3NhZ2UgfHwgJ+S/neWtmOiuvue9ruWksei0pSc7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNldHRpbmdzRmVlZGJhY2tLaW5kLnZhbHVlID0gJ2Vycm9yJztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGZpbmFsbHkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpc1Byb2Nlc3NpbmcudmFsdWUgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBjb3B5VXJsID0gYXN5bmMgKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGF3YWl0IG5hdmlnYXRvci5jbGlwYm9hcmQud3JpdGVUZXh0KGh0dHBVcmwudmFsdWUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZXR0aW5nc0ZlZWRiYWNrLnZhbHVlID0gJ0hUVFAg5Zyw5Z2A5bey5aSN5Yi2JztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2V0dGluZ3NGZWVkYmFja0tpbmQudmFsdWUgPSAnc3VjY2Vzcyc7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcignW1Z1ZSBBcHBdIEZhaWxlZCB0byBjb3B5IFVSTDonLCBlcnJvcik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgdXBkYXRlVG9vbFN0YXR1cyA9IGFzeW5jIChjYXRlZ29yeTogc3RyaW5nLCBuYW1lOiBzdHJpbmcsIGVuYWJsZWQ6IGJvb2xlYW4pID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCB0b29sSW5kZXggPSBhdmFpbGFibGVUb29scy52YWx1ZS5maW5kSW5kZXgoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICh0KSA9PiB0LmNhdGVnb3J5ID09PSBjYXRlZ29yeSAmJiB0Lm5hbWUgPT09IG5hbWVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICh0b29sSW5kZXggPT09IC0xKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgcHJldmlvdXMgPSBhdmFpbGFibGVUb29scy52YWx1ZVt0b29sSW5kZXhdLmVuYWJsZWQ7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYXZhaWxhYmxlVG9vbHMudmFsdWVbdG9vbEluZGV4XS5lbmFibGVkID0gZW5hYmxlZDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhdmFpbGFibGVUb29scy52YWx1ZSA9IFsuLi5hdmFpbGFibGVUb29scy52YWx1ZV07XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgRWRpdG9yLk1lc3NhZ2UucmVxdWVzdChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICdjb2Nvcy1tY3Atc2VydmVyJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICd1cGRhdGVUb29sU3RhdHVzJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhdGVnb3J5LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmFtZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVuYWJsZWRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCFyZXN1bHQgfHwgIXJlc3VsdC5zdWNjZXNzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhdmFpbGFibGVUb29scy52YWx1ZVt0b29sSW5kZXhdLmVuYWJsZWQgPSBwcmV2aW91cztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGF2YWlsYWJsZVRvb2xzLnZhbHVlID0gWy4uLmF2YWlsYWJsZVRvb2xzLnZhbHVlXTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGF2YWlsYWJsZVRvb2xzLnZhbHVlW3Rvb2xJbmRleF0uZW5hYmxlZCA9IHByZXZpb3VzO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhdmFpbGFibGVUb29scy52YWx1ZSA9IFsuLi5hdmFpbGFibGVUb29scy52YWx1ZV07XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ1tWdWUgQXBwXSBGYWlsZWQgdG8gdXBkYXRlIHRvb2wgc3RhdHVzOicsIGVycm9yKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBzYXZlQ2hhbmdlcyA9IGFzeW5jICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCB1cGRhdGVzID0gYXZhaWxhYmxlVG9vbHMudmFsdWUubWFwKCh0b29sKSA9PiAoe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYXRlZ29yeTogU3RyaW5nKHRvb2wuY2F0ZWdvcnkpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuYW1lOiBTdHJpbmcodG9vbC5uYW1lKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZW5hYmxlZDogQm9vbGVhbih0b29sLmVuYWJsZWQpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhd2FpdCBFZGl0b3IuTWVzc2FnZS5yZXF1ZXN0KCdjb2Nvcy1tY3Atc2VydmVyJywgJ3VwZGF0ZVRvb2xTdGF0dXNCYXRjaCcsIHVwZGF0ZXMpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3Qgc2VsZWN0QWxsVG9vbHMgPSBhc3luYyAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYXZhaWxhYmxlVG9vbHMudmFsdWUuZm9yRWFjaCgodG9vbCkgPT4gKHRvb2wuZW5hYmxlZCA9IHRydWUpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhd2FpdCBzYXZlQ2hhbmdlcygpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgZGVzZWxlY3RBbGxUb29scyA9IGFzeW5jICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhdmFpbGFibGVUb29scy52YWx1ZS5mb3JFYWNoKCh0b29sKSA9PiAodG9vbC5lbmFibGVkID0gZmFsc2UpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhd2FpdCBzYXZlQ2hhbmdlcygpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgdG9nZ2xlQ2F0ZWdvcnlUb29scyA9IGFzeW5jIChjYXRlZ29yeTogc3RyaW5nLCBlbmFibGVkOiBib29sZWFuKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYXZhaWxhYmxlVG9vbHMudmFsdWUuZm9yRWFjaCgodG9vbCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAodG9vbC5jYXRlZ29yeSA9PT0gY2F0ZWdvcnkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRvb2wuZW5hYmxlZCA9IGVuYWJsZWQ7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhd2FpdCBzYXZlQ2hhbmdlcygpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgZ2V0VG9vbHNCeUNhdGVnb3J5ID0gKGNhdGVnb3J5OiBzdHJpbmcpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gYXZhaWxhYmxlVG9vbHMudmFsdWUuZmlsdGVyKCh0b29sKSA9PiB0b29sLmNhdGVnb3J5ID09PSBjYXRlZ29yeSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyAtLS0g5YiG57G75oqY5Y+g54q25oCBICjpu5jorqTlhajpg6jmipjlj6ApIC0tLVxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgY29sbGFwc2VkQ2F0ZWdvcmllcyA9IHJlZjxTZXQ8c3RyaW5nPj4obmV3IFNldCgpKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgLy8g5Yid5aeL5YyW5pe25YWo6YOo5oqY5Y+gXG4gICAgICAgICAgICAgICAgICAgICAgICB3YXRjaChzb3J0ZWRUb29sQ2F0ZWdvcmllcywgKGNhdHMpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBuZXdTZXQgPSBuZXcgU2V0PHN0cmluZz4oKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYXRzLmZvckVhY2goKGMpID0+IG5ld1NldC5hZGQoYykpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbGxhcHNlZENhdGVnb3JpZXMudmFsdWUgPSBuZXdTZXQ7XG4gICAgICAgICAgICAgICAgICAgICAgICB9LCB7IGltbWVkaWF0ZTogdHJ1ZSB9KTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgaXNDYXRlZ29yeUNvbGxhcHNlZCA9IChjYXRlZ29yeTogc3RyaW5nKTogYm9vbGVhbiA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGNvbGxhcHNlZENhdGVnb3JpZXMudmFsdWUuaGFzKGNhdGVnb3J5KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHRvZ2dsZUNhdGVnb3J5Q29sbGFwc2UgPSAoY2F0ZWdvcnk6IHN0cmluZykgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IG5ld1NldCA9IG5ldyBTZXQoY29sbGFwc2VkQ2F0ZWdvcmllcy52YWx1ZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKG5ld1NldC5oYXMoY2F0ZWdvcnkpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5ld1NldC5kZWxldGUoY2F0ZWdvcnkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5ld1NldC5hZGQoY2F0ZWdvcnkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb2xsYXBzZWRDYXRlZ29yaWVzLnZhbHVlID0gbmV3U2V0O1xuICAgICAgICAgICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgZXhwYW5kQWxsQ2F0ZWdvcmllcyA9ICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb2xsYXBzZWRDYXRlZ29yaWVzLnZhbHVlID0gbmV3IFNldCgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgY29sbGFwc2VBbGxDYXRlZ29yaWVzID0gKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IG5ld1NldCA9IG5ldyBTZXQ8c3RyaW5nPigpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNvcnRlZFRvb2xDYXRlZ29yaWVzLnZhbHVlLmZvckVhY2goKGMpID0+IG5ld1NldC5hZGQoYykpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbGxhcHNlZENhdGVnb3JpZXMudmFsdWUgPSBuZXdTZXQ7XG4gICAgICAgICAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBnZXRDYXRlZ29yeURpc3BsYXlOYW1lID0gKGNhdGVnb3J5OiBzdHJpbmcpOiBzdHJpbmcgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChpc0V4dGVybmFsQ2F0ZWdvcnkoY2F0ZWdvcnkpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBg5aSW6YOoIMK3ICR7Y2F0ZWdvcnl9YDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgY2F0ZWdvcnlOYW1lczogeyBba2V5OiBzdHJpbmddOiBzdHJpbmcgfSA9IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2NlbmU6ICflnLrmma/lt6XlhbcnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBub2RlOiAn6IqC54K55bel5YW3JyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29tcG9uZW50OiAn57uE5Lu25bel5YW3JyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcHJlZmFiOiAn6aKE5Yi25L2T5bel5YW3JyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcHJvamVjdDogJ+mhueebruW3peWFtycsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlYnVnOiAn6LCD6K+V5bel5YW3JyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcHJlZmVyZW5jZXM6ICflgY/lpb3orr7nva7lt6XlhbcnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZXJ2ZXI6ICfmnI3liqHlmajlt6XlhbcnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBicm9hZGNhc3Q6ICflub/mkq3lt6XlhbcnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzY2VuZUFkdmFuY2VkOiAn6auY57qn5Zy65pmv5bel5YW3JyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2NlbmVWaWV3OiAn5Zy65pmv6KeG5Zu+5bel5YW3JyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVmZXJlbmNlSW1hZ2U6ICflj4LogIPlm77niYflt6XlhbcnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhc3NldEFkdmFuY2VkOiAn6auY57qn6LWE5rqQ5bel5YW3JyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsaWRhdGlvbjogJ+mqjOivgeW3peWFtycsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gY2F0ZWdvcnlOYW1lc1tjYXRlZ29yeV0gfHwgY2F0ZWdvcnk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAgICAgICAgICAgICB3YXRjaChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZXR0aW5ncyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChpc0xvYWRpbmdTZXR0aW5ncykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNldHRpbmdzQ2hhbmdlZC52YWx1ZSA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChzZXR0aW5nc0ZlZWRiYWNrS2luZC52YWx1ZSA9PT0gJ3N1Y2Nlc3MnKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZXR0aW5nc0ZlZWRiYWNrLnZhbHVlID0gJyc7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZXR0aW5nc0ZlZWRiYWNrS2luZC52YWx1ZSA9ICcnO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB7IGRlZXA6IHRydWUgfVxuICAgICAgICAgICAgICAgICAgICAgICAgKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IHN0YXR1c1BvbGxUaW1lcjogUmV0dXJuVHlwZTx0eXBlb2Ygc2V0SW50ZXJ2YWw+IHwgbnVsbCA9IG51bGw7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIG9uTW91bnRlZChhc3luYyAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYXdhaXQgbG9hZFRvb2xNYW5hZ2VyU3RhdGUoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhd2FpdCByZWZyZXNoU2VydmVyU3RhdHVzKCk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdGF0dXNQb2xsVGltZXIgPSBzZXRJbnRlcnZhbCgoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChhY3RpdmVUYWIudmFsdWUgPT09ICdzZXJ2ZXInICYmICFpc1Byb2Nlc3NpbmcudmFsdWUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZvaWQgcmVmcmVzaFNlcnZlclN0YXR1cygpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSwgMzAwMCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgb25Vbm1vdW50ZWQoKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChzdGF0dXNQb2xsVGltZXIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2xlYXJJbnRlcnZhbChzdGF0dXNQb2xsVGltZXIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdGF0dXNQb2xsVGltZXIgPSBudWxsO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYW5lbEhvc3QuX3JlZnJlc2hUb29scyA9IHVuZGVmaW5lZDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYW5lbEhvc3QuX3JlZnJlc2hTdGF0dXMgPSB1bmRlZmluZWQ7XG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhY3RpdmVUYWIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2VydmVyUnVubmluZyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZXJ2ZXJTdGF0dXMsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29ubmVjdGVkQ2xpZW50cyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBodHRwVXJsLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlzUHJvY2Vzc2luZyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZXJ2ZXJBY3Rpb25FcnJvcixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZXR0aW5nc0ZlZWRiYWNrLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNldHRpbmdzRmVlZGJhY2tLaW5kLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNldHRpbmdzLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGF2YWlsYWJsZVRvb2xzLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRvb2xDYXRlZ29yaWVzLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNvcnRlZFRvb2xDYXRlZ29yaWVzLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGV4dGVybmFsUHJvdmlkZXJzLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNldHRpbmdzQ2hhbmdlZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZXR0aW5nc1ZhbGlkYXRpb25FcnJvcixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZXJ2ZXJUb2dnbGVMYWJlbCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdGF0dXNDbGFzcyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0b3RhbFRvb2xzLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVuYWJsZWRUb29scyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkaXNhYmxlZFRvb2xzLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJ1aWx0aW5Ub29sQ291bnQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZXh0ZXJuYWxUb29sQ291bnQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29sbGFwc2VkQ2F0ZWdvcmllcyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzd2l0Y2hUYWIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdG9nZ2xlU2VydmVyLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNhdmVTZXR0aW5ncyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb3B5VXJsLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxvYWRUb29sTWFuYWdlclN0YXRlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHVwZGF0ZVRvb2xTdGF0dXMsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2VsZWN0QWxsVG9vbHMsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVzZWxlY3RBbGxUb29scyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzYXZlQ2hhbmdlcyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0b2dnbGVDYXRlZ29yeVRvb2xzLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGdldFRvb2xzQnlDYXRlZ29yeSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBnZXRDYXRlZ29yeURpc3BsYXlOYW1lLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlzRXh0ZXJuYWxDYXRlZ29yeSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpc0NhdGVnb3J5Q29sbGFwc2VkLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRvZ2dsZUNhdGVnb3J5Q29sbGFwc2UsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZXhwYW5kQWxsQ2F0ZWdvcmllcyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb2xsYXBzZUFsbENhdGVnb3JpZXMsXG4gICAgICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICB0ZW1wbGF0ZTogcmVhZEZpbGVTeW5jKFxuICAgICAgICAgICAgICAgICAgICAgICAgam9pbihfX2Rpcm5hbWUsICcuLi8uLi8uLi9zdGF0aWMvdGVtcGxhdGUvdnVlL21jcC1zZXJ2ZXItYXBwLmh0bWwnKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICd1dGYtOCdcbiAgICAgICAgICAgICAgICAgICAgKSxcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgKTtcblxuICAgICAgICAgICAgYXBwLm1vdW50KHRoaXMuJC5hcHApO1xuICAgICAgICAgICAgcGFuZWxEYXRhTWFwLnNldCh0aGlzLCBhcHApO1xuXG4gICAgICAgICAgICBjb25zdCBhZGRCcm9hZGNhc3RMaXN0ZW5lciA9IChcbiAgICAgICAgICAgICAgICBFZGl0b3IuTWVzc2FnZSBhcyB7IGFkZEJyb2FkY2FzdExpc3RlbmVyPzogKG5hbWU6IHN0cmluZywgY2I6ICgpID0+IHZvaWQpID0+ICgpID0+IHZvaWQgfVxuICAgICAgICAgICAgKS5hZGRCcm9hZGNhc3RMaXN0ZW5lcjtcbiAgICAgICAgICAgIGlmICh0eXBlb2YgYWRkQnJvYWRjYXN0TGlzdGVuZXIgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgICAgICBwYW5lbEhvc3QuX3Rvb2xzQnJvYWRjYXN0VW5zdWJzY3JpYmUgPSBhZGRCcm9hZGNhc3RMaXN0ZW5lci5jYWxsKFxuICAgICAgICAgICAgICAgICAgICBFZGl0b3IuTWVzc2FnZSxcbiAgICAgICAgICAgICAgICAgICAgJ21jcC10b29scy1jaGFuZ2VkJyxcbiAgICAgICAgICAgICAgICAgICAgKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgdm9pZCBwYW5lbEhvc3QuX3JlZnJlc2hUb29scz8uKCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBjb25zb2xlLmxvZygnW01DUCBQYW5lbF0gVnVlMyBhcHAgbW91bnRlZCBzdWNjZXNzZnVsbHknKTtcbiAgICAgICAgfVxuICAgIH0sXG4gICAgYmVmb3JlQ2xvc2UodGhpczogUGFuZWxIb3N0KSB7XG4gICAgICAgIGlmICh0eXBlb2YgdGhpcy5fdG9vbHNCcm9hZGNhc3RVbnN1YnNjcmliZSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgdGhpcy5fdG9vbHNCcm9hZGNhc3RVbnN1YnNjcmliZSgpO1xuICAgICAgICB9XG4gICAgfSxcbiAgICBjbG9zZSgpIHtcbiAgICAgICAgY29uc3QgYXBwID0gcGFuZWxEYXRhTWFwLmdldCh0aGlzKTtcbiAgICAgICAgaWYgKGFwcCkge1xuICAgICAgICAgICAgYXBwLnVubW91bnQoKTtcbiAgICAgICAgfVxuICAgIH0sXG59KTtcbiJdfQ==