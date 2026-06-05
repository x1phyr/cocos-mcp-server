import * as http from 'http';
import * as url from 'url';
import { MCPServerSettings, ServerStatus, ToolDefinition } from '../types';
import { PACKAGE_VERSION } from '../core/constants';
import { CapabilityManager } from '../bridge/capability-manager';
import { BUILTIN_TOOL_CATEGORIES } from '../registry/builtin-categories';

const MAX_REQUEST_BODY_BYTES = 4 * 1024 * 1024;

export class MCPServer {
    private settings: MCPServerSettings;
    private httpServer: http.Server | null = null;
    private activeConnections = 0;
    private toolsList: ToolDefinition[] = [];
    private enabledTools: any[] = [];
    /** True after ToolManager sync; empty enabledTools then means block all, not allow all. */
    private enabledToolsConfigured = false;
    private capabilityManager: CapabilityManager;

    constructor(settings: MCPServerSettings, capabilityManager: CapabilityManager) {
        this.settings = settings;
        this.capabilityManager = capabilityManager;
    }

    public getCapabilityManager(): CapabilityManager {
        return this.capabilityManager;
    }

    public async start(): Promise<void> {
        if (this.httpServer) {
            console.log('[MCPServer] Server is already running');
            return;
        }

        try {
            console.log(`[MCPServer] Starting HTTP server on port ${this.settings.port}...`);
            this.httpServer = http.createServer(this.handleHttpRequest.bind(this));

            await new Promise<void>((resolve, reject) => {
                this.httpServer!.listen(this.settings.port, '127.0.0.1', () => {
                    console.log(`[MCPServer] ✅ HTTP server started successfully on http://127.0.0.1:${this.settings.port}`);
                    console.log(`[MCPServer] Health check: http://127.0.0.1:${this.settings.port}/health`);
                    console.log(`[MCPServer] MCP endpoint: http://127.0.0.1:${this.settings.port}/mcp`);
                    resolve();
                });
                this.httpServer!.on('error', (err: any) => {
                    console.error('[MCPServer] ❌ Failed to start server:', err);
                    if (err.code === 'EADDRINUSE') {
                        console.error(`[MCPServer] Port ${this.settings.port} is already in use. Please change the port in settings.`);
                    }
                    reject(err);
                });
            });

            this.setupTools();
            console.log('[MCPServer] 🚀 MCP Server is ready for connections');
        } catch (error) {
            console.error('[MCPServer] ❌ Failed to start server:', error);
            throw error;
        }
    }

    private setupTools(): void {
        this.toolsList = [];
        const enabledToolNames = this.getEnabledToolNameSet();

        const appendTool = (def: ToolDefinition) => {
            if (enabledToolNames === null || enabledToolNames.has(def.name)) {
                this.toolsList.push(def);
            }
        };

        for (const tool of this.capabilityManager.getAllMcpDefinitions()) {
            appendTool(tool);
        }

        const externalCount = this.capabilityManager.getExternalMcpToolDefinitions().length;
        console.log(
            `[MCPServer] Setup tools: ${this.toolsList.length} tools available (${externalCount} external)`
        );
    }

    public refreshToolList(): void {
        this.setupTools();
    }

    public getFilteredTools(enabledTools: any[], configured = true): ToolDefinition[] {
        if (!configured) {
            return this.toolsList;
        }
        if (!enabledTools || enabledTools.length === 0) {
            return [];
        }

        const enabledToolNames = new Set(enabledTools.map((tool) => `${tool.category}_${tool.name}`));
        return this.toolsList.filter((tool) => enabledToolNames.has(tool.name));
    }

    public async executeToolCall(toolName: string, args: any): Promise<any> {
        if (!this.isToolEnabled(toolName)) {
            return { success: false, error: `Tool ${toolName} is disabled` };
        }
        return this.capabilityManager.invokeByFullName(toolName, args);
    }

    private getEnabledToolNameSet(): Set<string> | null {
        if (!this.enabledToolsConfigured) {
            return null;
        }
        return new Set(this.enabledTools.map((tool) => `${tool.category}_${tool.name}`));
    }

    private isToolEnabled(fullName: string): boolean {
        const enabledSet = this.getEnabledToolNameSet();
        if (enabledSet === null) {
            return true;
        }
        return enabledSet.has(fullName);
    }

    public getAvailableTools(): ToolDefinition[] {
        if (!this.httpServer) {
            return [];
        }
        return this.toolsList;
    }

