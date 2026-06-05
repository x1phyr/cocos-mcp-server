"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SceneViewTools = void 0;
class SceneViewTools {
    getTools() {
        return [
            {
                name: 'change_gizmo_tool',
                description: '切换 Gizmo 工具',
                inputSchema: {
                    type: 'object',
                    properties: {
                        name: {
                            type: 'string',
                            description: '工具名称',
                            enum: ['position', 'rotation', 'scale', 'rect']
                        }
                    },
                    required: ['name']
                }
            },
            {
                name: 'query_gizmo_tool_name',
                description: '获取当前 Gizmo 工具名',
                inputSchema: {
                    type: 'object',
                    properties: {}
                }
            },
            {
                name: 'change_gizmo_pivot',
                description: '切换变换中心点',
                inputSchema: {
                    type: 'object',
                    properties: {
                        name: {
                            type: 'string',
                            description: '中心点',
                            enum: ['pivot', 'center']
                        }
                    },
                    required: ['name']
                }
            },
            {
                name: 'query_gizmo_pivot',
                description: '获取当前 Gizmo 中心点',
                inputSchema: {
                    type: 'object',
                    properties: {}
                }
            },
            {
                name: 'query_gizmo_view_mode',
                description: '查询视图模式（view/select）',
                inputSchema: {
                    type: 'object',
                    properties: {}
                }
            },
            {
                name: 'change_gizmo_coordinate',
                description: '切换坐标系统',
                inputSchema: {
                    type: 'object',
                    properties: {
                        type: {
                            type: 'string',
                            description: '坐标系统',
                            enum: ['local', 'global']
                        }
                    },
                    required: ['type']
                }
            },
            {
                name: 'query_gizmo_coordinate',
                description: '获取当前坐标系统',
                inputSchema: {
                    type: 'object',
                    properties: {}
                }
            },
            {
                name: 'change_view_mode_2d_3d',
                description: '切换 2D/3D 视图模式',
                inputSchema: {
                    type: 'object',
                    properties: {
                        is2D: {
                            type: 'boolean',
                            description: '2D/3D 视图模式（true 为 2D，false 为 3D）'
                        }
                    },
                    required: ['is2D']
                }
            },
            {
                name: 'query_view_mode_2d_3d',
                description: '查询当前视图模式',
                inputSchema: {
                    type: 'object',
                    properties: {}
                }
            },
            {
                name: 'set_grid_visible',
                description: '显示/隐藏网格',
                inputSchema: {
                    type: 'object',
                    properties: {
                        visible: {
                            type: 'boolean',
                            description: '网格可见性'
                        }
                    },
                    required: ['visible']
                }
            },
            {
                name: 'query_grid_visible',
                description: '查询网格可见性',
                inputSchema: {
                    type: 'object',
                    properties: {}
                }
            },
            {
                name: 'set_icon_gizmo_3d',
                description: '设置 IconGizmo 为 3D 或 2D 模式',
                inputSchema: {
                    type: 'object',
                    properties: {
                        is3D: {
                            type: 'boolean',
                            description: '3D/2D IconGizmo（true 为 3D，false 为 2D）'
                        }
                    },
                    required: ['is3D']
                }
            },
            {
                name: 'query_icon_gizmo_3d',
                description: '查询 IconGizmo 模式',
                inputSchema: {
                    type: 'object',
                    properties: {}
                }
            },
            {
                name: 'set_icon_gizmo_size',
                description: '设置 IconGizmo 大小',
                inputSchema: {
                    type: 'object',
                    properties: {
                        size: {
                            type: 'number',
                            description: 'IconGizmo 大小',
                            minimum: 10,
                            maximum: 100
                        }
                    },
                    required: ['size']
                }
            },
            {
                name: 'query_icon_gizmo_size',
                description: '查询 IconGizmo 大小',
                inputSchema: {
                    type: 'object',
                    properties: {}
                }
            },
            {
                name: 'focus_camera_on_nodes',
                description: '聚焦场景相机到节点',
                inputSchema: {
                    type: 'object',
                    properties: {
                        uuids: {
                            oneOf: [
                                { type: 'array', items: { type: 'string' } },
                                { type: 'null' }
                            ],
                            description: '要聚焦的节点 UUID 列表（null 表示全部）'
                        }
                    },
                    required: ['uuids']
                }
            },
            {
                name: 'align_camera_with_view',
                description: '将场景相机位置和角度应用到选中节点',
                inputSchema: {
                    type: 'object',
                    properties: {}
                }
            },
            {
                name: 'align_view_with_node',
                description: '将选中节点位置和角度应用到当前视图',
                inputSchema: {
                    type: 'object',
                    properties: {}
                }
            },
            {
                name: 'get_scene_view_status',
                description: '获取综合场景视图状态',
                inputSchema: {
                    type: 'object',
                    properties: {}
                }
            },
            {
                name: 'reset_scene_view',
                description: '重置场景视图为默认设置',
                inputSchema: {
                    type: 'object',
                    properties: {}
                }
            }
        ];
    }
    async execute(toolName, args) {
        switch (toolName) {
            case 'change_gizmo_tool':
                return await this.changeGizmoTool(args.name);
            case 'query_gizmo_tool_name':
                return await this.queryGizmoToolName();
            case 'change_gizmo_pivot':
                return await this.changeGizmoPivot(args.name);
            case 'query_gizmo_pivot':
                return await this.queryGizmoPivot();
            case 'query_gizmo_view_mode':
                return await this.queryGizmoViewMode();
            case 'change_gizmo_coordinate':
                return await this.changeGizmoCoordinate(args.type);
            case 'query_gizmo_coordinate':
                return await this.queryGizmoCoordinate();
            case 'change_view_mode_2d_3d':
                return await this.changeViewMode2D3D(args.is2D);
            case 'query_view_mode_2d_3d':
                return await this.queryViewMode2D3D();
            case 'set_grid_visible':
                return await this.setGridVisible(args.visible);
            case 'query_grid_visible':
                return await this.queryGridVisible();
            case 'set_icon_gizmo_3d':
                return await this.setIconGizmo3D(args.is3D);
            case 'query_icon_gizmo_3d':
                return await this.queryIconGizmo3D();
            case 'set_icon_gizmo_size':
                return await this.setIconGizmoSize(args.size);
            case 'query_icon_gizmo_size':
                return await this.queryIconGizmoSize();
            case 'focus_camera_on_nodes':
                return await this.focusCameraOnNodes(args.uuids);
            case 'align_camera_with_view':
                return await this.alignCameraWithView();
            case 'align_view_with_node':
                return await this.alignViewWithNode();
            case 'get_scene_view_status':
                return await this.getSceneViewStatus();
            case 'reset_scene_view':
                return await this.resetSceneView();
            default:
                throw new Error(`Unknown tool: ${toolName}`);
        }
    }
    async changeGizmoTool(name) {
        return new Promise((resolve) => {
            Editor.Message.request('scene', 'change-gizmo-tool', name).then(() => {
                resolve({
                    success: true,
                    message: `Gizmo tool changed to '${name}'`
                });
            }).catch((err) => {
                resolve({ success: false, error: err.message });
            });
        });
    }
    async queryGizmoToolName() {
        return new Promise((resolve) => {
            Editor.Message.request('scene', 'query-gizmo-tool-name').then((toolName) => {
                resolve({
                    success: true,
                    data: {
                        currentTool: toolName,
                        message: `Current Gizmo tool: ${toolName}`
                    }
                });
            }).catch((err) => {
                resolve({ success: false, error: err.message });
            });
        });
    }
    async changeGizmoPivot(name) {
        return new Promise((resolve) => {
            Editor.Message.request('scene', 'change-gizmo-pivot', name).then(() => {
                resolve({
                    success: true,
                    message: `Gizmo pivot changed to '${name}'`
                });
            }).catch((err) => {
                resolve({ success: false, error: err.message });
            });
        });
    }
    async queryGizmoPivot() {
        return new Promise((resolve) => {
            Editor.Message.request('scene', 'query-gizmo-pivot').then((pivotName) => {
                resolve({
                    success: true,
                    data: {
                        currentPivot: pivotName,
                        message: `Current Gizmo pivot: ${pivotName}`
                    }
                });
            }).catch((err) => {
                resolve({ success: false, error: err.message });
            });
        });
    }
    async queryGizmoViewMode() {
        return new Promise((resolve) => {
            Editor.Message.request('scene', 'query-gizmo-view-mode').then((viewMode) => {
                resolve({
                    success: true,
                    data: {
                        viewMode: viewMode,
                        message: `Current view mode: ${viewMode}`
                    }
                });
            }).catch((err) => {
                resolve({ success: false, error: err.message });
            });
        });
    }
    async changeGizmoCoordinate(type) {
        return new Promise((resolve) => {
            Editor.Message.request('scene', 'change-gizmo-coordinate', type).then(() => {
                resolve({
                    success: true,
                    message: `Coordinate system changed to '${type}'`
                });
            }).catch((err) => {
                resolve({ success: false, error: err.message });
            });
        });
    }
    async queryGizmoCoordinate() {
        return new Promise((resolve) => {
            Editor.Message.request('scene', 'query-gizmo-coordinate').then((coordinate) => {
                resolve({
                    success: true,
                    data: {
                        coordinate: coordinate,
                        message: `Current coordinate system: ${coordinate}`
                    }
                });
            }).catch((err) => {
                resolve({ success: false, error: err.message });
            });
        });
    }
    async changeViewMode2D3D(is2D) {
        return new Promise((resolve) => {
            Editor.Message.request('scene', 'change-is2D', is2D).then(() => {
                resolve({
                    success: true,
                    message: `View mode changed to ${is2D ? '2D' : '3D'}`
                });
            }).catch((err) => {
                resolve({ success: false, error: err.message });
            });
        });
    }
    async queryViewMode2D3D() {
        return new Promise((resolve) => {
            Editor.Message.request('scene', 'query-is2D').then((is2D) => {
                resolve({
                    success: true,
                    data: {
                        is2D: is2D,
                        viewMode: is2D ? '2D' : '3D',
                        message: `Current view mode: ${is2D ? '2D' : '3D'}`
                    }
                });
            }).catch((err) => {
                resolve({ success: false, error: err.message });
            });
        });
    }
    async setGridVisible(visible) {
        return new Promise((resolve) => {
            Editor.Message.request('scene', 'set-grid-visible', visible).then(() => {
                resolve({
                    success: true,
                    message: `Grid ${visible ? 'shown' : 'hidden'}`
                });
            }).catch((err) => {
                resolve({ success: false, error: err.message });
            });
        });
    }
    async queryGridVisible() {
        return new Promise((resolve) => {
            Editor.Message.request('scene', 'query-is-grid-visible').then((visible) => {
                resolve({
                    success: true,
                    data: {
                        visible: visible,
                        message: `Grid is ${visible ? 'visible' : 'hidden'}`
                    }
                });
            }).catch((err) => {
                resolve({ success: false, error: err.message });
            });
        });
    }
    async setIconGizmo3D(is3D) {
        return new Promise((resolve) => {
            Editor.Message.request('scene', 'set-icon-gizmo-3d', is3D).then(() => {
                resolve({
                    success: true,
                    message: `IconGizmo set to ${is3D ? '3D' : '2D'} mode`
                });
            }).catch((err) => {
                resolve({ success: false, error: err.message });
            });
        });
    }
    async queryIconGizmo3D() {
        return new Promise((resolve) => {
            Editor.Message.request('scene', 'query-is-icon-gizmo-3d').then((is3D) => {
                resolve({
                    success: true,
                    data: {
                        is3D: is3D,
                        mode: is3D ? '3D' : '2D',
                        message: `IconGizmo is in ${is3D ? '3D' : '2D'} mode`
                    }
                });
            }).catch((err) => {
                resolve({ success: false, error: err.message });
            });
        });
    }
    async setIconGizmoSize(size) {
        return new Promise((resolve) => {
            Editor.Message.request('scene', 'set-icon-gizmo-size', size).then(() => {
                resolve({
                    success: true,
                    message: `IconGizmo size set to ${size}`
                });
            }).catch((err) => {
                resolve({ success: false, error: err.message });
            });
        });
    }
    async queryIconGizmoSize() {
        return new Promise((resolve) => {
            Editor.Message.request('scene', 'query-icon-gizmo-size').then((size) => {
                resolve({
                    success: true,
                    data: {
                        size: size,
                        message: `IconGizmo size: ${size}`
                    }
                });
            }).catch((err) => {
                resolve({ success: false, error: err.message });
            });
        });
    }
    async focusCameraOnNodes(uuids) {
        return new Promise((resolve) => {
            Editor.Message.request('scene', 'focus-camera', uuids || []).then(() => {
                const message = uuids === null ?
                    'Camera focused on all nodes' :
                    `Camera focused on ${uuids.length} node(s)`;
                resolve({
                    success: true,
                    message: message
                });
            }).catch((err) => {
                resolve({ success: false, error: err.message });
            });
        });
    }
    async alignCameraWithView() {
        return new Promise((resolve) => {
            Editor.Message.request('scene', 'align-with-view').then(() => {
                resolve({
                    success: true,
                    message: 'Scene camera aligned with current view'
                });
            }).catch((err) => {
                resolve({ success: false, error: err.message });
            });
        });
    }
    async alignViewWithNode() {
        return new Promise((resolve) => {
            Editor.Message.request('scene', 'align-with-view-node').then(() => {
                resolve({
                    success: true,
                    message: 'View aligned with selected node'
                });
            }).catch((err) => {
                resolve({ success: false, error: err.message });
            });
        });
    }
    async getSceneViewStatus() {
        return new Promise(async (resolve) => {
            try {
                // Gather all view status information
                const [gizmoTool, gizmoPivot, gizmoCoordinate, viewMode2D3D, gridVisible, iconGizmo3D, iconGizmoSize] = await Promise.allSettled([
                    this.queryGizmoToolName(),
                    this.queryGizmoPivot(),
                    this.queryGizmoCoordinate(),
                    this.queryViewMode2D3D(),
                    this.queryGridVisible(),
                    this.queryIconGizmo3D(),
                    this.queryIconGizmoSize()
                ]);
                const status = {
                    timestamp: new Date().toISOString()
                };
                // Extract data from fulfilled promises
                if (gizmoTool.status === 'fulfilled' && gizmoTool.value.success) {
                    status.gizmoTool = gizmoTool.value.data.currentTool;
                }
                if (gizmoPivot.status === 'fulfilled' && gizmoPivot.value.success) {
                    status.gizmoPivot = gizmoPivot.value.data.currentPivot;
                }
                if (gizmoCoordinate.status === 'fulfilled' && gizmoCoordinate.value.success) {
                    status.coordinate = gizmoCoordinate.value.data.coordinate;
                }
                if (viewMode2D3D.status === 'fulfilled' && viewMode2D3D.value.success) {
                    status.is2D = viewMode2D3D.value.data.is2D;
                    status.viewMode = viewMode2D3D.value.data.viewMode;
                }
                if (gridVisible.status === 'fulfilled' && gridVisible.value.success) {
                    status.gridVisible = gridVisible.value.data.visible;
                }
                if (iconGizmo3D.status === 'fulfilled' && iconGizmo3D.value.success) {
                    status.iconGizmo3D = iconGizmo3D.value.data.is3D;
                }
                if (iconGizmoSize.status === 'fulfilled' && iconGizmoSize.value.success) {
                    status.iconGizmoSize = iconGizmoSize.value.data.size;
                }
                resolve({
                    success: true,
                    data: status
                });
            }
            catch (err) {
                resolve({
                    success: false,
                    error: `Failed to get scene view status: ${err.message}`
                });
            }
        });
    }
    async resetSceneView() {
        return new Promise(async (resolve) => {
            try {
                // Reset scene view to default settings
                const resetActions = [
                    this.changeGizmoTool('position'),
                    this.changeGizmoPivot('pivot'),
                    this.changeGizmoCoordinate('local'),
                    this.changeViewMode2D3D(false), // 3D mode
                    this.setGridVisible(true),
                    this.setIconGizmo3D(true),
                    this.setIconGizmoSize(60)
                ];
                await Promise.all(resetActions);
                resolve({
                    success: true,
                    message: 'Scene view reset to default settings'
                });
            }
            catch (err) {
                resolve({
                    success: false,
                    error: `Failed to reset scene view: ${err.message}`
                });
            }
        });
    }
}
exports.SceneViewTools = SceneViewTools;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidG9vbHMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zb3VyY2UvY2FwYWJpbGl0aWVzL3NjZW5lLXZpZXcvdG9vbHMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBRUEsTUFBYSxjQUFjO0lBQ3ZCLFFBQVE7UUFDSixPQUFPO1lBQ0g7Z0JBQ0ksSUFBSSxFQUFFLG1CQUFtQjtnQkFDekIsV0FBVyxFQUFFLGFBQWE7Z0JBQzFCLFdBQVcsRUFBRTtvQkFDVCxJQUFJLEVBQUUsUUFBUTtvQkFDZCxVQUFVLEVBQUU7d0JBQ1IsSUFBSSxFQUFFOzRCQUNGLElBQUksRUFBRSxRQUFROzRCQUNkLFdBQVcsRUFBRSxNQUFNOzRCQUNuQixJQUFJLEVBQUUsQ0FBQyxVQUFVLEVBQUUsVUFBVSxFQUFFLE9BQU8sRUFBRSxNQUFNLENBQUM7eUJBQ2xEO3FCQUNKO29CQUNELFFBQVEsRUFBRSxDQUFDLE1BQU0sQ0FBQztpQkFDckI7YUFDSjtZQUNEO2dCQUNJLElBQUksRUFBRSx1QkFBdUI7Z0JBQzdCLFdBQVcsRUFBRSxnQkFBZ0I7Z0JBQzdCLFdBQVcsRUFBRTtvQkFDVCxJQUFJLEVBQUUsUUFBUTtvQkFDZCxVQUFVLEVBQUUsRUFBRTtpQkFDakI7YUFDSjtZQUNEO2dCQUNJLElBQUksRUFBRSxvQkFBb0I7Z0JBQzFCLFdBQVcsRUFBRSxTQUFTO2dCQUN0QixXQUFXLEVBQUU7b0JBQ1QsSUFBSSxFQUFFLFFBQVE7b0JBQ2QsVUFBVSxFQUFFO3dCQUNSLElBQUksRUFBRTs0QkFDRixJQUFJLEVBQUUsUUFBUTs0QkFDZCxXQUFXLEVBQUUsS0FBSzs0QkFDbEIsSUFBSSxFQUFFLENBQUMsT0FBTyxFQUFFLFFBQVEsQ0FBQzt5QkFDNUI7cUJBQ0o7b0JBQ0QsUUFBUSxFQUFFLENBQUMsTUFBTSxDQUFDO2lCQUNyQjthQUNKO1lBQ0Q7Z0JBQ0ksSUFBSSxFQUFFLG1CQUFtQjtnQkFDekIsV0FBVyxFQUFFLGdCQUFnQjtnQkFDN0IsV0FBVyxF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QzVCLENBQUM7Z0JBRUYsTUFBTSxPQUFPLENBQUMsR0FBRyxDQUFDLFlBQVksQ0FBQyxDQUFDO2dCQUVoQyxPQUFPLENBQUM7b0JBQ0osT0FBTyxFQUFFLElBQUk7b0JBQ2IsT0FBTyxFQUFFLHNDQUFzQztpQkFDbEQsQ0FBQyxDQUFDO1lBRVAsQ0FBQztZQUFDLE9BQU8sR0FBUSxFQUFFLENBQUM7Z0JBQ2hCLE9BQU8sQ0FBQztvQkFDSixPQUFPLEVBQUUsS0FBSztvQkFDZCxLQUFLLEVBQUUsK0JBQStCLEdBQUcsQ0FBQyxPQUFPLEVBQUU7aUJBQ3RELENBQUMsQ0FBQztZQUNQLENBQUM7UUFDTCxDQUFDLENBQUMsQ0FBQztJQUNQLENBQUM7Q0FDSjtBQWpuQkQsd0NBaW5CQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IFRvb2xEZWZpbml0aW9uLCBUb29sUmVzcG9uc2UsIFRvb2xFeGVjdXRvciB9IGZyb20gJy4uLy4uL3R5cGVzJztcblxuZXhwb3J0IGNsYXNzIFNjZW5lVmlld1Rvb2xzIGltcGxlbWVudHMgVG9vbEV4ZWN1dG9yIHtcbiAgICBnZXRUb29scygpOiBUb29sRGVmaW5pdGlvbltdIHtcbiAgICAgICAgcmV0dXJuIFtcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBuYW1lOiAnY2hhbmdlX2dpem1vX3Rvb2wnLFxuICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiAn5YiH5o2iIEdpem1vIOW3peWFtycsXG4gICAgICAgICAgICAgICAgaW5wdXRTY2hlbWE6IHtcbiAgICAgICAgICAgICAgICAgICAgdHlwZTogJ29iamVjdCcsXG4gICAgICAgICAgICAgICAgICAgIHByb3BlcnRpZXM6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG5hbWU6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiAnc3RyaW5nJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogJ+W3peWFt+WQjeensCcsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZW51bTogWydwb3NpdGlvbicsICdyb3RhdGlvbicsICdzY2FsZScsICdyZWN0J11cbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgcmVxdWlyZWQ6IFsnbmFtZSddXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBuYW1lOiAncXVlcnlfZ2l6bW9fdG9vbF9uYW1lJyxcbiAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogJ+iOt+WPluW9k+WJjSBHaXptbyDlt6XlhbflkI0nLFxuICAgICAgICAgICAgICAgIGlucHV0U2NoZW1hOiB7XG4gICAgICAgICAgICAgICAgICAgIHR5cGU6ICdvYmplY3QnLFxuICAgICAgICAgICAgICAgICAgICBwcm9wZXJ0aWVzOiB7fVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgbmFtZTogJ2NoYW5nZV9naXptb19waXZvdCcsXG4gICAgICAgICAgICAgICAgZGVzY3JpcHRpb246ICfliIfmjaLlj5jmjaLkuK3lv4PngrknLFxuICAgICAgICAgICAgICAgIGlucHV0U2NoZW1hOiB7XG4gICAgICAgICAgICAgICAgICAgIHR5cGU6ICdvYmplY3QnLFxuICAgICAgICAgICAgICAgICAgICBwcm9wZXJ0aWVzOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBuYW1lOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogJ3N0cmluZycsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVzY3JpcHRpb246ICfkuK3lv4PngrknLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVudW06IFsncGl2b3QnLCAnY2VudGVyJ11cbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgcmVxdWlyZWQ6IFsnbmFtZSddXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBuYW1lOiAncXVlcnlfZ2l6bW9fcGl2b3QnLFxuICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiAn6I635Y+W5b2T5YmNIEdpem1vIOS4reW/g+eCuScsXG4gICAgICAgICAgICAgICAgaW5wdXRTY2hlbWE6IHtcbiAgICAgICAgICAgICAgICAgICAgdHlwZTogJ29iamVjdCcsXG4gICAgICAgICAgICAgICAgICAgIHByb3BlcnRpZXM6IHt9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBuYW1lOiAncXVlcnlfZ2l6bW9fdmlld19tb2RlJyxcbiAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogJ+afpeivouinhuWbvuaooeW8j++8iHZpZXcvc2VsZWN077yJJyxcbiAgICAgICAgICAgICAgICBpbnB1dFNjaGVtYToge1xuICAgICAgICAgICAgICAgICAgICB0eXBlOiAnb2JqZWN0JyxcbiAgICAgICAgICAgICAgICAgICAgcHJvcGVydGllczoge31cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIG5hbWU6ICdjaGFuZ2VfZ2l6bW9fY29vcmRpbmF0ZScsXG4gICAgICAgICAgICAgICAgZGVzY3JpcHRpb246ICfliIfmjaLlnZDmoIfns7vnu58nLFxuICAgICAgICAgICAgICAgIGlucHV0U2NoZW1hOiB7XG4gICAgICAgICAgICAgICAgICAgIHR5cGU6ICdvYmplY3QnLFxuICAgICAgICAgICAgICAgICAgICBwcm9wZXJ0aWVzOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogJ3N0cmluZycsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVzY3JpcHRpb246ICflnZDmoIfns7vnu58nLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVudW06IFsnbG9jYWwnLCAnZ2xvYmFsJ11cbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgcmVxdWlyZWQ6IFsndHlwZSddXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBuYW1lOiAncXVlcnlfZ2l6bW9fY29vcmRpbmF0ZScsXG4gICAgICAgICAgICAgICAgZGVzY3JpcHRpb246ICfojrflj5blvZPliY3lnZDmoIfns7vnu58nLFxuICAgICAgICAgICAgICAgIGlucHV0U2NoZW1hOiB7XG4gICAgICAgICAgICAgICAgICAgIHR5cGU6ICdvYmplY3QnLFxuICAgICAgICAgICAgICAgICAgICBwcm9wZXJ0aWVzOiB7fVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgbmFtZTogJ2NoYW5nZV92aWV3X21vZGVfMmRfM2QnLFxuICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiAn5YiH5o2iIDJELzNEIOinhuWbvuaooeW8jycsXG4gICAgICAgICAgICAgICAgaW5wdXRTY2hlbWE6IHtcbiAgICAgICAgICAgICAgICAgICAgdHlwZTogJ29iamVjdCcsXG4gICAgICAgICAgICAgICAgICAgIHByb3BlcnRpZXM6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlzMkQ6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiAnYm9vbGVhbicsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVzY3JpcHRpb246ICcyRC8zRCDop4blm77mqKHlvI/vvIh0cnVlIOS4uiAyRO+8jGZhbHNlIOS4uiAzRO+8iSdcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgcmVxdWlyZWQ6IFsnaXMyRCddXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBuYW1lOiAncXVlcnlfdmlld19tb2RlXzJkXzNkJyxcbiAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogJ+afpeivouW9k+WJjeinhuWbvuaooeW8jycsXG4gICAgICAgICAgICAgICAgaW5wdXRTY2hlbWE6IHtcbiAgICAgICAgICAgICAgICAgICAgdHlwZTogJ29iamVjdCcsXG4gICAgICAgICAgICAgICAgICAgIHByb3BlcnRpZXM6IHt9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBuYW1lOiAnc2V0X2dyaWRfdmlzaWJsZScsXG4gICAgICAgICAgICAgICAgZGVzY3JpcHRpb246ICfmmL7npLov6ZqQ6JeP572R5qC8JyxcbiAgICAgICAgICAgICAgICBpbnB1dFNjaGVtYToge1xuICAgICAgICAgICAgICAgICAgICB0eXBlOiAnb2JqZWN0JyxcbiAgICAgICAgICAgICAgICAgICAgcHJvcGVydGllczoge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmlzaWJsZToge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6ICdib29sZWFuJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogJ+e9keagvOWPr+ingeaApydcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgcmVxdWlyZWQ6IFsndmlzaWJsZSddXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBuYW1lOiAncXVlcnlfZ3JpZF92aXNpYmxlJyxcbiAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogJ+afpeivoue9keagvOWPr+ingeaApycsXG4gICAgICAgICAgICAgICAgaW5wdXRTY2hlbWE6IHtcbiAgICAgICAgICAgICAgICAgICAgdHlwZTogJ29iamVjdCcsXG4gICAgICAgICAgICAgICAgICAgIHByb3BlcnRpZXM6IHt9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBuYW1lOiAnc2V0X2ljb25fZ2l6bW9fM2QnLFxuICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiAn6K6+572uIEljb25HaXptbyDkuLogM0Qg5oiWIDJEIOaooeW8jycsXG4gICAgICAgICAgICAgICAgaW5wdXRTY2hlbWE6IHtcbiAgICAgICAgICAgICAgICAgICAgdHlwZTogJ29iamVjdCcsXG4gICAgICAgICAgICAgICAgICAgIHByb3BlcnRpZXM6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlzM0Q6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiAnYm9vbGVhbicsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVzY3JpcHRpb246ICczRC8yRCBJY29uR2l6bW/vvIh0cnVlIOS4uiAzRO+8jGZhbHNlIOS4uiAyRO+8iSdcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgcmVxdWlyZWQ6IFsnaXMzRCddXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBuYW1lOiAncXVlcnlfaWNvbl9naXptb18zZCcsXG4gICAgICAgICAgICAgICAgZGVzY3JpcHRpb246ICfmn6Xor6IgSWNvbkdpem1vIOaooeW8jycsXG4gICAgICAgICAgICAgICAgaW5wdXRTY2hlbWE6IHtcbiAgICAgICAgICAgICAgICAgICAgdHlwZTogJ29iamVjdCcsXG4gICAgICAgICAgICAgICAgICAgIHByb3BlcnRpZXM6IHt9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBuYW1lOiAnc2V0X2ljb25fZ2l6bW9fc2l6ZScsXG4gICAgICAgICAgICAgICAgZGVzY3JpcHRpb246ICforr7nva4gSWNvbkdpem1vIOWkp+WwjycsXG4gICAgICAgICAgICAgICAgaW5wdXRTY2hlbWE6IHtcbiAgICAgICAgICAgICAgICAgICAgdHlwZTogJ29iamVjdCcsXG4gICAgICAgICAgICAgICAgICAgIHByb3BlcnRpZXM6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHNpemU6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiAnbnVtYmVyJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogJ0ljb25HaXptbyDlpKflsI8nLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1pbmltdW06IDEwLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1heGltdW06IDEwMFxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICByZXF1aXJlZDogWydzaXplJ11cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIG5hbWU6ICdxdWVyeV9pY29uX2dpem1vX3NpemUnLFxuICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiAn5p+l6K+iIEljb25HaXptbyDlpKflsI8nLFxuICAgICAgICAgICAgICAgIGlucHV0U2NoZW1hOiB7XG4gICAgICAgICAgICAgICAgICAgIHR5cGU6ICdvYmplY3QnLFxuICAgICAgICAgICAgICAgICAgICBwcm9wZXJ0aWVzOiB7fVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgbmFtZTogJ2ZvY3VzX2NhbWVyYV9vbl9ub2RlcycsXG4gICAgICAgICAgICAgICAgZGVzY3JpcHRpb246ICfogZrnhKblnLrmma/nm7jmnLrliLDoioLngrknLFxuICAgICAgICAgICAgICAgIGlucHV0U2NoZW1hOiB7XG4gICAgICAgICAgICAgICAgICAgIHR5cGU6ICdvYmplY3QnLFxuICAgICAgICAgICAgICAgICAgICBwcm9wZXJ0aWVzOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICB1dWlkczoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9uZU9mOiBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHsgdHlwZTogJ2FycmF5JywgaXRlbXM6IHsgdHlwZTogJ3N0cmluZycgfSB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7IHR5cGU6ICdudWxsJyB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogJ+imgeiBmueEpueahOiKgueCuSBVVUlEIOWIl+ihqO+8iG51bGwg6KGo56S65YWo6YOo77yJJ1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICByZXF1aXJlZDogWyd1dWlkcyddXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBuYW1lOiAnYWxpZ25fY2FtZXJhX3dpdGhfdmlldycsXG4gICAgICAgICAgICAgICAgZGVzY3JpcHRpb246ICflsIblnLrmma/nm7jmnLrkvY3nva7lkozop5LluqblupTnlKjliLDpgInkuK3oioLngrknLFxuICAgICAgICAgICAgICAgIGlucHV0U2NoZW1hOiB7XG4gICAgICAgICAgICAgICAgICAgIHR5cGU6ICdvYmplY3QnLFxuICAgICAgICAgICAgICAgICAgICBwcm9wZXJ0aWVzOiB7fVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgbmFtZTogJ2FsaWduX3ZpZXdfd2l0aF9ub2RlJyxcbiAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogJ+WwhumAieS4reiKgueCueS9jee9ruWSjOinkuW6puW6lOeUqOWIsOW9k+WJjeinhuWbvicsXG4gICAgICAgICAgICAgICAgaW5wdXRTY2hlbWE6IHtcbiAgICAgICAgICAgICAgICAgICAgdHlwZTogJ29iamVjdCcsXG4gICAgICAgICAgICAgICAgICAgIHByb3BlcnRpZXM6IHt9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBuYW1lOiAnZ2V0X3NjZW5lX3ZpZXdfc3RhdHVzJyxcbiAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogJ+iOt+WPlue7vOWQiOWcuuaZr+inhuWbvueKtuaAgScsXG4gICAgICAgICAgICAgICAgaW5wdXRTY2hlbWE6IHtcbiAgICAgICAgICAgICAgICAgICAgdHlwZTogJ29iamVjdCcsXG4gICAgICAgICAgICAgICAgICAgIHByb3BlcnRpZXM6IHt9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBuYW1lOiAncmVzZXRfc2NlbmVfdmlldycsXG4gICAgICAgICAgICAgICAgZGVzY3JpcHRpb246ICfph43nva7lnLrmma/op4blm77kuLrpu5jorqTorr7nva4nLFxuICAgICAgICAgICAgICAgIGlucHV0U2NoZW1hOiB7XG4gICAgICAgICAgICAgICAgICAgIHR5cGU6ICdvYmplY3QnLFxuICAgICAgICAgICAgICAgICAgICBwcm9wZXJ0aWVzOiB7fVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgXTtcbiAgICB9XG5cbiAgICBhc3luYyBleGVjdXRlKHRvb2xOYW1lOiBzdHJpbmcsIGFyZ3M6IGFueSk6IFByb21pc2U8VG9vbFJlc3BvbnNlPiB7XG4gICAgICAgIHN3aXRjaCAodG9vbE5hbWUpIHtcbiAgICAgICAgICAgIGNhc2UgJ2NoYW5nZV9naXptb190b29sJzpcbiAgICAgICAgICAgICAgICByZXR1cm4gYXdhaXQgdGhpcy5jaGFuZ2VHaXptb1Rvb2woYXJncy5uYW1lKTtcbiAgICAgICAgICAgIGNhc2UgJ3F1ZXJ5X2dpem1vX3Rvb2xfbmFtZSc6XG4gICAgICAgICAgICAgICAgcmV0dXJuIGF3YWl0IHRoaXMucXVlcnlHaXptb1Rvb2xOYW1lKCk7XG4gICAgICAgICAgICBjYXNlICdjaGFuZ2VfZ2l6bW9fcGl2b3QnOlxuICAgICAgICAgICAgICAgIHJldHVybiBhd2FpdCB0aGlzLmNoYW5nZUdpem1vUGl2b3QoYXJncy5uYW1lKTtcbiAgICAgICAgICAgIGNhc2UgJ3F1ZXJ5X2dpem1vX3Bpdm90JzpcbiAgICAgICAgICAgICAgICByZXR1cm4gYXdhaXQgdGhpcy5xdWVyeUdpem1vUGl2b3QoKTtcbiAgICAgICAgICAgIGNhc2UgJ3F1ZXJ5X2dpem1vX3ZpZXdfbW9kZSc6XG4gICAgICAgICAgICAgICAgcmV0dXJuIGF3YWl0IHRoaXMucXVlcnlHaXptb1ZpZXdNb2RlKCk7XG4gICAgICAgICAgICBjYXNlICdjaGFuZ2VfZ2l6bW9fY29vcmRpbmF0ZSc6XG4gICAgICAgICAgICAgICAgcmV0dXJuIGF3YWl0IHRoaXMuY2hhbmdlR2l6bW9Db29yZGluYXRlKGFyZ3MudHlwZSk7XG4gICAgICAgICAgICBjYXNlICdxdWVyeV9naXptb19jb29yZGluYXRlJzpcbiAgICAgICAgICAgICAgICByZXR1cm4gYXdhaXQgdGhpcy5xdWVyeUdpem1vQ29vcmRpbmF0ZSgpO1xuICAgICAgICAgICAgY2FzZSAnY2hhbmdlX3ZpZXdfbW9kZV8yZF8zZCc6XG4gICAgICAgICAgICAgICAgcmV0dXJuIGF3YWl0IHRoaXMuY2hhbmdlVmlld01vZGUyRDNEKGFyZ3MuaXMyRCk7XG4gICAgICAgICAgICBjYXNlICdxdWVyeV92aWV3X21vZGVfMmRfM2QnOlxuICAgICAgICAgICAgICAgIHJldHVybiBhd2FpdCB0aGlzLnF1ZXJ5Vmlld01vZGUyRDNEKCk7XG4gICAgICAgICAgICBjYXNlICdzZXRfZ3JpZF92aXNpYmxlJzpcbiAgICAgICAgICAgICAgICByZXR1cm4gYXdhaXQgdGhpcy5zZXRHcmlkVmlzaWJsZShhcmdzLnZpc2libGUpO1xuICAgICAgICAgICAgY2FzZSAncXVlcnlfZ3JpZF92aXNpYmxlJzpcbiAgICAgICAgICAgICAgICByZXR1cm4gYXdhaXQgdGhpcy5xdWVyeUdyaWRWaXNpYmxlKCk7XG4gICAgICAgICAgICBjYXNlICdzZXRfaWNvbl9naXptb18zZCc6XG4gICAgICAgICAgICAgICAgcmV0dXJuIGF3YWl0IHRoaXMuc2V0SWNvbkdpem1vM0QoYXJncy5pczNEKTtcbiAgICAgICAgICAgIGNhc2UgJ3F1ZXJ5X2ljb25fZ2l6bW9fM2QnOlxuICAgICAgICAgICAgICAgIHJldHVybiBhd2FpdCB0aGlzLnF1ZXJ5SWNvbkdpem1vM0QoKTtcbiAgICAgICAgICAgIGNhc2UgJ3NldF9pY29uX2dpem1vX3NpemUnOlxuICAgICAgICAgICAgICAgIHJldHVybiBhd2FpdCB0aGlzLnNldEljb25HaXptb1NpemUoYXJncy5zaXplKTtcbiAgICAgICAgICAgIGNhc2UgJ3F1ZXJ5X2ljb25fZ2l6bW9fc2l6ZSc6XG4gICAgICAgICAgICAgICAgcmV0dXJuIGF3YWl0IHRoaXMucXVlcnlJY29uR2l6bW9TaXplKCk7XG4gICAgICAgICAgICBjYXNlICdmb2N1c19jYW1lcmFfb25fbm9kZXMnOlxuICAgICAgICAgICAgICAgIHJldHVybiBhd2FpdCB0aGlzLmZvY3VzQ2FtZXJhT25Ob2RlcyhhcmdzLnV1aWRzKTtcbiAgICAgICAgICAgIGNhc2UgJ2FsaWduX2NhbWVyYV93aXRoX3ZpZXcnOlxuICAgICAgICAgICAgICAgIHJldHVybiBhd2FpdCB0aGlzLmFsaWduQ2FtZXJhV2l0aFZpZXcoKTtcbiAgICAgICAgICAgIGNhc2UgJ2FsaWduX3ZpZXdfd2l0aF9ub2RlJzpcbiAgICAgICAgICAgICAgICByZXR1cm4gYXdhaXQgdGhpcy5hbGlnblZpZXdXaXRoTm9kZSgpO1xuICAgICAgICAgICAgY2FzZSAnZ2V0X3NjZW5lX3ZpZXdfc3RhdHVzJzpcbiAgICAgICAgICAgICAgICByZXR1cm4gYXdhaXQgdGhpcy5nZXRTY2VuZVZpZXdTdGF0dXMoKTtcbiAgICAgICAgICAgIGNhc2UgJ3Jlc2V0X3NjZW5lX3ZpZXcnOlxuICAgICAgICAgICAgICAgIHJldHVybiBhd2FpdCB0aGlzLnJlc2V0U2NlbmVWaWV3KCk7XG4gICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgVW5rbm93biB0b29sOiAke3Rvb2xOYW1lfWApO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBhc3luYyBjaGFuZ2VHaXptb1Rvb2wobmFtZTogc3RyaW5nKTogUHJvbWlzZTxUb29sUmVzcG9uc2U+IHtcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiB7XG4gICAgICAgICAgICBFZGl0b3IuTWVzc2FnZS5yZXF1ZXN0KCdzY2VuZScsICdjaGFuZ2UtZ2l6bW8tdG9vbCcsIG5hbWUpLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgICAgIHJlc29sdmUoe1xuICAgICAgICAgICAgICAgICAgICBzdWNjZXNzOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICBtZXNzYWdlOiBgR2l6bW8gdG9vbCBjaGFuZ2VkIHRvICcke25hbWV9J2BcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0pLmNhdGNoKChlcnI6IEVycm9yKSA9PiB7XG4gICAgICAgICAgICAgICAgcmVzb2x2ZSh7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogZXJyLm1lc3NhZ2UgfSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBhc3luYyBxdWVyeUdpem1vVG9vbE5hbWUoKTogUHJvbWlzZTxUb29sUmVzcG9uc2U+IHtcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiB7XG4gICAgICAgICAgICBFZGl0b3IuTWVzc2FnZS5yZXF1ZXN0KCdzY2VuZScsICdxdWVyeS1naXptby10b29sLW5hbWUnKS50aGVuKCh0b29sTmFtZTogc3RyaW5nKSA9PiB7XG4gICAgICAgICAgICAgICAgcmVzb2x2ZSh7XG4gICAgICAgICAgICAgICAgICAgIHN1Y2Nlc3M6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgIGRhdGE6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGN1cnJlbnRUb29sOiB0b29sTmFtZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG1lc3NhZ2U6IGBDdXJyZW50IEdpem1vIHRvb2w6ICR7dG9vbE5hbWV9YFxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9KS5jYXRjaCgoZXJyOiBFcnJvcikgPT4ge1xuICAgICAgICAgICAgICAgIHJlc29sdmUoeyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6IGVyci5tZXNzYWdlIH0pO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHByaXZhdGUgYXN5bmMgY2hhbmdlR2l6bW9QaXZvdChuYW1lOiBzdHJpbmcpOiBQcm9taXNlPFRvb2xSZXNwb25zZT4ge1xuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHtcbiAgICAgICAgICAgIEVkaXRvci5NZXNzYWdlLnJlcXVlc3QoJ3NjZW5lJywgJ2NoYW5nZS1naXptby1waXZvdCcsIG5hbWUpLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgICAgIHJlc29sdmUoe1xuICAgICAgICAgICAgICAgICAgICBzdWNjZXNzOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICBtZXNzYWdlOiBgR2l6bW8gcGl2b3QgY2hhbmdlZCB0byAnJHtuYW1lfSdgXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9KS5jYXRjaCgoZXJyOiBFcnJvcikgPT4ge1xuICAgICAgICAgICAgICAgIHJlc29sdmUoeyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6IGVyci5tZXNzYWdlIH0pO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHByaXZhdGUgYXN5bmMgcXVlcnlHaXptb1Bpdm90KCk6IFByb21pc2U8VG9vbFJlc3BvbnNlPiB7XG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSkgPT4ge1xuICAgICAgICAgICAgRWRpdG9yLk1lc3NhZ2UucmVxdWVzdCgnc2NlbmUnLCAncXVlcnktZ2l6bW8tcGl2b3QnKS50aGVuKChwaXZvdE5hbWU6IHN0cmluZykgPT4ge1xuICAgICAgICAgICAgICAgIHJlc29sdmUoe1xuICAgICAgICAgICAgICAgICAgICBzdWNjZXNzOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICBkYXRhOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjdXJyZW50UGl2b3Q6IHBpdm90TmFtZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG1lc3NhZ2U6IGBDdXJyZW50IEdpem1vIHBpdm90OiAke3Bpdm90TmFtZX1gXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0pLmNhdGNoKChlcnI6IEVycm9yKSA9PiB7XG4gICAgICAgICAgICAgICAgcmVzb2x2ZSh7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogZXJyLm1lc3NhZ2UgfSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBhc3luYyBxdWVyeUdpem1vVmlld01vZGUoKTogUHJvbWlzZTxUb29sUmVzcG9uc2U+IHtcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiB7XG4gICAgICAgICAgICBFZGl0b3IuTWVzc2FnZS5yZXF1ZXN0KCdzY2VuZScsICdxdWVyeS1naXptby12aWV3LW1vZGUnKS50aGVuKCh2aWV3TW9kZTogc3RyaW5nKSA9PiB7XG4gICAgICAgICAgICAgICAgcmVzb2x2ZSh7XG4gICAgICAgICAgICAgICAgICAgIHN1Y2Nlc3M6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgIGRhdGE6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZpZXdNb2RlOiB2aWV3TW9kZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG1lc3NhZ2U6IGBDdXJyZW50IHZpZXcgbW9kZTogJHt2aWV3TW9kZX1gXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0pLmNhdGNoKChlcnI6IEVycm9yKSA9PiB7XG4gICAgICAgICAgICAgICAgcmVzb2x2ZSh7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogZXJyLm1lc3NhZ2UgfSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBhc3luYyBjaGFuZ2VHaXptb0Nvb3JkaW5hdGUodHlwZTogc3RyaW5nKTogUHJvbWlzZTxUb29sUmVzcG9uc2U+IHtcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiB7XG4gICAgICAgICAgICBFZGl0b3IuTWVzc2FnZS5yZXF1ZXN0KCdzY2VuZScsICdjaGFuZ2UtZ2l6bW8tY29vcmRpbmF0ZScsIHR5cGUpLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgICAgIHJlc29sdmUoe1xuICAgICAgICAgICAgICAgICAgICBzdWNjZXNzOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICBtZXNzYWdlOiBgQ29vcmRpbmF0ZSBzeXN0ZW0gY2hhbmdlZCB0byAnJHt0eXBlfSdgXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9KS5jYXRjaCgoZXJyOiBFcnJvcikgPT4ge1xuICAgICAgICAgICAgICAgIHJlc29sdmUoeyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6IGVyci5tZXNzYWdlIH0pO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHByaXZhdGUgYXN5bmMgcXVlcnlHaXptb0Nvb3JkaW5hdGUoKTogUHJvbWlzZTxUb29sUmVzcG9uc2U+IHtcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiB7XG4gICAgICAgICAgICBFZGl0b3IuTWVzc2FnZS5yZXF1ZXN0KCdzY2VuZScsICdxdWVyeS1naXptby1jb29yZGluYXRlJykudGhlbigoY29vcmRpbmF0ZTogc3RyaW5nKSA9PiB7XG4gICAgICAgICAgICAgICAgcmVzb2x2ZSh7XG4gICAgICAgICAgICAgICAgICAgIHN1Y2Nlc3M6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgIGRhdGE6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvb3JkaW5hdGU6IGNvb3JkaW5hdGUsXG4gICAgICAgICAgICAgICAgICAgICAgICBtZXNzYWdlOiBgQ3VycmVudCBjb29yZGluYXRlIHN5c3RlbTogJHtjb29yZGluYXRlfWBcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSkuY2F0Y2goKGVycjogRXJyb3IpID0+IHtcbiAgICAgICAgICAgICAgICByZXNvbHZlKHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiBlcnIubWVzc2FnZSB9KTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGFzeW5jIGNoYW5nZVZpZXdNb2RlMkQzRChpczJEOiBib29sZWFuKTogUHJvbWlzZTxUb29sUmVzcG9uc2U+IHtcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiB7XG4gICAgICAgICAgICBFZGl0b3IuTWVzc2FnZS5yZXF1ZXN0KCdzY2VuZScsICdjaGFuZ2UtaXMyRCcsIGlzMkQpLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgICAgIHJlc29sdmUoe1xuICAgICAgICAgICAgICAgICAgICBzdWNjZXNzOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICBtZXNzYWdlOiBgVmlldyBtb2RlIGNoYW5nZWQgdG8gJHtpczJEID8gJzJEJyA6ICczRCd9YFxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSkuY2F0Y2goKGVycjogRXJyb3IpID0+IHtcbiAgICAgICAgICAgICAgICByZXNvbHZlKHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiBlcnIubWVzc2FnZSB9KTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGFzeW5jIHF1ZXJ5Vmlld01vZGUyRDNEKCk6IFByb21pc2U8VG9vbFJlc3BvbnNlPiB7XG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSkgPT4ge1xuICAgICAgICAgICAgRWRpdG9yLk1lc3NhZ2UucmVxdWVzdCgnc2NlbmUnLCAncXVlcnktaXMyRCcpLnRoZW4oKGlzMkQ6IGJvb2xlYW4pID0+IHtcbiAgICAgICAgICAgICAgICByZXNvbHZlKHtcbiAgICAgICAgICAgICAgICAgICAgc3VjY2VzczogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgZGF0YToge1xuICAgICAgICAgICAgICAgICAgICAgICAgaXMyRDogaXMyRCxcbiAgICAgICAgICAgICAgICAgICAgICAgIHZpZXdNb2RlOiBpczJEID8gJzJEJyA6ICczRCcsXG4gICAgICAgICAgICAgICAgICAgICAgICBtZXNzYWdlOiBgQ3VycmVudCB2aWV3IG1vZGU6ICR7aXMyRCA/ICcyRCcgOiAnM0QnfWBcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSkuY2F0Y2goKGVycjogRXJyb3IpID0+IHtcbiAgICAgICAgICAgICAgICByZXNvbHZlKHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiBlcnIubWVzc2FnZSB9KTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGFzeW5jIHNldEdyaWRWaXNpYmxlKHZpc2libGU6IGJvb2xlYW4pOiBQcm9taXNlPFRvb2xSZXNwb25zZT4ge1xuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHtcbiAgICAgICAgICAgIEVkaXRvci5NZXNzYWdlLnJlcXVlc3QoJ3NjZW5lJywgJ3NldC1ncmlkLXZpc2libGUnLCB2aXNpYmxlKS50aGVuKCgpID0+IHtcbiAgICAgICAgICAgICAgICByZXNvbHZlKHtcbiAgICAgICAgICAgICAgICAgICAgc3VjY2VzczogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgbWVzc2FnZTogYEdyaWQgJHt2aXNpYmxlID8gJ3Nob3duJyA6ICdoaWRkZW4nfWBcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0pLmNhdGNoKChlcnI6IEVycm9yKSA9PiB7XG4gICAgICAgICAgICAgICAgcmVzb2x2ZSh7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogZXJyLm1lc3NhZ2UgfSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBhc3luYyBxdWVyeUdyaWRWaXNpYmxlKCk6IFByb21pc2U8VG9vbFJlc3BvbnNlPiB7XG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSkgPT4ge1xuICAgICAgICAgICAgRWRpdG9yLk1lc3NhZ2UucmVxdWVzdCgnc2NlbmUnLCAncXVlcnktaXMtZ3JpZC12aXNpYmxlJykudGhlbigodmlzaWJsZTogYm9vbGVhbikgPT4ge1xuICAgICAgICAgICAgICAgIHJlc29sdmUoe1xuICAgICAgICAgICAgICAgICAgICBzdWNjZXNzOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICBkYXRhOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2aXNpYmxlOiB2aXNpYmxlLFxuICAgICAgICAgICAgICAgICAgICAgICAgbWVzc2FnZTogYEdyaWQgaXMgJHt2aXNpYmxlID8gJ3Zpc2libGUnIDogJ2hpZGRlbid9YFxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9KS5jYXRjaCgoZXJyOiBFcnJvcikgPT4ge1xuICAgICAgICAgICAgICAgIHJlc29sdmUoeyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6IGVyci5tZXNzYWdlIH0pO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHByaXZhdGUgYXN5bmMgc2V0SWNvbkdpem1vM0QoaXMzRDogYm9vbGVhbik6IFByb21pc2U8VG9vbFJlc3BvbnNlPiB7XG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSkgPT4ge1xuICAgICAgICAgICAgRWRpdG9yLk1lc3NhZ2UucmVxdWVzdCgnc2NlbmUnLCAnc2V0LWljb24tZ2l6bW8tM2QnLCBpczNEKS50aGVuKCgpID0+IHtcbiAgICAgICAgICAgICAgICByZXNvbHZlKHtcbiAgICAgICAgICAgICAgICAgICAgc3VjY2VzczogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgbWVzc2FnZTogYEljb25HaXptbyBzZXQgdG8gJHtpczNEID8gJzNEJyA6ICcyRCd9IG1vZGVgXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9KS5jYXRjaCgoZXJyOiBFcnJvcikgPT4ge1xuICAgICAgICAgICAgICAgIHJlc29sdmUoeyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6IGVyci5tZXNzYWdlIH0pO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHByaXZhdGUgYXN5bmMgcXVlcnlJY29uR2l6bW8zRCgpOiBQcm9taXNlPFRvb2xSZXNwb25zZT4ge1xuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHtcbiAgICAgICAgICAgIEVkaXRvci5NZXNzYWdlLnJlcXVlc3QoJ3NjZW5lJywgJ3F1ZXJ5LWlzLWljb24tZ2l6bW8tM2QnKS50aGVuKChpczNEOiBib29sZWFuKSA9PiB7XG4gICAgICAgICAgICAgICAgcmVzb2x2ZSh7XG4gICAgICAgICAgICAgICAgICAgIHN1Y2Nlc3M6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgIGRhdGE6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlzM0Q6IGlzM0QsXG4gICAgICAgICAgICAgICAgICAgICAgICBtb2RlOiBpczNEID8gJzNEJyA6ICcyRCcsXG4gICAgICAgICAgICAgICAgICAgICAgICBtZXNzYWdlOiBgSWNvbkdpem1vIGlzIGluICR7aXMzRCA/ICczRCcgOiAnMkQnfSBtb2RlYFxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9KS5jYXRjaCgoZXJyOiBFcnJvcikgPT4ge1xuICAgICAgICAgICAgICAgIHJlc29sdmUoeyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6IGVyci5tZXNzYWdlIH0pO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHByaXZhdGUgYXN5bmMgc2V0SWNvbkdpem1vU2l6ZShzaXplOiBudW1iZXIpOiBQcm9taXNlPFRvb2xSZXNwb25zZT4ge1xuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHtcbiAgICAgICAgICAgIEVkaXRvci5NZXNzYWdlLnJlcXVlc3QoJ3NjZW5lJywgJ3NldC1pY29uLWdpem1vLXNpemUnLCBzaXplKS50aGVuKCgpID0+IHtcbiAgICAgICAgICAgICAgICByZXNvbHZlKHtcbiAgICAgICAgICAgICAgICAgICAgc3VjY2VzczogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgbWVzc2FnZTogYEljb25HaXptbyBzaXplIHNldCB0byAke3NpemV9YFxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSkuY2F0Y2goKGVycjogRXJyb3IpID0+IHtcbiAgICAgICAgICAgICAgICByZXNvbHZlKHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiBlcnIubWVzc2FnZSB9KTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGFzeW5jIHF1ZXJ5SWNvbkdpem1vU2l6ZSgpOiBQcm9taXNlPFRvb2xSZXNwb25zZT4ge1xuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHtcbiAgICAgICAgICAgIEVkaXRvci5NZXNzYWdlLnJlcXVlc3QoJ3NjZW5lJywgJ3F1ZXJ5LWljb24tZ2l6bW8tc2l6ZScpLnRoZW4oKHNpemU6IG51bWJlcikgPT4ge1xuICAgICAgICAgICAgICAgIHJlc29sdmUoe1xuICAgICAgICAgICAgICAgICAgICBzdWNjZXNzOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICBkYXRhOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzaXplOiBzaXplLFxuICAgICAgICAgICAgICAgICAgICAgICAgbWVzc2FnZTogYEljb25HaXptbyBzaXplOiAke3NpemV9YFxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9KS5jYXRjaCgoZXJyOiBFcnJvcikgPT4ge1xuICAgICAgICAgICAgICAgIHJlc29sdmUoeyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6IGVyci5tZXNzYWdlIH0pO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHByaXZhdGUgYXN5bmMgZm9jdXNDYW1lcmFPbk5vZGVzKHV1aWRzOiBzdHJpbmdbXSB8IG51bGwpOiBQcm9taXNlPFRvb2xSZXNwb25zZT4ge1xuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHtcbiAgICAgICAgICAgIEVkaXRvci5NZXNzYWdlLnJlcXVlc3QoJ3NjZW5lJywgJ2ZvY3VzLWNhbWVyYScsIHV1aWRzIHx8IFtdKS50aGVuKCgpID0+IHtcbiAgICAgICAgICAgICAgICBjb25zdCBtZXNzYWdlID0gdXVpZHMgPT09IG51bGwgPyBcbiAgICAgICAgICAgICAgICAgICAgJ0NhbWVyYSBmb2N1c2VkIG9uIGFsbCBub2RlcycgOiBcbiAgICAgICAgICAgICAgICAgICAgYENhbWVyYSBmb2N1c2VkIG9uICR7dXVpZHMubGVuZ3RofSBub2RlKHMpYDtcbiAgICAgICAgICAgICAgICByZXNvbHZlKHtcbiAgICAgICAgICAgICAgICAgICAgc3VjY2VzczogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgbWVzc2FnZTogbWVzc2FnZVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSkuY2F0Y2goKGVycjogRXJyb3IpID0+IHtcbiAgICAgICAgICAgICAgICByZXNvbHZlKHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiBlcnIubWVzc2FnZSB9KTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGFzeW5jIGFsaWduQ2FtZXJhV2l0aFZpZXcoKTogUHJvbWlzZTxUb29sUmVzcG9uc2U+IHtcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiB7XG4gICAgICAgICAgICBFZGl0b3IuTWVzc2FnZS5yZXF1ZXN0KCdzY2VuZScsICdhbGlnbi13aXRoLXZpZXcnKS50aGVuKCgpID0+IHtcbiAgICAgICAgICAgICAgICByZXNvbHZlKHtcbiAgICAgICAgICAgICAgICAgICAgc3VjY2VzczogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgbWVzc2FnZTogJ1NjZW5lIGNhbWVyYSBhbGlnbmVkIHdpdGggY3VycmVudCB2aWV3J1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSkuY2F0Y2goKGVycjogRXJyb3IpID0+IHtcbiAgICAgICAgICAgICAgICByZXNvbHZlKHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiBlcnIubWVzc2FnZSB9KTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGFzeW5jIGFsaWduVmlld1dpdGhOb2RlKCk6IFByb21pc2U8VG9vbFJlc3BvbnNlPiB7XG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSkgPT4ge1xuICAgICAgICAgICAgRWRpdG9yLk1lc3NhZ2UucmVxdWVzdCgnc2NlbmUnLCAnYWxpZ24td2l0aC12aWV3LW5vZGUnKS50aGVuKCgpID0+IHtcbiAgICAgICAgICAgICAgICByZXNvbHZlKHtcbiAgICAgICAgICAgICAgICAgICAgc3VjY2VzczogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgbWVzc2FnZTogJ1ZpZXcgYWxpZ25lZCB3aXRoIHNlbGVjdGVkIG5vZGUnXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9KS5jYXRjaCgoZXJyOiBFcnJvcikgPT4ge1xuICAgICAgICAgICAgICAgIHJlc29sdmUoeyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6IGVyci5tZXNzYWdlIH0pO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHByaXZhdGUgYXN5bmMgZ2V0U2NlbmVWaWV3U3RhdHVzKCk6IFByb21pc2U8VG9vbFJlc3BvbnNlPiB7XG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZShhc3luYyAocmVzb2x2ZSkgPT4ge1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAvLyBHYXRoZXIgYWxsIHZpZXcgc3RhdHVzIGluZm9ybWF0aW9uXG4gICAgICAgICAgICAgICAgY29uc3QgW1xuICAgICAgICAgICAgICAgICAgICBnaXptb1Rvb2wsXG4gICAgICAgICAgICAgICAgICAgIGdpem1vUGl2b3QsXG4gICAgICAgICAgICAgICAgICAgIGdpem1vQ29vcmRpbmF0ZSxcbiAgICAgICAgICAgICAgICAgICAgdmlld01vZGUyRDNELFxuICAgICAgICAgICAgICAgICAgICBncmlkVmlzaWJsZSxcbiAgICAgICAgICAgICAgICAgICAgaWNvbkdpem1vM0QsXG4gICAgICAgICAgICAgICAgICAgIGljb25HaXptb1NpemVcbiAgICAgICAgICAgICAgICBdID0gYXdhaXQgUHJvbWlzZS5hbGxTZXR0bGVkKFtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5xdWVyeUdpem1vVG9vbE5hbWUoKSxcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5xdWVyeUdpem1vUGl2b3QoKSxcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5xdWVyeUdpem1vQ29vcmRpbmF0ZSgpLFxuICAgICAgICAgICAgICAgICAgICB0aGlzLnF1ZXJ5Vmlld01vZGUyRDNEKCksXG4gICAgICAgICAgICAgICAgICAgIHRoaXMucXVlcnlHcmlkVmlzaWJsZSgpLFxuICAgICAgICAgICAgICAgICAgICB0aGlzLnF1ZXJ5SWNvbkdpem1vM0QoKSxcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5xdWVyeUljb25HaXptb1NpemUoKVxuICAgICAgICAgICAgICAgIF0pO1xuXG4gICAgICAgICAgICAgICAgY29uc3Qgc3RhdHVzOiBhbnkgPSB7XG4gICAgICAgICAgICAgICAgICAgIHRpbWVzdGFtcDogbmV3IERhdGUoKS50b0lTT1N0cmluZygpXG4gICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgICAgIC8vIEV4dHJhY3QgZGF0YSBmcm9tIGZ1bGZpbGxlZCBwcm9taXNlc1xuICAgICAgICAgICAgICAgIGlmIChnaXptb1Rvb2wuc3RhdHVzID09PSAnZnVsZmlsbGVkJyAmJiBnaXptb1Rvb2wudmFsdWUuc3VjY2Vzcykge1xuICAgICAgICAgICAgICAgICAgICBzdGF0dXMuZ2l6bW9Ub29sID0gZ2l6bW9Ub29sLnZhbHVlLmRhdGEuY3VycmVudFRvb2w7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmIChnaXptb1Bpdm90LnN0YXR1cyA9PT0gJ2Z1bGZpbGxlZCcgJiYgZ2l6bW9QaXZvdC52YWx1ZS5zdWNjZXNzKSB7XG4gICAgICAgICAgICAgICAgICAgIHN0YXR1cy5naXptb1Bpdm90ID0gZ2l6bW9QaXZvdC52YWx1ZS5kYXRhLmN1cnJlbnRQaXZvdDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKGdpem1vQ29vcmRpbmF0ZS5zdGF0dXMgPT09ICdmdWxmaWxsZWQnICYmIGdpem1vQ29vcmRpbmF0ZS52YWx1ZS5zdWNjZXNzKSB7XG4gICAgICAgICAgICAgICAgICAgIHN0YXR1cy5jb29yZGluYXRlID0gZ2l6bW9Db29yZGluYXRlLnZhbHVlLmRhdGEuY29vcmRpbmF0ZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKHZpZXdNb2RlMkQzRC5zdGF0dXMgPT09ICdmdWxmaWxsZWQnICYmIHZpZXdNb2RlMkQzRC52YWx1ZS5zdWNjZXNzKSB7XG4gICAgICAgICAgICAgICAgICAgIHN0YXR1cy5pczJEID0gdmlld01vZGUyRDNELnZhbHVlLmRhdGEuaXMyRDtcbiAgICAgICAgICAgICAgICAgICAgc3RhdHVzLnZpZXdNb2RlID0gdmlld01vZGUyRDNELnZhbHVlLmRhdGEudmlld01vZGU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmIChncmlkVmlzaWJsZS5zdGF0dXMgPT09ICdmdWxmaWxsZWQnICYmIGdyaWRWaXNpYmxlLnZhbHVlLnN1Y2Nlc3MpIHtcbiAgICAgICAgICAgICAgICAgICAgc3RhdHVzLmdyaWRWaXNpYmxlID0gZ3JpZFZpc2libGUudmFsdWUuZGF0YS52aXNpYmxlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAoaWNvbkdpem1vM0Quc3RhdHVzID09PSAnZnVsZmlsbGVkJyAmJiBpY29uR2l6bW8zRC52YWx1ZS5zdWNjZXNzKSB7XG4gICAgICAgICAgICAgICAgICAgIHN0YXR1cy5pY29uR2l6bW8zRCA9IGljb25HaXptbzNELnZhbHVlLmRhdGEuaXMzRDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKGljb25HaXptb1NpemUuc3RhdHVzID09PSAnZnVsZmlsbGVkJyAmJiBpY29uR2l6bW9TaXplLnZhbHVlLnN1Y2Nlc3MpIHtcbiAgICAgICAgICAgICAgICAgICAgc3RhdHVzLmljb25HaXptb1NpemUgPSBpY29uR2l6bW9TaXplLnZhbHVlLmRhdGEuc2l6ZTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICByZXNvbHZlKHtcbiAgICAgICAgICAgICAgICAgICAgc3VjY2VzczogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgZGF0YTogc3RhdHVzXG4gICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIH0gY2F0Y2ggKGVycjogYW55KSB7XG4gICAgICAgICAgICAgICAgcmVzb2x2ZSh7XG4gICAgICAgICAgICAgICAgICAgIHN1Y2Nlc3M6IGZhbHNlLFxuICAgICAgICAgICAgICAgICAgICBlcnJvcjogYEZhaWxlZCB0byBnZXQgc2NlbmUgdmlldyBzdGF0dXM6ICR7ZXJyLm1lc3NhZ2V9YFxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGFzeW5jIHJlc2V0U2NlbmVWaWV3KCk6IFByb21pc2U8VG9vbFJlc3BvbnNlPiB7XG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZShhc3luYyAocmVzb2x2ZSkgPT4ge1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAvLyBSZXNldCBzY2VuZSB2aWV3IHRvIGRlZmF1bHQgc2V0dGluZ3NcbiAgICAgICAgICAgICAgICBjb25zdCByZXNldEFjdGlvbnMgPSBbXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuY2hhbmdlR2l6bW9Ub29sKCdwb3NpdGlvbicpLFxuICAgICAgICAgICAgICAgICAgICB0aGlzLmNoYW5nZUdpem1vUGl2b3QoJ3Bpdm90JyksXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuY2hhbmdlR2l6bW9Db29yZGluYXRlKCdsb2NhbCcpLFxuICAgICAgICAgICAgICAgICAgICB0aGlzLmNoYW5nZVZpZXdNb2RlMkQzRChmYWxzZSksIC8vIDNEIG1vZGVcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zZXRHcmlkVmlzaWJsZSh0cnVlKSxcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zZXRJY29uR2l6bW8zRCh0cnVlKSxcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zZXRJY29uR2l6bW9TaXplKDYwKVxuICAgICAgICAgICAgICAgIF07XG5cbiAgICAgICAgICAgICAgICBhd2FpdCBQcm9taXNlLmFsbChyZXNldEFjdGlvbnMpO1xuXG4gICAgICAgICAgICAgICAgcmVzb2x2ZSh7XG4gICAgICAgICAgICAgICAgICAgIHN1Y2Nlc3M6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgIG1lc3NhZ2U6ICdTY2VuZSB2aWV3IHJlc2V0IHRvIGRlZmF1bHQgc2V0dGluZ3MnXG4gICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIH0gY2F0Y2ggKGVycjogYW55KSB7XG4gICAgICAgICAgICAgICAgcmVzb2x2ZSh7XG4gICAgICAgICAgICAgICAgICAgIHN1Y2Nlc3M6IGZhbHNlLFxuICAgICAgICAgICAgICAgICAgICBlcnJvcjogYEZhaWxlZCB0byByZXNldCBzY2VuZSB2aWV3OiAke2Vyci5tZXNzYWdlfWBcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxufSJdfQ==