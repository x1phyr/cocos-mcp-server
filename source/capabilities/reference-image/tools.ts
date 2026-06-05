import { ToolDefinition, ToolResponse, ToolExecutor } from '../../types';

export class ReferenceImageTools implements ToolExecutor {
    getTools(): ToolDefinition[] {
        return [
            {
                name: 'add_reference_image',
                description: '添加参考图片到场景',
                inputSchema: {
                    type: 'object',
                    properties: {
                        paths: {
                            type: 'array',
                            items: { type: 'string' },
                            description: '参考图片绝对路径数组'
                        }
                    },
                    required: ['paths']
                }
            },
            {
                name: 'remove_reference_image',
                description: '移除参考图片',
                inputSchema: {
                    type: 'object',
                    properties: {
                        paths: {
                            type: 'array',
                            items: { type: 'string' },
                            description: '要移除的参考图片路径数组（可选，为空时移除当前图片）'
                        }
                    }
                }
            },
            {
                name: 'switch_reference_image',
                description: '切换到指定参考图片',
                inputSchema: {
                    type: 'object',
                    properties: {
                        path: {
                            type: 'string',
                            description: '参考图片绝对路径'
                        },
                        sceneUUID: {
                            type: 'string',
                            description: '指定场景 UUID（可选）'
                        }
                    },
                    required: ['path']
                }
            },
            {
                name: 'set_reference_image_data',
                description: '设置参考图片变换和显示属性',
                inputSchema: {
                    type: 'object',
                    properties: {
                        key: {
                            type: 'string',
                            description: '属性键',
                            enum: ['path', 'x', 'y', 'sx', 'sy', 'opacity']
                        },
                        value: {
                            description: '属性值（path: 字符串, x/y/sx/sy: 数字, opacity: 数字 0-1）'
                        }
                    },
                    required: ['key', 'value']
                }
            },
            {
                name: 'query_reference_image_config',
                description: '查询参考图片配置',
                inputSchema: {
                    type: 'object',
                    properties: {}
                }
            },
            {
                name: 'query_current_reference_image',
                description: '查询当前参考图片数据',
                inputSchema: {
                    type: 'object',
                    properties: {}
                }
            },
            {
                name: 'refresh_reference_image',
                description: '刷新参考图片显示',
                inputSchema: {
                    type: 'object',
                    properties: {}
                }
            },
            {
                name: 'set_reference_image_position',
                description: '设置参考图片位置',
                inputSchema: {
                    type: 'object',
                    properties: {
                        x: {
                            type: 'number',
                            description: 'X 偏移'
                        },
                        y: {
                            type: 'number',
                            description: 'Y 偏移'
                        }
                    },
                    required: ['x', 'y']
                }
            },
            {
                name: 'set_reference_image_scale',
                description: '设置参考图片缩放',
                inputSchema: {
                    type: 'object',
                    properties: {
                        sx: {
                            type: 'number',
                            description: 'X 缩放',
                            minimum: 0.1,
                            maximum: 10
                        },
                        sy: {
                            type: 'number',
                            description: 'Y 缩放',
                            minimum: 0.1,
                            maximum: 10
                        }
                    },
                    required: ['sx', 'sy']
                }
            },
            {
                name: 'set_reference_image_opacity',
                description: '设置参考图片透明度',
                inputSchema: {
                    type: 'object',
                    properties: {
                        opacity: {
                            type: 'number',
                            description: '透明度（0.0 到 1.0）',
                            minimum: 0,
                            maximum: 1
                        }
                    },
                    required: ['opacity']
                }
            },
            {
                name: 'list_reference_images',
                description: '列出所有可用参考图片',
                inputSchema: {
                    type: 'object',
                    properties: {}
                }
            },
            {
                name: 'clear_all_reference_images',
                description: '清除所有参考图片',
                inputSchema: {
                    type: 'object',
                    properties: {}
                }
            }
        ];
    }

    async execute(toolName: string, args: any): Promise<ToolResponse> {
        switch (toolName) {
            case 'add_reference_image':
                return await this.addReferenceImage(args.paths);
            case 'remove_reference_image':
                return await this.removeReferenceImage(args.paths);
            case 'switch_reference_image':
                return await this.switchReferenceImage(args.path, args.sceneUUID);
            case 'set_reference_image_data':
                return await this.setReferenceImageData(args.key, args.value);
            case 'query_reference_image_config':
                return await this.queryReferenceImageConfig();
            case 'query_current_reference_image':
                return await this.queryCurrentReferenceImage();
            case 'refresh_reference_image':
                return await this.refreshReferenceImage();
            case 'set_reference_image_position':
                return await this.setReferenceImagePosition(args.x, args.y);
            case 'set_reference_image_scale':
                return await this.setReferenceImageScale(args.sx, args.sy);
            case 'set_reference_image_opacity':
                return await this.setReferenceImageOpacity(args.opacity);
            case 'list_reference_images':
                return await this.listReferenceImages();
            case 'clear_all_reference_images':
                return await this.clearAllReferenceImages();
            default:
                throw new Error(`Unknown tool: ${toolName}`);
        }
    }

