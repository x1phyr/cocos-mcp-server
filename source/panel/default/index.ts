/* eslint-disable vue/one-component-per-file */

import { readFileSync } from 'fs-extra';
import { join } from 'path';
import { DEFAULT_MCP_PORT } from '../../core/constants';
import { validateMcpServerSettings } from '../../core/settings';
import { BUILTIN_TOOL_CATEGORIES } from '../../registry/builtin-categories';
import { MCPServerSettings } from '../../types';
import { createApp, App, defineComponent, ref, computed, onMounted, onUnmounted, watch } from 'vue';

const panelDataMap = new WeakMap<any, App>();

interface ToolConfig {
    category: string;
    name: string;
    enabled: boolean;
    description: string;
}

interface ExternalProviderSummary {
    providerId: string;
    namespace: string;
    tools: { name: string; description: string }[];
}

interface PanelHost {
    $: { app?: HTMLElement };
    _refreshTools?: () => void | Promise<void>;
    _refreshStatus?: () => void | Promise<void>;
    _toolsBroadcastUnsubscribe?: () => void;
}

function buildMcpSettings(settings: ServerSettings): MCPServerSettings {
    return {
        port: Number(settings.port),
        autoStart: settings.autoStart,
        enableDebugLog: settings.debugLog,
        allowedOrigins: ['*'],
        maxConnections: Number(settings.maxConnections),
    };
}

interface ServerSettings {
    port: number;
    autoStart: boolean;
    debugLog: boolean;
    maxConnections: number;
}

