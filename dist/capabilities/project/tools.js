"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProjectTools = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
class ProjectTools {
    getTools() {
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
    async execute(toolName, args) {
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
    async runProject(platform = 'browser') {
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
            }).catch((err) => {
                resolve({ success: false, error: err.message });
            });
        });
    }
    async buildProject(args) {
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
            }).catch((err) => {
                resolve({ success: false, error: err.message });
            });
        });
    }
    async getProjectInfo() {
        return new Promise((resolve) => {
            var _a;
            const info = {
                name: Editor.Project.name,
                path: Editor.Project.path,
                uuid: Editor.Project.uuid,
                version: Editor.Project.version || '1.0.0',
                cocosVersion: ((_a = Editor.versions) === null || _a === void 0 ? void 0 : _a.cocos) || 'Unknown'
            };
            // Note: 'query-info' API doesn't exist, using 'query-config' instead
            Editor.Message.request('project', 'query-config', 'project').then((additionalInfo) => {
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
    async getProjectSettings(category = 'general') {
        return new Promise((resolve) => {
            // 使用正确的 project API 查询项目配置
            const configMap = {
                general: 'project',
                physics: 'physics',
                render: 'render',
                assets: 'asset-db'
            };
            const configName = configMap[category] || 'project';
            Editor.Message.request('project', 'query-config', configName).then((settings) => {
                resolve({
                    success: true,
                    data: {
                        category: category,
                        config: settings,
                        message: `${category} settings retrieved successfully`
                    }
                });
            }).catch((err) => {
                resolve({ success: false, error: err.message });
            });
        });
    }
    async refreshAssets(folder) {
        return new Promise((resolve) => {
            // 使用正确的 asset-db API 刷新资源
            const targetPath = folder || 'db://assets';
            Editor.Message.request('asset-db', 'refresh-asset', targetPath).then(() => {
                resolve({
                    success: true,
                    message: `Assets refreshed in: ${targetPath}`
                });
            }).catch((err) => {
                resolve({ success: false, error: err.message });
            });
        });
    }
    async importAsset(sourcePath, targetFolder) {
        return new Promise((resolve) => {
            if (!fs.existsSync(sourcePath)) {
                resolve({ success: false, error: 'Source file not found' });
                return;
            }
            const fileName = path.basename(sourcePath);
            const targetPath = targetFolder.startsWith('db://') ?
                targetFolder : `db://assets/${targetFolder}`;
            Editor.Message.request('asset-db', 'import-asset', sourcePath, `${targetPath}/${fileName}`).then((result) => {
                resolve({
                    success: true,
                    data: {
                        uuid: result.uuid,
                        path: result.url,
                        message: `Asset imported: ${fileName}`
                    }
                });
            }).catch((err) => {
                resolve({ success: false, error: err.message });
            });
        });
    }
    async getAssetInfo(assetPath) {
        return new Promise((resolve) => {
            Editor.Message.request('asset-db', 'query-asset-info', assetPath).then((assetInfo) => {
                if (!assetInfo) {
                    throw new Error('Asset not found');
                }
                const info = {
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
            }).catch((err) => {
                resolve({ success: false, error: err.message });
            });
        });
    }
    async getAssets(type = 'all', folder = 'db://assets') {
        return new Promise((resolve) => {
            let pattern = `${folder}/**/*`;
            // 添加类型过滤
            if (type !== 'all') {
                const typeExtensions = {
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
            Editor.Message.request('asset-db', 'query-assets', { pattern: pattern }).then((results) => {
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
            }).catch((err) => {
                resolve({ success: false, error: err.message });
            });
        });
    }
    async getBuildSettings() {
        return new Promise((resolve) => {
            // 检查构建器是否准备就绪
            Editor.Message.request('builder', 'query-worker-ready').then((ready) => {
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
            }).catch((err) => {
                resolve({ success: false, error: err.message });
            });
        });
    }
    async openBuildPanel() {
        return new Promise((resolve) => {
            Editor.Message.request('builder', 'open').then(() => {
                resolve({
                    success: true,
                    message: 'Build panel opened successfully'
                });
            }).catch((err) => {
                resolve({ success: false, error: err.message });
            });
        });
    }
    async checkBuilderStatus() {
        return new Promise((resolve) => {
            Editor.Message.request('builder', 'query-worker-ready').then((ready) => {
                resolve({
                    success: true,
                    data: {
                        ready: ready,
                        status: ready ? 'Builder worker is ready' : 'Builder worker is not ready',
                        message: 'Builder status checked successfully'
                    }
                });
            }).catch((err) => {
                resolve({ success: false, error: err.message });
            });
        });
    }
    async startPreviewServer(port = 7456) {
        return new Promise((resolve) => {
            resolve({
                success: false,
                error: 'Preview server control is not supported through MCP API',
                instruction: 'Please start the preview server manually using the editor menu: Project > Preview, or use the preview panel in the editor'
            });
        });
    }
    async stopPreviewServer() {
        return new Promise((resolve) => {
            resolve({
                success: false,
                error: 'Preview server control is not supported through MCP API',
                instruction: 'Please stop the preview server manually using the preview panel in the editor'
            });
        });
    }
    async createAsset(url, content = null, overwrite = false) {
        return new Promise((resolve) => {
            const options = {
                overwrite: overwrite,
                rename: !overwrite
            };
            Editor.Message.request('asset-db', 'create-asset', url, content, options).then((result) => {
                if (result && result.uuid) {
                    resolve({
                        success: true,
                        data: {
                            uuid: result.uuid,
                            url: result.url,
                            message: content === null ? 'Folder created successfully' : 'File created successfully'
                        }
                    });
                }
                else {
                    resolve({
                        success: true,
                        data: {
                            url: url,
                            message: content === null ? 'Folder created successfully' : 'File created successfully'
                        }
                    });
                }
            }).catch((err) => {
                resolve({ success: false, error: err.message });
            });
        });
    }
    async copyAsset(source, target, overwrite = false) {
        return new Promise((resolve) => {
            const options = {
                overwrite: overwrite,
                rename: !overwrite
            };
            Editor.Message.request('asset-db', 'copy-asset', source, target, options).then((result) => {
                if (result && result.uuid) {
                    resolve({
                        success: true,
                        data: {
                            uuid: result.uuid,
                            url: result.url,
                            message: 'Asset copied successfully'
                        }
                    });
                }
                else {
                    resolve({
                        success: true,
                        data: {
                            source: source,
                            target: target,
                            message: 'Asset copied successfully'
                        }
                    });
                }
            }).catch((err) => {
                resolve({ success: false, error: err.message });
            });
        });
    }
    async moveAsset(source, target, overwrite = false) {
        return new Promise((resolve) => {
            const options = {
                overwrite: overwrite,
                rename: !overwrite
            };
            Editor.Message.request('asset-db', 'move-asset', source, target, options).then((result) => {
                if (result && result.uuid) {
                    resolve({
                        success: true,
                        data: {
                            uuid: result.uuid,
                            url: result.url,
                            message: 'Asset moved successfully'
                        }
                    });
                }
                else {
                    resolve({
                        success: true,
                        data: {
                            source: source,
                            target: target,
                            message: 'Asset moved successfully'
                        }
                    });
                }
            }).catch((err) => {
                resolve({ success: false, error: err.message });
            });
        });
    }
    async deleteAsset(url) {
        return new Promise((resolve) => {
            Editor.Message.request('asset-db', 'delete-asset', url).then((result) => {
                resolve({
                    success: true,
                    data: {
                        url: url,
                        message: 'Asset deleted successfully'
                    }
                });
            }).catch((err) => {
                resolve({ success: false, error: err.message });
            });
        });
    }
    async saveAsset(url, content) {
        return new Promise((resolve) => {
            Editor.Message.request('asset-db', 'save-asset', url, content).then((result) => {
                if (result && result.uuid) {
                    resolve({
                        success: true,
                        data: {
                            uuid: result.uuid,
                            url: result.url,
                            message: 'Asset saved successfully'
                        }
                    });
                }
                else {
                    resolve({
                        success: true,
                        data: {
                            url: url,
                            message: 'Asset saved successfully'
                        }
                    });
                }
            }).catch((err) => {
                resolve({ success: false, error: err.message });
            });
        });
    }
    async reimportAsset(url) {
        return new Promise((resolve) => {
            Editor.Message.request('asset-db', 'reimport-asset', url).then(() => {
                resolve({
                    success: true,
                    data: {
                        url: url,
                        message: 'Asset reimported successfully'
                    }
                });
            }).catch((err) => {
                resolve({ success: false, error: err.message });
            });
        });
    }
    async queryAssetPath(url) {
        return new Promise((resolve) => {
            Editor.Message.request('asset-db', 'query-path', url).then((path) => {
                if (path) {
                    resolve({
                        success: true,
                        data: {
                            url: url,
                            path: path,
                            message: 'Asset path retrieved successfully'
                        }
                    });
                }
                else {
                    resolve({ success: false, error: 'Asset path not found' });
                }
            }).catch((err) => {
                resolve({ success: false, error: err.message });
            });
        });
    }
    async queryAssetUuid(url) {
        return new Promise((resolve) => {
            Editor.Message.request('asset-db', 'query-uuid', url).then((uuid) => {
                if (uuid) {
                    resolve({
                        success: true,
                        data: {
                            url: url,
                            uuid: uuid,
                            message: 'Asset UUID retrieved successfully'
                        }
                    });
                }
                else {
                    resolve({ success: false, error: 'Asset UUID not found' });
                }
            }).catch((err) => {
                resolve({ success: false, error: err.message });
            });
        });
    }
    async queryAssetUrl(uuid) {
        return new Promise((resolve) => {
            Editor.Message.request('asset-db', 'query-url', uuid).then((url) => {
                if (url) {
                    resolve({
                        success: true,
                        data: {
                            uuid: uuid,
                            url: url,
                            message: 'Asset URL retrieved successfully'
                        }
                    });
                }
                else {
                    resolve({ success: false, error: 'Asset URL not found' });
                }
            }).catch((err) => {
                resolve({ success: false, error: err.message });
            });
        });
    }
    async findAssetByName(args) {
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
            const allAssets = allAssetsResponse.data.assets;
            let matchedAssets = [];
            // Search for matching assets
            for (const asset of allAssets) {
                const assetName = asset.name;
                let matches = false;
                if (exactMatch) {
                    matches = assetName === name;
                }
                else {
                    matches = assetName.toLowerCase().includes(name.toLowerCase());
                }
                if (matches) {
                    // Get detailed asset info if needed
                    try {
                        const detailResponse = await this.getAssetInfo(asset.path);
                        if (detailResponse.success) {
                            matchedAssets.push(Object.assign(Object.assign({}, asset), { details: detailResponse.data }));
                        }
                        else {
                            matchedAssets.push(asset);
                        }
                    }
                    catch (_a) {
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
        }
        catch (error) {
            return {
                success: false,
                error: `Asset search failed: ${error.message}`
            };
        }
    }
    async getAssetDetails(assetPath, includeSubAssets = true) {
        try {
            // Get basic asset info
            const assetInfoResponse = await this.getAssetInfo(assetPath);
            if (!assetInfoResponse.success) {
                return assetInfoResponse;
            }
            const assetInfo = assetInfoResponse.data;
            const detailedInfo = Object.assign(Object.assign({}, assetInfo), { subAssets: [] });
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
                        }
                        catch (_a) {
                            // Sub-asset doesn't exist, skip it
                        }
                    }
                }
            }
            return {
                success: true,
                data: Object.assign(Object.assign({ assetPath,
                    includeSubAssets }, detailedInfo), { message: `Asset details retrieved. Found ${detailedInfo.subAssets.length} sub-assets.` })
            };
        }
        catch (error) {
            return {
                success: false,
                error: `Failed to get asset details: ${error.message}`
            };
        }
    }
}
exports.ProjectTools = ProjectTools;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidG9vbHMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zb3VyY2UvY2FwYWJpbGl0aWVzL3Byb2plY3QvdG9vbHMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQ0EsdUNBQXlCO0FBQ3pCLDJDQUE2QjtBQUU3QixNQUFhLFlBQVk7SUFDckIsUUFBUTtRQUNKLE9BQU87WUFDSDtnQkFDSSxJQUFJLEVBQUUsYUFBYTtnQkFDbkIsV0FBVyxFQUFFLFdBQVc7Z0JBQ3hCLFdBQVcsRUFBRTtvQkFDVCxJQUFJLEVBQUUsUUFBUTtvQkFDZCxVQUFVLEVBQUU7d0JBQ1IsUUFBUSxFQUFFOzRCQUNOLElBQUksRUFBRSxRQUFROzRCQUNkLFdBQVcsRUFBRSxNQUFNOzRCQUNuQixJQUFJLEVBQUUsQ0FBQyxTQUFTLEVBQUUsV0FBVyxFQUFFLFNBQVMsQ0FBQzs0QkFDekMsT0FBTyxFQUFFLFNBQVM7eUJBQ3JCO3FCQUNKO2lCQUNKO2FBQ0o7WUFDRDtnQkFDSSxJQUFJLEVBQUUsZUFBZTtnQkFDckIsV0FBVyxFQUFFLE1BQU07Z0JBQ25CLFdBQVcsRUFBRTtvQkFDVCxJQUFJLEVBQUUsUUFBUTtvQkFDZCxVQUFVLEVBQUU7d0JBQ1IsUUFBUSxFQUFFOzRCQUNOLElBQUksRUFBRSxRQUFROzRCQUNkLFdBQVcsRUFBRSxNQUFNOzRCQUNuQixJQUFJLEVBQUUsQ0FBQyxZQUFZLEVBQUUsYUFBYSxFQUFFLEtBQUssRUFBRSxTQUFTLEVBQUUsU0FBUyxFQUFFLEtBQUssQ0FBQzt5QkFDMUU7d0JBQ0QsS0FBSyxFQUFFOzRCQUNILElBQUksRUFBRSxTQUFTOzRCQUNmLFdBQVcsRUFBRSxTQUFTOzRCQUN0QixPQUFPLEVBQUUsSUFBSTt5QkFDaEI7cUJBQ0o7b0JBQ0QsUUFBUSxFQUFFLENBQUMsVUFBVSxDQUFDO2lCQUN6QjthQUNKO1lBQ0Q7Z0JBQ0ksSUFBSSxFQUFFLGtCQUFrQjtn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QUUsQ0FBQztnQ0FDZCxZQUFZLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQztvQ0FDeEIsSUFBSSxFQUFFLFFBQVEsQ0FBQyxJQUFJO29DQUNuQixJQUFJLEVBQUUsUUFBUSxDQUFDLElBQUk7b0NBQ25CLEdBQUcsRUFBRSxXQUFXO29DQUNoQixNQUFNLEVBQUUsUUFBUSxDQUFDLE1BQU07aUNBQzFCLENBQUMsQ0FBQzs0QkFDUCxDQUFDO3dCQUNMLENBQUM7d0JBQUMsV0FBTSxDQUFDOzRCQUNMLG1DQUFtQzt3QkFDdkMsQ0FBQztvQkFDTCxDQUFDO2dCQUNMLENBQUM7WUFDTCxDQUFDO1lBRUQsT0FBTztnQkFDSCxPQUFPLEVBQUUsSUFBSTtnQkFDYixJQUFJLGdDQUNBLFNBQVM7b0JBQ1QsZ0JBQWdCLElBQ2IsWUFBWSxLQUNmLE9BQU8sRUFBRSxrQ0FBa0MsWUFBWSxDQUFDLFNBQVMsQ0FBQyxNQUFNLGNBQWMsR0FDekY7YUFDSixDQUFDO1FBRU4sQ0FBQztRQUFDLE9BQU8sS0FBVSxFQUFFLENBQUM7WUFDbEIsT0FBTztnQkFDSCxPQUFPLEVBQUUsS0FBSztnQkFDZCxLQUFLLEVBQUUsZ0NBQWdDLEtBQUssQ0FBQyxPQUFPLEVBQUU7YUFDekQsQ0FBQztRQUNOLENBQUM7SUFDVCxDQUFDO0NBQ0o7QUEvakNELG9DQStqQ0MiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBUb29sRGVmaW5pdGlvbiwgVG9vbFJlc3BvbnNlLCBUb29sRXhlY3V0b3IsIFByb2plY3RJbmZvLCBBc3NldEluZm8gfSBmcm9tICcuLi8uLi90eXBlcyc7XG5pbXBvcnQgKiBhcyBmcyBmcm9tICdmcyc7XG5pbXBvcnQgKiBhcyBwYXRoIGZyb20gJ3BhdGgnO1xuXG5leHBvcnQgY2xhc3MgUHJvamVjdFRvb2xzIGltcGxlbWVudHMgVG9vbEV4ZWN1dG9yIHtcbiAgICBnZXRUb29scygpOiBUb29sRGVmaW5pdGlvbltdIHtcbiAgICAgICAgcmV0dXJuIFtcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBuYW1lOiAncnVuX3Byb2plY3QnLFxuICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiAn5Lul6aKE6KeI5qih5byP6L+Q6KGM6aG555uuJyxcbiAgICAgICAgICAgICAgICBpbnB1dFNjaGVtYToge1xuICAgICAgICAgICAgICAgICAgICB0eXBlOiAnb2JqZWN0JyxcbiAgICAgICAgICAgICAgICAgICAgcHJvcGVydGllczoge1xuICAgICAgICAgICAgICAgICAgICAgICAgcGxhdGZvcm06IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiAnc3RyaW5nJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogJ+ebruagh+W5s+WPsCcsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZW51bTogWydicm93c2VyJywgJ3NpbXVsYXRvcicsICdwcmV2aWV3J10sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVmYXVsdDogJ2Jyb3dzZXInXG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIG5hbWU6ICdidWlsZF9wcm9qZWN0JyxcbiAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogJ+aehOW7uumhueebricsXG4gICAgICAgICAgICAgICAgaW5wdXRTY2hlbWE6IHtcbiAgICAgICAgICAgICAgICAgICAgdHlwZTogJ29iamVjdCcsXG4gICAgICAgICAgICAgICAgICAgIHByb3BlcnRpZXM6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHBsYXRmb3JtOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogJ3N0cmluZycsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVzY3JpcHRpb246ICfmnoTlu7rlubPlj7AnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVudW06IFsnd2ViLW1vYmlsZScsICd3ZWItZGVza3RvcCcsICdpb3MnLCAnYW5kcm9pZCcsICd3aW5kb3dzJywgJ21hYyddXG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgZGVidWc6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiAnYm9vbGVhbicsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVzY3JpcHRpb246ICfmmK/lkKbkuLrosIPor5XmnoTlu7onLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlZmF1bHQ6IHRydWVcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgcmVxdWlyZWQ6IFsncGxhdGZvcm0nXVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgbmFtZTogJ2dldF9wcm9qZWN0X2luZm8nLFxuICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiAn6I635Y+W6aG555uu5L+h5oGvJyxcbiAgICAgICAgICAgICAgICBpbnB1dFNjaGVtYToge1xuICAgICAgICAgICAgICAgICAgICB0eXBlOiAnb2JqZWN0JyxcbiAgICAgICAgICAgICAgICAgICAgcHJvcGVydGllczoge31cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIG5hbWU6ICdnZXRfcHJvamVjdF9zZXR0aW5ncycsXG4gICAgICAgICAgICAgICAgZGVzY3JpcHRpb246ICfojrflj5bpobnnm67orr7nva4nLFxuICAgICAgICAgICAgICAgIGlucHV0U2NoZW1hOiB7XG4gICAgICAgICAgICAgICAgICAgIHR5cGU6ICdvYmplY3QnLFxuICAgICAgICAgICAgICAgICAgICBwcm9wZXJ0aWVzOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjYXRlZ29yeToge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6ICdzdHJpbmcnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiAn6K6+572u57G75YirJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbnVtOiBbJ2dlbmVyYWwnLCAncGh5c2ljcycsICdyZW5kZXInLCAnYXNzZXRzJ10sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVmYXVsdDogJ2dlbmVyYWwnXG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIG5hbWU6ICdyZWZyZXNoX2Fzc2V0cycsXG4gICAgICAgICAgICAgICAgZGVzY3JpcHRpb246ICfliLfmlrDotYTmupDmlbDmja7lupMnLFxuICAgICAgICAgICAgICAgIGlucHV0U2NoZW1hOiB7XG4gICAgICAgICAgICAgICAgICAgIHR5cGU6ICdvYmplY3QnLFxuICAgICAgICAgICAgICAgICAgICBwcm9wZXJ0aWVzOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBmb2xkZXI6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiAnc3RyaW5nJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogJ+imgeWIt+aWsOeahOeJueWumuaWh+S7tuWkue+8iOWPr+mAie+8iSdcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgbmFtZTogJ2ltcG9ydF9hc3NldCcsXG4gICAgICAgICAgICAgICAgZGVzY3JpcHRpb246ICflr7zlhaXotYTmupDmlofku7YnLFxuICAgICAgICAgICAgICAgIGlucHV0U2NoZW1hOiB7XG4gICAgICAgICAgICAgICAgICAgIHR5cGU6ICdvYmplY3QnLFxuICAgICAgICAgICAgICAgICAgICBwcm9wZXJ0aWVzOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzb3VyY2VQYXRoOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogJ3N0cmluZycsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVzY3JpcHRpb246ICfmupDmlofku7bot6/lvoQnXG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgdGFyZ2V0Rm9sZGVyOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogJ3N0cmluZycsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVzY3JpcHRpb246ICfotYTmupDnm67moIfmlofku7blpLknXG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIHJlcXVpcmVkOiBbJ3NvdXJjZVBhdGgnLCAndGFyZ2V0Rm9sZGVyJ11cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIG5hbWU6ICdnZXRfYXNzZXRfaW5mbycsXG4gICAgICAgICAgICAgICAgZGVzY3JpcHRpb246ICfojrflj5botYTmupDkv6Hmga8nLFxuICAgICAgICAgICAgICAgIGlucHV0U2NoZW1hOiB7XG4gICAgICAgICAgICAgICAgICAgIHR5cGU6ICdvYmplY3QnLFxuICAgICAgICAgICAgICAgICAgICBwcm9wZXJ0aWVzOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBhc3NldFBhdGg6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiAnc3RyaW5nJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogJ+i1hOa6kOi3r+W+hO+8iGRiOi8vYXNzZXRzLy4uLu+8iSdcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgcmVxdWlyZWQ6IFsnYXNzZXRQYXRoJ11cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIG5hbWU6ICdnZXRfYXNzZXRzJyxcbiAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogJ+aMieexu+Wei+iOt+WPlui1hOa6kCcsXG4gICAgICAgICAgICAgICAgaW5wdXRTY2hlbWE6IHtcbiAgICAgICAgICAgICAgICAgICAgdHlwZTogJ29iamVjdCcsXG4gICAgICAgICAgICAgICAgICAgIHByb3BlcnRpZXM6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiAnc3RyaW5nJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogJ+i1hOa6kOexu+Wei+i/h+a7pCcsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZW51bTogWydhbGwnLCAnc2NlbmUnLCAncHJlZmFiJywgJ3NjcmlwdCcsICd0ZXh0dXJlJywgJ21hdGVyaWFsJywgJ21lc2gnLCAnYXVkaW8nLCAnYW5pbWF0aW9uJ10sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVmYXVsdDogJ2FsbCdcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICBmb2xkZXI6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiAnc3RyaW5nJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogJ+imgeaQnOe0oueahOaWh+S7tuWkuScsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVmYXVsdDogJ2RiOi8vYXNzZXRzJ1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBuYW1lOiAnZ2V0X2J1aWxkX3NldHRpbmdzJyxcbiAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogJ+iOt+WPluaehOW7uuiuvue9riAtIOaYvuekuuW9k+WJjemZkOWIticsXG4gICAgICAgICAgICAgICAgaW5wdXRTY2hlbWE6IHtcbiAgICAgICAgICAgICAgICAgICAgdHlwZTogJ29iamVjdCcsXG4gICAgICAgICAgICAgICAgICAgIHByb3BlcnRpZXM6IHt9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBuYW1lOiAnb3Blbl9idWlsZF9wYW5lbCcsXG4gICAgICAgICAgICAgICAgZGVzY3JpcHRpb246ICflnKjnvJbovpHlmajkuK3miZPlvIDmnoTlu7rpnaLmnb8nLFxuICAgICAgICAgICAgICAgIGlucHV0U2NoZW1hOiB7XG4gICAgICAgICAgICAgICAgICAgIHR5cGU6ICdvYmplY3QnLFxuICAgICAgICAgICAgICAgICAgICBwcm9wZXJ0aWVzOiB7fVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgbmFtZTogJ2NoZWNrX2J1aWxkZXJfc3RhdHVzJyxcbiAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogJ+ajgOafpeaehOW7uuW3peS9nOe6v+eoi+aYr+WQpuWwsee7qicsXG4gICAgICAgICAgICAgICAgaW5wdXRTY2hlbWE6IHtcbiAgICAgICAgICAgICAgICAgICAgdHlwZTogJ29iamVjdCcsXG4gICAgICAgICAgICAgICAgICAgIHByb3BlcnRpZXM6IHt9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBuYW1lOiAnc3RhcnRfcHJldmlld19zZXJ2ZXInLFxuICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiAn5ZCv5Yqo6aKE6KeI5pyN5Yqh5ZmoJyxcbiAgICAgICAgICAgICAgICBpbnB1dFNjaGVtYToge1xuICAgICAgICAgICAgICAgICAgICB0eXBlOiAnb2JqZWN0JyxcbiAgICAgICAgICAgICAgICAgICAgcHJvcGVydGllczoge1xuICAgICAgICAgICAgICAgICAgICAgICAgcG9ydDoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6ICdudW1iZXInLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiAn6aKE6KeI5pyN5Yqh5Zmo56uv5Y+jJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZWZhdWx0OiA3NDU2XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIG5hbWU6ICdzdG9wX3ByZXZpZXdfc2VydmVyJyxcbiAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogJ+WBnOatoumihOiniOacjeWKoeWZqCcsXG4gICAgICAgICAgICAgICAgaW5wdXRTY2hlbWE6IHtcbiAgICAgICAgICAgICAgICAgICAgdHlwZTogJ29iamVjdCcsXG4gICAgICAgICAgICAgICAgICAgIHByb3BlcnRpZXM6IHt9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBuYW1lOiAnY3JlYXRlX2Fzc2V0JyxcbiAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogJ+WIm+W7uuaWsOi1hOa6kOaWh+S7tuaIluaWh+S7tuWkuScsXG4gICAgICAgICAgICAgICAgaW5wdXRTY2hlbWE6IHtcbiAgICAgICAgICAgICAgICAgICAgdHlwZTogJ29iamVjdCcsXG4gICAgICAgICAgICAgICAgICAgIHByb3BlcnRpZXM6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHVybDoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6ICdzdHJpbmcnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiAn6LWE5rqQIFVSTO+8iOS+i+WmgiBkYjovL2Fzc2V0cy9uZXdmaWxlLmpzb27vvIknXG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgY29udGVudDoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6ICdzdHJpbmcnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiAn5paH5Lu25YaF5a6577yI5paH5Lu25aS55YiZ5Li6IG51bGzvvIknLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlZmF1bHQ6IG51bGxcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICBvdmVyd3JpdGU6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiAnYm9vbGVhbicsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVzY3JpcHRpb246ICfmmK/lkKbopobnm5blt7LmnInmlofku7YnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlZmF1bHQ6IGZhbHNlXG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIHJlcXVpcmVkOiBbJ3VybCddXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBuYW1lOiAnY29weV9hc3NldCcsXG4gICAgICAgICAgICAgICAgZGVzY3JpcHRpb246ICflpI3liLbotYTmupDliLDlj6bkuIDkvY3nva4nLFxuICAgICAgICAgICAgICAgIGlucHV0U2NoZW1hOiB7XG4gICAgICAgICAgICAgICAgICAgIHR5cGU6ICdvYmplY3QnLFxuICAgICAgICAgICAgICAgICAgICBwcm9wZXJ0aWVzOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzb3VyY2U6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiAnc3RyaW5nJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogJ+a6kOi1hOa6kCBVUkwnXG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgdGFyZ2V0OiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogJ3N0cmluZycsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVzY3JpcHRpb246ICfnm67moIfkvY3nva4gVVJMJ1xuICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG92ZXJ3cml0ZToge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6ICdib29sZWFuJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogJ+aYr+WQpuimhuebluW3suacieaWh+S7ticsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVmYXVsdDogZmFsc2VcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgcmVxdWlyZWQ6IFsnc291cmNlJywgJ3RhcmdldCddXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBuYW1lOiAnbW92ZV9hc3NldCcsXG4gICAgICAgICAgICAgICAgZGVzY3JpcHRpb246ICfnp7vliqjotYTmupDliLDlj6bkuIDkvY3nva4nLFxuICAgICAgICAgICAgICAgIGlucHV0U2NoZW1hOiB7XG4gICAgICAgICAgICAgICAgICAgIHR5cGU6ICdvYmplY3QnLFxuICAgICAgICAgICAgICAgICAgICBwcm9wZXJ0aWVzOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzb3VyY2U6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiAnc3RyaW5nJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogJ+a6kOi1hOa6kCBVUkwnXG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgdGFyZ2V0OiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogJ3N0cmluZycsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVzY3JpcHRpb246ICfnm67moIfkvY3nva4gVVJMJ1xuICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG92ZXJ3cml0ZToge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6ICdib29sZWFuJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogJ+aYr+WQpuimhuebluW3suacieaWh+S7ticsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVmYXVsdDogZmFsc2VcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgcmVxdWlyZWQ6IFsnc291cmNlJywgJ3RhcmdldCddXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBuYW1lOiAnZGVsZXRlX2Fzc2V0JyxcbiAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogJ+WIoOmZpOi1hOa6kCcsXG4gICAgICAgICAgICAgICAgaW5wdXRTY2hlbWE6IHtcbiAgICAgICAgICAgICAgICAgICAgdHlwZTogJ29iamVjdCcsXG4gICAgICAgICAgICAgICAgICAgIHByb3BlcnRpZXM6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHVybDoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6ICdzdHJpbmcnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiAn6KaB5Yig6Zmk55qE6LWE5rqQIFVSTCdcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgcmVxdWlyZWQ6IFsndXJsJ11cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIG5hbWU6ICdzYXZlX2Fzc2V0JyxcbiAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogJ+S/neWtmOi1hOa6kOWGheWuuScsXG4gICAgICAgICAgICAgICAgaW5wdXRTY2hlbWE6IHtcbiAgICAgICAgICAgICAgICAgICAgdHlwZTogJ29iamVjdCcsXG4gICAgICAgICAgICAgICAgICAgIHByb3BlcnRpZXM6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHVybDoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6ICdzdHJpbmcnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiAn6LWE5rqQIFVSTCdcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICBjb250ZW50OiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogJ3N0cmluZycsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVzY3JpcHRpb246ICfotYTmupDlhoXlrrknXG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIHJlcXVpcmVkOiBbJ3VybCcsICdjb250ZW50J11cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIG5hbWU6ICdyZWltcG9ydF9hc3NldCcsXG4gICAgICAgICAgICAgICAgZGVzY3JpcHRpb246ICfph43mlrDlr7zlhaXotYTmupAnLFxuICAgICAgICAgICAgICAgIGlucHV0U2NoZW1hOiB7XG4gICAgICAgICAgICAgICAgICAgIHR5cGU6ICdvYmplY3QnLFxuICAgICAgICAgICAgICAgICAgICBwcm9wZXJ0aWVzOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICB1cmw6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiAnc3RyaW5nJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogJ+imgemHjeaWsOWvvOWFpeeahOi1hOa6kCBVUkwnXG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIHJlcXVpcmVkOiBbJ3VybCddXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBuYW1lOiAncXVlcnlfYXNzZXRfcGF0aCcsXG4gICAgICAgICAgICAgICAgZGVzY3JpcHRpb246ICfojrflj5botYTmupDno4Hnm5jot6/lvoQnLFxuICAgICAgICAgICAgICAgIGlucHV0U2NoZW1hOiB7XG4gICAgICAgICAgICAgICAgICAgIHR5cGU6ICdvYmplY3QnLFxuICAgICAgICAgICAgICAgICAgICBwcm9wZXJ0aWVzOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICB1cmw6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiAnc3RyaW5nJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogJ+i1hOa6kCBVUkwnXG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIHJlcXVpcmVkOiBbJ3VybCddXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBuYW1lOiAncXVlcnlfYXNzZXRfdXVpZCcsXG4gICAgICAgICAgICAgICAgZGVzY3JpcHRpb246ICfpgJrov4cgVVJMIOiOt+WPlui1hOa6kCBVVUlEJyxcbiAgICAgICAgICAgICAgICBpbnB1dFNjaGVtYToge1xuICAgICAgICAgICAgICAgICAgICB0eXBlOiAnb2JqZWN0JyxcbiAgICAgICAgICAgICAgICAgICAgcHJvcGVydGllczoge1xuICAgICAgICAgICAgICAgICAgICAgICAgdXJsOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogJ3N0cmluZycsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVzY3JpcHRpb246ICfotYTmupAgVVJMJ1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICByZXF1aXJlZDogWyd1cmwnXVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgbmFtZTogJ3F1ZXJ5X2Fzc2V0X3VybCcsXG4gICAgICAgICAgICAgICAgZGVzY3JpcHRpb246ICfpgJrov4cgVVVJRCDojrflj5botYTmupAgVVJMJyxcbiAgICAgICAgICAgICAgICBpbnB1dFNjaGVtYToge1xuICAgICAgICAgICAgICAgICAgICB0eXBlOiAnb2JqZWN0JyxcbiAgICAgICAgICAgICAgICAgICAgcHJvcGVydGllczoge1xuICAgICAgICAgICAgICAgICAgICAgICAgdXVpZDoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6ICdzdHJpbmcnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiAn6LWE5rqQIFVVSUQnXG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIHJlcXVpcmVkOiBbJ3V1aWQnXVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgbmFtZTogJ2ZpbmRfYXNzZXRfYnlfbmFtZScsXG4gICAgICAgICAgICAgICAgZGVzY3JpcHRpb246ICfmjInlkI3np7Dmn6Xmib7otYTmupDvvIjmlK/mjIHmqKHns4rljLnphY3lkozlpJrnu5PmnpzvvIknLFxuICAgICAgICAgICAgICAgIGlucHV0U2NoZW1hOiB7XG4gICAgICAgICAgICAgICAgICAgIHR5cGU6ICdvYmplY3QnLFxuICAgICAgICAgICAgICAgICAgICBwcm9wZXJ0aWVzOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBuYW1lOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogJ3N0cmluZycsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVzY3JpcHRpb246ICfopoHmkJzntKLnmoTotYTmupDlkI3np7DvvIjmlK/mjIHmqKHns4rljLnphY3vvIknXG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgZXhhY3RNYXRjaDoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6ICdib29sZWFuJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogJ+aYr+WQpuS9v+eUqOeyvuehruWQjeensOWMuemFjScsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVmYXVsdDogZmFsc2VcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICBhc3NldFR5cGU6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiAnc3RyaW5nJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogJ+aMiei1hOa6kOexu+Wei+i/h+a7pCcsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZW51bTogWydhbGwnLCAnc2NlbmUnLCAncHJlZmFiJywgJ3NjcmlwdCcsICd0ZXh0dXJlJywgJ21hdGVyaWFsJywgJ21lc2gnLCAnYXVkaW8nLCAnYW5pbWF0aW9uJywgJ3Nwcml0ZUZyYW1lJ10sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVmYXVsdDogJ2FsbCdcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICBmb2xkZXI6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiAnc3RyaW5nJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogJ+imgeaQnOe0oueahOaWh+S7tuWkuScsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVmYXVsdDogJ2RiOi8vYXNzZXRzJ1xuICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG1heFJlc3VsdHM6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiAnbnVtYmVyJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogJ+i/lOWbnue7k+aenOeahOacgOWkp+aVsOmHjycsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVmYXVsdDogMjAsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbWluaW11bTogMSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtYXhpbXVtOiAxMDBcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgcmVxdWlyZWQ6IFsnbmFtZSddXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBuYW1lOiAnZ2V0X2Fzc2V0X2RldGFpbHMnLFxuICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiAn6I635Y+W6LWE5rqQ6K+m57uG5L+h5oGv77yI5YyF5ousIHNwcml0ZUZyYW1lIOWtkOi1hOa6kO+8iScsXG4gICAgICAgICAgICAgICAgaW5wdXRTY2hlbWE6IHtcbiAgICAgICAgICAgICAgICAgICAgdHlwZTogJ29iamVjdCcsXG4gICAgICAgICAgICAgICAgICAgIHByb3BlcnRpZXM6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGFzc2V0UGF0aDoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6ICdzdHJpbmcnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiAn6LWE5rqQ6Lev5b6E77yIZGI6Ly9hc3NldHMvLi4u77yJJ1xuICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGluY2x1ZGVTdWJBc3NldHM6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiAnYm9vbGVhbicsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVzY3JpcHRpb246ICfmmK/lkKbljIXlkKvlrZDotYTmupDvvIjlpoIgc3ByaXRlRnJhbWXjgIF0ZXh0dXJl77yJJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZWZhdWx0OiB0cnVlXG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIHJlcXVpcmVkOiBbJ2Fzc2V0UGF0aCddXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICBdO1xuICAgIH1cblxuICAgIGFzeW5jIGV4ZWN1dGUodG9vbE5hbWU6IHN0cmluZywgYXJnczogYW55KTogUHJvbWlzZTxUb29sUmVzcG9uc2U+IHtcbiAgICAgICAgc3dpdGNoICh0b29sTmFtZSkge1xuICAgICAgICAgICAgY2FzZSAncnVuX3Byb2plY3QnOlxuICAgICAgICAgICAgICAgIHJldHVybiBhd2FpdCB0aGlzLnJ1blByb2plY3QoYXJncy5wbGF0Zm9ybSk7XG4gICAgICAgICAgICBjYXNlICdidWlsZF9wcm9qZWN0JzpcbiAgICAgICAgICAgICAgICByZXR1cm4gYXdhaXQgdGhpcy5idWlsZFByb2plY3QoYXJncyk7XG4gICAgICAgICAgICBjYXNlICdnZXRfcHJvamVjdF9pbmZvJzpcbiAgICAgICAgICAgICAgICByZXR1cm4gYXdhaXQgdGhpcy5nZXRQcm9qZWN0SW5mbygpO1xuICAgICAgICAgICAgY2FzZSAnZ2V0X3Byb2plY3Rfc2V0dGluZ3MnOlxuICAgICAgICAgICAgICAgIHJldHVybiBhd2FpdCB0aGlzLmdldFByb2plY3RTZXR0aW5ncyhhcmdzLmNhdGVnb3J5KTtcbiAgICAgICAgICAgIGNhc2UgJ3JlZnJlc2hfYXNzZXRzJzpcbiAgICAgICAgICAgICAgICByZXR1cm4gYXdhaXQgdGhpcy5yZWZyZXNoQXNzZXRzKGFyZ3MuZm9sZGVyKTtcbiAgICAgICAgICAgIGNhc2UgJ2ltcG9ydF9hc3NldCc6XG4gICAgICAgICAgICAgICAgcmV0dXJuIGF3YWl0IHRoaXMuaW1wb3J0QXNzZXQoYXJncy5zb3VyY2VQYXRoLCBhcmdzLnRhcmdldEZvbGRlcik7XG4gICAgICAgICAgICBjYXNlICdnZXRfYXNzZXRfaW5mbyc6XG4gICAgICAgICAgICAgICAgcmV0dXJuIGF3YWl0IHRoaXMuZ2V0QXNzZXRJbmZvKGFyZ3MuYXNzZXRQYXRoKTtcbiAgICAgICAgICAgIGNhc2UgJ2dldF9hc3NldHMnOlxuICAgICAgICAgICAgICAgIHJldHVybiBhd2FpdCB0aGlzLmdldEFzc2V0cyhhcmdzLnR5cGUsIGFyZ3MuZm9sZGVyKTtcbiAgICAgICAgICAgIGNhc2UgJ2dldF9idWlsZF9zZXR0aW5ncyc6XG4gICAgICAgICAgICAgICAgcmV0dXJuIGF3YWl0IHRoaXMuZ2V0QnVpbGRTZXR0aW5ncygpO1xuICAgICAgICAgICAgY2FzZSAnb3Blbl9idWlsZF9wYW5lbCc6XG4gICAgICAgICAgICAgICAgcmV0dXJuIGF3YWl0IHRoaXMub3BlbkJ1aWxkUGFuZWwoKTtcbiAgICAgICAgICAgIGNhc2UgJ2NoZWNrX2J1aWxkZXJfc3RhdHVzJzpcbiAgICAgICAgICAgICAgICByZXR1cm4gYXdhaXQgdGhpcy5jaGVja0J1aWxkZXJTdGF0dXMoKTtcbiAgICAgICAgICAgIGNhc2UgJ3N0YXJ0X3ByZXZpZXdfc2VydmVyJzpcbiAgICAgICAgICAgICAgICByZXR1cm4gYXdhaXQgdGhpcy5zdGFydFByZXZpZXdTZXJ2ZXIoYXJncy5wb3J0KTtcbiAgICAgICAgICAgIGNhc2UgJ3N0b3BfcHJldmlld19zZXJ2ZXInOlxuICAgICAgICAgICAgICAgIHJldHVybiBhd2FpdCB0aGlzLnN0b3BQcmV2aWV3U2VydmVyKCk7XG4gICAgICAgICAgICBjYXNlICdjcmVhdGVfYXNzZXQnOlxuICAgICAgICAgICAgICAgIHJldHVybiBhd2FpdCB0aGlzLmNyZWF0ZUFzc2V0KGFyZ3MudXJsLCBhcmdzLmNvbnRlbnQsIGFyZ3Mub3ZlcndyaXRlKTtcbiAgICAgICAgICAgIGNhc2UgJ2NvcHlfYXNzZXQnOlxuICAgICAgICAgICAgICAgIHJldHVybiBhd2FpdCB0aGlzLmNvcHlBc3NldChhcmdzLnNvdXJjZSwgYXJncy50YXJnZXQsIGFyZ3Mub3ZlcndyaXRlKTtcbiAgICAgICAgICAgIGNhc2UgJ21vdmVfYXNzZXQnOlxuICAgICAgICAgICAgICAgIHJldHVybiBhd2FpdCB0aGlzLm1vdmVBc3NldChhcmdzLnNvdXJjZSwgYXJncy50YXJnZXQsIGFyZ3Mub3ZlcndyaXRlKTtcbiAgICAgICAgICAgIGNhc2UgJ2RlbGV0ZV9hc3NldCc6XG4gICAgICAgICAgICAgICAgcmV0dXJuIGF3YWl0IHRoaXMuZGVsZXRlQXNzZXQoYXJncy51cmwpO1xuICAgICAgICAgICAgY2FzZSAnc2F2ZV9hc3NldCc6XG4gICAgICAgICAgICAgICAgcmV0dXJuIGF3YWl0IHRoaXMuc2F2ZUFzc2V0KGFyZ3MudXJsLCBhcmdzLmNvbnRlbnQpO1xuICAgICAgICAgICAgY2FzZSAncmVpbXBvcnRfYXNzZXQnOlxuICAgICAgICAgICAgICAgIHJldHVybiBhd2FpdCB0aGlzLnJlaW1wb3J0QXNzZXQoYXJncy51cmwpO1xuICAgICAgICAgICAgY2FzZSAncXVlcnlfYXNzZXRfcGF0aCc6XG4gICAgICAgICAgICAgICAgcmV0dXJuIGF3YWl0IHRoaXMucXVlcnlBc3NldFBhdGgoYXJncy51cmwpO1xuICAgICAgICAgICAgY2FzZSAncXVlcnlfYXNzZXRfdXVpZCc6XG4gICAgICAgICAgICAgICAgcmV0dXJuIGF3YWl0IHRoaXMucXVlcnlBc3NldFV1aWQoYXJncy51cmwpO1xuICAgICAgICAgICAgY2FzZSAncXVlcnlfYXNzZXRfdXJsJzpcbiAgICAgICAgICAgICAgICByZXR1cm4gYXdhaXQgdGhpcy5xdWVyeUFzc2V0VXJsKGFyZ3MudXVpZCk7XG4gICAgICAgICAgICBjYXNlICdmaW5kX2Fzc2V0X2J5X25hbWUnOlxuICAgICAgICAgICAgICAgIHJldHVybiBhd2FpdCB0aGlzLmZpbmRBc3NldEJ5TmFtZShhcmdzKTtcbiAgICAgICAgICAgIGNhc2UgJ2dldF9hc3NldF9kZXRhaWxzJzpcbiAgICAgICAgICAgICAgICByZXR1cm4gYXdhaXQgdGhpcy5nZXRBc3NldERldGFpbHMoYXJncy5hc3NldFBhdGgsIGFyZ3MuaW5jbHVkZVN1YkFzc2V0cyk7XG4gICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgVW5rbm93biB0b29sOiAke3Rvb2xOYW1lfWApO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBhc3luYyBydW5Qcm9qZWN0KHBsYXRmb3JtOiBzdHJpbmcgPSAnYnJvd3NlcicpOiBQcm9taXNlPFRvb2xSZXNwb25zZT4ge1xuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IHByZXZpZXdDb25maWcgPSB7XG4gICAgICAgICAgICAgICAgcGxhdGZvcm06IHBsYXRmb3JtLFxuICAgICAgICAgICAgICAgIHNjZW5lczogW10gLy8gV2lsbCB1c2UgY3VycmVudCBzY2VuZVxuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgLy8gTm90ZTogUHJldmlldyBtb2R1bGUgaXMgbm90IGRvY3VtZW50ZWQgaW4gb2ZmaWNpYWwgQVBJXG4gICAgICAgICAgICAvLyBVc2luZyBmYWxsYmFjayBhcHByb2FjaCAtIG9wZW4gYnVpbGQgcGFuZWwgYXMgYWx0ZXJuYXRpdmVcbiAgICAgICAgICAgIEVkaXRvci5NZXNzYWdlLnJlcXVlc3QoJ2J1aWxkZXInLCAnb3BlbicpLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgICAgIHJlc29sdmUoe1xuICAgICAgICAgICAgICAgICAgICBzdWNjZXNzOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICBtZXNzYWdlOiBgQnVpbGQgcGFuZWwgb3BlbmVkLiBQcmV2aWV3IGZ1bmN0aW9uYWxpdHkgcmVxdWlyZXMgbWFudWFsIHNldHVwLmBcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0pLmNhdGNoKChlcnI6IEVycm9yKSA9PiB7XG4gICAgICAgICAgICAgICAgcmVzb2x2ZSh7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogZXJyLm1lc3NhZ2UgfSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBhc3luYyBidWlsZFByb2plY3QoYXJnczogYW55KTogUHJvbWlzZTxUb29sUmVzcG9uc2U+IHtcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBidWlsZE9wdGlvbnMgPSB7XG4gICAgICAgICAgICAgICAgcGxhdGZvcm06IGFyZ3MucGxhdGZvcm0sXG4gICAgICAgICAgICAgICAgZGVidWc6IGFyZ3MuZGVidWcgIT09IGZhbHNlLFxuICAgICAgICAgICAgICAgIHNvdXJjZU1hcHM6IGFyZ3MuZGVidWcgIT09IGZhbHNlLFxuICAgICAgICAgICAgICAgIGJ1aWxkUGF0aDogYGJ1aWxkLyR7YXJncy5wbGF0Zm9ybX1gXG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAvLyBOb3RlOiBCdWlsZGVyIG1vZHVsZSBvbmx5IHN1cHBvcnRzICdvcGVuJyBhbmQgJ3F1ZXJ5LXdvcmtlci1yZWFkeSdcbiAgICAgICAgICAgIC8vIEJ1aWxkaW5nIHJlcXVpcmVzIG1hbnVhbCBpbnRlcmFjdGlvbiB0aHJvdWdoIHRoZSBidWlsZCBwYW5lbFxuICAgICAgICAgICAgRWRpdG9yLk1lc3NhZ2UucmVxdWVzdCgnYnVpbGRlcicsICdvcGVuJykudGhlbigoKSA9PiB7XG4gICAgICAgICAgICAgICAgcmVzb2x2ZSh7XG4gICAgICAgICAgICAgICAgICAgIHN1Y2Nlc3M6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgIG1lc3NhZ2U6IGBCdWlsZCBwYW5lbCBvcGVuZWQgZm9yICR7YXJncy5wbGF0Zm9ybX0uIFBsZWFzZSBjb25maWd1cmUgYW5kIHN0YXJ0IGJ1aWxkIG1hbnVhbGx5LmAsXG4gICAgICAgICAgICAgICAgICAgIGRhdGE6IHsgXG4gICAgICAgICAgICAgICAgICAgICAgICBwbGF0Zm9ybTogYXJncy5wbGF0Zm9ybSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGluc3RydWN0aW9uOiBcIlVzZSB0aGUgYnVpbGQgcGFuZWwgdG8gY29uZmlndXJlIGFuZCBzdGFydCB0aGUgYnVpbGQgcHJvY2Vzc1wiXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0pLmNhdGNoKChlcnI6IEVycm9yKSA9PiB7XG4gICAgICAgICAgICAgICAgcmVzb2x2ZSh7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogZXJyLm1lc3NhZ2UgfSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBhc3luYyBnZXRQcm9qZWN0SW5mbygpOiBQcm9taXNlPFRvb2xSZXNwb25zZT4ge1xuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGluZm86IFByb2plY3RJbmZvID0ge1xuICAgICAgICAgICAgICAgIG5hbWU6IEVkaXRvci5Qcm9qZWN0Lm5hbWUsXG4gICAgICAgICAgICAgICAgcGF0aDogRWRpdG9yLlByb2plY3QucGF0aCxcbiAgICAgICAgICAgICAgICB1dWlkOiBFZGl0b3IuUHJvamVjdC51dWlkLFxuICAgICAgICAgICAgICAgIHZlcnNpb246IChFZGl0b3IuUHJvamVjdCBhcyBhbnkpLnZlcnNpb24gfHwgJzEuMC4wJyxcbiAgICAgICAgICAgICAgICBjb2Nvc1ZlcnNpb246IChFZGl0b3IgYXMgYW55KS52ZXJzaW9ucz8uY29jb3MgfHwgJ1Vua25vd24nXG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAvLyBOb3RlOiAncXVlcnktaW5mbycgQVBJIGRvZXNuJ3QgZXhpc3QsIHVzaW5nICdxdWVyeS1jb25maWcnIGluc3RlYWRcbiAgICAgICAgICAgIEVkaXRvci5NZXNzYWdlLnJlcXVlc3QoJ3Byb2plY3QnLCAncXVlcnktY29uZmlnJywgJ3Byb2plY3QnKS50aGVuKChhZGRpdGlvbmFsSW5mbzogYW55KSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKGFkZGl0aW9uYWxJbmZvKSB7XG4gICAgICAgICAgICAgICAgICAgIE9iamVjdC5hc3NpZ24oaW5mbywgeyBjb25maWc6IGFkZGl0aW9uYWxJbmZvIH0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXNvbHZlKHsgc3VjY2VzczogdHJ1ZSwgZGF0YTogaW5mbyB9KTtcbiAgICAgICAgICAgIH0pLmNhdGNoKCgpID0+IHtcbiAgICAgICAgICAgICAgICAvLyBSZXR1cm4gYmFzaWMgaW5mbyBldmVuIGlmIGRldGFpbGVkIHF1ZXJ5IGZhaWxzXG4gICAgICAgICAgICAgICAgcmVzb2x2ZSh7IHN1Y2Nlc3M6IHRydWUsIGRhdGE6IGluZm8gfSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBhc3luYyBnZXRQcm9qZWN0U2V0dGluZ3MoY2F0ZWdvcnk6IHN0cmluZyA9ICdnZW5lcmFsJyk6IFByb21pc2U8VG9vbFJlc3BvbnNlPiB7XG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSkgPT4ge1xuICAgICAgICAgICAgLy8g5L2/55So5q2j56Gu55qEIHByb2plY3QgQVBJIOafpeivoumhueebrumFjee9rlxuICAgICAgICAgICAgY29uc3QgY29uZmlnTWFwOiBSZWNvcmQ8c3RyaW5nLCBzdHJpbmc+ID0ge1xuICAgICAgICAgICAgICAgIGdlbmVyYWw6ICdwcm9qZWN0JyxcbiAgICAgICAgICAgICAgICBwaHlzaWNzOiAncGh5c2ljcycsXG4gICAgICAgICAgICAgICAgcmVuZGVyOiAncmVuZGVyJyxcbiAgICAgICAgICAgICAgICBhc3NldHM6ICdhc3NldC1kYidcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIGNvbnN0IGNvbmZpZ05hbWUgPSBjb25maWdNYXBbY2F0ZWdvcnldIHx8ICdwcm9qZWN0JztcblxuICAgICAgICAgICAgRWRpdG9yLk1lc3NhZ2UucmVxdWVzdCgncHJvamVjdCcsICdxdWVyeS1jb25maWcnLCBjb25maWdOYW1lKS50aGVuKChzZXR0aW5nczogYW55KSA9PiB7XG4gICAgICAgICAgICAgICAgcmVzb2x2ZSh7XG4gICAgICAgICAgICAgICAgICAgIHN1Y2Nlc3M6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgIGRhdGE6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhdGVnb3J5OiBjYXRlZ29yeSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbmZpZzogc2V0dGluZ3MsXG4gICAgICAgICAgICAgICAgICAgICAgICBtZXNzYWdlOiBgJHtjYXRlZ29yeX0gc2V0dGluZ3MgcmV0cmlldmVkIHN1Y2Nlc3NmdWxseWBcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSkuY2F0Y2goKGVycjogRXJyb3IpID0+IHtcbiAgICAgICAgICAgICAgICByZXNvbHZlKHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiBlcnIubWVzc2FnZSB9KTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGFzeW5jIHJlZnJlc2hBc3NldHMoZm9sZGVyPzogc3RyaW5nKTogUHJvbWlzZTxUb29sUmVzcG9uc2U+IHtcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiB7XG4gICAgICAgICAgICAvLyDkvb/nlKjmraPnoa7nmoQgYXNzZXQtZGIgQVBJIOWIt+aWsOi1hOa6kFxuICAgICAgICAgICAgY29uc3QgdGFyZ2V0UGF0aCA9IGZvbGRlciB8fCAnZGI6Ly9hc3NldHMnO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBFZGl0b3IuTWVzc2FnZS5yZXF1ZXN0KCdhc3NldC1kYicsICdyZWZyZXNoLWFzc2V0JywgdGFyZ2V0UGF0aCkudGhlbigoKSA9PiB7XG4gICAgICAgICAgICAgICAgcmVzb2x2ZSh7XG4gICAgICAgICAgICAgICAgICAgIHN1Y2Nlc3M6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgIG1lc3NhZ2U6IGBBc3NldHMgcmVmcmVzaGVkIGluOiAke3RhcmdldFBhdGh9YFxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSkuY2F0Y2goKGVycjogRXJyb3IpID0+IHtcbiAgICAgICAgICAgICAgICByZXNvbHZlKHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiBlcnIubWVzc2FnZSB9KTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGFzeW5jIGltcG9ydEFzc2V0KHNvdXJjZVBhdGg6IHN0cmluZywgdGFyZ2V0Rm9sZGVyOiBzdHJpbmcpOiBQcm9taXNlPFRvb2xSZXNwb25zZT4ge1xuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHtcbiAgICAgICAgICAgIGlmICghZnMuZXhpc3RzU3luYyhzb3VyY2VQYXRoKSkge1xuICAgICAgICAgICAgICAgIHJlc29sdmUoeyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6ICdTb3VyY2UgZmlsZSBub3QgZm91bmQnIH0pO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgY29uc3QgZmlsZU5hbWUgPSBwYXRoLmJhc2VuYW1lKHNvdXJjZVBhdGgpO1xuICAgICAgICAgICAgY29uc3QgdGFyZ2V0UGF0aCA9IHRhcmdldEZvbGRlci5zdGFydHNXaXRoKCdkYjovLycpID9cbiAgICAgICAgICAgICAgICB0YXJnZXRGb2xkZXIgOiBgZGI6Ly9hc3NldHMvJHt0YXJnZXRGb2xkZXJ9YDtcblxuICAgICAgICAgICAgRWRpdG9yLk1lc3NhZ2UucmVxdWVzdCgnYXNzZXQtZGInLCAnaW1wb3J0LWFzc2V0Jywgc291cmNlUGF0aCwgYCR7dGFyZ2V0UGF0aH0vJHtmaWxlTmFtZX1gKS50aGVuKChyZXN1bHQ6IGFueSkgPT4ge1xuICAgICAgICAgICAgICAgIHJlc29sdmUoe1xuICAgICAgICAgICAgICAgICAgICBzdWNjZXNzOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICBkYXRhOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICB1dWlkOiByZXN1bHQudXVpZCxcbiAgICAgICAgICAgICAgICAgICAgICAgIHBhdGg6IHJlc3VsdC51cmwsXG4gICAgICAgICAgICAgICAgICAgICAgICBtZXNzYWdlOiBgQXNzZXQgaW1wb3J0ZWQ6ICR7ZmlsZU5hbWV9YFxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9KS5jYXRjaCgoZXJyOiBFcnJvcikgPT4ge1xuICAgICAgICAgICAgICAgIHJlc29sdmUoeyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6IGVyci5tZXNzYWdlIH0pO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHByaXZhdGUgYXN5bmMgZ2V0QXNzZXRJbmZvKGFzc2V0UGF0aDogc3RyaW5nKTogUHJvbWlzZTxUb29sUmVzcG9uc2U+IHtcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiB7XG4gICAgICAgICAgICBFZGl0b3IuTWVzc2FnZS5yZXF1ZXN0KCdhc3NldC1kYicsICdxdWVyeS1hc3NldC1pbmZvJywgYXNzZXRQYXRoKS50aGVuKChhc3NldEluZm86IGFueSkgPT4ge1xuICAgICAgICAgICAgICAgIGlmICghYXNzZXRJbmZvKSB7XG4gICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignQXNzZXQgbm90IGZvdW5kJyk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgY29uc3QgaW5mbzogQXNzZXRJbmZvID0ge1xuICAgICAgICAgICAgICAgICAgICBuYW1lOiBhc3NldEluZm8ubmFtZSxcbiAgICAgICAgICAgICAgICAgICAgdXVpZDogYXNzZXRJbmZvLnV1aWQsXG4gICAgICAgICAgICAgICAgICAgIHBhdGg6IGFzc2V0SW5mby51cmwsXG4gICAgICAgICAgICAgICAgICAgIHR5cGU6IGFzc2V0SW5mby50eXBlLFxuICAgICAgICAgICAgICAgICAgICBzaXplOiBhc3NldEluZm8uc2l6ZSxcbiAgICAgICAgICAgICAgICAgICAgaXNEaXJlY3Rvcnk6IGFzc2V0SW5mby5pc0RpcmVjdG9yeVxuICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgICAgICBpZiAoYXNzZXRJbmZvLm1ldGEpIHtcbiAgICAgICAgICAgICAgICAgICAgaW5mby5tZXRhID0ge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmVyOiBhc3NldEluZm8ubWV0YS52ZXIsXG4gICAgICAgICAgICAgICAgICAgICAgICBpbXBvcnRlcjogYXNzZXRJbmZvLm1ldGEuaW1wb3J0ZXJcbiAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICByZXNvbHZlKHsgc3VjY2VzczogdHJ1ZSwgZGF0YTogaW5mbyB9KTtcbiAgICAgICAgICAgIH0pLmNhdGNoKChlcnI6IEVycm9yKSA9PiB7XG4gICAgICAgICAgICAgICAgcmVzb2x2ZSh7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogZXJyLm1lc3NhZ2UgfSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBhc3luYyBnZXRBc3NldHModHlwZTogc3RyaW5nID0gJ2FsbCcsIGZvbGRlcjogc3RyaW5nID0gJ2RiOi8vYXNzZXRzJyk6IFByb21pc2U8VG9vbFJlc3BvbnNlPiB7XG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSkgPT4ge1xuICAgICAgICAgICAgbGV0IHBhdHRlcm4gPSBgJHtmb2xkZXJ9LyoqLypgO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICAvLyDmt7vliqDnsbvlnovov4fmu6RcbiAgICAgICAgICAgIGlmICh0eXBlICE9PSAnYWxsJykge1xuICAgICAgICAgICAgICAgIGNvbnN0IHR5cGVFeHRlbnNpb25zOiBSZWNvcmQ8c3RyaW5nLCBzdHJpbmc+ID0ge1xuICAgICAgICAgICAgICAgICAgICAnc2NlbmUnOiAnLnNjZW5lJyxcbiAgICAgICAgICAgICAgICAgICAgJ3ByZWZhYic6ICcucHJlZmFiJyxcbiAgICAgICAgICAgICAgICAgICAgJ3NjcmlwdCc6ICcue3RzLGpzfScsXG4gICAgICAgICAgICAgICAgICAgICd0ZXh0dXJlJzogJy57cG5nLGpwZyxqcGVnLGdpZix0Z2EsYm1wLHBzZH0nLFxuICAgICAgICAgICAgICAgICAgICAnbWF0ZXJpYWwnOiAnLm10bCcsXG4gICAgICAgICAgICAgICAgICAgICdtZXNoJzogJy57ZmJ4LG9iaixkYWV9JyxcbiAgICAgICAgICAgICAgICAgICAgJ2F1ZGlvJzogJy57bXAzLG9nZyx3YXYsbTRhfScsXG4gICAgICAgICAgICAgICAgICAgICdhbmltYXRpb24nOiAnLnthbmltLGNsaXB9J1xuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgY29uc3QgZXh0ZW5zaW9uID0gdHlwZUV4dGVuc2lvbnNbdHlwZV07XG4gICAgICAgICAgICAgICAgaWYgKGV4dGVuc2lvbikge1xuICAgICAgICAgICAgICAgICAgICBwYXR0ZXJuID0gYCR7Zm9sZGVyfS8qKi8qJHtleHRlbnNpb259YDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIE5vdGU6IHF1ZXJ5LWFzc2V0cyBBUEkgcGFyYW1ldGVycyBjb3JyZWN0ZWQgYmFzZWQgb24gZG9jdW1lbnRhdGlvblxuICAgICAgICAgICAgRWRpdG9yLk1lc3NhZ2UucmVxdWVzdCgnYXNzZXQtZGInLCAncXVlcnktYXNzZXRzJywgeyBwYXR0ZXJuOiBwYXR0ZXJuIH0pLnRoZW4oKHJlc3VsdHM6IGFueVtdKSA9PiB7XG4gICAgICAgICAgICAgICAgY29uc3QgYXNzZXRzID0gcmVzdWx0cy5tYXAoYXNzZXQgPT4gKHtcbiAgICAgICAgICAgICAgICAgICAgbmFtZTogYXNzZXQubmFtZSxcbiAgICAgICAgICAgICAgICAgICAgdXVpZDogYXNzZXQudXVpZCxcbiAgICAgICAgICAgICAgICAgICAgcGF0aDogYXNzZXQudXJsLFxuICAgICAgICAgICAgICAgICAgICB0eXBlOiBhc3NldC50eXBlLFxuICAgICAgICAgICAgICAgICAgICBzaXplOiBhc3NldC5zaXplIHx8IDAsXG4gICAgICAgICAgICAgICAgICAgIGlzRGlyZWN0b3J5OiBhc3NldC5pc0RpcmVjdG9yeSB8fCBmYWxzZVxuICAgICAgICAgICAgICAgIH0pKTtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICByZXNvbHZlKHsgXG4gICAgICAgICAgICAgICAgICAgIHN1Y2Nlc3M6IHRydWUsIFxuICAgICAgICAgICAgICAgICAgICBkYXRhOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiB0eXBlLFxuICAgICAgICAgICAgICAgICAgICAgICAgZm9sZGVyOiBmb2xkZXIsXG4gICAgICAgICAgICAgICAgICAgICAgICBjb3VudDogYXNzZXRzLmxlbmd0aCxcbiAgICAgICAgICAgICAgICAgICAgICAgIGFzc2V0czogYXNzZXRzXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0pLmNhdGNoKChlcnI6IEVycm9yKSA9PiB7XG4gICAgICAgICAgICAgICAgcmVzb2x2ZSh7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogZXJyLm1lc3NhZ2UgfSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBhc3luYyBnZXRCdWlsZFNldHRpbmdzKCk6IFByb21pc2U8VG9vbFJlc3BvbnNlPiB7XG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSkgPT4ge1xuICAgICAgICAgICAgLy8g5qOA5p+l5p6E5bu65Zmo5piv5ZCm5YeG5aSH5bCx57uqXG4gICAgICAgICAgICBFZGl0b3IuTWVzc2FnZS5yZXF1ZXN0KCdidWlsZGVyJywgJ3F1ZXJ5LXdvcmtlci1yZWFkeScpLnRoZW4oKHJlYWR5OiBib29sZWFuKSA9PiB7XG4gICAgICAgICAgICAgICAgcmVzb2x2ZSh7XG4gICAgICAgICAgICAgICAgICAgIHN1Y2Nlc3M6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgIGRhdGE6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJ1aWxkZXJSZWFkeTogcmVhZHksXG4gICAgICAgICAgICAgICAgICAgICAgICBtZXNzYWdlOiAnQnVpbGQgc2V0dGluZ3MgYXJlIGxpbWl0ZWQgaW4gTUNQIHBsdWdpbiBlbnZpcm9ubWVudCcsXG4gICAgICAgICAgICAgICAgICAgICAgICBhdmFpbGFibGVBY3Rpb25zOiBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJ09wZW4gYnVpbGQgcGFuZWwgd2l0aCBvcGVuX2J1aWxkX3BhbmVsJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAnQ2hlY2sgYnVpbGRlciBzdGF0dXMgd2l0aCBjaGVja19idWlsZGVyX3N0YXR1cycsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJ1N0YXJ0IHByZXZpZXcgc2VydmVyIHdpdGggc3RhcnRfcHJldmlld19zZXJ2ZXInLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICdTdG9wIHByZXZpZXcgc2VydmVyIHdpdGggc3RvcF9wcmV2aWV3X3NlcnZlcidcbiAgICAgICAgICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgICAgICAgICAgICBsaW1pdGF0aW9uOiAnRnVsbCBidWlsZCBjb25maWd1cmF0aW9uIHJlcXVpcmVzIGRpcmVjdCBFZGl0b3IgVUkgYWNjZXNzJ1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9KS5jYXRjaCgoZXJyOiBFcnJvcikgPT4ge1xuICAgICAgICAgICAgICAgIHJlc29sdmUoeyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6IGVyci5tZXNzYWdlIH0pO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHByaXZhdGUgYXN5bmMgb3BlbkJ1aWxkUGFuZWwoKTogUHJvbWlzZTxUb29sUmVzcG9uc2U+IHtcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiB7XG4gICAgICAgICAgICBFZGl0b3IuTWVzc2FnZS5yZXF1ZXN0KCdidWlsZGVyJywgJ29wZW4nKS50aGVuKCgpID0+IHtcbiAgICAgICAgICAgICAgICByZXNvbHZlKHtcbiAgICAgICAgICAgICAgICAgICAgc3VjY2VzczogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgbWVzc2FnZTogJ0J1aWxkIHBhbmVsIG9wZW5lZCBzdWNjZXNzZnVsbHknXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9KS5jYXRjaCgoZXJyOiBFcnJvcikgPT4ge1xuICAgICAgICAgICAgICAgIHJlc29sdmUoeyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6IGVyci5tZXNzYWdlIH0pO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHByaXZhdGUgYXN5bmMgY2hlY2tCdWlsZGVyU3RhdHVzKCk6IFByb21pc2U8VG9vbFJlc3BvbnNlPiB7XG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSkgPT4ge1xuICAgICAgICAgICAgRWRpdG9yLk1lc3NhZ2UucmVxdWVzdCgnYnVpbGRlcicsICdxdWVyeS13b3JrZXItcmVhZHknKS50aGVuKChyZWFkeTogYm9vbGVhbikgPT4ge1xuICAgICAgICAgICAgICAgIHJlc29sdmUoe1xuICAgICAgICAgICAgICAgICAgICBzdWNjZXNzOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICBkYXRhOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZWFkeTogcmVhZHksXG4gICAgICAgICAgICAgICAgICAgICAgICBzdGF0dXM6IHJlYWR5ID8gJ0J1aWxkZXIgd29ya2VyIGlzIHJlYWR5JyA6ICdCdWlsZGVyIHdvcmtlciBpcyBub3QgcmVhZHknLFxuICAgICAgICAgICAgICAgICAgICAgICAgbWVzc2FnZTogJ0J1aWxkZXIgc3RhdHVzIGNoZWNrZWQgc3VjY2Vzc2Z1bGx5J1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9KS5jYXRjaCgoZXJyOiBFcnJvcikgPT4ge1xuICAgICAgICAgICAgICAgIHJlc29sdmUoeyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6IGVyci5tZXNzYWdlIH0pO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHByaXZhdGUgYXN5bmMgc3RhcnRQcmV2aWV3U2VydmVyKHBvcnQ6IG51bWJlciA9IDc0NTYpOiBQcm9taXNlPFRvb2xSZXNwb25zZT4ge1xuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHtcbiAgICAgICAgICAgIHJlc29sdmUoe1xuICAgICAgICAgICAgICAgIHN1Y2Nlc3M6IGZhbHNlLFxuICAgICAgICAgICAgICAgIGVycm9yOiAnUHJldmlldyBzZXJ2ZXIgY29udHJvbCBpcyBub3Qgc3VwcG9ydGVkIHRocm91Z2ggTUNQIEFQSScsXG4gICAgICAgICAgICAgICAgaW5zdHJ1Y3Rpb246ICdQbGVhc2Ugc3RhcnQgdGhlIHByZXZpZXcgc2VydmVyIG1hbnVhbGx5IHVzaW5nIHRoZSBlZGl0b3IgbWVudTogUHJvamVjdCA+IFByZXZpZXcsIG9yIHVzZSB0aGUgcHJldmlldyBwYW5lbCBpbiB0aGUgZWRpdG9yJ1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHByaXZhdGUgYXN5bmMgc3RvcFByZXZpZXdTZXJ2ZXIoKTogUHJvbWlzZTxUb29sUmVzcG9uc2U+IHtcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiB7XG4gICAgICAgICAgICByZXNvbHZlKHtcbiAgICAgICAgICAgICAgICBzdWNjZXNzOiBmYWxzZSxcbiAgICAgICAgICAgICAgICBlcnJvcjogJ1ByZXZpZXcgc2VydmVyIGNvbnRyb2wgaXMgbm90IHN1cHBvcnRlZCB0aHJvdWdoIE1DUCBBUEknLFxuICAgICAgICAgICAgICAgIGluc3RydWN0aW9uOiAnUGxlYXNlIHN0b3AgdGhlIHByZXZpZXcgc2VydmVyIG1hbnVhbGx5IHVzaW5nIHRoZSBwcmV2aWV3IHBhbmVsIGluIHRoZSBlZGl0b3InXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBhc3luYyBjcmVhdGVBc3NldCh1cmw6IHN0cmluZywgY29udGVudDogc3RyaW5nIHwgbnVsbCA9IG51bGwsIG92ZXJ3cml0ZTogYm9vbGVhbiA9IGZhbHNlKTogUHJvbWlzZTxUb29sUmVzcG9uc2U+IHtcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBvcHRpb25zID0ge1xuICAgICAgICAgICAgICAgIG92ZXJ3cml0ZTogb3ZlcndyaXRlLFxuICAgICAgICAgICAgICAgIHJlbmFtZTogIW92ZXJ3cml0ZVxuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgRWRpdG9yLk1lc3NhZ2UucmVxdWVzdCgnYXNzZXQtZGInLCAnY3JlYXRlLWFzc2V0JywgdXJsLCBjb250ZW50LCBvcHRpb25zKS50aGVuKChyZXN1bHQ6IGFueSkgPT4ge1xuICAgICAgICAgICAgICAgIGlmIChyZXN1bHQgJiYgcmVzdWx0LnV1aWQpIHtcbiAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZSh7XG4gICAgICAgICAgICAgICAgICAgICAgICBzdWNjZXNzOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICAgICAgZGF0YToge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHV1aWQ6IHJlc3VsdC51dWlkLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHVybDogcmVzdWx0LnVybCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtZXNzYWdlOiBjb250ZW50ID09PSBudWxsID8gJ0ZvbGRlciBjcmVhdGVkIHN1Y2Nlc3NmdWxseScgOiAnRmlsZSBjcmVhdGVkIHN1Y2Nlc3NmdWxseSdcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZSh7XG4gICAgICAgICAgICAgICAgICAgICAgICBzdWNjZXNzOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICAgICAgZGF0YToge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHVybDogdXJsLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1lc3NhZ2U6IGNvbnRlbnQgPT09IG51bGwgPyAnRm9sZGVyIGNyZWF0ZWQgc3VjY2Vzc2Z1bGx5JyA6ICdGaWxlIGNyZWF0ZWQgc3VjY2Vzc2Z1bGx5J1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KS5jYXRjaCgoZXJyOiBFcnJvcikgPT4ge1xuICAgICAgICAgICAgICAgIHJlc29sdmUoeyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6IGVyci5tZXNzYWdlIH0pO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHByaXZhdGUgYXN5bmMgY29weUFzc2V0KHNvdXJjZTogc3RyaW5nLCB0YXJnZXQ6IHN0cmluZywgb3ZlcndyaXRlOiBib29sZWFuID0gZmFsc2UpOiBQcm9taXNlPFRvb2xSZXNwb25zZT4ge1xuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IG9wdGlvbnMgPSB7XG4gICAgICAgICAgICAgICAgb3ZlcndyaXRlOiBvdmVyd3JpdGUsXG4gICAgICAgICAgICAgICAgcmVuYW1lOiAhb3ZlcndyaXRlXG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICBFZGl0b3IuTWVzc2FnZS5yZXF1ZXN0KCdhc3NldC1kYicsICdjb3B5LWFzc2V0Jywgc291cmNlLCB0YXJnZXQsIG9wdGlvbnMpLnRoZW4oKHJlc3VsdDogYW55KSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKHJlc3VsdCAmJiByZXN1bHQudXVpZCkge1xuICAgICAgICAgICAgICAgICAgICByZXNvbHZlKHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHN1Y2Nlc3M6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRhOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdXVpZDogcmVzdWx0LnV1aWQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdXJsOiByZXN1bHQudXJsLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1lc3NhZ2U6ICdBc3NldCBjb3BpZWQgc3VjY2Vzc2Z1bGx5J1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICByZXNvbHZlKHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHN1Y2Nlc3M6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRhOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc291cmNlOiBzb3VyY2UsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGFyZ2V0OiB0YXJnZXQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbWVzc2FnZTogJ0Fzc2V0IGNvcGllZCBzdWNjZXNzZnVsbHknXG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pLmNhdGNoKChlcnI6IEVycm9yKSA9PiB7XG4gICAgICAgICAgICAgICAgcmVzb2x2ZSh7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogZXJyLm1lc3NhZ2UgfSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBhc3luYyBtb3ZlQXNzZXQoc291cmNlOiBzdHJpbmcsIHRhcmdldDogc3RyaW5nLCBvdmVyd3JpdGU6IGJvb2xlYW4gPSBmYWxzZSk6IFByb21pc2U8VG9vbFJlc3BvbnNlPiB7XG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSkgPT4ge1xuICAgICAgICAgICAgY29uc3Qgb3B0aW9ucyA9IHtcbiAgICAgICAgICAgICAgICBvdmVyd3JpdGU6IG92ZXJ3cml0ZSxcbiAgICAgICAgICAgICAgICByZW5hbWU6ICFvdmVyd3JpdGVcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIEVkaXRvci5NZXNzYWdlLnJlcXVlc3QoJ2Fzc2V0LWRiJywgJ21vdmUtYXNzZXQnLCBzb3VyY2UsIHRhcmdldCwgb3B0aW9ucykudGhlbigocmVzdWx0OiBhbnkpID0+IHtcbiAgICAgICAgICAgICAgICBpZiAocmVzdWx0ICYmIHJlc3VsdC51dWlkKSB7XG4gICAgICAgICAgICAgICAgICAgIHJlc29sdmUoe1xuICAgICAgICAgICAgICAgICAgICAgICAgc3VjY2VzczogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGRhdGE6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB1dWlkOiByZXN1bHQudXVpZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB1cmw6IHJlc3VsdC51cmwsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbWVzc2FnZTogJ0Fzc2V0IG1vdmVkIHN1Y2Nlc3NmdWxseSdcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZSh7XG4gICAgICAgICAgICAgICAgICAgICAgICBzdWNjZXNzOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICAgICAgZGF0YToge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNvdXJjZTogc291cmNlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRhcmdldDogdGFyZ2V0LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1lc3NhZ2U6ICdBc3NldCBtb3ZlZCBzdWNjZXNzZnVsbHknXG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pLmNhdGNoKChlcnI6IEVycm9yKSA9PiB7XG4gICAgICAgICAgICAgICAgcmVzb2x2ZSh7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogZXJyLm1lc3NhZ2UgfSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBhc3luYyBkZWxldGVBc3NldCh1cmw6IHN0cmluZyk6IFByb21pc2U8VG9vbFJlc3BvbnNlPiB7XG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSkgPT4ge1xuICAgICAgICAgICAgRWRpdG9yLk1lc3NhZ2UucmVxdWVzdCgnYXNzZXQtZGInLCAnZGVsZXRlLWFzc2V0JywgdXJsKS50aGVuKChyZXN1bHQ6IGFueSkgPT4ge1xuICAgICAgICAgICAgICAgIHJlc29sdmUoe1xuICAgICAgICAgICAgICAgICAgICBzdWNjZXNzOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICBkYXRhOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICB1cmw6IHVybCxcbiAgICAgICAgICAgICAgICAgICAgICAgIG1lc3NhZ2U6ICdBc3NldCBkZWxldGVkIHN1Y2Nlc3NmdWxseSdcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSkuY2F0Y2goKGVycjogRXJyb3IpID0+IHtcbiAgICAgICAgICAgICAgICByZXNvbHZlKHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiBlcnIubWVzc2FnZSB9KTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGFzeW5jIHNhdmVBc3NldCh1cmw6IHN0cmluZywgY29udGVudDogc3RyaW5nKTogUHJvbWlzZTxUb29sUmVzcG9uc2U+IHtcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiB7XG4gICAgICAgICAgICBFZGl0b3IuTWVzc2FnZS5yZXF1ZXN0KCdhc3NldC1kYicsICdzYXZlLWFzc2V0JywgdXJsLCBjb250ZW50KS50aGVuKChyZXN1bHQ6IGFueSkgPT4ge1xuICAgICAgICAgICAgICAgIGlmIChyZXN1bHQgJiYgcmVzdWx0LnV1aWQpIHtcbiAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZSh7XG4gICAgICAgICAgICAgICAgICAgICAgICBzdWNjZXNzOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICAgICAgZGF0YToge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHV1aWQ6IHJlc3VsdC51dWlkLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHVybDogcmVzdWx0LnVybCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtZXNzYWdlOiAnQXNzZXQgc2F2ZWQgc3VjY2Vzc2Z1bGx5J1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICByZXNvbHZlKHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHN1Y2Nlc3M6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRhOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdXJsOiB1cmwsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbWVzc2FnZTogJ0Fzc2V0IHNhdmVkIHN1Y2Nlc3NmdWxseSdcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSkuY2F0Y2goKGVycjogRXJyb3IpID0+IHtcbiAgICAgICAgICAgICAgICByZXNvbHZlKHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiBlcnIubWVzc2FnZSB9KTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGFzeW5jIHJlaW1wb3J0QXNzZXQodXJsOiBzdHJpbmcpOiBQcm9taXNlPFRvb2xSZXNwb25zZT4ge1xuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHtcbiAgICAgICAgICAgIEVkaXRvci5NZXNzYWdlLnJlcXVlc3QoJ2Fzc2V0LWRiJywgJ3JlaW1wb3J0LWFzc2V0JywgdXJsKS50aGVuKCgpID0+IHtcbiAgICAgICAgICAgICAgICByZXNvbHZlKHtcbiAgICAgICAgICAgICAgICAgICAgc3VjY2VzczogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgZGF0YToge1xuICAgICAgICAgICAgICAgICAgICAgICAgdXJsOiB1cmwsXG4gICAgICAgICAgICAgICAgICAgICAgICBtZXNzYWdlOiAnQXNzZXQgcmVpbXBvcnRlZCBzdWNjZXNzZnVsbHknXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0pLmNhdGNoKChlcnI6IEVycm9yKSA9PiB7XG4gICAgICAgICAgICAgICAgcmVzb2x2ZSh7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogZXJyLm1lc3NhZ2UgfSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBhc3luYyBxdWVyeUFzc2V0UGF0aCh1cmw6IHN0cmluZyk6IFByb21pc2U8VG9vbFJlc3BvbnNlPiB7XG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSkgPT4ge1xuICAgICAgICAgICAgRWRpdG9yLk1lc3NhZ2UucmVxdWVzdCgnYXNzZXQtZGInLCAncXVlcnktcGF0aCcsIHVybCkudGhlbigocGF0aDogc3RyaW5nIHwgbnVsbCkgPT4ge1xuICAgICAgICAgICAgICAgIGlmIChwYXRoKSB7XG4gICAgICAgICAgICAgICAgICAgIHJlc29sdmUoe1xuICAgICAgICAgICAgICAgICAgICAgICAgc3VjY2VzczogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGRhdGE6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB1cmw6IHVybCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYXRoOiBwYXRoLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1lc3NhZ2U6ICdBc3NldCBwYXRoIHJldHJpZXZlZCBzdWNjZXNzZnVsbHknXG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHJlc29sdmUoeyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6ICdBc3NldCBwYXRoIG5vdCBmb3VuZCcgfSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSkuY2F0Y2goKGVycjogRXJyb3IpID0+IHtcbiAgICAgICAgICAgICAgICByZXNvbHZlKHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiBlcnIubWVzc2FnZSB9KTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGFzeW5jIHF1ZXJ5QXNzZXRVdWlkKHVybDogc3RyaW5nKTogUHJvbWlzZTxUb29sUmVzcG9uc2U+IHtcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiB7XG4gICAgICAgICAgICBFZGl0b3IuTWVzc2FnZS5yZXF1ZXN0KCdhc3NldC1kYicsICdxdWVyeS11dWlkJywgdXJsKS50aGVuKCh1dWlkOiBzdHJpbmcgfCBudWxsKSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKHV1aWQpIHtcbiAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZSh7XG4gICAgICAgICAgICAgICAgICAgICAgICBzdWNjZXNzOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICAgICAgZGF0YToge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHVybDogdXJsLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHV1aWQ6IHV1aWQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbWVzc2FnZTogJ0Fzc2V0IFVVSUQgcmV0cmlldmVkIHN1Y2Nlc3NmdWxseSdcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZSh7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogJ0Fzc2V0IFVVSUQgbm90IGZvdW5kJyB9KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KS5jYXRjaCgoZXJyOiBFcnJvcikgPT4ge1xuICAgICAgICAgICAgICAgIHJlc29sdmUoeyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6IGVyci5tZXNzYWdlIH0pO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHByaXZhdGUgYXN5bmMgcXVlcnlBc3NldFVybCh1dWlkOiBzdHJpbmcpOiBQcm9taXNlPFRvb2xSZXNwb25zZT4ge1xuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHtcbiAgICAgICAgICAgIEVkaXRvci5NZXNzYWdlLnJlcXVlc3QoJ2Fzc2V0LWRiJywgJ3F1ZXJ5LXVybCcsIHV1aWQpLnRoZW4oKHVybDogc3RyaW5nIHwgbnVsbCkgPT4ge1xuICAgICAgICAgICAgICAgIGlmICh1cmwpIHtcbiAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZSh7XG4gICAgICAgICAgICAgICAgICAgICAgICBzdWNjZXNzOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICAgICAgZGF0YToge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHV1aWQ6IHV1aWQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdXJsOiB1cmwsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbWVzc2FnZTogJ0Fzc2V0IFVSTCByZXRyaWV2ZWQgc3VjY2Vzc2Z1bGx5J1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICByZXNvbHZlKHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiAnQXNzZXQgVVJMIG5vdCBmb3VuZCcgfSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSkuY2F0Y2goKGVycjogRXJyb3IpID0+IHtcbiAgICAgICAgICAgICAgICByZXNvbHZlKHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiBlcnIubWVzc2FnZSB9KTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGFzeW5jIGZpbmRBc3NldEJ5TmFtZShhcmdzOiBhbnkpOiBQcm9taXNlPFRvb2xSZXNwb25zZT4ge1xuICAgICAgICBjb25zdCB7IG5hbWUsIGV4YWN0TWF0Y2ggPSBmYWxzZSwgYXNzZXRUeXBlID0gJ2FsbCcsIGZvbGRlciA9ICdkYjovL2Fzc2V0cycsIG1heFJlc3VsdHMgPSAyMCB9ID0gYXJncztcblxuICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIC8vIEdldCBhbGwgYXNzZXRzIGluIHRoZSBzcGVjaWZpZWQgZm9sZGVyXG4gICAgICAgICAgICAgICAgY29uc3QgYWxsQXNzZXRzUmVzcG9uc2UgPSBhd2FpdCB0aGlzLmdldEFzc2V0cyhhc3NldFR5cGUsIGZvbGRlcik7XG4gICAgICAgICAgICAgICAgaWYgKCFhbGxBc3NldHNSZXNwb25zZS5zdWNjZXNzIHx8ICFhbGxBc3NldHNSZXNwb25zZS5kYXRhKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzdWNjZXNzOiBmYWxzZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yOiBgRmFpbGVkIHRvIGdldCBhc3NldHM6ICR7YWxsQXNzZXRzUmVzcG9uc2UuZXJyb3J9YFxuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBjb25zdCBhbGxBc3NldHMgPSBhbGxBc3NldHNSZXNwb25zZS5kYXRhLmFzc2V0cyBhcyBhbnlbXTtcbiAgICAgICAgICAgICAgICBsZXQgbWF0Y2hlZEFzc2V0czogYW55W10gPSBbXTtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAvLyBTZWFyY2ggZm9yIG1hdGNoaW5nIGFzc2V0c1xuICAgICAgICAgICAgICAgIGZvciAoY29uc3QgYXNzZXQgb2YgYWxsQXNzZXRzKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGFzc2V0TmFtZSA9IGFzc2V0Lm5hbWU7XG4gICAgICAgICAgICAgICAgICAgIGxldCBtYXRjaGVzID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICBpZiAoZXhhY3RNYXRjaCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgbWF0Y2hlcyA9IGFzc2V0TmFtZSA9PT0gbmFtZTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG1hdGNoZXMgPSBhc3NldE5hbWUudG9Mb3dlckNhc2UoKS5pbmNsdWRlcyhuYW1lLnRvTG93ZXJDYXNlKCkpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICBpZiAobWF0Y2hlcykge1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gR2V0IGRldGFpbGVkIGFzc2V0IGluZm8gaWYgbmVlZGVkXG4gICAgICAgICAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGRldGFpbFJlc3BvbnNlID0gYXdhaXQgdGhpcy5nZXRBc3NldEluZm8oYXNzZXQucGF0aCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGRldGFpbFJlc3BvbnNlLnN1Y2Nlc3MpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbWF0Y2hlZEFzc2V0cy5wdXNoKHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC4uLmFzc2V0LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGV0YWlsczogZGV0YWlsUmVzcG9uc2UuZGF0YVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtYXRjaGVkQXNzZXRzLnB1c2goYXNzZXQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH0gY2F0Y2gge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1hdGNoZWRBc3NldHMucHVzaChhc3NldCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChtYXRjaGVkQXNzZXRzLmxlbmd0aCA+PSBtYXhSZXN1bHRzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgc3VjY2VzczogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgZGF0YToge1xuICAgICAgICAgICAgICAgICAgICAgICAgc2VhcmNoVGVybTogbmFtZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGV4YWN0TWF0Y2gsXG4gICAgICAgICAgICAgICAgICAgICAgICBhc3NldFR5cGUsXG4gICAgICAgICAgICAgICAgICAgICAgICBmb2xkZXIsXG4gICAgICAgICAgICAgICAgICAgICAgICB0b3RhbEZvdW5kOiBtYXRjaGVkQXNzZXRzLmxlbmd0aCxcbiAgICAgICAgICAgICAgICAgICAgICAgIG1heFJlc3VsdHMsXG4gICAgICAgICAgICAgICAgICAgICAgICBhc3NldHM6IG1hdGNoZWRBc3NldHMsXG4gICAgICAgICAgICAgICAgICAgICAgICBtZXNzYWdlOiBgRm91bmQgJHttYXRjaGVkQXNzZXRzLmxlbmd0aH0gYXNzZXRzIG1hdGNoaW5nICcke25hbWV9J2BcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIH0gY2F0Y2ggKGVycm9yOiBhbnkpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICBzdWNjZXNzOiBmYWxzZSxcbiAgICAgICAgICAgICAgICAgICAgZXJyb3I6IGBBc3NldCBzZWFyY2ggZmFpbGVkOiAke2Vycm9yLm1lc3NhZ2V9YFxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9XG4gICAgfVxuICAgIFxuICAgIHByaXZhdGUgYXN5bmMgZ2V0QXNzZXREZXRhaWxzKGFzc2V0UGF0aDogc3RyaW5nLCBpbmNsdWRlU3ViQXNzZXRzOiBib29sZWFuID0gdHJ1ZSk6IFByb21pc2U8VG9vbFJlc3BvbnNlPiB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgLy8gR2V0IGJhc2ljIGFzc2V0IGluZm9cbiAgICAgICAgICAgICAgICBjb25zdCBhc3NldEluZm9SZXNwb25zZSA9IGF3YWl0IHRoaXMuZ2V0QXNzZXRJbmZvKGFzc2V0UGF0aCk7XG4gICAgICAgICAgICAgICAgaWYgKCFhc3NldEluZm9SZXNwb25zZS5zdWNjZXNzKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBhc3NldEluZm9SZXNwb25zZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgY29uc3QgYXNzZXRJbmZvID0gYXNzZXRJbmZvUmVzcG9uc2UuZGF0YTtcbiAgICAgICAgICAgICAgICBjb25zdCBkZXRhaWxlZEluZm86IGFueSA9IHtcbiAgICAgICAgICAgICAgICAgICAgLi4uYXNzZXRJbmZvLFxuICAgICAgICAgICAgICAgICAgICBzdWJBc3NldHM6IFtdXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBpZiAoaW5jbHVkZVN1YkFzc2V0cyAmJiBhc3NldEluZm8pIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gRm9yIGltYWdlIGFzc2V0cywgdHJ5IHRvIGdldCBzcHJpdGVGcmFtZSBhbmQgdGV4dHVyZSBzdWItYXNzZXRzXG4gICAgICAgICAgICAgICAgICAgIGlmIChhc3NldEluZm8udHlwZSA9PT0gJ2NjLkltYWdlQXNzZXQnIHx8IGFzc2V0UGF0aC5tYXRjaCgvXFwuKHBuZ3xqcGd8anBlZ3xnaWZ8dGdhfGJtcHxwc2QpJC9pKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gR2VuZXJhdGUgY29tbW9uIHN1Yi1hc3NldCBVVUlEc1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgYmFzZVV1aWQgPSBhc3NldEluZm8udXVpZDtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHBvc3NpYmxlU3ViQXNzZXRzID0gW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHsgdHlwZTogJ3Nwcml0ZUZyYW1lJywgdXVpZDogYCR7YmFzZVV1aWR9QGY5OTQxYCwgc3VmZml4OiAnQGY5OTQxJyB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHsgdHlwZTogJ3RleHR1cmUnLCB1dWlkOiBgJHtiYXNlVXVpZH1ANmM0OGFgLCBzdWZmaXg6ICdANmM0OGEnIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgeyB0eXBlOiAndGV4dHVyZTJEJywgdXVpZDogYCR7YmFzZVV1aWR9QDZjNDhhYCwgc3VmZml4OiAnQDZjNDhhJyB9XG4gICAgICAgICAgICAgICAgICAgICAgICBdO1xuICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICBmb3IgKGNvbnN0IHN1YkFzc2V0IG9mIHBvc3NpYmxlU3ViQXNzZXRzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gVHJ5IHRvIGdldCBVUkwgZm9yIHRoZSBzdWItYXNzZXQgdG8gdmVyaWZ5IGl0IGV4aXN0c1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBzdWJBc3NldFVybCA9IGF3YWl0IEVkaXRvci5NZXNzYWdlLnJlcXVlc3QoJ2Fzc2V0LWRiJywgJ3F1ZXJ5LXVybCcsIHN1YkFzc2V0LnV1aWQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoc3ViQXNzZXRVcmwpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRldGFpbGVkSW5mby5zdWJBc3NldHMucHVzaCh7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogc3ViQXNzZXQudHlwZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB1dWlkOiBzdWJBc3NldC51dWlkLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHVybDogc3ViQXNzZXRVcmwsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3VmZml4OiBzdWJBc3NldC5zdWZmaXhcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBjYXRjaCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIFN1Yi1hc3NldCBkb2Vzbid0IGV4aXN0LCBza2lwIGl0XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgIHN1Y2Nlc3M6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgIGRhdGE6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGFzc2V0UGF0aCxcbiAgICAgICAgICAgICAgICAgICAgICAgIGluY2x1ZGVTdWJBc3NldHMsXG4gICAgICAgICAgICAgICAgICAgICAgICAuLi5kZXRhaWxlZEluZm8sXG4gICAgICAgICAgICAgICAgICAgICAgICBtZXNzYWdlOiBgQXNzZXQgZGV0YWlscyByZXRyaWV2ZWQuIEZvdW5kICR7ZGV0YWlsZWRJbmZvLnN1YkFzc2V0cy5sZW5ndGh9IHN1Yi1hc3NldHMuYFxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgfSBjYXRjaCAoZXJyb3I6IGFueSkge1xuICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgIHN1Y2Nlc3M6IGZhbHNlLFxuICAgICAgICAgICAgICAgICAgICBlcnJvcjogYEZhaWxlZCB0byBnZXQgYXNzZXQgZGV0YWlsczogJHtlcnJvci5tZXNzYWdlfWBcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfVxuICAgIH1cbn0iXX0=