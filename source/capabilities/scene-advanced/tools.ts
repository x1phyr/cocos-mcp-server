import { ToolDefinition, ToolResponse, ToolExecutor } from '../../types';

export class SceneAdvancedTools implements ToolExecutor {
    getTools(): ToolDefinition[] {
        return [
            {
                name: 'reset_node_property',
                description: '重置节点属性为默认值',
                inputSchema: {
                    type: 'object',
                    properties: {
                        uuid: {
                            type: 'string',
                            description: '节点 UUID'
                        },
                        path: {
                            type: 'string',
                            description: '属性路径（如 position、rotation、scale）'
                        }
                    },
                    required: ['uuid', 'path']
                }
            },
            {
                name: 'move_array_element',
                description: '移动数组元素位置',
                inputSchema: {
                    type: 'object',
                    properties: {
                        uuid: {
                            type: 'string',
                            description: '节点 UUID'
                        },
                        path: {
                            type: 'string',
                            description: '数组属性路径（如 __comps__）'
                        },
                        target: {
                            type: 'number',
                            description: '目标元素原始索引'
                        },
                        offset: {
                            type: 'number',
                            description: '偏移量（正数或负数）'
                        }
                    },
                    required: ['uuid', 'path', 'target', 'offset']
                }
            },
            {
                name: 'remove_array_element',
                description: '移除指定索引的数组元素',
                inputSchema: {
                    type: 'object',
                    properties: {
                        uuid: {
                            type: 'string',
                            description: '节点 UUID'
                        },
                        path: {
                            type: 'string',
                            description: '数组属性路径'
                        },
                        index: {
                            type: 'number',
                            description: '要移除的元素索引'
                        }
                    },
                    required: ['uuid', 'path', 'index']
                }
            },
            {
                name: 'copy_node',
                description: '复制节点以供后续粘贴操作',
                inputSchema: {
                    type: 'object',
                    properties: {
                        uuids: {
                            oneOf: [
                                { type: 'string' },
                                { type: 'array', items: { type: 'string' } }
                            ],
                            description: '要复制的节点 UUID 或 UUID 数组'
                        }
                    },
                    required: ['uuids']
                }
            },
            {
                name: 'paste_node',
                description: '粘贴之前复制的节点',
                inputSchema: {
                    type: 'object',
                    properties: {
                        target: {
                            type: 'string',
                            description: '目标父节点 UUID'
                        },
                        uuids: {
                            oneOf: [
                                { type: 'string' },
                                { type: 'array', items: { type: 'string' } }
                            ],
                            description: '要粘贴的节点 UUID'
                        },
                        keepWorldTransform: {
                            type: 'boolean',
                            description: '是否保持世界坐标变换',
                            default: false
                        }
                    },
                    required: ['target', 'uuids']
                }
            },
            {
                name: 'cut_node',
                description: '剪切节点（复制并标记为移动）',
                inputSchema: {
                    type: 'object',
                    properties: {
                        uuids: {
                            oneOf: [
                                { type: 'string' },
                                { type: 'array', items: { type: 'string' } }
                            ],
                            description: '要剪切的节点 UUID 或 UUID 数组'
                        }
                    },
                    required: ['uuids']
                }
            },
            {
                name: 'reset_node_transform',
                description: '重置节点位置、旋转和缩放',
                inputSchema: {
                    type: 'object',
                    properties: {
                        uuid: {
                            type: 'string',
                            description: '节点 UUID'
                        }
                    },
                    required: ['uuid']
                }
            },
            {
                name: 'reset_component',
                description: '重置组件为默认值',
                inputSchema: {
                    type: 'object',
                    properties: {
                        uuid: {
                            type: 'string',
                            description: '组件 UUID'
                        }
                    },
                    required: ['uuid']
                }
            },
            {
                name: 'restore_prefab',
                description: '从资源恢复预制体实例',
                inputSchema: {
                    type: 'object',
                    properties: {
                        nodeUuid: {
                            type: 'string',
                            description: '节点 UUID'
                        },
                        assetUuid: {
                            type: 'string',
                            description: '预制体资源 UUID'
                        }
                    },
                    required: ['nodeUuid', 'assetUuid']
                }
            },
            {
                name: 'execute_component_method',
                description: '执行组件方法',
                inputSchema: {
                    type: 'object',
                    properties: {
                        uuid: {
                            type: 'string',
                            description: '组件 UUID'
                        },
                        name: {
                            type: 'string',
                            description: '方法名'
                        },
                        args: {
                            type: 'array',
                            description: '方法参数',
                            default: []
                        }
                    },
                    required: ['uuid', 'name']
                }
            },
            {
                name: 'execute_scene_script',
                description: '执行场景脚本方法',
                inputSchema: {
                    type: 'object',
                    properties: {
                        name: {
                            type: 'string',
                            description: '插件名'
                        },
                        method: {
                            type: 'string',
                            description: '方法名'
                        },
                        args: {
                            type: 'array',
                            description: '方法参数',
                            default: []
                        }
                    },
                    required: ['name', 'method']
                }
            },
            {
                name: 'scene_snapshot',
                description: '创建场景状态快照',
                inputSchema: {
                    type: 'object',
                    properties: {}
                }
            },
            {
                name: 'scene_snapshot_abort',
                description: '中止场景快照创建',
                inputSchema: {
                    type: 'object',
                    properties: {}
                }
            },
            {
                name: 'begin_undo_recording',
                description: '开始记录撤销数据',
                inputSchema: {
                    type: 'object',
                    properties: {
                        nodeUuid: {
                            type: 'string',
                            description: '要记录的节点 UUID'
                        }
                    },
                    required: ['nodeUuid']
                }
            },
            {
                name: 'end_undo_recording',
                description: '结束记录撤销数据',
                inputSchema: {
                    type: 'object',
                    properties: {
                        undoId: {
                            type: 'string',
                            description: '来自 begin_undo_recording 的撤销记录 ID'
                        }
                    },
                    required: ['undoId']
                }
            },
            {
                name: 'cancel_undo_recording',
                description: '取消撤销记录',
                inputSchema: {
                    type: 'object',
                    properties: {
                        undoId: {
                            type: 'string',
                            description: '要取消的撤销记录 ID'
                        }
                    },
                    required: ['undoId']
                }
            },
            {
                name: 'soft_reload_scene',
                description: '软重载当前场景',
                inputSchema: {
                    type: 'object',
                    properties: {}
                }
            },
            {
                name: 'query_scene_ready',
                description: '查询场景是否就绪',
                inputSchema: {
                    type: 'object',
                    properties: {}
                }
            },
            {
                name: 'query_scene_dirty',
                description: '查询场景是否有未保存的更改',
                inputSchema: {
                    type: 'object',
                    properties: {}
                }
            },
            {
                name: 'query_scene_classes',
                description: '查询所有已注册的类',
                inputSchema: {
                    type: 'object',
                    properties: {
                        extends: {
                            type: 'string',
                            description: '筛选继承指定基类的类'
                        }
                    }
                }
            },
            {
                name: 'query_scene_components',
                description: '查询可用场景组件',
                inputSchema: {
                    type: 'object',
                    properties: {}
                }
            },
            {
                name: 'query_component_has_script',
                description: '查询组件是否有脚本',
                inputSchema: {
                    type: 'object',
                    properties: {
                        className: {
                            type: 'string',
                            description: '要检查的脚本类名'
                        }
                    },
                    required: ['className']
                }
            },
            {
                name: 'query_nodes_by_asset_uuid',
                description: '查找使用指定资源 UUID 的节点',
                inputSchema: {
                    type: 'object',
                    properties: {
                        assetUuid: {
                            type: 'string',
                            description: '要搜索的资源 UUID'
                        }
                    },
                    required: ['assetUuid']
                }
            }
        ];
    }

