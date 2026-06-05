import { ToolDefinition, ToolResponse, ToolExecutor, ConsoleMessage, PerformanceStats, ValidationResult, ValidationIssue } from '../../types';
import * as fs from 'fs';
import * as path from 'path';

export class DebugTools implements ToolExecutor {
    private consoleMessages: ConsoleMessage[] = [];
    private readonly maxMessages = 1000;

    constructor() {
        this.setupConsoleCapture();
    }

    private setupConsoleCapture(): void {
        // Intercept Editor console messages
        // Note: Editor.Message.addBroadcastListener may not be available in all versions
        // This is a placeholder for console capture implementation
        console.log('Console capture setup - implementation depends on Editor API availability');
    }

    private addConsoleMessage(message: any): void {
        this.consoleMessages.push({
            timestamp: new Date().toISOString(),
            ...message
        });

        // Keep only latest messages
        if (this.consoleMessages.length > this.maxMessages) {
            this.consoleMessages.shift();
        }
    }

    getTools(): ToolDefinition[] {
        return [
            {
                name: 'get_console_logs',
                description: '[不可用] 获取编辑器控制台日志。控制台捕获未接入 - Editor.Message.addBroadcastListener 的控制台事件未实现，因此无法捕获日志数据。',
                inputSchema: {
                    type: 'object',
                    properties: {
                        limit: {
                            type: 'number',
                            description: '要获取的最近日志条数',
                            default: 100
                        },
                        filter: {
                            type: 'string',
                            description: '按类型过滤日志',
                            enum: ['all', 'log', 'warn', 'error', 'info'],
                            default: 'all'
                        }
                    }
                }
            },
            {
                name: 'clear_console',
                description: '[部分可用] 清除编辑器控制台。清除内存中的日志缓冲区并发送 Editor.Message.send(\'console\', \'clear\')，但在某些 Cocos Creator 版本中可能无法可靠地清除编辑器控制台界面。',
                inputSchema: {
                    type: 'object',
                    properties: {}
                }
            },
            {
                name: 'execute_script',
                description: '在场景上下文中执行 JavaScript',
                inputSchema: {
                    type: 'object',
                    properties: {
                        script: {
                            type: 'string',
                            description: '要执行的 JavaScript 代码'
                        }
                    },
                    required: ['script']
                }
            },
            {
                name: 'get_node_tree',
                description: '获取详细节点树用于调试',
                inputSchema: {
                    type: 'object',
                    properties: {
                        rootUuid: {
                            type: 'string',
                            description: '根节点 UUID（可选，未提供时使用场景根节点）'
                        },
                        maxDepth: {
                            type: 'number',
                            description: '最大树深度',
                            default: 10
                        }
                    }
                }
            },
            {
                name: 'get_performance_stats',
                description: '获取性能统计',
                inputSchema: {
                    type: 'object',
                    properties: {}
                }
            },
            {
                name: 'validate_scene',
                description: '验证当前场景是否存在问题',
                inputSchema: {
                    type: 'object',
                    properties: {
                        checkMissingAssets: {
                            type: 'boolean',
                            description: '检查缺失的资源引用',
                            default: true
                        },
                        checkPerformance: {
                            type: 'boolean',
                            description: '检查性能问题',
                            default: true
                        }
                    }
                }
            },
            {
                name: 'get_editor_info',
                description: '获取编辑器和环境信息',
                inputSchema: {
                    type: 'object',
                    properties: {}
                }
            },
            {
                name: 'get_project_logs',
                description: '从 temp/logs/project.log 文件获取项目日志',
                inputSchema: {
                    type: 'object',
                    properties: {
                        lines: {
                            type: 'number',
                            description: '从末尾读取的行数（默认：100）',
                            default: 100,
                            minimum: 1,
                            maximum: 10000
                        },
                        filterKeyword: {
                            type: 'string',
                            description: '按特定关键词过滤日志（可选）'
                        },
                        logLevel: {
                            type: 'string',
                            description: '按日志级别过滤',
                            enum: ['ERROR', 'WARN', 'INFO', 'DEBUG', 'TRACE', 'ALL'],
                            default: 'ALL'
                        }
                    }
                }
            },
            {
                name: 'get_log_file_info',
                description: '获取项目日志文件信息',
                inputSchema: {
                    type: 'object',
                    properties: {}
                }
            },
            {
                name: 'search_project_logs',
                description: '在项目日志中搜索特定模式或错误',
                inputSchema: {
                    type: 'object',
                    properties: {
                        pattern: {
                            type: 'string',
                            description: '搜索模式（支持正则表达式）'
                        },
                        maxResults: {
                            type: 'number',
                            description: '最大匹配结果数',
                            default: 20,
                            minimum: 1,
                            maximum: 100
                        },
                        contextLines: {
                            type: 'number',
                            description: '每个匹配结果周围显示的上下文行数',
                            default: 2,
                            minimum: 0,
                            maximum: 10
                        }
                    },
                    required: ['pattern']
                }
            }
        ];
    }

