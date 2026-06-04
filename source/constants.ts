import * as fs from 'fs';
import * as path from 'path';

const FALLBACK_MCP_PORT = 28473;

function readMcpDefaultPort(): number {
    try {
        const pkgPath = path.join(__dirname, '../package.json');
        const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8')) as { mcpDefaultPort?: number };
        if (typeof pkg.mcpDefaultPort === 'number' && pkg.mcpDefaultPort > 0) {
            return pkg.mcpDefaultPort;
        }
    } catch {
        // package.json unavailable during some tooling runs
    }
    return FALLBACK_MCP_PORT;
}

/** Default MCP HTTP port (from package.json "mcpDefaultPort"). */
export const DEFAULT_MCP_PORT = readMcpDefaultPort();