    async execute(toolName: string, args: any): Promise<ToolResponse> {
        switch (toolName) {
            case 'reset_node_property':
                return await this.resetNodeProperty(args.uuid, args.path);
            case 'move_array_element':
                return await this.moveArrayElement(args.uuid, args.path, args.target, args.offset);
            case 'remove_array_element':
                return await this.removeArrayElement(args.uuid, args.path, args.index);
            case 'copy_node':
                return await this.copyNode(args.uuids);
            case 'paste_node':
                return await this.pasteNode(args.target, args.uuids, args.keepWorldTransform);
            case 'cut_node':
                return await this.cutNode(args.uuids);
            case 'reset_node_transform':
                return await this.resetNodeTransform(args.uuid);
            case 'reset_component':
                return await this.resetComponent(args.uuid);
            case 'restore_prefab':
                return await this.restorePrefab(args.nodeUuid, args.assetUuid);
            case 'execute_component_method':
                return await this.executeComponentMethod(args.uuid, args.name, args.args);
            case 'execute_scene_script':
                return await this.executeSceneScript(args.name, args.method, args.args);
            case 'scene_snapshot':
                return await this.sceneSnapshot();
            case 'scene_snapshot_abort':
                return await this.sceneSnapshotAbort();
            case 'begin_undo_recording':
                return await this.beginUndoRecording(args.nodeUuid);
            case 'end_undo_recording':
                return await this.endUndoRecording(args.undoId);
            case 'cancel_undo_recording':
                return await this.cancelUndoRecording(args.undoId);
            case 'soft_reload_scene':
                return await this.softReloadScene();
            case 'query_scene_ready':
                return await this.querySceneReady();
            case 'query_scene_dirty':
                return await this.querySceneDirty();
            case 'query_scene_classes':
                return await this.querySceneClasses(args.extends);
            case 'query_scene_components':
                return await this.querySceneComponents();
            case 'query_component_has_script':
                return await this.queryComponentHasScript(args.className);
            case 'query_nodes_by_asset_uuid':
                return await this.queryNodesByAssetUuid(args.assetUuid);
            default:
                throw new Error(`Unknown tool: ${toolName}`);
        }
    }

