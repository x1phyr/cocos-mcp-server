import { ToolDefinition, ToolResponse, ToolExecutor, ProjectInfo, AssetInfo } from '../../types';
import * as fs from 'fs';
import * as path from 'path';

export class ProjectTools implements ToolExecutor {
    getTools(): ToolDefinition[] {
        return [
            {
                name: 'run_project',
                description: '以预览模式运行项目',
                inputSchema: {
                    type: 'object',
                    properties: {
                        platform: {
                            type: 'string',
                            description: '目标平台',
                            enum: ['browser', 'simulator', 'preview'],
                            default: 'browser'
                        }
                    }
                }
            },
            {
                name: 'build_project',
                description: '构建项目',
                inputSchema: {
                    type: 'object',
                    properties: {
                        platform: {
                            type: 'string',
                            description: '构建平台',
                            enum: ['web-mobile', 'web-desktop', 'ios', 'android', 'windows', 'mac']
                        },
                        debug: {
                            type: 'boolean',
                            description: '是否为调试构建',
                            default: true
                        }
                    },
                    required: ['platform']
                }
            },
            {
                name: 'get_project_info',
                description: '获取项目信息',
                inputSchema: {
                    type: 'object',
                    properties: {}
                }
            },
            {
                name: 'get_project_settings',
                description: '获取项目设置',
                inputSchema: {
                    type: 'object',
                    properties: {
                        category: {
                            type: 'string',
                            description: '设置类别',
                            enum: ['general', 'physics', 'render', 'assets'],
                            default: 'general'
                        }
                    }
                }
            },
            {
                name: 'refresh_assets',
                description: '刷新资源数据库',
                inputSchema: {
                    type: 'object',
                    properties: {
                        folder: {
                            type: 'string',
                            description: '要刷新的特定文件夹（可选）'
                        }
                    }
                }
            },
            {
                name: 'import_asset',
                description: '导入资源文件',
                inputSchema: {
                    type: 'object',
                    properties: {
                        sourcePath: {
                            type: 'string',
                            description: '源文件路径'
                        },
                        targetFolder: {
                            type: 'string',
                            description: '资源目标文件夹'
                        }
                    },
                    required: ['sourcePath', 'targetFolder']
                }
            },
            {
                name: 'get_asset_info',
                description: '获取资源信息',
                inputSchema: {
                    type: 'object',
                    properties: {
                        assetPath: {
                            type: 'string',
                            description: '资源路径（db://assets/...）'
                        }
                    },
                    required: ['assetPath']
                }
            },
            {
                name: 'get_assets',
                description: '按类型获取资源',
                inputSchema: {
                    type: 'object',
                    properties: {
                        type: {
                            type: 'string',
                            description: '资源类型过滤',
                            enum: ['all', 'scene', 'prefab', 'script', 'texture', 'material', 'mesh', 'audio', 'animation'],
                            default: 'all'
                        },
                        folder: {
                            type: 'string',
                            description: '要搜索的文件夹',
                            default: 'db://assets'
                        }
                    }
                }
            },
            {
                name: 'get_build_settings',
                description: '获取构建设置 - 显示当前限制',
                inputSchema: {
                    type: 'object',
                    properties: {}
                }
            },
            {
                name: 'open_build_panel',
                description: '在编辑器中打开构建面板',
                inputSchema: {
                    type: 'object',
                    properties: {}
                }
            },
            {
                name: 'check_builder_status',
                description: '检查构建工作线程是否就绪',
                inputSchema: {
                    type: 'object',
                    properties: {}
                }
            },
            {
                name: 'start_preview_server',
                description: '启动预览服务器',
                inputSchema: {
                    type: 'object',
                    properties: {
                        port: {
                            type: 'number',
                            description: '预览服务器端口',
                            default: 7456
                        }
                    }
                }
            },
            {
                name: 'stop_preview_server',
                description: '停止预览服务器',
                inputSchema: {
                    type: 'object',
                    properties: {}
                }
            },
            {
                name: 'create_asset',
                description: '创建新资源文件或文件夹',
                inputSchema: {
                    type: 'object',
                    properties: {
                        url: {
                            type: 'string',
                            description: '资源 URL（例如 db://assets/newfile.json）'
                        },
                        content: {
                            type: 'string',
                            description: '文件内容（文件夹则为 null）',
                            default: null
                        },
                        overwrite: {
                            type: 'boolean',
                            description: '是否覆盖已有文件',
                            default: false
                        }
                    },
                    required: ['url']
                }
            },
            {
                name: 'copy_asset',
                description: '复制资源到另一位置',
                inputSchema: {
                    type: 'object',
                    properties: {
                        source: {
                            type: 'string',
                            description: '源资源 URL'
                        },
                        target: {
                            type: 'string',
                            description: '目标位置 URL'
                        },
                        overwrite: {
                            type: 'boolean',
                            description: '是否覆盖已有文件',
                            default: false
                        }
                    },
                    required: ['source', 'target']
                }
            },
            {
                name: 'move_asset',
                description: '移动资源到另一位置',
                inputSchema: {
                    type: 'object',
                    properties: {
                        source: {
                            type: 'string',
                            description: '源资源 URL'
                        },
                        target: {
                            type: 'string',
                            description: '目标位置 URL'
                        },
                        overwrite: {
                            type: 'boolean',
                            description: '是否覆盖已有文件',
                            default: false
                        }
                    },
                    required: ['source', 'target']
                }
            },
            {
                name: 'delete_asset',
                description: '删除资源',
                inputSchema: {
                    type: 'object',
                    properties: {
                        url: {
                            type: 'string',
                            description: '要删除的资源 URL'
                        }
                    },
                    required: ['url']
                }
            },
            {
                name: 'save_asset',
                description: '保存资源内容',
                inputSchema: {
                    type: 'object',
                    properties: {
                        url: {
                            type: 'string',
                            description: '资源 URL'
                        },
                        content: {
                            type: 'string',
                            description: '资源内容'
                        }
                    },
                    required: ['url', 'content']
                }
            },
            {
                name: 'reimport_asset',
                description: '重新导入资源',
                inputSchema: {
                    type: 'object',
                    properties: {
                        url: {
                            type: 'string',
                            description: '要重新导入的资源 URL'
                        }
                    },
                    required: ['url']
                }
            },
            {
                name: 'query_asset_path',
                description: '获取资源磁盘路径',
                inputSchema: {
                    type: 'object',
                    properties: {
                        url: {
                            type: 'string',
                            description: '资源 URL'
                        }
                    },
                    required: ['url']
                }
            },
            {
                name: 'query_asset_uuid',
                description: '通过 URL 获取资源 UUID',
                inputSchema: {
                    type: 'object',
                    properties: {
                        url: {
                            type: 'string',
                            description: '资源 URL'
                        }
                    },
                    required: ['url']
                }
            },
            {
                name: 'query_asset_url',
                description: '通过 UUID 获取资源 URL',
                inputSchema: {
                    type: 'object',
                    properties: {
                        uuid: {
                            type: 'string',
                            description: '资源 UUID'
                        }
                    },
                    required: ['uuid']
                }
            },
            {
                name: 'find_asset_by_name',
                description: '按名称查找资源（支持模糊匹配和多结果）',
                inputSchema: {
                    type: 'object',
                    properties: {
                        name: {
                            type: 'string',
                            description: '要搜索的资源名称（支持模糊匹配）'
                        },
                        exactMatch: {
                            type: 'boolean',
                            description: '是否使用精确名称匹配',
                            default: false
                        },
                        assetType: {
                            type: 'string',
                            description: '按资源类型过滤',
                            enum: ['all', 'scene', 'prefab', 'script', 'texture', 'material', 'mesh', 'audio', 'animation', 'spriteFrame'],
                            default: 'all'
                        },
                        folder: {
                            type: 'string',
                            description: '要搜索的文件夹',
                            default: 'db://assets'
                        },
                        maxResults: {
                            type: 'number',
                            description: '返回结果的最大数量',
                            default: 20,
                            minimum: 1,
                            maximum: 100
                        }
                    },
                    required: ['name']
                }
            },
            {
                name: 'get_asset_details',
                description: '获取资源详细信息（包括 spriteFrame 子资源）',
                inputSchema: {
                    type: 'object',
                    properties: {
                        assetPath: {
                            type: 'string',
                            description: '资源路径（db://assets/...）'
                        },
                        includeSubAssets: {
                            type: 'boolean',
                            description: '是否包含子资源（如 spriteFrame、texture）',
                            default: true
                        }
                    },
                    required: ['assetPath']
                }
            }
        ];
    }

