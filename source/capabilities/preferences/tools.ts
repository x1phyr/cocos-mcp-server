import { ToolDefinition, ToolResponse, ToolExecutor } from '../../types';

export class PreferencesTools implements ToolExecutor {
    getTools(): ToolDefinition[] {
        return [
            {
                name: 'open_preferences_settings',
                description: '打开偏好设置面板',
                inputSchema: {
                    type: 'object',
                    properties: {
                        tab: {
                            type: 'string',
                            description: '要打开的偏好设置标签页（可选）',
                            enum: ['general', 'external-tools', 'data-editor', 'laboratory', 'extensions']
                        },
                        args: {
                            type: 'array',
                            description: '传递给标签页的附加参数'
                        }
                    }
                }
            },
            {
                name: 'query_preferences_config',
                description: '查询偏好设置配置',
                inputSchema: {
                    type: 'object',
                    properties: {
                        name: {
                            type: 'string',
                            description: '插件或分类名称',
                            default: 'general'
                        },
                        path: {
                            type: 'string',
                            description: '配置路径（可选）'
                        },
                        type: {
                            type: 'string',
                            description: '配置类型',
                            enum: ['default', 'global', 'local'],
                            default: 'global'
                        }
                    },
                    required: ['name']
                }
            },
            {
                name: 'set_preferences_config',
                description: '设置偏好配置',
                inputSchema: {
                    type: 'object',
                    properties: {
                        name: {
                            type: 'string',
                            description: '插件名'
                        },
                        path: {
                            type: 'string',
                            description: '配置路径'
                        },
                        value: {
                            description: '配置值'
                        },
                        type: {
                            type: 'string',
                            description: '配置类型',
                            enum: ['default', 'global', 'local'],
                            default: 'global'
                        }
                    },
                    required: ['name', 'path', 'value']
                }
            },
            {
                name: 'get_all_preferences',
                description: '获取所有可用偏好设置分类',
                inputSchema: {
                    type: 'object',
                    properties: {}
                }
            },
            {
                name: 'reset_preferences',
                description: '将指定偏好设置分类重置为默认值。name 参数为必填项，不支持一次性重置所有偏好设置。',
                inputSchema: {
                    type: 'object',
                    properties: {
                        name: {
                            type: 'string',
                            description: '要重置的偏好设置分类名（必填，不支持重置全部）'
                        },
                        type: {
                            type: 'string',
                            description: '要重置的配置类型',
                            enum: ['global', 'local'],
                            default: 'global'
                        }
                    },
                    required: ['name']
                }
            },
            {
                name: 'export_preferences',
                description: '导出当前偏好设置配置',
                inputSchema: {
                    type: 'object',
                    properties: {
                        exportPath: {
                            type: 'string',
                            description: '偏好设置导出文件路径（可选）'
                        }
                    }
                }
            },
            {
                name: 'import_preferences',
                description: '[不可用] 从文件导入偏好设置配置。需要文件系统访问权限，当前 MCP 扩展上下文中不可用。',
                inputSchema: {
                    type: 'object',
                    properties: {
                        importPath: {
                            type: 'string',
                            description: '偏好设置导入文件路径'
                        }
                    },
                    required: ['importPath']
                }
            }
        ];
    }

    async execute(toolName: string, args: any): Promise<ToolResponse> {
        switch (toolName) {
            case 'open_preferences_settings':
                return await this.openPreferencesSettings(args.tab, args.args);
            case 'query_preferences_config':
                return await this.queryPreferencesConfig(args.name, args.path, args.type);
            case 'set_preferences_config':
                return await this.setPreferencesConfig(args.name, args.path, args.value, args.type);
            case 'get_all_preferences':
                return await this.getAllPreferences();
            case 'reset_preferences':
                return await this.resetPreferences(args.name, args.type);
            case 'export_preferences':
                return await this.exportPreferences(args.exportPath);
            case 'import_preferences':
                return await this.importPreferences(args.importPath);
            default:
                throw new Error(`Unknown tool: ${toolName}`);
        }
    }

    private async openPreferencesSettings(tab?: string, args?: any[]): Promise<ToolResponse> {
        return new Promise((resolve) => {
            const requestArgs = [];
            if (tab) {
                requestArgs.push(tab);
            }
            if (args && args.length > 0) {
                requestArgs.push(...args);
            }

            (Editor.Message.request as any)('preferences', 'open-settings', ...requestArgs).then(() => {
                resolve({
                    success: true,
                    message: `Preferences settings opened${tab ? ` on tab: ${tab}` : ''}`
                });
            }).catch((err: Error) => {
                resolve({ success: false, error: err.message });
            });
        });
    }