    private async resetNodeProperty(uuid: string, path: string): Promise<ToolResponse> {
        return new Promise((resolve) => {
            Editor.Message.request('scene', 'reset-property', { 
                uuid, 
                path, 
                dump: { value: null } 
            }).then(() => {
                resolve({
                    success: true,
                    message: `Property '${path}' reset to default value`
                });
            }).catch((err: Error) => {
                resolve({ success: false, error: err.message });
            });
        });
    }

    private async moveArrayElement(uuid: string, path: string, target: number, offset: number): Promise<ToolResponse> {
        return new Promise((resolve) => {
            Editor.Message.request('scene', 'move-array-element', {
                uuid,
                path,
                target,
                offset
            }).then(() => {
                resolve({
                    success: true,
                    message: `Array element at index ${target} moved by ${offset}`
                });
            }).catch((err: Error) => {
                resolve({ success: false, error: err.message });
            });
        });
    }

    private async removeArrayElement(uuid: string, path: string, index: number): Promise<ToolResponse> {
        return new Promise((resolve) => {
            Editor.Message.request('scene', 'remove-array-element', {
                uuid,
                path,
                index
            }).then(() => {
                resolve({
                    success: true,
                    message: `Array element at index ${index} removed`
                });
            }).catch((err: Error) => {
                resolve({ success: false, error: err.message });
            });
        });
    }

    private async copyNode(uuids: string | string[]): Promise<ToolResponse> {
        return new Promise((resolve) => {
            Editor.Message.request('scene', 'copy-node', uuids).then((result: string | string[]) => {
                resolve({
                    success: true,
                    data: {
                        copiedUuids: result,
                        message: 'Node(s) copied successfully'
                    }
                });
            }).catch((err: Error) => {
                resolve({ success: false, error: err.message });
            });
        });
    }

