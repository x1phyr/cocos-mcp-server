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
                                // 仅在用户未修改设置时，才从服务端同步设置（避免覆盖用户未保存的修改）
                                if (result.settings && !settingsChanged.value) {
                                    isLoadingSettings = true;
                                    settings.value = {
                                        port: result.settings.port || constants_1.DEFAULT_MCP_PORT,
                                        autoStart: result.settings.autoStart || false,
                                        debugLog: result.settings.enableDebugLog || false,
                                        maxConnections: result.settings.maxConnections || 10,
                                    };
                                    settingsChanged.value = false;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zb3VyY2UvcGFuZWwvZGVmYXVsdC9pbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUEsK0NBQStDOztBQUUvQyx1Q0FBd0M7QUFDeEMsK0JBQTRCO0FBQzVCLG9EQUF3RDtBQUN4RCxrREFBZ0U7QUFDaEUsMEVBQTRFO0FBRTVFLDZCQUFvRztBQUVwRyxNQUFNLFlBQVksR0FBRyxJQUFJLE9BQU8sRUFBWSxDQUFDO0FBc0I3QyxTQUFTLGdCQUFnQixDQUFDLFFBQXdCO0lBQzlDLE9BQU87UUFDSCxJQUFJLEVBQUUsTUFBTSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUM7UUFDM0IsU0FBUyxFQUFFLFFBQVEsQ0FBQyxTQUFTO1FBQzdCLGNBQWMsRUFBRSxRQUFRLENBQUMsUUFBUTtRQUNqQyxjQUFjLEVBQUUsQ0FBQyxHQUFHLENBQUM7UUFDckIsY0FBYyxFQUFFLE1BQU0sQ0FBQyxRQUFRLENBQUMsY0FBYyxDQUFDO0tBQ2xELENBQUM7QUFDTixDQUFDO0FBU0QsTUFBTSxDQUFDLE9BQU8sR0FBRyxNQUFNLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQztJQUNqQyxTQUFTLEVBQUU7UUFDUCxJQUFJOztZQUNBLE9BQU8sQ0FBQyxHQUFHLENBQUMseUJBQXlCLENBQUMsQ0FBQztZQUN2QyxLQUFLLENBQUEsTUFBQSxJQUFJLENBQUMsY0FBYyxvREFBSSxDQUFBLENBQUM7WUFDN0IsS0FBSyxDQUFBLE1BQUEsSUFBSSxDQUFDLGFBQWEsb0RBQUksQ0FBQSxDQUFDO1FBQ2hDLENBQUM7UUFDRCxJQUFJO1lBQ0EsT0FBTyxDQUFDLEdBQUcsQ0FBQywwQkFBMEIsQ0FBQyxDQUFDO1FBQzVDLENBQUM7S0FDSjtJQUNELFFBQVEsRUFBRSxJQUFBLHVCQUFZLEVBQUMsSUFBQSxXQUFJLEVBQUMsU0FBUyxFQUFFLDZDQUE2QyxDQUFDLEVBQUUsT0FBTyxDQUFDO0lBQy9GLEtB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QUMsT0FBTyxFQUFFLENBQUM7UUFDbEIsQ0FBQztJQUNMLENBQUM7Q0FDSixDQUFDLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKiBlc2xpbnQtZGlzYWJsZSB2dWUvb25lLWNvbXBvbmVudC1wZXItZmlsZSAqL1xuXG5pbXBvcnQgeyByZWFkRmlsZVN5bmMgfSBmcm9tICdmcy1leHRyYSc7XG5pbXBvcnQgeyBqb2luIH0gZnJvbSAncGF0aCc7XG5pbXBvcnQgeyBERUZBVUxUX01DUF9QT1JUIH0gZnJvbSAnLi4vLi4vY29yZS9jb25zdGFudHMnO1xuaW1wb3J0IHsgdmFsaWRhdGVNY3BTZXJ2ZXJTZXR0aW5ncyB9IGZyb20gJy4uLy4uL2NvcmUvc2V0dGluZ3MnO1xuaW1wb3J0IHsgQlVJTFRJTl9UT09MX0NBVEVHT1JJRVMgfSBmcm9tICcuLi8uLi9yZWdpc3RyeS9idWlsdGluLWNhdGVnb3JpZXMnO1xuaW1wb3J0IHsgTUNQU2VydmVyU2V0dGluZ3MgfSBmcm9tICcuLi8uLi90eXBlcyc7XG5pbXBvcnQgeyBjcmVhdGVBcHAsIEFwcCwgZGVmaW5lQ29tcG9uZW50LCByZWYsIGNvbXB1dGVkLCBvbk1vdW50ZWQsIG9uVW5tb3VudGVkLCB3YXRjaCB9IGZyb20gJ3Z1ZSc7XG5cbmNvbnN0IHBhbmVsRGF0YU1hcCA9IG5ldyBXZWFrTWFwPGFueSwgQXBwPigpO1xuXG5pbnRlcmZhY2UgVG9vbENvbmZpZyB7XG4gICAgY2F0ZWdvcnk6IHN0cmluZztcbiAgICBuYW1lOiBzdHJpbmc7XG4gICAgZW5hYmxlZDogYm9vbGVhbjtcbiAgICBkZXNjcmlwdGlvbjogc3RyaW5nO1xufVxuXG5pbnRlcmZhY2UgRXh0ZXJuYWxQcm92aWRlclN1bW1hcnkge1xuICAgIHByb3ZpZGVySWQ6IHN0cmluZztcbiAgICBuYW1lc3BhY2U6IHN0cmluZztcbiAgICB0b29sczogeyBuYW1lOiBzdHJpbmc7IGRlc2NyaXB0aW9uOiBzdHJpbmcgfVtdO1xufVxuXG5pbnRlcmZhY2UgUGFuZWxIb3N0IHtcbiAgICAkOiB7IGFwcD86IEhUTUxFbGVtZW50IH07XG4gICAgX3JlZnJlc2hUb29scz86ICgpID0+IHZvaWQgfCBQcm9taXNlPHZvaWQ+O1xuICAgIF9yZWZyZXNoU3RhdHVzPzogKCkgPT4gdm9pZCB8IFByb21pc2U8dm9pZD47XG4gICAgX3Rvb2xzQnJvYWRjYXN0VW5zdWJzY3JpYmU/OiAoKSA9PiB2b2lkO1xufVxuXG5mdW5jdGlvbiBidWlsZE1jcFNldHRpbmdzKHNldHRpbmdzOiBTZXJ2ZXJTZXR0aW5ncyk6IE1DUFNlcnZlclNldHRpbmdzIHtcbiAgICByZXR1cm4ge1xuICAgICAgICBwb3J0OiBOdW1iZXIoc2V0dGluZ3MucG9ydCksXG4gICAgICAgIGF1dG9TdGFydDogc2V0dGluZ3MuYXV0b1N0YXJ0LFxuICAgICAgICBlbmFibGVEZWJ1Z0xvZzogc2V0dGluZ3MuZGVidWdMb2csXG4gICAgICAgIGFsbG93ZWRPcmlnaW5zOiBbJyonXSxcbiAgICAgICAgbWF4Q29ubmVjdGlvbnM6IE51bWJlcihzZXR0aW5ncy5tYXhDb25uZWN0aW9ucyksXG4gICAgfTtcbn1cblxuaW50ZXJmYWNlIFNlcnZlclNldHRpbmdzIHtcbiAgICBwb3J0OiBudW1iZXI7XG4gICAgYXV0b1N0YXJ0OiBib29sZWFuO1xuICAgIGRlYnVnTG9nOiBib29sZWFuO1xuICAgIG1heENvbm5lY3Rpb25zOiBudW1iZXI7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gRWRpdG9yLlBhbmVsLmRlZmluZSh7XG4gICAgbGlzdGVuZXJzOiB7XG4gICAgICAgIHNob3codGhpczogUGFuZWxIb3N0KSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZygnW01DUCBQYW5lbF0gUGFuZWwgc2hvd24nKTtcbiAgICAgICAgICAgIHZvaWQgdGhpcy5fcmVmcmVzaFN0YXR1cz8uKCk7XG4gICAgICAgICAgICB2b2lkIHRoaXMuX3JlZnJlc2hUb29scz8uKCk7XG4gICAgICAgIH0sXG4gICAgICAgIGhpZGUoKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZygnW01DUCBQYW5lbF0gUGFuZWwgaGlkZGVuJyk7XG4gICAgICAgIH0sXG4gICAgfSxcbiAgICB0ZW1wbGF0ZTogcmVhZEZpbGVTeW5jKGpvaW4oX19kaXJuYW1lLCAnLi4vLi4vLi4vc3RhdGljL3RlbXBsYXRlL2RlZmF1bHQvaW5kZXguaHRtbCcpLCAndXRmLTgnKSxcbiAgICBzdHlsZTogcmVhZEZpbGVTeW5jKGpvaW4oX19kaXJuYW1lLCAnLi4vLi4vLi4vc3RhdGljL3N0eWxlL2RlZmF1bHQvaW5kZXguY3NzJyksICd1dGYtOCcpLFxuICAgICQ6IHtcbiAgICAgICAgYXBwOiAnI2FwcCcsXG4gICAgICAgIHBhbmVsVGl0bGU6ICcjcGFuZWxUaXRsZScsXG4gICAgfSxcbiAgICByZWFkeSh0aGlzOiBQYW5lbEhvc3QpIHtcbiAgICAgICAgY29uc3QgcGFuZWxIb3N0ID0gdGhpcztcblxuICAgICAgICBpZiAodGhpcy4kLmFwcCkge1xuICAgICAgICAgICAgY29uc3QgYXBwID0gY3JlYXRlQXBwKHt9KTtcbiAgICAgICAgICAgIGFwcC5jb25maWcuY29tcGlsZXJPcHRpb25zLmlzQ3VzdG9tRWxlbWVudCA9ICh0YWcpID0+IHRhZy5zdGFydHNXaXRoKCd1aS0nKTtcblxuICAgICAgICAgICAgYXBwLmNvbXBvbmVudChcbiAgICAgICAgICAgICAgICAnTWNwU2VydmVyQXBwJyxcbiAgICAgICAgICAgICAgICBkZWZpbmVDb21wb25lbnQoe1xuICAgICAgICAgICAgICAgICAgICBzZXR1cCgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGFjdGl2ZVRhYiA9IHJlZignc2VydmVyJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBzZXJ2ZXJSdW5uaW5nID0gcmVmKGZhbHNlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHNlcnZlclN0YXR1cyA9IHJlZign5bey5YGc5q2iJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBjb25uZWN0ZWRDbGllbnRzID0gcmVmKDApO1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgaHR0cFVybCA9IHJlZignJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBpc1Byb2Nlc3NpbmcgPSByZWYoZmFsc2UpO1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3Qgc2VydmVyQWN0aW9uRXJyb3IgPSByZWYoJycpO1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3Qgc2V0dGluZ3NGZWVkYmFjayA9IHJlZignJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBzZXR0aW5nc0ZlZWRiYWNrS2luZCA9IHJlZjwnc3VjY2VzcycgfCAnZXJyb3InIHwgJyc+KCcnKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3Qgc2V0dGluZ3MgPSByZWY8U2VydmVyU2V0dGluZ3M+KHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwb3J0OiBERUZBVUxUX01DUF9QT1JULFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGF1dG9TdGFydDogZmFsc2UsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVidWdMb2c6IGZhbHNlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1heENvbm5lY3Rpb25zOiAxMCxcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBhdmFpbGFibGVUb29scyA9IHJlZjxUb29sQ29uZmlnW10+KFtdKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHRvb2xDYXRlZ29yaWVzID0gcmVmPHN0cmluZ1tdPihbXSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBleHRlcm5hbFByb3ZpZGVycyA9IHJlZjxFeHRlcm5hbFByb3ZpZGVyU3VtbWFyeVtdPihbXSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBzZXR0aW5nc0NoYW5nZWQgPSByZWYoZmFsc2UpO1xuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IGlzTG9hZGluZ1NldHRpbmdzID0gZmFsc2U7IC8vIOmYsuatouS7juacjeWKoeWZqOWKoOi9veiuvue9ruaXtuivr+inpiBzZXR0aW5nc0NoYW5nZWRcblxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3Qgc3RhdHVzQ2xhc3MgPSBjb21wdXRlZCgoKSA9PiAoe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJ1bm5pbmc6IHNlcnZlclJ1bm5pbmcudmFsdWUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc3RvcHBlZDogIXNlcnZlclJ1bm5pbmcudmFsdWUsXG4gICAgICAgICAgICAgICAgICAgICAgICB9KSk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHRvdGFsVG9vbHMgPSBjb21wdXRlZCgoKSA9PiBhdmFpbGFibGVUb29scy52YWx1ZS5sZW5ndGgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgZW5hYmxlZFRvb2xzID0gY29tcHV0ZWQoKCkgPT4gYXZhaWxhYmxlVG9vbHMudmFsdWUuZmlsdGVyKCh0KSA9PiB0LmVuYWJsZWQpLmxlbmd0aCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBkaXNhYmxlZFRvb2xzID0gY29tcHV0ZWQoKCkgPT4gdG90YWxUb29scy52YWx1ZSAtIGVuYWJsZWRUb29scy52YWx1ZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBidWlsdGluVG9vbENvdW50ID0gY29tcHV0ZWQoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgKCkgPT4gYXZhaWxhYmxlVG9vbHMudmFsdWUuZmlsdGVyKCh0KSA9PiBCVUlMVElOX1RPT0xfQ0FURUdPUklFUy5oYXModC5jYXRlZ29yeSkpLmxlbmd0aFxuICAgICAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGV4dGVybmFsVG9vbENvdW50ID0gY29tcHV0ZWQoKCkgPT4gdG90YWxUb29scy52YWx1ZSAtIGJ1aWx0aW5Ub29sQ291bnQudmFsdWUpO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBzb3J0ZWRUb29sQ2F0ZWdvcmllcyA9IGNvbXB1dGVkKCgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBidWlsdGlucyA9IHRvb2xDYXRlZ29yaWVzLnZhbHVlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5maWx0ZXIoKGMpID0+IEJVSUxUSU5fVE9PTF9DQVRFR09SSUVTLmhhcyhjKSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLnNvcnQoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBleHRlcm5hbCA9IHRvb2xDYXRlZ29yaWVzLnZhbHVlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5maWx0ZXIoKGMpID0+ICFCVUlMVElOX1RPT0xfQ0FURUdPUklFUy5oYXMoYykpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5zb3J0KCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIFsuLi5idWlsdGlucywgLi4uZXh0ZXJuYWxdO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHNldHRpbmdzVmFsaWRhdGlvbkVycm9yID0gY29tcHV0ZWQoKCkgPT5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YWxpZGF0ZU1jcFNlcnZlclNldHRpbmdzKGJ1aWxkTWNwU2V0dGluZ3Moc2V0dGluZ3MudmFsdWUpKVxuICAgICAgICAgICAgICAgICAgICAgICAgKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3Qgc2VydmVyVG9nZ2xlTGFiZWwgPSBjb21wdXRlZCgoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGlzUHJvY2Vzc2luZy52YWx1ZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gc2VydmVyUnVubmluZy52YWx1ZSA/ICfmraPlnKjlgZzmraLigKYnIDogJ+ato+WcqOWQr+WKqOKApic7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBzZXJ2ZXJSdW5uaW5nLnZhbHVlID8gJ+WBnOatouacjeWKoeWZqCcgOiAn5ZCv5Yqo5pyN5Yqh5ZmoJztcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBpc0V4dGVybmFsQ2F0ZWdvcnkgPSAoY2F0ZWdvcnk6IHN0cmluZykgPT4gIUJVSUxUSU5fVE9PTF9DQVRFR09SSUVTLmhhcyhjYXRlZ29yeSk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHJlZnJlc2hTZXJ2ZXJTdGF0dXMgPSBhc3luYyAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgRWRpdG9yLk1lc3NhZ2UucmVxdWVzdCgnY29jb3MtbWNwLXNlcnZlcicsICdnZXQtc2VydmVyLXN0YXR1cycpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAocmVzdWx0KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZXJ2ZXJSdW5uaW5nLnZhbHVlID0gcmVzdWx0LnJ1bm5pbmc7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZXJ2ZXJTdGF0dXMudmFsdWUgPSByZXN1bHQucnVubmluZyA/ICfov5DooYzkuK0nIDogJ+W3suWBnOatoic7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25uZWN0ZWRDbGllbnRzLnZhbHVlID0gcmVzdWx0LmNsaWVudHMgfHwgMDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGh0dHBVcmwudmFsdWUgPSByZXN1bHQucnVubmluZyA/IGBodHRwOi8vMTI3LjAuMC4xOiR7cmVzdWx0LnBvcnR9YCA6ICcnO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8g5LuF5Zyo55So5oi35pyq5L+u5pS56K6+572u5pe277yM5omN5LuO5pyN5Yqh56uv5ZCM5q2l6K6+572u77yI6YG/5YWN6KaG55uW55So5oi35pyq5L+d5a2Y55qE5L+u5pS577yJXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAocmVzdWx0LnNldHRpbmdzICYmICFzZXR0aW5nc0NoYW5nZWQudmFsdWUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpc0xvYWRpbmdTZXR0aW5ncyA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2V0dGluZ3MudmFsdWUgPSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBvcnQ6IHJlc3VsdC5zZXR0aW5ncy5wb3J0IHx8IERFRkFVTFRfTUNQX1BPUlQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGF1dG9TdGFydDogcmVzdWx0LnNldHRpbmdzLmF1dG9TdGFydCB8fCBmYWxzZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVidWdMb2c6IHJlc3VsdC5zZXR0aW5ncy5lbmFibGVEZWJ1Z0xvZyB8fCBmYWxzZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbWF4Q29ubmVjdGlvbnM6IHJlc3VsdC5zZXR0aW5ncy5tYXhDb25uZWN0aW9ucyB8fCAxMCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNldHRpbmdzQ2hhbmdlZC52YWx1ZSA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNldFRpbWVvdXQoKCkgPT4geyBpc0xvYWRpbmdTZXR0aW5ncyA9IGZhbHNlOyB9LCAwKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ1tWdWUgQXBwXSBGYWlsZWQgdG8gcmVmcmVzaCBzZXJ2ZXIgc3RhdHVzOicsIGVycm9yKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBsb2FkRXh0ZXJuYWxTdW1tYXJ5ID0gYXN5bmMgKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IEVkaXRvci5NZXNzYWdlLnJlcXVlc3QoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnY29jb3MtbWNwLXNlcnZlcicsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnbWNwLWxpc3QtZXh0ZXJuYWwtdG9vbHMnXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGV4dGVybmFsUHJvdmlkZXJzLnZhbHVlID0gcmVzdWx0Py5wcm92aWRlcnMgPz8gW107XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcignW1Z1ZSBBcHBdIEZhaWxlZCB0byBsb2FkIGV4dGVybmFsIHRvb2xzIHN1bW1hcnk6JywgZXJyb3IpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBleHRlcm5hbFByb3ZpZGVycy52YWx1ZSA9IFtdO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGxvYWRUb29sTWFuYWdlclN0YXRlID0gYXN5bmMgKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IEVkaXRvci5NZXNzYWdlLnJlcXVlc3QoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnY29jb3MtbWNwLXNlcnZlcicsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnZ2V0VG9vbE1hbmFnZXJTdGF0ZSdcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHJlc3VsdCAmJiByZXN1bHQuc3VjY2Vzcykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXZhaWxhYmxlVG9vbHMudmFsdWUgPSByZXN1bHQuYXZhaWxhYmxlVG9vbHMgfHwgW107XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBjYXRlZ29yaWVzID0gbmV3IFNldChhdmFpbGFibGVUb29scy52YWx1ZS5tYXAoKHRvb2wpID0+IHRvb2wuY2F0ZWdvcnkpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRvb2xDYXRlZ29yaWVzLnZhbHVlID0gQXJyYXkuZnJvbShjYXRlZ29yaWVzKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhd2FpdCBsb2FkRXh0ZXJuYWxTdW1tYXJ5KCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcignW1Z1ZSBBcHBdIEZhaWxlZCB0byBsb2FkIHRvb2wgbWFuYWdlciBzdGF0ZTonLCBlcnJvcik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgcGFuZWxIb3N0Ll9yZWZyZXNoVG9vbHMgPSBsb2FkVG9vbE1hbmFnZXJTdGF0ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHBhbmVsSG9zdC5fcmVmcmVzaFN0YXR1cyA9IHJlZnJlc2hTZXJ2ZXJTdGF0dXM7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHN3aXRjaFRhYiA9ICh0YWJOYW1lOiBzdHJpbmcpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhY3RpdmVUYWIudmFsdWUgPSB0YWJOYW1lO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICh0YWJOYW1lID09PSAndG9vbHMnKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZvaWQgbG9hZFRvb2xNYW5hZ2VyU3RhdGUoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCB0b2dnbGVTZXJ2ZXIgPSBhc3luYyAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGlzUHJvY2Vzc2luZy52YWx1ZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlzUHJvY2Vzc2luZy52YWx1ZSA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2VydmVyQWN0aW9uRXJyb3IudmFsdWUgPSAnJztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoc2VydmVyUnVubmluZy52YWx1ZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXdhaXQgRWRpdG9yLk1lc3NhZ2UucmVxdWVzdCgnY29jb3MtbWNwLXNlcnZlcicsICdzdG9wLXNlcnZlcicpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgdmFsaWRhdGlvbkVycm9yID0gdmFsaWRhdGVNY3BTZXJ2ZXJTZXR0aW5ncyhcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBidWlsZE1jcFNldHRpbmdzKHNldHRpbmdzLnZhbHVlKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICh2YWxpZGF0aW9uRXJyb3IpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZXJ2ZXJBY3Rpb25FcnJvci52YWx1ZSA9IHZhbGlkYXRpb25FcnJvcjtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhd2FpdCBFZGl0b3IuTWVzc2FnZS5yZXF1ZXN0KFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICdjb2Nvcy1tY3Atc2VydmVyJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAndXBkYXRlLXNldHRpbmdzJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBidWlsZE1jcFNldHRpbmdzKHNldHRpbmdzLnZhbHVlKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGF3YWl0IEVkaXRvci5NZXNzYWdlLnJlcXVlc3QoJ2NvY29zLW1jcC1zZXJ2ZXInLCAnc3RhcnQtc2VydmVyJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXdhaXQgcmVmcmVzaFNlcnZlclN0YXR1cygpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gY2F0Y2ggKGVycm9yOiBhbnkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2VydmVyQWN0aW9uRXJyb3IudmFsdWUgPSBlcnJvcj8ubWVzc2FnZSB8fCBTdHJpbmcoZXJyb3IpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZmluYWxseSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlzUHJvY2Vzc2luZy52YWx1ZSA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHNhdmVTZXR0aW5ncyA9IGFzeW5jICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZXR0aW5nc0ZlZWRiYWNrLnZhbHVlID0gJyc7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2V0dGluZ3NGZWVkYmFja0tpbmQudmFsdWUgPSAnJztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCB2YWxpZGF0aW9uRXJyb3IgPSB2YWxpZGF0ZU1jcFNlcnZlclNldHRpbmdzKGJ1aWxkTWNwU2V0dGluZ3Moc2V0dGluZ3MudmFsdWUpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAodmFsaWRhdGlvbkVycm9yKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNldHRpbmdzRmVlZGJhY2sudmFsdWUgPSB2YWxpZGF0aW9uRXJyb3I7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNldHRpbmdzRmVlZGJhY2tLaW5kLnZhbHVlID0gJ2Vycm9yJztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpc1Byb2Nlc3NpbmcudmFsdWUgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhd2FpdCBFZGl0b3IuTWVzc2FnZS5yZXF1ZXN0KFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ2NvY29zLW1jcC1zZXJ2ZXInLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ3VwZGF0ZS1zZXR0aW5ncycsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBidWlsZE1jcFNldHRpbmdzKHNldHRpbmdzLnZhbHVlKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZXR0aW5nc0NoYW5nZWQudmFsdWUgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2V0dGluZ3NGZWVkYmFjay52YWx1ZSA9ICforr7nva7lt7Lkv53lrZgnO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZXR0aW5nc0ZlZWRiYWNrS2luZC52YWx1ZSA9ICdzdWNjZXNzJztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXdhaXQgcmVmcmVzaFNlcnZlclN0YXR1cygpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gY2F0Y2ggKGVycm9yOiBhbnkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2V0dGluZ3NGZWVkYmFjay52YWx1ZSA9IGVycm9yPy5tZXNzYWdlIHx8ICfkv53lrZjorr7nva7lpLHotKUnO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZXR0aW5nc0ZlZWRiYWNrS2luZC52YWx1ZSA9ICdlcnJvcic7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBmaW5hbGx5IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaXNQcm9jZXNzaW5nLnZhbHVlID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgY29weVVybCA9IGFzeW5jICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhd2FpdCBuYXZpZ2F0b3IuY2xpcGJvYXJkLndyaXRlVGV4dChodHRwVXJsLnZhbHVlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2V0dGluZ3NGZWVkYmFjay52YWx1ZSA9ICdIVFRQIOWcsOWdgOW3suWkjeWItic7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNldHRpbmdzRmVlZGJhY2tLaW5kLnZhbHVlID0gJ3N1Y2Nlc3MnO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ1tWdWUgQXBwXSBGYWlsZWQgdG8gY29weSBVUkw6JywgZXJyb3IpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHVwZGF0ZVRvb2xTdGF0dXMgPSBhc3luYyAoY2F0ZWdvcnk6IHN0cmluZywgbmFtZTogc3RyaW5nLCBlbmFibGVkOiBib29sZWFuKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgdG9vbEluZGV4ID0gYXZhaWxhYmxlVG9vbHMudmFsdWUuZmluZEluZGV4KFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAodCkgPT4gdC5jYXRlZ29yeSA9PT0gY2F0ZWdvcnkgJiYgdC5uYW1lID09PSBuYW1lXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAodG9vbEluZGV4ID09PSAtMSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHByZXZpb3VzID0gYXZhaWxhYmxlVG9vbHMudmFsdWVbdG9vbEluZGV4XS5lbmFibGVkO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGF2YWlsYWJsZVRvb2xzLnZhbHVlW3Rvb2xJbmRleF0uZW5hYmxlZCA9IGVuYWJsZWQ7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYXZhaWxhYmxlVG9vbHMudmFsdWUgPSBbLi4uYXZhaWxhYmxlVG9vbHMudmFsdWVdO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IEVkaXRvci5NZXNzYWdlLnJlcXVlc3QoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnY29jb3MtbWNwLXNlcnZlcicsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAndXBkYXRlVG9vbFN0YXR1cycsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYXRlZ29yeSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5hbWUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbmFibGVkXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICghcmVzdWx0IHx8ICFyZXN1bHQuc3VjY2Vzcykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXZhaWxhYmxlVG9vbHMudmFsdWVbdG9vbEluZGV4XS5lbmFibGVkID0gcHJldmlvdXM7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhdmFpbGFibGVUb29scy52YWx1ZSA9IFsuLi5hdmFpbGFibGVUb29scy52YWx1ZV07XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhdmFpbGFibGVUb29scy52YWx1ZVt0b29sSW5kZXhdLmVuYWJsZWQgPSBwcmV2aW91cztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXZhaWxhYmxlVG9vbHMudmFsdWUgPSBbLi4uYXZhaWxhYmxlVG9vbHMudmFsdWVdO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKCdbVnVlIEFwcF0gRmFpbGVkIHRvIHVwZGF0ZSB0b29sIHN0YXR1czonLCBlcnJvcik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3Qgc2F2ZUNoYW5nZXMgPSBhc3luYyAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgdXBkYXRlcyA9IGF2YWlsYWJsZVRvb2xzLnZhbHVlLm1hcCgodG9vbCkgPT4gKHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2F0ZWdvcnk6IFN0cmluZyh0b29sLmNhdGVnb3J5KSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmFtZTogU3RyaW5nKHRvb2wubmFtZSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVuYWJsZWQ6IEJvb2xlYW4odG9vbC5lbmFibGVkKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYXdhaXQgRWRpdG9yLk1lc3NhZ2UucmVxdWVzdCgnY29jb3MtbWNwLXNlcnZlcicsICd1cGRhdGVUb29sU3RhdHVzQmF0Y2gnLCB1cGRhdGVzKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHNlbGVjdEFsbFRvb2xzID0gYXN5bmMgKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGF2YWlsYWJsZVRvb2xzLnZhbHVlLmZvckVhY2goKHRvb2wpID0+ICh0b29sLmVuYWJsZWQgPSB0cnVlKSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYXdhaXQgc2F2ZUNoYW5nZXMoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGRlc2VsZWN0QWxsVG9vbHMgPSBhc3luYyAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYXZhaWxhYmxlVG9vbHMudmFsdWUuZm9yRWFjaCgodG9vbCkgPT4gKHRvb2wuZW5hYmxlZCA9IGZhbHNlKSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYXdhaXQgc2F2ZUNoYW5nZXMoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHRvZ2dsZUNhdGVnb3J5VG9vbHMgPSBhc3luYyAoY2F0ZWdvcnk6IHN0cmluZywgZW5hYmxlZDogYm9vbGVhbikgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGF2YWlsYWJsZVRvb2xzLnZhbHVlLmZvckVhY2goKHRvb2wpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHRvb2wuY2F0ZWdvcnkgPT09IGNhdGVnb3J5KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0b29sLmVuYWJsZWQgPSBlbmFibGVkO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYXdhaXQgc2F2ZUNoYW5nZXMoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGdldFRvb2xzQnlDYXRlZ29yeSA9IChjYXRlZ29yeTogc3RyaW5nKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGF2YWlsYWJsZVRvb2xzLnZhbHVlLmZpbHRlcigodG9vbCkgPT4gdG9vbC5jYXRlZ29yeSA9PT0gY2F0ZWdvcnkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gLS0tIOWIhuexu+aKmOWPoOeKtuaAgSAo6buY6K6k5YWo6YOo5oqY5Y+gKSAtLS1cbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGNvbGxhcHNlZENhdGVnb3JpZXMgPSByZWY8U2V0PHN0cmluZz4+KG5ldyBTZXQoKSk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIOWIneWni+WMluaXtuWFqOmDqOaKmOWPoFxuICAgICAgICAgICAgICAgICAgICAgICAgd2F0Y2goc29ydGVkVG9vbENhdGVnb3JpZXMsIChjYXRzKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgbmV3U2V0ID0gbmV3IFNldDxzdHJpbmc+KCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2F0cy5mb3JFYWNoKChjKSA9PiBuZXdTZXQuYWRkKGMpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb2xsYXBzZWRDYXRlZ29yaWVzLnZhbHVlID0gbmV3U2V0O1xuICAgICAgICAgICAgICAgICAgICAgICAgfSwgeyBpbW1lZGlhdGU6IHRydWUgfSk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGlzQ2F0ZWdvcnlDb2xsYXBzZWQgPSAoY2F0ZWdvcnk6IHN0cmluZyk6IGJvb2xlYW4gPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBjb2xsYXBzZWRDYXRlZ29yaWVzLnZhbHVlLmhhcyhjYXRlZ29yeSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCB0b2dnbGVDYXRlZ29yeUNvbGxhcHNlID0gKGNhdGVnb3J5OiBzdHJpbmcpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBuZXdTZXQgPSBuZXcgU2V0KGNvbGxhcHNlZENhdGVnb3JpZXMudmFsdWUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChuZXdTZXQuaGFzKGNhdGVnb3J5KSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuZXdTZXQuZGVsZXRlKGNhdGVnb3J5KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuZXdTZXQuYWRkKGNhdGVnb3J5KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29sbGFwc2VkQ2F0ZWdvcmllcy52YWx1ZSA9IG5ld1NldDtcbiAgICAgICAgICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGV4cGFuZEFsbENhdGVnb3JpZXMgPSAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29sbGFwc2VkQ2F0ZWdvcmllcy52YWx1ZSA9IG5ldyBTZXQoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGNvbGxhcHNlQWxsQ2F0ZWdvcmllcyA9ICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBuZXdTZXQgPSBuZXcgU2V0PHN0cmluZz4oKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzb3J0ZWRUb29sQ2F0ZWdvcmllcy52YWx1ZS5mb3JFYWNoKChjKSA9PiBuZXdTZXQuYWRkKGMpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb2xsYXBzZWRDYXRlZ29yaWVzLnZhbHVlID0gbmV3U2V0O1xuICAgICAgICAgICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgZ2V0Q2F0ZWdvcnlEaXNwbGF5TmFtZSA9IChjYXRlZ29yeTogc3RyaW5nKTogc3RyaW5nID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoaXNFeHRlcm5hbENhdGVnb3J5KGNhdGVnb3J5KSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gYOWklumDqCDCtyAke2NhdGVnb3J5fWA7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGNhdGVnb3J5TmFtZXM6IHsgW2tleTogc3RyaW5nXTogc3RyaW5nIH0gPSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNjZW5lOiAn5Zy65pmv5bel5YW3JyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbm9kZTogJ+iKgueCueW3peWFtycsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbXBvbmVudDogJ+e7hOS7tuW3peWFtycsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHByZWZhYjogJ+mihOWItuS9k+W3peWFtycsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHByb2plY3Q6ICfpobnnm67lt6XlhbcnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZWJ1ZzogJ+iwg+ivleW3peWFtycsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHByZWZlcmVuY2VzOiAn5YGP5aW96K6+572u5bel5YW3JyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2VydmVyOiAn5pyN5Yqh5Zmo5bel5YW3JyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJvYWRjYXN0OiAn5bm/5pKt5bel5YW3JyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2NlbmVBZHZhbmNlZDogJ+mrmOe6p+WcuuaZr+W3peWFtycsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNjZW5lVmlldzogJ+WcuuaZr+inhuWbvuW3peWFtycsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlZmVyZW5jZUltYWdlOiAn5Y+C6ICD5Zu+54mH5bel5YW3JyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXNzZXRBZHZhbmNlZDogJ+mrmOe6p+i1hOa6kOW3peWFtycsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhbGlkYXRpb246ICfpqozor4Hlt6XlhbcnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGNhdGVnb3J5TmFtZXNbY2F0ZWdvcnldIHx8IGNhdGVnb3J5O1xuICAgICAgICAgICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgd2F0Y2goXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2V0dGluZ3MsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoaXNMb2FkaW5nU2V0dGluZ3MpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZXR0aW5nc0NoYW5nZWQudmFsdWUgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoc2V0dGluZ3NGZWVkYmFja0tpbmQudmFsdWUgPT09ICdzdWNjZXNzJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2V0dGluZ3NGZWVkYmFjay52YWx1ZSA9ICcnO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2V0dGluZ3NGZWVkYmFja0tpbmQudmFsdWUgPSAnJztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgeyBkZWVwOiB0cnVlIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBzdGF0dXNQb2xsVGltZXI6IFJldHVyblR5cGU8dHlwZW9mIHNldEludGVydmFsPiB8IG51bGwgPSBudWxsO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICBvbk1vdW50ZWQoYXN5bmMgKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGF3YWl0IGxvYWRUb29sTWFuYWdlclN0YXRlKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYXdhaXQgcmVmcmVzaFNlcnZlclN0YXR1cygpO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc3RhdHVzUG9sbFRpbWVyID0gc2V0SW50ZXJ2YWwoKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoYWN0aXZlVGFiLnZhbHVlID09PSAnc2VydmVyJyAmJiAhaXNQcm9jZXNzaW5nLnZhbHVlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2b2lkIHJlZnJlc2hTZXJ2ZXJTdGF0dXMoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sIDMwMDApO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIG9uVW5tb3VudGVkKCgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoc3RhdHVzUG9sbFRpbWVyKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNsZWFySW50ZXJ2YWwoc3RhdHVzUG9sbFRpbWVyKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3RhdHVzUG9sbFRpbWVyID0gbnVsbDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcGFuZWxIb3N0Ll9yZWZyZXNoVG9vbHMgPSB1bmRlZmluZWQ7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcGFuZWxIb3N0Ll9yZWZyZXNoU3RhdHVzID0gdW5kZWZpbmVkO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYWN0aXZlVGFiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNlcnZlclJ1bm5pbmcsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2VydmVyU3RhdHVzLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbm5lY3RlZENsaWVudHMsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaHR0cFVybCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpc1Byb2Nlc3NpbmcsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2VydmVyQWN0aW9uRXJyb3IsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2V0dGluZ3NGZWVkYmFjayxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZXR0aW5nc0ZlZWRiYWNrS2luZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZXR0aW5ncyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhdmFpbGFibGVUb29scyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0b29sQ2F0ZWdvcmllcyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzb3J0ZWRUb29sQ2F0ZWdvcmllcyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBleHRlcm5hbFByb3ZpZGVycyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZXR0aW5nc0NoYW5nZWQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2V0dGluZ3NWYWxpZGF0aW9uRXJyb3IsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2VydmVyVG9nZ2xlTGFiZWwsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc3RhdHVzQ2xhc3MsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdG90YWxUb29scyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbmFibGVkVG9vbHMsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGlzYWJsZWRUb29scyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBidWlsdGluVG9vbENvdW50LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGV4dGVybmFsVG9vbENvdW50LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbGxhcHNlZENhdGVnb3JpZXMsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc3dpdGNoVGFiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRvZ2dsZVNlcnZlcixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzYXZlU2V0dGluZ3MsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29weVVybCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsb2FkVG9vbE1hbmFnZXJTdGF0ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB1cGRhdGVUb29sU3RhdHVzLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNlbGVjdEFsbFRvb2xzLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlc2VsZWN0QWxsVG9vbHMsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2F2ZUNoYW5nZXMsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdG9nZ2xlQ2F0ZWdvcnlUb29scyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBnZXRUb29sc0J5Q2F0ZWdvcnksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZ2V0Q2F0ZWdvcnlEaXNwbGF5TmFtZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpc0V4dGVybmFsQ2F0ZWdvcnksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaXNDYXRlZ29yeUNvbGxhcHNlZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0b2dnbGVDYXRlZ29yeUNvbGxhcHNlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGV4cGFuZEFsbENhdGVnb3JpZXMsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29sbGFwc2VBbGxDYXRlZ29yaWVzLFxuICAgICAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgdGVtcGxhdGU6IHJlYWRGaWxlU3luYyhcbiAgICAgICAgICAgICAgICAgICAgICAgIGpvaW4oX19kaXJuYW1lLCAnLi4vLi4vLi4vc3RhdGljL3RlbXBsYXRlL3Z1ZS9tY3Atc2VydmVyLWFwcC5odG1sJyksXG4gICAgICAgICAgICAgICAgICAgICAgICAndXRmLTgnXG4gICAgICAgICAgICAgICAgICAgICksXG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICk7XG5cbiAgICAgICAgICAgIGFwcC5tb3VudCh0aGlzLiQuYXBwKTtcbiAgICAgICAgICAgIHBhbmVsRGF0YU1hcC5zZXQodGhpcywgYXBwKTtcblxuICAgICAgICAgICAgY29uc3QgYWRkQnJvYWRjYXN0TGlzdGVuZXIgPSAoXG4gICAgICAgICAgICAgICAgRWRpdG9yLk1lc3NhZ2UgYXMgeyBhZGRCcm9hZGNhc3RMaXN0ZW5lcj86IChuYW1lOiBzdHJpbmcsIGNiOiAoKSA9PiB2b2lkKSA9PiAoKSA9PiB2b2lkIH1cbiAgICAgICAgICAgICkuYWRkQnJvYWRjYXN0TGlzdGVuZXI7XG4gICAgICAgICAgICBpZiAodHlwZW9mIGFkZEJyb2FkY2FzdExpc3RlbmVyID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICAgICAgcGFuZWxIb3N0Ll90b29sc0Jyb2FkY2FzdFVuc3Vic2NyaWJlID0gYWRkQnJvYWRjYXN0TGlzdGVuZXIuY2FsbChcbiAgICAgICAgICAgICAgICAgICAgRWRpdG9yLk1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgICAgICdtY3AtdG9vbHMtY2hhbmdlZCcsXG4gICAgICAgICAgICAgICAgICAgICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZvaWQgcGFuZWxIb3N0Ll9yZWZyZXNoVG9vbHM/LigpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgY29uc29sZS5sb2coJ1tNQ1AgUGFuZWxdIFZ1ZTMgYXBwIG1vdW50ZWQgc3VjY2Vzc2Z1bGx5Jyk7XG4gICAgICAgIH1cbiAgICB9LFxuICAgIGJlZm9yZUNsb3NlKHRoaXM6IFBhbmVsSG9zdCkge1xuICAgICAgICBpZiAodHlwZW9mIHRoaXMuX3Rvb2xzQnJvYWRjYXN0VW5zdWJzY3JpYmUgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgIHRoaXMuX3Rvb2xzQnJvYWRjYXN0VW5zdWJzY3JpYmUoKTtcbiAgICAgICAgfVxuICAgIH0sXG4gICAgY2xvc2UoKSB7XG4gICAgICAgIGNvbnN0IGFwcCA9IHBhbmVsRGF0YU1hcC5nZXQodGhpcyk7XG4gICAgICAgIGlmIChhcHApIHtcbiAgICAgICAgICAgIGFwcC51bm1vdW50KCk7XG4gICAgICAgIH1cbiAgICB9LFxufSk7XG4iXX0=