    public updateEnabledTools(enabledTools: any[]): void {
        console.log(`[MCPServer] Updating enabled tools: ${enabledTools.length} tools`);
        this.enabledTools = enabledTools;
        this.enabledToolsConfigured = true;
        this.setupTools();
    }

    public getSettings(): MCPServerSettings {
        return this.settings;
    }

    private isOriginAllowed(origin: string | undefined): boolean {
        const allowed = this.settings.allowedOrigins;
        if (!allowed || allowed.length === 0 || allowed.includes('*')) {
            return true;
        }
        if (!origin) {
            return true;
        }
        return allowed.includes(origin);
    }

    private setCorsHeaders(req: http.IncomingMessage, res: http.ServerResponse): void {
        const origin = req.headers.origin;
        if (origin && this.isOriginAllowed(origin)) {
            res.setHeader('Access-Control-Allow-Origin', origin);
        } else if (this.settings.allowedOrigins?.includes('*')) {
            res.setHeader('Access-Control-Allow-Origin', '*');
        }
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
        res.setHeader('Content-Type', 'application/json');
    }

    private acquireConnection(): boolean {
        const max = this.settings.maxConnections ?? 10;
        if (max > 0 && this.activeConnections >= max) {
            return false;
        }
        this.activeConnections++;
        return true;
    }

    private releaseConnection(): void {
        if (this.activeConnections > 0) {
            this.activeConnections--;
        }
    }

    private tryBeginRequest(res: http.ServerResponse): boolean {
        if (!this.acquireConnection()) {
            res.writeHead(503);
            res.end(JSON.stringify({ error: 'Too many connections' }));
            return false;
        }
        return true;
    }

    private endRequest(res: http.ServerResponse): void {
        if (res.writableEnded) {
            this.releaseConnection();
            return;
        }
        res.on('finish', () => this.releaseConnection());
    }

    private readRequestBody(req: http.IncomingMessage): Promise<{ body: string; tooLarge: boolean }> {
        return new Promise((resolve, reject) => {
            let body = '';
            let tooLarge = false;

            req.on('data', (chunk) => {
                if (tooLarge) {
                    return;
                }
                body += chunk.toString();
                if (Buffer.byteLength(body, 'utf8') > MAX_REQUEST_BODY_BYTES) {
                    tooLarge = true;
                    req.destroy();
                }
            });

            req.on('end', () => resolve({ body, tooLarge }));
            req.on('error', reject);
        });
    }

    private async handleHttpRequest(req: http.IncomingMessage, res: http.ServerResponse): Promise<void> {
        const parsedUrl = url.parse(req.url || '', true);
        const pathname = parsedUrl.pathname;

        this.setCorsHeaders(req, res);

        if (req.method === 'OPTIONS') {
            if (!this.isOriginAllowed(req.headers.origin)) {
                res.writeHead(403);
                res.end(JSON.stringify({ error: 'Origin not allowed' }));
                return;
            }
            res.writeHead(200);
            res.end();
            return;
        }

        if (req.headers.origin && !this.isOriginAllowed(req.headers.origin)) {
            res.writeHead(403);
            res.end(JSON.stringify({ error: 'Origin not allowed' }));
            return;
        }

        try {
            if (pathname === '/mcp' && req.method === 'POST') {
                await this.handleMCPRequest(req, res);
            } else if (pathname === '/health' && req.method === 'GET') {
                if (!this.tryBeginRequest(res)) {
                    return;
                }
                try {
                    const externalCount = this.capabilityManager.getExternalMcpToolDefinitions().length;
                    const providers = this.capabilityManager.getProviderSummaries();
                    res.writeHead(200);
                    res.end(
                        JSON.stringify({
                            status: 'ok',
                            version: PACKAGE_VERSION,
                            tools: this.toolsList.length,
                            providers,
                            externalTools: externalCount,
                            externalProviders: this.capabilityManager.listExternalProviders().length,
                        })
                    );
                } finally {
                    this.endRequest(res);
                }
            } else if (pathname?.startsWith('/api/') && req.method === 'POST') {
                await this.handleSimpleAPIRequest(req, res, pathname);
            } else if (pathname === '/api/tools' && req.method === 'GET') {
                if (!this.tryBeginRequest(res)) {
                    return;
                }
                try {
                    res.writeHead(200);
                    res.end(JSON.stringify({ tools: this.getSimplifiedToolsList() }));
                } finally {
                    this.endRequest(res);
                }
            } else {
                if (!this.tryBeginRequest(res)) {
                    return;
                }
                try {
                    res.writeHead(404);
                    res.end(JSON.stringify({ error: 'Not found' }));
                } finally {
                    this.endRequest(res);
                }
            }
        } catch (error) {
            console.error('HTTP request error:', error);
            if (!res.writableEnded) {
                res.writeHead(500);
                res.end(JSON.stringify({ error: 'Internal server error' }));
            }
        }
    }