    async execute(toolName: string, args: any): Promise<ToolResponse> {
        switch (toolName) {
            case 'run_project':
                return await this.runProject(args.platform);
            case 'build_project':
                return await this.buildProject(args);
            case 'get_project_info':
                return await this.getProjectInfo();
            case 'get_project_settings':
                return await this.getProjectSettings(args.category);
            case 'refresh_assets':
                return await this.refreshAssets(args.folder);
            case 'import_asset':
                return await this.importAsset(args.sourcePath, args.targetFolder);
            case 'get_asset_info':
                return await this.getAssetInfo(args.assetPath);
            case 'get_assets':
                return await this.getAssets(args.type, args.folder);
            case 'get_build_settings':
                return await this.getBuildSettings();
            case 'open_build_panel':
                return await this.openBuildPanel();
            case 'check_builder_status':
                return await this.checkBuilderStatus();
            case 'start_preview_server':
                return await this.startPreviewServer(args.port);
            case 'stop_preview_server':
                return await this.stopPreviewServer();
            case 'create_asset':
                return await this.createAsset(args.url, args.content, args.overwrite);
            case 'copy_asset':
                return await this.copyAsset(args.source, args.target, args.overwrite);
            case 'move_asset':
                return await this.moveAsset(args.source, args.target, args.overwrite);
            case 'delete_asset':
                return await this.deleteAsset(args.url);
            case 'save_asset':
                return await this.saveAsset(args.url, args.content);
            case 'reimport_asset':
                return await this.reimportAsset(args.url);
            case 'query_asset_path':
                return await this.queryAssetPath(args.url);
            case 'query_asset_uuid':
                return await this.queryAssetUuid(args.url);
            case 'query_asset_url':
                return await this.queryAssetUrl(args.uuid);
            case 'find_asset_by_name':
                return await this.findAssetByName(args);
            case 'get_asset_details':
                return await this.getAssetDetails(args.assetPath, args.includeSubAssets);
            default:
                throw new Error(`Unknown tool: ${toolName}`);
        }
    }

