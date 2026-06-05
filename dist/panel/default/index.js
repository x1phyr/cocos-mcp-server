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
                                // 仅在用户未修改设置时，才从服务端同步设置
                                if (result.settings && !settingsChanged.value) {
                                    settings.value = {
                                        port: result.settings.port || constants_1.DEFAULT_MCP_PORT,
                                        autoStart: result.settings.autoStart || false,
                                        debugLog: result.settings.enableDebugLog || false,
                                        maxConnections: result.settings.maxConnections || 10,
                                    };
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
                    const onAutoStartChange = (event) => {
                        settings.value.autoStart = !!event.target.value;
                        settingsChanged.value = true;
                    };
                    const onDebugLogChange = (event) => {
                        settings.value.debugLog = !!event.target.value;
                        settingsChanged.value = true;
                    };
                    const onPortChange = (event) => {
                        settings.value.port = Number(event.target.value);
                        settingsChanged.value = true;
                    };
                    const onMaxConnectionsChange = (event) => {
                        settings.value.maxConnections = Number(event.target.value);
                        settingsChanged.value = true;
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
                        onAutoStartChange,
                        onDebugLogChange,
                        onPortChange,
                        onMaxConnectionsChange,
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zb3VyY2UvcGFuZWwvZGVmYXVsdC9pbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUEsK0NBQStDOztBQUUvQyx1Q0FBd0M7QUFDeEMsK0JBQTRCO0FBQzVCLG9EQUF3RDtBQUN4RCxrREFBZ0U7QUFDaEUsMEVBQTRFO0FBRTVFLDZCQUFvRztBQUVwRyxNQUFNLFlBQVksR0FBRyxJQUFJLE9BQU8sRUFBWSxDQUFDO0FBc0I3QyxTQUFTLGdCQUFnQixDQUFDLFFBQXdCO0lBQzlDLE9BQU87UUFDSCxJQUFJLEVBQUUsTUFBTSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUM7UUFDM0IsU0FBUyxFQUFFLFFBQVEsQ0FBQyxTQUFTO1FBQzdCLGNBQWMsRUFBRSxRQUFRLENBQUMsUUFBUTtRQUNqQyxjQUFjLEVBQUUsQ0FBQyxHQUFHLENBQUM7UUFDckIsY0FBYyxFQUFFLE1BQU0sQ0FBQyxRQUFRLENBQUMsY0FBYyxDQUFDO0tBQ2xELENBQUM7QUFDTixDQUFDO0FBU0QsTUFBTSxDQUFDLE9BQU8sR0FBRyxNQUFNLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQztJQUNqQyxTQUFTLEVBQUU7UUFDUCxJQUFJOztZQUNBLE9BQU8sQ0FBQyxHQUFHLENBQUMseUJBQXlCLENBQUMsQ0FBQztZQUN2QyxLQUFLLENBQUEsTUFBQSxJQUFJLENBQUMsY0FBYyxvREFBSSxDQUFBLENBQUM7WUFDN0IsS0FBSyxDQUFBLE1BQUEsSUFBSSxDQUFDLGFBQWEsb0RBQUksQ0FBQSxDQUFDO1FBQ2hDLENBQUM7UUFDRCxJQUFJO1lBQ0EsT0FBTyxDQUFDLEdBQUcsQ0FBQywwQkFBMEIsQ0FBQyxDQUFDO1FBQzVDLENBQUM7S0FDSjtJQUNELFFBQVEsRUFBRSxJQUFBLHVCQUFZLEVBQUMsSUFBQSxXQUFJLEVBQUMsU0FBUyxFQUFFLDZDQUE2QyxDQUFDLEVBQUUsT0FBTyxDQUFDO0lBQy9GLEtB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QztRQUM3RCxDQUFDO0lBQ0wsQ0FBQztJQUNELFdBQVc7UUFDUCxJQUFJLE9BQU8sSUFBSSxDQUFDLDBCQUEwQixLQUFLLFVBQVUsRUFBRSxDQUFDO1lBQ3hELElBQUksQ0FBQywwQkFBMEIsRUFBRSxDQUFDO1FBQ3RDLENBQUM7SUFDTCxDQUFDO0lBQ0QsS0FBSztRQUNELE1BQU0sR0FBRyxHQUFHLFlBQVksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDbkMsSUFBSSxHQUFHLEVBQUUsQ0FBQztZQUNOLEdBQUcsQ0FBQyxPQUFPLEVBQUUsQ0FBQztRQUNsQixDQUFDO0lBQ0wsQ0FBQztDQUNKLENBQUMsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qIGVzbGludC1kaXNhYmxlIHZ1ZS9vbmUtY29tcG9uZW50LXBlci1maWxlICovXG5cbmltcG9ydCB7IHJlYWRGaWxlU3luYyB9IGZyb20gJ2ZzLWV4dHJhJztcbmltcG9ydCB7IGpvaW4gfSBmcm9tICdwYXRoJztcbmltcG9ydCB7IERFRkFVTFRfTUNQX1BPUlQgfSBmcm9tICcuLi8uLi9jb3JlL2NvbnN0YW50cyc7XG5pbXBvcnQgeyB2YWxpZGF0ZU1jcFNlcnZlclNldHRpbmdzIH0gZnJvbSAnLi4vLi4vY29yZS9zZXR0aW5ncyc7XG5pbXBvcnQgeyBCVUlMVElOX1RPT0xfQ0FURUdPUklFUyB9IGZyb20gJy4uLy4uL3JlZ2lzdHJ5L2J1aWx0aW4tY2F0ZWdvcmllcyc7XG5pbXBvcnQgeyBNQ1BTZXJ2ZXJTZXR0aW5ncyB9IGZyb20gJy4uLy4uL3R5cGVzJztcbmltcG9ydCB7IGNyZWF0ZUFwcCwgQXBwLCBkZWZpbmVDb21wb25lbnQsIHJlZiwgY29tcHV0ZWQsIG9uTW91bnRlZCwgb25Vbm1vdW50ZWQsIHdhdGNoIH0gZnJvbSAndnVlJztcblxuY29uc3QgcGFuZWxEYXRhTWFwID0gbmV3IFdlYWtNYXA8YW55LCBBcHA+KCk7XG5cbmludGVyZmFjZSBUb29sQ29uZmlnIHtcbiAgICBjYXRlZ29yeTogc3RyaW5nO1xuICAgIG5hbWU6IHN0cmluZztcbiAgICBlbmFibGVkOiBib29sZWFuO1xuICAgIGRlc2NyaXB0aW9uOiBzdHJpbmc7XG59XG5cbmludGVyZmFjZSBFeHRlcm5hbFByb3ZpZGVyU3VtbWFyeSB7XG4gICAgcHJvdmlkZXJJZDogc3RyaW5nO1xuICAgIG5hbWVzcGFjZTogc3RyaW5nO1xuICAgIHRvb2xzOiB7IG5hbWU6IHN0cmluZzsgZGVzY3JpcHRpb246IHN0cmluZyB9W107XG59XG5cbmludGVyZmFjZSBQYW5lbEhvc3Qge1xuICAgICQ6IHsgYXBwPzogSFRNTEVsZW1lbnQgfTtcbiAgICBfcmVmcmVzaFRvb2xzPzogKCkgPT4gdm9pZCB8IFByb21pc2U8dm9pZD47XG4gICAgX3JlZnJlc2hTdGF0dXM/OiAoKSA9PiB2b2lkIHwgUHJvbWlzZTx2b2lkPjtcbiAgICBfdG9vbHNCcm9hZGNhc3RVbnN1YnNjcmliZT86ICgpID0+IHZvaWQ7XG59XG5cbmZ1bmN0aW9uIGJ1aWxkTWNwU2V0dGluZ3Moc2V0dGluZ3M6IFNlcnZlclNldHRpbmdzKTogTUNQU2VydmVyU2V0dGluZ3Mge1xuICAgIHJldHVybiB7XG4gICAgICAgIHBvcnQ6IE51bWJlcihzZXR0aW5ncy5wb3J0KSxcbiAgICAgICAgYXV0b1N0YXJ0OiBzZXR0aW5ncy5hdXRvU3RhcnQsXG4gICAgICAgIGVuYWJsZURlYnVnTG9nOiBzZXR0aW5ncy5kZWJ1Z0xvZyxcbiAgICAgICAgYWxsb3dlZE9yaWdpbnM6IFsnKiddLFxuICAgICAgICBtYXhDb25uZWN0aW9uczogTnVtYmVyKHNldHRpbmdzLm1heENvbm5lY3Rpb25zKSxcbiAgICB9O1xufVxuXG5pbnRlcmZhY2UgU2VydmVyU2V0dGluZ3Mge1xuICAgIHBvcnQ6IG51bWJlcjtcbiAgICBhdXRvU3RhcnQ6IGJvb2xlYW47XG4gICAgZGVidWdMb2c6IGJvb2xlYW47XG4gICAgbWF4Q29ubmVjdGlvbnM6IG51bWJlcjtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBFZGl0b3IuUGFuZWwuZGVmaW5lKHtcbiAgICBsaXN0ZW5lcnM6IHtcbiAgICAgICAgc2hvdyh0aGlzOiBQYW5lbEhvc3QpIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdbTUNQIFBhbmVsXSBQYW5lbCBzaG93bicpO1xuICAgICAgICAgICAgdm9pZCB0aGlzLl9yZWZyZXNoU3RhdHVzPy4oKTtcbiAgICAgICAgICAgIHZvaWQgdGhpcy5fcmVmcmVzaFRvb2xzPy4oKTtcbiAgICAgICAgfSxcbiAgICAgICAgaGlkZSgpIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdbTUNQIFBhbmVsXSBQYW5lbCBoaWRkZW4nKTtcbiAgICAgICAgfSxcbiAgICB9LFxuICAgIHRlbXBsYXRlOiByZWFkRmlsZVN5bmMoam9pbihfX2Rpcm5hbWUsICcuLi8uLi8uLi9zdGF0aWMvdGVtcGxhdGUvZGVmYXVsdC9pbmRleC5odG1sJyksICd1dGYtOCcpLFxuICAgIHN0eWxlOiByZWFkRmlsZVN5bmMoam9pbihfX2Rpcm5hbWUsICcuLi8uLi8uLi9zdGF0aWMvc3R5bGUvZGVmYXVsdC9pbmRleC5jc3MnKSwgJ3V0Zi04JyksXG4gICAgJDoge1xuICAgICAgICBhcHA6ICcjYXBwJyxcbiAgICAgICAgcGFuZWxUaXRsZTogJyNwYW5lbFRpdGxlJyxcbiAgICB9LFxuICAgIHJlYWR5KHRoaXM6IFBhbmVsSG9zdCkge1xuICAgICAgICBjb25zdCBwYW5lbEhvc3QgPSB0aGlzO1xuXG4gICAgICAgIGlmICh0aGlzLiQuYXBwKSB7XG4gICAgICAgICAgICBjb25zdCBhcHAgPSBjcmVhdGVBcHAoe30pO1xuICAgICAgICAgICAgYXBwLmNvbmZpZy5jb21waWxlck9wdGlvbnMuaXNDdXN0b21FbGVtZW50ID0gKHRhZykgPT4gdGFnLnN0YXJ0c1dpdGgoJ3VpLScpO1xuXG4gICAgICAgICAgICBhcHAuY29tcG9uZW50KFxuICAgICAgICAgICAgICAgICdNY3BTZXJ2ZXJBcHAnLFxuICAgICAgICAgICAgICAgIGRlZmluZUNvbXBvbmVudCh7XG4gICAgICAgICAgICAgICAgICAgIHNldHVwKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgYWN0aXZlVGFiID0gcmVmKCdzZXJ2ZXInKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHNlcnZlclJ1bm5pbmcgPSByZWYoZmFsc2UpO1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3Qgc2VydmVyU3RhdHVzID0gcmVmKCflt7LlgZzmraInKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGNvbm5lY3RlZENsaWVudHMgPSByZWYoMCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBodHRwVXJsID0gcmVmKCcnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGlzUHJvY2Vzc2luZyA9IHJlZihmYWxzZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBzZXJ2ZXJBY3Rpb25FcnJvciA9IHJlZignJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBzZXR0aW5nc0ZlZWRiYWNrID0gcmVmKCcnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHNldHRpbmdzRmVlZGJhY2tLaW5kID0gcmVmPCdzdWNjZXNzJyB8ICdlcnJvcicgfCAnJz4oJycpO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBzZXR0aW5ncyA9IHJlZjxTZXJ2ZXJTZXR0aW5ncz4oe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBvcnQ6IERFRkFVTFRfTUNQX1BPUlQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYXV0b1N0YXJ0OiBmYWxzZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZWJ1Z0xvZzogZmFsc2UsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbWF4Q29ubmVjdGlvbnM6IDEwLFxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGF2YWlsYWJsZVRvb2xzID0gcmVmPFRvb2xDb25maWdbXT4oW10pO1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgdG9vbENhdGVnb3JpZXMgPSByZWY8c3RyaW5nW10+KFtdKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGV4dGVybmFsUHJvdmlkZXJzID0gcmVmPEV4dGVybmFsUHJvdmlkZXJTdW1tYXJ5W10+KFtdKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHNldHRpbmdzQ2hhbmdlZCA9IHJlZihmYWxzZSk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHN0YXR1c0NsYXNzID0gY29tcHV0ZWQoKCkgPT4gKHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBydW5uaW5nOiBzZXJ2ZXJSdW5uaW5nLnZhbHVlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0b3BwZWQ6ICFzZXJ2ZXJSdW5uaW5nLnZhbHVlLFxuICAgICAgICAgICAgICAgICAgICAgICAgfSkpO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCB0b3RhbFRvb2xzID0gY29tcHV0ZWQoKCkgPT4gYXZhaWxhYmxlVG9vbHMudmFsdWUubGVuZ3RoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGVuYWJsZWRUb29scyA9IGNvbXB1dGVkKCgpID0+IGF2YWlsYWJsZVRvb2xzLnZhbHVlLmZpbHRlcigodCkgPT4gdC5lbmFibGVkKS5sZW5ndGgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgZGlzYWJsZWRUb29scyA9IGNvbXB1dGVkKCgpID0+IHRvdGFsVG9vbHMudmFsdWUgLSBlbmFibGVkVG9vbHMudmFsdWUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgYnVpbHRpblRvb2xDb3VudCA9IGNvbXB1dGVkKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICgpID0+IGF2YWlsYWJsZVRvb2xzLnZhbHVlLmZpbHRlcigodCkgPT4gQlVJTFRJTl9UT09MX0NBVEVHT1JJRVMuaGFzKHQuY2F0ZWdvcnkpKS5sZW5ndGhcbiAgICAgICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBleHRlcm5hbFRvb2xDb3VudCA9IGNvbXB1dGVkKCgpID0+IHRvdGFsVG9vbHMudmFsdWUgLSBidWlsdGluVG9vbENvdW50LnZhbHVlKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3Qgc29ydGVkVG9vbENhdGVnb3JpZXMgPSBjb21wdXRlZCgoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgYnVpbHRpbnMgPSB0b29sQ2F0ZWdvcmllcy52YWx1ZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAuZmlsdGVyKChjKSA9PiBCVUlMVElOX1RPT0xfQ0FURUdPUklFUy5oYXMoYykpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5zb3J0KCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgZXh0ZXJuYWwgPSB0b29sQ2F0ZWdvcmllcy52YWx1ZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAuZmlsdGVyKChjKSA9PiAhQlVJTFRJTl9UT09MX0NBVEVHT1JJRVMuaGFzKGMpKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAuc29ydCgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBbLi4uYnVpbHRpbnMsIC4uLmV4dGVybmFsXTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBzZXR0aW5nc1ZhbGlkYXRpb25FcnJvciA9IGNvbXB1dGVkKCgpID0+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsaWRhdGVNY3BTZXJ2ZXJTZXR0aW5ncyhidWlsZE1jcFNldHRpbmdzKHNldHRpbmdzLnZhbHVlKSlcbiAgICAgICAgICAgICAgICAgICAgICAgICk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHNlcnZlclRvZ2dsZUxhYmVsID0gY29tcHV0ZWQoKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChpc1Byb2Nlc3NpbmcudmFsdWUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHNlcnZlclJ1bm5pbmcudmFsdWUgPyAn5q2j5Zyo5YGc5q2i4oCmJyA6ICfmraPlnKjlkK/liqjigKYnO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gc2VydmVyUnVubmluZy52YWx1ZSA/ICflgZzmraLmnI3liqHlmagnIDogJ+WQr+WKqOacjeWKoeWZqCc7XG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgaXNFeHRlcm5hbENhdGVnb3J5ID0gKGNhdGVnb3J5OiBzdHJpbmcpID0+ICFCVUlMVElOX1RPT0xfQ0FURUdPUklFUy5oYXMoY2F0ZWdvcnkpO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCByZWZyZXNoU2VydmVyU3RhdHVzID0gYXN5bmMgKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IEVkaXRvci5NZXNzYWdlLnJlcXVlc3QoJ2NvY29zLW1jcC1zZXJ2ZXInLCAnZ2V0LXNlcnZlci1zdGF0dXMnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHJlc3VsdCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2VydmVyUnVubmluZy52YWx1ZSA9IHJlc3VsdC5ydW5uaW5nO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2VydmVyU3RhdHVzLnZhbHVlID0gcmVzdWx0LnJ1bm5pbmcgPyAn6L+Q6KGM5LitJyA6ICflt7LlgZzmraInO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29ubmVjdGVkQ2xpZW50cy52YWx1ZSA9IHJlc3VsdC5jbGllbnRzIHx8IDA7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBodHRwVXJsLnZhbHVlID0gcmVzdWx0LnJ1bm5pbmcgPyBgaHR0cDovLzEyNy4wLjAuMToke3Jlc3VsdC5wb3J0fWAgOiAnJztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIOS7heWcqOeUqOaIt+acquS/ruaUueiuvue9ruaXtu+8jOaJjeS7juacjeWKoeerr+WQjOatpeiuvue9rlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHJlc3VsdC5zZXR0aW5ncyAmJiAhc2V0dGluZ3NDaGFuZ2VkLnZhbHVlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2V0dGluZ3MudmFsdWUgPSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBvcnQ6IHJlc3VsdC5zZXR0aW5ncy5wb3J0IHx8IERFRkFVTFRfTUNQX1BPUlQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGF1dG9TdGFydDogcmVzdWx0LnNldHRpbmdzLmF1dG9TdGFydCB8fCBmYWxzZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVidWdMb2c6IHJlc3VsdC5zZXR0aW5ncy5lbmFibGVEZWJ1Z0xvZyB8fCBmYWxzZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbWF4Q29ubmVjdGlvbnM6IHJlc3VsdC5zZXR0aW5ncy5tYXhDb25uZWN0aW9ucyB8fCAxMCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcignW1Z1ZSBBcHBdIEZhaWxlZCB0byByZWZyZXNoIHNlcnZlciBzdGF0dXM6JywgZXJyb3IpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGxvYWRFeHRlcm5hbFN1bW1hcnkgPSBhc3luYyAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgRWRpdG9yLk1lc3NhZ2UucmVxdWVzdChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICdjb2Nvcy1tY3Atc2VydmVyJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICdtY3AtbGlzdC1leHRlcm5hbC10b29scydcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZXh0ZXJuYWxQcm92aWRlcnMudmFsdWUgPSByZXN1bHQ/LnByb3ZpZGVycyA/PyBbXTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKCdbVnVlIEFwcF0gRmFpbGVkIHRvIGxvYWQgZXh0ZXJuYWwgdG9vbHMgc3VtbWFyeTonLCBlcnJvcik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGV4dGVybmFsUHJvdmlkZXJzLnZhbHVlID0gW107XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgbG9hZFRvb2xNYW5hZ2VyU3RhdGUgPSBhc3luYyAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgRWRpdG9yLk1lc3NhZ2UucmVxdWVzdChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICdjb2Nvcy1tY3Atc2VydmVyJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICdnZXRUb29sTWFuYWdlclN0YXRlJ1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAocmVzdWx0ICYmIHJlc3VsdC5zdWNjZXNzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhdmFpbGFibGVUb29scy52YWx1ZSA9IHJlc3VsdC5hdmFpbGFibGVUb29scyB8fCBbXTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGNhdGVnb3JpZXMgPSBuZXcgU2V0KGF2YWlsYWJsZVRvb2xzLnZhbHVlLm1hcCgodG9vbCkgPT4gdG9vbC5jYXRlZ29yeSkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdG9vbENhdGVnb3JpZXMudmFsdWUgPSBBcnJheS5mcm9tKGNhdGVnb3JpZXMpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGF3YWl0IGxvYWRFeHRlcm5hbFN1bW1hcnkoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKCdbVnVlIEFwcF0gRmFpbGVkIHRvIGxvYWQgdG9vbCBtYW5hZ2VyIHN0YXRlOicsIGVycm9yKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAgICAgICAgICAgICBwYW5lbEhvc3QuX3JlZnJlc2hUb29scyA9IGxvYWRUb29sTWFuYWdlclN0YXRlO1xuICAgICAgICAgICAgICAgICAgICAgICAgcGFuZWxIb3N0Ll9yZWZyZXNoU3RhdHVzID0gcmVmcmVzaFNlcnZlclN0YXR1cztcblxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3Qgc3dpdGNoVGFiID0gKHRhYk5hbWU6IHN0cmluZykgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFjdGl2ZVRhYi52YWx1ZSA9IHRhYk5hbWU7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHRhYk5hbWUgPT09ICd0b29scycpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdm9pZCBsb2FkVG9vbE1hbmFnZXJTdGF0ZSgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHRvZ2dsZVNlcnZlciA9IGFzeW5jICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoaXNQcm9jZXNzaW5nLnZhbHVlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaXNQcm9jZXNzaW5nLnZhbHVlID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZXJ2ZXJBY3Rpb25FcnJvci52YWx1ZSA9ICcnO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChzZXJ2ZXJSdW5uaW5nLnZhbHVlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhd2FpdCBFZGl0b3IuTWVzc2FnZS5yZXF1ZXN0KCdjb2Nvcy1tY3Atc2VydmVyJywgJ3N0b3Atc2VydmVyJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCB2YWxpZGF0aW9uRXJyb3IgPSB2YWxpZGF0ZU1jcFNlcnZlclNldHRpbmdzKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJ1aWxkTWNwU2V0dGluZ3Moc2V0dGluZ3MudmFsdWUpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHZhbGlkYXRpb25FcnJvcikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNlcnZlckFjdGlvbkVycm9yLnZhbHVlID0gdmFsaWRhdGlvbkVycm9yO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGF3YWl0IEVkaXRvci5NZXNzYWdlLnJlcXVlc3QoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ2NvY29zLW1jcC1zZXJ2ZXInLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICd1cGRhdGUtc2V0dGluZ3MnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJ1aWxkTWNwU2V0dGluZ3Moc2V0dGluZ3MudmFsdWUpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXdhaXQgRWRpdG9yLk1lc3NhZ2UucmVxdWVzdCgnY29jb3MtbWNwLXNlcnZlcicsICdzdGFydC1zZXJ2ZXInKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhd2FpdCByZWZyZXNoU2VydmVyU3RhdHVzKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBjYXRjaCAoZXJyb3I6IGFueSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZXJ2ZXJBY3Rpb25FcnJvci52YWx1ZSA9IGVycm9yPy5tZXNzYWdlIHx8IFN0cmluZyhlcnJvcik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBmaW5hbGx5IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaXNQcm9jZXNzaW5nLnZhbHVlID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3Qgc2F2ZVNldHRpbmdzID0gYXN5bmMgKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNldHRpbmdzRmVlZGJhY2sudmFsdWUgPSAnJztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZXR0aW5nc0ZlZWRiYWNrS2luZC52YWx1ZSA9ICcnO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHZhbGlkYXRpb25FcnJvciA9IHZhbGlkYXRlTWNwU2VydmVyU2V0dGluZ3MoYnVpbGRNY3BTZXR0aW5ncyhzZXR0aW5ncy52YWx1ZSkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICh2YWxpZGF0aW9uRXJyb3IpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2V0dGluZ3NGZWVkYmFjay52YWx1ZSA9IHZhbGlkYXRpb25FcnJvcjtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2V0dGluZ3NGZWVkYmFja0tpbmQudmFsdWUgPSAnZXJyb3InO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlzUHJvY2Vzc2luZy52YWx1ZSA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGF3YWl0IEVkaXRvci5NZXNzYWdlLnJlcXVlc3QoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnY29jb3MtbWNwLXNlcnZlcicsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAndXBkYXRlLXNldHRpbmdzJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJ1aWxkTWNwU2V0dGluZ3Moc2V0dGluZ3MudmFsdWUpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNldHRpbmdzQ2hhbmdlZC52YWx1ZSA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZXR0aW5nc0ZlZWRiYWNrLnZhbHVlID0gJ+iuvue9ruW3suS/neWtmCc7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNldHRpbmdzRmVlZGJhY2tLaW5kLnZhbHVlID0gJ3N1Y2Nlc3MnO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhd2FpdCByZWZyZXNoU2VydmVyU3RhdHVzKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBjYXRjaCAoZXJyb3I6IGFueSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZXR0aW5nc0ZlZWRiYWNrLnZhbHVlID0gZXJyb3I/Lm1lc3NhZ2UgfHwgJ+S/neWtmOiuvue9ruWksei0pSc7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNldHRpbmdzRmVlZGJhY2tLaW5kLnZhbHVlID0gJ2Vycm9yJztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGZpbmFsbHkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpc1Byb2Nlc3NpbmcudmFsdWUgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBjb3B5VXJsID0gYXN5bmMgKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGF3YWl0IG5hdmlnYXRvci5jbGlwYm9hcmQud3JpdGVUZXh0KGh0dHBVcmwudmFsdWUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZXR0aW5nc0ZlZWRiYWNrLnZhbHVlID0gJ0hUVFAg5Zyw5Z2A5bey5aSN5Yi2JztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2V0dGluZ3NGZWVkYmFja0tpbmQudmFsdWUgPSAnc3VjY2Vzcyc7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcignW1Z1ZSBBcHBdIEZhaWxlZCB0byBjb3B5IFVSTDonLCBlcnJvcik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3Qgb25BdXRvU3RhcnRDaGFuZ2UgPSAoZXZlbnQ6IGFueSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNldHRpbmdzLnZhbHVlLmF1dG9TdGFydCA9ICEhZXZlbnQudGFyZ2V0LnZhbHVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNldHRpbmdzQ2hhbmdlZC52YWx1ZSA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBvbkRlYnVnTG9nQ2hhbmdlID0gKGV2ZW50OiBhbnkpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZXR0aW5ncy52YWx1ZS5kZWJ1Z0xvZyA9ICEhZXZlbnQudGFyZ2V0LnZhbHVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNldHRpbmdzQ2hhbmdlZC52YWx1ZSA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBvblBvcnRDaGFuZ2UgPSAoZXZlbnQ6IGFueSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNldHRpbmdzLnZhbHVlLnBvcnQgPSBOdW1iZXIoZXZlbnQudGFyZ2V0LnZhbHVlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZXR0aW5nc0NoYW5nZWQudmFsdWUgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3Qgb25NYXhDb25uZWN0aW9uc0NoYW5nZSA9IChldmVudDogYW55KSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2V0dGluZ3MudmFsdWUubWF4Q29ubmVjdGlvbnMgPSBOdW1iZXIoZXZlbnQudGFyZ2V0LnZhbHVlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZXR0aW5nc0NoYW5nZWQudmFsdWUgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgdXBkYXRlVG9vbFN0YXR1cyA9IGFzeW5jIChjYXRlZ29yeTogc3RyaW5nLCBuYW1lOiBzdHJpbmcsIGVuYWJsZWQ6IGJvb2xlYW4pID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCB0b29sSW5kZXggPSBhdmFpbGFibGVUb29scy52YWx1ZS5maW5kSW5kZXgoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICh0KSA9PiB0LmNhdGVnb3J5ID09PSBjYXRlZ29yeSAmJiB0Lm5hbWUgPT09IG5hbWVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICh0b29sSW5kZXggPT09IC0xKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgcHJldmlvdXMgPSBhdmFpbGFibGVUb29scy52YWx1ZVt0b29sSW5kZXhdLmVuYWJsZWQ7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYXZhaWxhYmxlVG9vbHMudmFsdWVbdG9vbEluZGV4XS5lbmFibGVkID0gZW5hYmxlZDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhdmFpbGFibGVUb29scy52YWx1ZSA9IFsuLi5hdmFpbGFibGVUb29scy52YWx1ZV07XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgRWRpdG9yLk1lc3NhZ2UucmVxdWVzdChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICdjb2Nvcy1tY3Atc2VydmVyJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICd1cGRhdGVUb29sU3RhdHVzJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhdGVnb3J5LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmFtZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVuYWJsZWRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCFyZXN1bHQgfHwgIXJlc3VsdC5zdWNjZXNzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhdmFpbGFibGVUb29scy52YWx1ZVt0b29sSW5kZXhdLmVuYWJsZWQgPSBwcmV2aW91cztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGF2YWlsYWJsZVRvb2xzLnZhbHVlID0gWy4uLmF2YWlsYWJsZVRvb2xzLnZhbHVlXTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGF2YWlsYWJsZVRvb2xzLnZhbHVlW3Rvb2xJbmRleF0uZW5hYmxlZCA9IHByZXZpb3VzO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhdmFpbGFibGVUb29scy52YWx1ZSA9IFsuLi5hdmFpbGFibGVUb29scy52YWx1ZV07XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ1tWdWUgQXBwXSBGYWlsZWQgdG8gdXBkYXRlIHRvb2wgc3RhdHVzOicsIGVycm9yKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBzYXZlQ2hhbmdlcyA9IGFzeW5jICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCB1cGRhdGVzID0gYXZhaWxhYmxlVG9vbHMudmFsdWUubWFwKCh0b29sKSA9PiAoe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYXRlZ29yeTogU3RyaW5nKHRvb2wuY2F0ZWdvcnkpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuYW1lOiBTdHJpbmcodG9vbC5uYW1lKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZW5hYmxlZDogQm9vbGVhbih0b29sLmVuYWJsZWQpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhd2FpdCBFZGl0b3IuTWVzc2FnZS5yZXF1ZXN0KCdjb2Nvcy1tY3Atc2VydmVyJywgJ3VwZGF0ZVRvb2xTdGF0dXNCYXRjaCcsIHVwZGF0ZXMpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3Qgc2VsZWN0QWxsVG9vbHMgPSBhc3luYyAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYXZhaWxhYmxlVG9vbHMudmFsdWUuZm9yRWFjaCgodG9vbCkgPT4gKHRvb2wuZW5hYmxlZCA9IHRydWUpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhd2FpdCBzYXZlQ2hhbmdlcygpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgZGVzZWxlY3RBbGxUb29scyA9IGFzeW5jICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhdmFpbGFibGVUb29scy52YWx1ZS5mb3JFYWNoKCh0b29sKSA9PiAodG9vbC5lbmFibGVkID0gZmFsc2UpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhd2FpdCBzYXZlQ2hhbmdlcygpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgdG9nZ2xlQ2F0ZWdvcnlUb29scyA9IGFzeW5jIChjYXRlZ29yeTogc3RyaW5nLCBlbmFibGVkOiBib29sZWFuKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYXZhaWxhYmxlVG9vbHMudmFsdWUuZm9yRWFjaCgodG9vbCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAodG9vbC5jYXRlZ29yeSA9PT0gY2F0ZWdvcnkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRvb2wuZW5hYmxlZCA9IGVuYWJsZWQ7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhd2FpdCBzYXZlQ2hhbmdlcygpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgZ2V0VG9vbHNCeUNhdGVnb3J5ID0gKGNhdGVnb3J5OiBzdHJpbmcpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gYXZhaWxhYmxlVG9vbHMudmFsdWUuZmlsdGVyKCh0b29sKSA9PiB0b29sLmNhdGVnb3J5ID09PSBjYXRlZ29yeSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyAtLS0g5YiG57G75oqY5Y+g54q25oCBICjpu5jorqTlhajpg6jmipjlj6ApIC0tLVxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgY29sbGFwc2VkQ2F0ZWdvcmllcyA9IHJlZjxTZXQ8c3RyaW5nPj4obmV3IFNldCgpKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgLy8g5Yid5aeL5YyW5pe25YWo6YOo5oqY5Y+gXG4gICAgICAgICAgICAgICAgICAgICAgICB3YXRjaChzb3J0ZWRUb29sQ2F0ZWdvcmllcywgKGNhdHMpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBuZXdTZXQgPSBuZXcgU2V0PHN0cmluZz4oKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYXRzLmZvckVhY2goKGMpID0+IG5ld1NldC5hZGQoYykpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbGxhcHNlZENhdGVnb3JpZXMudmFsdWUgPSBuZXdTZXQ7XG4gICAgICAgICAgICAgICAgICAgICAgICB9LCB7IGltbWVkaWF0ZTogdHJ1ZSB9KTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgaXNDYXRlZ29yeUNvbGxhcHNlZCA9IChjYXRlZ29yeTogc3RyaW5nKTogYm9vbGVhbiA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGNvbGxhcHNlZENhdGVnb3JpZXMudmFsdWUuaGFzKGNhdGVnb3J5KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHRvZ2dsZUNhdGVnb3J5Q29sbGFwc2UgPSAoY2F0ZWdvcnk6IHN0cmluZykgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IG5ld1NldCA9IG5ldyBTZXQoY29sbGFwc2VkQ2F0ZWdvcmllcy52YWx1ZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKG5ld1NldC5oYXMoY2F0ZWdvcnkpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5ld1NldC5kZWxldGUoY2F0ZWdvcnkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5ld1NldC5hZGQoY2F0ZWdvcnkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb2xsYXBzZWRDYXRlZ29yaWVzLnZhbHVlID0gbmV3U2V0O1xuICAgICAgICAgICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgZXhwYW5kQWxsQ2F0ZWdvcmllcyA9ICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb2xsYXBzZWRDYXRlZ29yaWVzLnZhbHVlID0gbmV3IFNldCgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgY29sbGFwc2VBbGxDYXRlZ29yaWVzID0gKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IG5ld1NldCA9IG5ldyBTZXQ8c3RyaW5nPigpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNvcnRlZFRvb2xDYXRlZ29yaWVzLnZhbHVlLmZvckVhY2goKGMpID0+IG5ld1NldC5hZGQoYykpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbGxhcHNlZENhdGVnb3JpZXMudmFsdWUgPSBuZXdTZXQ7XG4gICAgICAgICAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBnZXRDYXRlZ29yeURpc3BsYXlOYW1lID0gKGNhdGVnb3J5OiBzdHJpbmcpOiBzdHJpbmcgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChpc0V4dGVybmFsQ2F0ZWdvcnkoY2F0ZWdvcnkpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBg5aSW6YOoIMK3ICR7Y2F0ZWdvcnl9YDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgY2F0ZWdvcnlOYW1lczogeyBba2V5OiBzdHJpbmddOiBzdHJpbmcgfSA9IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2NlbmU6ICflnLrmma/lt6XlhbcnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBub2RlOiAn6IqC54K55bel5YW3JyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29tcG9uZW50OiAn57uE5Lu25bel5YW3JyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcHJlZmFiOiAn6aKE5Yi25L2T5bel5YW3JyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcHJvamVjdDogJ+mhueebruW3peWFtycsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlYnVnOiAn6LCD6K+V5bel5YW3JyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcHJlZmVyZW5jZXM6ICflgY/lpb3orr7nva7lt6XlhbcnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZXJ2ZXI6ICfmnI3liqHlmajlt6XlhbcnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBicm9hZGNhc3Q6ICflub/mkq3lt6XlhbcnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzY2VuZUFkdmFuY2VkOiAn6auY57qn5Zy65pmv5bel5YW3JyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2NlbmVWaWV3OiAn5Zy65pmv6KeG5Zu+5bel5YW3JyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVmZXJlbmNlSW1hZ2U6ICflj4LogIPlm77niYflt6XlhbcnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhc3NldEFkdmFuY2VkOiAn6auY57qn6LWE5rqQ5bel5YW3JyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsaWRhdGlvbjogJ+mqjOivgeW3peWFtycsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gY2F0ZWdvcnlOYW1lc1tjYXRlZ29yeV0gfHwgY2F0ZWdvcnk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgc3RhdHVzUG9sbFRpbWVyOiBSZXR1cm5UeXBlPHR5cGVvZiBzZXRJbnRlcnZhbD4gfCBudWxsID0gbnVsbDtcblxuICAgICAgICAgICAgICAgICAgICAgICAgb25Nb3VudGVkKGFzeW5jICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhd2FpdCBsb2FkVG9vbE1hbmFnZXJTdGF0ZSgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGF3YWl0IHJlZnJlc2hTZXJ2ZXJTdGF0dXMoKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0YXR1c1BvbGxUaW1lciA9IHNldEludGVydmFsKCgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGFjdGl2ZVRhYi52YWx1ZSA9PT0gJ3NlcnZlcicgJiYgIWlzUHJvY2Vzc2luZy52YWx1ZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdm9pZCByZWZyZXNoU2VydmVyU3RhdHVzKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LCAzMDAwKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICBvblVubW91bnRlZCgoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHN0YXR1c1BvbGxUaW1lcikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjbGVhckludGVydmFsKHN0YXR1c1BvbGxUaW1lcik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0YXR1c1BvbGxUaW1lciA9IG51bGw7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhbmVsSG9zdC5fcmVmcmVzaFRvb2xzID0gdW5kZWZpbmVkO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhbmVsSG9zdC5fcmVmcmVzaFN0YXR1cyA9IHVuZGVmaW5lZDtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFjdGl2ZVRhYixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZXJ2ZXJSdW5uaW5nLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNlcnZlclN0YXR1cyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25uZWN0ZWRDbGllbnRzLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGh0dHBVcmwsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaXNQcm9jZXNzaW5nLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNlcnZlckFjdGlvbkVycm9yLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNldHRpbmdzRmVlZGJhY2ssXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2V0dGluZ3NGZWVkYmFja0tpbmQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2V0dGluZ3MsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYXZhaWxhYmxlVG9vbHMsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdG9vbENhdGVnb3JpZXMsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc29ydGVkVG9vbENhdGVnb3JpZXMsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZXh0ZXJuYWxQcm92aWRlcnMsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2V0dGluZ3NDaGFuZ2VkLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNldHRpbmdzVmFsaWRhdGlvbkVycm9yLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNlcnZlclRvZ2dsZUxhYmVsLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0YXR1c0NsYXNzLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRvdGFsVG9vbHMsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZW5hYmxlZFRvb2xzLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRpc2FibGVkVG9vbHMsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnVpbHRpblRvb2xDb3VudCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBleHRlcm5hbFRvb2xDb3VudCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb2xsYXBzZWRDYXRlZ29yaWVzLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN3aXRjaFRhYixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0b2dnbGVTZXJ2ZXIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2F2ZVNldHRpbmdzLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvcHlVcmwsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb25BdXRvU3RhcnRDaGFuZ2UsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb25EZWJ1Z0xvZ0NoYW5nZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvblBvcnRDaGFuZ2UsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb25NYXhDb25uZWN0aW9uc0NoYW5nZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsb2FkVG9vbE1hbmFnZXJTdGF0ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB1cGRhdGVUb29sU3RhdHVzLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNlbGVjdEFsbFRvb2xzLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlc2VsZWN0QWxsVG9vbHMsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2F2ZUNoYW5nZXMsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdG9nZ2xlQ2F0ZWdvcnlUb29scyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBnZXRUb29sc0J5Q2F0ZWdvcnksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZ2V0Q2F0ZWdvcnlEaXNwbGF5TmFtZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpc0V4dGVybmFsQ2F0ZWdvcnksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaXNDYXRlZ29yeUNvbGxhcHNlZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0b2dnbGVDYXRlZ29yeUNvbGxhcHNlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGV4cGFuZEFsbENhdGVnb3JpZXMsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29sbGFwc2VBbGxDYXRlZ29yaWVzLFxuICAgICAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgdGVtcGxhdGU6IHJlYWRGaWxlU3luYyhcbiAgICAgICAgICAgICAgICAgICAgICAgIGpvaW4oX19kaXJuYW1lLCAnLi4vLi4vLi4vc3RhdGljL3RlbXBsYXRlL3Z1ZS9tY3Atc2VydmVyLWFwcC5odG1sJyksXG4gICAgICAgICAgICAgICAgICAgICAgICAndXRmLTgnXG4gICAgICAgICAgICAgICAgICAgICksXG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICk7XG5cbiAgICAgICAgICAgIGFwcC5tb3VudCh0aGlzLiQuYXBwKTtcbiAgICAgICAgICAgIHBhbmVsRGF0YU1hcC5zZXQodGhpcywgYXBwKTtcblxuICAgICAgICAgICAgY29uc3QgYWRkQnJvYWRjYXN0TGlzdGVuZXIgPSAoXG4gICAgICAgICAgICAgICAgRWRpdG9yLk1lc3NhZ2UgYXMgeyBhZGRCcm9hZGNhc3RMaXN0ZW5lcj86IChuYW1lOiBzdHJpbmcsIGNiOiAoKSA9PiB2b2lkKSA9PiAoKSA9PiB2b2lkIH1cbiAgICAgICAgICAgICkuYWRkQnJvYWRjYXN0TGlzdGVuZXI7XG4gICAgICAgICAgICBpZiAodHlwZW9mIGFkZEJyb2FkY2FzdExpc3RlbmVyID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICAgICAgcGFuZWxIb3N0Ll90b29sc0Jyb2FkY2FzdFVuc3Vic2NyaWJlID0gYWRkQnJvYWRjYXN0TGlzdGVuZXIuY2FsbChcbiAgICAgICAgICAgICAgICAgICAgRWRpdG9yLk1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgICAgICdtY3AtdG9vbHMtY2hhbmdlZCcsXG4gICAgICAgICAgICAgICAgICAgICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZvaWQgcGFuZWxIb3N0Ll9yZWZyZXNoVG9vbHM/LigpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgY29uc29sZS5sb2coJ1tNQ1AgUGFuZWxdIFZ1ZTMgYXBwIG1vdW50ZWQgc3VjY2Vzc2Z1bGx5Jyk7XG4gICAgICAgIH1cbiAgICB9LFxuICAgIGJlZm9yZUNsb3NlKHRoaXM6IFBhbmVsSG9zdCkge1xuICAgICAgICBpZiAodHlwZW9mIHRoaXMuX3Rvb2xzQnJvYWRjYXN0VW5zdWJzY3JpYmUgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgIHRoaXMuX3Rvb2xzQnJvYWRjYXN0VW5zdWJzY3JpYmUoKTtcbiAgICAgICAgfVxuICAgIH0sXG4gICAgY2xvc2UoKSB7XG4gICAgICAgIGNvbnN0IGFwcCA9IHBhbmVsRGF0YU1hcC5nZXQodGhpcyk7XG4gICAgICAgIGlmIChhcHApIHtcbiAgICAgICAgICAgIGFwcC51bm1vdW50KCk7XG4gICAgICAgIH1cbiAgICB9LFxufSk7XG4iXX0=