    private async addReferenceImage(paths: string[]): Promise<ToolResponse> {
        return new Promise((resolve) => {
            Editor.Message.request('reference-image', 'add-image', paths).then(() => {
                resolve({
                    success: true,
                    data: {
                        addedPaths: paths,
                        count: paths.length,
                        message: `Added ${paths.length} reference image(s)`
                    }
                });
            }).catch((err: Error) => {
                resolve({ success: false, error: err.message });
            });
        });
    }

    private async removeReferenceImage(paths?: string[]): Promise<ToolResponse> {
        return new Promise((resolve) => {
            Editor.Message.request('reference-image', 'remove-image', paths).then(() => {
                const message = paths && paths.length > 0 ? 
                    `Removed ${paths.length} reference image(s)` : 
                    'Removed current reference image';
                resolve({
                    success: true,
                    message: message
                });
            }).catch((err: Error) => {
                resolve({ success: false, error: err.message });
            });
        });
    }

    private async switchReferenceImage(path: string, sceneUUID?: string): Promise<ToolResponse> {
        return new Promise((resolve) => {
            const args = sceneUUID ? [path, sceneUUID] : [path];
            Editor.Message.request('reference-image', 'switch-image', ...args).then(() => {
                resolve({
                    success: true,
                    data: {
                        path: path,
                        sceneUUID: sceneUUID,
                        message: `Switched to reference image: ${path}`
                    }
                });
            }).catch((err: Error) => {
                resolve({ success: false, error: err.message });
            });
        });
    }

    private async setReferenceImageData(key: string, value: any): Promise<ToolResponse> {
        return new Promise((resolve) => {
            Editor.Message.request('reference-image', 'set-image-data', key, value).then(() => {
                resolve({
                    success: true,
                    data: {
                        key: key,
                        value: value,
                        message: `Reference image ${key} set to ${value}`
                    }
                });
            }).catch((err: Error) => {
                resolve({ success: false, error: err.message });
            });
        });
    }

    private async queryReferenceImageConfig(): Promise<ToolResponse> {
        return new Promise((resolve) => {
            Editor.Message.request('reference-image', 'query-config').then((config: any) => {
                resolve({
                    success: true,
                    data: config
                });
            }).catch((err: Error) => {
                resolve({ success: false, error: err.message });
            });
        });
    }

    private async queryCurrentReferenceImage(): Promise<ToolResponse> {
        return new Promise((resolve) => {
            Editor.Message.request('reference-image', 'query-current').then((current: any) => {
                resolve({
                    success: true,
                    data: current
                });
            }).catch((err: Error) => {
                resolve({ success: false, error: err.message });
            });
        });
    }

    private async refreshReferenceImage(): Promise<ToolResponse> {
        return new Promise((resolve) => {
            Editor.Message.request('reference-image', 'refresh').then(() => {
                resolve({
                    success: true,
                    message: 'Reference image refreshed'
                });
            }).catch((err: Error) => {
                resolve({ success: false, error: err.message });
            });
        });
    }

    private async setReferenceImagePosition(x: number, y: number): Promise<ToolResponse> {
        return new Promise(async (resolve) => {
            try {
                await Editor.Message.request('reference-image', 'set-image-data', 'x', x);
                await Editor.Message.request('reference-image', 'set-image-data', 'y', y);
                
                resolve({
                    success: true,
                    data: {
                        x: x,
                        y: y,
                        message: `Reference image position set to (${x}, ${y})`
                    }
                });
            } catch (err: any) {
                resolve({ success: false, error: err.message });
            }
        });
    }

    private async setReferenceImageScale(sx: number, sy: number): Promise<ToolResponse> {
        return new Promise(async (resolve) => {
            try {
                await Editor.Message.request('reference-image', 'set-image-data', 'sx', sx);
                await Editor.Message.request('reference-image', 'set-image-data', 'sy', sy);
                
                resolve({
                    success: true,
                    data: {
                        sx: sx,
                        sy: sy,
                        message: `Reference image scale set to (${sx}, ${sy})`
                    }
                });
            } catch (err: any) {
                resolve({ success: false, error: err.message });
            }
        });
    }

    private async setReferenceImageOpacity(opacity: number): Promise<ToolResponse> {
        return new Promise((resolve) => {
            Editor.Message.request('reference-image', 'set-image-data', 'opacity', opacity).then(() => {
                resolve({
                    success: true,
                    data: {
                        opacity: opacity,
                        message: `Reference image opacity set to ${opacity}`
                    }
                });
            }).catch((err: Error) => {
                resolve({ success: false, error: err.message });
            });
        });
    }

    private async listReferenceImages(): Promise<ToolResponse> {
        return new Promise(async (resolve) => {
            try {
                const config = await Editor.Message.request('reference-image', 'query-config');
                const current = await Editor.Message.request('reference-image', 'query-current');
                
                resolve({
                    success: true,
                    data: {
                        config: config,
                        current: current,
                        message: 'Reference image information retrieved'
                    }
                });
            } catch (err: any) {
                resolve({ success: false, error: err.message });
            }
        });
    }

    private async clearAllReferenceImages(): Promise<ToolResponse> {
        return new Promise(async (resolve) => {
            try {
                // Remove all reference images by calling remove-image without paths
                await Editor.Message.request('reference-image', 'remove-image');
                
                resolve({
                    success: true,
                    message: 'All reference images cleared'
                });
            } catch (err: any) {
                resolve({ success: false, error: err.message });
            }
        });
    }
}