    private async runProject(platform: string = 'browser'): Promise<ToolResponse> {
        return new Promise((resolve) => {
            const previewConfig = {
                platform: platform,
                scenes: [] // Will use current scene
            };

            // Note: Preview module is not documented in official API
            // Using fallback approach - open build panel as alternative
            Editor.Message.request('builder', 'open').then(() => {
                resolve({
                    success: true,
                    message: `Build panel opened. Preview functionality requires manual setup.`
                });
            }).catch((err: Error) => {
                resolve({ success: false, error: err.message });
            });
        });
    }

    private async buildProject(args: any): Promise<ToolResponse> {
        return new Promise((resolve) => {
            const buildOptions = {
                platform: args.platform,
                debug: args.debug !== false,
                sourceMaps: args.debug !== false,
                buildPath: `build/${args.platform}`
            };

            // Note: Builder module only supports 'open' and 'query-worker-ready'
            // Building requires manual interaction through the build panel
            Editor.Message.request('builder', 'open').then(() => {
                resolve({
                    success: true,
                    message: `Build panel opened for ${args.platform}. Please configure and start build manually.`,
                    data: { 
                        platform: args.platform,
                        instruction: "Use the build panel to configure and start the build process"
                    }
                });
            }).catch((err: Error) => {
                resolve({ success: false, error: err.message });
            });
        });
    }

