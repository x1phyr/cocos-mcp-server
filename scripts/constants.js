const { mcpDefaultPort } = require('../package.json');

const DEFAULT_MCP_PORT =
    typeof mcpDefaultPort === 'number' && mcpDefaultPort > 0 ? mcpDefaultPort : 28473;

module.exports = { DEFAULT_MCP_PORT };