    private async pasteNode(target: string, uuids: string | string[], keepWorldTransform: boolean = false): Promise<ToolResponse> {
        return new Promise((resolve) => {
            Editor.Message.request('scene', 'paste-node', {
                target,
                uuids,
                keepWorldTransform
            }).then((result: string | string[]) => {
                resolve({
                    success: true,
                    data: {
                        newUuids: result,
                        message: 'Node(s) pasted successfully'
                    }
                });
            }).catch((err: Error) => {
                resolve({ success: false, error: err.message });
            });
        });
    }

    private async cutNode(uuids: string | string[]): Promise<ToolResponse> {
        return new Promise((resolve) => {
            Editor.Message.request('scene', 'cut-node', uuids).then((result: any) => {
                resolve({
                    success: true,
                    data: {
                        cutUuids: result,
                        message: 'Node(s) cut successfully'
                    }
                });
            }).catch((err: Error) => {
                resolve({ success: false, error: err.message });
            });
        });
    }

    private async resetNodeTransform(uuid: string): Promise<ToolResponse> {
        return new Promise((resolve) => {
            Editor.Message.request('scene', 'reset-node', { uuid }).then(() => {
                resolve({
                    success: true,
                    message: 'Node transform reset to default'
                });
            }).catch((err: Error) => {
                resolve({ success: false, error: err.message });
            });
        });
    }

    private async resetComponent(uuid: string): Promise<ToolResponse> {
        return new Promise((resolve) => {
            Editor.Message.request('scene', 'reset-component', { uuid }).then(() => {
                resolve({
                    success: true,
                    message: 'Component reset to default values'
                });
            }).catch((err: Error) => {
                resolve({ success: false, error: err.message });
            });
        });
    }

    private async restorePrefab(nodeUuid: string, assetUuid: string): Promise<ToolResponse> {
        return new Promise((resolve) => {
            (Editor.Message.request as any)('scene', 'restore-prefab', nodeUuid, assetUuid).then(() => {
                resolve({
                    success: true,
                    message: 'Prefab restored successfully'
                });
            }).catch((err: Error) => {
                resolve({ success: false, error: err.message });
            });
        });
    }

    private async executeComponentMethod(uuid: string, name: string, args: any[] = []): Promise<ToolResponse> {
        return new Promise((resolve) => {
            Editor.Message.request('scene', 'execute-component-method', {
                uuid,
                name,
                args
            }).then((result: any) => {
                resolve({
                    success: true,
                    data: {
                        result: result,
                        message: `Method '${name}' executed successfully`
                    }
                });
            }).catch((err: Error) => {
                resolve({ success: false, error: err.message });
            });
        });
    }

    private async executeSceneScript(name: string, method: string, args: any[] = []): Promise<ToolResponse> {
        return new Promise((resolve) => {
            Editor.Message.request('scene', 'execute-scene-script', {
                name,
                method,
                args
            }).then((result: any) => {
                resolve({
                    success: true,
                    data: result
                });
            }).catch((err: Error) => {
                resolve({ success: false, error: err.message });
            });
        });
    }

    private async sceneSnapshot(): Promise<ToolResponse> {
        return new Promise((resolve) => {
            Editor.Message.request('scene', 'snapshot').then(() => {
                resolve({
                    success: true,
                    message: 'Scene snapshot created'
                });
            }).catch((err: Error) => {
                resolve({ success: false, error: err.message });
            });
        });
    }

    private async sceneSnapshotAbort(): Promise<ToolResponse> {
        return new Promise((resolve) => {
            Editor.Message.request('scene', 'snapshot-abort').then(() => {
                resolve({
                    success: true,
                    message: 'Scene snapshot aborted'
                });
            }).catch((err: Error) => {
                resolve({ success: false, error: err.message });
            });
        });
    }

    private async beginUndoRecording(nodeUuid: string): Promise<ToolResponse> {
        return new Promise((resolve) => {
            Editor.Message.request('scene', 'begin-recording', nodeUuid).then((undoId: string) => {
                resolve({
                    success: true,
                    data: {
                        undoId: undoId,
                        message: 'Undo recording started'
                    }
                });
            }).catch((err: Error) => {
                resolve({ success: false, error: err.message });
            });
        });
    }