module.exports = Editor.Panel.define({
    listeners: {
        show(this: PanelHost) {
            console.log('[MCP Panel] Panel shown');
            void this._refreshStatus?.();
            void this._refreshTools?.();
        },
        hide() {
            console.log('[MCP Panel] Panel hidden');
        },
    },
    template: readFileSync(join(__dirname, '../../../static/template/default/index.html'), 'utf-8'),
    style: readFileSync(join(__dirname, '../../../static/style/default/index.css'), 'utf-8'),
    $: {
        app: '#app',
        panelTitle: '#panelTitle',
    },
    ready(this: PanelHost) {
        const panelHost = this;

        if (this.$.app) {
            const app = createApp({});
            app.config.compilerOptions.isCustomElement = (tag) => tag.startsWith('ui-');

            app.component(
                'McpServerApp',
                defineComponent({
                    setup() {
                        const activeTab = ref('server');
                        const serverRunning = ref(false);
                        const serverStatus = ref('已停止');
                        const connectedClients = ref(0);
                        const httpUrl = ref('');
                        const isProcessing = ref(false);
                        const serverActionError = ref('');
                        const settingsFeedback = ref('');
                        const settingsFeedbackKind = ref<'success' | 'error' | ''>('');

                        const settings = ref<ServerSettings>({
                            port: DEFAULT_MCP_PORT,
                            autoStart: false,
                            debugLog: false,
                            maxConnections: 10,
                        });

                        const availableTools = ref<ToolConfig[]>([]);
                        const toolCategories = ref<string[]>([]);
                        const externalProviders = ref<ExternalProviderSummary[]>([]);
                        const settingsChanged = ref(false);
                        let isLoadingSettings = false; // 防止从服务器加载设置时误触 settingsChanged

                        const statusClass = computed(() => ({
                            running: serverRunning.value,
                            stopped: !serverRunning.value,
                        }));

                        const totalTools = computed(() => availableTools.value.length);
                        const enabledTools = computed(() => availableTools.value.filter((t) => t.enabled).length);
                        const disabledTools = computed(() => totalTools.value - enabledTools.value);
                        const builtinToolCount = computed(
                            () => availableTools.value.filter((t) => BUILTIN_TOOL_CATEGORIES.has(t.category)).length
                        );
                        const externalToolCount = computed(() => totalTools.value - builtinToolCount.value);

                        const sortedToolCategories = computed(() => {
                            const builtins = toolCategories.value
                                .filter((c) => BUILTIN_TOOL_CATEGORIES.has(c))
                                .sort();
                            const external = toolCategories.value
                                .filter((c) => !BUILTIN_TOOL_CATEGORIES.has(c))
                                .sort();
                            return [...builtins, ...external];
                        });

                        const settingsValidationError = computed(() =>
                            validateMcpServerSettings(buildMcpSettings(settings.value))
                        );

                        const serverToggleLabel = computed(() => {
                            if (isProcessing.value) {
                                return serverRunning.value ? '正在停止…' : '正在启动…';
                            }
                            return serverRunning.value ? '停止服务器' : '启动服务器';
                        });

                        const isExternalCategory = (category: string) => !BUILTIN_TOOL_CATEGORIES.has(category);

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
                                            port: result.settings.port || DEFAULT_MCP_PORT,
                                            autoStart: result.settings.autoStart || false,
                                            debugLog: result.settings.enableDebugLog || false,
                                            maxConnections: result.settings.maxConnections || 10,
                                        };
                                        settingsChanged.value = false;
                                        setTimeout(() => { isLoadingSettings = false; }, 0);
                                    }
                                }
                            } catch (error) {
                                console.error('[Vue App] Failed to refresh server status:', error);
                            }
                        };

                        const loadExternalSummary = async () => {
                            try {
                                const result = await Editor.Message.request(
                                    'cocos-mcp-server',
                                    'mcp-list-external-tools'
                                );
                                externalProviders.value = result?.providers ?? [];
                            } catch (error) {
                                console.error('[Vue App] Failed to load external tools summary:', error);
                                externalProviders.value = [];
                            }
                        };

                        const loadToolManagerState = async () => {
                            try {
                                const result = await Editor.Message.request(
                                    'cocos-mcp-server',
                                    'getToolManagerState'
                                );
                                if (result && result.success) {
                                    availableTools.value = result.availableTools || [];
                                    const categories = new Set(availableTools.value.map((tool) => tool.category));
                                    toolCategories.value = Array.from(categories);
                                }
                                await loadExternalSummary();
                            } catch (error) {
                                console.error('[Vue App] Failed to load tool manager state:', error);
                            }
                        };

                        panelHost._refreshTools = loadToolManagerState;
                        panelHost._refreshStatus = refreshServerStatus;

                        const switchTab = (tabName: string) => {
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
                                } else {
                                    const validationError = validateMcpServerSettings(
                                        buildMcpSettings(settings.value)
                                    );
                                    if (validationError) {
                                        serverActionError.value = validationError;
                                        return;
                                    }
                                    await Editor.Message.request(
                                        'cocos-mcp-server',
                                        'update-settings',
                                        buildMcpSettings(settings.value)
                                    );
                                    await Editor.Message.request('cocos-mcp-server', 'start-server');
                                }
                                await refreshServerStatus();
                            } catch (error: any) {
                                serverActionError.value = error?.message || String(error);
                            } finally {
                                isProcessing.value = false;
                            }
                        };

                        const saveSettings = async () => {
                            settingsFeedback.value = '';
                            settingsFeedbackKind.value = '';
                            const validationError = validateMcpServerSettings(buildMcpSettings(settings.value));
                            if (validationError) {
                                settingsFeedback.value = validationError;
                                settingsFeedbackKind.value = 'error';
                                return;
                            }
                            try {
                                isProcessing.value = true;
                                await Editor.Message.request(
                                    'cocos-mcp-server',
                                    'update-settings',
                                    buildMcpSettings(settings.value)
                                );
                                settingsChanged.value = false;
                                settingsFeedback.value = '设置已保存';
                                settingsFeedbackKind.value = 'success';
                                await refreshServerStatus();
                            } catch (error: any) {
                                settingsFeedback.value = error?.message || '保存设置失败';
                                settingsFeedbackKind.value = 'error';
                            } finally {
                                isProcessing.value = false;
                            }
                        };

                        const copyUrl = async () => {
                            try {
                                await navigator.clipboard.writeText(httpUrl.value);
                                settingsFeedback.value = 'HTTP 地址已复制';
                                settingsFeedbackKind.value = 'success';
                            } catch (error) {
                                console.error('[Vue App] Failed to copy URL:', error);
                            }
                        };

                        const updateToolStatus = async (category: string, name: string, enabled: boolean) => {
                            const toolIndex = availableTools.value.findIndex(
                                (t) => t.category === category && t.name === name
                            );
                            if (toolIndex === -1) {
                                return;
                            }
                            const previous = availableTools.value[toolIndex].enabled;
                            availableTools.value[toolIndex].enabled = enabled;
                            availableTools.value = [...availableTools.value];
                            try {
                                const result = await Editor.Message.request(
                                    'cocos-mcp-server',
                                    'updateToolStatus',
                                    category,
                                    name,
                                    enabled
                                );
                                if (!result || !result.success) {
                                    availableTools.value[toolIndex].enabled = previous;
                                    availableTools.value = [...availableTools.value];
                                }
                            } catch (error) {
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

                        const toggleCategoryTools = async (category: string, enabled: boolean) => {
                            availableTools.value.forEach((tool) => {
                                if (tool.category === category) {
                                    tool.enabled = enabled;
                                }
                            });
                            await saveChanges();
                        };

                        const getToolsByCategory = (category: string) => {
                            return availableTools.value.filter((tool) => tool.category === category);
                        };

                        // --- 分类折叠状态 (默认全部折叠) ---
                        const collapsedCategories = ref<Set<string>>(new Set());

                        // 初始化时全部折叠
                        watch(sortedToolCategories, (cats) => {
                            const newSet = new Set<string>();
                            cats.forEach((c) => newSet.add(c));
                            collapsedCategories.value = newSet;
                        }, { immediate: true });

                        const isCategoryCollapsed = (category: string): boolean => {
                            return collapsedCategories.value.has(category);
                        };

                        const toggleCategoryCollapse = (category: string) => {
                            const newSet = new Set(collapsedCategories.value);
                            if (newSet.has(category)) {
                                newSet.delete(category);
                            } else {
                                newSet.add(category);
                            }
                            collapsedCategories.value = newSet;
                        };

                        const expandAllCategories = () => {
                            collapsedCategories.value = new Set();
                        };

                        const collapseAllCategories = () => {
                            const newSet = new Set<string>();
                            sortedToolCategories.value.forEach((c) => newSet.add(c));
                            collapsedCategories.value = newSet;
                        };

                        const getCategoryDisplayName = (category: string): string => {
                            if (isExternalCategory(category)) {
                                return `外部 · ${category}`;
                            }
                            const categoryNames: { [key: string]: string } = {
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

                        watch(
                            settings,
                            () => {
                                if (isLoadingSettings) {
                                    return;
                                }
                                settingsChanged.value = true;
                                if (settingsFeedbackKind.value === 'success') {
                                    settingsFeedback.value = '';
                                    settingsFeedbackKind.value = '';
                                }
                            },
                            { deep: true }
                        );

                        let statusPollTimer: ReturnType<typeof setInterval> | null = null;

                        onMounted(async () => {
                            await loadToolManagerState();
                            await refreshServerStatus();

                            statusPollTimer = setInterval(() => {
                                if (activeTab.value === 'server' && !isProcessing.value) {
                                    void refreshServerStatus();
                                }
                            }, 3000);
                        });

                        onUnmounted(() => {
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
                    template: readFileSync(
                        join(__dirname, '../../../static/template/vue/mcp-server-app.html'),
                        'utf-8'
                    ),
                })
            );

            app.mount(this.$.app);
            panelDataMap.set(this, app);

            const addBroadcastListener = (
                Editor.Message as { addBroadcastListener?: (name: string, cb: () => void) => () => void }
            ).addBroadcastListener;
            if (typeof addBroadcastListener === 'function') {
                panelHost._toolsBroadcastUnsubscribe = addBroadcastListener.call(
                    Editor.Message,
                    'mcp-tools-changed',
                    () => {
                        void panelHost._refreshTools?.();
                    }
                );
            }

            console.log('[MCP Panel] Vue3 app mounted successfully');
        }
    },
    beforeClose(this: PanelHost) {
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