    async execute(toolName: string, args: any): Promise<ToolResponse> {
        switch (toolName) {
            case 'get_console_logs':
                return await this.getConsoleLogs(args.limit, args.filter);
            case 'clear_console':
                return await this.clearConsole();
            case 'execute_script':
                return await this.executeScript(args.script);
            case 'get_node_tree':
                return await this.getNodeTree(args.rootUuid, args.maxDepth);
            case 'get_performance_stats':
                return await this.getPerformanceStats();
            case 'validate_scene':
                return await this.validateScene(args);
            case 'get_editor_info':
                return await this.getEditorInfo();
            case 'get_project_logs':
                return await this.getProjectLogs(args.lines, args.filterKeyword, args.logLevel);
            case 'get_log_file_info':
                return await this.getLogFileInfo();
            case 'search_project_logs':
                return await this.searchProjectLogs(args.pattern, args.maxResults, args.contextLines);
            default:
                throw new Error(`Unknown tool: ${toolName}`);
        }
    }

    private async getConsoleLogs(limit: number = 100, filter: string = 'all'): Promise<ToolResponse> {
        let logs = this.consoleMessages;
        
        if (filter !== 'all') {
            logs = logs.filter(log => log.type === filter);
        }

        const recentLogs = logs.slice(-limit);

        return {
            success: true,
            warning: 'Console capture is not wired — Editor.Message.addBroadcastListener for console events is not implemented. The returned log data will always be empty.',
            data: {
                total: logs.length,
                returned: recentLogs.length,
                logs: recentLogs
            }
        };
    }

    private async clearConsole(): Promise<ToolResponse> {
        this.consoleMessages = [];
        
        try {
            // Note: Editor.Message.send may not return a promise in all versions
            Editor.Message.send('console', 'clear');
            return {
                success: true,
                message: 'Console cleared successfully'
            };
        } catch (err: any) {
            return { success: false, error: err.message };
        }
    }

    private async executeScript(script: string): Promise<ToolResponse> {
        return new Promise((resolve) => {
            Editor.Message.request('scene', 'execute-scene-script', {
                name: 'console',
                method: 'eval',
                args: [script]
            }).then((result: any) => {
                resolve({
                    success: true,
                    data: {
                        result: result,
                        message: 'Script executed successfully'
                    }
                });
            }).catch((err: Error) => {
                resolve({ success: false, error: err.message });
            });
        });
    }

    private async getNodeTree(rootUuid?: string, maxDepth: number = 10): Promise<ToolResponse> {
        return new Promise((resolve) => {
            const buildTree = async (nodeUuid: string, depth: number = 0): Promise<any> => {
                if (depth >= maxDepth) {
                    return { truncated: true };
                }

                try {
                    const nodeData = await Editor.Message.request('scene', 'query-node', nodeUuid);
                    
                    const tree = {
                        uuid: nodeData.uuid,
                        name: nodeData.name,
                        active: nodeData.active,
                        components: (nodeData as any).components ? (nodeData as any).components.map((c: any) => c.__type__) : [],
                        childCount: nodeData.children ? nodeData.children.length : 0,
                        children: [] as any[]
                    };

                    if (nodeData.children && nodeData.children.length > 0) {
                        for (const childId of nodeData.children) {
                            const childTree = await buildTree(childId, depth + 1);
                            tree.children.push(childTree);
                        }
                    }

                    return tree;
                } catch (err: any) {
                    return { error: err.message };
                }
            };

            if (rootUuid) {
                buildTree(rootUuid).then(tree => {
                    resolve({ success: true, data: tree });
                });
            } else {
                Editor.Message.request('scene', 'query-hierarchy').then(async (hierarchy: any) => {
                    const trees = [];
                    for (const rootNode of hierarchy.children) {
                        const tree = await buildTree(rootNode.uuid);
                        trees.push(tree);
                    }
                    resolve({ success: true, data: trees });
                }).catch((err: Error) => {
                    resolve({ success: false, error: err.message });
                });
            }
        });
    }