    private async handleMCPRequest(req: http.IncomingMessage, res: http.ServerResponse): Promise<void> {
        let bodyResult: { body: string; tooLarge: boolean };
        try {
            bodyResult = await this.readRequestBody(req);
        } catch (error) {
            console.error('Error reading MCP request body:', error);
            if (!res.writableEnded) {
                res.writeHead(400);
                res.end(
                    JSON.stringify({
                        jsonrpc: '2.0',
                        id: null,
                        error: { code: -32700, message: 'Failed to read request body' },
                    })
                );
            }
            return;
        }

        if (!this.tryBeginRequest(res)) {
            return;
        }

        try {
            if (bodyResult.tooLarge) {
                res.writeHead(413);
                res.end(JSON.stringify({ error: 'Request body too large' }));
                return;
            }

            let message;
            try {
                message = JSON.parse(bodyResult.body);
            } catch (parseError: any) {
                const fixedBody = this.fixCommonJsonIssues(bodyResult.body);
                try {
                    message = JSON.parse(fixedBody);
                    console.log('[MCPServer] Fixed JSON parsing issue');
                } catch (secondError) {
                    throw new Error(
                        `JSON parsing failed: ${parseError.message}. Original body: ${bodyResult.body.substring(0, 500)}...`
                    );
                }
            }

            const response = await this.handleMessage(message);
            res.writeHead(200);
            res.end(JSON.stringify(response));
        } catch (error: any) {
            console.error('Error handling MCP request:', error);
            res.writeHead(400);
            res.end(
                JSON.stringify({
                    jsonrpc: '2.0',
                    id: null,
                    error: {
                        code: -32700,
                        message: `Parse error: ${error.message}`,
                    },
                })
            );
        } finally {
            this.endRequest(res);
        }
    }

    private async handleMessage(message: any): Promise<any> {
        const { id, method, params } = message;

        try {
            let result: any;

            switch (method) {
                case 'tools/list':
                    result = { tools: this.getAvailableTools() };
                    break;
                case 'tools/call': {
                    const { name, arguments: args } = params;
                    const toolResult = await this.executeToolCall(name, args);
                    result = { content: [{ type: 'text', text: JSON.stringify(toolResult) }] };
                    break;
                }
                case 'initialize':
                    result = {
                        protocolVersion: '2024-11-05',
                        capabilities: {
                            tools: {},
                        },
                        serverInfo: {
                            name: 'cocos-mcp-server',
                            version: PACKAGE_VERSION,
                        },
                    };
                    break;
                default:
                    throw new Error(`Unknown method: ${method}`);
            }

            return {
                jsonrpc: '2.0',
                id,
                result,
            };
        } catch (error: any) {
            return {
                jsonrpc: '2.0',
                id,
                error: {
                    code: -32603,
                    message: error.message,
                },
            };
        }
    }

