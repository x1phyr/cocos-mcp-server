const fs = require('fs');
const path = require('path');
const fse = require('fs-extra');
const { loadLocalEnv } = require('./load-local-env');

function mergeJsonMcp(filePath, serverName, serverEntry) {
    let config = { mcpServers: {} };
    if (fs.existsSync(filePath)) {
        try {
            config = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        } catch (error) {
            console.warn(`Warning: could not parse ${filePath}, recreating: ${error.message}`);
        }
    }
    if (!config.mcpServers || typeof config.mcpServers !== 'object') {
        config.mcpServers = {};
    }
    config.mcpServers[serverName] = serverEntry;
    fse.ensureDirSync(path.dirname(filePath));
    fs.writeFileSync(filePath, `${JSON.stringify(config, null, 2)}\n`, 'utf8');
    console.log(`Updated ${filePath}`);
}

function escapeRegExp(value) {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/** TOML table keys with hyphens must be quoted: cocos-creator -> [mcp_servers."cocos-creator"] */
function codexSectionHeader(serverName) {
    if (/^[A-Za-z_][A-Za-z0-9_]*$/.test(serverName)) {
        return `[mcp_servers.${serverName}]`;
    }
    const quoted = serverName.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
    return `[mcp_servers."${quoted}"]`;
}

function isOurMcpServerHeader(header, serverName) {
    return (
        header === `mcp_servers.${serverName}` ||
        header === `mcp_servers."${serverName}"`
    );
}

function parseTomlSections(content) {
    const preamble = [];
    const sections = [];
    let current = null;

    for (const line of content.split('\n')) {
        const headerMatch = line.match(/^\s*\[([^\]]+)\]\s*$/);
        if (headerMatch) {
            if (current) {
                sections.push(current);
            }
            current = { header: headerMatch[1], lines: [] };
            continue;
        }
        if (current) {
            current.lines.push(line);
        } else if (line.trim()) {
            preamble.push(line);
        }
    }
    if (current) {
        sections.push(current);
    }
    return { preamble, sections };
}

function isMcpFieldLine(line) {
    return /^\s*(url|enabled|startup_timeout_sec|tool_timeout_sec|bearer_token)\s*=/.test(line);
}

function buildCodexServerBlock(serverName, url) {
    const header = codexSectionHeader(serverName);
    return `${header}
enabled = true
url = "${url}"
startup_timeout_sec = 30
tool_timeout_sec = 120
`;
}

function upsertCodexToml(configPath, serverName, url) {
    const raw = fs.existsSync(configPath) ? fs.readFileSync(configPath, 'utf8') : '';
    const { preamble, sections } = parseTomlSections(raw);

    const keptPreamble = preamble.filter(
        (line) =>
            !/^\s*experimental_use_rmcp_client\s*=/.test(line) && !isMcpFieldLine(line),
    );
    const keptSections = sections.filter(
        (section) => !isOurMcpServerHeader(section.header, serverName),
    );

    const parts = ['experimental_use_rmcp_client = true'];
    if (keptPreamble.length > 0) {
        parts.push(keptPreamble.join('\n'));
    }
    for (const section of keptSections) {
        const body = section.lines.join('\n').trimEnd();
        parts.push(body ? `[${section.header}]\n${body}` : `[${section.header}]`);
    }
    parts.push(buildCodexServerBlock(serverName, url).trimEnd());

    const content = `${parts.filter(Boolean).join('\n\n')}\n`;
    fse.ensureDirSync(path.dirname(configPath));
    fs.writeFileSync(configPath, content, 'utf8');
    console.log(`Updated ${configPath}`);
    console.log(
        'Codex: experimental_use_rmcp_client enabled; HTTP MCP uses quoted table name when needed.',
    );
}

async function deployMcp() {
    const env = loadLocalEnv();
    console.log(`Cocos project: ${env.cocosProjectPath}`);

    if (!fs.existsSync(env.cocosProjectPath)) {
        console.error(`Cocos project not found: ${env.cocosProjectPath}`);
        process.exit(1);
    }

    const mcpUrl = `http://127.0.0.1:${env.port}/mcp`;
    const { mcpServerName, cocosProjectPath } = env;

    mergeJsonMcp(path.join(cocosProjectPath, '.cursor', 'mcp.json'), mcpServerName, {
        url: mcpUrl,
    });

    mergeJsonMcp(path.join(cocosProjectPath, '.mcp.json'), mcpServerName, {
        type: 'http',
        url: mcpUrl,
    });

    upsertCodexToml(
        path.join(cocosProjectPath, '.codex', 'config.toml'),
        mcpServerName,
        mcpUrl,
    );

    console.log(`MCP server "${mcpServerName}" -> ${mcpUrl} (port ${env.port})`);
    console.log('Restart Cursor / Claude Code / Codex after changing MCP config.');
}

deployMcp().catch((error) => {
    console.error(error);
    process.exit(1);
});