    private async getPerformanceStats(): Promise<ToolResponse> {
        return new Promise((resolve) => {
            Editor.Message.request('scene', 'query-performance').then((stats: any) => {
                const perfStats: PerformanceStats = {
                    nodeCount: stats.nodeCount || 0,
                    componentCount: stats.componentCount || 0,
                    drawCalls: stats.drawCalls || 0,
                    triangles: stats.triangles || 0,
                    memory: stats.memory || {}
                };
                resolve({ success: true, data: perfStats });
            }).catch(() => {
                // Fallback to basic stats
                resolve({
                    success: true,
                    data: {
                        message: 'Performance stats not available in edit mode'
                    }
                });
            });
        });
    }

    private async validateScene(options: any): Promise<ToolResponse> {
        const issues: ValidationIssue[] = [];

        try {
            // Check for missing assets
            if (options.checkMissingAssets) {
                const assetCheck = await Editor.Message.request('scene', 'check-missing-assets');
                if (assetCheck && assetCheck.missing) {
                    issues.push({
                        type: 'error',
                        category: 'assets',
                        message: `Found ${assetCheck.missing.length} missing asset references`,
                        details: assetCheck.missing
                    });
                }
            }

            // Check for performance issues
            if (options.checkPerformance) {
                const hierarchy = await Editor.Message.request('scene', 'query-hierarchy');
                const nodeCount = this.countNodes(hierarchy.children);
                
                if (nodeCount > 1000) {
                    issues.push({
                        type: 'warning',
                        category: 'performance',
                        message: `High node count: ${nodeCount} nodes (recommended < 1000)`,
                        suggestion: 'Consider using object pooling or scene optimization'
                    });
                }
            }

            const result: ValidationResult = {
                valid: issues.length === 0,
                issueCount: issues.length,
                issues: issues
            };

            return { success: true, data: result };
        } catch (err: any) {
            return { success: false, error: err.message };
        }
    }

    private countNodes(nodes: any[]): number {
        let count = nodes.length;
        for (const node of nodes) {
            if (node.children) {
                count += this.countNodes(node.children);
            }
        }
        return count;
    }

    private async getEditorInfo(): Promise<ToolResponse> {
        const info = {
            editor: {
                version: (Editor as any).versions?.editor || 'Unknown',
                cocosVersion: (Editor as any).versions?.cocos || 'Unknown',
                platform: process.platform,
                arch: process.arch,
                nodeVersion: process.version
            },
            project: {
                name: Editor.Project.name,
                path: Editor.Project.path,
                uuid: Editor.Project.uuid
            },
            memory: process.memoryUsage(),
            uptime: process.uptime()
        };

        return { success: true, data: info };
    }

    private async getProjectLogs(lines: number = 100, filterKeyword?: string, logLevel: string = 'ALL'): Promise<ToolResponse> {
        try {
            // Try multiple possible project paths
            let logFilePath = '';
            const possiblePaths = [
                Editor.Project ? Editor.Project.path : null,
                process.cwd(),
            ].filter(p => p !== null);

            for (const basePath of possiblePaths) {
                const testPath = path.join(basePath, 'temp/logs/project.log');
                if (fs.existsSync(testPath)) {
                    logFilePath = testPath;
                    break;
                }
            }
            
            if (!logFilePath) {
                return {
                    success: false,
                    error: `Project log file not found. Tried paths: ${possiblePaths.map(p => path.join(p, 'temp/logs/project.log')).join(', ')}`
                };
            }

            // Read the file content
            const logContent = fs.readFileSync(logFilePath, 'utf8');
            const logLines = logContent.split('\n').filter(line => line.trim() !== '');
            
            // Get the last N lines
            const recentLines = logLines.slice(-lines);
            
            // Apply filters
            let filteredLines = recentLines;
            
            // Filter by log level if not 'ALL'
            if (logLevel !== 'ALL') {
                filteredLines = filteredLines.filter(line => 
                    line.includes(`[${logLevel}]`) || line.includes(logLevel.toLowerCase())
                );
            }
            
            // Filter by keyword if provided
            if (filterKeyword) {
                filteredLines = filteredLines.filter(line => 
                    line.toLowerCase().includes(filterKeyword.toLowerCase())
                );
            }
            
            return {
                success: true,
                data: {
                    totalLines: logLines.length,
                    requestedLines: lines,
                    filteredLines: filteredLines.length,
                    logLevel: logLevel,
                    filterKeyword: filterKeyword || null,
                    logs: filteredLines,
                    logFilePath: logFilePath
                }
            };
        } catch (error: any) {
            return {
                success: false,
                error: `Failed to read project logs: ${error.message}`
            };
        }
    }