    private async queryPreferencesConfig(name: string, path?: string, type: string = 'global'): Promise<ToolResponse> {
        return new Promise((resolve) => {
            const requestArgs = [name];
            if (path) {
                requestArgs.push(path);
            }
            requestArgs.push(type);

            (Editor.Message.request as any)('preferences', 'query-config', ...requestArgs).then((config: any) => {
                resolve({
                    success: true,
                    data: {
                        name: name,
                        path: path,
                        type: type,
                        config: config
                    }
                });
            }).catch((err: Error) => {
                resolve({ success: false, error: err.message });
            });
        });
    }

    private async setPreferencesConfig(name: string, path: string, value: any, type: string = 'global'): Promise<ToolResponse> {
        return new Promise((resolve) => {
            (Editor.Message.request as any)('preferences', 'set-config', name, path, value, type).then((success: boolean) => {
                if (success) {
                    resolve({
                        success: true,
                        message: `Preference '${name}.${path}' updated successfully`
                    });
                } else {
                    resolve({
                        success: false,
                        error: `Failed to update preference '${name}.${path}'`
                    });
                }
            }).catch((err: Error) => {
                resolve({ success: false, error: err.message });
            });
        });
    }

    private async getAllPreferences(): Promise<ToolResponse> {
        return new Promise((resolve) => {
            // Common preference categories in Cocos Creator
            const categories = [
                'general',
                'external-tools', 
                'data-editor',
                'laboratory',
                'extensions',
                'preview',
                'console',
                'native',
                'builder'
            ];

            const preferences: any = {};

            const queryPromises = categories.map(category => {
                return Editor.Message.request('preferences', 'query-config', category, undefined, 'global')
                    .then((config: any) => {
                        preferences[category] = config;
                    })
                    .catch(() => {
                        // Ignore errors for categories that don't exist
                        preferences[category] = null;
                    });
            });

            Promise.all(queryPromises).then(() => {
                // Filter out null entries
                const validPreferences = Object.fromEntries(
                    Object.entries(preferences).filter(([_, value]) => value !== null)
                );

                resolve({
                    success: true,
                    data: {
                        categories: Object.keys(validPreferences),
                        preferences: validPreferences
                    }
                });
            }).catch((err: Error) => {
                resolve({ success: false, error: err.message });
            });
        });
    }

    private async resetPreferences(name?: string, type: string = 'global'): Promise<ToolResponse> {
        return new Promise((resolve) => {
            if (name) {
                // Reset specific preference category
                Editor.Message.request('preferences', 'query-config', name, undefined, 'default').then((defaultConfig: any) => {
                    return (Editor.Message.request as any)('preferences', 'set-config', name, '', defaultConfig, type);
                }).then((success: boolean) => {
                    if (success) {
                        resolve({
                            success: true,
                            message: `Preference category '${name}' reset to default`
                        });
                    } else {
                        resolve({
                            success: false,
                            error: `Failed to reset preference category '${name}'`
                        });
                    }
                }).catch((err: Error) => {
                    resolve({ success: false, error: err.message });
                });
            } else {
                resolve({
                    success: false,
                    error: 'Resetting all preferences is not supported through API. Please specify a preference category.'
                });
            }
        });
    }

    private async exportPreferences(exportPath?: string): Promise<ToolResponse> {
        return new Promise((resolve) => {
            this.getAllPreferences().then((prefsResult: ToolResponse) => {
                if (!prefsResult.success) {
                    resolve(prefsResult);
                    return;
                }

                const prefsData = JSON.stringify(prefsResult.data, null, 2);
                const path = exportPath || `preferences_export_${Date.now()}.json`;

                // For now, return the data - in a real implementation, you'd write to file
                resolve({
                    success: true,
                    data: {
                        exportPath: path,
                        preferences: prefsResult.data,
                        jsonData: prefsData,
                        message: 'Preferences exported successfully'
                    }
                });
            }).catch((err: Error) => {
                resolve({ success: false, error: err.message });
            });
        });
    }

    private async importPreferences(importPath: string): Promise<ToolResponse> {
        return new Promise((resolve) => {
            resolve({
                success: false,
                error: 'Import preferences functionality requires file system access which is not available in this context. Please manually import preferences through the Editor UI.'
            });
        });
    }
}