    private async getProjectInfo(): Promise<ToolResponse> {
        return new Promise((resolve) => {
            const info: ProjectInfo = {
                name: Editor.Project.name,
                path: Editor.Project.path,
                uuid: Editor.Project.uuid,
                version: (Editor.Project as any).version || '1.0.0',
                cocosVersion: (Editor as any).versions?.cocos || 'Unknown'
            };

            // Note: 'query-info' API doesn't exist, using 'query-config' instead
            Editor.Message.request('project', 'query-config', 'project').then((additionalInfo: any) => {
                if (additionalInfo) {
                    Object.assign(info, { config: additionalInfo });
                }
                resolve({ success: true, data: info });
            }).catch(() => {
                // Return basic info even if detailed query fails
                resolve({ success: true, data: info });
            });
        });
    }

    private async getProjectSettings(category: string = 'general'): Promise<ToolResponse> {
        return new Promise((resolve) => {
            // 使用正确的 project API 查询项目配置
            const configMap: Record<string, string> = {
                general: 'project',
                physics: 'physics',
                render: 'render',
                assets: 'asset-db'
            };

            const configName = configMap[category] || 'project';

            Editor.Message.request('project', 'query-config', configName).then((settings: any) => {
                resolve({
                    success: true,
                    data: {
                        category: category,
                        config: settings,
                        message: `${category} settings retrieved successfully`
                    }
                });
            }).catch((err: Error) => {
                resolve({ success: false, error: err.message });
            });
        });
    }

    private async refreshAssets(folder?: string): Promise<ToolResponse> {
        return new Promise((resolve) => {
            // 使用正确的 asset-db API 刷新资源
            const targetPath = folder || 'db://assets';
            
            Editor.Message.request('asset-db', 'refresh-asset', targetPath).then(() => {
                resolve({
                    success: true,
                    message: `Assets refreshed in: ${targetPath}`
                });
            }).catch((err: Error) => {
                resolve({ success: false, error: err.message });
            });
        });
    }

    private async importAsset(sourcePath: string, targetFolder: string): Promise<ToolResponse> {
        return new Promise((resolve) => {
            if (!fs.existsSync(sourcePath)) {
                resolve({ success: false, error: 'Source file not found' });
                return;
            }

            const fileName = path.basename(sourcePath);
            const targetPath = targetFolder.startsWith('db://') ?
                targetFolder : `db://assets/${targetFolder}`;

            Editor.Message.request('asset-db', 'import-asset', sourcePath, `${targetPath}/${fileName}`).then((result: any) => {
                resolve({
                    success: true,
                    data: {
                        uuid: result.uuid,
                        path: result.url,
                        message: `Asset imported: ${fileName}`
                    }
                });
            }).catch((err: Error) => {
                resolve({ success: false, error: err.message });
            });
        });
    }

    private async getAssetInfo(assetPath: string): Promise<ToolResponse> {
        return new Promise((resolve) => {
            Editor.Message.request('asset-db', 'query-asset-info', assetPath).then((assetInfo: any) => {
                if (!assetInfo) {
                    throw new Error('Asset not found');
                }

                const info: AssetInfo = {
                    name: assetInfo.name,
                    uuid: assetInfo.uuid,
                    path: assetInfo.url,
                    type: assetInfo.type,
                    size: assetInfo.size,
                    isDirectory: assetInfo.isDirectory
                };

                if (assetInfo.meta) {
                    info.meta = {
                        ver: assetInfo.meta.ver,
                        importer: assetInfo.meta.importer
                    };
                }

                resolve({ success: true, data: info });
            }).catch((err: Error) => {
                resolve({ success: false, error: err.message });
            });
        });
    }

    private async getAssets(type: string = 'all', folder: string = 'db://assets'): Promise<ToolResponse> {
        return new Promise((resolve) => {
            let pattern = `${folder}/**/*`;
            
            // 添加类型过滤
            if (type !== 'all') {
                const typeExtensions: Record<string, string> = {
                    'scene': '.scene',
                    'prefab': '.prefab',
                    'script': '.{ts,js}',
                    'texture': '.{png,jpg,jpeg,gif,tga,bmp,psd}',
                    'material': '.mtl',
                    'mesh': '.{fbx,obj,dae}',
                    'audio': '.{mp3,ogg,wav,m4a}',
                    'animation': '.{anim,clip}'
                };
                
                const extension = typeExtensions[type];
                if (extension) {
                    pattern = `${folder}/**/*${extension}`;
                }
            }

            // Note: query-assets API parameters corrected based on documentation
            Editor.Message.request('asset-db', 'query-assets', { pattern: pattern }).then((results: any[]) => {
                const assets = results.map(asset => ({
                    name: asset.name,
                    uuid: asset.uuid,
                    path: asset.url,
                    type: asset.type,
                    size: asset.size || 0,
                    isDirectory: asset.isDirectory || false
                }));
                
                resolve({ 
                    success: true, 
                    data: {
                        type: type,
                        folder: folder,
                        count: assets.length,
                        assets: assets
                    }
                });
            }).catch((err: Error) => {
                resolve({ success: false, error: err.message });
            });
        });
    }