    private async getLogFileInfo(): Promise<ToolResponse> {
        try {
            // Try multiple possible project paths
            let logFilePath = '';
            const possiblePaths = [
                Editor.Project ? Editor.Project.path : null,
                process.cwd(),
            ].filter(p => p !== null);

            for (const basePath of possiblePaths) {
                const testPath = path.join(basePath, 'temp/logs/project.log');
                if (fs.existsSync(testPath)) {
                    logFilePath = testPath;
                    break;
                }
            }
            
            if (!logFilePath) {
                return {
                    success: false,
                    error: `Project log file not found. Tried paths: ${possiblePaths.map(p => path.join(p, 'temp/logs/project.log')).join(', ')}`
                };
            }

            const stats = fs.statSync(logFilePath);
            const logContent = fs.readFileSync(logFilePath, 'utf8');
            const lineCount = logContent.split('\n').filter(line => line.trim() !== '').length;
            
            return {
                success: true,
                data: {
                    filePath: logFilePath,
                    fileSize: stats.size,
                    fileSizeFormatted: this.formatFileSize(stats.size),
                    lastModified: stats.mtime.toISOString(),
                    lineCount: lineCount,
                    created: stats.birthtime.toISOString(),
                    accessible: fs.constants.R_OK
                }
            };
        } catch (error: any) {
            return {
                success: false,
                error: `Failed to get log file info: ${error.message}`
            };
        }
    }

    private async searchProjectLogs(pattern: string, maxResults: number = 20, contextLines: number = 2): Promise<ToolResponse> {
        try {
            // Try multiple possible project paths
            let logFilePath = '';
            const possiblePaths = [
                Editor.Project ? Editor.Project.path : null,
                process.cwd(),
            ].filter(p => p !== null);

            for (const basePath of possiblePaths) {
                const testPath = path.join(basePath, 'temp/logs/project.log');
                if (fs.existsSync(testPath)) {
                    logFilePath = testPath;
                    break;
                }
            }
            
            if (!logFilePath) {
                return {
                    success: false,
                    error: `Project log file not found. Tried paths: ${possiblePaths.map(p => path.join(p, 'temp/logs/project.log')).join(', ')}`
                };
            }

            const logContent = fs.readFileSync(logFilePath, 'utf8');
            const logLines = logContent.split('\n');
            
            // Create regex pattern (support both string and regex patterns)
            let regex: RegExp;
            try {
                regex = new RegExp(pattern, 'gi');
            } catch {
                // If pattern is not valid regex, treat as literal string
                regex = new RegExp(pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
            }
            
            const matches: any[] = [];
            let resultCount = 0;
            
            for (let i = 0; i < logLines.length && resultCount < maxResults; i++) {
                const line = logLines[i];
                if (regex.test(line)) {
                    // Get context lines
                    const contextStart = Math.max(0, i - contextLines);
                    const contextEnd = Math.min(logLines.length - 1, i + contextLines);
                    
                    const contextLinesArray = [];
                    for (let j = contextStart; j <= contextEnd; j++) {
                        contextLinesArray.push({
                            lineNumber: j + 1,
                            content: logLines[j],
                            isMatch: j === i
                        });
                    }
                    
                    matches.push({
                        lineNumber: i + 1,
                        matchedLine: line,
                        context: contextLinesArray
                    });
                    
                    resultCount++;
                    
                    // Reset regex lastIndex for global search
                    regex.lastIndex = 0;
                }
            }
            
            return {
                success: true,
                data: {
                    pattern: pattern,
                    totalMatches: matches.length,
                    maxResults: maxResults,
                    contextLines: contextLines,
                    logFilePath: logFilePath,
                    matches: matches
                }
            };
        } catch (error: any) {
            return {
                success: false,
                error: `Failed to search project logs: ${error.message}`
            };
        }
    }

    private formatFileSize(bytes: number): string {
        const units = ['B', 'KB', 'MB', 'GB'];
        let size = bytes;
        let unitIndex = 0;
        
        while (size >= 1024 && unitIndex < units.length - 1) {
            size /= 1024;
            unitIndex++;
        }
        
        return `${size.toFixed(2)} ${units[unitIndex]}`;
    }
}