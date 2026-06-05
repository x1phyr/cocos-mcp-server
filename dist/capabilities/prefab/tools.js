"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrefabTools = void 0;
class PrefabTools {
    getTools() {
        return [
            {
                name: 'get_prefab_list',
                description: '获取项目中所有预制体',
                inputSchema: {
                    type: 'object',
                    properties: {
                        folder: {
                            type: 'string',
                            description: '搜索的文件夹路径（可选）',
                            default: 'db://assets'
                        }
                    }
                }
            },
            {
                name: 'load_prefab',
                description: '按路径加载预制体',
                inputSchema: {
                    type: 'object',
                    properties: {
                        prefabPath: {
                            type: 'string',
                            description: '预制体资源路径'
                        }
                    },
                    required: ['prefabPath']
                }
            },
            {
                name: 'instantiate_prefab',
                description: '在场景中实例化预制体',
                inputSchema: {
                    type: 'object',
                    properties: {
                        prefabPath: {
                            type: 'string',
                            description: '预制体资源路径'
                        },
                        parentUuid: {
                            type: 'string',
                            description: '父节点 UUID（可选）'
                        },
                        position: {
                            type: 'object',
                            description: '初始位置',
                            properties: {
                                x: { type: 'number' },
                                y: { type: 'number' },
                                z: { type: 'number' }
                            }
                        }
                    },
                    required: ['prefabPath']
                }
            },
            {
                name: 'create_prefab',
                description: '从节点创建预制体',
                inputSchema: {
                    type: 'object',
                    properties: {
                        nodeUuid: {
                            type: 'string',
                            description: '源节点 UUID'
                        },
                        savePath: {
                            type: 'string',
                            description: '预制体保存路径（例如 db://assets/prefabs/MyPrefab.prefab）'
                        },
                        prefabName: {
                            type: 'string',
                            description: '预制体名称'
                        }
                    },
                    required: ['nodeUuid', 'savePath', 'prefabName']
                }
            },
            {
                name: 'update_prefab',
                description: '更新现有预制体',
                inputSchema: {
                    type: 'object',
                    properties: {
                        prefabPath: {
                            type: 'string',
                            description: '预制体资源路径'
                        },
                        nodeUuid: {
                            type: 'string',
                            description: '包含变更的节点 UUID'
                        }
                    },
                    required: ['prefabPath', 'nodeUuid']
                }
            },
            {
                name: 'revert_prefab',
                description: '将预制体实例还原为原始版本',
                inputSchema: {
                    type: 'object',
                    properties: {
                        nodeUuid: {
                            type: 'string',
                            description: '预制体实例节点 UUID'
                        }
                    },
                    required: ['nodeUuid']
                }
            },
            {
                name: 'get_prefab_info',
                description: '获取预制体详细信息',
                inputSchema: {
                    type: 'object',
                    properties: {
                        prefabPath: {
                            type: 'string',
                            description: '预制体资源路径'
                        }
                    },
                    required: ['prefabPath']
                }
            },
            {
                name: 'validate_prefab',
                description: '验证预制体文件格式',
                inputSchema: {
                    type: 'object',
                    properties: {
                        prefabPath: {
                            type: 'string',
                            description: '预制体资源路径'
                        }
                    },
                    required: ['prefabPath']
                }
            },
            {
                name: 'duplicate_prefab',
                description: '复制预制体',
                inputSchema: {
                    type: 'object',
                    properties: {
                        sourcePrefabPath: {
                            type: 'string',
                            description: '源预制体路径'
                        },
                        targetPrefabPath: {
                            type: 'string',
                            description: '目标预制体路径'
                        },
                        newPrefabName: {
                            type: 'string',
                            description: '新预制体名称'
                        }
                    },
                    required: ['sourcePrefabPath', 'targetPrefabPath']
                }
            },
            {
                name: 'restore_prefab_node',
                description: '从资源恢复预制体实例',
                inputSchema: {
                    type: 'object',
                    properties: {
                        nodeUuid: {
                            type: 'string',
                            description: '预制体实例节点 UUID'
                        },
                        assetUuid: {
                            type: 'string',
                            description: '预制体资源 UUID'
                        }
                    },
                    required: ['nodeUuid', 'assetUuid']
                }
            }
        ];
    }
    async execute(toolName, args) {
        switch (toolName) {
            case 'get_prefab_list':
                return await this.getPrefabList(args.folder);
            case 'load_prefab':
                return await this.loadPrefab(args.prefabPath);
            case 'instantiate_prefab':
                return await this.instantiatePrefab(args);
            case 'create_prefab':
                return await this.createPrefab(args);
            case 'update_prefab':
                return await this.updatePrefab(args.prefabPath, args.nodeUuid);
            case 'revert_prefab':
                return await this.revertPrefab(args.nodeUuid);
            case 'get_prefab_info':
                return await this.getPrefabInfo(args.prefabPath);
            case 'validate_prefab':
                return await this.validatePrefab(args.prefabPath);
            case 'duplicate_prefab':
                return await this.duplicatePrefab(args);
            case 'restore_prefab_node':
                return await this.restorePrefabNode(args.nodeUuid, args.assetUuid);
            default:
                throw new Error(`Unknown tool: ${toolName}`);
        }
    }
    async getPrefabList(folder = 'db://assets') {
        return new Promise((resolve) => {
            const pattern = folder.endsWith('/') ?
                `${folder}**/*.prefab` : `${folder}/**/*.prefab`;
            Editor.Message.request('asset-db', 'query-assets', {
                pattern: pattern
            }).then((results) => {
                const prefabs = results.map(asset => ({
                    name: asset.name,
                    path: asset.url,
                    uuid: asset.uuid,
                    folder: asset.url.substring(0, asset.url.lastIndexOf('/'))
                }));
                resolve({ success: true, data: prefabs });
            }).catch((err) => {
                resolve({ success: false, error: err.message });
            });
        });
    }
    async loadPrefab(prefabPath) {
        return new Promise((resolve) => {
            Editor.Message.request('asset-db', 'query-asset-info', prefabPath).then((assetInfo) => {
                if (!assetInfo) {
                    throw new Error('Prefab not found');
                }
                return Editor.Message.request('scene', 'load-asset', {
                    uuid: assetInfo.uuid
                });
            }).then((prefabData) => {
                resolve({
                    success: true,
                    data: {
                        uuid: prefabData.uuid,
                        name: prefabData.name,
                        message: 'Prefab loaded successfully'
                    }
                });
            }).catch((err) => {
                resolve({ success: false, error: err.message });
            });
        });
    }
    async instantiatePrefab(args) {
        try {
            // 获取预制体资源信息
            const assetInfo = await Editor.Message.request('asset-db', 'query-asset-info', args.prefabPath);
            if (!assetInfo) {
                throw new Error('预制体未找到');
            }
            // 使用正确的 create-node API 从预制体资源实例化
            const createNodeOptions = {
                assetUuid: assetInfo.uuid
            };
            // 设置父节点
            if (args.parentUuid) {
                createNodeOptions.parent = args.parentUuid;
            }
            // 设置节点名称
            if (args.name) {
                createNodeOptions.name = args.name;
            }
            else if (assetInfo.name) {
                createNodeOptions.name = assetInfo.name;
            }
            // 设置初始属性（如位置）
            if (args.position) {
                createNodeOptions.dump = {
                    position: {
                        value: args.position
                    }
                };
            }
            // 创建节点
            const nodeUuid = await Editor.Message.request('scene', 'create-node', createNodeOptions);
            const uuid = Array.isArray(nodeUuid) ? nodeUuid[0] : nodeUuid;
            // 注意：create-node API从预制体资源创建时应该自动建立预制体关联
            console.log('预制体节点创建成功:', {
                nodeUuid: uuid,
                prefabUuid: assetInfo.uuid,
                prefabPath: args.prefabPath
            });
            return {
                success: true,
                data: {
                    nodeUuid: uuid,
                    prefabPath: args.prefabPath,
                    parentUuid: args.parentUuid,
                    position: args.position,
                    message: '预制体实例化成功，已建立预制体关联'
                }
            };
        }
        catch (err) {
            return {
                success: false,
                error: `预制体实例化失败: ${err.message}`,
                instruction: '请检查预制体路径是否正确，确保预制体文件格式正确'
            };
        }
    }
    /**
     * 建立节点与预制体的关联关系
     * 这个方法创建必要的PrefabInfo和PrefabInstance结构
     */
    async establishPrefabConnection(nodeUuid, prefabUuid, prefabPath) {
        try {
            // 读取预制体文件获取根节点的fileId
            const prefabContent = await this.readPrefabFile(prefabPath);
            if (!prefabContent || !prefabContent.data || !prefabContent.data.length) {
                throw new Error('无法读取预制体文件内容');
            }
            // 找到预制体根节点的fileId (通常是第二个对象，即索引1)
            const rootNode = prefabContent.data.find((item) => item.__type === 'cc.Node' && item._parent === null);
            if (!rootNode || !rootNode._prefab) {
                throw new Error('无法找到预制体根节点或其预制体信息');
            }
            // 获取根节点的PrefabInfo
            const rootPrefabInfo = prefabContent.data[rootNode._prefab.__id__];
            if (!rootPrefabInfo || rootPrefabInfo.__type !== 'cc.PrefabInfo') {
                throw new Error('无法找到预制体根节点的PrefabInfo');
            }
            const rootFileId = rootPrefabInfo.fileId;
            // 使用scene API建立预制体连接
            const prefabConnectionData = {
                node: nodeUuid,
                prefab: prefabUuid,
                fileId: rootFileId
            };
            // 尝试使用多种API方法建立预制体连接
            const connectionMethods = [
                () => Editor.Message.request('scene', 'connect-prefab-instance', prefabConnectionData),
                () => Editor.Message.request('scene', 'set-prefab-connection', prefabConnectionData),
                () => Editor.Message.request('scene', 'apply-prefab-link', prefabConnectionData)
            ];
            let connected = false;
            for (const method of connectionMethods) {
                try {
                    await method();
                    connected = true;
                    break;
                }
                catch (error) {
                    console.warn('预制体连接方法失败，尝试下一个方法:', error);
                }
            }
            if (!connected) {
                // 如果所有API方法都失败，尝试手动修改场景数据
                console.warn('所有预制体连接API都失败，尝试手动建立连接');
                await this.manuallyEstablishPrefabConnection(nodeUuid, prefabUuid, rootFileId);
            }
        }
        catch (error) {
            console.error('建立预制体连接失败:', error);
            throw error;
        }
    }
    /**
     * 手动建立预制体连接（当API方法失败时的备用方案）
     */
    async manuallyEstablishPrefabConnection(nodeUuid, prefabUuid, rootFileId) {
        try {
            // 尝试使用dump API修改节点的_prefab属性
            const prefabConnectionData = {
                [nodeUuid]: {
                    '_prefab': {
                        '__uuid__': prefabUuid,
                        '__expectedType__': 'cc.Prefab',
                        'fileId': rootFileId
                    }
                }
            };
            await Editor.Message.request('scene', 'set-property', {
                uuid: nodeUuid,
                path: '_prefab',
                dump: {
                    value: {
                        '__uuid__': prefabUuid,
                        '__expectedType__': 'cc.Prefab'
                    }
                }
            });
        }
        catch (error) {
            console.error('手动建立预制体连接也失败:', error);
            // 不抛出错误，因为基本的节点创建已经成功
        }
    }
    /**
     * 读取预制体文件内容
     */
    async readPrefabFile(prefabPath) {
        try {
            // 尝试使用asset-db API读取文件内容
            let assetContent;
            try {
                assetContent = await Editor.Message.request('asset-db', 'query-asset-info', prefabPath);
                if (assetContent && assetContent.source) {
                    // 如果有source路径，直接读取文件
                    const fs = require('fs');
                    const path = require('path');
                    const fullPath = path.resolve(assetContent.source);
                    const fileContent = fs.readFileSync(fullPath, 'utf8');
                    return JSON.parse(fileContent);
                }
            }
            catch (error) {
                console.warn('使用asset-db读取失败，尝试其他方法:', error);
            }
            // 备用方法：转换db://路径为实际文件路径
            const fsPath = prefabPath.replace('db://assets/', 'assets/').replace('db://assets', 'assets');
            const fs = require('fs');
            const path = require('path');
            // 尝试多个可能的项目根路径
            const possiblePaths = [
                path.resolve(process.cwd(), fsPath),
                path.resolve(fsPath),
            ];
            console.log('尝试读取预制体文件，路径转换:', {
                originalPath: prefabPath,
                fsPath: fsPath,
                possiblePaths: possiblePaths
            });
            for (const fullPath of possiblePaths) {
                try {
                    console.log(`检查路径: ${fullPath}`);
                    if (fs.existsSync(fullPath)) {
                        console.log(`找到文件: ${fullPath}`);
                        const fileContent = fs.readFileSync(fullPath, 'utf8');
                        const parsed = JSON.parse(fileContent);
                        console.log('文件解析成功，数据结构:', {
                            hasData: !!parsed.data,
                            dataLength: parsed.data ? parsed.data.length : 0
                        });
                        return parsed;
                    }
                    else {
                        console.log(`文件不存在: ${fullPath}`);
                    }
                }
                catch (readError) {
                    console.warn(`读取文件失败 ${fullPath}:`, readError);
                }
            }
            throw new Error('无法找到或读取预制体文件');
        }
        catch (error) {
            console.error('读取预制体文件失败:', error);
            throw error;
        }
    }
    async tryCreateNodeWithPrefab(args) {
        return new Promise((resolve) => {
            Editor.Message.request('asset-db', 'query-asset-info', args.prefabPath).then((assetInfo) => {
                if (!assetInfo) {
                    throw new Error('预制体未找到');
                }
                // 方法2: 使用 create-node 指定预制体资源
                const createNodeOptions = {
                    assetUuid: assetInfo.uuid
                };
                // 设置父节点
                if (args.parentUuid) {
                    createNodeOptions.parent = args.parentUuid;
                }
                return Editor.Message.request('scene', 'create-node', createNodeOptions);
            }).then((nodeUuid) => {
                const uuid = Array.isArray(nodeUuid) ? nodeUuid[0] : nodeUuid;
                // 如果指定了位置，设置节点位置
                if (args.position && uuid) {
                    Editor.Message.request('scene', 'set-property', {
                        uuid: uuid,
                        path: 'position',
                        dump: { value: args.position }
                    }).then(() => {
                        resolve({
                            success: true,
                            data: {
                                nodeUuid: uuid,
                                prefabPath: args.prefabPath,
                                position: args.position,
                                message: '预制体实例化成功（备用方法）并设置了位置'
                            }
                        });
                    }).catch(() => {
                        resolve({
                            success: true,
                            data: {
                                nodeUuid: uuid,
                                prefabPath: args.prefabPath,
                                message: '预制体实例化成功（备用方法）但位置设置失败'
                            }
                        });
                    });
                }
                else {
                    resolve({
                        success: true,
                        data: {
                            nodeUuid: uuid,
                            prefabPath: args.prefabPath,
                            message: '预制体实例化成功（备用方法）'
                        }
                    });
                }
            }).catch((err) => {
                resolve({
                    success: false,
                    error: `备用预制体实例化方法也失败: ${err.message}`
                });
            });
        });
    }
    async tryAlternativeInstantiateMethods(args) {
        try {
            // 方法1: 尝试使用 create-node 然后设置预制体
            const assetInfo = await this.getAssetInfo(args.prefabPath);
            if (!assetInfo) {
                return { success: false, error: '无法获取预制体信息' };
            }
            // 创建空节点
            const createResult = await this.createNode(args.parentUuid, args.position);
            if (!createResult.success) {
                return createResult;
            }
            // 尝试将预制体应用到节点
            const applyResult = await this.applyPrefabToNode(createResult.data.nodeUuid, assetInfo.uuid);
            if (applyResult.success) {
                return {
                    success: true,
                    data: {
                        nodeUuid: createResult.data.nodeUuid,
                        name: createResult.data.name,
                        message: '预制体实例化成功（使用备选方法）'
                    }
                };
            }
            else {
                return {
                    success: false,
                    error: '无法将预制体应用到节点',
                    data: {
                        nodeUuid: createResult.data.nodeUuid,
                        message: '已创建节点，但无法应用预制体数据'
                    }
                };
            }
        }
        catch (error) {
            return { success: false, error: `备选实例化方法失败: ${error}` };
        }
    }
    async getAssetInfo(prefabPath) {
        return new Promise((resolve) => {
            Editor.Message.request('asset-db', 'query-asset-info', prefabPath).then((assetInfo) => {
                resolve(assetInfo);
            }).catch(() => {
                resolve(null);
            });
        });
    }
    async createNode(parentUuid, position) {
        return new Promise((resolve) => {
            const createNodeOptions = {
                name: 'PrefabInstance'
            };
            // 设置父节点
            if (parentUuid) {
                createNodeOptions.parent = parentUuid;
            }
            // 设置位置
            if (position) {
                createNodeOptions.dump = {
                    position: position
                };
            }
            Editor.Message.request('scene', 'create-node', createNodeOptions).then((nodeUuid) => {
                const uuid = Array.isArray(nodeUuid) ? nodeUuid[0] : nodeUuid;
                resolve({
                    success: true,
                    data: {
                        nodeUuid: uuid,
                        name: 'PrefabInstance'
                    }
                });
            }).catch((error) => {
                resolve({ success: false, error: error.message || '创建节点失败' });
            });
        });
    }
    async applyPrefabToNode(nodeUuid, prefabUuid) {
        return new Promise((resolve) => {
            // 尝试多种方法来应用预制体数据
            const methods = [
                () => Editor.Message.request('scene', 'apply-prefab', { node: nodeUuid, prefab: prefabUuid }),
                () => Editor.Message.request('scene', 'set-prefab', { node: nodeUuid, prefab: prefabUuid }),
                () => Editor.Message.request('scene', 'load-prefab-to-node', { node: nodeUuid, prefab: prefabUuid })
            ];
            const tryMethod = (index) => {
                if (index >= methods.length) {
                    resolve({ success: false, error: '无法应用预制体数据' });
                    return;
                }
                methods[index]().then(() => {
                    resolve({ success: true });
                }).catch(() => {
                    tryMethod(index + 1);
                });
            };
            tryMethod(0);
        });
    }
    /**
     * 使用 asset-db API 创建预制体的新方法
     * 深度整合引擎的资源管理系统，实现完整的预制体创建流程
     */
    async createPrefabWithAssetDB(nodeUuid, savePath, prefabName, includeChildren, includeComponents) {
        var _a;
        try {
            console.log('=== 使用 Asset-DB API 创建预制体 ===');
            console.log(`节点UUID: ${nodeUuid}`);
            console.log(`保存路径: ${savePath}`);
            console.log(`预制体名称: ${prefabName}`);
            // 第一步：获取节点数据（包括变换属性）
            const nodeData = await this.getNodeData(nodeUuid);
            if (!nodeData) {
                return {
                    success: false,
                    error: '无法获取节点数据'
                };
            }
            console.log('获取到节点数据，子节点数量:', nodeData.children ? nodeData.children.length : 0);
            // 第二步：先创建资源文件以获取引擎分配的UUID
            console.log('创建预制体资源文件...');
            const tempPrefabContent = JSON.stringify([{ "__type__": "cc.Prefab", "_name": prefabName }], null, 2);
            const createResult = await this.createAssetWithAssetDB(savePath, tempPrefabContent);
            if (!createResult.success) {
                return createResult;
            }
            // 获取引擎分配的实际UUID
            const actualPrefabUuid = (_a = createResult.data) === null || _a === void 0 ? void 0 : _a.uuid;
            if (!actualPrefabUuid) {
                return {
                    success: false,
                    error: '无法获取引擎分配的预制体UUID'
                };
            }
            console.log('引擎分配的UUID:', actualPrefabUuid);
            // 第三步：使用实际UUID重新生成预制体内容
            const prefabContent = await this.createStandardPrefabContent(nodeData, prefabName, actualPrefabUuid, includeChildren, includeComponents);
            const prefabContentString = JSON.stringify(prefabContent, null, 2);
            // 第四步：更新预制体文件内容
            console.log('更新预制体文件内容...');
            const updateResult = await this.updateAssetWithAssetDB(savePath, prefabContentString);
            // 第五步：创建对应的meta文件（使用实际UUID）
            console.log('创建预制体meta文件...');
            const metaContent = this.createStandardMetaContent(prefabName, actualPrefabUuid);
            const metaResult = await this.createMetaWithAssetDB(savePath, metaContent);
            // 第六步：重新导入资源以更新引用
            console.log('重新导入预制体资源...');
            const reimportResult = await this.reimportAssetWithAssetDB(savePath);
            // 第七步：尝试将原始节点转换为预制体实例
            console.log('尝试将原始节点转换为预制体实例...');
            const convertResult = await this.convertNodeToPrefabInstance(nodeUuid, actualPrefabUuid, savePath);
            return {
                success: true,
                data: {
                    prefabUuid: actualPrefabUuid,
                    prefabPath: savePath,
                    nodeUuid: nodeUuid,
                    prefabName: prefabName,
                    convertedToPrefabInstance: convertResult.success,
                    createAssetResult: createResult,
                    updateResult: updateResult,
                    metaResult: metaResult,
                    reimportResult: reimportResult,
                    convertResult: convertResult,
                    message: convertResult.success ? '预制体创建并成功转换原始节点' : '预制体创建成功，但节点转换失败'
                }
            };
        }
        catch (error) {
            console.error('创建预制体时发生错误:', error);
            return {
                success: false,
                error: `创建预制体失败: ${error}`
            };
        }
    }
    async createPrefab(args) {
        try {
            // 支持 prefabPath 和 savePath 两种参数名
            const pathParam = args.prefabPath || args.savePath;
            if (!pathParam) {
                return {
                    success: false,
                    error: '缺少预制体路径参数。请提供 prefabPath 或 savePath。'
                };
            }
            const prefabName = args.prefabName || 'NewPrefab';
            const fullPath = pathParam.endsWith('.prefab') ?
                pathParam : `${pathParam}/${prefabName}.prefab`;
            const includeChildren = args.includeChildren !== false; // 默认为 true
            const includeComponents = args.includeComponents !== false; // 默认为 true
            // 优先使用新的 asset-db 方法创建预制体
            console.log('使用新的 asset-db 方法创建预制体...');
            const assetDbResult = await this.createPrefabWithAssetDB(args.nodeUuid, fullPath, prefabName, includeChildren, includeComponents);
            if (assetDbResult.success) {
                return assetDbResult;
            }
            // 如果 asset-db 方法失败，尝试使用Cocos Creator的原生预制体创建API
            console.log('asset-db 方法失败，尝试原生API...');
            const nativeResult = await this.createPrefabNative(args.nodeUuid, fullPath);
            if (nativeResult.success) {
                return nativeResult;
            }
            // 如果原生API失败，使用自定义实现
            console.log('原生API失败，使用自定义实现...');
            const customResult = await this.createPrefabCustom(args.nodeUuid, fullPath, prefabName);
            return customResult;
        }
        catch (error) {
            return {
                success: false,
                error: `创建预制体时发生错误: ${error}`
            };
        }
    }
    async createPrefabNative(nodeUuid, prefabPath) {
        // 根据官方API文档，不存在直接的预制体创建API
        // 预制体创建需要手动在编辑器中完成
        return {
            success: false,
            error: '原生预制体创建API不存在',
            instruction: '根据Cocos Creator官方API文档，预制体创建需要手动操作：\n1. 在场景中选择节点\n2. 将节点拖拽到资源管理器中\n3. 或右键节点选择"生成预制体"'
        };
    }
    async createPrefabCustom(nodeUuid, prefabPath, prefabName) {
        var _a, _b;
        try {
            // 1. 获取源节点的完整数据
            const nodeData = await this.getNodeData(nodeUuid);
            if (!nodeData) {
                return {
                    success: false,
                    error: `无法找到节点: ${nodeUuid}`
                };
            }
            // 2. 生成预制体UUID
            const prefabUuid = this.generateUUID();
            // 3. 创建预制体数据结构
            const prefabData = this.createPrefabData(nodeData, prefabName, prefabUuid);
            // 4. 基于官方格式创建预制体数据结构
            console.log('=== 开始创建预制体 ===');
            console.log('节点名称:', ((_a = nodeData.name) === null || _a === void 0 ? void 0 : _a.value) || '未知');
            console.log('节点UUID:', ((_b = nodeData.uuid) === null || _b === void 0 ? void 0 : _b.value) || '未知');
            console.log('预制体保存路径:', prefabPath);
            console.log(`开始创建预制体，节点数据:`, nodeData);
            const prefabJsonData = await this.createStandardPrefabContent(nodeData, prefabName, prefabUuid, true, true);
            // 5. 创建标准meta文件数据
            const standardMetaData = this.createStandardMetaData(prefabName, prefabUuid);
            // 6. 保存预制体和meta文件
            const saveResult = await this.savePrefabWithMeta(prefabPath, prefabJsonData, standardMetaData);
            if (saveResult.success) {
                // 保存成功后，将原始节点转换为预制体实例
                const convertResult = await this.convertNodeToPrefabInstance(nodeUuid, prefabPath, prefabUuid);
                return {
                    success: true,
                    data: {
                        prefabUuid: prefabUuid,
                        prefabPath: prefabPath,
                        nodeUuid: nodeUuid,
                        prefabName: prefabName,
                        convertedToPrefabInstance: convertResult.success,
                        message: convertResult.success ?
                            '自定义预制体创建成功，原始节点已转换为预制体实例' :
                            '预制体创建成功，但节点转换失败'
                    }
                };
            }
            else {
                return {
                    success: false,
                    error: saveResult.error || '保存预制体文件失败'
                };
            }
        }
        catch (error) {
            return {
                success: false,
                error: `创建预制体时发生错误: ${error}`
            };
        }
    }
    async getNodeData(nodeUuid) {
        try {
            // 首先获取基本节点信息
            const nodeInfo = await Editor.Message.request('scene', 'query-node', nodeUuid);
            if (!nodeInfo) {
                return null;
            }
            console.log(`获取节点 ${nodeUuid} 的基本信息成功`);
            // 使用query-node-tree获取包含子节点的完整结构
            const nodeTree = await this.getNodeWithChildren(nodeUuid);
            if (nodeTree) {
                console.log(`获取节点 ${nodeUuid} 的完整树结构成功`);
                return nodeTree;
            }
            else {
                console.log(`使用基本节点信息`);
                return nodeInfo;
            }
        }
        catch (error) {
            console.warn(`获取节点数据失败 ${nodeUuid}:`, error);
            return null;
        }
    }
    // 使用query-node-tree获取包含子节点的完整节点结构
    async getNodeWithChildren(nodeUuid) {
        try {
            // 获取整个场景树
            const tree = await Editor.Message.request('scene', 'query-node-tree');
            if (!tree) {
                return null;
            }
            // 在树中查找指定的节点
            const targetNode = this.findNodeInTree(tree, nodeUuid);
            if (targetNode) {
                console.log(`在场景树中找到节点 ${nodeUuid}，子节点数量: ${targetNode.children ? targetNode.children.length : 0}`);
                // 增强节点树，获取每个节点的正确组件信息
                const enhancedTree = await this.enhanceTreeWithMCPComponents(targetNode);
                return enhancedTree;
            }
            return null;
        }
        catch (error) {
            console.warn(`获取节点树结构失败 ${nodeUuid}:`, error);
            return null;
        }
    }
    // 在节点树中递归查找指定UUID的节点
    findNodeInTree(node, targetUuid) {
        var _a;
        if (!node)
            return null;
        // 检查当前节点
        if (node.uuid === targetUuid || ((_a = node.value) === null || _a === void 0 ? void 0 : _a.uuid) === targetUuid) {
            return node;
        }
        // 递归检查子节点
        if (node.children && Array.isArray(node.children)) {
            for (const child of node.children) {
                const found = this.findNodeInTree(child, targetUuid);
                if (found) {
                    return found;
                }
            }
        }
        return null;
    }
    /**
     * 使用MCP接口增强节点树，获取正确的组件信息
     */
    async enhanceTreeWithMCPComponents(node) {
        var _a, _b, _c, _d;
        if (!node || !node.uuid) {
            return node;
        }
        try {
            // 使用MCP接口获取节点的组件信息
            let port = 8585;
            try {
                const { readSettings } = require('../../core/settings');
                port = (_a = readSettings().port) !== null && _a !== void 0 ? _a : 8585;
            }
            catch (_) {
                // fallback to default
            }
            const response = await fetch(`http://localhost:${port}/mcp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    "jsonrpc": "2.0",
                    "method": "tools/call",
                    "params": {
                        "name": "component_get_components",
                        "arguments": {
                            "nodeUuid": node.uuid
                        }
                    },
                    "id": Date.now()
                })
            });
            const mcpResult = await response.json();
            if ((_d = (_c = (_b = mcpResult.result) === null || _b === void 0 ? void 0 : _b.content) === null || _c === void 0 ? void 0 : _c[0]) === null || _d === void 0 ? void 0 : _d.text) {
                const componentData = JSON.parse(mcpResult.result.content[0].text);
                if (componentData.success && componentData.data.components) {
                    // 更新节点的组件信息为MCP返回的正确数据
                    node.components = componentData.data.components;
                    console.log(`节点 ${node.uuid} 获取到 ${componentData.data.components.length} 个组件，包含脚本组件的正确类型`);
                }
            }
        }
        catch (error) {
            console.warn(`获取节点 ${node.uuid} 的MCP组件信息失败:`, error);
        }
        // 递归处理子节点
        if (node.children && Array.isArray(node.children)) {
            for (let i = 0; i < node.children.length; i++) {
                node.children[i] = await this.enhanceTreeWithMCPComponents(node.children[i]);
            }
        }
        return node;
    }
    async buildBasicNodeInfo(nodeUuid) {
        return new Promise((resolve) => {
            // 构建基本的节点信息
            Editor.Message.request('scene', 'query-node', nodeUuid).then((nodeInfo) => {
                if (!nodeInfo) {
                    resolve(null);
                    return;
                }
                // 简化版本：只返回基本节点信息，不获取子节点和组件
                // 这些信息将在后续的预制体处理中根据需要添加
                const basicInfo = Object.assign(Object.assign({}, nodeInfo), { children: [], components: [] });
                resolve(basicInfo);
            }).catch(() => {
                resolve(null);
            });
        });
    }
    // 验证节点数据是否有效
    isValidNodeData(nodeData) {
        if (!nodeData)
            return false;
        if (typeof nodeData !== 'object')
            return false;
        // 检查基本属性 - 适配query-node-tree的数据格式
        return nodeData.hasOwnProperty('uuid') ||
            nodeData.hasOwnProperty('name') ||
            nodeData.hasOwnProperty('__type__') ||
            (nodeData.value && (nodeData.value.hasOwnProperty('uuid') ||
                nodeData.value.hasOwnProperty('name') ||
                nodeData.value.hasOwnProperty('__type__')));
    }
    // 提取子节点UUID的统一方法
    extractChildUuid(childRef) {
        if (!childRef)
            return null;
        // 方法1: 直接字符串
        if (typeof childRef === 'string') {
            return childRef;
        }
        // 方法2: value属性包含字符串
        if (childRef.value && typeof childRef.value === 'string') {
            return childRef.value;
        }
        // 方法3: value.uuid属性
        if (childRef.value && childRef.value.uuid) {
            return childRef.value.uuid;
        }
        // 方法4: 直接uuid属性
        if (childRef.uuid) {
            return childRef.uuid;
        }
        // 方法5: __id__引用 - 这种情况需要特殊处理
        if (childRef.__id__ !== undefined) {
            console.log(`发现__id__引用: ${childRef.__id__}，可能需要从数据结构中查找`);
            return null; // 暂时返回null，后续可以添加引用解析逻辑
        }
        console.warn('无法提取子节点UUID:', JSON.stringify(childRef));
        return null;
    }
    // 获取需要处理的子节点数据
    getChildrenToProcess(nodeData) {
        var _a;
        const children = [];
        // 方法1: 直接从children数组获取（从query-node-tree返回的数据）
        if (nodeData.children && Array.isArray(nodeData.children)) {
            console.log(`从children数组获取子节点，数量: ${nodeData.children.length}`);
            for (const child of nodeData.children) {
                // query-node-tree返回的子节点通常已经是完整的数据结构
                if (this.isValidNodeData(child)) {
                    children.push(child);
                    console.log(`添加子节点: ${child.name || ((_a = child.value) === null || _a === void 0 ? void 0 : _a.name) || '未知'}`);
                }
                else {
                    console.log('子节点数据无效:', JSON.stringify(child, null, 2));
                }
            }
        }
        else {
            console.log('节点没有子节点或children数组为空');
        }
        return children;
    }
    generateUUID() {
        // 生成符合Cocos Creator格式的UUID
        const chars = '0123456789abcdef';
        let uuid = '';
        for (let i = 0; i < 32; i++) {
            if (i === 8 || i === 12 || i === 16 || i === 20) {
                uuid += '-';
            }
            uuid += chars[Math.floor(Math.random() * chars.length)];
        }
        return uuid;
    }
    createPrefabData(nodeData, prefabName, prefabUuid) {
        // 创建标准的预制体数据结构
        const prefabAsset = {
            "__type__": "cc.Prefab",
            "_name": prefabName,
            "_objFlags": 0,
            "__editorExtras__": {},
            "_native": "",
            "data": {
                "__id__": 1
            },
            "optimizationPolicy": 0,
            "persistent": false
        };
        // 处理节点数据，确保符合预制体格式
        const processedNodeData = this.processNodeForPrefab(nodeData, prefabUuid);
        return [prefabAsset, ...processedNodeData];
    }
    processNodeForPrefab(nodeData, prefabUuid) {
        // 处理节点数据以符合预制体格式
        const processedData = [];
        let idCounter = 1;
        // 递归处理节点和组件
        const processNode = (node, parentId = 0) => {
            const nodeId = idCounter++;
            // 创建节点对象
            const processedNode = {
                "__type__": "cc.Node",
                "_name": node.name || "Node",
                "_objFlags": 0,
                "__editorExtras__": {},
                "_parent": parentId > 0 ? { "__id__": parentId } : null,
                "_children": node.children ? node.children.map(() => ({ "__id__": idCounter++ })) : [],
                "_active": node.active !== false,
                "_components": node.components ? node.components.map(() => ({ "__id__": idCounter++ })) : [],
                "_prefab": {
                    "__id__": idCounter++
                },
                "_lpos": {
                    "__type__": "cc.Vec3",
                    "x": 0,
                    "y": 0,
                    "z": 0
                },
                "_lrot": {
                    "__type__": "cc.Quat",
                    "x": 0,
                    "y": 0,
                    "z": 0,
                    "w": 1
                },
                "_lscale": {
                    "__type__": "cc.Vec3",
                    "x": 1,
                    "y": 1,
                    "z": 1
                },
                "_mobility": 0,
                "_layer": 1073741824,
                "_euler": {
                    "__type__": "cc.Vec3",
                    "x": 0,
                    "y": 0,
                    "z": 0
                },
                "_id": ""
            };
            processedData.push(processedNode);
            // 处理组件
            if (node.components) {
                node.components.forEach((component) => {
                    const componentId = idCounter++;
                    const processedComponents = this.processComponentForPrefab(component, componentId);
                    processedData.push(...processedComponents);
                });
            }
            // 处理子节点
            if (node.children) {
                node.children.forEach((child) => {
                    processNode(child, nodeId);
                });
            }
            return nodeId;
        };
        processNode(nodeData);
        return processedData;
    }
    processComponentForPrefab(component, componentId) {
        // 处理组件数据以符合预制体格式
        const processedComponent = Object.assign({ "__type__": component.type || "cc.Component", "_name": "", "_objFlags": 0, "__editorExtras__": {}, "node": {
                "__id__": componentId - 1
            }, "_enabled": component.enabled !== false, "__prefab": {
                "__id__": componentId + 1
            } }, component.properties);
        // 添加组件特定的预制体信息
        const compPrefabInfo = {
            "__type__": "cc.CompPrefabInfo",
            "fileId": this.generateFileId()
        };
        return [processedComponent, compPrefabInfo];
    }
    generateFileId() {
        // 生成文件ID（简化版本）
        const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789+/';
        let fileId = '';
        for (let i = 0; i < 22; i++) {
            fileId += chars[Math.floor(Math.random() * chars.length)];
        }
        return fileId;
    }
    createMetaData(prefabName, prefabUuid) {
        return {
            "ver": "1.1.50",
            "importer": "prefab",
            "imported": true,
            "uuid": prefabUuid,
            "files": [
                ".json"
            ],
            "subMetas": {},
            "userData": {
                "syncNodeName": prefabName
            }
        };
    }
    async savePrefabFiles(prefabPath, prefabData, metaData) {
        return new Promise((resolve) => {
            try {
                // 使用Editor API保存预制体文件
                const prefabContent = JSON.stringify(prefabData, null, 2);
                const metaContent = JSON.stringify(metaData, null, 2);
                // 尝试使用更可靠的保存方法
                this.saveAssetFile(prefabPath, prefabContent).then(() => {
                    // 再创建meta文件
                    const metaPath = `${prefabPath}.meta`;
                    return this.saveAssetFile(metaPath, metaContent);
                }).then(() => {
                    resolve({ success: true });
                }).catch((error) => {
                    resolve({ success: false, error: error.message || '保存预制体文件失败' });
                });
            }
            catch (error) {
                resolve({ success: false, error: `保存文件时发生错误: ${error}` });
            }
        });
    }
    async saveAssetFile(filePath, content) {
        return new Promise((resolve, reject) => {
            // 尝试多种保存方法
            const saveMethods = [
                () => Editor.Message.request('asset-db', 'create-asset', filePath, content),
                () => Editor.Message.request('asset-db', 'save-asset', filePath, content),
                () => Editor.Message.request('asset-db', 'write-asset', filePath, content)
            ];
            const trySave = (index) => {
                if (index >= saveMethods.length) {
                    reject(new Error('所有保存方法都失败了'));
                    return;
                }
                saveMethods[index]().then(() => {
                    resolve();
                }).catch(() => {
                    trySave(index + 1);
                });
            };
            trySave(0);
        });
    }
    async updatePrefab(prefabPath, nodeUuid) {
        return new Promise((resolve) => {
            Editor.Message.request('asset-db', 'query-asset-info', prefabPath).then((assetInfo) => {
                if (!assetInfo) {
                    throw new Error('Prefab not found');
                }
                return Editor.Message.request('scene', 'apply-prefab', {
                    node: nodeUuid,
                    prefab: assetInfo.uuid
                });
            }).then(() => {
                resolve({
                    success: true,
                    message: 'Prefab updated successfully'
                });
            }).catch((err) => {
                resolve({ success: false, error: err.message });
            });
        });
    }
    async revertPrefab(nodeUuid) {
        return new Promise((resolve) => {
            Editor.Message.request('scene', 'revert-prefab', {
                node: nodeUuid
            }).then(() => {
                resolve({
                    success: true,
                    message: 'Prefab instance reverted successfully'
                });
            }).catch((err) => {
                resolve({ success: false, error: err.message });
            });
        });
    }
    async getPrefabInfo(prefabPath) {
        return new Promise((resolve) => {
            Editor.Message.request('asset-db', 'query-asset-info', prefabPath).then((assetInfo) => {
                if (!assetInfo) {
                    throw new Error('Prefab not found');
                }
                return Editor.Message.request('asset-db', 'query-asset-meta', assetInfo.uuid);
            }).then((metaInfo) => {
                const info = {
                    name: metaInfo.name,
                    uuid: metaInfo.uuid,
                    path: prefabPath,
                    folder: prefabPath.substring(0, prefabPath.lastIndexOf('/')),
                    createTime: metaInfo.createTime,
                    modifyTime: metaInfo.modifyTime,
                    dependencies: metaInfo.depends || []
                };
                resolve({ success: true, data: info });
            }).catch((err) => {
                resolve({ success: false, error: err.message });
            });
        });
    }
    async createPrefabFromNode(args) {
        var _a;
        // 从 prefabPath 提取名称
        const prefabPath = args.prefabPath;
        const prefabName = ((_a = prefabPath.split('/').pop()) === null || _a === void 0 ? void 0 : _a.replace('.prefab', '')) || 'NewPrefab';
        // 调用原来的 createPrefab 方法
        return await this.createPrefab({
            nodeUuid: args.nodeUuid,
            savePath: prefabPath,
            prefabName: prefabName
        });
    }
    async validatePrefab(prefabPath) {
        return new Promise((resolve) => {
            try {
                // 读取预制体文件内容
                Editor.Message.request('asset-db', 'query-asset-info', prefabPath).then((assetInfo) => {
                    if (!assetInfo) {
                        resolve({
                            success: false,
                            error: '预制体文件不存在'
                        });
                        return;
                    }
                    // 验证预制体格式
                    Editor.Message.request('asset-db', 'read-asset', prefabPath).then((content) => {
                        try {
                            const prefabData = JSON.parse(content);
                            const validationResult = this.validatePrefabFormat(prefabData);
                            resolve({
                                success: true,
                                data: {
                                    isValid: validationResult.isValid,
                                    issues: validationResult.issues,
                                    nodeCount: validationResult.nodeCount,
                                    componentCount: validationResult.componentCount,
                                    message: validationResult.isValid ? '预制体格式有效' : '预制体格式存在问题'
                                }
                            });
                        }
                        catch (parseError) {
                            resolve({
                                success: false,
                                error: '预制体文件格式错误，无法解析JSON'
                            });
                        }
                    }).catch((error) => {
                        resolve({
                            success: false,
                            error: `读取预制体文件失败: ${error.message}`
                        });
                    });
                }).catch((error) => {
                    resolve({
                        success: false,
                        error: `查询预制体信息失败: ${error.message}`
                    });
                });
            }
            catch (error) {
                resolve({
                    success: false,
                    error: `验证预制体时发生错误: ${error}`
                });
            }
        });
    }
    validatePrefabFormat(prefabData) {
        const issues = [];
        let nodeCount = 0;
        let componentCount = 0;
        // 检查基本结构
        if (!Array.isArray(prefabData)) {
            issues.push('预制体数据必须是数组格式');
            return { isValid: false, issues, nodeCount, componentCount };
        }
        if (prefabData.length === 0) {
            issues.push('预制体数据为空');
            return { isValid: false, issues, nodeCount, componentCount };
        }
        // 检查第一个元素是否为预制体资产
        const firstElement = prefabData[0];
        if (!firstElement || firstElement.__type__ !== 'cc.Prefab') {
            issues.push('第一个元素必须是cc.Prefab类型');
        }
        // 统计节点和组件
        prefabData.forEach((item, index) => {
            if (item.__type__ === 'cc.Node') {
                nodeCount++;
            }
            else if (item.__type__ && item.__type__.includes('cc.')) {
                componentCount++;
            }
        });
        // 检查必要的字段
        if (nodeCount === 0) {
            issues.push('预制体必须包含至少一个节点');
        }
        return {
            isValid: issues.length === 0,
            issues,
            nodeCount,
            componentCount
        };
    }
    async duplicatePrefab(args) {
        try {
            const { sourcePrefabPath, targetPrefabPath, newPrefabName } = args;
            // 读取源预制体
            const sourceInfo = await this.getPrefabInfo(sourcePrefabPath);
            if (!sourceInfo.success) {
                return {
                    success: false,
                    error: `无法读取源预制体: ${sourceInfo.error}`
                };
            }
            // 读取源预制体内容
            const sourceContent = await this.readPrefabContent(sourcePrefabPath);
            if (!sourceContent.success) {
                return {
                    success: false,
                    error: `无法读取源预制体内容: ${sourceContent.error}`
                };
            }
            // 生成新的UUID
            const newUuid = this.generateUUID();
            // 修改预制体数据
            const modifiedData = this.modifyPrefabForDuplication(sourceContent.data, newPrefabName, newUuid);
            // 创建新的meta数据
            const newMetaData = this.createMetaData(newPrefabName || 'DuplicatedPrefab', newUuid);
            // 预制体复制功能暂时禁用，因为涉及复杂的序列化格式
            return {
                success: false,
                error: '预制体复制功能暂时不可用',
                instruction: '请在 Cocos Creator 编辑器中手动复制预制体：\n1. 在资源管理器中选择要复制的预制体\n2. 右键选择复制\n3. 在目标位置粘贴'
            };
        }
        catch (error) {
            return {
                success: false,
                error: `复制预制体时发生错误: ${error}`
            };
        }
    }
    async readPrefabContent(prefabPath) {
        return new Promise((resolve) => {
            Editor.Message.request('asset-db', 'read-asset', prefabPath).then((content) => {
                try {
                    const prefabData = JSON.parse(content);
                    resolve({ success: true, data: prefabData });
                }
                catch (parseError) {
                    resolve({ success: false, error: '预制体文件格式错误' });
                }
            }).catch((error) => {
                resolve({ success: false, error: error.message || '读取预制体文件失败' });
            });
        });
    }
    modifyPrefabForDuplication(prefabData, newName, newUuid) {
        // 修改预制体数据以创建副本
        const modifiedData = [...prefabData];
        // 修改第一个元素（预制体资产）
        if (modifiedData[0] && modifiedData[0].__type__ === 'cc.Prefab') {
            modifiedData[0]._name = newName || 'DuplicatedPrefab';
        }
        // 更新所有UUID引用（简化版本）
        // 在实际应用中，可能需要更复杂的UUID映射处理
        return modifiedData;
    }
    /**
     * 使用 asset-db API 创建资源文件
     */
    async createAssetWithAssetDB(assetPath, content) {
        return new Promise((resolve) => {
            Editor.Message.request('asset-db', 'create-asset', assetPath, content, {
                overwrite: true,
                rename: false
            }).then((assetInfo) => {
                console.log('创建资源文件成功:', assetInfo);
                resolve({ success: true, data: assetInfo });
            }).catch((error) => {
                console.error('创建资源文件失败:', error);
                resolve({ success: false, error: error.message || '创建资源文件失败' });
            });
        });
    }
    /**
     * 使用 asset-db API 创建 meta 文件
     */
    async createMetaWithAssetDB(assetPath, metaContent) {
        return new Promise((resolve) => {
            const metaContentString = JSON.stringify(metaContent, null, 2);
            Editor.Message.request('asset-db', 'save-asset-meta', assetPath, metaContentString).then((assetInfo) => {
                console.log('创建meta文件成功:', assetInfo);
                resolve({ success: true, data: assetInfo });
            }).catch((error) => {
                console.error('创建meta文件失败:', error);
                resolve({ success: false, error: error.message || '创建meta文件失败' });
            });
        });
    }
    /**
     * 使用 asset-db API 重新导入资源
     */
    async reimportAssetWithAssetDB(assetPath) {
        return new Promise((resolve) => {
            Editor.Message.request('asset-db', 'reimport-asset', assetPath).then((result) => {
                console.log('重新导入资源成功:', result);
                resolve({ success: true, data: result });
            }).catch((error) => {
                console.error('重新导入资源失败:', error);
                resolve({ success: false, error: error.message || '重新导入资源失败' });
            });
        });
    }
    /**
     * 使用 asset-db API 更新资源文件内容
     */
    async updateAssetWithAssetDB(assetPath, content) {
        return new Promise((resolve) => {
            Editor.Message.request('asset-db', 'save-asset', assetPath, content).then((result) => {
                console.log('更新资源文件成功:', result);
                resolve({ success: true, data: result });
            }).catch((error) => {
                console.error('更新资源文件失败:', error);
                resolve({ success: false, error: error.message || '更新资源文件失败' });
            });
        });
    }
    /**
     * 创建符合 Cocos Creator 标准的预制体内容
     * 完整实现递归节点树处理，匹配引擎标准格式
     */
    async createStandardPrefabContent(nodeData, prefabName, prefabUuid, includeChildren, includeComponents) {
        console.log('开始创建引擎标准预制体内容...');
        const prefabData = [];
        let currentId = 0;
        // 1. 创建预制体资产对象 (index 0)
        const prefabAsset = {
            "__type__": "cc.Prefab",
            "_name": prefabName || "", // 确保预制体名称不为空
            "_objFlags": 0,
            "__editorExtras__": {},
            "_native": "",
            "data": {
                "__id__": 1
            },
            "optimizationPolicy": 0,
            "persistent": false
        };
        prefabData.push(prefabAsset);
        currentId++;
        // 2. 递归创建完整的节点树结构
        const context = {
            prefabData,
            currentId: currentId + 1, // 根节点占用索引1，子节点从索引2开始
            prefabAssetIndex: 0,
            nodeFileIds: new Map(), // 存储节点ID到fileId的映射
            nodeUuidToIndex: new Map(), // 存储节点UUID到索引的映射
            componentUuidToIndex: new Map() // 存储组件UUID到索引的映射
        };
        // 创建根节点和整个节点树 - 注意：根节点的父节点应该是null，不是预制体对象
        await this.createCompleteNodeTree(nodeData, null, 1, context, includeChildren, includeComponents, prefabName);
        console.log(`预制体内容创建完成，总共 ${prefabData.length} 个对象`);
        console.log('节点fileId映射:', Array.from(context.nodeFileIds.entries()));
        return prefabData;
    }
    /**
     * 递归创建完整的节点树，包括所有子节点和对应的PrefabInfo
     */
    async createCompleteNodeTree(nodeData, parentNodeIndex, nodeIndex, context, includeChildren, includeComponents, nodeName) {
        const { prefabData } = context;
        // 创建节点对象
        const node = this.createEngineStandardNode(nodeData, parentNodeIndex, nodeName);
        // 确保节点在指定的索引位置
        while (prefabData.length <= nodeIndex) {
            prefabData.push(null);
        }
        console.log(`设置节点到索引 ${nodeIndex}: ${node._name}, _parent:`, node._parent, `_children count: ${node._children.length}`);
        prefabData[nodeIndex] = node;
        // 为当前节点生成fileId并记录UUID到索引的映射
        const nodeUuid = this.extractNodeUuid(nodeData);
        const fileId = nodeUuid || this.generateFileId();
        context.nodeFileIds.set(nodeIndex.toString(), fileId);
        // 记录节点UUID到索引的映射
        if (nodeUuid) {
            context.nodeUuidToIndex.set(nodeUuid, nodeIndex);
            console.log(`记录节点UUID映射: ${nodeUuid} -> ${nodeIndex}`);
        }
        // 先处理子节点（保持与手动创建的索引顺序一致）
        const childrenToProcess = this.getChildrenToProcess(nodeData);
        if (includeChildren && childrenToProcess.length > 0) {
            console.log(`处理节点 ${node._name} 的 ${childrenToProcess.length} 个子节点`);
            // 为每个子节点分配索引
            const childIndices = [];
            console.log(`准备为 ${childrenToProcess.length} 个子节点分配索引，当前ID: ${context.currentId}`);
            for (let i = 0; i < childrenToProcess.length; i++) {
                console.log(`处理第 ${i + 1} 个子节点，当前currentId: ${context.currentId}`);
                const childIndex = context.currentId++;
                childIndices.push(childIndex);
                node._children.push({ "__id__": childIndex });
                console.log(`✅ 添加子节点引用到 ${node._name}: {__id__: ${childIndex}}`);
            }
            console.log(`✅ 节点 ${node._name} 最终的子节点数组:`, node._children);
            // 递归创建子节点
            for (let i = 0; i < childrenToProcess.length; i++) {
                const childData = childrenToProcess[i];
                const childIndex = childIndices[i];
                await this.createCompleteNodeTree(childData, nodeIndex, childIndex, context, includeChildren, includeComponents, childData.name || `Child${i + 1}`);
            }
        }
        // 然后处理组件
        if (includeComponents && nodeData.components && Array.isArray(nodeData.components)) {
            console.log(`处理节点 ${node._name} 的 ${nodeData.components.length} 个组件`);
            const componentIndices = [];
            for (const component of nodeData.components) {
                const componentIndex = context.currentId++;
                componentIndices.push(componentIndex);
                node._components.push({ "__id__": componentIndex });
                // 记录组件UUID到索引的映射
                const componentUuid = component.uuid || (component.value && component.value.uuid);
                if (componentUuid) {
                    context.componentUuidToIndex.set(componentUuid, componentIndex);
                    console.log(`记录组件UUID映射: ${componentUuid} -> ${componentIndex}`);
                }
                // 创建组件对象，传入context以处理引用
                const componentObj = this.createComponentObject(component, nodeIndex, context);
                prefabData[componentIndex] = componentObj;
                // 为组件创建 CompPrefabInfo
                const compPrefabInfoIndex = context.currentId++;
                prefabData[compPrefabInfoIndex] = {
                    "__type__": "cc.CompPrefabInfo",
                    "fileId": this.generateFileId()
                };
                // 如果组件对象有 __prefab 属性，设置引用
                if (componentObj && typeof componentObj === 'object') {
                    componentObj.__prefab = { "__id__": compPrefabInfoIndex };
                }
            }
            console.log(`✅ 节点 ${node._name} 添加了 ${componentIndices.length} 个组件`);
        }
        // 为当前节点创建PrefabInfo
        const prefabInfoIndex = context.currentId++;
        node._prefab = { "__id__": prefabInfoIndex };
        const prefabInfo = {
            "__type__": "cc.PrefabInfo",
            "root": { "__id__": 1 },
            "asset": { "__id__": context.prefabAssetIndex },
            "fileId": fileId,
            "targetOverrides": null,
            "nestedPrefabInstanceRoots": null
        };
        // 根节点的特殊处理
        if (nodeIndex === 1) {
            // 根节点没有instance，但可能有targetOverrides
            prefabInfo.instance = null;
        }
        else {
            // 子节点通常有instance为null
            prefabInfo.instance = null;
        }
        prefabData[prefabInfoIndex] = prefabInfo;
        context.currentId = prefabInfoIndex + 1;
    }
    /**
     * 将UUID转换为Cocos Creator的压缩格式
     * 基于真实Cocos Creator编辑器的压缩算法实现
     * 前5个hex字符保持不变，剩余27个字符压缩成18个字符
     */
    uuidToCompressedId(uuid) {
        const BASE64_KEYS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
        // 移除连字符并转为小写
        const cleanUuid = uuid.replace(/-/g, '').toLowerCase();
        // 确保UUID有效
        if (cleanUuid.length !== 32) {
            return uuid; // 如果不是有效的UUID，返回原始值
        }
        // Cocos Creator的压缩算法：前5个字符保持不变，剩余27个字符压缩成18个字符
        let result = cleanUuid.substring(0, 5);
        // 剩余27个字符需要压缩成18个字符
        const remainder = cleanUuid.substring(5);
        // 每3个hex字符压缩成2个字符
        for (let i = 0; i < remainder.length; i += 3) {
            const hex1 = remainder[i] || '0';
            const hex2 = remainder[i + 1] || '0';
            const hex3 = remainder[i + 2] || '0';
            // 将3个hex字符(12位)转换为2个base64字符
            const value = parseInt(hex1 + hex2 + hex3, 16);
            // 12位分成两个6位
            const high6 = (value >> 6) & 63;
            const low6 = value & 63;
            result += BASE64_KEYS[high6] + BASE64_KEYS[low6];
        }
        return result;
    }
    /**
     * 创建组件对象
     */
    createComponentObject(componentData, nodeIndex, context) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z, _0, _1, _2, _3, _4, _5, _6;
        let componentType = componentData.type || componentData.__type__ || 'cc.Component';
        const enabled = componentData.enabled !== undefined ? componentData.enabled : true;
        // console.log(`创建组件对象 - 原始类型: ${componentType}`);
        // console.log('组件完整数据:', JSON.stringify(componentData, null, 2));
        // 处理脚本组件 - MCP接口已经返回正确的压缩UUID格式
        if (componentType && !componentType.startsWith('cc.')) {
            console.log(`使用脚本组件压缩UUID类型: ${componentType}`);
        }
        // 基础组件结构
        const component = {
            "__type__": componentType,
            "_name": "",
            "_objFlags": 0,
            "__editorExtras__": {},
            "node": { "__id__": nodeIndex },
            "_enabled": enabled
        };
        // 提前设置 __prefab 属性占位符，后续会被正确设置
        component.__prefab = null;
        // 根据组件类型添加特定属性
        if (componentType === 'cc.UITransform') {
            const contentSize = ((_b = (_a = componentData.properties) === null || _a === void 0 ? void 0 : _a.contentSize) === null || _b === void 0 ? void 0 : _b.value) || { width: 100, height: 100 };
            const anchorPoint = ((_d = (_c = componentData.properties) === null || _c === void 0 ? void 0 : _c.anchorPoint) === null || _d === void 0 ? void 0 : _d.value) || { x: 0.5, y: 0.5 };
            component._contentSize = {
                "__type__": "cc.Size",
                "width": contentSize.width,
                "height": contentSize.height
            };
            component._anchorPoint = {
                "__type__": "cc.Vec2",
                "x": anchorPoint.x,
                "y": anchorPoint.y
            };
        }
        else if (componentType === 'cc.Sprite') {
            // 处理Sprite组件的spriteFrame引用
            const spriteFrameProp = ((_e = componentData.properties) === null || _e === void 0 ? void 0 : _e._spriteFrame) || ((_f = componentData.properties) === null || _f === void 0 ? void 0 : _f.spriteFrame);
            if (spriteFrameProp) {
                component._spriteFrame = this.processComponentProperty(spriteFrameProp, context);
            }
            else {
                component._spriteFrame = null;
            }
            component._type = (_j = (_h = (_g = componentData.properties) === null || _g === void 0 ? void 0 : _g._type) === null || _h === void 0 ? void 0 : _h.value) !== null && _j !== void 0 ? _j : 0;
            component._fillType = (_m = (_l = (_k = componentData.properties) === null || _k === void 0 ? void 0 : _k._fillType) === null || _l === void 0 ? void 0 : _l.value) !== null && _m !== void 0 ? _m : 0;
            component._sizeMode = (_q = (_p = (_o = componentData.properties) === null || _o === void 0 ? void 0 : _o._sizeMode) === null || _p === void 0 ? void 0 : _p.value) !== null && _q !== void 0 ? _q : 1;
            component._fillCenter = { "__type__": "cc.Vec2", "x": 0, "y": 0 };
            component._fillStart = (_t = (_s = (_r = componentData.properties) === null || _r === void 0 ? void 0 : _r._fillStart) === null || _s === void 0 ? void 0 : _s.value) !== null && _t !== void 0 ? _t : 0;
            component._fillRange = (_w = (_v = (_u = componentData.properties) === null || _u === void 0 ? void 0 : _u._fillRange) === null || _v === void 0 ? void 0 : _v.value) !== null && _w !== void 0 ? _w : 0;
            component._isTrimmedMode = (_z = (_y = (_x = componentData.properties) === null || _x === void 0 ? void 0 : _x._isTrimmedMode) === null || _y === void 0 ? void 0 : _y.value) !== null && _z !== void 0 ? _z : true;
            component._useGrayscale = (_2 = (_1 = (_0 = componentData.properties) === null || _0 === void 0 ? void 0 : _0._useGrayscale) === null || _1 === void 0 ? void 0 : _1.value) !== null && _2 !== void 0 ? _2 : false;
            // 调试：打印Sprite组件的所有属性（已注释）
            // console.log('Sprite组件属性:', JSON.stringify(componentData.properties, null, 2));
            component._atlas = null;
            component._id = "";
        }
        else if (componentType === 'cc.Button') {
            component._interactable = true;
            component._transition = 3;
            component._normalColor = { "__type__": "cc.Color", "r": 255, "g": 255, "b": 255, "a": 255 };
            component._hoverColor = { "__type__": "cc.Color", "r": 211, "g": 211, "b": 211, "a": 255 };
            component._pressedColor = { "__type__": "cc.Color", "r": 255, "g": 255, "b": 255, "a": 255 };
            component._disabledColor = { "__type__": "cc.Color", "r": 124, "g": 124, "b": 124, "a": 255 };
            component._normalSprite = null;
            component._hoverSprite = null;
            component._pressedSprite = null;
            component._disabledSprite = null;
            component._duration = 0.1;
            component._zoomScale = 1.2;
            // 处理Button的target引用
            const targetProp = ((_3 = componentData.properties) === null || _3 === void 0 ? void 0 : _3._target) || ((_4 = componentData.properties) === null || _4 === void 0 ? void 0 : _4.target);
            if (targetProp) {
                component._target = this.processComponentProperty(targetProp, context);
            }
            else {
                component._target = { "__id__": nodeIndex }; // 默认指向自身节点
            }
            component._clickEvents = [];
            component._id = "";
        }
        else if (componentType === 'cc.Label') {
            component._string = ((_6 = (_5 = componentData.properties) === null || _5 === void 0 ? void 0 : _5._string) === null || _6 === void 0 ? void 0 : _6.value) || "Label";
            component._horizontalAlign = 1;
            component._verticalAlign = 1;
            component._actualFontSize = 20;
            component._fontSize = 20;
            component._fontFamily = "Arial";
            component._lineHeight = 25;
            component._overflow = 0;
            component._enableWrapText = true;
            component._font = null;
            component._isSystemFontUsed = true;
            component._spacingX = 0;
            component._isItalic = false;
            component._isBold = false;
            component._isUnderline = false;
            component._underlineHeight = 2;
            component._cacheMode = 0;
            component._id = "";
        }
        else if (componentData.properties) {
            // 处理所有组件的属性（包括内置组件和自定义脚本组件）
            for (const [key, value] of Object.entries(componentData.properties)) {
                if (key === 'node' || key === 'enabled' || key === '__type__' ||
                    key === 'uuid' || key === 'name' || key === '__scriptAsset' || key === '_objFlags') {
                    continue; // 跳过这些特殊属性，包括_objFlags
                }
                // 对于以下划线开头的属性，需要特殊处理
                if (key.startsWith('_')) {
                    // 确保属性名保持原样（包括下划线）
                    const propValue = this.processComponentProperty(value, context);
                    if (propValue !== undefined) {
                        component[key] = propValue;
                    }
                }
                else {
                    // 非下划线开头的属性正常处理
                    const propValue = this.processComponentProperty(value, context);
                    if (propValue !== undefined) {
                        component[key] = propValue;
                    }
                }
            }
        }
        // 确保 _id 在最后位置
        const _id = component._id || "";
        delete component._id;
        component._id = _id;
        return component;
    }
    /**
     * 处理组件属性值，确保格式与手动创建的预制体一致
     */
    processComponentProperty(propData, context) {
        var _a, _b;
        if (!propData || typeof propData !== 'object') {
            return propData;
        }
        const value = propData.value;
        const type = propData.type;
        // 处理null值
        if (value === null || value === undefined) {
            return null;
        }
        // 处理空UUID对象，转换为null
        if (value && typeof value === 'object' && value.uuid === '') {
            return null;
        }
        // 处理节点引用
        if (type === 'cc.Node' && (value === null || value === void 0 ? void 0 : value.uuid)) {
            // 在预制体中，节点引用需要转换为 __id__ 形式
            if ((context === null || context === void 0 ? void 0 : context.nodeUuidToIndex) && context.nodeUuidToIndex.has(value.uuid)) {
                // 内部引用：转换为__id__格式
                return {
                    "__id__": context.nodeUuidToIndex.get(value.uuid)
                };
            }
            // 外部引用：设置为null，因为外部节点不属于预制体结构
            console.warn(`Node reference UUID ${value.uuid} not found in prefab context, setting to null (external reference)`);
            return null;
        }
        // 处理资源引用（预制体、纹理、精灵帧等）
        if ((value === null || value === void 0 ? void 0 : value.uuid) && (type === 'cc.Prefab' ||
            type === 'cc.Texture2D' ||
            type === 'cc.SpriteFrame' ||
            type === 'cc.Material' ||
            type === 'cc.AnimationClip' ||
            type === 'cc.AudioClip' ||
            type === 'cc.Font' ||
            type === 'cc.Asset')) {
            // 对于预制体引用，保持原始UUID格式
            const uuidToUse = type === 'cc.Prefab' ? value.uuid : this.uuidToCompressedId(value.uuid);
            return {
                "__uuid__": uuidToUse,
                "__expectedType__": type
            };
        }
        // 处理组件引用（包括具体的组件类型如cc.Label, cc.Button等）
        if ((value === null || value === void 0 ? void 0 : value.uuid) && (type === 'cc.Component' ||
            type === 'cc.Label' || type === 'cc.Button' || type === 'cc.Sprite' ||
            type === 'cc.UITransform' || type === 'cc.RigidBody2D' ||
            type === 'cc.BoxCollider2D' || type === 'cc.Animation' ||
            type === 'cc.AudioSource' || ((type === null || type === void 0 ? void 0 : type.startsWith('cc.')) && !type.includes('@')))) {
            // 在预制体中，组件引用也需要转换为 __id__ 形式
            if ((context === null || context === void 0 ? void 0 : context.componentUuidToIndex) && context.componentUuidToIndex.has(value.uuid)) {
                // 内部引用：转换为__id__格式
                console.log(`Component reference ${type} UUID ${value.uuid} found in prefab context, converting to __id__`);
                return {
                    "__id__": context.componentUuidToIndex.get(value.uuid)
                };
            }
            // 外部引用：设置为null，因为外部组件不属于预制体结构
            console.warn(`Component reference ${type} UUID ${value.uuid} not found in prefab context, setting to null (external reference)`);
            return null;
        }
        // 处理复杂类型，添加__type__标记
        if (value && typeof value === 'object') {
            if (type === 'cc.Color') {
                return {
                    "__type__": "cc.Color",
                    "r": Math.min(255, Math.max(0, Number(value.r) || 0)),
                    "g": Math.min(255, Math.max(0, Number(value.g) || 0)),
                    "b": Math.min(255, Math.max(0, Number(value.b) || 0)),
                    "a": value.a !== undefined ? Math.min(255, Math.max(0, Number(value.a))) : 255
                };
            }
            else if (type === 'cc.Vec3') {
                return {
                    "__type__": "cc.Vec3",
                    "x": Number(value.x) || 0,
                    "y": Number(value.y) || 0,
                    "z": Number(value.z) || 0
                };
            }
            else if (type === 'cc.Vec2') {
                return {
                    "__type__": "cc.Vec2",
                    "x": Number(value.x) || 0,
                    "y": Number(value.y) || 0
                };
            }
            else if (type === 'cc.Size') {
                return {
                    "__type__": "cc.Size",
                    "width": Number(value.width) || 0,
                    "height": Number(value.height) || 0
                };
            }
            else if (type === 'cc.Quat') {
                return {
                    "__type__": "cc.Quat",
                    "x": Number(value.x) || 0,
                    "y": Number(value.y) || 0,
                    "z": Number(value.z) || 0,
                    "w": value.w !== undefined ? Number(value.w) : 1
                };
            }
        }
        // 处理数组类型
        if (Array.isArray(value)) {
            // 节点数组
            if (((_a = propData.elementTypeData) === null || _a === void 0 ? void 0 : _a.type) === 'cc.Node') {
                return value.map(item => {
                    var _a;
                    if ((item === null || item === void 0 ? void 0 : item.uuid) && ((_a = context === null || context === void 0 ? void 0 : context.nodeUuidToIndex) === null || _a === void 0 ? void 0 : _a.has(item.uuid))) {
                        return { "__id__": context.nodeUuidToIndex.get(item.uuid) };
                    }
                    return null;
                }).filter(item => item !== null);
            }
            // 资源数组
            if (((_b = propData.elementTypeData) === null || _b === void 0 ? void 0 : _b.type) && propData.elementTypeData.type.startsWith('cc.')) {
                return value.map(item => {
                    if (item === null || item === void 0 ? void 0 : item.uuid) {
                        return {
                            "__uuid__": this.uuidToCompressedId(item.uuid),
                            "__expectedType__": propData.elementTypeData.type
                        };
                    }
                    return null;
                }).filter(item => item !== null);
            }
            // 基础类型数组
            return value.map(item => (item === null || item === void 0 ? void 0 : item.value) !== undefined ? item.value : item);
        }
        // 其他复杂对象类型，保持原样但确保有__type__标记
        if (value && typeof value === 'object' && type && type.startsWith('cc.')) {
            return Object.assign({ "__type__": type }, value);
        }
        return value;
    }
    /**
     * 创建符合引擎标准的节点对象
     */
    createEngineStandardNode(nodeData, parentNodeIndex, nodeName) {
        // 调试：打印原始节点数据（已注释）
        // console.log('原始节点数据:', JSON.stringify(nodeData, null, 2));
        var _a, _b, _c, _d, _e, _f, _g, _h;
        // 提取节点的基本属性
        const getValue = (prop) => {
            if ((prop === null || prop === void 0 ? void 0 : prop.value) !== undefined)
                return prop.value;
            if (prop !== undefined)
                return prop;
            return null;
        };
        const position = getValue(nodeData.position) || getValue((_a = nodeData.value) === null || _a === void 0 ? void 0 : _a.position) || { x: 0, y: 0, z: 0 };
        const rotation = getValue(nodeData.rotation) || getValue((_b = nodeData.value) === null || _b === void 0 ? void 0 : _b.rotation) || { x: 0, y: 0, z: 0, w: 1 };
        const scale = getValue(nodeData.scale) || getValue((_c = nodeData.value) === null || _c === void 0 ? void 0 : _c.scale) || { x: 1, y: 1, z: 1 };
        const active = (_f = (_d = getValue(nodeData.active)) !== null && _d !== void 0 ? _d : getValue((_e = nodeData.value) === null || _e === void 0 ? void 0 : _e.active)) !== null && _f !== void 0 ? _f : true;
        const name = nodeName || getValue(nodeData.name) || getValue((_g = nodeData.value) === null || _g === void 0 ? void 0 : _g.name) || 'Node';
        const layer = getValue(nodeData.layer) || getValue((_h = nodeData.value) === null || _h === void 0 ? void 0 : _h.layer) || 1073741824;
        // 调试输出
        console.log(`创建节点: ${name}, parentNodeIndex: ${parentNodeIndex}`);
        const parentRef = parentNodeIndex !== null ? { "__id__": parentNodeIndex } : null;
        console.log(`节点 ${name} 的父节点引用:`, parentRef);
        return {
            "__type__": "cc.Node",
            "_name": name,
            "_objFlags": 0,
            "__editorExtras__": {},
            "_parent": parentRef,
            "_children": [], // 子节点引用将在递归过程中动态添加
            "_active": active,
            "_components": [], // 组件引用将在处理组件时动态添加
            "_prefab": { "__id__": 0 }, // 临时值，后续会被正确设置
            "_lpos": {
                "__type__": "cc.Vec3",
                "x": position.x,
                "y": position.y,
                "z": position.z
            },
            "_lrot": {
                "__type__": "cc.Quat",
                "x": rotation.x,
                "y": rotation.y,
                "z": rotation.z,
                "w": rotation.w
            },
            "_lscale": {
                "__type__": "cc.Vec3",
                "x": scale.x,
                "y": scale.y,
                "z": scale.z
            },
            "_mobility": 0,
            "_layer": layer,
            "_euler": {
                "__type__": "cc.Vec3",
                "x": 0,
                "y": 0,
                "z": 0
            },
            "_id": ""
        };
    }
    /**
     * 从节点数据中提取UUID
     */
    extractNodeUuid(nodeData) {
        var _a, _b, _c;
        if (!nodeData)
            return null;
        // 尝试多种方式获取UUID
        const sources = [
            nodeData.uuid,
            (_a = nodeData.value) === null || _a === void 0 ? void 0 : _a.uuid,
            nodeData.__uuid__,
            (_b = nodeData.value) === null || _b === void 0 ? void 0 : _b.__uuid__,
            nodeData.id,
            (_c = nodeData.value) === null || _c === void 0 ? void 0 : _c.id
        ];
        for (const source of sources) {
            if (typeof source === 'string' && source.length > 0) {
                return source;
            }
        }
        return null;
    }
    /**
     * 创建最小化的节点对象，不包含任何组件以避免依赖问题
     */
    createMinimalNode(nodeData, nodeName) {
        var _a, _b, _c, _d, _e, _f, _g, _h;
        // 提取节点的基本属性
        const getValue = (prop) => {
            if ((prop === null || prop === void 0 ? void 0 : prop.value) !== undefined)
                return prop.value;
            if (prop !== undefined)
                return prop;
            return null;
        };
        const position = getValue(nodeData.position) || getValue((_a = nodeData.value) === null || _a === void 0 ? void 0 : _a.position) || { x: 0, y: 0, z: 0 };
        const rotation = getValue(nodeData.rotation) || getValue((_b = nodeData.value) === null || _b === void 0 ? void 0 : _b.rotation) || { x: 0, y: 0, z: 0, w: 1 };
        const scale = getValue(nodeData.scale) || getValue((_c = nodeData.value) === null || _c === void 0 ? void 0 : _c.scale) || { x: 1, y: 1, z: 1 };
        const active = (_f = (_d = getValue(nodeData.active)) !== null && _d !== void 0 ? _d : getValue((_e = nodeData.value) === null || _e === void 0 ? void 0 : _e.active)) !== null && _f !== void 0 ? _f : true;
        const name = nodeName || getValue(nodeData.name) || getValue((_g = nodeData.value) === null || _g === void 0 ? void 0 : _g.name) || 'Node';
        const layer = getValue(nodeData.layer) || getValue((_h = nodeData.value) === null || _h === void 0 ? void 0 : _h.layer) || 33554432;
        return {
            "__type__": "cc.Node",
            "_name": name,
            "_objFlags": 0,
            "_parent": null,
            "_children": [],
            "_active": active,
            "_components": [], // 空的组件数组，避免组件依赖问题
            "_prefab": {
                "__id__": 2
            },
            "_lpos": {
                "__type__": "cc.Vec3",
                "x": position.x,
                "y": position.y,
                "z": position.z
            },
            "_lrot": {
                "__type__": "cc.Quat",
                "x": rotation.x,
                "y": rotation.y,
                "z": rotation.z,
                "w": rotation.w
            },
            "_lscale": {
                "__type__": "cc.Vec3",
                "x": scale.x,
                "y": scale.y,
                "z": scale.z
            },
            "_layer": layer,
            "_euler": {
                "__type__": "cc.Vec3",
                "x": 0,
                "y": 0,
                "z": 0
            },
            "_id": ""
        };
    }
    /**
     * 创建标准的 meta 文件内容
     */
    createStandardMetaContent(prefabName, prefabUuid) {
        return {
            "ver": "2.0.3",
            "importer": "prefab",
            "imported": true,
            "uuid": prefabUuid,
            "files": [
                ".json"
            ],
            "subMetas": {},
            "userData": {
                "syncNodeName": prefabName,
                "hasIcon": false
            }
        };
    }
    /**
     * 尝试将原始节点转换为预制体实例
     */
    async convertNodeToPrefabInstance(nodeUuid, prefabUuid, prefabPath) {
        return new Promise((resolve) => {
            // 这个功能需要深入的场景编辑器集成，暂时返回失败
            // 在实际的引擎中，这涉及到复杂的预制体实例化和节点替换逻辑
            console.log('节点转换为预制体实例的功能需要更深入的引擎集成');
            resolve({
                success: false,
                error: '节点转换为预制体实例需要更深入的引擎集成支持'
            });
        });
    }
    async restorePrefabNode(nodeUuid, assetUuid) {
        return new Promise((resolve) => {
            // 使用官方API restore-prefab 还原预制体节点
            Editor.Message.request('scene', 'restore-prefab', nodeUuid, assetUuid).then(() => {
                resolve({
                    success: true,
                    data: {
                        nodeUuid: nodeUuid,
                        assetUuid: assetUuid,
                        message: '预制体节点还原成功'
                    }
                });
            }).catch((error) => {
                resolve({
                    success: false,
                    error: `预制体节点还原失败: ${error.message}`
                });
            });
        });
    }
    // 基于官方预制体格式的新实现方法
    async getNodeDataForPrefab(nodeUuid) {
        return new Promise((resolve) => {
            Editor.Message.request('scene', 'query-node', nodeUuid).then((nodeData) => {
                if (!nodeData) {
                    resolve({ success: false, error: '节点不存在' });
                    return;
                }
                resolve({ success: true, data: nodeData });
            }).catch((error) => {
                resolve({ success: false, error: error.message });
            });
        });
    }
    async createStandardPrefabData(nodeData, prefabName, prefabUuid) {
        // 基于官方Canvas.prefab格式创建预制体数据结构
        const prefabData = [];
        let currentId = 0;
        // 第一个元素：cc.Prefab 资源对象
        const prefabAsset = {
            "__type__": "cc.Prefab",
            "_name": prefabName,
            "_objFlags": 0,
            "__editorExtras__": {},
            "_native": "",
            "data": {
                "__id__": 1
            },
            "optimizationPolicy": 0,
            "persistent": false
        };
        prefabData.push(prefabAsset);
        currentId++;
        // 第二个元素：根节点
        const rootNode = await this.createNodeObject(nodeData, null, prefabData, currentId);
        prefabData.push(rootNode.node);
        currentId = rootNode.nextId;
        // 添加根节点的 PrefabInfo - 修复asset引用使用UUID
        const rootPrefabInfo = {
            "__type__": "cc.PrefabInfo",
            "root": {
                "__id__": 1
            },
            "asset": {
                "__uuid__": prefabUuid
            },
            "fileId": this.generateFileId(),
            "instance": null,
            "targetOverrides": [],
            "nestedPrefabInstanceRoots": []
        };
        prefabData.push(rootPrefabInfo);
        return prefabData;
    }
    async createNodeObject(nodeData, parentId, prefabData, currentId) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j;
        const nodeId = currentId++;
        // 提取节点的基本属性 - 适配query-node-tree的数据格式
        const getValue = (prop) => {
            if ((prop === null || prop === void 0 ? void 0 : prop.value) !== undefined)
                return prop.value;
            if (prop !== undefined)
                return prop;
            return null;
        };
        const position = getValue(nodeData.position) || getValue((_a = nodeData.value) === null || _a === void 0 ? void 0 : _a.position) || { x: 0, y: 0, z: 0 };
        const rotation = getValue(nodeData.rotation) || getValue((_b = nodeData.value) === null || _b === void 0 ? void 0 : _b.rotation) || { x: 0, y: 0, z: 0, w: 1 };
        const scale = getValue(nodeData.scale) || getValue((_c = nodeData.value) === null || _c === void 0 ? void 0 : _c.scale) || { x: 1, y: 1, z: 1 };
        const active = (_f = (_d = getValue(nodeData.active)) !== null && _d !== void 0 ? _d : getValue((_e = nodeData.value) === null || _e === void 0 ? void 0 : _e.active)) !== null && _f !== void 0 ? _f : true;
        const name = getValue(nodeData.name) || getValue((_g = nodeData.value) === null || _g === void 0 ? void 0 : _g.name) || 'Node';
        const layer = getValue(nodeData.layer) || getValue((_h = nodeData.value) === null || _h === void 0 ? void 0 : _h.layer) || 33554432;
        const node = {
            "__type__": "cc.Node",
            "_name": name,
            "_objFlags": 0,
            "__editorExtras__": {},
            "_parent": parentId !== null ? { "__id__": parentId } : null,
            "_children": [],
            "_active": active,
            "_components": [],
            "_prefab": parentId === null ? {
                "__id__": currentId++
            } : null,
            "_lpos": {
                "__type__": "cc.Vec3",
                "x": position.x,
                "y": position.y,
                "z": position.z
            },
            "_lrot": {
                "__type__": "cc.Quat",
                "x": rotation.x,
                "y": rotation.y,
                "z": rotation.z,
                "w": rotation.w
            },
            "_lscale": {
                "__type__": "cc.Vec3",
                "x": scale.x,
                "y": scale.y,
                "z": scale.z
            },
            "_mobility": 0,
            "_layer": layer,
            "_euler": {
                "__type__": "cc.Vec3",
                "x": 0,
                "y": 0,
                "z": 0
            },
            "_id": ""
        };
        // 暂时跳过UITransform组件以避免_getDependComponent错误
        // 后续通过Engine API动态添加
        console.log(`节点 ${name} 暂时跳过UITransform组件，避免引擎依赖错误`);
        // 处理其他组件（暂时跳过，专注于修复UITransform问题）
        const components = this.extractComponentsFromNode(nodeData);
        if (components.length > 0) {
            console.log(`节点 ${name} 包含 ${components.length} 个其他组件，暂时跳过以专注于UITransform修复`);
        }
        // 处理子节点 - 使用query-node-tree获取的完整结构
        const childrenToProcess = this.getChildrenToProcess(nodeData);
        if (childrenToProcess.length > 0) {
            console.log(`=== 处理子节点 ===`);
            console.log(`节点 ${name} 包含 ${childrenToProcess.length} 个子节点`);
            for (let i = 0; i < childrenToProcess.length; i++) {
                const childData = childrenToProcess[i];
                const childName = childData.name || ((_j = childData.value) === null || _j === void 0 ? void 0 : _j.name) || '未知';
                console.log(`处理第${i + 1}个子节点: ${childName}`);
                try {
                    const childId = currentId;
                    node._children.push({ "__id__": childId });
                    // 递归创建子节点
                    const childResult = await this.createNodeObject(childData, nodeId, prefabData, currentId);
                    prefabData.push(childResult.node);
                    currentId = childResult.nextId;
                    // 子节点不需要PrefabInfo，只有根节点需要
                    // 子节点的_prefab应该设置为null
                    childResult.node._prefab = null;
                    console.log(`✅ 成功添加子节点: ${childName}`);
                }
                catch (error) {
                    console.error(`处理子节点 ${childName} 时出错:`, error);
                }
            }
        }
        return { node, nextId: currentId };
    }
    // 从节点数据中提取组件信息
    extractComponentsFromNode(nodeData) {
        var _a, _b;
        const components = [];
        // 从不同位置尝试获取组件数据
        const componentSources = [
            nodeData.__comps__,
            nodeData.components,
            (_a = nodeData.value) === null || _a === void 0 ? void 0 : _a.__comps__,
            (_b = nodeData.value) === null || _b === void 0 ? void 0 : _b.components
        ];
        for (const source of componentSources) {
            if (Array.isArray(source)) {
                components.push(...source.filter(comp => comp && (comp.__type__ || comp.type)));
                break; // 找到有效的组件数组就退出
            }
        }
        return components;
    }
    // 创建标准的组件对象
    createStandardComponentObject(componentData, nodeId, prefabInfoId) {
        const componentType = componentData.__type__ || componentData.type;
        if (!componentType) {
            console.warn('组件缺少类型信息:', componentData);
            return null;
        }
        // 基础组件结构 - 基于官方预制体格式
        const component = {
            "__type__": componentType,
            "_name": "",
            "_objFlags": 0,
            "node": {
                "__id__": nodeId
            },
            "_enabled": this.getComponentPropertyValue(componentData, 'enabled', true),
            "__prefab": {
                "__id__": prefabInfoId
            }
        };
        // 根据组件类型添加特定属性
        this.addComponentSpecificProperties(component, componentData, componentType);
        // 添加_id属性
        component._id = "";
        return component;
    }
    // 添加组件特定的属性
    addComponentSpecificProperties(component, componentData, componentType) {
        switch (componentType) {
            case 'cc.UITransform':
                this.addUITransformProperties(component, componentData);
                break;
            case 'cc.Sprite':
                this.addSpriteProperties(component, componentData);
                break;
            case 'cc.Label':
                this.addLabelProperties(component, componentData);
                break;
            case 'cc.Button':
                this.addButtonProperties(component, componentData);
                break;
            default:
                // 对于未知类型的组件，复制所有安全的属性
                this.addGenericProperties(component, componentData);
                break;
        }
    }
    // UITransform组件属性
    addUITransformProperties(component, componentData) {
        component._contentSize = this.createSizeObject(this.getComponentPropertyValue(componentData, 'contentSize', { width: 100, height: 100 }));
        component._anchorPoint = this.createVec2Object(this.getComponentPropertyValue(componentData, 'anchorPoint', { x: 0.5, y: 0.5 }));
    }
    // Sprite组件属性
    addSpriteProperties(component, componentData) {
        component._visFlags = 0;
        component._customMaterial = null;
        component._srcBlendFactor = 2;
        component._dstBlendFactor = 4;
        component._color = this.createColorObject(this.getComponentPropertyValue(componentData, 'color', { r: 255, g: 255, b: 255, a: 255 }));
        component._spriteFrame = this.getComponentPropertyValue(componentData, 'spriteFrame', null);
        component._type = this.getComponentPropertyValue(componentData, 'type', 0);
        component._fillType = 0;
        component._sizeMode = this.getComponentPropertyValue(componentData, 'sizeMode', 1);
        component._fillCenter = this.createVec2Object({ x: 0, y: 0 });
        component._fillStart = 0;
        component._fillRange = 0;
        component._isTrimmedMode = true;
        component._useGrayscale = false;
        component._atlas = null;
    }
    // Label组件属性
    addLabelProperties(component, componentData) {
        component._visFlags = 0;
        component._customMaterial = null;
        component._srcBlendFactor = 2;
        component._dstBlendFactor = 4;
        component._color = this.createColorObject(this.getComponentPropertyValue(componentData, 'color', { r: 0, g: 0, b: 0, a: 255 }));
        component._string = this.getComponentPropertyValue(componentData, 'string', 'Label');
        component._horizontalAlign = 1;
        component._verticalAlign = 1;
        component._actualFontSize = 20;
        component._fontSize = this.getComponentPropertyValue(componentData, 'fontSize', 20);
        component._fontFamily = 'Arial';
        component._lineHeight = 40;
        component._overflow = 1;
        component._enableWrapText = false;
        component._font = null;
        component._isSystemFontUsed = true;
        component._isItalic = false;
        component._isBold = false;
        component._isUnderline = false;
        component._underlineHeight = 2;
        component._cacheMode = 0;
    }
    // Button组件属性
    addButtonProperties(component, componentData) {
        component.clickEvents = [];
        component._interactable = true;
        component._transition = 2;
        component._normalColor = this.createColorObject({ r: 214, g: 214, b: 214, a: 255 });
        component._hoverColor = this.createColorObject({ r: 211, g: 211, b: 211, a: 255 });
        component._pressedColor = this.createColorObject({ r: 255, g: 255, b: 255, a: 255 });
        component._disabledColor = this.createColorObject({ r: 124, g: 124, b: 124, a: 255 });
        component._duration = 0.1;
        component._zoomScale = 1.2;
    }
    // 添加通用属性
    addGenericProperties(component, componentData) {
        // 只复制安全的、已知的属性
        const safeProperties = ['enabled', 'color', 'string', 'fontSize', 'spriteFrame', 'type', 'sizeMode'];
        for (const prop of safeProperties) {
            if (componentData.hasOwnProperty(prop)) {
                const value = this.getComponentPropertyValue(componentData, prop);
                if (value !== undefined) {
                    component[`_${prop}`] = value;
                }
            }
        }
    }
    // 创建Vec2对象
    createVec2Object(data) {
        return {
            "__type__": "cc.Vec2",
            "x": (data === null || data === void 0 ? void 0 : data.x) || 0,
            "y": (data === null || data === void 0 ? void 0 : data.y) || 0
        };
    }
    // 创建Vec3对象
    createVec3Object(data) {
        return {
            "__type__": "cc.Vec3",
            "x": (data === null || data === void 0 ? void 0 : data.x) || 0,
            "y": (data === null || data === void 0 ? void 0 : data.y) || 0,
            "z": (data === null || data === void 0 ? void 0 : data.z) || 0
        };
    }
    // 创建Size对象
    createSizeObject(data) {
        return {
            "__type__": "cc.Size",
            "width": (data === null || data === void 0 ? void 0 : data.width) || 100,
            "height": (data === null || data === void 0 ? void 0 : data.height) || 100
        };
    }
    // 创建Color对象
    createColorObject(data) {
        var _a, _b, _c, _d;
        return {
            "__type__": "cc.Color",
            "r": (_a = data === null || data === void 0 ? void 0 : data.r) !== null && _a !== void 0 ? _a : 255,
            "g": (_b = data === null || data === void 0 ? void 0 : data.g) !== null && _b !== void 0 ? _b : 255,
            "b": (_c = data === null || data === void 0 ? void 0 : data.b) !== null && _c !== void 0 ? _c : 255,
            "a": (_d = data === null || data === void 0 ? void 0 : data.a) !== null && _d !== void 0 ? _d : 255
        };
    }
    // 判断是否应该复制组件属性
    shouldCopyComponentProperty(key, value) {
        // 跳过内部属性和已处理的属性
        if (key.startsWith('__') || key === '_enabled' || key === 'node' || key === 'enabled') {
            return false;
        }
        // 跳过函数和undefined值
        if (typeof value === 'function' || value === undefined) {
            return false;
        }
        return true;
    }
    // 获取组件属性值 - 重命名以避免冲突
    getComponentPropertyValue(componentData, propertyName, defaultValue) {
        // 尝试直接获取属性
        if (componentData[propertyName] !== undefined) {
            return this.extractValue(componentData[propertyName]);
        }
        // 尝试从value属性中获取
        if (componentData.value && componentData.value[propertyName] !== undefined) {
            return this.extractValue(componentData.value[propertyName]);
        }
        // 尝试带下划线前缀的属性名
        const prefixedName = `_${propertyName}`;
        if (componentData[prefixedName] !== undefined) {
            return this.extractValue(componentData[prefixedName]);
        }
        return defaultValue;
    }
    // 提取属性值
    extractValue(data) {
        if (data === null || data === undefined) {
            return data;
        }
        // 如果有value属性，优先使用value
        if (typeof data === 'object' && data.hasOwnProperty('value')) {
            return data.value;
        }
        // 如果是引用对象，保持原样
        if (typeof data === 'object' && (data.__id__ !== undefined || data.__uuid__ !== undefined)) {
            return data;
        }
        return data;
    }
    createStandardMetaData(prefabName, prefabUuid) {
        return {
            "ver": "1.1.50",
            "importer": "prefab",
            "imported": true,
            "uuid": prefabUuid,
            "files": [
                ".json"
            ],
            "subMetas": {},
            "userData": {
                "syncNodeName": prefabName
            }
        };
    }
    async savePrefabWithMeta(prefabPath, prefabData, metaData) {
        try {
            const prefabContent = JSON.stringify(prefabData, null, 2);
            const metaContent = JSON.stringify(metaData, null, 2);
            // 确保路径以.prefab结尾
            const finalPrefabPath = prefabPath.endsWith('.prefab') ? prefabPath : `${prefabPath}.prefab`;
            const metaPath = `${finalPrefabPath}.meta`;
            // 使用asset-db API创建预制体文件
            await new Promise((resolve, reject) => {
                Editor.Message.request('asset-db', 'create-asset', finalPrefabPath, prefabContent).then(() => {
                    resolve(true);
                }).catch((error) => {
                    reject(error);
                });
            });
            // 创建meta文件
            await new Promise((resolve, reject) => {
                Editor.Message.request('asset-db', 'create-asset', metaPath, metaContent).then(() => {
                    resolve(true);
                }).catch((error) => {
                    reject(error);
                });
            });
            console.log(`=== 预制体保存完成 ===`);
            console.log(`预制体文件已保存: ${finalPrefabPath}`);
            console.log(`Meta文件已保存: ${metaPath}`);
            console.log(`预制体数组总长度: ${prefabData.length}`);
            console.log(`预制体根节点索引: ${prefabData.length - 1}`);
            return { success: true };
        }
        catch (error) {
            console.error('保存预制体文件时出错:', error);
            return { success: false, error: error.message };
        }
    }
}
exports.PrefabTools = PrefabTools;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidG9vbHMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zb3VyY2UvY2FwYWJpbGl0aWVzL3ByZWZhYi90b29scy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFFQSxNQUFhLFdBQVc7SUFDcEIsUUFBUTtRQUNKLE9BQU87WUFDSDtnQkFDSSxJQUFJLEVBQUUsaUJBQWlCO2dCQUN2QixXQUFXLEVBQUUsWUFBWTtnQkFDekIsV0FBVyxFQUFFO29CQUNULElBQUksRUFBRSxRQUFRO29CQUNkLFVBQVUsRUFBRTt3QkFDUixNQUFNLEVBQUU7NEJBQ0osSUFBSSxFQUFFLFFBQVE7NEJBQ2QsV0FBVyxFQUFFLGNBQWM7NEJBQzNCLE9BQU8sRUFBRSxhQUFhO3lCQUN6QjtxQkFDSjtpQkFDSjthQUNKO1lBQ0Q7Z0JBQ0ksSUFBSSxFQUFFLGFBQWE7Z0JBQ25CLFdBQVcsRUFBRSxVQUFVO2dCQUN2QixXQUFXLEVBQUU7b0JBQ1QsSUFBSSxFQUFFLFFBQVE7b0JBQ2QsVUFBVSxFQUFFO3dCQUNSLFVBQVUsRUFBRTs0QkFDUixJQUFJLEVBQUUsUUFBUTs0QkFDZCxXQUFXLEVBQUUsU0FBUzt5QkFDekI7cUJBQ0o7b0JBQ0QsUUFBUSxFQUFFLENBQUMsWUFBWSxDQUFDO2lCQUMzQjthQUNKO1lBQ0Q7Z0JBQ0ksSUFBSSxFQUFFLG9CQUFvQjtnQkFDMUIsV0FBVyxFQUFFLFlBQVk7Z0JBQ3pCLFdBQVcsRUFBRTtvQkFDVCxJQUFJLEVBQUUsUUFBUTtvQkFDZCxVQUFVLEVBQUU7d0JBQ1IsVUFBVSxFQUFFOzRCQUNSLElBQUksRUFBRSxRQUFROzRCQUNkLFdBQVcsRUFBRSxTQUFTO3lCQUN6Qjt3QkFDRCxVQUFVLEVBQUU7NEJBQ1IsSUFBSSxFQUFFLFFBQVE7NEJBQ2QsV0FBVyxFQUFFLGNBQWM7eUJBQzlCO3dCQUNELFFBQVEsRUFBRTs0QkFDTixJQUFJLEVBQUUsUUFBUTs0QkFDZCxXQUFXLEVBQUUsTUFBTTs0QkFDbkIsVUFBVSxFQUFF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LENBQUM7Z0JBQ2xCLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLEtBQVUsRUFBRSxFQUFFO29CQUNwQixNQUFNLENBQUMsS0FBSyxDQUFDLENBQUM7Z0JBQ2xCLENBQUMsQ0FBQyxDQUFDO1lBQ1AsQ0FBQyxDQUFDLENBQUM7WUFFSCxPQUFPLENBQUMsR0FBRyxDQUFDLGlCQUFpQixDQUFDLENBQUM7WUFDL0IsT0FBTyxDQUFDLEdBQUcsQ0FBQyxhQUFhLGVBQWUsRUFBRSxDQUFDLENBQUM7WUFDNUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxjQUFjLFFBQVEsRUFBRSxDQUFDLENBQUM7WUFDdEMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxhQUFhLFVBQVUsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFDO1lBQzlDLE9BQU8sQ0FBQyxHQUFHLENBQUMsYUFBYSxVQUFVLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUM7WUFFbEQsT0FBTyxFQUFFLE9BQU8sRUFBRSxJQUFJLEVBQUUsQ0FBQztRQUM3QixDQUFDO1FBQUMsT0FBTyxLQUFVLEVBQUUsQ0FBQztZQUNsQixPQUFPLENBQUMsS0FBSyxDQUFDLGFBQWEsRUFBRSxLQUFLLENBQUMsQ0FBQztZQUNwQyxPQUFPLEVBQUUsT0FBTyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxDQUFDLE9BQU8sRUFBRSxDQUFDO1FBQ3BELENBQUM7SUFDTCxDQUFDO0NBRUo7QUE3d0ZELGtDQTZ3RkMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBUb29sRGVmaW5pdGlvbiwgVG9vbFJlc3BvbnNlLCBUb29sRXhlY3V0b3IsIFByZWZhYkluZm8gfSBmcm9tICcuLi8uLi90eXBlcyc7XG5cbmV4cG9ydCBjbGFzcyBQcmVmYWJUb29scyBpbXBsZW1lbnRzIFRvb2xFeGVjdXRvciB7XG4gICAgZ2V0VG9vbHMoKTogVG9vbERlZmluaXRpb25bXSB7XG4gICAgICAgIHJldHVybiBbXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgbmFtZTogJ2dldF9wcmVmYWJfbGlzdCcsXG4gICAgICAgICAgICAgICAgZGVzY3JpcHRpb246ICfojrflj5bpobnnm67kuK3miYDmnInpooTliLbkvZMnLFxuICAgICAgICAgICAgICAgIGlucHV0U2NoZW1hOiB7XG4gICAgICAgICAgICAgICAgICAgIHR5cGU6ICdvYmplY3QnLFxuICAgICAgICAgICAgICAgICAgICBwcm9wZXJ0aWVzOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBmb2xkZXI6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiAnc3RyaW5nJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogJ+aQnOe0oueahOaWh+S7tuWkuei3r+W+hO+8iOWPr+mAie+8iScsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVmYXVsdDogJ2RiOi8vYXNzZXRzJ1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBuYW1lOiAnbG9hZF9wcmVmYWInLFxuICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiAn5oyJ6Lev5b6E5Yqg6L296aKE5Yi25L2TJyxcbiAgICAgICAgICAgICAgICBpbnB1dFNjaGVtYToge1xuICAgICAgICAgICAgICAgICAgICB0eXBlOiAnb2JqZWN0JyxcbiAgICAgICAgICAgICAgICAgICAgcHJvcGVydGllczoge1xuICAgICAgICAgICAgICAgICAgICAgICAgcHJlZmFiUGF0aDoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6ICdzdHJpbmcnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiAn6aKE5Yi25L2T6LWE5rqQ6Lev5b6EJ1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICByZXF1aXJlZDogWydwcmVmYWJQYXRoJ11cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIG5hbWU6ICdpbnN0YW50aWF0ZV9wcmVmYWInLFxuICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiAn5Zyo5Zy65pmv5Lit5a6e5L6L5YyW6aKE5Yi25L2TJyxcbiAgICAgICAgICAgICAgICBpbnB1dFNjaGVtYToge1xuICAgICAgICAgICAgICAgICAgICB0eXBlOiAnb2JqZWN0JyxcbiAgICAgICAgICAgICAgICAgICAgcHJvcGVydGllczoge1xuICAgICAgICAgICAgICAgICAgICAgICAgcHJlZmFiUGF0aDoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6ICdzdHJpbmcnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiAn6aKE5Yi25L2T6LWE5rqQ6Lev5b6EJ1xuICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHBhcmVudFV1aWQ6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiAnc3RyaW5nJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogJ+eItuiKgueCuSBVVUlE77yI5Y+v6YCJ77yJJ1xuICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHBvc2l0aW9uOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogJ29iamVjdCcsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVzY3JpcHRpb246ICfliJ3lp4vkvY3nva4nLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHByb3BlcnRpZXM6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeDogeyB0eXBlOiAnbnVtYmVyJyB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB5OiB7IHR5cGU6ICdudW1iZXInIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHo6IHsgdHlwZTogJ251bWJlcicgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgcmVxdWlyZWQ6IFsncHJlZmFiUGF0aCddXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBuYW1lOiAnY3JlYXRlX3ByZWZhYicsXG4gICAgICAgICAgICAgICAgZGVzY3JpcHRpb246ICfku47oioLngrnliJvlu7rpooTliLbkvZMnLFxuICAgICAgICAgICAgICAgIGlucHV0U2NoZW1hOiB7XG4gICAgICAgICAgICAgICAgICAgIHR5cGU6ICdvYmplY3QnLFxuICAgICAgICAgICAgICAgICAgICBwcm9wZXJ0aWVzOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBub2RlVXVpZDoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6ICdzdHJpbmcnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiAn5rqQ6IqC54K5IFVVSUQnXG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgc2F2ZVBhdGg6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiAnc3RyaW5nJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogJ+mihOWItuS9k+S/neWtmOi3r+W+hO+8iOS+i+WmgiBkYjovL2Fzc2V0cy9wcmVmYWJzL015UHJlZmFiLnByZWZhYu+8iSdcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICBwcmVmYWJOYW1lOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogJ3N0cmluZycsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVzY3JpcHRpb246ICfpooTliLbkvZPlkI3np7AnXG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIHJlcXVpcmVkOiBbJ25vZGVVdWlkJywgJ3NhdmVQYXRoJywgJ3ByZWZhYk5hbWUnXVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgbmFtZTogJ3VwZGF0ZV9wcmVmYWInLFxuICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiAn5pu05paw546w5pyJ6aKE5Yi25L2TJyxcbiAgICAgICAgICAgICAgICBpbnB1dFNjaGVtYToge1xuICAgICAgICAgICAgICAgICAgICB0eXBlOiAnb2JqZWN0JyxcbiAgICAgICAgICAgICAgICAgICAgcHJvcGVydGllczoge1xuICAgICAgICAgICAgICAgICAgICAgICAgcHJlZmFiUGF0aDoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6ICdzdHJpbmcnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiAn6aKE5Yi25L2T6LWE5rqQ6Lev5b6EJ1xuICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG5vZGVVdWlkOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogJ3N0cmluZycsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVzY3JpcHRpb246ICfljIXlkKvlj5jmm7TnmoToioLngrkgVVVJRCdcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgcmVxdWlyZWQ6IFsncHJlZmFiUGF0aCcsICdub2RlVXVpZCddXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBuYW1lOiAncmV2ZXJ0X3ByZWZhYicsXG4gICAgICAgICAgICAgICAgZGVzY3JpcHRpb246ICflsIbpooTliLbkvZPlrp7kvovov5jljp/kuLrljp/lp4vniYjmnKwnLFxuICAgICAgICAgICAgICAgIGlucHV0U2NoZW1hOiB7XG4gICAgICAgICAgICAgICAgICAgIHR5cGU6ICdvYmplY3QnLFxuICAgICAgICAgICAgICAgICAgICBwcm9wZXJ0aWVzOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBub2RlVXVpZDoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6ICdzdHJpbmcnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiAn6aKE5Yi25L2T5a6e5L6L6IqC54K5IFVVSUQnXG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIHJlcXVpcmVkOiBbJ25vZGVVdWlkJ11cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIG5hbWU6ICdnZXRfcHJlZmFiX2luZm8nLFxuICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiAn6I635Y+W6aKE5Yi25L2T6K+m57uG5L+h5oGvJyxcbiAgICAgICAgICAgICAgICBpbnB1dFNjaGVtYToge1xuICAgICAgICAgICAgICAgICAgICB0eXBlOiAnb2JqZWN0JyxcbiAgICAgICAgICAgICAgICAgICAgcHJvcGVydGllczoge1xuICAgICAgICAgICAgICAgICAgICAgICAgcHJlZmFiUGF0aDoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6ICdzdHJpbmcnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiAn6aKE5Yi25L2T6LWE5rqQ6Lev5b6EJ1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICByZXF1aXJlZDogWydwcmVmYWJQYXRoJ11cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIG5hbWU6ICd2YWxpZGF0ZV9wcmVmYWInLFxuICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiAn6aqM6K+B6aKE5Yi25L2T5paH5Lu25qC85byPJyxcbiAgICAgICAgICAgICAgICBpbnB1dFNjaGVtYToge1xuICAgICAgICAgICAgICAgICAgICB0eXBlOiAnb2JqZWN0JyxcbiAgICAgICAgICAgICAgICAgICAgcHJvcGVydGllczoge1xuICAgICAgICAgICAgICAgICAgICAgICAgcHJlZmFiUGF0aDoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6ICdzdHJpbmcnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiAn6aKE5Yi25L2T6LWE5rqQ6Lev5b6EJ1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICByZXF1aXJlZDogWydwcmVmYWJQYXRoJ11cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIG5hbWU6ICdkdXBsaWNhdGVfcHJlZmFiJyxcbiAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogJ+WkjeWItumihOWItuS9kycsXG4gICAgICAgICAgICAgICAgaW5wdXRTY2hlbWE6IHtcbiAgICAgICAgICAgICAgICAgICAgdHlwZTogJ29iamVjdCcsXG4gICAgICAgICAgICAgICAgICAgIHByb3BlcnRpZXM6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHNvdXJjZVByZWZhYlBhdGg6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiAnc3RyaW5nJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogJ+a6kOmihOWItuS9k+i3r+W+hCdcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICB0YXJnZXRQcmVmYWJQYXRoOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogJ3N0cmluZycsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVzY3JpcHRpb246ICfnm67moIfpooTliLbkvZPot6/lvoQnXG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgbmV3UHJlZmFiTmFtZToge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6ICdzdHJpbmcnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiAn5paw6aKE5Yi25L2T5ZCN56ewJ1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICByZXF1aXJlZDogWydzb3VyY2VQcmVmYWJQYXRoJywgJ3RhcmdldFByZWZhYlBhdGgnXVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgbmFtZTogJ3Jlc3RvcmVfcHJlZmFiX25vZGUnLFxuICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiAn5LuO6LWE5rqQ5oGi5aSN6aKE5Yi25L2T5a6e5L6LJyxcbiAgICAgICAgICAgICAgICBpbnB1dFNjaGVtYToge1xuICAgICAgICAgICAgICAgICAgICB0eXBlOiAnb2JqZWN0JyxcbiAgICAgICAgICAgICAgICAgICAgcHJvcGVydGllczoge1xuICAgICAgICAgICAgICAgICAgICAgICAgbm9kZVV1aWQ6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiAnc3RyaW5nJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogJ+mihOWItuS9k+WunuS+i+iKgueCuSBVVUlEJ1xuICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGFzc2V0VXVpZDoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6ICdzdHJpbmcnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiAn6aKE5Yi25L2T6LWE5rqQIFVVSUQnXG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIHJlcXVpcmVkOiBbJ25vZGVVdWlkJywgJ2Fzc2V0VXVpZCddXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICBdO1xuICAgIH1cblxuICAgIGFzeW5jIGV4ZWN1dGUodG9vbE5hbWU6IHN0cmluZywgYXJnczogYW55KTogUHJvbWlzZTxUb29sUmVzcG9uc2U+IHtcbiAgICAgICAgc3dpdGNoICh0b29sTmFtZSkge1xuICAgICAgICAgICAgY2FzZSAnZ2V0X3ByZWZhYl9saXN0JzpcbiAgICAgICAgICAgICAgICByZXR1cm4gYXdhaXQgdGhpcy5nZXRQcmVmYWJMaXN0KGFyZ3MuZm9sZGVyKTtcbiAgICAgICAgICAgIGNhc2UgJ2xvYWRfcHJlZmFiJzpcbiAgICAgICAgICAgICAgICByZXR1cm4gYXdhaXQgdGhpcy5sb2FkUHJlZmFiKGFyZ3MucHJlZmFiUGF0aCk7XG4gICAgICAgICAgICBjYXNlICdpbnN0YW50aWF0ZV9wcmVmYWInOlxuICAgICAgICAgICAgICAgIHJldHVybiBhd2FpdCB0aGlzLmluc3RhbnRpYXRlUHJlZmFiKGFyZ3MpO1xuICAgICAgICAgICAgY2FzZSAnY3JlYXRlX3ByZWZhYic6XG4gICAgICAgICAgICAgICAgcmV0dXJuIGF3YWl0IHRoaXMuY3JlYXRlUHJlZmFiKGFyZ3MpO1xuICAgICAgICAgICAgY2FzZSAndXBkYXRlX3ByZWZhYic6XG4gICAgICAgICAgICAgICAgcmV0dXJuIGF3YWl0IHRoaXMudXBkYXRlUHJlZmFiKGFyZ3MucHJlZmFiUGF0aCwgYXJncy5ub2RlVXVpZCk7XG4gICAgICAgICAgICBjYXNlICdyZXZlcnRfcHJlZmFiJzpcbiAgICAgICAgICAgICAgICByZXR1cm4gYXdhaXQgdGhpcy5yZXZlcnRQcmVmYWIoYXJncy5ub2RlVXVpZCk7XG4gICAgICAgICAgICBjYXNlICdnZXRfcHJlZmFiX2luZm8nOlxuICAgICAgICAgICAgICAgIHJldHVybiBhd2FpdCB0aGlzLmdldFByZWZhYkluZm8oYXJncy5wcmVmYWJQYXRoKTtcbiAgICAgICAgICAgIGNhc2UgJ3ZhbGlkYXRlX3ByZWZhYic6XG4gICAgICAgICAgICAgICAgcmV0dXJuIGF3YWl0IHRoaXMudmFsaWRhdGVQcmVmYWIoYXJncy5wcmVmYWJQYXRoKTtcbiAgICAgICAgICAgIGNhc2UgJ2R1cGxpY2F0ZV9wcmVmYWInOlxuICAgICAgICAgICAgICAgIHJldHVybiBhd2FpdCB0aGlzLmR1cGxpY2F0ZVByZWZhYihhcmdzKTtcbiAgICAgICAgICAgIGNhc2UgJ3Jlc3RvcmVfcHJlZmFiX25vZGUnOlxuICAgICAgICAgICAgICAgIHJldHVybiBhd2FpdCB0aGlzLnJlc3RvcmVQcmVmYWJOb2RlKGFyZ3Mubm9kZVV1aWQsIGFyZ3MuYXNzZXRVdWlkKTtcbiAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBVbmtub3duIHRvb2w6ICR7dG9vbE5hbWV9YCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcml2YXRlIGFzeW5jIGdldFByZWZhYkxpc3QoZm9sZGVyOiBzdHJpbmcgPSAnZGI6Ly9hc3NldHMnKTogUHJvbWlzZTxUb29sUmVzcG9uc2U+IHtcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBwYXR0ZXJuID0gZm9sZGVyLmVuZHNXaXRoKCcvJykgPyBcbiAgICAgICAgICAgICAgICBgJHtmb2xkZXJ9KiovKi5wcmVmYWJgIDogYCR7Zm9sZGVyfS8qKi8qLnByZWZhYmA7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIEVkaXRvci5NZXNzYWdlLnJlcXVlc3QoJ2Fzc2V0LWRiJywgJ3F1ZXJ5LWFzc2V0cycsIHtcbiAgICAgICAgICAgICAgICBwYXR0ZXJuOiBwYXR0ZXJuXG4gICAgICAgICAgICB9KS50aGVuKChyZXN1bHRzOiBhbnlbXSkgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnN0IHByZWZhYnM6IFByZWZhYkluZm9bXSA9IHJlc3VsdHMubWFwKGFzc2V0ID0+ICh7XG4gICAgICAgICAgICAgICAgICAgIG5hbWU6IGFzc2V0Lm5hbWUsXG4gICAgICAgICAgICAgICAgICAgIHBhdGg6IGFzc2V0LnVybCxcbiAgICAgICAgICAgICAgICAgICAgdXVpZDogYXNzZXQudXVpZCxcbiAgICAgICAgICAgICAgICAgICAgZm9sZGVyOiBhc3NldC51cmwuc3Vic3RyaW5nKDAsIGFzc2V0LnVybC5sYXN0SW5kZXhPZignLycpKVxuICAgICAgICAgICAgICAgIH0pKTtcbiAgICAgICAgICAgICAgICByZXNvbHZlKHsgc3VjY2VzczogdHJ1ZSwgZGF0YTogcHJlZmFicyB9KTtcbiAgICAgICAgICAgIH0pLmNhdGNoKChlcnI6IEVycm9yKSA9PiB7XG4gICAgICAgICAgICAgICAgcmVzb2x2ZSh7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogZXJyLm1lc3NhZ2UgfSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBhc3luYyBsb2FkUHJlZmFiKHByZWZhYlBhdGg6IHN0cmluZyk6IFByb21pc2U8VG9vbFJlc3BvbnNlPiB7XG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSkgPT4ge1xuICAgICAgICAgICAgRWRpdG9yLk1lc3NhZ2UucmVxdWVzdCgnYXNzZXQtZGInLCAncXVlcnktYXNzZXQtaW5mbycsIHByZWZhYlBhdGgpLnRoZW4oKGFzc2V0SW5mbzogYW55KSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKCFhc3NldEluZm8pIHtcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdQcmVmYWIgbm90IGZvdW5kJyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIHJldHVybiBFZGl0b3IuTWVzc2FnZS5yZXF1ZXN0KCdzY2VuZScsICdsb2FkLWFzc2V0Jywge1xuICAgICAgICAgICAgICAgICAgICB1dWlkOiBhc3NldEluZm8udXVpZFxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSkudGhlbigocHJlZmFiRGF0YTogYW55KSA9PiB7XG4gICAgICAgICAgICAgICAgcmVzb2x2ZSh7XG4gICAgICAgICAgICAgICAgICAgIHN1Y2Nlc3M6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgIGRhdGE6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHV1aWQ6IHByZWZhYkRhdGEudXVpZCxcbiAgICAgICAgICAgICAgICAgICAgICAgIG5hbWU6IHByZWZhYkRhdGEubmFtZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG1lc3NhZ2U6ICdQcmVmYWIgbG9hZGVkIHN1Y2Nlc3NmdWxseSdcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSkuY2F0Y2goKGVycjogRXJyb3IpID0+IHtcbiAgICAgICAgICAgICAgICByZXNvbHZlKHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiBlcnIubWVzc2FnZSB9KTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGFzeW5jIGluc3RhbnRpYXRlUHJlZmFiKGFyZ3M6IGFueSk6IFByb21pc2U8VG9vbFJlc3BvbnNlPiB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgLy8g6I635Y+W6aKE5Yi25L2T6LWE5rqQ5L+h5oGvXG4gICAgICAgICAgICAgICAgY29uc3QgYXNzZXRJbmZvID0gYXdhaXQgRWRpdG9yLk1lc3NhZ2UucmVxdWVzdCgnYXNzZXQtZGInLCAncXVlcnktYXNzZXQtaW5mbycsIGFyZ3MucHJlZmFiUGF0aCk7XG4gICAgICAgICAgICAgICAgaWYgKCFhc3NldEluZm8pIHtcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCfpooTliLbkvZPmnKrmib7liLAnKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAvLyDkvb/nlKjmraPnoa7nmoQgY3JlYXRlLW5vZGUgQVBJIOS7jumihOWItuS9k+i1hOa6kOWunuS+i+WMllxuICAgICAgICAgICAgICAgIGNvbnN0IGNyZWF0ZU5vZGVPcHRpb25zOiBhbnkgPSB7XG4gICAgICAgICAgICAgICAgICAgIGFzc2V0VXVpZDogYXNzZXRJbmZvLnV1aWRcbiAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAgICAgLy8g6K6+572u54i26IqC54K5XG4gICAgICAgICAgICAgICAgaWYgKGFyZ3MucGFyZW50VXVpZCkge1xuICAgICAgICAgICAgICAgICAgICBjcmVhdGVOb2RlT3B0aW9ucy5wYXJlbnQgPSBhcmdzLnBhcmVudFV1aWQ7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgLy8g6K6+572u6IqC54K55ZCN56ewXG4gICAgICAgICAgICAgICAgaWYgKGFyZ3MubmFtZSkge1xuICAgICAgICAgICAgICAgICAgICBjcmVhdGVOb2RlT3B0aW9ucy5uYW1lID0gYXJncy5uYW1lO1xuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoYXNzZXRJbmZvLm5hbWUpIHtcbiAgICAgICAgICAgICAgICAgICAgY3JlYXRlTm9kZU9wdGlvbnMubmFtZSA9IGFzc2V0SW5mby5uYW1lO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIC8vIOiuvue9ruWIneWni+WxnuaAp++8iOWmguS9jee9ru+8iVxuICAgICAgICAgICAgICAgIGlmIChhcmdzLnBvc2l0aW9uKSB7XG4gICAgICAgICAgICAgICAgICAgIGNyZWF0ZU5vZGVPcHRpb25zLmR1bXAgPSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBwb3NpdGlvbjoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlOiBhcmdzLnBvc2l0aW9uXG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgLy8g5Yib5bu66IqC54K5XG4gICAgICAgICAgICAgICAgY29uc3Qgbm9kZVV1aWQgPSBhd2FpdCBFZGl0b3IuTWVzc2FnZS5yZXF1ZXN0KCdzY2VuZScsICdjcmVhdGUtbm9kZScsIGNyZWF0ZU5vZGVPcHRpb25zKTtcbiAgICAgICAgICAgICAgICBjb25zdCB1dWlkID0gQXJyYXkuaXNBcnJheShub2RlVXVpZCkgPyBub2RlVXVpZFswXSA6IG5vZGVVdWlkO1xuXG4gICAgICAgICAgICAgICAgLy8g5rOo5oSP77yaY3JlYXRlLW5vZGUgQVBJ5LuO6aKE5Yi25L2T6LWE5rqQ5Yib5bu65pe25bqU6K+l6Ieq5Yqo5bu656uL6aKE5Yi25L2T5YWz6IGUXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ+mihOWItuS9k+iKgueCueWIm+W7uuaIkOWKnzonLCB7XG4gICAgICAgICAgICAgICAgICAgIG5vZGVVdWlkOiB1dWlkLFxuICAgICAgICAgICAgICAgICAgICBwcmVmYWJVdWlkOiBhc3NldEluZm8udXVpZCxcbiAgICAgICAgICAgICAgICAgICAgcHJlZmFiUGF0aDogYXJncy5wcmVmYWJQYXRoXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgc3VjY2VzczogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgZGF0YToge1xuICAgICAgICAgICAgICAgICAgICAgICAgbm9kZVV1aWQ6IHV1aWQsXG4gICAgICAgICAgICAgICAgICAgICAgICBwcmVmYWJQYXRoOiBhcmdzLnByZWZhYlBhdGgsXG4gICAgICAgICAgICAgICAgICAgICAgICBwYXJlbnRVdWlkOiBhcmdzLnBhcmVudFV1aWQsXG4gICAgICAgICAgICAgICAgICAgICAgICBwb3NpdGlvbjogYXJncy5wb3NpdGlvbixcbiAgICAgICAgICAgICAgICAgICAgICAgIG1lc3NhZ2U6ICfpooTliLbkvZPlrp7kvovljJbmiJDlip/vvIzlt7Llu7rnq4vpooTliLbkvZPlhbPogZQnXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfSBjYXRjaCAoZXJyOiBhbnkpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICBzdWNjZXNzOiBmYWxzZSxcbiAgICAgICAgICAgICAgICAgICAgZXJyb3I6IGDpooTliLbkvZPlrp7kvovljJblpLHotKU6ICR7ZXJyLm1lc3NhZ2V9YCxcbiAgICAgICAgICAgICAgICAgICAgaW5zdHJ1Y3Rpb246ICfor7fmo4Dmn6XpooTliLbkvZPot6/lvoTmmK/lkKbmraPnoa7vvIznoa7kv53pooTliLbkvZPmlofku7bmoLzlvI/mraPnoa4nXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiDlu7rnq4voioLngrnkuI7pooTliLbkvZPnmoTlhbPogZTlhbPns7tcbiAgICAgKiDov5nkuKrmlrnms5XliJvlu7rlv4XopoHnmoRQcmVmYWJJbmZv5ZKMUHJlZmFiSW5zdGFuY2Xnu5PmnoRcbiAgICAgKi9cbiAgICBwcml2YXRlIGFzeW5jIGVzdGFibGlzaFByZWZhYkNvbm5lY3Rpb24obm9kZVV1aWQ6IHN0cmluZywgcHJlZmFiVXVpZDogc3RyaW5nLCBwcmVmYWJQYXRoOiBzdHJpbmcpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIC8vIOivu+WPlumihOWItuS9k+aWh+S7tuiOt+WPluagueiKgueCueeahGZpbGVJZFxuICAgICAgICAgICAgY29uc3QgcHJlZmFiQ29udGVudCA9IGF3YWl0IHRoaXMucmVhZFByZWZhYkZpbGUocHJlZmFiUGF0aCk7XG4gICAgICAgICAgICBpZiAoIXByZWZhYkNvbnRlbnQgfHwgIXByZWZhYkNvbnRlbnQuZGF0YSB8fCAhcHJlZmFiQ29udGVudC5kYXRhLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcign5peg5rOV6K+75Y+W6aKE5Yi25L2T5paH5Lu25YaF5a65Jyk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIOaJvuWIsOmihOWItuS9k+agueiKgueCueeahGZpbGVJZCAo6YCa5bi45piv56ys5LqM5Liq5a+56LGh77yM5Y2z57Si5byVMSlcbiAgICAgICAgICAgIGNvbnN0IHJvb3ROb2RlID0gcHJlZmFiQ29udGVudC5kYXRhLmZpbmQoKGl0ZW06IGFueSkgPT4gaXRlbS5fX3R5cGUgPT09ICdjYy5Ob2RlJyAmJiBpdGVtLl9wYXJlbnQgPT09IG51bGwpO1xuICAgICAgICAgICAgaWYgKCFyb290Tm9kZSB8fCAhcm9vdE5vZGUuX3ByZWZhYikge1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcign5peg5rOV5om+5Yiw6aKE5Yi25L2T5qC56IqC54K55oiW5YW26aKE5Yi25L2T5L+h5oGvJyk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIOiOt+WPluagueiKgueCueeahFByZWZhYkluZm9cbiAgICAgICAgICAgIGNvbnN0IHJvb3RQcmVmYWJJbmZvID0gcHJlZmFiQ29udGVudC5kYXRhW3Jvb3ROb2RlLl9wcmVmYWIuX19pZF9fXTtcbiAgICAgICAgICAgIGlmICghcm9vdFByZWZhYkluZm8gfHwgcm9vdFByZWZhYkluZm8uX190eXBlICE9PSAnY2MuUHJlZmFiSW5mbycpIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ+aXoOazleaJvuWIsOmihOWItuS9k+agueiKgueCueeahFByZWZhYkluZm8nKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgY29uc3Qgcm9vdEZpbGVJZCA9IHJvb3RQcmVmYWJJbmZvLmZpbGVJZDtcblxuICAgICAgICAgICAgLy8g5L2/55Soc2NlbmUgQVBJ5bu656uL6aKE5Yi25L2T6L+e5o6lXG4gICAgICAgICAgICBjb25zdCBwcmVmYWJDb25uZWN0aW9uRGF0YSA9IHtcbiAgICAgICAgICAgICAgICBub2RlOiBub2RlVXVpZCxcbiAgICAgICAgICAgICAgICBwcmVmYWI6IHByZWZhYlV1aWQsXG4gICAgICAgICAgICAgICAgZmlsZUlkOiByb290RmlsZUlkXG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAvLyDlsJ3or5Xkvb/nlKjlpJrnp41BUEnmlrnms5Xlu7rnq4vpooTliLbkvZPov57mjqVcbiAgICAgICAgICAgIGNvbnN0IGNvbm5lY3Rpb25NZXRob2RzID0gW1xuICAgICAgICAgICAgICAgICgpID0+IEVkaXRvci5NZXNzYWdlLnJlcXVlc3QoJ3NjZW5lJywgJ2Nvbm5lY3QtcHJlZmFiLWluc3RhbmNlJywgcHJlZmFiQ29ubmVjdGlvbkRhdGEpLFxuICAgICAgICAgICAgICAgICgpID0+IEVkaXRvci5NZXNzYWdlLnJlcXVlc3QoJ3NjZW5lJywgJ3NldC1wcmVmYWItY29ubmVjdGlvbicsIHByZWZhYkNvbm5lY3Rpb25EYXRhKSxcbiAgICAgICAgICAgICAgICAoKSA9PiBFZGl0b3IuTWVzc2FnZS5yZXF1ZXN0KCdzY2VuZScsICdhcHBseS1wcmVmYWItbGluaycsIHByZWZhYkNvbm5lY3Rpb25EYXRhKVxuICAgICAgICAgICAgXTtcblxuICAgICAgICAgICAgbGV0IGNvbm5lY3RlZCA9IGZhbHNlO1xuICAgICAgICAgICAgZm9yIChjb25zdCBtZXRob2Qgb2YgY29ubmVjdGlvbk1ldGhvZHMpIHtcbiAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICBhd2FpdCBtZXRob2QoKTtcbiAgICAgICAgICAgICAgICAgICAgY29ubmVjdGVkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS53YXJuKCfpooTliLbkvZPov57mjqXmlrnms5XlpLHotKXvvIzlsJ3or5XkuIvkuIDkuKrmlrnms5U6JywgZXJyb3IpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKCFjb25uZWN0ZWQpIHtcbiAgICAgICAgICAgICAgICAvLyDlpoLmnpzmiYDmnIlBUEnmlrnms5Xpg73lpLHotKXvvIzlsJ3or5XmiYvliqjkv67mlLnlnLrmma/mlbDmja5cbiAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oJ+aJgOaciemihOWItuS9k+i/nuaOpUFQSemDveWksei0pe+8jOWwneivleaJi+WKqOW7uueri+i/nuaOpScpO1xuICAgICAgICAgICAgICAgIGF3YWl0IHRoaXMubWFudWFsbHlFc3RhYmxpc2hQcmVmYWJDb25uZWN0aW9uKG5vZGVVdWlkLCBwcmVmYWJVdWlkLCByb290RmlsZUlkKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcign5bu656uL6aKE5Yi25L2T6L+e5o6l5aSx6LSlOicsIGVycm9yKTtcbiAgICAgICAgICAgIHRocm93IGVycm9yO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICog5omL5Yqo5bu656uL6aKE5Yi25L2T6L+e5o6l77yI5b2TQVBJ5pa55rOV5aSx6LSl5pe255qE5aSH55So5pa55qGI77yJXG4gICAgICovXG4gICAgcHJpdmF0ZSBhc3luYyBtYW51YWxseUVzdGFibGlzaFByZWZhYkNvbm5lY3Rpb24obm9kZVV1aWQ6IHN0cmluZywgcHJlZmFiVXVpZDogc3RyaW5nLCByb290RmlsZUlkOiBzdHJpbmcpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIC8vIOWwneivleS9v+eUqGR1bXAgQVBJ5L+u5pS56IqC54K555qEX3ByZWZhYuWxnuaAp1xuICAgICAgICAgICAgY29uc3QgcHJlZmFiQ29ubmVjdGlvbkRhdGEgPSB7XG4gICAgICAgICAgICAgICAgW25vZGVVdWlkXToge1xuICAgICAgICAgICAgICAgICAgICAnX3ByZWZhYic6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICdfX3V1aWRfXyc6IHByZWZhYlV1aWQsXG4gICAgICAgICAgICAgICAgICAgICAgICAnX19leHBlY3RlZFR5cGVfXyc6ICdjYy5QcmVmYWInLFxuICAgICAgICAgICAgICAgICAgICAgICAgJ2ZpbGVJZCc6IHJvb3RGaWxlSWRcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIGF3YWl0IEVkaXRvci5NZXNzYWdlLnJlcXVlc3QoJ3NjZW5lJywgJ3NldC1wcm9wZXJ0eScsIHtcbiAgICAgICAgICAgICAgICB1dWlkOiBub2RlVXVpZCxcbiAgICAgICAgICAgICAgICBwYXRoOiAnX3ByZWZhYicsXG4gICAgICAgICAgICAgICAgZHVtcDoge1xuICAgICAgICAgICAgICAgICAgICB2YWx1ZToge1xuICAgICAgICAgICAgICAgICAgICAgICAgJ19fdXVpZF9fJzogcHJlZmFiVXVpZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICdfX2V4cGVjdGVkVHlwZV9fJzogJ2NjLlByZWZhYidcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKCfmiYvliqjlu7rnq4vpooTliLbkvZPov57mjqXkuZ/lpLHotKU6JywgZXJyb3IpO1xuICAgICAgICAgICAgLy8g5LiN5oqb5Ye66ZSZ6K+v77yM5Zug5Li65Z+65pys55qE6IqC54K55Yib5bu65bey57uP5oiQ5YqfXG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiDor7vlj5bpooTliLbkvZPmlofku7blhoXlrrlcbiAgICAgKi9cbiAgICBwcml2YXRlIGFzeW5jIHJlYWRQcmVmYWJGaWxlKHByZWZhYlBhdGg6IHN0cmluZyk6IFByb21pc2U8YW55PiB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICAvLyDlsJ3or5Xkvb/nlKhhc3NldC1kYiBBUEnor7vlj5bmlofku7blhoXlrrlcbiAgICAgICAgICAgIGxldCBhc3NldENvbnRlbnQ6IGFueTtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgYXNzZXRDb250ZW50ID0gYXdhaXQgRWRpdG9yLk1lc3NhZ2UucmVxdWVzdCgnYXNzZXQtZGInLCAncXVlcnktYXNzZXQtaW5mbycsIHByZWZhYlBhdGgpO1xuICAgICAgICAgICAgICAgIGlmIChhc3NldENvbnRlbnQgJiYgYXNzZXRDb250ZW50LnNvdXJjZSkge1xuICAgICAgICAgICAgICAgICAgICAvLyDlpoLmnpzmnIlzb3VyY2Xot6/lvoTvvIznm7TmjqXor7vlj5bmlofku7ZcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgZnMgPSByZXF1aXJlKCdmcycpO1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBwYXRoID0gcmVxdWlyZSgncGF0aCcpO1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBmdWxsUGF0aCA9IHBhdGgucmVzb2x2ZShhc3NldENvbnRlbnQuc291cmNlKTtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgZmlsZUNvbnRlbnQgPSBmcy5yZWFkRmlsZVN5bmMoZnVsbFBhdGgsICd1dGY4Jyk7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBKU09OLnBhcnNlKGZpbGVDb250ZW50KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUud2Fybign5L2/55SoYXNzZXQtZGLor7vlj5blpLHotKXvvIzlsJ3or5Xlhbbku5bmlrnms5U6JywgZXJyb3IpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyDlpIfnlKjmlrnms5XvvJrovazmjaJkYjovL+i3r+W+hOS4uuWunumZheaWh+S7tui3r+W+hFxuICAgICAgICAgICAgY29uc3QgZnNQYXRoID0gcHJlZmFiUGF0aC5yZXBsYWNlKCdkYjovL2Fzc2V0cy8nLCAnYXNzZXRzLycpLnJlcGxhY2UoJ2RiOi8vYXNzZXRzJywgJ2Fzc2V0cycpO1xuICAgICAgICAgICAgY29uc3QgZnMgPSByZXF1aXJlKCdmcycpO1xuICAgICAgICAgICAgY29uc3QgcGF0aCA9IHJlcXVpcmUoJ3BhdGgnKTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgLy8g5bCd6K+V5aSa5Liq5Y+v6IO955qE6aG555uu5qC56Lev5b6EXG4gICAgICAgICAgICBjb25zdCBwb3NzaWJsZVBhdGhzID0gW1xuICAgICAgICAgICAgICAgIHBhdGgucmVzb2x2ZShwcm9jZXNzLmN3ZCgpLCBmc1BhdGgpLFxuICAgICAgICAgICAgICAgIHBhdGgucmVzb2x2ZShmc1BhdGgpLFxuICAgICAgICAgICAgXTtcblxuICAgICAgICAgICAgY29uc29sZS5sb2coJ+Wwneivleivu+WPlumihOWItuS9k+aWh+S7tu+8jOi3r+W+hOi9rOaNojonLCB7XG4gICAgICAgICAgICAgICAgb3JpZ2luYWxQYXRoOiBwcmVmYWJQYXRoLFxuICAgICAgICAgICAgICAgIGZzUGF0aDogZnNQYXRoLFxuICAgICAgICAgICAgICAgIHBvc3NpYmxlUGF0aHM6IHBvc3NpYmxlUGF0aHNcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICBmb3IgKGNvbnN0IGZ1bGxQYXRoIG9mIHBvc3NpYmxlUGF0aHMpIHtcbiAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhg5qOA5p+l6Lev5b6EOiAke2Z1bGxQYXRofWApO1xuICAgICAgICAgICAgICAgICAgICBpZiAoZnMuZXhpc3RzU3luYyhmdWxsUGF0aCkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGDmib7liLDmlofku7Y6ICR7ZnVsbFBhdGh9YCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBmaWxlQ29udGVudCA9IGZzLnJlYWRGaWxlU3luYyhmdWxsUGF0aCwgJ3V0ZjgnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHBhcnNlZCA9IEpTT04ucGFyc2UoZmlsZUNvbnRlbnQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ+aWh+S7tuino+aekOaIkOWKn++8jOaVsOaNrue7k+aehDonLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaGFzRGF0YTogISFwYXJzZWQuZGF0YSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRhTGVuZ3RoOiBwYXJzZWQuZGF0YSA/IHBhcnNlZC5kYXRhLmxlbmd0aCA6IDBcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHBhcnNlZDtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGDmlofku7bkuI3lrZjlnKg6ICR7ZnVsbFBhdGh9YCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9IGNhdGNoIChyZWFkRXJyb3IpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS53YXJuKGDor7vlj5bmlofku7blpLHotKUgJHtmdWxsUGF0aH06YCwgcmVhZEVycm9yKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcign5peg5rOV5om+5Yiw5oiW6K+75Y+W6aKE5Yi25L2T5paH5Lu2Jyk7XG4gICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKCfor7vlj5bpooTliLbkvZPmlofku7blpLHotKU6JywgZXJyb3IpO1xuICAgICAgICAgICAgdGhyb3cgZXJyb3I7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcml2YXRlIGFzeW5jIHRyeUNyZWF0ZU5vZGVXaXRoUHJlZmFiKGFyZ3M6IGFueSk6IFByb21pc2U8VG9vbFJlc3BvbnNlPiB7XG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSkgPT4ge1xuICAgICAgICAgICAgRWRpdG9yLk1lc3NhZ2UucmVxdWVzdCgnYXNzZXQtZGInLCAncXVlcnktYXNzZXQtaW5mbycsIGFyZ3MucHJlZmFiUGF0aCkudGhlbigoYXNzZXRJbmZvOiBhbnkpID0+IHtcbiAgICAgICAgICAgICAgICBpZiAoIWFzc2V0SW5mbykge1xuICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ+mihOWItuS9k+acquaJvuWIsCcpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIC8vIOaWueazlTI6IOS9v+eUqCBjcmVhdGUtbm9kZSDmjIflrprpooTliLbkvZPotYTmupBcbiAgICAgICAgICAgICAgICBjb25zdCBjcmVhdGVOb2RlT3B0aW9uczogYW55ID0ge1xuICAgICAgICAgICAgICAgICAgICBhc3NldFV1aWQ6IGFzc2V0SW5mby51dWlkXG4gICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgICAgIC8vIOiuvue9rueItuiKgueCuVxuICAgICAgICAgICAgICAgIGlmIChhcmdzLnBhcmVudFV1aWQpIHtcbiAgICAgICAgICAgICAgICAgICAgY3JlYXRlTm9kZU9wdGlvbnMucGFyZW50ID0gYXJncy5wYXJlbnRVdWlkO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHJldHVybiBFZGl0b3IuTWVzc2FnZS5yZXF1ZXN0KCdzY2VuZScsICdjcmVhdGUtbm9kZScsIGNyZWF0ZU5vZGVPcHRpb25zKTtcbiAgICAgICAgICAgIH0pLnRoZW4oKG5vZGVVdWlkOiBzdHJpbmcgfCBzdHJpbmdbXSkgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnN0IHV1aWQgPSBBcnJheS5pc0FycmF5KG5vZGVVdWlkKSA/IG5vZGVVdWlkWzBdIDogbm9kZVV1aWQ7XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgLy8g5aaC5p6c5oyH5a6a5LqG5L2N572u77yM6K6+572u6IqC54K55L2N572uXG4gICAgICAgICAgICAgICAgaWYgKGFyZ3MucG9zaXRpb24gJiYgdXVpZCkge1xuICAgICAgICAgICAgICAgICAgICBFZGl0b3IuTWVzc2FnZS5yZXF1ZXN0KCdzY2VuZScsICdzZXQtcHJvcGVydHknLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICB1dWlkOiB1dWlkLFxuICAgICAgICAgICAgICAgICAgICAgICAgcGF0aDogJ3Bvc2l0aW9uJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGR1bXA6IHsgdmFsdWU6IGFyZ3MucG9zaXRpb24gfVxuICAgICAgICAgICAgICAgICAgICB9KS50aGVuKCgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc29sdmUoe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN1Y2Nlc3M6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YToge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBub2RlVXVpZDogdXVpZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcHJlZmFiUGF0aDogYXJncy5wcmVmYWJQYXRoLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwb3NpdGlvbjogYXJncy5wb3NpdGlvbixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbWVzc2FnZTogJ+mihOWItuS9k+WunuS+i+WMluaIkOWKn++8iOWkh+eUqOaWueazle+8ieW5tuiuvue9ruS6huS9jee9ridcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgfSkuY2F0Y2goKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZSh7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc3VjY2VzczogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRhOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5vZGVVdWlkOiB1dWlkLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwcmVmYWJQYXRoOiBhcmdzLnByZWZhYlBhdGgsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1lc3NhZ2U6ICfpooTliLbkvZPlrp7kvovljJbmiJDlip/vvIjlpIfnlKjmlrnms5XvvInkvYbkvY3nva7orr7nva7lpLHotKUnXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHJlc29sdmUoe1xuICAgICAgICAgICAgICAgICAgICAgICAgc3VjY2VzczogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGRhdGE6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBub2RlVXVpZDogdXVpZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwcmVmYWJQYXRoOiBhcmdzLnByZWZhYlBhdGgsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbWVzc2FnZTogJ+mihOWItuS9k+WunuS+i+WMluaIkOWKn++8iOWkh+eUqOaWueazle+8iSdcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSkuY2F0Y2goKGVycjogRXJyb3IpID0+IHtcbiAgICAgICAgICAgICAgICByZXNvbHZlKHtcbiAgICAgICAgICAgICAgICAgICAgc3VjY2VzczogZmFsc2UsXG4gICAgICAgICAgICAgICAgICAgIGVycm9yOiBg5aSH55So6aKE5Yi25L2T5a6e5L6L5YyW5pa55rOV5Lmf5aSx6LSlOiAke2Vyci5tZXNzYWdlfWBcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGFzeW5jIHRyeUFsdGVybmF0aXZlSW5zdGFudGlhdGVNZXRob2RzKGFyZ3M6IGFueSk6IFByb21pc2U8VG9vbFJlc3BvbnNlPiB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICAvLyDmlrnms5UxOiDlsJ3or5Xkvb/nlKggY3JlYXRlLW5vZGUg54S25ZCO6K6+572u6aKE5Yi25L2TXG4gICAgICAgICAgICBjb25zdCBhc3NldEluZm8gPSBhd2FpdCB0aGlzLmdldEFzc2V0SW5mbyhhcmdzLnByZWZhYlBhdGgpO1xuICAgICAgICAgICAgaWYgKCFhc3NldEluZm8pIHtcbiAgICAgICAgICAgICAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6ICfml6Dms5Xojrflj5bpooTliLbkvZPkv6Hmga8nIH07XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIOWIm+W7uuepuuiKgueCuVxuICAgICAgICAgICAgY29uc3QgY3JlYXRlUmVzdWx0ID0gYXdhaXQgdGhpcy5jcmVhdGVOb2RlKGFyZ3MucGFyZW50VXVpZCwgYXJncy5wb3NpdGlvbik7XG4gICAgICAgICAgICBpZiAoIWNyZWF0ZVJlc3VsdC5zdWNjZXNzKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGNyZWF0ZVJlc3VsdDtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8g5bCd6K+V5bCG6aKE5Yi25L2T5bqU55So5Yiw6IqC54K5XG4gICAgICAgICAgICBjb25zdCBhcHBseVJlc3VsdCA9IGF3YWl0IHRoaXMuYXBwbHlQcmVmYWJUb05vZGUoY3JlYXRlUmVzdWx0LmRhdGEubm9kZVV1aWQsIGFzc2V0SW5mby51dWlkKTtcbiAgICAgICAgICAgIGlmIChhcHBseVJlc3VsdC5zdWNjZXNzKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgc3VjY2VzczogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgZGF0YToge1xuICAgICAgICAgICAgICAgICAgICAgICAgbm9kZVV1aWQ6IGNyZWF0ZVJlc3VsdC5kYXRhLm5vZGVVdWlkLFxuICAgICAgICAgICAgICAgICAgICAgICAgbmFtZTogY3JlYXRlUmVzdWx0LmRhdGEubmFtZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG1lc3NhZ2U6ICfpooTliLbkvZPlrp7kvovljJbmiJDlip/vvIjkvb/nlKjlpIfpgInmlrnms5XvvIknXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICBzdWNjZXNzOiBmYWxzZSxcbiAgICAgICAgICAgICAgICAgICAgZXJyb3I6ICfml6Dms5XlsIbpooTliLbkvZPlupTnlKjliLDoioLngrknLFxuICAgICAgICAgICAgICAgICAgICBkYXRhOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBub2RlVXVpZDogY3JlYXRlUmVzdWx0LmRhdGEubm9kZVV1aWQsXG4gICAgICAgICAgICAgICAgICAgICAgICBtZXNzYWdlOiAn5bey5Yib5bu66IqC54K577yM5L2G5peg5rOV5bqU55So6aKE5Yi25L2T5pWw5o2uJ1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiBg5aSH6YCJ5a6e5L6L5YyW5pa55rOV5aSx6LSlOiAke2Vycm9yfWAgfTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByaXZhdGUgYXN5bmMgZ2V0QXNzZXRJbmZvKHByZWZhYlBhdGg6IHN0cmluZyk6IFByb21pc2U8YW55PiB7XG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSkgPT4ge1xuICAgICAgICAgICAgRWRpdG9yLk1lc3NhZ2UucmVxdWVzdCgnYXNzZXQtZGInLCAncXVlcnktYXNzZXQtaW5mbycsIHByZWZhYlBhdGgpLnRoZW4oKGFzc2V0SW5mbzogYW55KSA9PiB7XG4gICAgICAgICAgICAgICAgcmVzb2x2ZShhc3NldEluZm8pO1xuICAgICAgICAgICAgfSkuY2F0Y2goKCkgPT4ge1xuICAgICAgICAgICAgICAgIHJlc29sdmUobnVsbCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBhc3luYyBjcmVhdGVOb2RlKHBhcmVudFV1aWQ/OiBzdHJpbmcsIHBvc2l0aW9uPzogYW55KTogUHJvbWlzZTxUb29sUmVzcG9uc2U+IHtcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBjcmVhdGVOb2RlT3B0aW9uczogYW55ID0ge1xuICAgICAgICAgICAgICAgIG5hbWU6ICdQcmVmYWJJbnN0YW5jZSdcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIC8vIOiuvue9rueItuiKgueCuVxuICAgICAgICAgICAgaWYgKHBhcmVudFV1aWQpIHtcbiAgICAgICAgICAgICAgICBjcmVhdGVOb2RlT3B0aW9ucy5wYXJlbnQgPSBwYXJlbnRVdWlkO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyDorr7nva7kvY3nva5cbiAgICAgICAgICAgIGlmIChwb3NpdGlvbikge1xuICAgICAgICAgICAgICAgIGNyZWF0ZU5vZGVPcHRpb25zLmR1bXAgPSB7XG4gICAgICAgICAgICAgICAgICAgIHBvc2l0aW9uOiBwb3NpdGlvblxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIEVkaXRvci5NZXNzYWdlLnJlcXVlc3QoJ3NjZW5lJywgJ2NyZWF0ZS1ub2RlJywgY3JlYXRlTm9kZU9wdGlvbnMpLnRoZW4oKG5vZGVVdWlkOiBzdHJpbmcgfCBzdHJpbmdbXSkgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnN0IHV1aWQgPSBBcnJheS5pc0FycmF5KG5vZGVVdWlkKSA/IG5vZGVVdWlkWzBdIDogbm9kZVV1aWQ7XG4gICAgICAgICAgICAgICAgcmVzb2x2ZSh7XG4gICAgICAgICAgICAgICAgICAgIHN1Y2Nlc3M6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgIGRhdGE6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG5vZGVVdWlkOiB1dWlkLFxuICAgICAgICAgICAgICAgICAgICAgICAgbmFtZTogJ1ByZWZhYkluc3RhbmNlJ1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9KS5jYXRjaCgoZXJyb3I6IGFueSkgPT4ge1xuICAgICAgICAgICAgICAgIHJlc29sdmUoeyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6IGVycm9yLm1lc3NhZ2UgfHwgJ+WIm+W7uuiKgueCueWksei0pScgfSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBhc3luYyBhcHBseVByZWZhYlRvTm9kZShub2RlVXVpZDogc3RyaW5nLCBwcmVmYWJVdWlkOiBzdHJpbmcpOiBQcm9taXNlPFRvb2xSZXNwb25zZT4ge1xuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHtcbiAgICAgICAgICAgIC8vIOWwneivleWkmuenjeaWueazleadpeW6lOeUqOmihOWItuS9k+aVsOaNrlxuICAgICAgICAgICAgY29uc3QgbWV0aG9kcyA9IFtcbiAgICAgICAgICAgICAgICAoKSA9PiBFZGl0b3IuTWVzc2FnZS5yZXF1ZXN0KCdzY2VuZScsICdhcHBseS1wcmVmYWInLCB7IG5vZGU6IG5vZGVVdWlkLCBwcmVmYWI6IHByZWZhYlV1aWQgfSksXG4gICAgICAgICAgICAgICAgKCkgPT4gRWRpdG9yLk1lc3NhZ2UucmVxdWVzdCgnc2NlbmUnLCAnc2V0LXByZWZhYicsIHsgbm9kZTogbm9kZVV1aWQsIHByZWZhYjogcHJlZmFiVXVpZCB9KSxcbiAgICAgICAgICAgICAgICAoKSA9PiBFZGl0b3IuTWVzc2FnZS5yZXF1ZXN0KCdzY2VuZScsICdsb2FkLXByZWZhYi10by1ub2RlJywgeyBub2RlOiBub2RlVXVpZCwgcHJlZmFiOiBwcmVmYWJVdWlkIH0pXG4gICAgICAgICAgICBdO1xuXG4gICAgICAgICAgICBjb25zdCB0cnlNZXRob2QgPSAoaW5kZXg6IG51bWJlcikgPT4ge1xuICAgICAgICAgICAgICAgIGlmIChpbmRleCA+PSBtZXRob2RzLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgICAgICByZXNvbHZlKHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiAn5peg5rOV5bqU55So6aKE5Yi25L2T5pWw5o2uJyB9KTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIG1ldGhvZHNbaW5kZXhdKCkudGhlbigoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHJlc29sdmUoeyBzdWNjZXNzOiB0cnVlIH0pO1xuICAgICAgICAgICAgICAgIH0pLmNhdGNoKCgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgdHJ5TWV0aG9kKGluZGV4ICsgMSk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICB0cnlNZXRob2QoMCk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIOS9v+eUqCBhc3NldC1kYiBBUEkg5Yib5bu66aKE5Yi25L2T55qE5paw5pa55rOVXG4gICAgICog5rex5bqm5pW05ZCI5byV5pOO55qE6LWE5rqQ566h55CG57O757uf77yM5a6e546w5a6M5pW055qE6aKE5Yi25L2T5Yib5bu65rWB56iLXG4gICAgICovXG4gICAgcHJpdmF0ZSBhc3luYyBjcmVhdGVQcmVmYWJXaXRoQXNzZXREQihub2RlVXVpZDogc3RyaW5nLCBzYXZlUGF0aDogc3RyaW5nLCBwcmVmYWJOYW1lOiBzdHJpbmcsIGluY2x1ZGVDaGlsZHJlbjogYm9vbGVhbiwgaW5jbHVkZUNvbXBvbmVudHM6IGJvb2xlYW4pOiBQcm9taXNlPFRvb2xSZXNwb25zZT4ge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCc9PT0g5L2/55SoIEFzc2V0LURCIEFQSSDliJvlu7rpooTliLbkvZMgPT09Jyk7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coYOiKgueCuVVVSUQ6ICR7bm9kZVV1aWR9YCk7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coYOS/neWtmOi3r+W+hDogJHtzYXZlUGF0aH1gKTtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhg6aKE5Yi25L2T5ZCN56ewOiAke3ByZWZhYk5hbWV9YCk7XG5cbiAgICAgICAgICAgICAgICAvLyDnrKzkuIDmraXvvJrojrflj5boioLngrnmlbDmja7vvIjljIXmi6zlj5jmjaLlsZ7mgKfvvIlcbiAgICAgICAgICAgICAgICBjb25zdCBub2RlRGF0YSA9IGF3YWl0IHRoaXMuZ2V0Tm9kZURhdGEobm9kZVV1aWQpO1xuICAgICAgICAgICAgICAgIGlmICghbm9kZURhdGEpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHN1Y2Nlc3M6IGZhbHNlLFxuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3I6ICfml6Dms5Xojrflj5boioLngrnmlbDmja4nXG4gICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ+iOt+WPluWIsOiKgueCueaVsOaNru+8jOWtkOiKgueCueaVsOmHjzonLCBub2RlRGF0YS5jaGlsZHJlbiA/IG5vZGVEYXRhLmNoaWxkcmVuLmxlbmd0aCA6IDApO1xuXG4gICAgICAgICAgICAgICAgLy8g56ys5LqM5q2l77ya5YWI5Yib5bu66LWE5rqQ5paH5Lu25Lul6I635Y+W5byV5pOO5YiG6YWN55qEVVVJRFxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCfliJvlu7rpooTliLbkvZPotYTmupDmlofku7YuLi4nKTtcbiAgICAgICAgICAgICAgICBjb25zdCB0ZW1wUHJlZmFiQ29udGVudCA9IEpTT04uc3RyaW5naWZ5KFt7XCJfX3R5cGVfX1wiOiBcImNjLlByZWZhYlwiLCBcIl9uYW1lXCI6IHByZWZhYk5hbWV9XSwgbnVsbCwgMik7XG4gICAgICAgICAgICAgICAgY29uc3QgY3JlYXRlUmVzdWx0ID0gYXdhaXQgdGhpcy5jcmVhdGVBc3NldFdpdGhBc3NldERCKHNhdmVQYXRoLCB0ZW1wUHJlZmFiQ29udGVudCk7XG4gICAgICAgICAgICAgICAgaWYgKCFjcmVhdGVSZXN1bHQuc3VjY2Vzcykge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gY3JlYXRlUmVzdWx0O1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIC8vIOiOt+WPluW8leaTjuWIhumFjeeahOWunumZhVVVSURcbiAgICAgICAgICAgICAgICBjb25zdCBhY3R1YWxQcmVmYWJVdWlkID0gY3JlYXRlUmVzdWx0LmRhdGE/LnV1aWQ7XG4gICAgICAgICAgICAgICAgaWYgKCFhY3R1YWxQcmVmYWJVdWlkKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzdWNjZXNzOiBmYWxzZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yOiAn5peg5rOV6I635Y+W5byV5pOO5YiG6YWN55qE6aKE5Yi25L2TVVVJRCdcbiAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ+W8leaTjuWIhumFjeeahFVVSUQ6JywgYWN0dWFsUHJlZmFiVXVpZCk7XG5cbiAgICAgICAgICAgICAgICAvLyDnrKzkuInmraXvvJrkvb/nlKjlrp7pmYVVVUlE6YeN5paw55Sf5oiQ6aKE5Yi25L2T5YaF5a65XG4gICAgICAgICAgICAgICAgY29uc3QgcHJlZmFiQ29udGVudCA9IGF3YWl0IHRoaXMuY3JlYXRlU3RhbmRhcmRQcmVmYWJDb250ZW50KG5vZGVEYXRhLCBwcmVmYWJOYW1lLCBhY3R1YWxQcmVmYWJVdWlkLCBpbmNsdWRlQ2hpbGRyZW4sIGluY2x1ZGVDb21wb25lbnRzKTtcbiAgICAgICAgICAgICAgICBjb25zdCBwcmVmYWJDb250ZW50U3RyaW5nID0gSlNPTi5zdHJpbmdpZnkocHJlZmFiQ29udGVudCwgbnVsbCwgMik7XG5cbiAgICAgICAgICAgICAgICAvLyDnrKzlm5vmraXvvJrmm7TmlrDpooTliLbkvZPmlofku7blhoXlrrlcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygn5pu05paw6aKE5Yi25L2T5paH5Lu25YaF5a65Li4uJyk7XG4gICAgICAgICAgICAgICAgY29uc3QgdXBkYXRlUmVzdWx0ID0gYXdhaXQgdGhpcy51cGRhdGVBc3NldFdpdGhBc3NldERCKHNhdmVQYXRoLCBwcmVmYWJDb250ZW50U3RyaW5nKTtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAvLyDnrKzkupTmraXvvJrliJvlu7rlr7nlupTnmoRtZXRh5paH5Lu277yI5L2/55So5a6e6ZmFVVVJRO+8iVxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCfliJvlu7rpooTliLbkvZNtZXRh5paH5Lu2Li4uJyk7XG4gICAgICAgICAgICAgICAgY29uc3QgbWV0YUNvbnRlbnQgPSB0aGlzLmNyZWF0ZVN0YW5kYXJkTWV0YUNvbnRlbnQocHJlZmFiTmFtZSwgYWN0dWFsUHJlZmFiVXVpZCk7XG4gICAgICAgICAgICAgICAgY29uc3QgbWV0YVJlc3VsdCA9IGF3YWl0IHRoaXMuY3JlYXRlTWV0YVdpdGhBc3NldERCKHNhdmVQYXRoLCBtZXRhQ29udGVudCk7XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgLy8g56ys5YWt5q2l77ya6YeN5paw5a+85YWl6LWE5rqQ5Lul5pu05paw5byV55SoXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ+mHjeaWsOWvvOWFpemihOWItuS9k+i1hOa6kC4uLicpO1xuICAgICAgICAgICAgICAgIGNvbnN0IHJlaW1wb3J0UmVzdWx0ID0gYXdhaXQgdGhpcy5yZWltcG9ydEFzc2V0V2l0aEFzc2V0REIoc2F2ZVBhdGgpO1xuXG4gICAgICAgICAgICAgICAgLy8g56ys5LiD5q2l77ya5bCd6K+V5bCG5Y6f5aeL6IqC54K56L2s5o2i5Li66aKE5Yi25L2T5a6e5L6LXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ+WwneivleWwhuWOn+Wni+iKgueCuei9rOaNouS4uumihOWItuS9k+WunuS+iy4uLicpO1xuICAgICAgICAgICAgICAgIGNvbnN0IGNvbnZlcnRSZXN1bHQgPSBhd2FpdCB0aGlzLmNvbnZlcnROb2RlVG9QcmVmYWJJbnN0YW5jZShub2RlVXVpZCwgYWN0dWFsUHJlZmFiVXVpZCwgc2F2ZVBhdGgpO1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgIHN1Y2Nlc3M6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgIGRhdGE6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHByZWZhYlV1aWQ6IGFjdHVhbFByZWZhYlV1aWQsXG4gICAgICAgICAgICAgICAgICAgICAgICBwcmVmYWJQYXRoOiBzYXZlUGF0aCxcbiAgICAgICAgICAgICAgICAgICAgICAgIG5vZGVVdWlkOiBub2RlVXVpZCxcbiAgICAgICAgICAgICAgICAgICAgICAgIHByZWZhYk5hbWU6IHByZWZhYk5hbWUsXG4gICAgICAgICAgICAgICAgICAgICAgICBjb252ZXJ0ZWRUb1ByZWZhYkluc3RhbmNlOiBjb252ZXJ0UmVzdWx0LnN1Y2Nlc3MsXG4gICAgICAgICAgICAgICAgICAgICAgICBjcmVhdGVBc3NldFJlc3VsdDogY3JlYXRlUmVzdWx0LFxuICAgICAgICAgICAgICAgICAgICAgICAgdXBkYXRlUmVzdWx0OiB1cGRhdGVSZXN1bHQsXG4gICAgICAgICAgICAgICAgICAgICAgICBtZXRhUmVzdWx0OiBtZXRhUmVzdWx0LFxuICAgICAgICAgICAgICAgICAgICAgICAgcmVpbXBvcnRSZXN1bHQ6IHJlaW1wb3J0UmVzdWx0LFxuICAgICAgICAgICAgICAgICAgICAgICAgY29udmVydFJlc3VsdDogY29udmVydFJlc3VsdCxcbiAgICAgICAgICAgICAgICAgICAgICAgIG1lc3NhZ2U6IGNvbnZlcnRSZXN1bHQuc3VjY2VzcyA/ICfpooTliLbkvZPliJvlu7rlubbmiJDlip/ovazmjaLljp/lp4voioLngrknIDogJ+mihOWItuS9k+WIm+W7uuaIkOWKn++8jOS9huiKgueCuei9rOaNouWksei0pSdcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcign5Yib5bu66aKE5Yi25L2T5pe25Y+R55Sf6ZSZ6K+vOicsIGVycm9yKTtcbiAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICBzdWNjZXNzOiBmYWxzZSxcbiAgICAgICAgICAgICAgICAgICAgZXJyb3I6IGDliJvlu7rpooTliLbkvZPlpLHotKU6ICR7ZXJyb3J9YFxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBhc3luYyBjcmVhdGVQcmVmYWIoYXJnczogYW55KTogUHJvbWlzZTxUb29sUmVzcG9uc2U+IHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIC8vIOaUr+aMgSBwcmVmYWJQYXRoIOWSjCBzYXZlUGF0aCDkuKTnp43lj4LmlbDlkI1cbiAgICAgICAgICAgIGNvbnN0IHBhdGhQYXJhbSA9IGFyZ3MucHJlZmFiUGF0aCB8fCBhcmdzLnNhdmVQYXRoO1xuICAgICAgICAgICAgaWYgKCFwYXRoUGFyYW0pIHtcbiAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICBzdWNjZXNzOiBmYWxzZSxcbiAgICAgICAgICAgICAgICAgICAgZXJyb3I6ICfnvLrlsJHpooTliLbkvZPot6/lvoTlj4LmlbDjgILor7fmj5DkvpsgcHJlZmFiUGF0aCDmiJYgc2F2ZVBhdGjjgIInXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgY29uc3QgcHJlZmFiTmFtZSA9IGFyZ3MucHJlZmFiTmFtZSB8fCAnTmV3UHJlZmFiJztcbiAgICAgICAgICAgIGNvbnN0IGZ1bGxQYXRoID0gcGF0aFBhcmFtLmVuZHNXaXRoKCcucHJlZmFiJykgP1xuICAgICAgICAgICAgICAgIHBhdGhQYXJhbSA6IGAke3BhdGhQYXJhbX0vJHtwcmVmYWJOYW1lfS5wcmVmYWJgO1xuXG4gICAgICAgICAgICBjb25zdCBpbmNsdWRlQ2hpbGRyZW4gPSBhcmdzLmluY2x1ZGVDaGlsZHJlbiAhPT0gZmFsc2U7IC8vIOm7mOiupOS4uiB0cnVlXG4gICAgICAgICAgICBjb25zdCBpbmNsdWRlQ29tcG9uZW50cyA9IGFyZ3MuaW5jbHVkZUNvbXBvbmVudHMgIT09IGZhbHNlOyAvLyDpu5jorqTkuLogdHJ1ZVxuXG4gICAgICAgICAgICAvLyDkvJjlhYjkvb/nlKjmlrDnmoQgYXNzZXQtZGIg5pa55rOV5Yib5bu66aKE5Yi25L2TXG4gICAgICAgICAgICBjb25zb2xlLmxvZygn5L2/55So5paw55qEIGFzc2V0LWRiIOaWueazleWIm+W7uumihOWItuS9ky4uLicpO1xuICAgICAgICAgICAgY29uc3QgYXNzZXREYlJlc3VsdCA9IGF3YWl0IHRoaXMuY3JlYXRlUHJlZmFiV2l0aEFzc2V0REIoXG4gICAgICAgICAgICAgICAgYXJncy5ub2RlVXVpZCxcbiAgICAgICAgICAgICAgICBmdWxsUGF0aCxcbiAgICAgICAgICAgICAgICBwcmVmYWJOYW1lLFxuICAgICAgICAgICAgICAgIGluY2x1ZGVDaGlsZHJlbixcbiAgICAgICAgICAgICAgICBpbmNsdWRlQ29tcG9uZW50c1xuICAgICAgICAgICAgKTtcblxuICAgICAgICAgICAgaWYgKGFzc2V0RGJSZXN1bHQuc3VjY2Vzcykge1xuICAgICAgICAgICAgICAgIHJldHVybiBhc3NldERiUmVzdWx0O1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyDlpoLmnpwgYXNzZXQtZGIg5pa55rOV5aSx6LSl77yM5bCd6K+V5L2/55SoQ29jb3MgQ3JlYXRvcueahOWOn+eUn+mihOWItuS9k+WIm+W7ukFQSVxuICAgICAgICAgICAgY29uc29sZS5sb2coJ2Fzc2V0LWRiIOaWueazleWksei0pe+8jOWwneivleWOn+eUn0FQSS4uLicpO1xuICAgICAgICAgICAgY29uc3QgbmF0aXZlUmVzdWx0ID0gYXdhaXQgdGhpcy5jcmVhdGVQcmVmYWJOYXRpdmUoYXJncy5ub2RlVXVpZCwgZnVsbFBhdGgpO1xuICAgICAgICAgICAgaWYgKG5hdGl2ZVJlc3VsdC5zdWNjZXNzKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG5hdGl2ZVJlc3VsdDtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8g5aaC5p6c5Y6f55SfQVBJ5aSx6LSl77yM5L2/55So6Ieq5a6a5LmJ5a6e546wXG4gICAgICAgICAgICBjb25zb2xlLmxvZygn5Y6f55SfQVBJ5aSx6LSl77yM5L2/55So6Ieq5a6a5LmJ5a6e546wLi4uJyk7XG4gICAgICAgICAgICBjb25zdCBjdXN0b21SZXN1bHQgPSBhd2FpdCB0aGlzLmNyZWF0ZVByZWZhYkN1c3RvbShhcmdzLm5vZGVVdWlkLCBmdWxsUGF0aCwgcHJlZmFiTmFtZSk7XG4gICAgICAgICAgICByZXR1cm4gY3VzdG9tUmVzdWx0O1xuXG4gICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIHN1Y2Nlc3M6IGZhbHNlLFxuICAgICAgICAgICAgICAgIGVycm9yOiBg5Yib5bu66aKE5Yi25L2T5pe25Y+R55Sf6ZSZ6K+vOiAke2Vycm9yfWBcbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcml2YXRlIGFzeW5jIGNyZWF0ZVByZWZhYk5hdGl2ZShub2RlVXVpZDogc3RyaW5nLCBwcmVmYWJQYXRoOiBzdHJpbmcpOiBQcm9taXNlPFRvb2xSZXNwb25zZT4ge1xuICAgICAgICAvLyDmoLnmja7lrpjmlrlBUEnmlofmoaPvvIzkuI3lrZjlnKjnm7TmjqXnmoTpooTliLbkvZPliJvlu7pBUElcbiAgICAgICAgLy8g6aKE5Yi25L2T5Yib5bu66ZyA6KaB5omL5Yqo5Zyo57yW6L6R5Zmo5Lit5a6M5oiQXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBzdWNjZXNzOiBmYWxzZSxcbiAgICAgICAgICAgIGVycm9yOiAn5Y6f55Sf6aKE5Yi25L2T5Yib5bu6QVBJ5LiN5a2Y5ZyoJyxcbiAgICAgICAgICAgIGluc3RydWN0aW9uOiAn5qC55o2uQ29jb3MgQ3JlYXRvcuWumOaWuUFQSeaWh+aho++8jOmihOWItuS9k+WIm+W7uumcgOimgeaJi+WKqOaTjeS9nO+8mlxcbjEuIOWcqOWcuuaZr+S4remAieaLqeiKgueCuVxcbjIuIOWwhuiKgueCueaLluaLveWIsOi1hOa6kOeuoeeQhuWZqOS4rVxcbjMuIOaIluWPs+mUruiKgueCuemAieaLqVwi55Sf5oiQ6aKE5Yi25L2TXCInXG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBhc3luYyBjcmVhdGVQcmVmYWJDdXN0b20obm9kZVV1aWQ6IHN0cmluZywgcHJlZmFiUGF0aDogc3RyaW5nLCBwcmVmYWJOYW1lOiBzdHJpbmcpOiBQcm9taXNlPFRvb2xSZXNwb25zZT4ge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgLy8gMS4g6I635Y+W5rqQ6IqC54K555qE5a6M5pW05pWw5o2uXG4gICAgICAgICAgICBjb25zdCBub2RlRGF0YSA9IGF3YWl0IHRoaXMuZ2V0Tm9kZURhdGEobm9kZVV1aWQpO1xuICAgICAgICAgICAgaWYgKCFub2RlRGF0YSkge1xuICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgIHN1Y2Nlc3M6IGZhbHNlLFxuICAgICAgICAgICAgICAgICAgICBlcnJvcjogYOaXoOazleaJvuWIsOiKgueCuTogJHtub2RlVXVpZH1gXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gMi4g55Sf5oiQ6aKE5Yi25L2TVVVJRFxuICAgICAgICAgICAgY29uc3QgcHJlZmFiVXVpZCA9IHRoaXMuZ2VuZXJhdGVVVUlEKCk7XG5cbiAgICAgICAgICAgIC8vIDMuIOWIm+W7uumihOWItuS9k+aVsOaNrue7k+aehFxuICAgICAgICAgICAgY29uc3QgcHJlZmFiRGF0YSA9IHRoaXMuY3JlYXRlUHJlZmFiRGF0YShub2RlRGF0YSwgcHJlZmFiTmFtZSwgcHJlZmFiVXVpZCk7XG5cbiAgICAgICAgICAgIC8vIDQuIOWfuuS6juWumOaWueagvOW8j+WIm+W7uumihOWItuS9k+aVsOaNrue7k+aehFxuICAgICAgICAgICAgY29uc29sZS5sb2coJz09PSDlvIDlp4vliJvlu7rpooTliLbkvZMgPT09Jyk7XG4gICAgICAgICAgICBjb25zb2xlLmxvZygn6IqC54K55ZCN56ewOicsIG5vZGVEYXRhLm5hbWU/LnZhbHVlIHx8ICfmnKrnn6UnKTtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCfoioLngrlVVUlEOicsIG5vZGVEYXRhLnV1aWQ/LnZhbHVlIHx8ICfmnKrnn6UnKTtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCfpooTliLbkvZPkv53lrZjot6/lvoQ6JywgcHJlZmFiUGF0aCk7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhg5byA5aeL5Yib5bu66aKE5Yi25L2T77yM6IqC54K55pWw5o2uOmAsIG5vZGVEYXRhKTtcbiAgICAgICAgICAgIGNvbnN0IHByZWZhYkpzb25EYXRhID0gYXdhaXQgdGhpcy5jcmVhdGVTdGFuZGFyZFByZWZhYkNvbnRlbnQobm9kZURhdGEsIHByZWZhYk5hbWUsIHByZWZhYlV1aWQsIHRydWUsIHRydWUpO1xuXG4gICAgICAgICAgICAvLyA1LiDliJvlu7rmoIflh4ZtZXRh5paH5Lu25pWw5o2uXG4gICAgICAgICAgICBjb25zdCBzdGFuZGFyZE1ldGFEYXRhID0gdGhpcy5jcmVhdGVTdGFuZGFyZE1ldGFEYXRhKHByZWZhYk5hbWUsIHByZWZhYlV1aWQpO1xuXG4gICAgICAgICAgICAvLyA2LiDkv53lrZjpooTliLbkvZPlkoxtZXRh5paH5Lu2XG4gICAgICAgICAgICBjb25zdCBzYXZlUmVzdWx0ID0gYXdhaXQgdGhpcy5zYXZlUHJlZmFiV2l0aE1ldGEocHJlZmFiUGF0aCwgcHJlZmFiSnNvbkRhdGEsIHN0YW5kYXJkTWV0YURhdGEpO1xuXG4gICAgICAgICAgICBpZiAoc2F2ZVJlc3VsdC5zdWNjZXNzKSB7XG4gICAgICAgICAgICAgICAgLy8g5L+d5a2Y5oiQ5Yqf5ZCO77yM5bCG5Y6f5aeL6IqC54K56L2s5o2i5Li66aKE5Yi25L2T5a6e5L6LXG4gICAgICAgICAgICAgICAgY29uc3QgY29udmVydFJlc3VsdCA9IGF3YWl0IHRoaXMuY29udmVydE5vZGVUb1ByZWZhYkluc3RhbmNlKG5vZGVVdWlkLCBwcmVmYWJQYXRoLCBwcmVmYWJVdWlkKTtcblxuICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgIHN1Y2Nlc3M6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgIGRhdGE6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHByZWZhYlV1aWQ6IHByZWZhYlV1aWQsXG4gICAgICAgICAgICAgICAgICAgICAgICBwcmVmYWJQYXRoOiBwcmVmYWJQYXRoLFxuICAgICAgICAgICAgICAgICAgICAgICAgbm9kZVV1aWQ6IG5vZGVVdWlkLFxuICAgICAgICAgICAgICAgICAgICAgICAgcHJlZmFiTmFtZTogcHJlZmFiTmFtZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnZlcnRlZFRvUHJlZmFiSW5zdGFuY2U6IGNvbnZlcnRSZXN1bHQuc3VjY2VzcyxcbiAgICAgICAgICAgICAgICAgICAgICAgIG1lc3NhZ2U6IGNvbnZlcnRSZXN1bHQuc3VjY2VzcyA/XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJ+iHquWumuS5iemihOWItuS9k+WIm+W7uuaIkOWKn++8jOWOn+Wni+iKgueCueW3sui9rOaNouS4uumihOWItuS9k+WunuS+iycgOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICfpooTliLbkvZPliJvlu7rmiJDlip/vvIzkvYboioLngrnovazmjaLlpLHotKUnXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICBzdWNjZXNzOiBmYWxzZSxcbiAgICAgICAgICAgICAgICAgICAgZXJyb3I6IHNhdmVSZXN1bHQuZXJyb3IgfHwgJ+S/neWtmOmihOWItuS9k+aWh+S7tuWksei0pSdcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfVxuXG4gICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIHN1Y2Nlc3M6IGZhbHNlLFxuICAgICAgICAgICAgICAgIGVycm9yOiBg5Yib5bu66aKE5Yi25L2T5pe25Y+R55Sf6ZSZ6K+vOiAke2Vycm9yfWBcbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcml2YXRlIGFzeW5jIGdldE5vZGVEYXRhKG5vZGVVdWlkOiBzdHJpbmcpOiBQcm9taXNlPGFueT4ge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgLy8g6aaW5YWI6I635Y+W5Z+65pys6IqC54K55L+h5oGvXG4gICAgICAgICAgICBjb25zdCBub2RlSW5mbyA9IGF3YWl0IEVkaXRvci5NZXNzYWdlLnJlcXVlc3QoJ3NjZW5lJywgJ3F1ZXJ5LW5vZGUnLCBub2RlVXVpZCk7XG4gICAgICAgICAgICBpZiAoIW5vZGVJbmZvKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGDojrflj5boioLngrkgJHtub2RlVXVpZH0g55qE5Z+65pys5L+h5oGv5oiQ5YqfYCk7XG5cbiAgICAgICAgICAgIC8vIOS9v+eUqHF1ZXJ5LW5vZGUtdHJlZeiOt+WPluWMheWQq+WtkOiKgueCueeahOWujOaVtOe7k+aehFxuICAgICAgICAgICAgY29uc3Qgbm9kZVRyZWUgPSBhd2FpdCB0aGlzLmdldE5vZGVXaXRoQ2hpbGRyZW4obm9kZVV1aWQpO1xuICAgICAgICAgICAgaWYgKG5vZGVUcmVlKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coYOiOt+WPluiKgueCuSAke25vZGVVdWlkfSDnmoTlrozmlbTmoJHnu5PmnoTmiJDlip9gKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gbm9kZVRyZWU7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGDkvb/nlKjln7rmnKzoioLngrnkv6Hmga9gKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gbm9kZUluZm87XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICBjb25zb2xlLndhcm4oYOiOt+WPluiKgueCueaVsOaNruWksei0pSAke25vZGVVdWlkfTpgLCBlcnJvcik7XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8vIOS9v+eUqHF1ZXJ5LW5vZGUtdHJlZeiOt+WPluWMheWQq+WtkOiKgueCueeahOWujOaVtOiKgueCuee7k+aehFxuICAgIHByaXZhdGUgYXN5bmMgZ2V0Tm9kZVdpdGhDaGlsZHJlbihub2RlVXVpZDogc3RyaW5nKTogUHJvbWlzZTxhbnk+IHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIC8vIOiOt+WPluaVtOS4quWcuuaZr+agkVxuICAgICAgICAgICAgY29uc3QgdHJlZSA9IGF3YWl0IEVkaXRvci5NZXNzYWdlLnJlcXVlc3QoJ3NjZW5lJywgJ3F1ZXJ5LW5vZGUtdHJlZScpO1xuICAgICAgICAgICAgaWYgKCF0cmVlKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIOWcqOagkeS4reafpeaJvuaMh+WumueahOiKgueCuVxuICAgICAgICAgICAgY29uc3QgdGFyZ2V0Tm9kZSA9IHRoaXMuZmluZE5vZGVJblRyZWUodHJlZSwgbm9kZVV1aWQpO1xuICAgICAgICAgICAgaWYgKHRhcmdldE5vZGUpIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhg5Zyo5Zy65pmv5qCR5Lit5om+5Yiw6IqC54K5ICR7bm9kZVV1aWR977yM5a2Q6IqC54K55pWw6YePOiAke3RhcmdldE5vZGUuY2hpbGRyZW4gPyB0YXJnZXROb2RlLmNoaWxkcmVuLmxlbmd0aCA6IDB9YCk7XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgLy8g5aKe5by66IqC54K55qCR77yM6I635Y+W5q+P5Liq6IqC54K555qE5q2j56Gu57uE5Lu25L+h5oGvXG4gICAgICAgICAgICAgICAgY29uc3QgZW5oYW5jZWRUcmVlID0gYXdhaXQgdGhpcy5lbmhhbmNlVHJlZVdpdGhNQ1BDb21wb25lbnRzKHRhcmdldE5vZGUpO1xuICAgICAgICAgICAgICAgIHJldHVybiBlbmhhbmNlZFRyZWU7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgY29uc29sZS53YXJuKGDojrflj5boioLngrnmoJHnu5PmnoTlpLHotKUgJHtub2RlVXVpZH06YCwgZXJyb3IpO1xuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvLyDlnKjoioLngrnmoJHkuK3pgJLlvZLmn6Xmib7mjIflrppVVUlE55qE6IqC54K5XG4gICAgcHJpdmF0ZSBmaW5kTm9kZUluVHJlZShub2RlOiBhbnksIHRhcmdldFV1aWQ6IHN0cmluZyk6IGFueSB7XG4gICAgICAgIGlmICghbm9kZSkgcmV0dXJuIG51bGw7XG4gICAgICAgIFxuICAgICAgICAvLyDmo4Dmn6XlvZPliY3oioLngrlcbiAgICAgICAgaWYgKG5vZGUudXVpZCA9PT0gdGFyZ2V0VXVpZCB8fCBub2RlLnZhbHVlPy51dWlkID09PSB0YXJnZXRVdWlkKSB7XG4gICAgICAgICAgICByZXR1cm4gbm9kZTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIOmAkuW9kuajgOafpeWtkOiKgueCuVxuICAgICAgICBpZiAobm9kZS5jaGlsZHJlbiAmJiBBcnJheS5pc0FycmF5KG5vZGUuY2hpbGRyZW4pKSB7XG4gICAgICAgICAgICBmb3IgKGNvbnN0IGNoaWxkIG9mIG5vZGUuY2hpbGRyZW4pIHtcbiAgICAgICAgICAgICAgICBjb25zdCBmb3VuZCA9IHRoaXMuZmluZE5vZGVJblRyZWUoY2hpbGQsIHRhcmdldFV1aWQpO1xuICAgICAgICAgICAgICAgIGlmIChmb3VuZCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZm91bmQ7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICog5L2/55SoTUNQ5o6l5Y+j5aKe5by66IqC54K55qCR77yM6I635Y+W5q2j56Gu55qE57uE5Lu25L+h5oGvXG4gICAgICovXG4gICAgcHJpdmF0ZSBhc3luYyBlbmhhbmNlVHJlZVdpdGhNQ1BDb21wb25lbnRzKG5vZGU6IGFueSk6IFByb21pc2U8YW55PiB7XG4gICAgICAgIGlmICghbm9kZSB8fCAhbm9kZS51dWlkKSB7XG4gICAgICAgICAgICByZXR1cm4gbm9kZTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICAvLyDkvb/nlKhNQ1DmjqXlj6Pojrflj5boioLngrnnmoTnu4Tku7bkv6Hmga9cbiAgICAgICAgICAgIGxldCBwb3J0ID0gODU4NTtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgY29uc3QgeyByZWFkU2V0dGluZ3MgfSA9IHJlcXVpcmUoJy4uLy4uL2NvcmUvc2V0dGluZ3MnKTtcbiAgICAgICAgICAgICAgICBwb3J0ID0gcmVhZFNldHRpbmdzKCkucG9ydCA/PyA4NTg1O1xuICAgICAgICAgICAgfSBjYXRjaCAoXykge1xuICAgICAgICAgICAgICAgIC8vIGZhbGxiYWNrIHRvIGRlZmF1bHRcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgZmV0Y2goYGh0dHA6Ly9sb2NhbGhvc3Q6JHtwb3J0fS9tY3BgLCB7XG4gICAgICAgICAgICAgICAgbWV0aG9kOiAnUE9TVCcsXG4gICAgICAgICAgICAgICAgaGVhZGVyczogeyAnQ29udGVudC1UeXBlJzogJ2FwcGxpY2F0aW9uL2pzb24nIH0sXG4gICAgICAgICAgICAgICAgYm9keTogSlNPTi5zdHJpbmdpZnkoe1xuICAgICAgICAgICAgICAgICAgICBcImpzb25ycGNcIjogXCIyLjBcIixcbiAgICAgICAgICAgICAgICAgICAgXCJtZXRob2RcIjogXCJ0b29scy9jYWxsXCIsXG4gICAgICAgICAgICAgICAgICAgIFwicGFyYW1zXCI6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIFwibmFtZVwiOiBcImNvbXBvbmVudF9nZXRfY29tcG9uZW50c1wiLFxuICAgICAgICAgICAgICAgICAgICAgICAgXCJhcmd1bWVudHNcIjoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwibm9kZVV1aWRcIjogbm9kZS51dWlkXG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIFwiaWRcIjogRGF0ZS5ub3coKVxuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgY29uc3QgbWNwUmVzdWx0ID0gYXdhaXQgcmVzcG9uc2UuanNvbigpO1xuICAgICAgICAgICAgaWYgKG1jcFJlc3VsdC5yZXN1bHQ/LmNvbnRlbnQ/LlswXT8udGV4dCkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGNvbXBvbmVudERhdGEgPSBKU09OLnBhcnNlKG1jcFJlc3VsdC5yZXN1bHQuY29udGVudFswXS50ZXh0KTtcbiAgICAgICAgICAgICAgICBpZiAoY29tcG9uZW50RGF0YS5zdWNjZXNzICYmIGNvbXBvbmVudERhdGEuZGF0YS5jb21wb25lbnRzKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIOabtOaWsOiKgueCueeahOe7hOS7tuS/oeaBr+S4uk1DUOi/lOWbnueahOato+ehruaVsOaNrlxuICAgICAgICAgICAgICAgICAgICBub2RlLmNvbXBvbmVudHMgPSBjb21wb25lbnREYXRhLmRhdGEuY29tcG9uZW50cztcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coYOiKgueCuSAke25vZGUudXVpZH0g6I635Y+W5YiwICR7Y29tcG9uZW50RGF0YS5kYXRhLmNvbXBvbmVudHMubGVuZ3RofSDkuKrnu4Tku7bvvIzljIXlkKvohJrmnKznu4Tku7bnmoTmraPnoa7nsbvlnotgKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICBjb25zb2xlLndhcm4oYOiOt+WPluiKgueCuSAke25vZGUudXVpZH0g55qETUNQ57uE5Lu25L+h5oGv5aSx6LSlOmAsIGVycm9yKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIOmAkuW9kuWkhOeQhuWtkOiKgueCuVxuICAgICAgICBpZiAobm9kZS5jaGlsZHJlbiAmJiBBcnJheS5pc0FycmF5KG5vZGUuY2hpbGRyZW4pKSB7XG4gICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IG5vZGUuY2hpbGRyZW4ubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICBub2RlLmNoaWxkcmVuW2ldID0gYXdhaXQgdGhpcy5lbmhhbmNlVHJlZVdpdGhNQ1BDb21wb25lbnRzKG5vZGUuY2hpbGRyZW5baV0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIG5vZGU7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBhc3luYyBidWlsZEJhc2ljTm9kZUluZm8obm9kZVV1aWQ6IHN0cmluZyk6IFByb21pc2U8YW55PiB7XG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSkgPT4ge1xuICAgICAgICAgICAgLy8g5p6E5bu65Z+65pys55qE6IqC54K55L+h5oGvXG4gICAgICAgICAgICBFZGl0b3IuTWVzc2FnZS5yZXF1ZXN0KCdzY2VuZScsICdxdWVyeS1ub2RlJywgbm9kZVV1aWQpLnRoZW4oKG5vZGVJbmZvOiBhbnkpID0+IHtcbiAgICAgICAgICAgICAgICBpZiAoIW5vZGVJbmZvKSB7XG4gICAgICAgICAgICAgICAgICAgIHJlc29sdmUobnVsbCk7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAvLyDnroDljJbniYjmnKzvvJrlj6rov5Tlm57ln7rmnKzoioLngrnkv6Hmga/vvIzkuI3ojrflj5blrZDoioLngrnlkoznu4Tku7ZcbiAgICAgICAgICAgICAgICAvLyDov5nkupvkv6Hmga/lsIblnKjlkI7nu63nmoTpooTliLbkvZPlpITnkIbkuK3moLnmja7pnIDopoHmt7vliqBcbiAgICAgICAgICAgICAgICBjb25zdCBiYXNpY0luZm8gPSB7XG4gICAgICAgICAgICAgICAgICAgIC4uLm5vZGVJbmZvLFxuICAgICAgICAgICAgICAgICAgICBjaGlsZHJlbjogW10sXG4gICAgICAgICAgICAgICAgICAgIGNvbXBvbmVudHM6IFtdXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICByZXNvbHZlKGJhc2ljSW5mbyk7XG4gICAgICAgICAgICB9KS5jYXRjaCgoKSA9PiB7XG4gICAgICAgICAgICAgICAgcmVzb2x2ZShudWxsKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICAvLyDpqozor4HoioLngrnmlbDmja7mmK/lkKbmnInmlYhcbiAgICBwcml2YXRlIGlzVmFsaWROb2RlRGF0YShub2RlRGF0YTogYW55KTogYm9vbGVhbiB7XG4gICAgICAgIGlmICghbm9kZURhdGEpIHJldHVybiBmYWxzZTtcbiAgICAgICAgaWYgKHR5cGVvZiBub2RlRGF0YSAhPT0gJ29iamVjdCcpIHJldHVybiBmYWxzZTtcbiAgICAgICAgXG4gICAgICAgIC8vIOajgOafpeWfuuacrOWxnuaApyAtIOmAgumFjXF1ZXJ5LW5vZGUtdHJlZeeahOaVsOaNruagvOW8j1xuICAgICAgICByZXR1cm4gbm9kZURhdGEuaGFzT3duUHJvcGVydHkoJ3V1aWQnKSB8fCBcbiAgICAgICAgICAgICAgIG5vZGVEYXRhLmhhc093blByb3BlcnR5KCduYW1lJykgfHwgXG4gICAgICAgICAgICAgICBub2RlRGF0YS5oYXNPd25Qcm9wZXJ0eSgnX190eXBlX18nKSB8fFxuICAgICAgICAgICAgICAgKG5vZGVEYXRhLnZhbHVlICYmIChcbiAgICAgICAgICAgICAgICAgICBub2RlRGF0YS52YWx1ZS5oYXNPd25Qcm9wZXJ0eSgndXVpZCcpIHx8XG4gICAgICAgICAgICAgICAgICAgbm9kZURhdGEudmFsdWUuaGFzT3duUHJvcGVydHkoJ25hbWUnKSB8fFxuICAgICAgICAgICAgICAgICAgIG5vZGVEYXRhLnZhbHVlLmhhc093blByb3BlcnR5KCdfX3R5cGVfXycpXG4gICAgICAgICAgICAgICApKTtcbiAgICB9XG5cbiAgICAvLyDmj5Dlj5blrZDoioLngrlVVUlE55qE57uf5LiA5pa55rOVXG4gICAgcHJpdmF0ZSBleHRyYWN0Q2hpbGRVdWlkKGNoaWxkUmVmOiBhbnkpOiBzdHJpbmcgfCBudWxsIHtcbiAgICAgICAgaWYgKCFjaGlsZFJlZikgcmV0dXJuIG51bGw7XG4gICAgICAgIFxuICAgICAgICAvLyDmlrnms5UxOiDnm7TmjqXlrZfnrKbkuLJcbiAgICAgICAgaWYgKHR5cGVvZiBjaGlsZFJlZiA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgICAgIHJldHVybiBjaGlsZFJlZjtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgLy8g5pa55rOVMjogdmFsdWXlsZ7mgKfljIXlkKvlrZfnrKbkuLJcbiAgICAgICAgaWYgKGNoaWxkUmVmLnZhbHVlICYmIHR5cGVvZiBjaGlsZFJlZi52YWx1ZSA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgICAgIHJldHVybiBjaGlsZFJlZi52YWx1ZTtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgLy8g5pa55rOVMzogdmFsdWUudXVpZOWxnuaAp1xuICAgICAgICBpZiAoY2hpbGRSZWYudmFsdWUgJiYgY2hpbGRSZWYudmFsdWUudXVpZCkge1xuICAgICAgICAgICAgcmV0dXJuIGNoaWxkUmVmLnZhbHVlLnV1aWQ7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIC8vIOaWueazlTQ6IOebtOaOpXV1aWTlsZ7mgKdcbiAgICAgICAgaWYgKGNoaWxkUmVmLnV1aWQpIHtcbiAgICAgICAgICAgIHJldHVybiBjaGlsZFJlZi51dWlkO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICAvLyDmlrnms5U1OiBfX2lkX1/lvJXnlKggLSDov5nnp43mg4XlhrXpnIDopoHnibnmrorlpITnkIZcbiAgICAgICAgaWYgKGNoaWxkUmVmLl9faWRfXyAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhg5Y+R546wX19pZF9f5byV55SoOiAke2NoaWxkUmVmLl9faWRfX33vvIzlj6/og73pnIDopoHku47mlbDmja7nu5PmnoTkuK3mn6Xmib5gKTtcbiAgICAgICAgICAgIHJldHVybiBudWxsOyAvLyDmmoLml7bov5Tlm55udWxs77yM5ZCO57ut5Y+v5Lul5re75Yqg5byV55So6Kej5p6Q6YC76L6RXG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIGNvbnNvbGUud2Fybign5peg5rOV5o+Q5Y+W5a2Q6IqC54K5VVVJRDonLCBKU09OLnN0cmluZ2lmeShjaGlsZFJlZikpO1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICAvLyDojrflj5bpnIDopoHlpITnkIbnmoTlrZDoioLngrnmlbDmja5cbiAgICBwcml2YXRlIGdldENoaWxkcmVuVG9Qcm9jZXNzKG5vZGVEYXRhOiBhbnkpOiBhbnlbXSB7XG4gICAgICAgIGNvbnN0IGNoaWxkcmVuOiBhbnlbXSA9IFtdO1xuICAgICAgICBcbiAgICAgICAgLy8g5pa55rOVMTog55u05o6l5LuOY2hpbGRyZW7mlbDnu4Tojrflj5bvvIjku45xdWVyeS1ub2RlLXRyZWXov5Tlm57nmoTmlbDmja7vvIlcbiAgICAgICAgaWYgKG5vZGVEYXRhLmNoaWxkcmVuICYmIEFycmF5LmlzQXJyYXkobm9kZURhdGEuY2hpbGRyZW4pKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhg5LuOY2hpbGRyZW7mlbDnu4Tojrflj5blrZDoioLngrnvvIzmlbDph486ICR7bm9kZURhdGEuY2hpbGRyZW4ubGVuZ3RofWApO1xuICAgICAgICAgICAgZm9yIChjb25zdCBjaGlsZCBvZiBub2RlRGF0YS5jaGlsZHJlbikge1xuICAgICAgICAgICAgICAgIC8vIHF1ZXJ5LW5vZGUtdHJlZei/lOWbnueahOWtkOiKgueCuemAmuW4uOW3sue7j+aYr+WujOaVtOeahOaVsOaNrue7k+aehFxuICAgICAgICAgICAgICAgIGlmICh0aGlzLmlzVmFsaWROb2RlRGF0YShjaGlsZCkpIHtcbiAgICAgICAgICAgICAgICAgICAgY2hpbGRyZW4ucHVzaChjaGlsZCk7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGDmt7vliqDlrZDoioLngrk6ICR7Y2hpbGQubmFtZSB8fCBjaGlsZC52YWx1ZT8ubmFtZSB8fCAn5pyq55+lJ31gKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygn5a2Q6IqC54K55pWw5o2u5peg5pWIOicsIEpTT04uc3RyaW5naWZ5KGNoaWxkLCBudWxsLCAyKSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY29uc29sZS5sb2coJ+iKgueCueayoeacieWtkOiKgueCueaIlmNoaWxkcmVu5pWw57uE5Li656m6Jyk7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIHJldHVybiBjaGlsZHJlbjtcbiAgICB9XG5cbiAgICBwcml2YXRlIGdlbmVyYXRlVVVJRCgpOiBzdHJpbmcge1xuICAgICAgICAvLyDnlJ/miJDnrKblkIhDb2NvcyBDcmVhdG9y5qC85byP55qEVVVJRFxuICAgICAgICBjb25zdCBjaGFycyA9ICcwMTIzNDU2Nzg5YWJjZGVmJztcbiAgICAgICAgbGV0IHV1aWQgPSAnJztcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCAzMjsgaSsrKSB7XG4gICAgICAgICAgICBpZiAoaSA9PT0gOCB8fCBpID09PSAxMiB8fCBpID09PSAxNiB8fCBpID09PSAyMCkge1xuICAgICAgICAgICAgICAgIHV1aWQgKz0gJy0nO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdXVpZCArPSBjaGFyc1tNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiBjaGFycy5sZW5ndGgpXTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdXVpZDtcbiAgICB9XG5cbiAgICBwcml2YXRlIGNyZWF0ZVByZWZhYkRhdGEobm9kZURhdGE6IGFueSwgcHJlZmFiTmFtZTogc3RyaW5nLCBwcmVmYWJVdWlkOiBzdHJpbmcpOiBhbnlbXSB7XG4gICAgICAgIC8vIOWIm+W7uuagh+WHhueahOmihOWItuS9k+aVsOaNrue7k+aehFxuICAgICAgICBjb25zdCBwcmVmYWJBc3NldCA9IHtcbiAgICAgICAgICAgIFwiX190eXBlX19cIjogXCJjYy5QcmVmYWJcIixcbiAgICAgICAgICAgIFwiX25hbWVcIjogcHJlZmFiTmFtZSxcbiAgICAgICAgICAgIFwiX29iakZsYWdzXCI6IDAsXG4gICAgICAgICAgICBcIl9fZWRpdG9yRXh0cmFzX19cIjoge30sXG4gICAgICAgICAgICBcIl9uYXRpdmVcIjogXCJcIixcbiAgICAgICAgICAgIFwiZGF0YVwiOiB7XG4gICAgICAgICAgICAgICAgXCJfX2lkX19cIjogMVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIFwib3B0aW1pemF0aW9uUG9saWN5XCI6IDAsXG4gICAgICAgICAgICBcInBlcnNpc3RlbnRcIjogZmFsc2VcbiAgICAgICAgfTtcblxuICAgICAgICAvLyDlpITnkIboioLngrnmlbDmja7vvIznoa7kv53nrKblkIjpooTliLbkvZPmoLzlvI9cbiAgICAgICAgY29uc3QgcHJvY2Vzc2VkTm9kZURhdGEgPSB0aGlzLnByb2Nlc3NOb2RlRm9yUHJlZmFiKG5vZGVEYXRhLCBwcmVmYWJVdWlkKTtcblxuICAgICAgICByZXR1cm4gW3ByZWZhYkFzc2V0LCAuLi5wcm9jZXNzZWROb2RlRGF0YV07XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBwcm9jZXNzTm9kZUZvclByZWZhYihub2RlRGF0YTogYW55LCBwcmVmYWJVdWlkOiBzdHJpbmcpOiBhbnlbXSB7XG4gICAgICAgIC8vIOWkhOeQhuiKgueCueaVsOaNruS7peespuWQiOmihOWItuS9k+agvOW8j1xuICAgICAgICBjb25zdCBwcm9jZXNzZWREYXRhOiBhbnlbXSA9IFtdO1xuICAgICAgICBsZXQgaWRDb3VudGVyID0gMTtcblxuICAgICAgICAvLyDpgJLlvZLlpITnkIboioLngrnlkoznu4Tku7ZcbiAgICAgICAgY29uc3QgcHJvY2Vzc05vZGUgPSAobm9kZTogYW55LCBwYXJlbnRJZDogbnVtYmVyID0gMCk6IG51bWJlciA9PiB7XG4gICAgICAgICAgICBjb25zdCBub2RlSWQgPSBpZENvdW50ZXIrKztcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgLy8g5Yib5bu66IqC54K55a+56LGhXG4gICAgICAgICAgICBjb25zdCBwcm9jZXNzZWROb2RlID0ge1xuICAgICAgICAgICAgICAgIFwiX190eXBlX19cIjogXCJjYy5Ob2RlXCIsXG4gICAgICAgICAgICAgICAgXCJfbmFtZVwiOiBub2RlLm5hbWUgfHwgXCJOb2RlXCIsXG4gICAgICAgICAgICAgICAgXCJfb2JqRmxhZ3NcIjogMCxcbiAgICAgICAgICAgICAgICBcIl9fZWRpdG9yRXh0cmFzX19cIjoge30sXG4gICAgICAgICAgICAgICAgXCJfcGFyZW50XCI6IHBhcmVudElkID4gMCA/IHsgXCJfX2lkX19cIjogcGFyZW50SWQgfSA6IG51bGwsXG4gICAgICAgICAgICAgICAgXCJfY2hpbGRyZW5cIjogbm9kZS5jaGlsZHJlbiA/IG5vZGUuY2hpbGRyZW4ubWFwKCgpID0+ICh7IFwiX19pZF9fXCI6IGlkQ291bnRlcisrIH0pKSA6IFtdLFxuICAgICAgICAgICAgICAgIFwiX2FjdGl2ZVwiOiBub2RlLmFjdGl2ZSAhPT0gZmFsc2UsXG4gICAgICAgICAgICAgICAgXCJfY29tcG9uZW50c1wiOiBub2RlLmNvbXBvbmVudHMgPyBub2RlLmNvbXBvbmVudHMubWFwKCgpID0+ICh7IFwiX19pZF9fXCI6IGlkQ291bnRlcisrIH0pKSA6IFtdLFxuICAgICAgICAgICAgICAgIFwiX3ByZWZhYlwiOiB7XG4gICAgICAgICAgICAgICAgICAgIFwiX19pZF9fXCI6IGlkQ291bnRlcisrXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBcIl9scG9zXCI6IHtcbiAgICAgICAgICAgICAgICAgICAgXCJfX3R5cGVfX1wiOiBcImNjLlZlYzNcIixcbiAgICAgICAgICAgICAgICAgICAgXCJ4XCI6IDAsXG4gICAgICAgICAgICAgICAgICAgIFwieVwiOiAwLFxuICAgICAgICAgICAgICAgICAgICBcInpcIjogMFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgXCJfbHJvdFwiOiB7XG4gICAgICAgICAgICAgICAgICAgIFwiX190eXBlX19cIjogXCJjYy5RdWF0XCIsXG4gICAgICAgICAgICAgICAgICAgIFwieFwiOiAwLFxuICAgICAgICAgICAgICAgICAgICBcInlcIjogMCxcbiAgICAgICAgICAgICAgICAgICAgXCJ6XCI6IDAsXG4gICAgICAgICAgICAgICAgICAgIFwid1wiOiAxXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBcIl9sc2NhbGVcIjoge1xuICAgICAgICAgICAgICAgICAgICBcIl9fdHlwZV9fXCI6IFwiY2MuVmVjM1wiLFxuICAgICAgICAgICAgICAgICAgICBcInhcIjogMSxcbiAgICAgICAgICAgICAgICAgICAgXCJ5XCI6IDEsXG4gICAgICAgICAgICAgICAgICAgIFwielwiOiAxXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBcIl9tb2JpbGl0eVwiOiAwLFxuICAgICAgICAgICAgICAgIFwiX2xheWVyXCI6IDEwNzM3NDE4MjQsXG4gICAgICAgICAgICAgICAgXCJfZXVsZXJcIjoge1xuICAgICAgICAgICAgICAgICAgICBcIl9fdHlwZV9fXCI6IFwiY2MuVmVjM1wiLFxuICAgICAgICAgICAgICAgICAgICBcInhcIjogMCxcbiAgICAgICAgICAgICAgICAgICAgXCJ5XCI6IDAsXG4gICAgICAgICAgICAgICAgICAgIFwielwiOiAwXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBcIl9pZFwiOiBcIlwiXG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICBwcm9jZXNzZWREYXRhLnB1c2gocHJvY2Vzc2VkTm9kZSk7XG5cbiAgICAgICAgICAgIC8vIOWkhOeQhue7hOS7tlxuICAgICAgICAgICAgaWYgKG5vZGUuY29tcG9uZW50cykge1xuICAgICAgICAgICAgICAgIG5vZGUuY29tcG9uZW50cy5mb3JFYWNoKChjb21wb25lbnQ6IGFueSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBjb21wb25lbnRJZCA9IGlkQ291bnRlcisrO1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBwcm9jZXNzZWRDb21wb25lbnRzID0gdGhpcy5wcm9jZXNzQ29tcG9uZW50Rm9yUHJlZmFiKGNvbXBvbmVudCwgY29tcG9uZW50SWQpO1xuICAgICAgICAgICAgICAgICAgICBwcm9jZXNzZWREYXRhLnB1c2goLi4ucHJvY2Vzc2VkQ29tcG9uZW50cyk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIOWkhOeQhuWtkOiKgueCuVxuICAgICAgICAgICAgaWYgKG5vZGUuY2hpbGRyZW4pIHtcbiAgICAgICAgICAgICAgICBub2RlLmNoaWxkcmVuLmZvckVhY2goKGNoaWxkOiBhbnkpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgcHJvY2Vzc05vZGUoY2hpbGQsIG5vZGVJZCk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiBub2RlSWQ7XG4gICAgICAgIH07XG5cbiAgICAgICAgcHJvY2Vzc05vZGUobm9kZURhdGEpO1xuICAgICAgICByZXR1cm4gcHJvY2Vzc2VkRGF0YTtcbiAgICB9XG5cbiAgICBwcml2YXRlIHByb2Nlc3NDb21wb25lbnRGb3JQcmVmYWIoY29tcG9uZW50OiBhbnksIGNvbXBvbmVudElkOiBudW1iZXIpOiBhbnlbXSB7XG4gICAgICAgIC8vIOWkhOeQhue7hOS7tuaVsOaNruS7peespuWQiOmihOWItuS9k+agvOW8j1xuICAgICAgICBjb25zdCBwcm9jZXNzZWRDb21wb25lbnQgPSB7XG4gICAgICAgICAgICBcIl9fdHlwZV9fXCI6IGNvbXBvbmVudC50eXBlIHx8IFwiY2MuQ29tcG9uZW50XCIsXG4gICAgICAgICAgICBcIl9uYW1lXCI6IFwiXCIsXG4gICAgICAgICAgICBcIl9vYmpGbGFnc1wiOiAwLFxuICAgICAgICAgICAgXCJfX2VkaXRvckV4dHJhc19fXCI6IHt9LFxuICAgICAgICAgICAgXCJub2RlXCI6IHtcbiAgICAgICAgICAgICAgICBcIl9faWRfX1wiOiBjb21wb25lbnRJZCAtIDFcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBcIl9lbmFibGVkXCI6IGNvbXBvbmVudC5lbmFibGVkICE9PSBmYWxzZSxcbiAgICAgICAgICAgIFwiX19wcmVmYWJcIjoge1xuICAgICAgICAgICAgICAgIFwiX19pZF9fXCI6IGNvbXBvbmVudElkICsgMVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIC4uLmNvbXBvbmVudC5wcm9wZXJ0aWVzXG4gICAgICAgIH07XG5cbiAgICAgICAgLy8g5re75Yqg57uE5Lu254m55a6a55qE6aKE5Yi25L2T5L+h5oGvXG4gICAgICAgIGNvbnN0IGNvbXBQcmVmYWJJbmZvID0ge1xuICAgICAgICAgICAgXCJfX3R5cGVfX1wiOiBcImNjLkNvbXBQcmVmYWJJbmZvXCIsXG4gICAgICAgICAgICBcImZpbGVJZFwiOiB0aGlzLmdlbmVyYXRlRmlsZUlkKClcbiAgICAgICAgfTtcblxuICAgICAgICByZXR1cm4gW3Byb2Nlc3NlZENvbXBvbmVudCwgY29tcFByZWZhYkluZm9dO1xuICAgIH1cblxuICAgIHByaXZhdGUgZ2VuZXJhdGVGaWxlSWQoKTogc3RyaW5nIHtcbiAgICAgICAgLy8g55Sf5oiQ5paH5Lu2SUTvvIjnroDljJbniYjmnKzvvIlcbiAgICAgICAgY29uc3QgY2hhcnMgPSAnYWJjZGVmZ2hpamtsbW5vcHFyc3R1dnd4eXpBQkNERUZHSElKS0xNTk9QUVJTVFVWV1hZWjAxMjM0NTY3ODkrLyc7XG4gICAgICAgIGxldCBmaWxlSWQgPSAnJztcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCAyMjsgaSsrKSB7XG4gICAgICAgICAgICBmaWxlSWQgKz0gY2hhcnNbTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogY2hhcnMubGVuZ3RoKV07XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGZpbGVJZDtcbiAgICB9XG5cbiAgICBwcml2YXRlIGNyZWF0ZU1ldGFEYXRhKHByZWZhYk5hbWU6IHN0cmluZywgcHJlZmFiVXVpZDogc3RyaW5nKTogYW55IHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIFwidmVyXCI6IFwiMS4xLjUwXCIsXG4gICAgICAgICAgICBcImltcG9ydGVyXCI6IFwicHJlZmFiXCIsXG4gICAgICAgICAgICBcImltcG9ydGVkXCI6IHRydWUsXG4gICAgICAgICAgICBcInV1aWRcIjogcHJlZmFiVXVpZCxcbiAgICAgICAgICAgIFwiZmlsZXNcIjogW1xuICAgICAgICAgICAgICAgIFwiLmpzb25cIlxuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIFwic3ViTWV0YXNcIjoge30sXG4gICAgICAgICAgICBcInVzZXJEYXRhXCI6IHtcbiAgICAgICAgICAgICAgICBcInN5bmNOb2RlTmFtZVwiOiBwcmVmYWJOYW1lXG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBhc3luYyBzYXZlUHJlZmFiRmlsZXMocHJlZmFiUGF0aDogc3RyaW5nLCBwcmVmYWJEYXRhOiBhbnlbXSwgbWV0YURhdGE6IGFueSk6IFByb21pc2U8eyBzdWNjZXNzOiBib29sZWFuOyBlcnJvcj86IHN0cmluZyB9PiB7XG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSkgPT4ge1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAvLyDkvb/nlKhFZGl0b3IgQVBJ5L+d5a2Y6aKE5Yi25L2T5paH5Lu2XG4gICAgICAgICAgICAgICAgY29uc3QgcHJlZmFiQ29udGVudCA9IEpTT04uc3RyaW5naWZ5KHByZWZhYkRhdGEsIG51bGwsIDIpO1xuICAgICAgICAgICAgICAgIGNvbnN0IG1ldGFDb250ZW50ID0gSlNPTi5zdHJpbmdpZnkobWV0YURhdGEsIG51bGwsIDIpO1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIC8vIOWwneivleS9v+eUqOabtOWPr+mdoOeahOS/neWtmOaWueazlVxuICAgICAgICAgICAgICAgIHRoaXMuc2F2ZUFzc2V0RmlsZShwcmVmYWJQYXRoLCBwcmVmYWJDb250ZW50KS50aGVuKCgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgLy8g5YaN5Yib5bu6bWV0YeaWh+S7tlxuICAgICAgICAgICAgICAgICAgICBjb25zdCBtZXRhUGF0aCA9IGAke3ByZWZhYlBhdGh9Lm1ldGFgO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5zYXZlQXNzZXRGaWxlKG1ldGFQYXRoLCBtZXRhQ29udGVudCk7XG4gICAgICAgICAgICAgICAgfSkudGhlbigoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHJlc29sdmUoeyBzdWNjZXNzOiB0cnVlIH0pO1xuICAgICAgICAgICAgICAgIH0pLmNhdGNoKChlcnJvcjogYW55KSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHJlc29sdmUoeyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6IGVycm9yLm1lc3NhZ2UgfHwgJ+S/neWtmOmihOWItuS9k+aWh+S7tuWksei0pScgfSk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgICAgIHJlc29sdmUoeyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6IGDkv53lrZjmlofku7bml7blj5HnlJ/plJnor686ICR7ZXJyb3J9YCB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBhc3luYyBzYXZlQXNzZXRGaWxlKGZpbGVQYXRoOiBzdHJpbmcsIGNvbnRlbnQ6IHN0cmluZyk6IFByb21pc2U8dm9pZD4ge1xuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICAgICAgLy8g5bCd6K+V5aSa56eN5L+d5a2Y5pa55rOVXG4gICAgICAgICAgICBjb25zdCBzYXZlTWV0aG9kcyA9IFtcbiAgICAgICAgICAgICAgICAoKSA9PiBFZGl0b3IuTWVzc2FnZS5yZXF1ZXN0KCdhc3NldC1kYicsICdjcmVhdGUtYXNzZXQnLCBmaWxlUGF0aCwgY29udGVudCksXG4gICAgICAgICAgICAgICAgKCkgPT4gRWRpdG9yLk1lc3NhZ2UucmVxdWVzdCgnYXNzZXQtZGInLCAnc2F2ZS1hc3NldCcsIGZpbGVQYXRoLCBjb250ZW50KSxcbiAgICAgICAgICAgICAgICAoKSA9PiBFZGl0b3IuTWVzc2FnZS5yZXF1ZXN0KCdhc3NldC1kYicsICd3cml0ZS1hc3NldCcsIGZpbGVQYXRoLCBjb250ZW50KVxuICAgICAgICAgICAgXTtcblxuICAgICAgICAgICAgY29uc3QgdHJ5U2F2ZSA9IChpbmRleDogbnVtYmVyKSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKGluZGV4ID49IHNhdmVNZXRob2RzLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgICAgICByZWplY3QobmV3IEVycm9yKCfmiYDmnInkv53lrZjmlrnms5Xpg73lpLHotKXkuoYnKSk7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBzYXZlTWV0aG9kc1tpbmRleF0oKS50aGVuKCgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZSgpO1xuICAgICAgICAgICAgICAgIH0pLmNhdGNoKCgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgdHJ5U2F2ZShpbmRleCArIDEpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgdHJ5U2F2ZSgwKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBhc3luYyB1cGRhdGVQcmVmYWIocHJlZmFiUGF0aDogc3RyaW5nLCBub2RlVXVpZDogc3RyaW5nKTogUHJvbWlzZTxUb29sUmVzcG9uc2U+IHtcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiB7XG4gICAgICAgICAgICBFZGl0b3IuTWVzc2FnZS5yZXF1ZXN0KCdhc3NldC1kYicsICdxdWVyeS1hc3NldC1pbmZvJywgcHJlZmFiUGF0aCkudGhlbigoYXNzZXRJbmZvOiBhbnkpID0+IHtcbiAgICAgICAgICAgICAgICBpZiAoIWFzc2V0SW5mbykge1xuICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1ByZWZhYiBub3QgZm91bmQnKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICByZXR1cm4gRWRpdG9yLk1lc3NhZ2UucmVxdWVzdCgnc2NlbmUnLCAnYXBwbHktcHJlZmFiJywge1xuICAgICAgICAgICAgICAgICAgICBub2RlOiBub2RlVXVpZCxcbiAgICAgICAgICAgICAgICAgICAgcHJlZmFiOiBhc3NldEluZm8udXVpZFxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSkudGhlbigoKSA9PiB7XG4gICAgICAgICAgICAgICAgcmVzb2x2ZSh7XG4gICAgICAgICAgICAgICAgICAgIHN1Y2Nlc3M6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgIG1lc3NhZ2U6ICdQcmVmYWIgdXBkYXRlZCBzdWNjZXNzZnVsbHknXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9KS5jYXRjaCgoZXJyOiBFcnJvcikgPT4ge1xuICAgICAgICAgICAgICAgIHJlc29sdmUoeyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6IGVyci5tZXNzYWdlIH0pO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHByaXZhdGUgYXN5bmMgcmV2ZXJ0UHJlZmFiKG5vZGVVdWlkOiBzdHJpbmcpOiBQcm9taXNlPFRvb2xSZXNwb25zZT4ge1xuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHtcbiAgICAgICAgICAgIEVkaXRvci5NZXNzYWdlLnJlcXVlc3QoJ3NjZW5lJywgJ3JldmVydC1wcmVmYWInLCB7XG4gICAgICAgICAgICAgICAgbm9kZTogbm9kZVV1aWRcbiAgICAgICAgICAgIH0pLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgICAgIHJlc29sdmUoe1xuICAgICAgICAgICAgICAgICAgICBzdWNjZXNzOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICBtZXNzYWdlOiAnUHJlZmFiIGluc3RhbmNlIHJldmVydGVkIHN1Y2Nlc3NmdWxseSdcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0pLmNhdGNoKChlcnI6IEVycm9yKSA9PiB7XG4gICAgICAgICAgICAgICAgcmVzb2x2ZSh7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogZXJyLm1lc3NhZ2UgfSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBhc3luYyBnZXRQcmVmYWJJbmZvKHByZWZhYlBhdGg6IHN0cmluZyk6IFByb21pc2U8VG9vbFJlc3BvbnNlPiB7XG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSkgPT4ge1xuICAgICAgICAgICAgRWRpdG9yLk1lc3NhZ2UucmVxdWVzdCgnYXNzZXQtZGInLCAncXVlcnktYXNzZXQtaW5mbycsIHByZWZhYlBhdGgpLnRoZW4oKGFzc2V0SW5mbzogYW55KSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKCFhc3NldEluZm8pIHtcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdQcmVmYWIgbm90IGZvdW5kJyk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgcmV0dXJuIEVkaXRvci5NZXNzYWdlLnJlcXVlc3QoJ2Fzc2V0LWRiJywgJ3F1ZXJ5LWFzc2V0LW1ldGEnLCBhc3NldEluZm8udXVpZCk7XG4gICAgICAgICAgICB9KS50aGVuKChtZXRhSW5mbzogYW55KSA9PiB7XG4gICAgICAgICAgICAgICAgY29uc3QgaW5mbzogUHJlZmFiSW5mbyA9IHtcbiAgICAgICAgICAgICAgICAgICAgbmFtZTogbWV0YUluZm8ubmFtZSxcbiAgICAgICAgICAgICAgICAgICAgdXVpZDogbWV0YUluZm8udXVpZCxcbiAgICAgICAgICAgICAgICAgICAgcGF0aDogcHJlZmFiUGF0aCxcbiAgICAgICAgICAgICAgICAgICAgZm9sZGVyOiBwcmVmYWJQYXRoLnN1YnN0cmluZygwLCBwcmVmYWJQYXRoLmxhc3RJbmRleE9mKCcvJykpLFxuICAgICAgICAgICAgICAgICAgICBjcmVhdGVUaW1lOiBtZXRhSW5mby5jcmVhdGVUaW1lLFxuICAgICAgICAgICAgICAgICAgICBtb2RpZnlUaW1lOiBtZXRhSW5mby5tb2RpZnlUaW1lLFxuICAgICAgICAgICAgICAgICAgICBkZXBlbmRlbmNpZXM6IG1ldGFJbmZvLmRlcGVuZHMgfHwgW11cbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIHJlc29sdmUoeyBzdWNjZXNzOiB0cnVlLCBkYXRhOiBpbmZvIH0pO1xuICAgICAgICAgICAgfSkuY2F0Y2goKGVycjogRXJyb3IpID0+IHtcbiAgICAgICAgICAgICAgICByZXNvbHZlKHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiBlcnIubWVzc2FnZSB9KTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGFzeW5jIGNyZWF0ZVByZWZhYkZyb21Ob2RlKGFyZ3M6IGFueSk6IFByb21pc2U8VG9vbFJlc3BvbnNlPiB7XG4gICAgICAgIC8vIOS7jiBwcmVmYWJQYXRoIOaPkOWPluWQjeensFxuICAgICAgICBjb25zdCBwcmVmYWJQYXRoID0gYXJncy5wcmVmYWJQYXRoO1xuICAgICAgICBjb25zdCBwcmVmYWJOYW1lID0gcHJlZmFiUGF0aC5zcGxpdCgnLycpLnBvcCgpPy5yZXBsYWNlKCcucHJlZmFiJywgJycpIHx8ICdOZXdQcmVmYWInO1xuICAgICAgICBcbiAgICAgICAgLy8g6LCD55So5Y6f5p2l55qEIGNyZWF0ZVByZWZhYiDmlrnms5VcbiAgICAgICAgcmV0dXJuIGF3YWl0IHRoaXMuY3JlYXRlUHJlZmFiKHtcbiAgICAgICAgICAgIG5vZGVVdWlkOiBhcmdzLm5vZGVVdWlkLFxuICAgICAgICAgICAgc2F2ZVBhdGg6IHByZWZhYlBhdGgsXG4gICAgICAgICAgICBwcmVmYWJOYW1lOiBwcmVmYWJOYW1lXG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHByaXZhdGUgYXN5bmMgdmFsaWRhdGVQcmVmYWIocHJlZmFiUGF0aDogc3RyaW5nKTogUHJvbWlzZTxUb29sUmVzcG9uc2U+IHtcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiB7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIC8vIOivu+WPlumihOWItuS9k+aWh+S7tuWGheWuuVxuICAgICAgICAgICAgICAgIEVkaXRvci5NZXNzYWdlLnJlcXVlc3QoJ2Fzc2V0LWRiJywgJ3F1ZXJ5LWFzc2V0LWluZm8nLCBwcmVmYWJQYXRoKS50aGVuKChhc3NldEluZm86IGFueSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBpZiAoIWFzc2V0SW5mbykge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZSh7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc3VjY2VzczogZmFsc2UsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3I6ICfpooTliLbkvZPmlofku7bkuI3lrZjlnKgnXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIC8vIOmqjOivgemihOWItuS9k+agvOW8j1xuICAgICAgICAgICAgICAgICAgICBFZGl0b3IuTWVzc2FnZS5yZXF1ZXN0KCdhc3NldC1kYicsICdyZWFkLWFzc2V0JywgcHJlZmFiUGF0aCkudGhlbigoY29udGVudDogc3RyaW5nKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHByZWZhYkRhdGEgPSBKU09OLnBhcnNlKGNvbnRlbnQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHZhbGlkYXRpb25SZXN1bHQgPSB0aGlzLnZhbGlkYXRlUHJlZmFiRm9ybWF0KHByZWZhYkRhdGEpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlc29sdmUoe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdWNjZXNzOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRhOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpc1ZhbGlkOiB2YWxpZGF0aW9uUmVzdWx0LmlzVmFsaWQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpc3N1ZXM6IHZhbGlkYXRpb25SZXN1bHQuaXNzdWVzLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbm9kZUNvdW50OiB2YWxpZGF0aW9uUmVzdWx0Lm5vZGVDb3VudCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbXBvbmVudENvdW50OiB2YWxpZGF0aW9uUmVzdWx0LmNvbXBvbmVudENvdW50LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbWVzc2FnZTogdmFsaWRhdGlvblJlc3VsdC5pc1ZhbGlkID8gJ+mihOWItuS9k+agvOW8j+acieaViCcgOiAn6aKE5Yi25L2T5qC85byP5a2Y5Zyo6Zeu6aKYJ1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9IGNhdGNoIChwYXJzZUVycm9yKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZSh7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN1Y2Nlc3M6IGZhbHNlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBlcnJvcjogJ+mihOWItuS9k+aWh+S7tuagvOW8j+mUmeivr++8jOaXoOazleino+aekEpTT04nXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0pLmNhdGNoKChlcnJvcjogYW55KSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXNvbHZlKHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdWNjZXNzOiBmYWxzZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlcnJvcjogYOivu+WPlumihOWItuS9k+aWh+S7tuWksei0pTogJHtlcnJvci5tZXNzYWdlfWBcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9KS5jYXRjaCgoZXJyb3I6IGFueSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICByZXNvbHZlKHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHN1Y2Nlc3M6IGZhbHNlLFxuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3I6IGDmn6Xor6LpooTliLbkvZPkv6Hmga/lpLHotKU6ICR7ZXJyb3IubWVzc2FnZX1gXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgICAgICByZXNvbHZlKHtcbiAgICAgICAgICAgICAgICAgICAgc3VjY2VzczogZmFsc2UsXG4gICAgICAgICAgICAgICAgICAgIGVycm9yOiBg6aqM6K+B6aKE5Yi25L2T5pe25Y+R55Sf6ZSZ6K+vOiAke2Vycm9yfWBcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSB2YWxpZGF0ZVByZWZhYkZvcm1hdChwcmVmYWJEYXRhOiBhbnkpOiB7IGlzVmFsaWQ6IGJvb2xlYW47IGlzc3Vlczogc3RyaW5nW107IG5vZGVDb3VudDogbnVtYmVyOyBjb21wb25lbnRDb3VudDogbnVtYmVyIH0ge1xuICAgICAgICBjb25zdCBpc3N1ZXM6IHN0cmluZ1tdID0gW107XG4gICAgICAgIGxldCBub2RlQ291bnQgPSAwO1xuICAgICAgICBsZXQgY29tcG9uZW50Q291bnQgPSAwO1xuXG4gICAgICAgIC8vIOajgOafpeWfuuacrOe7k+aehFxuICAgICAgICBpZiAoIUFycmF5LmlzQXJyYXkocHJlZmFiRGF0YSkpIHtcbiAgICAgICAgICAgIGlzc3Vlcy5wdXNoKCfpooTliLbkvZPmlbDmja7lv4XpobvmmK/mlbDnu4TmoLzlvI8nKTtcbiAgICAgICAgICAgIHJldHVybiB7IGlzVmFsaWQ6IGZhbHNlLCBpc3N1ZXMsIG5vZGVDb3VudCwgY29tcG9uZW50Q291bnQgfTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChwcmVmYWJEYXRhLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgaXNzdWVzLnB1c2goJ+mihOWItuS9k+aVsOaNruS4uuepuicpO1xuICAgICAgICAgICAgcmV0dXJuIHsgaXNWYWxpZDogZmFsc2UsIGlzc3Vlcywgbm9kZUNvdW50LCBjb21wb25lbnRDb3VudCB9O1xuICAgICAgICB9XG5cbiAgICAgICAgLy8g5qOA5p+l56ys5LiA5Liq5YWD57Sg5piv5ZCm5Li66aKE5Yi25L2T6LWE5LqnXG4gICAgICAgIGNvbnN0IGZpcnN0RWxlbWVudCA9IHByZWZhYkRhdGFbMF07XG4gICAgICAgIGlmICghZmlyc3RFbGVtZW50IHx8IGZpcnN0RWxlbWVudC5fX3R5cGVfXyAhPT0gJ2NjLlByZWZhYicpIHtcbiAgICAgICAgICAgIGlzc3Vlcy5wdXNoKCfnrKzkuIDkuKrlhYPntKDlv4XpobvmmK9jYy5QcmVmYWLnsbvlnosnKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIOe7n+iuoeiKgueCueWSjOe7hOS7tlxuICAgICAgICBwcmVmYWJEYXRhLmZvckVhY2goKGl0ZW06IGFueSwgaW5kZXg6IG51bWJlcikgPT4ge1xuICAgICAgICAgICAgaWYgKGl0ZW0uX190eXBlX18gPT09ICdjYy5Ob2RlJykge1xuICAgICAgICAgICAgICAgIG5vZGVDb3VudCsrO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChpdGVtLl9fdHlwZV9fICYmIGl0ZW0uX190eXBlX18uaW5jbHVkZXMoJ2NjLicpKSB7XG4gICAgICAgICAgICAgICAgY29tcG9uZW50Q291bnQrKztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbiAgICAgICAgLy8g5qOA5p+l5b+F6KaB55qE5a2X5q61XG4gICAgICAgIGlmIChub2RlQ291bnQgPT09IDApIHtcbiAgICAgICAgICAgIGlzc3Vlcy5wdXNoKCfpooTliLbkvZPlv4XpobvljIXlkKvoh7PlsJHkuIDkuKroioLngrknKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBpc1ZhbGlkOiBpc3N1ZXMubGVuZ3RoID09PSAwLFxuICAgICAgICAgICAgaXNzdWVzLFxuICAgICAgICAgICAgbm9kZUNvdW50LFxuICAgICAgICAgICAgY29tcG9uZW50Q291bnRcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGFzeW5jIGR1cGxpY2F0ZVByZWZhYihhcmdzOiBhbnkpOiBQcm9taXNlPFRvb2xSZXNwb25zZT4ge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgY29uc3QgeyBzb3VyY2VQcmVmYWJQYXRoLCB0YXJnZXRQcmVmYWJQYXRoLCBuZXdQcmVmYWJOYW1lIH0gPSBhcmdzO1xuXG4gICAgICAgICAgICAvLyDor7vlj5bmupDpooTliLbkvZNcbiAgICAgICAgICAgIGNvbnN0IHNvdXJjZUluZm8gPSBhd2FpdCB0aGlzLmdldFByZWZhYkluZm8oc291cmNlUHJlZmFiUGF0aCk7XG4gICAgICAgICAgICBpZiAoIXNvdXJjZUluZm8uc3VjY2Vzcykge1xuICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgIHN1Y2Nlc3M6IGZhbHNlLFxuICAgICAgICAgICAgICAgICAgICBlcnJvcjogYOaXoOazleivu+WPlua6kOmihOWItuS9kzogJHtzb3VyY2VJbmZvLmVycm9yfWBcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyDor7vlj5bmupDpooTliLbkvZPlhoXlrrlcbiAgICAgICAgICAgIGNvbnN0IHNvdXJjZUNvbnRlbnQgPSBhd2FpdCB0aGlzLnJlYWRQcmVmYWJDb250ZW50KHNvdXJjZVByZWZhYlBhdGgpO1xuICAgICAgICAgICAgaWYgKCFzb3VyY2VDb250ZW50LnN1Y2Nlc3MpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICBzdWNjZXNzOiBmYWxzZSxcbiAgICAgICAgICAgICAgICAgICAgZXJyb3I6IGDml6Dms5Xor7vlj5bmupDpooTliLbkvZPlhoXlrrk6ICR7c291cmNlQ29udGVudC5lcnJvcn1gXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8g55Sf5oiQ5paw55qEVVVJRFxuICAgICAgICAgICAgY29uc3QgbmV3VXVpZCA9IHRoaXMuZ2VuZXJhdGVVVUlEKCk7XG5cbiAgICAgICAgICAgIC8vIOS/ruaUuemihOWItuS9k+aVsOaNrlxuICAgICAgICAgICAgY29uc3QgbW9kaWZpZWREYXRhID0gdGhpcy5tb2RpZnlQcmVmYWJGb3JEdXBsaWNhdGlvbihzb3VyY2VDb250ZW50LmRhdGEsIG5ld1ByZWZhYk5hbWUsIG5ld1V1aWQpO1xuXG4gICAgICAgICAgICAvLyDliJvlu7rmlrDnmoRtZXRh5pWw5o2uXG4gICAgICAgICAgICBjb25zdCBuZXdNZXRhRGF0YSA9IHRoaXMuY3JlYXRlTWV0YURhdGEobmV3UHJlZmFiTmFtZSB8fCAnRHVwbGljYXRlZFByZWZhYicsIG5ld1V1aWQpO1xuXG4gICAgICAgICAgICAvLyDpooTliLbkvZPlpI3liLblip/og73mmoLml7bnpoHnlKjvvIzlm6DkuLrmtonlj4rlpI3mnYLnmoTluo/liJfljJbmoLzlvI9cbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgc3VjY2VzczogZmFsc2UsXG4gICAgICAgICAgICAgICAgZXJyb3I6ICfpooTliLbkvZPlpI3liLblip/og73mmoLml7bkuI3lj6/nlKgnLFxuICAgICAgICAgICAgICAgIGluc3RydWN0aW9uOiAn6K+35ZyoIENvY29zIENyZWF0b3Ig57yW6L6R5Zmo5Lit5omL5Yqo5aSN5Yi26aKE5Yi25L2T77yaXFxuMS4g5Zyo6LWE5rqQ566h55CG5Zmo5Lit6YCJ5oup6KaB5aSN5Yi255qE6aKE5Yi25L2TXFxuMi4g5Y+z6ZSu6YCJ5oup5aSN5Yi2XFxuMy4g5Zyo55uu5qCH5L2N572u57KY6LS0J1xuICAgICAgICAgICAgfTtcblxuICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBzdWNjZXNzOiBmYWxzZSxcbiAgICAgICAgICAgICAgICBlcnJvcjogYOWkjeWItumihOWItuS9k+aXtuWPkeeUn+mUmeivrzogJHtlcnJvcn1gXG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBhc3luYyByZWFkUHJlZmFiQ29udGVudChwcmVmYWJQYXRoOiBzdHJpbmcpOiBQcm9taXNlPHsgc3VjY2VzczogYm9vbGVhbjsgZGF0YT86IGFueTsgZXJyb3I/OiBzdHJpbmcgfT4ge1xuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHtcbiAgICAgICAgICAgIEVkaXRvci5NZXNzYWdlLnJlcXVlc3QoJ2Fzc2V0LWRiJywgJ3JlYWQtYXNzZXQnLCBwcmVmYWJQYXRoKS50aGVuKChjb250ZW50OiBzdHJpbmcpID0+IHtcbiAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBwcmVmYWJEYXRhID0gSlNPTi5wYXJzZShjb250ZW50KTtcbiAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZSh7IHN1Y2Nlc3M6IHRydWUsIGRhdGE6IHByZWZhYkRhdGEgfSk7XG4gICAgICAgICAgICAgICAgfSBjYXRjaCAocGFyc2VFcnJvcikge1xuICAgICAgICAgICAgICAgICAgICByZXNvbHZlKHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiAn6aKE5Yi25L2T5paH5Lu25qC85byP6ZSZ6K+vJyB9KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KS5jYXRjaCgoZXJyb3I6IGFueSkgPT4ge1xuICAgICAgICAgICAgICAgIHJlc29sdmUoeyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6IGVycm9yLm1lc3NhZ2UgfHwgJ+ivu+WPlumihOWItuS9k+aWh+S7tuWksei0pScgfSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBtb2RpZnlQcmVmYWJGb3JEdXBsaWNhdGlvbihwcmVmYWJEYXRhOiBhbnlbXSwgbmV3TmFtZTogc3RyaW5nLCBuZXdVdWlkOiBzdHJpbmcpOiBhbnlbXSB7XG4gICAgICAgIC8vIOS/ruaUuemihOWItuS9k+aVsOaNruS7peWIm+W7uuWJr+acrFxuICAgICAgICBjb25zdCBtb2RpZmllZERhdGEgPSBbLi4ucHJlZmFiRGF0YV07XG4gICAgICAgIFxuICAgICAgICAvLyDkv67mlLnnrKzkuIDkuKrlhYPntKDvvIjpooTliLbkvZPotYTkuqfvvIlcbiAgICAgICAgaWYgKG1vZGlmaWVkRGF0YVswXSAmJiBtb2RpZmllZERhdGFbMF0uX190eXBlX18gPT09ICdjYy5QcmVmYWInKSB7XG4gICAgICAgICAgICBtb2RpZmllZERhdGFbMF0uX25hbWUgPSBuZXdOYW1lIHx8ICdEdXBsaWNhdGVkUHJlZmFiJztcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIOabtOaWsOaJgOaciVVVSUTlvJXnlKjvvIjnroDljJbniYjmnKzvvIlcbiAgICAgICAgLy8g5Zyo5a6e6ZmF5bqU55So5Lit77yM5Y+v6IO96ZyA6KaB5pu05aSN5p2C55qEVVVJROaYoOWwhOWkhOeQhlxuICAgICAgICBcbiAgICAgICAgcmV0dXJuIG1vZGlmaWVkRGF0YTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiDkvb/nlKggYXNzZXQtZGIgQVBJIOWIm+W7uui1hOa6kOaWh+S7tlxuICAgICAqL1xuICAgIHByaXZhdGUgYXN5bmMgY3JlYXRlQXNzZXRXaXRoQXNzZXREQihhc3NldFBhdGg6IHN0cmluZywgY29udGVudDogc3RyaW5nKTogUHJvbWlzZTx7IHN1Y2Nlc3M6IGJvb2xlYW47IGRhdGE/OiBhbnk7IGVycm9yPzogc3RyaW5nIH0+IHtcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiB7XG4gICAgICAgICAgICBFZGl0b3IuTWVzc2FnZS5yZXF1ZXN0KCdhc3NldC1kYicsICdjcmVhdGUtYXNzZXQnLCBhc3NldFBhdGgsIGNvbnRlbnQsIHtcbiAgICAgICAgICAgICAgICBvdmVyd3JpdGU6IHRydWUsXG4gICAgICAgICAgICAgICAgcmVuYW1lOiBmYWxzZVxuICAgICAgICAgICAgfSkudGhlbigoYXNzZXRJbmZvOiBhbnkpID0+IHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygn5Yib5bu66LWE5rqQ5paH5Lu25oiQ5YqfOicsIGFzc2V0SW5mbyk7XG4gICAgICAgICAgICAgICAgcmVzb2x2ZSh7IHN1Y2Nlc3M6IHRydWUsIGRhdGE6IGFzc2V0SW5mbyB9KTtcbiAgICAgICAgICAgIH0pLmNhdGNoKChlcnJvcjogYW55KSA9PiB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcign5Yib5bu66LWE5rqQ5paH5Lu25aSx6LSlOicsIGVycm9yKTtcbiAgICAgICAgICAgICAgICByZXNvbHZlKHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiBlcnJvci5tZXNzYWdlIHx8ICfliJvlu7rotYTmupDmlofku7blpLHotKUnIH0pO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIOS9v+eUqCBhc3NldC1kYiBBUEkg5Yib5bu6IG1ldGEg5paH5Lu2XG4gICAgICovXG4gICAgcHJpdmF0ZSBhc3luYyBjcmVhdGVNZXRhV2l0aEFzc2V0REIoYXNzZXRQYXRoOiBzdHJpbmcsIG1ldGFDb250ZW50OiBhbnkpOiBQcm9taXNlPHsgc3VjY2VzczogYm9vbGVhbjsgZGF0YT86IGFueTsgZXJyb3I/OiBzdHJpbmcgfT4ge1xuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IG1ldGFDb250ZW50U3RyaW5nID0gSlNPTi5zdHJpbmdpZnkobWV0YUNvbnRlbnQsIG51bGwsIDIpO1xuICAgICAgICAgICAgRWRpdG9yLk1lc3NhZ2UucmVxdWVzdCgnYXNzZXQtZGInLCAnc2F2ZS1hc3NldC1tZXRhJywgYXNzZXRQYXRoLCBtZXRhQ29udGVudFN0cmluZykudGhlbigoYXNzZXRJbmZvOiBhbnkpID0+IHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygn5Yib5bu6bWV0YeaWh+S7tuaIkOWKnzonLCBhc3NldEluZm8pO1xuICAgICAgICAgICAgICAgIHJlc29sdmUoeyBzdWNjZXNzOiB0cnVlLCBkYXRhOiBhc3NldEluZm8gfSk7XG4gICAgICAgICAgICB9KS5jYXRjaCgoZXJyb3I6IGFueSkgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ+WIm+W7um1ldGHmlofku7blpLHotKU6JywgZXJyb3IpO1xuICAgICAgICAgICAgICAgIHJlc29sdmUoeyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6IGVycm9yLm1lc3NhZ2UgfHwgJ+WIm+W7um1ldGHmlofku7blpLHotKUnIH0pO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIOS9v+eUqCBhc3NldC1kYiBBUEkg6YeN5paw5a+85YWl6LWE5rqQXG4gICAgICovXG4gICAgcHJpdmF0ZSBhc3luYyByZWltcG9ydEFzc2V0V2l0aEFzc2V0REIoYXNzZXRQYXRoOiBzdHJpbmcpOiBQcm9taXNlPHsgc3VjY2VzczogYm9vbGVhbjsgZGF0YT86IGFueTsgZXJyb3I/OiBzdHJpbmcgfT4ge1xuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHtcbiAgICAgICAgICAgIEVkaXRvci5NZXNzYWdlLnJlcXVlc3QoJ2Fzc2V0LWRiJywgJ3JlaW1wb3J0LWFzc2V0JywgYXNzZXRQYXRoKS50aGVuKChyZXN1bHQ6IGFueSkgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCfph43mlrDlr7zlhaXotYTmupDmiJDlip86JywgcmVzdWx0KTtcbiAgICAgICAgICAgICAgICByZXNvbHZlKHsgc3VjY2VzczogdHJ1ZSwgZGF0YTogcmVzdWx0IH0pO1xuICAgICAgICAgICAgfSkuY2F0Y2goKGVycm9yOiBhbnkpID0+IHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKCfph43mlrDlr7zlhaXotYTmupDlpLHotKU6JywgZXJyb3IpO1xuICAgICAgICAgICAgICAgIHJlc29sdmUoeyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6IGVycm9yLm1lc3NhZ2UgfHwgJ+mHjeaWsOWvvOWFpei1hOa6kOWksei0pScgfSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICog5L2/55SoIGFzc2V0LWRiIEFQSSDmm7TmlrDotYTmupDmlofku7blhoXlrrlcbiAgICAgKi9cbiAgICBwcml2YXRlIGFzeW5jIHVwZGF0ZUFzc2V0V2l0aEFzc2V0REIoYXNzZXRQYXRoOiBzdHJpbmcsIGNvbnRlbnQ6IHN0cmluZyk6IFByb21pc2U8eyBzdWNjZXNzOiBib29sZWFuOyBkYXRhPzogYW55OyBlcnJvcj86IHN0cmluZyB9PiB7XG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSkgPT4ge1xuICAgICAgICAgICAgRWRpdG9yLk1lc3NhZ2UucmVxdWVzdCgnYXNzZXQtZGInLCAnc2F2ZS1hc3NldCcsIGFzc2V0UGF0aCwgY29udGVudCkudGhlbigocmVzdWx0OiBhbnkpID0+IHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygn5pu05paw6LWE5rqQ5paH5Lu25oiQ5YqfOicsIHJlc3VsdCk7XG4gICAgICAgICAgICAgICAgcmVzb2x2ZSh7IHN1Y2Nlc3M6IHRydWUsIGRhdGE6IHJlc3VsdCB9KTtcbiAgICAgICAgICAgIH0pLmNhdGNoKChlcnJvcjogYW55KSA9PiB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcign5pu05paw6LWE5rqQ5paH5Lu25aSx6LSlOicsIGVycm9yKTtcbiAgICAgICAgICAgICAgICByZXNvbHZlKHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiBlcnJvci5tZXNzYWdlIHx8ICfmm7TmlrDotYTmupDmlofku7blpLHotKUnIH0pO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIOWIm+W7uuespuWQiCBDb2NvcyBDcmVhdG9yIOagh+WHhueahOmihOWItuS9k+WGheWuuVxuICAgICAqIOWujOaVtOWunueOsOmAkuW9kuiKgueCueagkeWkhOeQhu+8jOWMuemFjeW8leaTjuagh+WHhuagvOW8j1xuICAgICAqL1xuICAgIHByaXZhdGUgYXN5bmMgY3JlYXRlU3RhbmRhcmRQcmVmYWJDb250ZW50KG5vZGVEYXRhOiBhbnksIHByZWZhYk5hbWU6IHN0cmluZywgcHJlZmFiVXVpZDogc3RyaW5nLCBpbmNsdWRlQ2hpbGRyZW46IGJvb2xlYW4sIGluY2x1ZGVDb21wb25lbnRzOiBib29sZWFuKTogUHJvbWlzZTxhbnlbXT4ge1xuICAgICAgICBjb25zb2xlLmxvZygn5byA5aeL5Yib5bu65byV5pOO5qCH5YeG6aKE5Yi25L2T5YaF5a65Li4uJyk7XG4gICAgICAgIFxuICAgICAgICBjb25zdCBwcmVmYWJEYXRhOiBhbnlbXSA9IFtdO1xuICAgICAgICBsZXQgY3VycmVudElkID0gMDtcblxuICAgICAgICAvLyAxLiDliJvlu7rpooTliLbkvZPotYTkuqflr7nosaEgKGluZGV4IDApXG4gICAgICAgIGNvbnN0IHByZWZhYkFzc2V0ID0ge1xuICAgICAgICAgICAgXCJfX3R5cGVfX1wiOiBcImNjLlByZWZhYlwiLFxuICAgICAgICAgICAgXCJfbmFtZVwiOiBwcmVmYWJOYW1lIHx8IFwiXCIsIC8vIOehruS/nemihOWItuS9k+WQjeensOS4jeS4uuepulxuICAgICAgICAgICAgXCJfb2JqRmxhZ3NcIjogMCxcbiAgICAgICAgICAgIFwiX19lZGl0b3JFeHRyYXNfX1wiOiB7fSxcbiAgICAgICAgICAgIFwiX25hdGl2ZVwiOiBcIlwiLFxuICAgICAgICAgICAgXCJkYXRhXCI6IHtcbiAgICAgICAgICAgICAgICBcIl9faWRfX1wiOiAxXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgXCJvcHRpbWl6YXRpb25Qb2xpY3lcIjogMCxcbiAgICAgICAgICAgIFwicGVyc2lzdGVudFwiOiBmYWxzZVxuICAgICAgICB9O1xuICAgICAgICBwcmVmYWJEYXRhLnB1c2gocHJlZmFiQXNzZXQpO1xuICAgICAgICBjdXJyZW50SWQrKztcblxuICAgICAgICAvLyAyLiDpgJLlvZLliJvlu7rlrozmlbTnmoToioLngrnmoJHnu5PmnoRcbiAgICAgICAgY29uc3QgY29udGV4dCA9IHtcbiAgICAgICAgICAgIHByZWZhYkRhdGEsXG4gICAgICAgICAgICBjdXJyZW50SWQ6IGN1cnJlbnRJZCArIDEsIC8vIOagueiKgueCueWNoOeUqOe0ouW8lTHvvIzlrZDoioLngrnku47ntKLlvJUy5byA5aeLXG4gICAgICAgICAgICBwcmVmYWJBc3NldEluZGV4OiAwLFxuICAgICAgICAgICAgbm9kZUZpbGVJZHM6IG5ldyBNYXA8c3RyaW5nLCBzdHJpbmc+KCksIC8vIOWtmOWCqOiKgueCuUlE5YiwZmlsZUlk55qE5pig5bCEXG4gICAgICAgICAgICBub2RlVXVpZFRvSW5kZXg6IG5ldyBNYXA8c3RyaW5nLCBudW1iZXI+KCksIC8vIOWtmOWCqOiKgueCuVVVSUTliLDntKLlvJXnmoTmmKDlsIRcbiAgICAgICAgICAgIGNvbXBvbmVudFV1aWRUb0luZGV4OiBuZXcgTWFwPHN0cmluZywgbnVtYmVyPigpIC8vIOWtmOWCqOe7hOS7tlVVSUTliLDntKLlvJXnmoTmmKDlsIRcbiAgICAgICAgfTtcblxuICAgICAgICAvLyDliJvlu7rmoLnoioLngrnlkozmlbTkuKroioLngrnmoJEgLSDms6jmhI/vvJrmoLnoioLngrnnmoTniLboioLngrnlupTor6XmmK9udWxs77yM5LiN5piv6aKE5Yi25L2T5a+56LGhXG4gICAgICAgIGF3YWl0IHRoaXMuY3JlYXRlQ29tcGxldGVOb2RlVHJlZShub2RlRGF0YSwgbnVsbCwgMSwgY29udGV4dCwgaW5jbHVkZUNoaWxkcmVuLCBpbmNsdWRlQ29tcG9uZW50cywgcHJlZmFiTmFtZSk7XG5cbiAgICAgICAgY29uc29sZS5sb2coYOmihOWItuS9k+WGheWuueWIm+W7uuWujOaIkO+8jOaAu+WFsSAke3ByZWZhYkRhdGEubGVuZ3RofSDkuKrlr7nosaFgKTtcbiAgICAgICAgY29uc29sZS5sb2coJ+iKgueCuWZpbGVJZOaYoOWwhDonLCBBcnJheS5mcm9tKGNvbnRleHQubm9kZUZpbGVJZHMuZW50cmllcygpKSk7XG4gICAgICAgIFxuICAgICAgICByZXR1cm4gcHJlZmFiRGF0YTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiDpgJLlvZLliJvlu7rlrozmlbTnmoToioLngrnmoJHvvIzljIXmi6zmiYDmnInlrZDoioLngrnlkozlr7nlupTnmoRQcmVmYWJJbmZvXG4gICAgICovXG4gICAgcHJpdmF0ZSBhc3luYyBjcmVhdGVDb21wbGV0ZU5vZGVUcmVlKFxuICAgICAgICBub2RlRGF0YTogYW55LCBcbiAgICAgICAgcGFyZW50Tm9kZUluZGV4OiBudW1iZXIgfCBudWxsLCBcbiAgICAgICAgbm9kZUluZGV4OiBudW1iZXIsXG4gICAgICAgIGNvbnRleHQ6IHsgXG4gICAgICAgICAgICBwcmVmYWJEYXRhOiBhbnlbXSwgXG4gICAgICAgICAgICBjdXJyZW50SWQ6IG51bWJlciwgXG4gICAgICAgICAgICBwcmVmYWJBc3NldEluZGV4OiBudW1iZXIsIFxuICAgICAgICAgICAgbm9kZUZpbGVJZHM6IE1hcDxzdHJpbmcsIHN0cmluZz4sXG4gICAgICAgICAgICBub2RlVXVpZFRvSW5kZXg6IE1hcDxzdHJpbmcsIG51bWJlcj4sXG4gICAgICAgICAgICBjb21wb25lbnRVdWlkVG9JbmRleDogTWFwPHN0cmluZywgbnVtYmVyPlxuICAgICAgICB9LFxuICAgICAgICBpbmNsdWRlQ2hpbGRyZW46IGJvb2xlYW4sXG4gICAgICAgIGluY2x1ZGVDb21wb25lbnRzOiBib29sZWFuLFxuICAgICAgICBub2RlTmFtZT86IHN0cmluZ1xuICAgICk6IFByb21pc2U8dm9pZD4ge1xuICAgICAgICBjb25zdCB7IHByZWZhYkRhdGEgfSA9IGNvbnRleHQ7XG4gICAgICAgIFxuICAgICAgICAvLyDliJvlu7roioLngrnlr7nosaFcbiAgICAgICAgY29uc3Qgbm9kZSA9IHRoaXMuY3JlYXRlRW5naW5lU3RhbmRhcmROb2RlKG5vZGVEYXRhLCBwYXJlbnROb2RlSW5kZXgsIG5vZGVOYW1lKTtcbiAgICAgICAgXG4gICAgICAgIC8vIOehruS/neiKgueCueWcqOaMh+WumueahOe0ouW8leS9jee9rlxuICAgICAgICB3aGlsZSAocHJlZmFiRGF0YS5sZW5ndGggPD0gbm9kZUluZGV4KSB7XG4gICAgICAgICAgICBwcmVmYWJEYXRhLnB1c2gobnVsbCk7XG4gICAgICAgIH1cbiAgICAgICAgY29uc29sZS5sb2coYOiuvue9ruiKgueCueWIsOe0ouW8lSAke25vZGVJbmRleH06ICR7bm9kZS5fbmFtZX0sIF9wYXJlbnQ6YCwgbm9kZS5fcGFyZW50LCBgX2NoaWxkcmVuIGNvdW50OiAke25vZGUuX2NoaWxkcmVuLmxlbmd0aH1gKTtcbiAgICAgICAgcHJlZmFiRGF0YVtub2RlSW5kZXhdID0gbm9kZTtcbiAgICAgICAgXG4gICAgICAgIC8vIOS4uuW9k+WJjeiKgueCueeUn+aIkGZpbGVJZOW5tuiusOW9lVVVSUTliLDntKLlvJXnmoTmmKDlsIRcbiAgICAgICAgY29uc3Qgbm9kZVV1aWQgPSB0aGlzLmV4dHJhY3ROb2RlVXVpZChub2RlRGF0YSk7XG4gICAgICAgIGNvbnN0IGZpbGVJZCA9IG5vZGVVdWlkIHx8IHRoaXMuZ2VuZXJhdGVGaWxlSWQoKTtcbiAgICAgICAgY29udGV4dC5ub2RlRmlsZUlkcy5zZXQobm9kZUluZGV4LnRvU3RyaW5nKCksIGZpbGVJZCk7XG4gICAgICAgIFxuICAgICAgICAvLyDorrDlvZXoioLngrlVVUlE5Yiw57Si5byV55qE5pig5bCEXG4gICAgICAgIGlmIChub2RlVXVpZCkge1xuICAgICAgICAgICAgY29udGV4dC5ub2RlVXVpZFRvSW5kZXguc2V0KG5vZGVVdWlkLCBub2RlSW5kZXgpO1xuICAgICAgICAgICAgY29uc29sZS5sb2coYOiusOW9leiKgueCuVVVSUTmmKDlsIQ6ICR7bm9kZVV1aWR9IC0+ICR7bm9kZUluZGV4fWApO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8g5YWI5aSE55CG5a2Q6IqC54K577yI5L+d5oyB5LiO5omL5Yqo5Yib5bu655qE57Si5byV6aG65bqP5LiA6Ie077yJXG4gICAgICAgIGNvbnN0IGNoaWxkcmVuVG9Qcm9jZXNzID0gdGhpcy5nZXRDaGlsZHJlblRvUHJvY2Vzcyhub2RlRGF0YSk7XG4gICAgICAgIGlmIChpbmNsdWRlQ2hpbGRyZW4gJiYgY2hpbGRyZW5Ub1Byb2Nlc3MubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgY29uc29sZS5sb2coYOWkhOeQhuiKgueCuSAke25vZGUuX25hbWV9IOeahCAke2NoaWxkcmVuVG9Qcm9jZXNzLmxlbmd0aH0g5Liq5a2Q6IqC54K5YCk7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIC8vIOS4uuavj+S4quWtkOiKgueCueWIhumFjee0ouW8lVxuICAgICAgICAgICAgY29uc3QgY2hpbGRJbmRpY2VzOiBudW1iZXJbXSA9IFtdO1xuICAgICAgICAgICAgY29uc29sZS5sb2coYOWHhuWkh+S4uiAke2NoaWxkcmVuVG9Qcm9jZXNzLmxlbmd0aH0g5Liq5a2Q6IqC54K55YiG6YWN57Si5byV77yM5b2T5YmNSUQ6ICR7Y29udGV4dC5jdXJyZW50SWR9YCk7XG4gICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGNoaWxkcmVuVG9Qcm9jZXNzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coYOWkhOeQhuesrCAke2krMX0g5Liq5a2Q6IqC54K577yM5b2T5YmNY3VycmVudElkOiAke2NvbnRleHQuY3VycmVudElkfWApO1xuICAgICAgICAgICAgICAgIGNvbnN0IGNoaWxkSW5kZXggPSBjb250ZXh0LmN1cnJlbnRJZCsrO1xuICAgICAgICAgICAgICAgIGNoaWxkSW5kaWNlcy5wdXNoKGNoaWxkSW5kZXgpO1xuICAgICAgICAgICAgICAgIG5vZGUuX2NoaWxkcmVuLnB1c2goeyBcIl9faWRfX1wiOiBjaGlsZEluZGV4IH0pO1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGDinIUg5re75Yqg5a2Q6IqC54K55byV55So5YiwICR7bm9kZS5fbmFtZX06IHtfX2lkX186ICR7Y2hpbGRJbmRleH19YCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhg4pyFIOiKgueCuSAke25vZGUuX25hbWV9IOacgOe7iOeahOWtkOiKgueCueaVsOe7hDpgLCBub2RlLl9jaGlsZHJlbik7XG5cbiAgICAgICAgICAgIC8vIOmAkuW9kuWIm+W7uuWtkOiKgueCuVxuICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBjaGlsZHJlblRvUHJvY2Vzcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgIGNvbnN0IGNoaWxkRGF0YSA9IGNoaWxkcmVuVG9Qcm9jZXNzW2ldO1xuICAgICAgICAgICAgICAgIGNvbnN0IGNoaWxkSW5kZXggPSBjaGlsZEluZGljZXNbaV07XG4gICAgICAgICAgICAgICAgYXdhaXQgdGhpcy5jcmVhdGVDb21wbGV0ZU5vZGVUcmVlKFxuICAgICAgICAgICAgICAgICAgICBjaGlsZERhdGEsIFxuICAgICAgICAgICAgICAgICAgICBub2RlSW5kZXgsIFxuICAgICAgICAgICAgICAgICAgICBjaGlsZEluZGV4LCBcbiAgICAgICAgICAgICAgICAgICAgY29udGV4dCxcbiAgICAgICAgICAgICAgICAgICAgaW5jbHVkZUNoaWxkcmVuLFxuICAgICAgICAgICAgICAgICAgICBpbmNsdWRlQ29tcG9uZW50cyxcbiAgICAgICAgICAgICAgICAgICAgY2hpbGREYXRhLm5hbWUgfHwgYENoaWxkJHtpKzF9YFxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAvLyDnhLblkI7lpITnkIbnu4Tku7ZcbiAgICAgICAgaWYgKGluY2x1ZGVDb21wb25lbnRzICYmIG5vZGVEYXRhLmNvbXBvbmVudHMgJiYgQXJyYXkuaXNBcnJheShub2RlRGF0YS5jb21wb25lbnRzKSkge1xuICAgICAgICAgICAgY29uc29sZS5sb2coYOWkhOeQhuiKgueCuSAke25vZGUuX25hbWV9IOeahCAke25vZGVEYXRhLmNvbXBvbmVudHMubGVuZ3RofSDkuKrnu4Tku7ZgKTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgY29uc3QgY29tcG9uZW50SW5kaWNlczogbnVtYmVyW10gPSBbXTtcbiAgICAgICAgICAgIGZvciAoY29uc3QgY29tcG9uZW50IG9mIG5vZGVEYXRhLmNvbXBvbmVudHMpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBjb21wb25lbnRJbmRleCA9IGNvbnRleHQuY3VycmVudElkKys7XG4gICAgICAgICAgICAgICAgY29tcG9uZW50SW5kaWNlcy5wdXNoKGNvbXBvbmVudEluZGV4KTtcbiAgICAgICAgICAgICAgICBub2RlLl9jb21wb25lbnRzLnB1c2goeyBcIl9faWRfX1wiOiBjb21wb25lbnRJbmRleCB9KTtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAvLyDorrDlvZXnu4Tku7ZVVUlE5Yiw57Si5byV55qE5pig5bCEXG4gICAgICAgICAgICAgICAgY29uc3QgY29tcG9uZW50VXVpZCA9IGNvbXBvbmVudC51dWlkIHx8IChjb21wb25lbnQudmFsdWUgJiYgY29tcG9uZW50LnZhbHVlLnV1aWQpO1xuICAgICAgICAgICAgICAgIGlmIChjb21wb25lbnRVdWlkKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnRleHQuY29tcG9uZW50VXVpZFRvSW5kZXguc2V0KGNvbXBvbmVudFV1aWQsIGNvbXBvbmVudEluZGV4KTtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coYOiusOW9lee7hOS7tlVVSUTmmKDlsIQ6ICR7Y29tcG9uZW50VXVpZH0gLT4gJHtjb21wb25lbnRJbmRleH1gKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgLy8g5Yib5bu657uE5Lu25a+56LGh77yM5Lyg5YWlY29udGV4dOS7peWkhOeQhuW8leeUqFxuICAgICAgICAgICAgICAgIGNvbnN0IGNvbXBvbmVudE9iaiA9IHRoaXMuY3JlYXRlQ29tcG9uZW50T2JqZWN0KGNvbXBvbmVudCwgbm9kZUluZGV4LCBjb250ZXh0KTtcbiAgICAgICAgICAgICAgICBwcmVmYWJEYXRhW2NvbXBvbmVudEluZGV4XSA9IGNvbXBvbmVudE9iajtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAvLyDkuLrnu4Tku7bliJvlu7ogQ29tcFByZWZhYkluZm9cbiAgICAgICAgICAgICAgICBjb25zdCBjb21wUHJlZmFiSW5mb0luZGV4ID0gY29udGV4dC5jdXJyZW50SWQrKztcbiAgICAgICAgICAgICAgICBwcmVmYWJEYXRhW2NvbXBQcmVmYWJJbmZvSW5kZXhdID0ge1xuICAgICAgICAgICAgICAgICAgICBcIl9fdHlwZV9fXCI6IFwiY2MuQ29tcFByZWZhYkluZm9cIixcbiAgICAgICAgICAgICAgICAgICAgXCJmaWxlSWRcIjogdGhpcy5nZW5lcmF0ZUZpbGVJZCgpXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAvLyDlpoLmnpznu4Tku7blr7nosaHmnIkgX19wcmVmYWIg5bGe5oCn77yM6K6+572u5byV55SoXG4gICAgICAgICAgICAgICAgaWYgKGNvbXBvbmVudE9iaiAmJiB0eXBlb2YgY29tcG9uZW50T2JqID09PSAnb2JqZWN0Jykge1xuICAgICAgICAgICAgICAgICAgICBjb21wb25lbnRPYmouX19wcmVmYWIgPSB7IFwiX19pZF9fXCI6IGNvbXBQcmVmYWJJbmZvSW5kZXggfTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGDinIUg6IqC54K5ICR7bm9kZS5fbmFtZX0g5re75Yqg5LqGICR7Y29tcG9uZW50SW5kaWNlcy5sZW5ndGh9IOS4que7hOS7tmApO1xuICAgICAgICB9XG5cblxuICAgICAgICAvLyDkuLrlvZPliY3oioLngrnliJvlu7pQcmVmYWJJbmZvXG4gICAgICAgIGNvbnN0IHByZWZhYkluZm9JbmRleCA9IGNvbnRleHQuY3VycmVudElkKys7XG4gICAgICAgIG5vZGUuX3ByZWZhYiA9IHsgXCJfX2lkX19cIjogcHJlZmFiSW5mb0luZGV4IH07XG4gICAgICAgIFxuICAgICAgICBjb25zdCBwcmVmYWJJbmZvOiBhbnkgPSB7XG4gICAgICAgICAgICBcIl9fdHlwZV9fXCI6IFwiY2MuUHJlZmFiSW5mb1wiLFxuICAgICAgICAgICAgXCJyb290XCI6IHsgXCJfX2lkX19cIjogMSB9LFxuICAgICAgICAgICAgXCJhc3NldFwiOiB7IFwiX19pZF9fXCI6IGNvbnRleHQucHJlZmFiQXNzZXRJbmRleCB9LFxuICAgICAgICAgICAgXCJmaWxlSWRcIjogZmlsZUlkLFxuICAgICAgICAgICAgXCJ0YXJnZXRPdmVycmlkZXNcIjogbnVsbCxcbiAgICAgICAgICAgIFwibmVzdGVkUHJlZmFiSW5zdGFuY2VSb290c1wiOiBudWxsXG4gICAgICAgIH07XG4gICAgICAgIFxuICAgICAgICAvLyDmoLnoioLngrnnmoTnibnmrorlpITnkIZcbiAgICAgICAgaWYgKG5vZGVJbmRleCA9PT0gMSkge1xuICAgICAgICAgICAgLy8g5qC56IqC54K55rKh5pyJaW5zdGFuY2XvvIzkvYblj6/og73mnIl0YXJnZXRPdmVycmlkZXNcbiAgICAgICAgICAgIHByZWZhYkluZm8uaW5zdGFuY2UgPSBudWxsO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgLy8g5a2Q6IqC54K56YCa5bi45pyJaW5zdGFuY2XkuLpudWxsXG4gICAgICAgICAgICBwcmVmYWJJbmZvLmluc3RhbmNlID0gbnVsbDtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgcHJlZmFiRGF0YVtwcmVmYWJJbmZvSW5kZXhdID0gcHJlZmFiSW5mbztcbiAgICAgICAgY29udGV4dC5jdXJyZW50SWQgPSBwcmVmYWJJbmZvSW5kZXggKyAxO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIOWwhlVVSUTovazmjaLkuLpDb2NvcyBDcmVhdG9y55qE5Y6L57yp5qC85byPXG4gICAgICog5Z+65LqO55yf5a6eQ29jb3MgQ3JlYXRvcue8lui+keWZqOeahOWOi+e8qeeul+azleWunueOsFxuICAgICAqIOWJjTXkuKpoZXjlrZfnrKbkv53mjIHkuI3lj5jvvIzliankvZkyN+S4quWtl+espuWOi+e8qeaIkDE45Liq5a2X56ymXG4gICAgICovXG4gICAgcHJpdmF0ZSB1dWlkVG9Db21wcmVzc2VkSWQodXVpZDogc3RyaW5nKTogc3RyaW5nIHtcbiAgICAgICAgY29uc3QgQkFTRTY0X0tFWVMgPSAnQUJDREVGR0hJSktMTU5PUFFSU1RVVldYWVphYmNkZWZnaGlqa2xtbm9wcXJzdHV2d3h5ejAxMjM0NTY3ODkrLz0nO1xuICAgICAgICBcbiAgICAgICAgLy8g56e76Zmk6L+e5a2X56ym5bm26L2s5Li65bCP5YaZXG4gICAgICAgIGNvbnN0IGNsZWFuVXVpZCA9IHV1aWQucmVwbGFjZSgvLS9nLCAnJykudG9Mb3dlckNhc2UoKTtcbiAgICAgICAgXG4gICAgICAgIC8vIOehruS/nVVVSUTmnInmlYhcbiAgICAgICAgaWYgKGNsZWFuVXVpZC5sZW5ndGggIT09IDMyKSB7XG4gICAgICAgICAgICByZXR1cm4gdXVpZDsgLy8g5aaC5p6c5LiN5piv5pyJ5pWI55qEVVVJRO+8jOi/lOWbnuWOn+Wni+WAvFxuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICAvLyBDb2NvcyBDcmVhdG9y55qE5Y6L57yp566X5rOV77ya5YmNNeS4quWtl+espuS/neaMgeS4jeWPmO+8jOWJqeS9mTI35Liq5a2X56ym5Y6L57yp5oiQMTjkuKrlrZfnrKZcbiAgICAgICAgbGV0IHJlc3VsdCA9IGNsZWFuVXVpZC5zdWJzdHJpbmcoMCwgNSk7XG4gICAgICAgIFxuICAgICAgICAvLyDliankvZkyN+S4quWtl+espumcgOimgeWOi+e8qeaIkDE45Liq5a2X56ymXG4gICAgICAgIGNvbnN0IHJlbWFpbmRlciA9IGNsZWFuVXVpZC5zdWJzdHJpbmcoNSk7XG4gICAgICAgIFxuICAgICAgICAvLyDmr48z5LiqaGV45a2X56ym5Y6L57yp5oiQMuS4quWtl+esplxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHJlbWFpbmRlci5sZW5ndGg7IGkgKz0gMykge1xuICAgICAgICAgICAgY29uc3QgaGV4MSA9IHJlbWFpbmRlcltpXSB8fCAnMCc7XG4gICAgICAgICAgICBjb25zdCBoZXgyID0gcmVtYWluZGVyW2kgKyAxXSB8fCAnMCc7XG4gICAgICAgICAgICBjb25zdCBoZXgzID0gcmVtYWluZGVyW2kgKyAyXSB8fCAnMCc7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIC8vIOWwhjPkuKpoZXjlrZfnrKYoMTLkvY0p6L2s5o2i5Li6MuS4qmJhc2U2NOWtl+esplxuICAgICAgICAgICAgY29uc3QgdmFsdWUgPSBwYXJzZUludChoZXgxICsgaGV4MiArIGhleDMsIDE2KTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgLy8gMTLkvY3liIbmiJDkuKTkuKo25L2NXG4gICAgICAgICAgICBjb25zdCBoaWdoNiA9ICh2YWx1ZSA+PiA2KSAmIDYzO1xuICAgICAgICAgICAgY29uc3QgbG93NiA9IHZhbHVlICYgNjM7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHJlc3VsdCArPSBCQVNFNjRfS0VZU1toaWdoNl0gKyBCQVNFNjRfS0VZU1tsb3c2XTtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiDliJvlu7rnu4Tku7blr7nosaFcbiAgICAgKi9cbiAgICBwcml2YXRlIGNyZWF0ZUNvbXBvbmVudE9iamVjdChjb21wb25lbnREYXRhOiBhbnksIG5vZGVJbmRleDogbnVtYmVyLCBjb250ZXh0PzogeyBcbiAgICAgICAgbm9kZVV1aWRUb0luZGV4PzogTWFwPHN0cmluZywgbnVtYmVyPixcbiAgICAgICAgY29tcG9uZW50VXVpZFRvSW5kZXg/OiBNYXA8c3RyaW5nLCBudW1iZXI+XG4gICAgfSk6IGFueSB7XG4gICAgICAgIGxldCBjb21wb25lbnRUeXBlID0gY29tcG9uZW50RGF0YS50eXBlIHx8IGNvbXBvbmVudERhdGEuX190eXBlX18gfHwgJ2NjLkNvbXBvbmVudCc7XG4gICAgICAgIGNvbnN0IGVuYWJsZWQgPSBjb21wb25lbnREYXRhLmVuYWJsZWQgIT09IHVuZGVmaW5lZCA/IGNvbXBvbmVudERhdGEuZW5hYmxlZCA6IHRydWU7XG4gICAgICAgIFxuICAgICAgICAvLyBjb25zb2xlLmxvZyhg5Yib5bu657uE5Lu25a+56LGhIC0g5Y6f5aeL57G75Z6LOiAke2NvbXBvbmVudFR5cGV9YCk7XG4gICAgICAgIC8vIGNvbnNvbGUubG9nKCfnu4Tku7blrozmlbTmlbDmja46JywgSlNPTi5zdHJpbmdpZnkoY29tcG9uZW50RGF0YSwgbnVsbCwgMikpO1xuICAgICAgICBcbiAgICAgICAgLy8g5aSE55CG6ISa5pys57uE5Lu2IC0gTUNQ5o6l5Y+j5bey57uP6L+U5Zue5q2j56Gu55qE5Y6L57ypVVVJROagvOW8j1xuICAgICAgICBpZiAoY29tcG9uZW50VHlwZSAmJiAhY29tcG9uZW50VHlwZS5zdGFydHNXaXRoKCdjYy4nKSkge1xuICAgICAgICAgICAgY29uc29sZS5sb2coYOS9v+eUqOiEmuacrOe7hOS7tuWOi+e8qVVVSUTnsbvlnos6ICR7Y29tcG9uZW50VHlwZX1gKTtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgLy8g5Z+656GA57uE5Lu257uT5p6EXG4gICAgICAgIGNvbnN0IGNvbXBvbmVudDogYW55ID0ge1xuICAgICAgICAgICAgXCJfX3R5cGVfX1wiOiBjb21wb25lbnRUeXBlLFxuICAgICAgICAgICAgXCJfbmFtZVwiOiBcIlwiLFxuICAgICAgICAgICAgXCJfb2JqRmxhZ3NcIjogMCxcbiAgICAgICAgICAgIFwiX19lZGl0b3JFeHRyYXNfX1wiOiB7fSxcbiAgICAgICAgICAgIFwibm9kZVwiOiB7IFwiX19pZF9fXCI6IG5vZGVJbmRleCB9LFxuICAgICAgICAgICAgXCJfZW5hYmxlZFwiOiBlbmFibGVkXG4gICAgICAgIH07XG4gICAgICAgIFxuICAgICAgICAvLyDmj5DliY3orr7nva4gX19wcmVmYWIg5bGe5oCn5Y2g5L2N56ym77yM5ZCO57ut5Lya6KKr5q2j56Gu6K6+572uXG4gICAgICAgIGNvbXBvbmVudC5fX3ByZWZhYiA9IG51bGw7XG4gICAgICAgIFxuICAgICAgICAvLyDmoLnmja7nu4Tku7bnsbvlnovmt7vliqDnibnlrprlsZ7mgKdcbiAgICAgICAgaWYgKGNvbXBvbmVudFR5cGUgPT09ICdjYy5VSVRyYW5zZm9ybScpIHtcbiAgICAgICAgICAgIGNvbnN0IGNvbnRlbnRTaXplID0gY29tcG9uZW50RGF0YS5wcm9wZXJ0aWVzPy5jb250ZW50U2l6ZT8udmFsdWUgfHwgeyB3aWR0aDogMTAwLCBoZWlnaHQ6IDEwMCB9O1xuICAgICAgICAgICAgY29uc3QgYW5jaG9yUG9pbnQgPSBjb21wb25lbnREYXRhLnByb3BlcnRpZXM/LmFuY2hvclBvaW50Py52YWx1ZSB8fCB7IHg6IDAuNSwgeTogMC41IH07XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGNvbXBvbmVudC5fY29udGVudFNpemUgPSB7XG4gICAgICAgICAgICAgICAgXCJfX3R5cGVfX1wiOiBcImNjLlNpemVcIixcbiAgICAgICAgICAgICAgICBcIndpZHRoXCI6IGNvbnRlbnRTaXplLndpZHRoLFxuICAgICAgICAgICAgICAgIFwiaGVpZ2h0XCI6IGNvbnRlbnRTaXplLmhlaWdodFxuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIGNvbXBvbmVudC5fYW5jaG9yUG9pbnQgPSB7XG4gICAgICAgICAgICAgICAgXCJfX3R5cGVfX1wiOiBcImNjLlZlYzJcIixcbiAgICAgICAgICAgICAgICBcInhcIjogYW5jaG9yUG9pbnQueCxcbiAgICAgICAgICAgICAgICBcInlcIjogYW5jaG9yUG9pbnQueVxuICAgICAgICAgICAgfTtcbiAgICAgICAgfSBlbHNlIGlmIChjb21wb25lbnRUeXBlID09PSAnY2MuU3ByaXRlJykge1xuICAgICAgICAgICAgLy8g5aSE55CGU3ByaXRl57uE5Lu255qEc3ByaXRlRnJhbWXlvJXnlKhcbiAgICAgICAgICAgIGNvbnN0IHNwcml0ZUZyYW1lUHJvcCA9IGNvbXBvbmVudERhdGEucHJvcGVydGllcz8uX3Nwcml0ZUZyYW1lIHx8IGNvbXBvbmVudERhdGEucHJvcGVydGllcz8uc3ByaXRlRnJhbWU7XG4gICAgICAgICAgICBpZiAoc3ByaXRlRnJhbWVQcm9wKSB7XG4gICAgICAgICAgICAgICAgY29tcG9uZW50Ll9zcHJpdGVGcmFtZSA9IHRoaXMucHJvY2Vzc0NvbXBvbmVudFByb3BlcnR5KHNwcml0ZUZyYW1lUHJvcCwgY29udGV4dCk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGNvbXBvbmVudC5fc3ByaXRlRnJhbWUgPSBudWxsO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgXG4gICAgICAgICAgICBjb21wb25lbnQuX3R5cGUgPSBjb21wb25lbnREYXRhLnByb3BlcnRpZXM/Ll90eXBlPy52YWx1ZSA/PyAwO1xuICAgICAgICAgICAgY29tcG9uZW50Ll9maWxsVHlwZSA9IGNvbXBvbmVudERhdGEucHJvcGVydGllcz8uX2ZpbGxUeXBlPy52YWx1ZSA/PyAwO1xuICAgICAgICAgICAgY29tcG9uZW50Ll9zaXplTW9kZSA9IGNvbXBvbmVudERhdGEucHJvcGVydGllcz8uX3NpemVNb2RlPy52YWx1ZSA/PyAxO1xuICAgICAgICAgICAgY29tcG9uZW50Ll9maWxsQ2VudGVyID0geyBcIl9fdHlwZV9fXCI6IFwiY2MuVmVjMlwiLCBcInhcIjogMCwgXCJ5XCI6IDAgfTtcbiAgICAgICAgICAgIGNvbXBvbmVudC5fZmlsbFN0YXJ0ID0gY29tcG9uZW50RGF0YS5wcm9wZXJ0aWVzPy5fZmlsbFN0YXJ0Py52YWx1ZSA/PyAwO1xuICAgICAgICAgICAgY29tcG9uZW50Ll9maWxsUmFuZ2UgPSBjb21wb25lbnREYXRhLnByb3BlcnRpZXM/Ll9maWxsUmFuZ2U/LnZhbHVlID8/IDA7XG4gICAgICAgICAgICBjb21wb25lbnQuX2lzVHJpbW1lZE1vZGUgPSBjb21wb25lbnREYXRhLnByb3BlcnRpZXM/Ll9pc1RyaW1tZWRNb2RlPy52YWx1ZSA/PyB0cnVlO1xuICAgICAgICAgICAgY29tcG9uZW50Ll91c2VHcmF5c2NhbGUgPSBjb21wb25lbnREYXRhLnByb3BlcnRpZXM/Ll91c2VHcmF5c2NhbGU/LnZhbHVlID8/IGZhbHNlO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICAvLyDosIPor5XvvJrmiZPljbBTcHJpdGXnu4Tku7bnmoTmiYDmnInlsZ7mgKfvvIjlt7Lms6jph4rvvIlcbiAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKCdTcHJpdGXnu4Tku7blsZ7mgKc6JywgSlNPTi5zdHJpbmdpZnkoY29tcG9uZW50RGF0YS5wcm9wZXJ0aWVzLCBudWxsLCAyKSk7XG4gICAgICAgICAgICBjb21wb25lbnQuX2F0bGFzID0gbnVsbDtcbiAgICAgICAgICAgIGNvbXBvbmVudC5faWQgPSBcIlwiO1xuICAgICAgICB9IGVsc2UgaWYgKGNvbXBvbmVudFR5cGUgPT09ICdjYy5CdXR0b24nKSB7XG4gICAgICAgICAgICBjb21wb25lbnQuX2ludGVyYWN0YWJsZSA9IHRydWU7XG4gICAgICAgICAgICBjb21wb25lbnQuX3RyYW5zaXRpb24gPSAzO1xuICAgICAgICAgICAgY29tcG9uZW50Ll9ub3JtYWxDb2xvciA9IHsgXCJfX3R5cGVfX1wiOiBcImNjLkNvbG9yXCIsIFwiclwiOiAyNTUsIFwiZ1wiOiAyNTUsIFwiYlwiOiAyNTUsIFwiYVwiOiAyNTUgfTtcbiAgICAgICAgICAgIGNvbXBvbmVudC5faG92ZXJDb2xvciA9IHsgXCJfX3R5cGVfX1wiOiBcImNjLkNvbG9yXCIsIFwiclwiOiAyMTEsIFwiZ1wiOiAyMTEsIFwiYlwiOiAyMTEsIFwiYVwiOiAyNTUgfTtcbiAgICAgICAgICAgIGNvbXBvbmVudC5fcHJlc3NlZENvbG9yID0geyBcIl9fdHlwZV9fXCI6IFwiY2MuQ29sb3JcIiwgXCJyXCI6IDI1NSwgXCJnXCI6IDI1NSwgXCJiXCI6IDI1NSwgXCJhXCI6IDI1NSB9O1xuICAgICAgICAgICAgY29tcG9uZW50Ll9kaXNhYmxlZENvbG9yID0geyBcIl9fdHlwZV9fXCI6IFwiY2MuQ29sb3JcIiwgXCJyXCI6IDEyNCwgXCJnXCI6IDEyNCwgXCJiXCI6IDEyNCwgXCJhXCI6IDI1NSB9O1xuICAgICAgICAgICAgY29tcG9uZW50Ll9ub3JtYWxTcHJpdGUgPSBudWxsO1xuICAgICAgICAgICAgY29tcG9uZW50Ll9ob3ZlclNwcml0ZSA9IG51bGw7XG4gICAgICAgICAgICBjb21wb25lbnQuX3ByZXNzZWRTcHJpdGUgPSBudWxsO1xuICAgICAgICAgICAgY29tcG9uZW50Ll9kaXNhYmxlZFNwcml0ZSA9IG51bGw7XG4gICAgICAgICAgICBjb21wb25lbnQuX2R1cmF0aW9uID0gMC4xO1xuICAgICAgICAgICAgY29tcG9uZW50Ll96b29tU2NhbGUgPSAxLjI7XG4gICAgICAgICAgICAvLyDlpITnkIZCdXR0b27nmoR0YXJnZXTlvJXnlKhcbiAgICAgICAgICAgIGNvbnN0IHRhcmdldFByb3AgPSBjb21wb25lbnREYXRhLnByb3BlcnRpZXM/Ll90YXJnZXQgfHwgY29tcG9uZW50RGF0YS5wcm9wZXJ0aWVzPy50YXJnZXQ7XG4gICAgICAgICAgICBpZiAodGFyZ2V0UHJvcCkge1xuICAgICAgICAgICAgICAgIGNvbXBvbmVudC5fdGFyZ2V0ID0gdGhpcy5wcm9jZXNzQ29tcG9uZW50UHJvcGVydHkodGFyZ2V0UHJvcCwgY29udGV4dCk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGNvbXBvbmVudC5fdGFyZ2V0ID0geyBcIl9faWRfX1wiOiBub2RlSW5kZXggfTsgLy8g6buY6K6k5oyH5ZCR6Ieq6Lqr6IqC54K5XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb21wb25lbnQuX2NsaWNrRXZlbnRzID0gW107XG4gICAgICAgICAgICBjb21wb25lbnQuX2lkID0gXCJcIjtcbiAgICAgICAgfSBlbHNlIGlmIChjb21wb25lbnRUeXBlID09PSAnY2MuTGFiZWwnKSB7XG4gICAgICAgICAgICBjb21wb25lbnQuX3N0cmluZyA9IGNvbXBvbmVudERhdGEucHJvcGVydGllcz8uX3N0cmluZz8udmFsdWUgfHwgXCJMYWJlbFwiO1xuICAgICAgICAgICAgY29tcG9uZW50Ll9ob3Jpem9udGFsQWxpZ24gPSAxO1xuICAgICAgICAgICAgY29tcG9uZW50Ll92ZXJ0aWNhbEFsaWduID0gMTtcbiAgICAgICAgICAgIGNvbXBvbmVudC5fYWN0dWFsRm9udFNpemUgPSAyMDtcbiAgICAgICAgICAgIGNvbXBvbmVudC5fZm9udFNpemUgPSAyMDtcbiAgICAgICAgICAgIGNvbXBvbmVudC5fZm9udEZhbWlseSA9IFwiQXJpYWxcIjtcbiAgICAgICAgICAgIGNvbXBvbmVudC5fbGluZUhlaWdodCA9IDI1O1xuICAgICAgICAgICAgY29tcG9uZW50Ll9vdmVyZmxvdyA9IDA7XG4gICAgICAgICAgICBjb21wb25lbnQuX2VuYWJsZVdyYXBUZXh0ID0gdHJ1ZTtcbiAgICAgICAgICAgIGNvbXBvbmVudC5fZm9udCA9IG51bGw7XG4gICAgICAgICAgICBjb21wb25lbnQuX2lzU3lzdGVtRm9udFVzZWQgPSB0cnVlO1xuICAgICAgICAgICAgY29tcG9uZW50Ll9zcGFjaW5nWCA9IDA7XG4gICAgICAgICAgICBjb21wb25lbnQuX2lzSXRhbGljID0gZmFsc2U7XG4gICAgICAgICAgICBjb21wb25lbnQuX2lzQm9sZCA9IGZhbHNlO1xuICAgICAgICAgICAgY29tcG9uZW50Ll9pc1VuZGVybGluZSA9IGZhbHNlO1xuICAgICAgICAgICAgY29tcG9uZW50Ll91bmRlcmxpbmVIZWlnaHQgPSAyO1xuICAgICAgICAgICAgY29tcG9uZW50Ll9jYWNoZU1vZGUgPSAwO1xuICAgICAgICAgICAgY29tcG9uZW50Ll9pZCA9IFwiXCI7XG4gICAgICAgIH0gZWxzZSBpZiAoY29tcG9uZW50RGF0YS5wcm9wZXJ0aWVzKSB7XG4gICAgICAgICAgICAvLyDlpITnkIbmiYDmnInnu4Tku7bnmoTlsZ7mgKfvvIjljIXmi6zlhoXnva7nu4Tku7blkozoh6rlrprkuYnohJrmnKznu4Tku7bvvIlcbiAgICAgICAgICAgIGZvciAoY29uc3QgW2tleSwgdmFsdWVdIG9mIE9iamVjdC5lbnRyaWVzKGNvbXBvbmVudERhdGEucHJvcGVydGllcykpIHtcbiAgICAgICAgICAgICAgICBpZiAoa2V5ID09PSAnbm9kZScgfHwga2V5ID09PSAnZW5hYmxlZCcgfHwga2V5ID09PSAnX190eXBlX18nIHx8IFxuICAgICAgICAgICAgICAgICAgICBrZXkgPT09ICd1dWlkJyB8fCBrZXkgPT09ICduYW1lJyB8fCBrZXkgPT09ICdfX3NjcmlwdEFzc2V0JyB8fCBrZXkgPT09ICdfb2JqRmxhZ3MnKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlOyAvLyDot7Pov4fov5nkupvnibnmrorlsZ7mgKfvvIzljIXmi6xfb2JqRmxhZ3NcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgLy8g5a+55LqO5Lul5LiL5YiS57q/5byA5aS055qE5bGe5oCn77yM6ZyA6KaB54m55q6K5aSE55CGXG4gICAgICAgICAgICAgICAgaWYgKGtleS5zdGFydHNXaXRoKCdfJykpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8g56Gu5L+d5bGe5oCn5ZCN5L+d5oyB5Y6f5qC377yI5YyF5ous5LiL5YiS57q/77yJXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHByb3BWYWx1ZSA9IHRoaXMucHJvY2Vzc0NvbXBvbmVudFByb3BlcnR5KHZhbHVlLCBjb250ZXh0KTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHByb3BWYWx1ZSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb21wb25lbnRba2V5XSA9IHByb3BWYWx1ZTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIOmdnuS4i+WIkue6v+W8gOWktOeahOWxnuaAp+ato+W4uOWkhOeQhlxuICAgICAgICAgICAgICAgICAgICBjb25zdCBwcm9wVmFsdWUgPSB0aGlzLnByb2Nlc3NDb21wb25lbnRQcm9wZXJ0eSh2YWx1ZSwgY29udGV4dCk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChwcm9wVmFsdWUgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29tcG9uZW50W2tleV0gPSBwcm9wVmFsdWU7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIC8vIOehruS/nSBfaWQg5Zyo5pyA5ZCO5L2N572uXG4gICAgICAgIGNvbnN0IF9pZCA9IGNvbXBvbmVudC5faWQgfHwgXCJcIjtcbiAgICAgICAgZGVsZXRlIGNvbXBvbmVudC5faWQ7XG4gICAgICAgIGNvbXBvbmVudC5faWQgPSBfaWQ7XG4gICAgICAgIFxuICAgICAgICByZXR1cm4gY29tcG9uZW50O1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIOWkhOeQhue7hOS7tuWxnuaAp+WAvO+8jOehruS/neagvOW8j+S4juaJi+WKqOWIm+W7uueahOmihOWItuS9k+S4gOiHtFxuICAgICAqL1xuICAgIHByaXZhdGUgcHJvY2Vzc0NvbXBvbmVudFByb3BlcnR5KHByb3BEYXRhOiBhbnksIGNvbnRleHQ/OiB7IFxuICAgICAgICBub2RlVXVpZFRvSW5kZXg/OiBNYXA8c3RyaW5nLCBudW1iZXI+LFxuICAgICAgICBjb21wb25lbnRVdWlkVG9JbmRleD86IE1hcDxzdHJpbmcsIG51bWJlcj5cbiAgICB9KTogYW55IHtcbiAgICAgICAgaWYgKCFwcm9wRGF0YSB8fCB0eXBlb2YgcHJvcERhdGEgIT09ICdvYmplY3QnKSB7XG4gICAgICAgICAgICByZXR1cm4gcHJvcERhdGE7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCB2YWx1ZSA9IHByb3BEYXRhLnZhbHVlO1xuICAgICAgICBjb25zdCB0eXBlID0gcHJvcERhdGEudHlwZTtcblxuICAgICAgICAvLyDlpITnkIZudWxs5YC8XG4gICAgICAgIGlmICh2YWx1ZSA9PT0gbnVsbCB8fCB2YWx1ZSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIOWkhOeQhuepulVVSUTlr7nosaHvvIzovazmjaLkuLpudWxsXG4gICAgICAgIGlmICh2YWx1ZSAmJiB0eXBlb2YgdmFsdWUgPT09ICdvYmplY3QnICYmIHZhbHVlLnV1aWQgPT09ICcnKSB7XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIOWkhOeQhuiKgueCueW8leeUqFxuICAgICAgICBpZiAodHlwZSA9PT0gJ2NjLk5vZGUnICYmIHZhbHVlPy51dWlkKSB7XG4gICAgICAgICAgICAvLyDlnKjpooTliLbkvZPkuK3vvIzoioLngrnlvJXnlKjpnIDopoHovazmjaLkuLogX19pZF9fIOW9ouW8j1xuICAgICAgICAgICAgaWYgKGNvbnRleHQ/Lm5vZGVVdWlkVG9JbmRleCAmJiBjb250ZXh0Lm5vZGVVdWlkVG9JbmRleC5oYXModmFsdWUudXVpZCkpIHtcbiAgICAgICAgICAgICAgICAvLyDlhoXpg6jlvJXnlKjvvJrovazmjaLkuLpfX2lkX1/moLzlvI9cbiAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICBcIl9faWRfX1wiOiBjb250ZXh0Lm5vZGVVdWlkVG9JbmRleC5nZXQodmFsdWUudXVpZClcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8g5aSW6YOo5byV55So77ya6K6+572u5Li6bnVsbO+8jOWboOS4uuWklumDqOiKgueCueS4jeWxnuS6jumihOWItuS9k+e7k+aehFxuICAgICAgICAgICAgY29uc29sZS53YXJuKGBOb2RlIHJlZmVyZW5jZSBVVUlEICR7dmFsdWUudXVpZH0gbm90IGZvdW5kIGluIHByZWZhYiBjb250ZXh0LCBzZXR0aW5nIHRvIG51bGwgKGV4dGVybmFsIHJlZmVyZW5jZSlgKTtcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8g5aSE55CG6LWE5rqQ5byV55So77yI6aKE5Yi25L2T44CB57q555CG44CB57K+54G15bin562J77yJXG4gICAgICAgIGlmICh2YWx1ZT8udXVpZCAmJiAoXG4gICAgICAgICAgICB0eXBlID09PSAnY2MuUHJlZmFiJyB8fCBcbiAgICAgICAgICAgIHR5cGUgPT09ICdjYy5UZXh0dXJlMkQnIHx8IFxuICAgICAgICAgICAgdHlwZSA9PT0gJ2NjLlNwcml0ZUZyYW1lJyB8fFxuICAgICAgICAgICAgdHlwZSA9PT0gJ2NjLk1hdGVyaWFsJyB8fFxuICAgICAgICAgICAgdHlwZSA9PT0gJ2NjLkFuaW1hdGlvbkNsaXAnIHx8XG4gICAgICAgICAgICB0eXBlID09PSAnY2MuQXVkaW9DbGlwJyB8fFxuICAgICAgICAgICAgdHlwZSA9PT0gJ2NjLkZvbnQnIHx8XG4gICAgICAgICAgICB0eXBlID09PSAnY2MuQXNzZXQnXG4gICAgICAgICkpIHtcbiAgICAgICAgICAgIC8vIOWvueS6jumihOWItuS9k+W8leeUqO+8jOS/neaMgeWOn+Wni1VVSUTmoLzlvI9cbiAgICAgICAgICAgIGNvbnN0IHV1aWRUb1VzZSA9IHR5cGUgPT09ICdjYy5QcmVmYWInID8gdmFsdWUudXVpZCA6IHRoaXMudXVpZFRvQ29tcHJlc3NlZElkKHZhbHVlLnV1aWQpO1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBcIl9fdXVpZF9fXCI6IHV1aWRUb1VzZSxcbiAgICAgICAgICAgICAgICBcIl9fZXhwZWN0ZWRUeXBlX19cIjogdHlwZVxuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIOWkhOeQhue7hOS7tuW8leeUqO+8iOWMheaLrOWFt+S9k+eahOe7hOS7tuexu+Wei+WmgmNjLkxhYmVsLCBjYy5CdXR0b27nrYnvvIlcbiAgICAgICAgaWYgKHZhbHVlPy51dWlkICYmICh0eXBlID09PSAnY2MuQ29tcG9uZW50JyB8fCBcbiAgICAgICAgICAgIHR5cGUgPT09ICdjYy5MYWJlbCcgfHwgdHlwZSA9PT0gJ2NjLkJ1dHRvbicgfHwgdHlwZSA9PT0gJ2NjLlNwcml0ZScgfHwgXG4gICAgICAgICAgICB0eXBlID09PSAnY2MuVUlUcmFuc2Zvcm0nIHx8IHR5cGUgPT09ICdjYy5SaWdpZEJvZHkyRCcgfHwgXG4gICAgICAgICAgICB0eXBlID09PSAnY2MuQm94Q29sbGlkZXIyRCcgfHwgdHlwZSA9PT0gJ2NjLkFuaW1hdGlvbicgfHwgXG4gICAgICAgICAgICB0eXBlID09PSAnY2MuQXVkaW9Tb3VyY2UnIHx8ICh0eXBlPy5zdGFydHNXaXRoKCdjYy4nKSAmJiAhdHlwZS5pbmNsdWRlcygnQCcpKSkpIHtcbiAgICAgICAgICAgIC8vIOWcqOmihOWItuS9k+S4re+8jOe7hOS7tuW8leeUqOS5n+mcgOimgei9rOaNouS4uiBfX2lkX18g5b2i5byPXG4gICAgICAgICAgICBpZiAoY29udGV4dD8uY29tcG9uZW50VXVpZFRvSW5kZXggJiYgY29udGV4dC5jb21wb25lbnRVdWlkVG9JbmRleC5oYXModmFsdWUudXVpZCkpIHtcbiAgICAgICAgICAgICAgICAvLyDlhoXpg6jlvJXnlKjvvJrovazmjaLkuLpfX2lkX1/moLzlvI9cbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhgQ29tcG9uZW50IHJlZmVyZW5jZSAke3R5cGV9IFVVSUQgJHt2YWx1ZS51dWlkfSBmb3VuZCBpbiBwcmVmYWIgY29udGV4dCwgY29udmVydGluZyB0byBfX2lkX19gKTtcbiAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICBcIl9faWRfX1wiOiBjb250ZXh0LmNvbXBvbmVudFV1aWRUb0luZGV4LmdldCh2YWx1ZS51dWlkKVxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyDlpJbpg6jlvJXnlKjvvJrorr7nva7kuLpudWxs77yM5Zug5Li65aSW6YOo57uE5Lu25LiN5bGe5LqO6aKE5Yi25L2T57uT5p6EXG4gICAgICAgICAgICBjb25zb2xlLndhcm4oYENvbXBvbmVudCByZWZlcmVuY2UgJHt0eXBlfSBVVUlEICR7dmFsdWUudXVpZH0gbm90IGZvdW5kIGluIHByZWZhYiBjb250ZXh0LCBzZXR0aW5nIHRvIG51bGwgKGV4dGVybmFsIHJlZmVyZW5jZSlgKTtcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8g5aSE55CG5aSN5p2C57G75Z6L77yM5re75YqgX190eXBlX1/moIforrBcbiAgICAgICAgaWYgKHZhbHVlICYmIHR5cGVvZiB2YWx1ZSA9PT0gJ29iamVjdCcpIHtcbiAgICAgICAgICAgIGlmICh0eXBlID09PSAnY2MuQ29sb3InKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgXCJfX3R5cGVfX1wiOiBcImNjLkNvbG9yXCIsXG4gICAgICAgICAgICAgICAgICAgIFwiclwiOiBNYXRoLm1pbigyNTUsIE1hdGgubWF4KDAsIE51bWJlcih2YWx1ZS5yKSB8fCAwKSksXG4gICAgICAgICAgICAgICAgICAgIFwiZ1wiOiBNYXRoLm1pbigyNTUsIE1hdGgubWF4KDAsIE51bWJlcih2YWx1ZS5nKSB8fCAwKSksXG4gICAgICAgICAgICAgICAgICAgIFwiYlwiOiBNYXRoLm1pbigyNTUsIE1hdGgubWF4KDAsIE51bWJlcih2YWx1ZS5iKSB8fCAwKSksXG4gICAgICAgICAgICAgICAgICAgIFwiYVwiOiB2YWx1ZS5hICE9PSB1bmRlZmluZWQgPyBNYXRoLm1pbigyNTUsIE1hdGgubWF4KDAsIE51bWJlcih2YWx1ZS5hKSkpIDogMjU1XG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAodHlwZSA9PT0gJ2NjLlZlYzMnKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgXCJfX3R5cGVfX1wiOiBcImNjLlZlYzNcIixcbiAgICAgICAgICAgICAgICAgICAgXCJ4XCI6IE51bWJlcih2YWx1ZS54KSB8fCAwLFxuICAgICAgICAgICAgICAgICAgICBcInlcIjogTnVtYmVyKHZhbHVlLnkpIHx8IDAsXG4gICAgICAgICAgICAgICAgICAgIFwielwiOiBOdW1iZXIodmFsdWUueikgfHwgMFxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9IGVsc2UgaWYgKHR5cGUgPT09ICdjYy5WZWMyJykge1xuICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgIFwiX190eXBlX19cIjogXCJjYy5WZWMyXCIsIFxuICAgICAgICAgICAgICAgICAgICBcInhcIjogTnVtYmVyKHZhbHVlLngpIHx8IDAsXG4gICAgICAgICAgICAgICAgICAgIFwieVwiOiBOdW1iZXIodmFsdWUueSkgfHwgMFxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9IGVsc2UgaWYgKHR5cGUgPT09ICdjYy5TaXplJykge1xuICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgIFwiX190eXBlX19cIjogXCJjYy5TaXplXCIsXG4gICAgICAgICAgICAgICAgICAgIFwid2lkdGhcIjogTnVtYmVyKHZhbHVlLndpZHRoKSB8fCAwLFxuICAgICAgICAgICAgICAgICAgICBcImhlaWdodFwiOiBOdW1iZXIodmFsdWUuaGVpZ2h0KSB8fCAwXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAodHlwZSA9PT0gJ2NjLlF1YXQnKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgXCJfX3R5cGVfX1wiOiBcImNjLlF1YXRcIixcbiAgICAgICAgICAgICAgICAgICAgXCJ4XCI6IE51bWJlcih2YWx1ZS54KSB8fCAwLFxuICAgICAgICAgICAgICAgICAgICBcInlcIjogTnVtYmVyKHZhbHVlLnkpIHx8IDAsXG4gICAgICAgICAgICAgICAgICAgIFwielwiOiBOdW1iZXIodmFsdWUueikgfHwgMCxcbiAgICAgICAgICAgICAgICAgICAgXCJ3XCI6IHZhbHVlLncgIT09IHVuZGVmaW5lZCA/IE51bWJlcih2YWx1ZS53KSA6IDFcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgLy8g5aSE55CG5pWw57uE57G75Z6LXG4gICAgICAgIGlmIChBcnJheS5pc0FycmF5KHZhbHVlKSkge1xuICAgICAgICAgICAgLy8g6IqC54K55pWw57uEXG4gICAgICAgICAgICBpZiAocHJvcERhdGEuZWxlbWVudFR5cGVEYXRhPy50eXBlID09PSAnY2MuTm9kZScpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdmFsdWUubWFwKGl0ZW0gPT4ge1xuICAgICAgICAgICAgICAgICAgICBpZiAoaXRlbT8udXVpZCAmJiBjb250ZXh0Py5ub2RlVXVpZFRvSW5kZXg/LmhhcyhpdGVtLnV1aWQpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4geyBcIl9faWRfX1wiOiBjb250ZXh0Lm5vZGVVdWlkVG9JbmRleC5nZXQoaXRlbS51dWlkKSB9O1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICAgICAgICAgIH0pLmZpbHRlcihpdGVtID0+IGl0ZW0gIT09IG51bGwpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgXG4gICAgICAgICAgICAvLyDotYTmupDmlbDnu4RcbiAgICAgICAgICAgIGlmIChwcm9wRGF0YS5lbGVtZW50VHlwZURhdGE/LnR5cGUgJiYgcHJvcERhdGEuZWxlbWVudFR5cGVEYXRhLnR5cGUuc3RhcnRzV2l0aCgnY2MuJykpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdmFsdWUubWFwKGl0ZW0gPT4ge1xuICAgICAgICAgICAgICAgICAgICBpZiAoaXRlbT8udXVpZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIl9fdXVpZF9fXCI6IHRoaXMudXVpZFRvQ29tcHJlc3NlZElkKGl0ZW0udXVpZCksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJfX2V4cGVjdGVkVHlwZV9fXCI6IHByb3BEYXRhLmVsZW1lbnRUeXBlRGF0YS50eXBlXG4gICAgICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICAgICAgICAgIH0pLmZpbHRlcihpdGVtID0+IGl0ZW0gIT09IG51bGwpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyDln7rnoYDnsbvlnovmlbDnu4RcbiAgICAgICAgICAgIHJldHVybiB2YWx1ZS5tYXAoaXRlbSA9PiBpdGVtPy52YWx1ZSAhPT0gdW5kZWZpbmVkID8gaXRlbS52YWx1ZSA6IGl0ZW0pO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8g5YW25LuW5aSN5p2C5a+56LGh57G75Z6L77yM5L+d5oyB5Y6f5qC35L2G56Gu5L+d5pyJX190eXBlX1/moIforrBcbiAgICAgICAgaWYgKHZhbHVlICYmIHR5cGVvZiB2YWx1ZSA9PT0gJ29iamVjdCcgJiYgdHlwZSAmJiB0eXBlLnN0YXJ0c1dpdGgoJ2NjLicpKSB7XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIFwiX190eXBlX19cIjogdHlwZSxcbiAgICAgICAgICAgICAgICAuLi52YWx1ZVxuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB2YWx1ZTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiDliJvlu7rnrKblkIjlvJXmk47moIflh4bnmoToioLngrnlr7nosaFcbiAgICAgKi9cbiAgICBwcml2YXRlIGNyZWF0ZUVuZ2luZVN0YW5kYXJkTm9kZShub2RlRGF0YTogYW55LCBwYXJlbnROb2RlSW5kZXg6IG51bWJlciB8IG51bGwsIG5vZGVOYW1lPzogc3RyaW5nKTogYW55IHtcbiAgICAgICAgLy8g6LCD6K+V77ya5omT5Y2w5Y6f5aeL6IqC54K55pWw5o2u77yI5bey5rOo6YeK77yJXG4gICAgICAgIC8vIGNvbnNvbGUubG9nKCfljp/lp4voioLngrnmlbDmja46JywgSlNPTi5zdHJpbmdpZnkobm9kZURhdGEsIG51bGwsIDIpKTtcbiAgICAgICAgXG4gICAgICAgIC8vIOaPkOWPluiKgueCueeahOWfuuacrOWxnuaAp1xuICAgICAgICBjb25zdCBnZXRWYWx1ZSA9IChwcm9wOiBhbnkpID0+IHtcbiAgICAgICAgICAgIGlmIChwcm9wPy52YWx1ZSAhPT0gdW5kZWZpbmVkKSByZXR1cm4gcHJvcC52YWx1ZTtcbiAgICAgICAgICAgIGlmIChwcm9wICE9PSB1bmRlZmluZWQpIHJldHVybiBwcm9wO1xuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH07XG4gICAgICAgIFxuICAgICAgICBjb25zdCBwb3NpdGlvbiA9IGdldFZhbHVlKG5vZGVEYXRhLnBvc2l0aW9uKSB8fCBnZXRWYWx1ZShub2RlRGF0YS52YWx1ZT8ucG9zaXRpb24pIHx8IHsgeDogMCwgeTogMCwgejogMCB9O1xuICAgICAgICBjb25zdCByb3RhdGlvbiA9IGdldFZhbHVlKG5vZGVEYXRhLnJvdGF0aW9uKSB8fCBnZXRWYWx1ZShub2RlRGF0YS52YWx1ZT8ucm90YXRpb24pIHx8IHsgeDogMCwgeTogMCwgejogMCwgdzogMSB9O1xuICAgICAgICBjb25zdCBzY2FsZSA9IGdldFZhbHVlKG5vZGVEYXRhLnNjYWxlKSB8fCBnZXRWYWx1ZShub2RlRGF0YS52YWx1ZT8uc2NhbGUpIHx8IHsgeDogMSwgeTogMSwgejogMSB9O1xuICAgICAgICBjb25zdCBhY3RpdmUgPSBnZXRWYWx1ZShub2RlRGF0YS5hY3RpdmUpID8/IGdldFZhbHVlKG5vZGVEYXRhLnZhbHVlPy5hY3RpdmUpID8/IHRydWU7XG4gICAgICAgIGNvbnN0IG5hbWUgPSBub2RlTmFtZSB8fCBnZXRWYWx1ZShub2RlRGF0YS5uYW1lKSB8fCBnZXRWYWx1ZShub2RlRGF0YS52YWx1ZT8ubmFtZSkgfHwgJ05vZGUnO1xuICAgICAgICBjb25zdCBsYXllciA9IGdldFZhbHVlKG5vZGVEYXRhLmxheWVyKSB8fCBnZXRWYWx1ZShub2RlRGF0YS52YWx1ZT8ubGF5ZXIpIHx8IDEwNzM3NDE4MjQ7XG5cbiAgICAgICAgLy8g6LCD6K+V6L6T5Ye6XG4gICAgICAgIGNvbnNvbGUubG9nKGDliJvlu7roioLngrk6ICR7bmFtZX0sIHBhcmVudE5vZGVJbmRleDogJHtwYXJlbnROb2RlSW5kZXh9YCk7XG5cbiAgICAgICAgY29uc3QgcGFyZW50UmVmID0gcGFyZW50Tm9kZUluZGV4ICE9PSBudWxsID8geyBcIl9faWRfX1wiOiBwYXJlbnROb2RlSW5kZXggfSA6IG51bGw7XG4gICAgICAgIGNvbnNvbGUubG9nKGDoioLngrkgJHtuYW1lfSDnmoTniLboioLngrnlvJXnlKg6YCwgcGFyZW50UmVmKTtcblxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgXCJfX3R5cGVfX1wiOiBcImNjLk5vZGVcIixcbiAgICAgICAgICAgIFwiX25hbWVcIjogbmFtZSxcbiAgICAgICAgICAgIFwiX29iakZsYWdzXCI6IDAsXG4gICAgICAgICAgICBcIl9fZWRpdG9yRXh0cmFzX19cIjoge30sXG4gICAgICAgICAgICBcIl9wYXJlbnRcIjogcGFyZW50UmVmLFxuICAgICAgICAgICAgXCJfY2hpbGRyZW5cIjogW10sIC8vIOWtkOiKgueCueW8leeUqOWwhuWcqOmAkuW9kui/h+eoi+S4reWKqOaAgea3u+WKoFxuICAgICAgICAgICAgXCJfYWN0aXZlXCI6IGFjdGl2ZSxcbiAgICAgICAgICAgIFwiX2NvbXBvbmVudHNcIjogW10sIC8vIOe7hOS7tuW8leeUqOWwhuWcqOWkhOeQhue7hOS7tuaXtuWKqOaAgea3u+WKoFxuICAgICAgICAgICAgXCJfcHJlZmFiXCI6IHsgXCJfX2lkX19cIjogMCB9LCAvLyDkuLTml7blgLzvvIzlkI7nu63kvJrooqvmraPnoa7orr7nva5cbiAgICAgICAgICAgIFwiX2xwb3NcIjoge1xuICAgICAgICAgICAgICAgIFwiX190eXBlX19cIjogXCJjYy5WZWMzXCIsXG4gICAgICAgICAgICAgICAgXCJ4XCI6IHBvc2l0aW9uLngsXG4gICAgICAgICAgICAgICAgXCJ5XCI6IHBvc2l0aW9uLnksXG4gICAgICAgICAgICAgICAgXCJ6XCI6IHBvc2l0aW9uLnpcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBcIl9scm90XCI6IHtcbiAgICAgICAgICAgICAgICBcIl9fdHlwZV9fXCI6IFwiY2MuUXVhdFwiLFxuICAgICAgICAgICAgICAgIFwieFwiOiByb3RhdGlvbi54LFxuICAgICAgICAgICAgICAgIFwieVwiOiByb3RhdGlvbi55LFxuICAgICAgICAgICAgICAgIFwielwiOiByb3RhdGlvbi56LFxuICAgICAgICAgICAgICAgIFwid1wiOiByb3RhdGlvbi53XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgXCJfbHNjYWxlXCI6IHtcbiAgICAgICAgICAgICAgICBcIl9fdHlwZV9fXCI6IFwiY2MuVmVjM1wiLFxuICAgICAgICAgICAgICAgIFwieFwiOiBzY2FsZS54LFxuICAgICAgICAgICAgICAgIFwieVwiOiBzY2FsZS55LFxuICAgICAgICAgICAgICAgIFwielwiOiBzY2FsZS56XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgXCJfbW9iaWxpdHlcIjogMCxcbiAgICAgICAgICAgIFwiX2xheWVyXCI6IGxheWVyLFxuICAgICAgICAgICAgXCJfZXVsZXJcIjoge1xuICAgICAgICAgICAgICAgIFwiX190eXBlX19cIjogXCJjYy5WZWMzXCIsXG4gICAgICAgICAgICAgICAgXCJ4XCI6IDAsXG4gICAgICAgICAgICAgICAgXCJ5XCI6IDAsXG4gICAgICAgICAgICAgICAgXCJ6XCI6IDBcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBcIl9pZFwiOiBcIlwiXG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICog5LuO6IqC54K55pWw5o2u5Lit5o+Q5Y+WVVVJRFxuICAgICAqL1xuICAgIHByaXZhdGUgZXh0cmFjdE5vZGVVdWlkKG5vZGVEYXRhOiBhbnkpOiBzdHJpbmcgfCBudWxsIHtcbiAgICAgICAgaWYgKCFub2RlRGF0YSkgcmV0dXJuIG51bGw7XG4gICAgICAgIFxuICAgICAgICAvLyDlsJ3or5XlpJrnp43mlrnlvI/ojrflj5ZVVUlEXG4gICAgICAgIGNvbnN0IHNvdXJjZXMgPSBbXG4gICAgICAgICAgICBub2RlRGF0YS51dWlkLFxuICAgICAgICAgICAgbm9kZURhdGEudmFsdWU/LnV1aWQsXG4gICAgICAgICAgICBub2RlRGF0YS5fX3V1aWRfXyxcbiAgICAgICAgICAgIG5vZGVEYXRhLnZhbHVlPy5fX3V1aWRfXyxcbiAgICAgICAgICAgIG5vZGVEYXRhLmlkLFxuICAgICAgICAgICAgbm9kZURhdGEudmFsdWU/LmlkXG4gICAgICAgIF07XG4gICAgICAgIFxuICAgICAgICBmb3IgKGNvbnN0IHNvdXJjZSBvZiBzb3VyY2VzKSB7XG4gICAgICAgICAgICBpZiAodHlwZW9mIHNvdXJjZSA9PT0gJ3N0cmluZycgJiYgc291cmNlLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gc291cmNlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiDliJvlu7rmnIDlsI/ljJbnmoToioLngrnlr7nosaHvvIzkuI3ljIXlkKvku7vkvZXnu4Tku7bku6Xpgb/lhY3kvp3otZbpl67pophcbiAgICAgKi9cbiAgICBwcml2YXRlIGNyZWF0ZU1pbmltYWxOb2RlKG5vZGVEYXRhOiBhbnksIG5vZGVOYW1lPzogc3RyaW5nKTogYW55IHtcbiAgICAgICAgLy8g5o+Q5Y+W6IqC54K555qE5Z+65pys5bGe5oCnXG4gICAgICAgIGNvbnN0IGdldFZhbHVlID0gKHByb3A6IGFueSkgPT4ge1xuICAgICAgICAgICAgaWYgKHByb3A/LnZhbHVlICE9PSB1bmRlZmluZWQpIHJldHVybiBwcm9wLnZhbHVlO1xuICAgICAgICAgICAgaWYgKHByb3AgIT09IHVuZGVmaW5lZCkgcmV0dXJuIHByb3A7XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfTtcbiAgICAgICAgXG4gICAgICAgIGNvbnN0IHBvc2l0aW9uID0gZ2V0VmFsdWUobm9kZURhdGEucG9zaXRpb24pIHx8IGdldFZhbHVlKG5vZGVEYXRhLnZhbHVlPy5wb3NpdGlvbikgfHwgeyB4OiAwLCB5OiAwLCB6OiAwIH07XG4gICAgICAgIGNvbnN0IHJvdGF0aW9uID0gZ2V0VmFsdWUobm9kZURhdGEucm90YXRpb24pIHx8IGdldFZhbHVlKG5vZGVEYXRhLnZhbHVlPy5yb3RhdGlvbikgfHwgeyB4OiAwLCB5OiAwLCB6OiAwLCB3OiAxIH07XG4gICAgICAgIGNvbnN0IHNjYWxlID0gZ2V0VmFsdWUobm9kZURhdGEuc2NhbGUpIHx8IGdldFZhbHVlKG5vZGVEYXRhLnZhbHVlPy5zY2FsZSkgfHwgeyB4OiAxLCB5OiAxLCB6OiAxIH07XG4gICAgICAgIGNvbnN0IGFjdGl2ZSA9IGdldFZhbHVlKG5vZGVEYXRhLmFjdGl2ZSkgPz8gZ2V0VmFsdWUobm9kZURhdGEudmFsdWU/LmFjdGl2ZSkgPz8gdHJ1ZTtcbiAgICAgICAgY29uc3QgbmFtZSA9IG5vZGVOYW1lIHx8IGdldFZhbHVlKG5vZGVEYXRhLm5hbWUpIHx8IGdldFZhbHVlKG5vZGVEYXRhLnZhbHVlPy5uYW1lKSB8fCAnTm9kZSc7XG4gICAgICAgIGNvbnN0IGxheWVyID0gZ2V0VmFsdWUobm9kZURhdGEubGF5ZXIpIHx8IGdldFZhbHVlKG5vZGVEYXRhLnZhbHVlPy5sYXllcikgfHwgMzM1NTQ0MzI7XG5cbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIFwiX190eXBlX19cIjogXCJjYy5Ob2RlXCIsXG4gICAgICAgICAgICBcIl9uYW1lXCI6IG5hbWUsXG4gICAgICAgICAgICBcIl9vYmpGbGFnc1wiOiAwLFxuICAgICAgICAgICAgXCJfcGFyZW50XCI6IG51bGwsXG4gICAgICAgICAgICBcIl9jaGlsZHJlblwiOiBbXSxcbiAgICAgICAgICAgIFwiX2FjdGl2ZVwiOiBhY3RpdmUsXG4gICAgICAgICAgICBcIl9jb21wb25lbnRzXCI6IFtdLCAvLyDnqbrnmoTnu4Tku7bmlbDnu4TvvIzpgb/lhY3nu4Tku7bkvp3otZbpl67pophcbiAgICAgICAgICAgIFwiX3ByZWZhYlwiOiB7XG4gICAgICAgICAgICAgICAgXCJfX2lkX19cIjogMlxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIFwiX2xwb3NcIjoge1xuICAgICAgICAgICAgICAgIFwiX190eXBlX19cIjogXCJjYy5WZWMzXCIsXG4gICAgICAgICAgICAgICAgXCJ4XCI6IHBvc2l0aW9uLngsXG4gICAgICAgICAgICAgICAgXCJ5XCI6IHBvc2l0aW9uLnksXG4gICAgICAgICAgICAgICAgXCJ6XCI6IHBvc2l0aW9uLnpcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBcIl9scm90XCI6IHtcbiAgICAgICAgICAgICAgICBcIl9fdHlwZV9fXCI6IFwiY2MuUXVhdFwiLFxuICAgICAgICAgICAgICAgIFwieFwiOiByb3RhdGlvbi54LFxuICAgICAgICAgICAgICAgIFwieVwiOiByb3RhdGlvbi55LFxuICAgICAgICAgICAgICAgIFwielwiOiByb3RhdGlvbi56LFxuICAgICAgICAgICAgICAgIFwid1wiOiByb3RhdGlvbi53XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgXCJfbHNjYWxlXCI6IHtcbiAgICAgICAgICAgICAgICBcIl9fdHlwZV9fXCI6IFwiY2MuVmVjM1wiLFxuICAgICAgICAgICAgICAgIFwieFwiOiBzY2FsZS54LFxuICAgICAgICAgICAgICAgIFwieVwiOiBzY2FsZS55LFxuICAgICAgICAgICAgICAgIFwielwiOiBzY2FsZS56XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgXCJfbGF5ZXJcIjogbGF5ZXIsXG4gICAgICAgICAgICBcIl9ldWxlclwiOiB7XG4gICAgICAgICAgICAgICAgXCJfX3R5cGVfX1wiOiBcImNjLlZlYzNcIixcbiAgICAgICAgICAgICAgICBcInhcIjogMCxcbiAgICAgICAgICAgICAgICBcInlcIjogMCxcbiAgICAgICAgICAgICAgICBcInpcIjogMFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIFwiX2lkXCI6IFwiXCJcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiDliJvlu7rmoIflh4bnmoQgbWV0YSDmlofku7blhoXlrrlcbiAgICAgKi9cbiAgICBwcml2YXRlIGNyZWF0ZVN0YW5kYXJkTWV0YUNvbnRlbnQocHJlZmFiTmFtZTogc3RyaW5nLCBwcmVmYWJVdWlkOiBzdHJpbmcpOiBhbnkge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgXCJ2ZXJcIjogXCIyLjAuM1wiLFxuICAgICAgICAgICAgXCJpbXBvcnRlclwiOiBcInByZWZhYlwiLFxuICAgICAgICAgICAgXCJpbXBvcnRlZFwiOiB0cnVlLFxuICAgICAgICAgICAgXCJ1dWlkXCI6IHByZWZhYlV1aWQsXG4gICAgICAgICAgICBcImZpbGVzXCI6IFtcbiAgICAgICAgICAgICAgICBcIi5qc29uXCJcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICBcInN1Yk1ldGFzXCI6IHt9LFxuICAgICAgICAgICAgXCJ1c2VyRGF0YVwiOiB7XG4gICAgICAgICAgICAgICAgXCJzeW5jTm9kZU5hbWVcIjogcHJlZmFiTmFtZSxcbiAgICAgICAgICAgICAgICBcImhhc0ljb25cIjogZmFsc2VcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiDlsJ3or5XlsIbljp/lp4voioLngrnovazmjaLkuLrpooTliLbkvZPlrp7kvotcbiAgICAgKi9cbiAgICBwcml2YXRlIGFzeW5jIGNvbnZlcnROb2RlVG9QcmVmYWJJbnN0YW5jZShub2RlVXVpZDogc3RyaW5nLCBwcmVmYWJVdWlkOiBzdHJpbmcsIHByZWZhYlBhdGg6IHN0cmluZyk6IFByb21pc2U8eyBzdWNjZXNzOiBib29sZWFuOyBlcnJvcj86IHN0cmluZyB9PiB7XG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSkgPT4ge1xuICAgICAgICAgICAgLy8g6L+Z5Liq5Yqf6IO96ZyA6KaB5rex5YWl55qE5Zy65pmv57yW6L6R5Zmo6ZuG5oiQ77yM5pqC5pe26L+U5Zue5aSx6LSlXG4gICAgICAgICAgICAvLyDlnKjlrp7pmYXnmoTlvJXmk47kuK3vvIzov5nmtonlj4rliLDlpI3mnYLnmoTpooTliLbkvZPlrp7kvovljJblkozoioLngrnmm7/mjaLpgLvovpFcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCfoioLngrnovazmjaLkuLrpooTliLbkvZPlrp7kvovnmoTlip/og73pnIDopoHmm7Tmt7HlhaXnmoTlvJXmk47pm4bmiJAnKTtcbiAgICAgICAgICAgIHJlc29sdmUoe1xuICAgICAgICAgICAgICAgIHN1Y2Nlc3M6IGZhbHNlLFxuICAgICAgICAgICAgICAgIGVycm9yOiAn6IqC54K56L2s5o2i5Li66aKE5Yi25L2T5a6e5L6L6ZyA6KaB5pu05rex5YWl55qE5byV5pOO6ZuG5oiQ5pSv5oyBJ1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHByaXZhdGUgYXN5bmMgcmVzdG9yZVByZWZhYk5vZGUobm9kZVV1aWQ6IHN0cmluZywgYXNzZXRVdWlkOiBzdHJpbmcpOiBQcm9taXNlPFRvb2xSZXNwb25zZT4ge1xuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHtcbiAgICAgICAgICAgIC8vIOS9v+eUqOWumOaWuUFQSSByZXN0b3JlLXByZWZhYiDov5jljp/pooTliLbkvZPoioLngrlcbiAgICAgICAgICAgIChFZGl0b3IuTWVzc2FnZS5yZXF1ZXN0IGFzIGFueSkoJ3NjZW5lJywgJ3Jlc3RvcmUtcHJlZmFiJywgbm9kZVV1aWQsIGFzc2V0VXVpZCkudGhlbigoKSA9PiB7XG4gICAgICAgICAgICAgICAgcmVzb2x2ZSh7XG4gICAgICAgICAgICAgICAgICAgIHN1Y2Nlc3M6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgIGRhdGE6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG5vZGVVdWlkOiBub2RlVXVpZCxcbiAgICAgICAgICAgICAgICAgICAgICAgIGFzc2V0VXVpZDogYXNzZXRVdWlkLFxuICAgICAgICAgICAgICAgICAgICAgICAgbWVzc2FnZTogJ+mihOWItuS9k+iKgueCuei/mOWOn+aIkOWKnydcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSkuY2F0Y2goKGVycm9yOiBhbnkpID0+IHtcbiAgICAgICAgICAgICAgICByZXNvbHZlKHtcbiAgICAgICAgICAgICAgICAgICAgc3VjY2VzczogZmFsc2UsXG4gICAgICAgICAgICAgICAgICAgIGVycm9yOiBg6aKE5Yi25L2T6IqC54K56L+Y5Y6f5aSx6LSlOiAke2Vycm9yLm1lc3NhZ2V9YFxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIC8vIOWfuuS6juWumOaWuemihOWItuS9k+agvOW8j+eahOaWsOWunueOsOaWueazlVxuICAgIHByaXZhdGUgYXN5bmMgZ2V0Tm9kZURhdGFGb3JQcmVmYWIobm9kZVV1aWQ6IHN0cmluZyk6IFByb21pc2U8eyBzdWNjZXNzOiBib29sZWFuOyBkYXRhPzogYW55OyBlcnJvcj86IHN0cmluZyB9PiB7XG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSkgPT4ge1xuICAgICAgICAgICAgRWRpdG9yLk1lc3NhZ2UucmVxdWVzdCgnc2NlbmUnLCAncXVlcnktbm9kZScsIG5vZGVVdWlkKS50aGVuKChub2RlRGF0YTogYW55KSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKCFub2RlRGF0YSkge1xuICAgICAgICAgICAgICAgICAgICByZXNvbHZlKHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiAn6IqC54K55LiN5a2Y5ZyoJyB9KTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXNvbHZlKHsgc3VjY2VzczogdHJ1ZSwgZGF0YTogbm9kZURhdGEgfSk7XG4gICAgICAgICAgICB9KS5jYXRjaCgoZXJyb3I6IGFueSkgPT4ge1xuICAgICAgICAgICAgICAgIHJlc29sdmUoeyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6IGVycm9yLm1lc3NhZ2UgfSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBhc3luYyBjcmVhdGVTdGFuZGFyZFByZWZhYkRhdGEobm9kZURhdGE6IGFueSwgcHJlZmFiTmFtZTogc3RyaW5nLCBwcmVmYWJVdWlkOiBzdHJpbmcpOiBQcm9taXNlPGFueVtdPiB7XG4gICAgICAgIC8vIOWfuuS6juWumOaWuUNhbnZhcy5wcmVmYWLmoLzlvI/liJvlu7rpooTliLbkvZPmlbDmja7nu5PmnoRcbiAgICAgICAgY29uc3QgcHJlZmFiRGF0YTogYW55W10gPSBbXTtcbiAgICAgICAgbGV0IGN1cnJlbnRJZCA9IDA7XG5cbiAgICAgICAgLy8g56ys5LiA5Liq5YWD57Sg77yaY2MuUHJlZmFiIOi1hOa6kOWvueixoVxuICAgICAgICBjb25zdCBwcmVmYWJBc3NldCA9IHtcbiAgICAgICAgICAgIFwiX190eXBlX19cIjogXCJjYy5QcmVmYWJcIixcbiAgICAgICAgICAgIFwiX25hbWVcIjogcHJlZmFiTmFtZSxcbiAgICAgICAgICAgIFwiX29iakZsYWdzXCI6IDAsXG4gICAgICAgICAgICBcIl9fZWRpdG9yRXh0cmFzX19cIjoge30sXG4gICAgICAgICAgICBcIl9uYXRpdmVcIjogXCJcIixcbiAgICAgICAgICAgIFwiZGF0YVwiOiB7XG4gICAgICAgICAgICAgICAgXCJfX2lkX19cIjogMVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIFwib3B0aW1pemF0aW9uUG9saWN5XCI6IDAsXG4gICAgICAgICAgICBcInBlcnNpc3RlbnRcIjogZmFsc2VcbiAgICAgICAgfTtcbiAgICAgICAgcHJlZmFiRGF0YS5wdXNoKHByZWZhYkFzc2V0KTtcbiAgICAgICAgY3VycmVudElkKys7XG5cbiAgICAgICAgLy8g56ys5LqM5Liq5YWD57Sg77ya5qC56IqC54K5XG4gICAgICAgIGNvbnN0IHJvb3ROb2RlID0gYXdhaXQgdGhpcy5jcmVhdGVOb2RlT2JqZWN0KG5vZGVEYXRhLCBudWxsLCBwcmVmYWJEYXRhLCBjdXJyZW50SWQpO1xuICAgICAgICBwcmVmYWJEYXRhLnB1c2gocm9vdE5vZGUubm9kZSk7XG4gICAgICAgIGN1cnJlbnRJZCA9IHJvb3ROb2RlLm5leHRJZDtcblxuICAgICAgICAvLyDmt7vliqDmoLnoioLngrnnmoQgUHJlZmFiSW5mbyAtIOS/ruWkjWFzc2V05byV55So5L2/55SoVVVJRFxuICAgICAgICBjb25zdCByb290UHJlZmFiSW5mbyA9IHtcbiAgICAgICAgICAgIFwiX190eXBlX19cIjogXCJjYy5QcmVmYWJJbmZvXCIsXG4gICAgICAgICAgICBcInJvb3RcIjoge1xuICAgICAgICAgICAgICAgIFwiX19pZF9fXCI6IDFcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBcImFzc2V0XCI6IHtcbiAgICAgICAgICAgICAgICBcIl9fdXVpZF9fXCI6IHByZWZhYlV1aWRcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBcImZpbGVJZFwiOiB0aGlzLmdlbmVyYXRlRmlsZUlkKCksXG4gICAgICAgICAgICBcImluc3RhbmNlXCI6IG51bGwsXG4gICAgICAgICAgICBcInRhcmdldE92ZXJyaWRlc1wiOiBbXSxcbiAgICAgICAgICAgIFwibmVzdGVkUHJlZmFiSW5zdGFuY2VSb290c1wiOiBbXVxuICAgICAgICB9O1xuICAgICAgICBwcmVmYWJEYXRhLnB1c2gocm9vdFByZWZhYkluZm8pO1xuXG4gICAgICAgIHJldHVybiBwcmVmYWJEYXRhO1xuICAgIH1cblxuXG4gICAgcHJpdmF0ZSBhc3luYyBjcmVhdGVOb2RlT2JqZWN0KG5vZGVEYXRhOiBhbnksIHBhcmVudElkOiBudW1iZXIgfCBudWxsLCBwcmVmYWJEYXRhOiBhbnlbXSwgY3VycmVudElkOiBudW1iZXIpOiBQcm9taXNlPHsgbm9kZTogYW55OyBuZXh0SWQ6IG51bWJlciB9PiB7XG4gICAgICAgIGNvbnN0IG5vZGVJZCA9IGN1cnJlbnRJZCsrO1xuICAgICAgICBcbiAgICAgICAgLy8g5o+Q5Y+W6IqC54K555qE5Z+65pys5bGe5oCnIC0g6YCC6YWNcXVlcnktbm9kZS10cmVl55qE5pWw5o2u5qC85byPXG4gICAgICAgIGNvbnN0IGdldFZhbHVlID0gKHByb3A6IGFueSkgPT4ge1xuICAgICAgICAgICAgaWYgKHByb3A/LnZhbHVlICE9PSB1bmRlZmluZWQpIHJldHVybiBwcm9wLnZhbHVlO1xuICAgICAgICAgICAgaWYgKHByb3AgIT09IHVuZGVmaW5lZCkgcmV0dXJuIHByb3A7XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfTtcbiAgICAgICAgXG4gICAgICAgIGNvbnN0IHBvc2l0aW9uID0gZ2V0VmFsdWUobm9kZURhdGEucG9zaXRpb24pIHx8IGdldFZhbHVlKG5vZGVEYXRhLnZhbHVlPy5wb3NpdGlvbikgfHwgeyB4OiAwLCB5OiAwLCB6OiAwIH07XG4gICAgICAgIGNvbnN0IHJvdGF0aW9uID0gZ2V0VmFsdWUobm9kZURhdGEucm90YXRpb24pIHx8IGdldFZhbHVlKG5vZGVEYXRhLnZhbHVlPy5yb3RhdGlvbikgfHwgeyB4OiAwLCB5OiAwLCB6OiAwLCB3OiAxIH07XG4gICAgICAgIGNvbnN0IHNjYWxlID0gZ2V0VmFsdWUobm9kZURhdGEuc2NhbGUpIHx8IGdldFZhbHVlKG5vZGVEYXRhLnZhbHVlPy5zY2FsZSkgfHwgeyB4OiAxLCB5OiAxLCB6OiAxIH07XG4gICAgICAgIGNvbnN0IGFjdGl2ZSA9IGdldFZhbHVlKG5vZGVEYXRhLmFjdGl2ZSkgPz8gZ2V0VmFsdWUobm9kZURhdGEudmFsdWU/LmFjdGl2ZSkgPz8gdHJ1ZTtcbiAgICAgICAgY29uc3QgbmFtZSA9IGdldFZhbHVlKG5vZGVEYXRhLm5hbWUpIHx8IGdldFZhbHVlKG5vZGVEYXRhLnZhbHVlPy5uYW1lKSB8fCAnTm9kZSc7XG4gICAgICAgIGNvbnN0IGxheWVyID0gZ2V0VmFsdWUobm9kZURhdGEubGF5ZXIpIHx8IGdldFZhbHVlKG5vZGVEYXRhLnZhbHVlPy5sYXllcikgfHwgMzM1NTQ0MzI7XG5cbiAgICAgICAgY29uc3Qgbm9kZTogYW55ID0ge1xuICAgICAgICAgICAgXCJfX3R5cGVfX1wiOiBcImNjLk5vZGVcIixcbiAgICAgICAgICAgIFwiX25hbWVcIjogbmFtZSxcbiAgICAgICAgICAgIFwiX29iakZsYWdzXCI6IDAsXG4gICAgICAgICAgICBcIl9fZWRpdG9yRXh0cmFzX19cIjoge30sXG4gICAgICAgICAgICBcIl9wYXJlbnRcIjogcGFyZW50SWQgIT09IG51bGwgPyB7IFwiX19pZF9fXCI6IHBhcmVudElkIH0gOiBudWxsLFxuICAgICAgICAgICAgXCJfY2hpbGRyZW5cIjogW10sXG4gICAgICAgICAgICBcIl9hY3RpdmVcIjogYWN0aXZlLFxuICAgICAgICAgICAgXCJfY29tcG9uZW50c1wiOiBbXSxcbiAgICAgICAgICAgIFwiX3ByZWZhYlwiOiBwYXJlbnRJZCA9PT0gbnVsbCA/IHtcbiAgICAgICAgICAgICAgICBcIl9faWRfX1wiOiBjdXJyZW50SWQrK1xuICAgICAgICAgICAgfSA6IG51bGwsXG4gICAgICAgICAgICBcIl9scG9zXCI6IHtcbiAgICAgICAgICAgICAgICBcIl9fdHlwZV9fXCI6IFwiY2MuVmVjM1wiLFxuICAgICAgICAgICAgICAgIFwieFwiOiBwb3NpdGlvbi54LFxuICAgICAgICAgICAgICAgIFwieVwiOiBwb3NpdGlvbi55LFxuICAgICAgICAgICAgICAgIFwielwiOiBwb3NpdGlvbi56XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgXCJfbHJvdFwiOiB7XG4gICAgICAgICAgICAgICAgXCJfX3R5cGVfX1wiOiBcImNjLlF1YXRcIixcbiAgICAgICAgICAgICAgICBcInhcIjogcm90YXRpb24ueCxcbiAgICAgICAgICAgICAgICBcInlcIjogcm90YXRpb24ueSxcbiAgICAgICAgICAgICAgICBcInpcIjogcm90YXRpb24ueixcbiAgICAgICAgICAgICAgICBcIndcIjogcm90YXRpb24ud1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIFwiX2xzY2FsZVwiOiB7XG4gICAgICAgICAgICAgICAgXCJfX3R5cGVfX1wiOiBcImNjLlZlYzNcIixcbiAgICAgICAgICAgICAgICBcInhcIjogc2NhbGUueCxcbiAgICAgICAgICAgICAgICBcInlcIjogc2NhbGUueSxcbiAgICAgICAgICAgICAgICBcInpcIjogc2NhbGUuelxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIFwiX21vYmlsaXR5XCI6IDAsXG4gICAgICAgICAgICBcIl9sYXllclwiOiBsYXllcixcbiAgICAgICAgICAgIFwiX2V1bGVyXCI6IHtcbiAgICAgICAgICAgICAgICBcIl9fdHlwZV9fXCI6IFwiY2MuVmVjM1wiLFxuICAgICAgICAgICAgICAgIFwieFwiOiAwLFxuICAgICAgICAgICAgICAgIFwieVwiOiAwLFxuICAgICAgICAgICAgICAgIFwielwiOiAwXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgXCJfaWRcIjogXCJcIlxuICAgICAgICB9O1xuXG4gICAgICAgIC8vIOaaguaXtui3s+i/h1VJVHJhbnNmb3Jt57uE5Lu25Lul6YG/5YWNX2dldERlcGVuZENvbXBvbmVudOmUmeivr1xuICAgICAgICAvLyDlkI7nu63pgJrov4dFbmdpbmUgQVBJ5Yqo5oCB5re75YqgXG4gICAgICAgIGNvbnNvbGUubG9nKGDoioLngrkgJHtuYW1lfSDmmoLml7bot7Pov4dVSVRyYW5zZm9ybee7hOS7tu+8jOmBv+WFjeW8leaTjuS+nei1lumUmeivr2ApO1xuICAgICAgICBcbiAgICAgICAgLy8g5aSE55CG5YW25LuW57uE5Lu277yI5pqC5pe26Lez6L+H77yM5LiT5rOo5LqO5L+u5aSNVUlUcmFuc2Zvcm3pl67popjvvIlcbiAgICAgICAgY29uc3QgY29tcG9uZW50cyA9IHRoaXMuZXh0cmFjdENvbXBvbmVudHNGcm9tTm9kZShub2RlRGF0YSk7XG4gICAgICAgIGlmIChjb21wb25lbnRzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGDoioLngrkgJHtuYW1lfSDljIXlkKsgJHtjb21wb25lbnRzLmxlbmd0aH0g5Liq5YW25LuW57uE5Lu277yM5pqC5pe26Lez6L+H5Lul5LiT5rOo5LqOVUlUcmFuc2Zvcm3kv67lpI1gKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIOWkhOeQhuWtkOiKgueCuSAtIOS9v+eUqHF1ZXJ5LW5vZGUtdHJlZeiOt+WPlueahOWujOaVtOe7k+aehFxuICAgICAgICBjb25zdCBjaGlsZHJlblRvUHJvY2VzcyA9IHRoaXMuZ2V0Q2hpbGRyZW5Ub1Byb2Nlc3Mobm9kZURhdGEpO1xuICAgICAgICBpZiAoY2hpbGRyZW5Ub1Byb2Nlc3MubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgY29uc29sZS5sb2coYD09PSDlpITnkIblrZDoioLngrkgPT09YCk7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhg6IqC54K5ICR7bmFtZX0g5YyF5ZCrICR7Y2hpbGRyZW5Ub1Byb2Nlc3MubGVuZ3RofSDkuKrlrZDoioLngrlgKTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBjaGlsZHJlblRvUHJvY2Vzcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgIGNvbnN0IGNoaWxkRGF0YSA9IGNoaWxkcmVuVG9Qcm9jZXNzW2ldO1xuICAgICAgICAgICAgICAgIGNvbnN0IGNoaWxkTmFtZSA9IGNoaWxkRGF0YS5uYW1lIHx8IGNoaWxkRGF0YS52YWx1ZT8ubmFtZSB8fCAn5pyq55+lJztcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhg5aSE55CG56ysJHtpICsgMX3kuKrlrZDoioLngrk6ICR7Y2hpbGROYW1lfWApO1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGNoaWxkSWQgPSBjdXJyZW50SWQ7XG4gICAgICAgICAgICAgICAgICAgIG5vZGUuX2NoaWxkcmVuLnB1c2goeyBcIl9faWRfX1wiOiBjaGlsZElkIH0pO1xuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgLy8g6YCS5b2S5Yib5bu65a2Q6IqC54K5XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGNoaWxkUmVzdWx0ID0gYXdhaXQgdGhpcy5jcmVhdGVOb2RlT2JqZWN0KGNoaWxkRGF0YSwgbm9kZUlkLCBwcmVmYWJEYXRhLCBjdXJyZW50SWQpO1xuICAgICAgICAgICAgICAgICAgICBwcmVmYWJEYXRhLnB1c2goY2hpbGRSZXN1bHQubm9kZSk7XG4gICAgICAgICAgICAgICAgICAgIGN1cnJlbnRJZCA9IGNoaWxkUmVzdWx0Lm5leHRJZDtcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIC8vIOWtkOiKgueCueS4jemcgOimgVByZWZhYkluZm/vvIzlj6rmnInmoLnoioLngrnpnIDopoFcbiAgICAgICAgICAgICAgICAgICAgLy8g5a2Q6IqC54K555qEX3ByZWZhYuW6lOivpeiuvue9ruS4um51bGxcbiAgICAgICAgICAgICAgICAgICAgY2hpbGRSZXN1bHQubm9kZS5fcHJlZmFiID0gbnVsbDtcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGDinIUg5oiQ5Yqf5re75Yqg5a2Q6IqC54K5OiAke2NoaWxkTmFtZX1gKTtcbiAgICAgICAgICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKGDlpITnkIblrZDoioLngrkgJHtjaGlsZE5hbWV9IOaXtuWHuumUmTpgLCBlcnJvcik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHsgbm9kZSwgbmV4dElkOiBjdXJyZW50SWQgfTtcbiAgICB9XG5cbiAgICAvLyDku47oioLngrnmlbDmja7kuK3mj5Dlj5bnu4Tku7bkv6Hmga9cbiAgICBwcml2YXRlIGV4dHJhY3RDb21wb25lbnRzRnJvbU5vZGUobm9kZURhdGE6IGFueSk6IGFueVtdIHtcbiAgICAgICAgY29uc3QgY29tcG9uZW50czogYW55W10gPSBbXTtcbiAgICAgICAgXG4gICAgICAgIC8vIOS7juS4jeWQjOS9jee9ruWwneivleiOt+WPlue7hOS7tuaVsOaNrlxuICAgICAgICBjb25zdCBjb21wb25lbnRTb3VyY2VzID0gW1xuICAgICAgICAgICAgbm9kZURhdGEuX19jb21wc19fLFxuICAgICAgICAgICAgbm9kZURhdGEuY29tcG9uZW50cyxcbiAgICAgICAgICAgIG5vZGVEYXRhLnZhbHVlPy5fX2NvbXBzX18sXG4gICAgICAgICAgICBub2RlRGF0YS52YWx1ZT8uY29tcG9uZW50c1xuICAgICAgICBdO1xuICAgICAgICBcbiAgICAgICAgZm9yIChjb25zdCBzb3VyY2Ugb2YgY29tcG9uZW50U291cmNlcykge1xuICAgICAgICAgICAgaWYgKEFycmF5LmlzQXJyYXkoc291cmNlKSkge1xuICAgICAgICAgICAgICAgIGNvbXBvbmVudHMucHVzaCguLi5zb3VyY2UuZmlsdGVyKGNvbXAgPT4gY29tcCAmJiAoY29tcC5fX3R5cGVfXyB8fCBjb21wLnR5cGUpKSk7XG4gICAgICAgICAgICAgICAgYnJlYWs7IC8vIOaJvuWIsOacieaViOeahOe7hOS7tuaVsOe7hOWwsemAgOWHulxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICByZXR1cm4gY29tcG9uZW50cztcbiAgICB9XG4gICAgXG4gICAgLy8g5Yib5bu65qCH5YeG55qE57uE5Lu25a+56LGhXG4gICAgcHJpdmF0ZSBjcmVhdGVTdGFuZGFyZENvbXBvbmVudE9iamVjdChjb21wb25lbnREYXRhOiBhbnksIG5vZGVJZDogbnVtYmVyLCBwcmVmYWJJbmZvSWQ6IG51bWJlcik6IGFueSB7XG4gICAgICAgIGNvbnN0IGNvbXBvbmVudFR5cGUgPSBjb21wb25lbnREYXRhLl9fdHlwZV9fIHx8IGNvbXBvbmVudERhdGEudHlwZTtcbiAgICAgICAgXG4gICAgICAgIGlmICghY29tcG9uZW50VHlwZSkge1xuICAgICAgICAgICAgY29uc29sZS53YXJuKCfnu4Tku7bnvLrlsJHnsbvlnovkv6Hmga86JywgY29tcG9uZW50RGF0YSk7XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgLy8g5Z+656GA57uE5Lu257uT5p6EIC0g5Z+65LqO5a6Y5pa56aKE5Yi25L2T5qC85byPXG4gICAgICAgIGNvbnN0IGNvbXBvbmVudDogYW55ID0ge1xuICAgICAgICAgICAgXCJfX3R5cGVfX1wiOiBjb21wb25lbnRUeXBlLFxuICAgICAgICAgICAgXCJfbmFtZVwiOiBcIlwiLFxuICAgICAgICAgICAgXCJfb2JqRmxhZ3NcIjogMCxcbiAgICAgICAgICAgIFwibm9kZVwiOiB7XG4gICAgICAgICAgICAgICAgXCJfX2lkX19cIjogbm9kZUlkXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgXCJfZW5hYmxlZFwiOiB0aGlzLmdldENvbXBvbmVudFByb3BlcnR5VmFsdWUoY29tcG9uZW50RGF0YSwgJ2VuYWJsZWQnLCB0cnVlKSxcbiAgICAgICAgICAgIFwiX19wcmVmYWJcIjoge1xuICAgICAgICAgICAgICAgIFwiX19pZF9fXCI6IHByZWZhYkluZm9JZFxuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgICAgICBcbiAgICAgICAgLy8g5qC55o2u57uE5Lu257G75Z6L5re75Yqg54m55a6a5bGe5oCnXG4gICAgICAgIHRoaXMuYWRkQ29tcG9uZW50U3BlY2lmaWNQcm9wZXJ0aWVzKGNvbXBvbmVudCwgY29tcG9uZW50RGF0YSwgY29tcG9uZW50VHlwZSk7XG4gICAgICAgIFxuICAgICAgICAvLyDmt7vliqBfaWTlsZ7mgKdcbiAgICAgICAgY29tcG9uZW50Ll9pZCA9IFwiXCI7XG4gICAgICAgIFxuICAgICAgICByZXR1cm4gY29tcG9uZW50O1xuICAgIH1cbiAgICBcbiAgICAvLyDmt7vliqDnu4Tku7bnibnlrprnmoTlsZ7mgKdcbiAgICBwcml2YXRlIGFkZENvbXBvbmVudFNwZWNpZmljUHJvcGVydGllcyhjb21wb25lbnQ6IGFueSwgY29tcG9uZW50RGF0YTogYW55LCBjb21wb25lbnRUeXBlOiBzdHJpbmcpOiB2b2lkIHtcbiAgICAgICAgc3dpdGNoIChjb21wb25lbnRUeXBlKSB7XG4gICAgICAgICAgICBjYXNlICdjYy5VSVRyYW5zZm9ybSc6XG4gICAgICAgICAgICAgICAgdGhpcy5hZGRVSVRyYW5zZm9ybVByb3BlcnRpZXMoY29tcG9uZW50LCBjb21wb25lbnREYXRhKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgJ2NjLlNwcml0ZSc6XG4gICAgICAgICAgICAgICAgdGhpcy5hZGRTcHJpdGVQcm9wZXJ0aWVzKGNvbXBvbmVudCwgY29tcG9uZW50RGF0YSk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlICdjYy5MYWJlbCc6XG4gICAgICAgICAgICAgICAgdGhpcy5hZGRMYWJlbFByb3BlcnRpZXMoY29tcG9uZW50LCBjb21wb25lbnREYXRhKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgJ2NjLkJ1dHRvbic6XG4gICAgICAgICAgICAgICAgdGhpcy5hZGRCdXR0b25Qcm9wZXJ0aWVzKGNvbXBvbmVudCwgY29tcG9uZW50RGF0YSk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgIC8vIOWvueS6juacquefpeexu+Wei+eahOe7hOS7tu+8jOWkjeWItuaJgOacieWuieWFqOeahOWxnuaAp1xuICAgICAgICAgICAgICAgIHRoaXMuYWRkR2VuZXJpY1Byb3BlcnRpZXMoY29tcG9uZW50LCBjb21wb25lbnREYXRhKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgIH1cbiAgICBcbiAgICAvLyBVSVRyYW5zZm9ybee7hOS7tuWxnuaAp1xuICAgIHByaXZhdGUgYWRkVUlUcmFuc2Zvcm1Qcm9wZXJ0aWVzKGNvbXBvbmVudDogYW55LCBjb21wb25lbnREYXRhOiBhbnkpOiB2b2lkIHtcbiAgICAgICAgY29tcG9uZW50Ll9jb250ZW50U2l6ZSA9IHRoaXMuY3JlYXRlU2l6ZU9iamVjdChcbiAgICAgICAgICAgIHRoaXMuZ2V0Q29tcG9uZW50UHJvcGVydHlWYWx1ZShjb21wb25lbnREYXRhLCAnY29udGVudFNpemUnLCB7IHdpZHRoOiAxMDAsIGhlaWdodDogMTAwIH0pXG4gICAgICAgICk7XG4gICAgICAgIGNvbXBvbmVudC5fYW5jaG9yUG9pbnQgPSB0aGlzLmNyZWF0ZVZlYzJPYmplY3QoXG4gICAgICAgICAgICB0aGlzLmdldENvbXBvbmVudFByb3BlcnR5VmFsdWUoY29tcG9uZW50RGF0YSwgJ2FuY2hvclBvaW50JywgeyB4OiAwLjUsIHk6IDAuNSB9KVxuICAgICAgICApO1xuICAgIH1cbiAgICBcbiAgICAvLyBTcHJpdGXnu4Tku7blsZ7mgKdcbiAgICBwcml2YXRlIGFkZFNwcml0ZVByb3BlcnRpZXMoY29tcG9uZW50OiBhbnksIGNvbXBvbmVudERhdGE6IGFueSk6IHZvaWQge1xuICAgICAgICBjb21wb25lbnQuX3Zpc0ZsYWdzID0gMDtcbiAgICAgICAgY29tcG9uZW50Ll9jdXN0b21NYXRlcmlhbCA9IG51bGw7XG4gICAgICAgIGNvbXBvbmVudC5fc3JjQmxlbmRGYWN0b3IgPSAyO1xuICAgICAgICBjb21wb25lbnQuX2RzdEJsZW5kRmFjdG9yID0gNDtcbiAgICAgICAgY29tcG9uZW50Ll9jb2xvciA9IHRoaXMuY3JlYXRlQ29sb3JPYmplY3QoXG4gICAgICAgICAgICB0aGlzLmdldENvbXBvbmVudFByb3BlcnR5VmFsdWUoY29tcG9uZW50RGF0YSwgJ2NvbG9yJywgeyByOiAyNTUsIGc6IDI1NSwgYjogMjU1LCBhOiAyNTUgfSlcbiAgICAgICAgKTtcbiAgICAgICAgY29tcG9uZW50Ll9zcHJpdGVGcmFtZSA9IHRoaXMuZ2V0Q29tcG9uZW50UHJvcGVydHlWYWx1ZShjb21wb25lbnREYXRhLCAnc3ByaXRlRnJhbWUnLCBudWxsKTtcbiAgICAgICAgY29tcG9uZW50Ll90eXBlID0gdGhpcy5nZXRDb21wb25lbnRQcm9wZXJ0eVZhbHVlKGNvbXBvbmVudERhdGEsICd0eXBlJywgMCk7XG4gICAgICAgIGNvbXBvbmVudC5fZmlsbFR5cGUgPSAwO1xuICAgICAgICBjb21wb25lbnQuX3NpemVNb2RlID0gdGhpcy5nZXRDb21wb25lbnRQcm9wZXJ0eVZhbHVlKGNvbXBvbmVudERhdGEsICdzaXplTW9kZScsIDEpO1xuICAgICAgICBjb21wb25lbnQuX2ZpbGxDZW50ZXIgPSB0aGlzLmNyZWF0ZVZlYzJPYmplY3QoeyB4OiAwLCB5OiAwIH0pO1xuICAgICAgICBjb21wb25lbnQuX2ZpbGxTdGFydCA9IDA7XG4gICAgICAgIGNvbXBvbmVudC5fZmlsbFJhbmdlID0gMDtcbiAgICAgICAgY29tcG9uZW50Ll9pc1RyaW1tZWRNb2RlID0gdHJ1ZTtcbiAgICAgICAgY29tcG9uZW50Ll91c2VHcmF5c2NhbGUgPSBmYWxzZTtcbiAgICAgICAgY29tcG9uZW50Ll9hdGxhcyA9IG51bGw7XG4gICAgfVxuICAgIFxuICAgIC8vIExhYmVs57uE5Lu25bGe5oCnXG4gICAgcHJpdmF0ZSBhZGRMYWJlbFByb3BlcnRpZXMoY29tcG9uZW50OiBhbnksIGNvbXBvbmVudERhdGE6IGFueSk6IHZvaWQge1xuICAgICAgICBjb21wb25lbnQuX3Zpc0ZsYWdzID0gMDtcbiAgICAgICAgY29tcG9uZW50Ll9jdXN0b21NYXRlcmlhbCA9IG51bGw7XG4gICAgICAgIGNvbXBvbmVudC5fc3JjQmxlbmRGYWN0b3IgPSAyO1xuICAgICAgICBjb21wb25lbnQuX2RzdEJsZW5kRmFjdG9yID0gNDtcbiAgICAgICAgY29tcG9uZW50Ll9jb2xvciA9IHRoaXMuY3JlYXRlQ29sb3JPYmplY3QoXG4gICAgICAgICAgICB0aGlzLmdldENvbXBvbmVudFByb3BlcnR5VmFsdWUoY29tcG9uZW50RGF0YSwgJ2NvbG9yJywgeyByOiAwLCBnOiAwLCBiOiAwLCBhOiAyNTUgfSlcbiAgICAgICAgKTtcbiAgICAgICAgY29tcG9uZW50Ll9zdHJpbmcgPSB0aGlzLmdldENvbXBvbmVudFByb3BlcnR5VmFsdWUoY29tcG9uZW50RGF0YSwgJ3N0cmluZycsICdMYWJlbCcpO1xuICAgICAgICBjb21wb25lbnQuX2hvcml6b250YWxBbGlnbiA9IDE7XG4gICAgICAgIGNvbXBvbmVudC5fdmVydGljYWxBbGlnbiA9IDE7XG4gICAgICAgIGNvbXBvbmVudC5fYWN0dWFsRm9udFNpemUgPSAyMDtcbiAgICAgICAgY29tcG9uZW50Ll9mb250U2l6ZSA9IHRoaXMuZ2V0Q29tcG9uZW50UHJvcGVydHlWYWx1ZShjb21wb25lbnREYXRhLCAnZm9udFNpemUnLCAyMCk7XG4gICAgICAgIGNvbXBvbmVudC5fZm9udEZhbWlseSA9ICdBcmlhbCc7XG4gICAgICAgIGNvbXBvbmVudC5fbGluZUhlaWdodCA9IDQwO1xuICAgICAgICBjb21wb25lbnQuX292ZXJmbG93ID0gMTtcbiAgICAgICAgY29tcG9uZW50Ll9lbmFibGVXcmFwVGV4dCA9IGZhbHNlO1xuICAgICAgICBjb21wb25lbnQuX2ZvbnQgPSBudWxsO1xuICAgICAgICBjb21wb25lbnQuX2lzU3lzdGVtRm9udFVzZWQgPSB0cnVlO1xuICAgICAgICBjb21wb25lbnQuX2lzSXRhbGljID0gZmFsc2U7XG4gICAgICAgIGNvbXBvbmVudC5faXNCb2xkID0gZmFsc2U7XG4gICAgICAgIGNvbXBvbmVudC5faXNVbmRlcmxpbmUgPSBmYWxzZTtcbiAgICAgICAgY29tcG9uZW50Ll91bmRlcmxpbmVIZWlnaHQgPSAyO1xuICAgICAgICBjb21wb25lbnQuX2NhY2hlTW9kZSA9IDA7XG4gICAgfVxuICAgIFxuICAgIC8vIEJ1dHRvbue7hOS7tuWxnuaAp1xuICAgIHByaXZhdGUgYWRkQnV0dG9uUHJvcGVydGllcyhjb21wb25lbnQ6IGFueSwgY29tcG9uZW50RGF0YTogYW55KTogdm9pZCB7XG4gICAgICAgIGNvbXBvbmVudC5jbGlja0V2ZW50cyA9IFtdO1xuICAgICAgICBjb21wb25lbnQuX2ludGVyYWN0YWJsZSA9IHRydWU7XG4gICAgICAgIGNvbXBvbmVudC5fdHJhbnNpdGlvbiA9IDI7XG4gICAgICAgIGNvbXBvbmVudC5fbm9ybWFsQ29sb3IgPSB0aGlzLmNyZWF0ZUNvbG9yT2JqZWN0KHsgcjogMjE0LCBnOiAyMTQsIGI6IDIxNCwgYTogMjU1IH0pO1xuICAgICAgICBjb21wb25lbnQuX2hvdmVyQ29sb3IgPSB0aGlzLmNyZWF0ZUNvbG9yT2JqZWN0KHsgcjogMjExLCBnOiAyMTEsIGI6IDIxMSwgYTogMjU1IH0pO1xuICAgICAgICBjb21wb25lbnQuX3ByZXNzZWRDb2xvciA9IHRoaXMuY3JlYXRlQ29sb3JPYmplY3QoeyByOiAyNTUsIGc6IDI1NSwgYjogMjU1LCBhOiAyNTUgfSk7XG4gICAgICAgIGNvbXBvbmVudC5fZGlzYWJsZWRDb2xvciA9IHRoaXMuY3JlYXRlQ29sb3JPYmplY3QoeyByOiAxMjQsIGc6IDEyNCwgYjogMTI0LCBhOiAyNTUgfSk7XG4gICAgICAgIGNvbXBvbmVudC5fZHVyYXRpb24gPSAwLjE7XG4gICAgICAgIGNvbXBvbmVudC5fem9vbVNjYWxlID0gMS4yO1xuICAgIH1cbiAgICBcbiAgICAvLyDmt7vliqDpgJrnlKjlsZ7mgKdcbiAgICBwcml2YXRlIGFkZEdlbmVyaWNQcm9wZXJ0aWVzKGNvbXBvbmVudDogYW55LCBjb21wb25lbnREYXRhOiBhbnkpOiB2b2lkIHtcbiAgICAgICAgLy8g5Y+q5aSN5Yi25a6J5YWo55qE44CB5bey55+l55qE5bGe5oCnXG4gICAgICAgIGNvbnN0IHNhZmVQcm9wZXJ0aWVzID0gWydlbmFibGVkJywgJ2NvbG9yJywgJ3N0cmluZycsICdmb250U2l6ZScsICdzcHJpdGVGcmFtZScsICd0eXBlJywgJ3NpemVNb2RlJ107XG4gICAgICAgIFxuICAgICAgICBmb3IgKGNvbnN0IHByb3Agb2Ygc2FmZVByb3BlcnRpZXMpIHtcbiAgICAgICAgICAgIGlmIChjb21wb25lbnREYXRhLmhhc093blByb3BlcnR5KHByb3ApKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgdmFsdWUgPSB0aGlzLmdldENvbXBvbmVudFByb3BlcnR5VmFsdWUoY29tcG9uZW50RGF0YSwgcHJvcCk7XG4gICAgICAgICAgICAgICAgaWYgKHZhbHVlICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgY29tcG9uZW50W2BfJHtwcm9wfWBdID0gdmFsdWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuICAgIFxuICAgIC8vIOWIm+W7ulZlYzLlr7nosaFcbiAgICBwcml2YXRlIGNyZWF0ZVZlYzJPYmplY3QoZGF0YTogYW55KTogYW55IHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIFwiX190eXBlX19cIjogXCJjYy5WZWMyXCIsXG4gICAgICAgICAgICBcInhcIjogZGF0YT8ueCB8fCAwLFxuICAgICAgICAgICAgXCJ5XCI6IGRhdGE/LnkgfHwgMFxuICAgICAgICB9O1xuICAgIH1cbiAgICBcbiAgICAvLyDliJvlu7pWZWMz5a+56LGhXG4gICAgcHJpdmF0ZSBjcmVhdGVWZWMzT2JqZWN0KGRhdGE6IGFueSk6IGFueSB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBcIl9fdHlwZV9fXCI6IFwiY2MuVmVjM1wiLFxuICAgICAgICAgICAgXCJ4XCI6IGRhdGE/LnggfHwgMCxcbiAgICAgICAgICAgIFwieVwiOiBkYXRhPy55IHx8IDAsXG4gICAgICAgICAgICBcInpcIjogZGF0YT8ueiB8fCAwXG4gICAgICAgIH07XG4gICAgfVxuICAgIFxuICAgIC8vIOWIm+W7ulNpemXlr7nosaFcbiAgICBwcml2YXRlIGNyZWF0ZVNpemVPYmplY3QoZGF0YTogYW55KTogYW55IHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIFwiX190eXBlX19cIjogXCJjYy5TaXplXCIsXG4gICAgICAgICAgICBcIndpZHRoXCI6IGRhdGE/LndpZHRoIHx8IDEwMCxcbiAgICAgICAgICAgIFwiaGVpZ2h0XCI6IGRhdGE/LmhlaWdodCB8fCAxMDBcbiAgICAgICAgfTtcbiAgICB9XG4gICAgXG4gICAgLy8g5Yib5bu6Q29sb3Llr7nosaFcbiAgICBwcml2YXRlIGNyZWF0ZUNvbG9yT2JqZWN0KGRhdGE6IGFueSk6IGFueSB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBcIl9fdHlwZV9fXCI6IFwiY2MuQ29sb3JcIixcbiAgICAgICAgICAgIFwiclwiOiBkYXRhPy5yID8/IDI1NSxcbiAgICAgICAgICAgIFwiZ1wiOiBkYXRhPy5nID8/IDI1NSxcbiAgICAgICAgICAgIFwiYlwiOiBkYXRhPy5iID8/IDI1NSxcbiAgICAgICAgICAgIFwiYVwiOiBkYXRhPy5hID8/IDI1NVxuICAgICAgICB9O1xuICAgIH1cblxuICAgIC8vIOWIpOaWreaYr+WQpuW6lOivpeWkjeWItue7hOS7tuWxnuaAp1xuICAgIHByaXZhdGUgc2hvdWxkQ29weUNvbXBvbmVudFByb3BlcnR5KGtleTogc3RyaW5nLCB2YWx1ZTogYW55KTogYm9vbGVhbiB7XG4gICAgICAgIC8vIOi3s+i/h+WGhemDqOWxnuaAp+WSjOW3suWkhOeQhueahOWxnuaAp1xuICAgICAgICBpZiAoa2V5LnN0YXJ0c1dpdGgoJ19fJykgfHwga2V5ID09PSAnX2VuYWJsZWQnIHx8IGtleSA9PT0gJ25vZGUnIHx8IGtleSA9PT0gJ2VuYWJsZWQnKSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIC8vIOi3s+i/h+WHveaVsOWSjHVuZGVmaW5lZOWAvFxuICAgICAgICBpZiAodHlwZW9mIHZhbHVlID09PSAnZnVuY3Rpb24nIHx8IHZhbHVlID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuXG5cbiAgICAvLyDojrflj5bnu4Tku7blsZ7mgKflgLwgLSDph43lkb3lkI3ku6Xpgb/lhY3lhrLnqoFcbiAgICBwcml2YXRlIGdldENvbXBvbmVudFByb3BlcnR5VmFsdWUoY29tcG9uZW50RGF0YTogYW55LCBwcm9wZXJ0eU5hbWU6IHN0cmluZywgZGVmYXVsdFZhbHVlPzogYW55KTogYW55IHtcbiAgICAgICAgLy8g5bCd6K+V55u05o6l6I635Y+W5bGe5oCnXG4gICAgICAgIGlmIChjb21wb25lbnREYXRhW3Byb3BlcnR5TmFtZV0gIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZXh0cmFjdFZhbHVlKGNvbXBvbmVudERhdGFbcHJvcGVydHlOYW1lXSk7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIC8vIOWwneivleS7jnZhbHVl5bGe5oCn5Lit6I635Y+WXG4gICAgICAgIGlmIChjb21wb25lbnREYXRhLnZhbHVlICYmIGNvbXBvbmVudERhdGEudmFsdWVbcHJvcGVydHlOYW1lXSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5leHRyYWN0VmFsdWUoY29tcG9uZW50RGF0YS52YWx1ZVtwcm9wZXJ0eU5hbWVdKTtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgLy8g5bCd6K+V5bim5LiL5YiS57q/5YmN57yA55qE5bGe5oCn5ZCNXG4gICAgICAgIGNvbnN0IHByZWZpeGVkTmFtZSA9IGBfJHtwcm9wZXJ0eU5hbWV9YDtcbiAgICAgICAgaWYgKGNvbXBvbmVudERhdGFbcHJlZml4ZWROYW1lXSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5leHRyYWN0VmFsdWUoY29tcG9uZW50RGF0YVtwcmVmaXhlZE5hbWVdKTtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgcmV0dXJuIGRlZmF1bHRWYWx1ZTtcbiAgICB9XG4gICAgXG4gICAgLy8g5o+Q5Y+W5bGe5oCn5YC8XG4gICAgcHJpdmF0ZSBleHRyYWN0VmFsdWUoZGF0YTogYW55KTogYW55IHtcbiAgICAgICAgaWYgKGRhdGEgPT09IG51bGwgfHwgZGF0YSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICByZXR1cm4gZGF0YTtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgLy8g5aaC5p6c5pyJdmFsdWXlsZ7mgKfvvIzkvJjlhYjkvb/nlKh2YWx1ZVxuICAgICAgICBpZiAodHlwZW9mIGRhdGEgPT09ICdvYmplY3QnICYmIGRhdGEuaGFzT3duUHJvcGVydHkoJ3ZhbHVlJykpIHtcbiAgICAgICAgICAgIHJldHVybiBkYXRhLnZhbHVlO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICAvLyDlpoLmnpzmmK/lvJXnlKjlr7nosaHvvIzkv53mjIHljp/moLdcbiAgICAgICAgaWYgKHR5cGVvZiBkYXRhID09PSAnb2JqZWN0JyAmJiAoZGF0YS5fX2lkX18gIT09IHVuZGVmaW5lZCB8fCBkYXRhLl9fdXVpZF9fICE9PSB1bmRlZmluZWQpKSB7XG4gICAgICAgICAgICByZXR1cm4gZGF0YTtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgcmV0dXJuIGRhdGE7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBjcmVhdGVTdGFuZGFyZE1ldGFEYXRhKHByZWZhYk5hbWU6IHN0cmluZywgcHJlZmFiVXVpZDogc3RyaW5nKTogYW55IHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIFwidmVyXCI6IFwiMS4xLjUwXCIsXG4gICAgICAgICAgICBcImltcG9ydGVyXCI6IFwicHJlZmFiXCIsXG4gICAgICAgICAgICBcImltcG9ydGVkXCI6IHRydWUsXG4gICAgICAgICAgICBcInV1aWRcIjogcHJlZmFiVXVpZCxcbiAgICAgICAgICAgIFwiZmlsZXNcIjogW1xuICAgICAgICAgICAgICAgIFwiLmpzb25cIlxuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIFwic3ViTWV0YXNcIjoge30sXG4gICAgICAgICAgICBcInVzZXJEYXRhXCI6IHtcbiAgICAgICAgICAgICAgICBcInN5bmNOb2RlTmFtZVwiOiBwcmVmYWJOYW1lXG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBhc3luYyBzYXZlUHJlZmFiV2l0aE1ldGEocHJlZmFiUGF0aDogc3RyaW5nLCBwcmVmYWJEYXRhOiBhbnlbXSwgbWV0YURhdGE6IGFueSk6IFByb21pc2U8eyBzdWNjZXNzOiBib29sZWFuOyBlcnJvcj86IHN0cmluZyB9PiB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBjb25zdCBwcmVmYWJDb250ZW50ID0gSlNPTi5zdHJpbmdpZnkocHJlZmFiRGF0YSwgbnVsbCwgMik7XG4gICAgICAgICAgICBjb25zdCBtZXRhQ29udGVudCA9IEpTT04uc3RyaW5naWZ5KG1ldGFEYXRhLCBudWxsLCAyKTtcblxuICAgICAgICAgICAgLy8g56Gu5L+d6Lev5b6E5LulLnByZWZhYue7k+WwvlxuICAgICAgICAgICAgY29uc3QgZmluYWxQcmVmYWJQYXRoID0gcHJlZmFiUGF0aC5lbmRzV2l0aCgnLnByZWZhYicpID8gcHJlZmFiUGF0aCA6IGAke3ByZWZhYlBhdGh9LnByZWZhYmA7XG4gICAgICAgICAgICBjb25zdCBtZXRhUGF0aCA9IGAke2ZpbmFsUHJlZmFiUGF0aH0ubWV0YWA7XG5cbiAgICAgICAgICAgIC8vIOS9v+eUqGFzc2V0LWRiIEFQSeWIm+W7uumihOWItuS9k+aWh+S7tlxuICAgICAgICAgICAgYXdhaXQgbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICAgICAgICAgIEVkaXRvci5NZXNzYWdlLnJlcXVlc3QoJ2Fzc2V0LWRiJywgJ2NyZWF0ZS1hc3NldCcsIGZpbmFsUHJlZmFiUGF0aCwgcHJlZmFiQ29udGVudCkudGhlbigoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHJlc29sdmUodHJ1ZSk7XG4gICAgICAgICAgICAgICAgfSkuY2F0Y2goKGVycm9yOiBhbnkpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgcmVqZWN0KGVycm9yKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAvLyDliJvlu7ptZXRh5paH5Lu2XG4gICAgICAgICAgICBhd2FpdCBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgICAgICAgICAgRWRpdG9yLk1lc3NhZ2UucmVxdWVzdCgnYXNzZXQtZGInLCAnY3JlYXRlLWFzc2V0JywgbWV0YVBhdGgsIG1ldGFDb250ZW50KS50aGVuKCgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZSh0cnVlKTtcbiAgICAgICAgICAgICAgICB9KS5jYXRjaCgoZXJyb3I6IGFueSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICByZWplY3QoZXJyb3IpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGA9PT0g6aKE5Yi25L2T5L+d5a2Y5a6M5oiQID09PWApO1xuICAgICAgICAgICAgY29uc29sZS5sb2coYOmihOWItuS9k+aWh+S7tuW3suS/neWtmDogJHtmaW5hbFByZWZhYlBhdGh9YCk7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhgTWV0YeaWh+S7tuW3suS/neWtmDogJHttZXRhUGF0aH1gKTtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGDpooTliLbkvZPmlbDnu4TmgLvplb/luqY6ICR7cHJlZmFiRGF0YS5sZW5ndGh9YCk7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhg6aKE5Yi25L2T5qC56IqC54K557Si5byVOiAke3ByZWZhYkRhdGEubGVuZ3RoIC0gMX1gKTtcblxuICAgICAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogdHJ1ZSB9O1xuICAgICAgICB9IGNhdGNoIChlcnJvcjogYW55KSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKCfkv53lrZjpooTliLbkvZPmlofku7bml7blh7rplJk6JywgZXJyb3IpO1xuICAgICAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiBlcnJvci5tZXNzYWdlIH07XG4gICAgICAgIH1cbiAgICB9XG5cbn0iXX0=