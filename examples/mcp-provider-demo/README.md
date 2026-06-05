# mcp-provider-demo

最小示例：向 `cocos-mcp-server` 注册外部 MCP 工具。

**完整注册说明（含 AI 工作流、校验规则、模板）** → [MCP_EXTERNAL_TOOL_REGISTRATION.md](../../MCP_EXTERNAL_TOOL_REGISTRATION.md)

## 使用

1. 复制本目录到 `<cocos-project>/extensions/mcp-provider-demo`
2. Creator 中启用 `cocos-mcp-server` 与本扩展
3. 启动 MCP HTTP 服务
4. 调用工具 `mcp-provider-demo_hello`（MCP `tools/call` 或 Simple API）

## 文件

| 文件 | 作用 |
|------|------|
| `package.json` | 声明 `demo-mcp-invoke` → `invokeMcpTool` |
| `main.js` | `load` 注册 / `unload` 注销 / invoke 分发 |