    private async endUndoRecording(undoId: string): Promise<ToolResponse> {
        return new Promise((resolve) => {
            Editor.Message.request('scene', 'end-recording', undoId).then(() => {
                resolve({
                    success: true,
                    message: 'Undo recording ended'
                });
            }).catch((err: Error) => {
                resolve({ success: false, error: err.message });
            });
        });
    }

    private async cancelUndoRecording(undoId: string): Promise<ToolResponse> {
        return new Promise((resolve) => {
            Editor.Message.request('scene', 'cancel-recording', undoId).then(() => {
                resolve({
                    success: true,
                    message: 'Undo recording cancelled'
                });
            }).catch((err: Error) => {
                resolve({ success: false, error: err.message });
            });
        });
    }

    private async softReloadScene(): Promise<ToolResponse> {
        return new Promise((resolve) => {
            Editor.Message.request('scene', 'soft-reload').then(() => {
                resolve({
                    success: true,
                    message: 'Scene soft reloaded successfully'
                });
            }).catch((err: Error) => {
                resolve({ success: false, error: err.message });
            });
        });
    }

    private async querySceneReady(): Promise<ToolResponse> {
        return new Promise((resolve) => {
            Editor.Message.request('scene', 'query-is-ready').then((ready: boolean) => {
                resolve({
                    success: true,
                    data: {
                        ready: ready,
                        message: ready ? 'Scene is ready' : 'Scene is not ready'
                    }
                });
            }).catch((err: Error) => {
                resolve({ success: false, error: err.message });
            });
        });
    }

    private async querySceneDirty(): Promise<ToolResponse> {
        return new Promise((resolve) => {
            Editor.Message.request('scene', 'query-dirty').then((dirty: boolean) => {
                resolve({
                    success: true,
                    data: {
                        dirty: dirty,
                        message: dirty ? 'Scene has unsaved changes' : 'Scene is clean'
                    }
                });
            }).catch((err: Error) => {
                resolve({ success: false, error: err.message });
            });
        });
    }

    private async querySceneClasses(extendsClass?: string): Promise<ToolResponse> {
        return new Promise((resolve) => {
            const options: any = {};
            if (extendsClass) {
                options.extends = extendsClass;
            }

            Editor.Message.request('scene', 'query-classes', options).then((classes: any[]) => {
                resolve({
                    success: true,
                    data: {
                        classes: classes,
                        count: classes.length,
                        extendsFilter: extendsClass
                    }
                });
            }).catch((err: Error) => {
                resolve({ success: false, error: err.message });
            });
        });
    }

    private async querySceneComponents(): Promise<ToolResponse> {
        return new Promise((resolve) => {
            Editor.Message.request('scene', 'query-components').then((components: any[]) => {
                resolve({
                    success: true,
                    data: {
                        components: components,
                        count: components.length
                    }
                });
            }).catch((err: Error) => {
                resolve({ success: false, error: err.message });
            });
        });
    }

    private async queryComponentHasScript(className: string): Promise<ToolResponse> {
        return new Promise((resolve) => {
            Editor.Message.request('scene', 'query-component-has-script', className).then((hasScript: boolean) => {
                resolve({
                    success: true,
                    data: {
                        className: className,
                        hasScript: hasScript,
                        message: hasScript ? `Component '${className}' has script` : `Component '${className}' does not have script`
                    }
                });
            }).catch((err: Error) => {
                resolve({ success: false, error: err.message });
            });
        });
    }

    private async queryNodesByAssetUuid(assetUuid: string): Promise<ToolResponse> {
        return new Promise((resolve) => {
            Editor.Message.request('scene', 'query-nodes-by-asset-uuid', assetUuid).then((nodeUuids: string[]) => {
                resolve({
                    success: true,
                    data: {
                        assetUuid: assetUuid,
                        nodeUuids: nodeUuids,
                        count: nodeUuids.length,
                        message: `Found ${nodeUuids.length} nodes using asset`
                    }
                });
            }).catch((err: Error) => {
                resolve({ success: false, error: err.message });
            });
        });
    }
}