    private async getBuildSettings(): Promise<ToolResponse> {
        return new Promise((resolve) => {
            // 检查构建器是否准备就绪
            Editor.Message.request('builder', 'query-worker-ready').then((ready: boolean) => {
                resolve({
                    success: true,
                    data: {
                        builderReady: ready,
                        message: 'Build settings are limited in MCP plugin environment',
                        availableActions: [
                            'Open build panel with open_build_panel',
                            'Check builder status with check_builder_status',
                            'Start preview server with start_preview_server',
                            'Stop preview server with stop_preview_server'
                        ],
                        limitation: 'Full build configuration requires direct Editor UI access'
                    }
                });
            }).catch((err: Error) => {
                resolve({ success: false, error: err.message });
            });
        });
    }

    private async openBuildPanel(): Promise<ToolResponse> {
        return new Promise((resolve) => {
            Editor.Message.request('builder', 'open').then(() => {
                resolve({
                    success: true,
                    message: 'Build panel opened successfully'
                });
            }).catch((err: Error) => {
                resolve({ success: false, error: err.message });
            });
        });
    }

    private async checkBuilderStatus(): Promise<ToolResponse> {
        return new Promise((resolve) => {
            Editor.Message.request('builder', 'query-worker-ready').then((ready: boolean) => {
                resolve({
                    success: true,
                    data: {
                        ready: ready,
                        status: ready ? 'Builder worker is ready' : 'Builder worker is not ready',
                        message: 'Builder status checked successfully'
                    }
                });
            }).catch((err: Error) => {
                resolve({ success: false, error: err.message });
            });
        });
    }

    private async startPreviewServer(port: number = 7456): Promise<ToolResponse> {
        return new Promise((resolve) => {
            resolve({
                success: false,
                error: 'Preview server control is not supported through MCP API',
                instruction: 'Please start the preview server manually using the editor menu: Project > Preview, or use the preview panel in the editor'
            });
        });
    }

    private async stopPreviewServer(): Promise<ToolResponse> {
        return new Promise((resolve) => {
            resolve({
                success: false,
                error: 'Preview server control is not supported through MCP API',
                instruction: 'Please stop the preview server manually using the preview panel in the editor'
            });
        });
    }

    private async createAsset(url: string, content: string | null = null, overwrite: boolean = false): Promise<ToolResponse> {
        return new Promise((resolve) => {
            const options = {
                overwrite: overwrite,
                rename: !overwrite
            };

            Editor.Message.request('asset-db', 'create-asset', url, content, options).then((result: any) => {
                if (result && result.uuid) {
                    resolve({
                        success: true,
                        data: {
                            uuid: result.uuid,
                            url: result.url,
                            message: content === null ? 'Folder created successfully' : 'File created successfully'
                        }
                    });
                } else {
                    resolve({
                        success: true,
                        data: {
                            url: url,
                            message: content === null ? 'Folder created successfully' : 'File created successfully'
                        }
                    });
                }
            }).catch((err: Error) => {
                resolve({ success: false, error: err.message });
            });
        });
    }

    private async copyAsset(source: string, target: string, overwrite: boolean = false): Promise<ToolResponse> {
        return new Promise((resolve) => {
            const options = {
                overwrite: overwrite,
                rename: !overwrite
            };

            Editor.Message.request('asset-db', 'copy-asset', source, target, options).then((result: any) => {
                if (result && result.uuid) {
                    resolve({
                        success: true,
                        data: {
                            uuid: result.uuid,
                            url: result.url,
                            message: 'Asset copied successfully'
                        }
                    });
                } else {
                    resolve({
                        success: true,
                        data: {
                            source: source,
                            target: target,
                            message: 'Asset copied successfully'
                        }
                    });
                }
            }).catch((err: Error) => {
                resolve({ success: false, error: err.message });
            });
        });
    }

