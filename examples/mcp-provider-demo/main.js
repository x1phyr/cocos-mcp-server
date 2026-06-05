/**
 * Demo: register MCP tools with cocos-mcp-server (v1.5+ API, v1.7+ Bridge).
 * Registers via mcp-register-tools → CapabilityManager → in-memory ToolRegistry.
 * Copy this folder to <cocos-project>/extensions/mcp-provider-demo and enable in Creator.
 */

const MCP_SERVER_EXTENSION = 'cocos-mcp-server';

exports.methods = {
    async invokeMcpTool(payload) {
        const tool = payload && payload.tool;
        const args = (payload && payload.args) || {};
        if (tool === 'hello') {
            return {
                success: true,
                data: { message: `hello ${args.name || 'world'}` },
            };
        }
        return { success: false, error: `Unknown tool: ${tool}` };
    },
};

exports.load = function () {
    Editor.Message.request(MCP_SERVER_EXTENSION, 'mcp-register-tools', {
        providerId: 'mcp-provider-demo',
        invokeMessage: 'demo-mcp-invoke',
        tools: [
            {
                name: 'hello',
                description: 'Returns a greeting (demo external MCP tool)',
                inputSchema: {
                    type: 'object',
                    properties: {
                        name: { type: 'string', description: 'Name to greet' },
                    },
                },
            },
        ],
    }).then((result) => {
        if (result && result.success) {
            console.log('[mcp-provider-demo] Registered tools:', result.registeredToolNames);
        } else {
            console.warn('[mcp-provider-demo] Register failed:', result);
        }
    });
};

exports.unload = function () {
    Editor.Message.request(MCP_SERVER_EXTENSION, 'mcp-unregister-tools', {
        providerId: 'mcp-provider-demo',
    });
};