    private fixCommonJsonIssues(jsonStr: string): string {
        let fixed = jsonStr;

        fixed = fixed
            .replace(/([^\\])\\([^"\\\/bfnrt])/g, '$1\\\\$2')
            .replace(/,(\s*[}\]])/g, '$1')
            .replace(/\n/g, '\\n')
            .replace(/\r/g, '\\r')
            .replace(/\t/g, '\\t');

        return fixed;
    }

    public stop(): void {
        if (this.httpServer) {
            this.httpServer.close();
            this.httpServer = null;
            console.log('[MCPServer] HTTP server stopped');
        }

        this.toolsList = [];
        this.activeConnections = 0;
    }

    public getStatus(): ServerStatus {
        return {
            running: !!this.httpServer,
            port: this.settings.port,
            clients: this.activeConnections,
        };
    }

    private async handleSimpleAPIRequest(
        req: http.IncomingMessage,
        res: http.ServerResponse,
        pathname: string
    ): Promise<void> {
        let bodyResult: { body: string; tooLarge: boolean };
        try {
            bodyResult = await this.readRequestBody(req);
        } catch (error) {
            console.error('Error reading API request body:', error);
            if (!res.writableEnded) {
                res.writeHead(400);
                res.end(JSON.stringify({ error: 'Failed to read request body' }));
            }
            return;
        }

        if (!this.tryBeginRequest(res)) {
            return;
        }

        try {
            if (bodyResult.tooLarge) {
                res.writeHead(413);
                res.end(JSON.stringify({ error: 'Request body too large' }));
                return;
            }

            const pathParts = pathname.split('/').filter((p) => p);
            if (pathParts.length < 3) {
                res.writeHead(400);
                res.end(JSON.stringify({ error: 'Invalid API path. Use /api/{category}/{tool_name}' }));
                return;
            }

            const category = pathParts[1];
            const toolName = pathParts.slice(2).join('_');
            if (!toolName) {
                res.writeHead(400);
                res.end(JSON.stringify({ error: 'Tool name is required in API path' }));
                return;
            }
            const fullToolName = `${category}_${toolName}`;

            let params;
            try {
                params = bodyResult.body ? JSON.parse(bodyResult.body) : {};
            } catch (parseError: any) {
                const fixedBody = this.fixCommonJsonIssues(bodyResult.body);
                try {
                    params = JSON.parse(fixedBody);
                    console.log('[MCPServer] Fixed API JSON parsing issue');
                } catch (secondError: any) {
                    res.writeHead(400);
                    res.end(
                        JSON.stringify({
                            error: 'Invalid JSON in request body',
                            details: parseError.message,
                            receivedBody: bodyResult.body.substring(0, 200),
                        })
                    );
                    return;
                }
            }

            const result = await this.executeToolCall(fullToolName, params);

            res.writeHead(200);
            res.end(
                JSON.stringify({
                    success: true,
                    tool: fullToolName,
                    result: result,
                })
            );
        } catch (error: any) {
            console.error('Simple API error:', error);
            res.writeHead(500);
            res.end(
                JSON.stringify({
                    success: false,
                    error: error.message,
                    tool: pathname,
                })
            );
        } finally {
            this.endRequest(res);
        }
    }

    private splitToolFullName(fullName: string): { category: string; toolName: string } {
        for (const category of BUILTIN_TOOL_CATEGORIES) {
            const prefix = `${category}_`;
            if (fullName.startsWith(prefix)) {
                return { category, toolName: fullName.slice(prefix.length) };
            }
        }
        const underscore = fullName.indexOf('_');
        if (underscore === -1) {
            return { category: fullName, toolName: '' };
        }
        return {
            category: fullName.slice(0, underscore),
            toolName: fullName.slice(underscore + 1),
        };
    }

    private getSimplifiedToolsList(): any[] {
        return this.toolsList.map((tool) => {
            const { category, toolName } = this.splitToolFullName(tool.name);

            return {
                name: tool.name,
                category: category,
                toolName: toolName,
                description: tool.description,
                apiPath: `/api/${category}/${toolName}`,
                curlExample: this.generateCurlExample(category, toolName, tool.inputSchema),
            };
        });
    }

    private generateCurlExample(category: string, toolName: string, schema: any): string {
        const sampleParams = this.generateSampleParams(schema);
        const jsonString = JSON.stringify(sampleParams, null, 2);

        return `curl -X POST http://127.0.0.1:${this.settings.port}/api/${category}/${toolName} \\
  -H "Content-Type: application/json" \\
  -d '${jsonString}'`;
    }

    private generateSampleParams(schema: any): any {
        if (!schema || !schema.properties) return {};

        const sample: any = {};
        for (const [key, prop] of Object.entries(schema.properties as any)) {
            const propSchema = prop as any;
            switch (propSchema.type) {
                case 'string':
                    sample[key] = propSchema.default || 'example_string';
                    break;
                case 'number':
                    sample[key] = propSchema.default || 42;
                    break;
                case 'boolean':
                    sample[key] = propSchema.default || true;
                    break;
                case 'object':
                    sample[key] = propSchema.default || { x: 0, y: 0, z: 0 };
                    break;
                default:
                    sample[key] = 'example_value';
            }
        }
        return sample;
    }

    public updateSettings(settings: MCPServerSettings) {
        this.settings = settings;
        if (this.httpServer) {
            this.stop();
            this.start();
        }
    }
}