    private async moveAsset(source: string, target: string, overwrite: boolean = false): Promise<ToolResponse> {
        return new Promise((resolve) => {
            const options = {
                overwrite: overwrite,
                rename: !overwrite
            };

            Editor.Message.request('asset-db', 'move-asset', source, target, options).then((result: any) => {
                if (result && result.uuid) {
                    resolve({
                        success: true,
                        data: {
                            uuid: result.uuid,
                            url: result.url,
                            message: 'Asset moved successfully'
                        }
                    });
                } else {
                    resolve({
                        success: true,
                        data: {
                            source: source,
                            target: target,
                            message: 'Asset moved successfully'
                        }
                    });
                }
            }).catch((err: Error) => {
                resolve({ success: false, error: err.message });
            });
        });
    }

    private async deleteAsset(url: string): Promise<ToolResponse> {
        return new Promise((resolve) => {
            Editor.Message.request('asset-db', 'delete-asset', url).then((result: any) => {
                resolve({
                    success: true,
                    data: {
                        url: url,
                        message: 'Asset deleted successfully'
                    }
                });
            }).catch((err: Error) => {
                resolve({ success: false, error: err.message });
            });
        });
    }

    private async saveAsset(url: string, content: string): Promise<ToolResponse> {
        return new Promise((resolve) => {
            Editor.Message.request('asset-db', 'save-asset', url, content).then((result: any) => {
                if (result && result.uuid) {
                    resolve({
                        success: true,
                        data: {
                            uuid: result.uuid,
                            url: result.url,
                            message: 'Asset saved successfully'
                        }
                    });
                } else {
                    resolve({
                        success: true,
                        data: {
                            url: url,
                            message: 'Asset saved successfully'
                        }
                    });
                }
            }).catch((err: Error) => {
                resolve({ success: false, error: err.message });
            });
        });
    }

    private async reimportAsset(url: string): Promise<ToolResponse> {
        return new Promise((resolve) => {
            Editor.Message.request('asset-db', 'reimport-asset', url).then(() => {
                resolve({
                    success: true,
                    data: {
                        url: url,
                        message: 'Asset reimported successfully'
                    }
                });
            }).catch((err: Error) => {
                resolve({ success: false, error: err.message });
            });
        });
    }

    private async queryAssetPath(url: string): Promise<ToolResponse> {
        return new Promise((resolve) => {
            Editor.Message.request('asset-db', 'query-path', url).then((path: string | null) => {
                if (path) {
                    resolve({
                        success: true,
                        data: {
                            url: url,
                            path: path,
                            message: 'Asset path retrieved successfully'
                        }
                    });
                } else {
                    resolve({ success: false, error: 'Asset path not found' });
                }
            }).catch((err: Error) => {
                resolve({ success: false, error: err.message });
            });
        });
    }

    private async queryAssetUuid(url: string): Promise<ToolResponse> {
        return new Promise((resolve) => {
            Editor.Message.request('asset-db', 'query-uuid', url).then((uuid: string | null) => {
                if (uuid) {
                    resolve({
                        success: true,
                        data: {
                            url: url,
                            uuid: uuid,
                            message: 'Asset UUID retrieved successfully'
                        }
                    });
                } else {
                    resolve({ success: false, error: 'Asset UUID not found' });
                }
            }).catch((err: Error) => {
                resolve({ success: false, error: err.message });
            });
        });
    }

    private async queryAssetUrl(uuid: string): Promise<ToolResponse> {
        return new Promise((resolve) => {
            Editor.Message.request('asset-db', 'query-url', uuid).then((url: string | null) => {
                if (url) {
                    resolve({
                        success: true,
                        data: {
                            uuid: uuid,
                            url: url,
                            message: 'Asset URL retrieved successfully'
                        }
                    });
                } else {
                    resolve({ success: false, error: 'Asset URL not found' });
                }
            }).catch((err: Error) => {
                resolve({ success: false, error: err.message });
            });
        });
    }

    private async findAssetByName(args: any): Promise<ToolResponse> {
        const { name, exactMatch = false, assetType = 'all', folder = 'db://assets', maxResults = 20 } = args;

        try {
                // Get all assets in the specified folder
                const allAssetsResponse = await this.getAssets(assetType, folder);
                if (!allAssetsResponse.success || !allAssetsResponse.data) {
                    return {
                        success: false,
                        error: `Failed to get assets: ${allAssetsResponse.error}`
                    };
                }
                
                const allAssets = allAssetsResponse.data.assets as any[];
                let matchedAssets: any[] = [];
                
                // Search for matching assets
                for (const asset of allAssets) {
                    const assetName = asset.name;
                    let matches = false;
                    
                    if (exactMatch) {
                        matches = assetName === name;
                    } else {
                        matches = assetName.toLowerCase().includes(name.toLowerCase());
                    }
                    
                    if (matches) {
                        // Get detailed asset info if needed
                        try {
                            const detailResponse = await this.getAssetInfo(asset.path);
                            if (detailResponse.success) {
                                matchedAssets.push({
                                    ...asset,
                                    details: detailResponse.data
                                });
                            } else {
                                matchedAssets.push(asset);
                            }
                        } catch {
                            matchedAssets.push(asset);
                        }
                        
                        if (matchedAssets.length >= maxResults) {
                            break;
                        }
                    }
                }
                
                return {
                    success: true,
                    data: {
                        searchTerm: name,
                        exactMatch,
                        assetType,
                        folder,
                        totalFound: matchedAssets.length,
                        maxResults,
                        assets: matchedAssets,
                        message: `Found ${matchedAssets.length} assets matching '${name}'`
                    }
                };

            } catch (error: any) {
                return {
                    success: false,
                    error: `Asset search failed: ${error.message}`
                };
            }
    }
    
    private async getAssetDetails(assetPath: string, includeSubAssets: boolean = true): Promise<ToolResponse> {
        try {
                // Get basic asset info
                const assetInfoResponse = await this.getAssetInfo(assetPath);
                if (!assetInfoResponse.success) {
                    return assetInfoResponse;
                }
                
                const assetInfo = assetInfoResponse.data;
                const detailedInfo: any = {
                    ...assetInfo,
                    subAssets: []
                };
                
                if (includeSubAssets && assetInfo) {
                    // For image assets, try to get spriteFrame and texture sub-assets
                    if (assetInfo.type === 'cc.ImageAsset' || assetPath.match(/\.(png|jpg|jpeg|gif|tga|bmp|psd)$/i)) {
                        // Generate common sub-asset UUIDs
                        const baseUuid = assetInfo.uuid;
                        const possibleSubAssets = [
                            { type: 'spriteFrame', uuid: `${baseUuid}@f9941`, suffix: '@f9941' },
                            { type: 'texture', uuid: `${baseUuid}@6c48a`, suffix: '@6c48a' },
                            { type: 'texture2D', uuid: `${baseUuid}@6c48a`, suffix: '@6c48a' }
                        ];
                        
                        for (const subAsset of possibleSubAssets) {
                            try {
                                // Try to get URL for the sub-asset to verify it exists
                                const subAssetUrl = await Editor.Message.request('asset-db', 'query-url', subAsset.uuid);
                                if (subAssetUrl) {
                                    detailedInfo.subAssets.push({
                                        type: subAsset.type,
                                        uuid: subAsset.uuid,
                                        url: subAssetUrl,
                                        suffix: subAsset.suffix
                                    });
                                }
                            } catch {
                                // Sub-asset doesn't exist, skip it
                            }
                        }
                    }
                }
                
                return {
                    success: true,
                    data: {
                        assetPath,
                        includeSubAssets,
                        ...detailedInfo,
                        message: `Asset details retrieved. Found ${detailedInfo.subAssets.length} sub-assets.`
                    }
                };

            } catch (error: any) {
                return {
                    success: false,
                    error: `Failed to get asset details: ${error.message}`
                };
            }
    }
}