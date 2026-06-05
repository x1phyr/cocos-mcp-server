import { ToolDefinition, ToolResponse, ToolExecutor } from '../../types';

export class BroadcastTools implements ToolExecutor {
    private listeners: Map<string, Function[]> = new Map();
    private messageLog: Array<{ message: string; data: any; timestamp: number }> = [];

    constructor() {
        this.setupBroadcastListeners();
    }

    getTools(): ToolDefinition[] {
        return [
            {
                name: 'get_broadcast_log',
                description: '[仅模拟] 获取近期广播消息日志。由于 Editor.Message.on 监听器未接入，数据始终为空——无法捕获真实广播事件。',
                inputSchema: {
                    type: 'object',
                    properties: {
                        limit: {
                            type: 'number',
                            description: '要返回的最近消息条数',
                            default: 50
                        },
                        messageType: {
                            type: 'string',
                            description: '按消息类型过滤（可选）'
                        }
                    }
                }
            },
            {
                name: 'listen_broadcast',
                description: '[不可用] 开始监听特定广播消息。需要 Editor.Message.on，但当前扩展未接入——无法捕获真实广播事件。',
                inputSchema: {
                    type: 'object',
                    properties: {
                        messageType: {
                            type: 'string',
                            description: '要监听的消息类型'
                        }
                    },
                    required: ['messageType']
                }
            },
            {
                name: 'stop_listening',
                description: '[不可用] 停止监听特定广播消息。需要 Editor.Message.off，但未接入——监听器从未在编辑器中注册。',
                inputSchema: {
                    type: 'object',
                    properties: {
                        messageType: {
                            type: 'string',
                            description: '要停止监听的消息类型'
                        }
                    },
                    required: ['messageType']
                }
            },
            {
                name: 'clear_broadcast_log',
                description: '[仅模拟] 清除广播消息日志。仅清除内存中的模拟日志，由于无法捕获真实广播事件，日志始终为空。',
                inputSchema: {
                    type: 'object',
                    properties: {}
                }
            },
            {
                name: 'get_active_listeners',
                description: '[仅模拟] 获取活跃广播监听器列表。仅返回模拟的监听器注册信息——没有真实的 Editor.Message.on 监听器处于活跃状态。',
                inputSchema: {
                    type: 'object',
                    properties: {}
                }
            }
        ];
    }

    async execute(toolName: string, args: any): Promise<ToolResponse> {
        switch (toolName) {
            case 'get_broadcast_log':
                return await this.getBroadcastLog(args.limit, args.messageType);
            case 'listen_broadcast':
                return await this.listenBroadcast(args.messageType);
            case 'stop_listening':
                return await this.stopListening(args.messageType);
            case 'clear_broadcast_log':
                return await this.clearBroadcastLog();
            case 'get_active_listeners':
                return await this.getActiveListeners();
            default:
                throw new Error(`Unknown tool: ${toolName}`);
        }
    }

    private setupBroadcastListeners(): void {
        // 设置预定义的重要广播消息监听
        const importantMessages = [
            'build-worker:ready',
            'build-worker:closed',
            'scene:ready',
            'scene:close',
            'scene:light-probe-edit-mode-changed',
            'scene:light-probe-bounding-box-edit-mode-changed',
            'asset-db:ready',
            'asset-db:close',
            'asset-db:asset-add',
            'asset-db:asset-change',
            'asset-db:asset-delete'
        ];

        importantMessages.forEach(messageType => {
            this.addBroadcastListener(messageType);
        });
    }

    private addBroadcastListener(messageType: string): void {
        const listener = (data: any) => {
            this.messageLog.push({
                message: messageType,
                data: data,
                timestamp: Date.now()
            });

            // 保持日志大小在合理范围内
            if (this.messageLog.length > 1000) {
                this.messageLog = this.messageLog.slice(-500);
            }

            console.log(`[Broadcast] ${messageType}:`, data);
        };

        if (!this.listeners.has(messageType)) {
            this.listeners.set(messageType, []);
        }
        this.listeners.get(messageType)!.push(listener);

        // 注册 Editor 消息监听 - 暂时注释掉，Editor.Message API可能不支持
        // Editor.Message.on(messageType, listener);
        console.log(`[BroadcastTools] Added listener for ${messageType} (simulated)`);
    }

    private removeBroadcastListener(messageType: string): void {
        const listeners = this.listeners.get(messageType);
        if (listeners) {
            listeners.forEach(listener => {
                // Editor.Message.off(messageType, listener);
                console.log(`[BroadcastTools] Removed listener for ${messageType} (simulated)`);
            });
            this.listeners.delete(messageType);
        }
    }

    private async getBroadcastLog(limit: number = 50, messageType?: string): Promise<ToolResponse> {
        return new Promise((resolve) => {
            let filteredLog = this.messageLog;

            if (messageType) {
                filteredLog = this.messageLog.filter(entry => entry.message === messageType);
            }

            const recentLog = filteredLog.slice(-limit).map(entry => ({
                ...entry,
                timestamp: new Date(entry.timestamp).toISOString()
            }));

            resolve({
                success: true,
                warning:
                    'Broadcast log only contains simulated entries; real Editor.Message.on is not wired.',
                data: {
                    log: recentLog,
                    count: recentLog.length,
                    totalCount: filteredLog.length,
                    filter: messageType || 'all',
                    message: 'Broadcast log retrieved successfully'
                }
            });
        });
    }

    private async listenBroadcast(messageType: string): Promise<ToolResponse> {
        return {
            success: false,
            error: 'Broadcast listening is not available in this extension version',
            instruction:
                'Editor.Message.on is not wired for broadcast events. Do not rely on listen_broadcast or get_broadcast_log for real editor events.',
        };
    }

    private async stopListening(messageType: string): Promise<ToolResponse> {
        return new Promise((resolve) => {
            try {
                if (this.listeners.has(messageType)) {
                    this.removeBroadcastListener(messageType);
                    resolve({
                        success: true,
                        data: {
                            messageType: messageType,
                            message: `Stopped listening for broadcast: ${messageType}`
                        }
                    });
                } else {
                    resolve({
                        success: true,
                        data: {
                            messageType: messageType,
                            message: `Was not listening for broadcast: ${messageType}`
                        }
                    });
                }
            } catch (err: any) {
                resolve({ success: false, error: err.message });
            }
        });
    }

    private async clearBroadcastLog(): Promise<ToolResponse> {
        return new Promise((resolve) => {
            const previousCount = this.messageLog.length;
            this.messageLog = [];
            resolve({
                success: true,
                data: {
                    clearedCount: previousCount,
                    message: 'Broadcast log cleared successfully'
                }
            });
        });
    }

    private async getActiveListeners(): Promise<ToolResponse> {
        return new Promise((resolve) => {
            const activeListeners = Array.from(this.listeners.keys()).map(messageType => ({
                messageType: messageType,
                listenerCount: this.listeners.get(messageType)?.length || 0
            }));

            resolve({
                success: true,
                data: {
                    listeners: activeListeners,
                    count: activeListeners.length,
                    message: 'Active listeners retrieved successfully'
                }
            });
        });
    }
}