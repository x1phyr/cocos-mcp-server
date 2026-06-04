const fs = require('fs');
const path = require('path');
const { DEFAULT_MCP_PORT } = require('./constants');

const EXTENSION_ROOT = path.join(__dirname, '..');
const EXAMPLE_PATH = path.join(EXTENSION_ROOT, 'local.env.json.example');

function readJsonFile(filePath) {
    if (!fs.existsSync(filePath)) {
        return null;
    }
    try {
        return JSON.parse(fs.readFileSync(filePath, 'utf8'));
    } catch (error) {
        console.warn(`Warning: could not parse ${filePath}: ${error.message}`);
        return null;
    }
}

function getExtensionPackageName() {
    const pkg = readJsonFile(path.join(EXTENSION_ROOT, 'package.json'));
    return (pkg && pkg.name) || 'cocos-mcp-server';
}

function isCocosProjectRoot(dir) {
    if (!dir || !fs.existsSync(dir)) {
        return false;
    }
    return (
        fs.existsSync(path.join(dir, 'assets')) ||
        fs.existsSync(path.join(dir, 'settings')) ||
        fs.existsSync(path.join(dir, 'project.json'))
    );
}

/** extensions/cocos-mcp-server -> project root is two levels up */
function inferCocosProjectFromExtensionLayout() {
    const parentDir = path.basename(path.dirname(EXTENSION_ROOT));
    if (parentDir !== 'extensions') {
        return null;
    }
    const projectRoot = path.resolve(EXTENSION_ROOT, '../..');
    return isCocosProjectRoot(projectRoot) ? projectRoot : null;
}

function collectEnvConfigPaths() {
    const paths = [];
    const seen = new Set();

    function add(p) {
        const resolved = path.resolve(p);
        if (!seen.has(resolved)) {
            seen.add(resolved);
            paths.push(resolved);
        }
    }

    const fromLayout = inferCocosProjectFromExtensionLayout();
    if (fromLayout) {
        add(path.join(fromLayout, 'local.env.json'));
    }
    add(path.join(EXTENSION_ROOT, 'local.env.json'));
    if (path.resolve(process.cwd()) !== path.resolve(EXTENSION_ROOT)) {
        add(path.join(process.cwd(), 'local.env.json'));
    }

    return paths;
}

function mergeEnvConfig(overrides = {}) {
    let config = {};
    for (const envPath of collectEnvConfigPaths()) {
        const partial = readJsonFile(envPath);
        if (partial) {
            config = { ...config, ...partial };
        }
    }
    return { ...config, ...overrides };
}

function resolveCocosProjectPath(config) {
    if (config.cocosProjectPath && typeof config.cocosProjectPath === 'string') {
        return path.resolve(config.cocosProjectPath);
    }
    const fromLayout = inferCocosProjectFromExtensionLayout();
    if (fromLayout) {
        return fromLayout;
    }
    if (isCocosProjectRoot(process.cwd())) {
        return path.resolve(process.cwd());
    }
    return null;
}

function parseCliOverrides(argv = process.argv.slice(2)) {
    const overrides = {};
    for (let i = 0; i < argv.length; i++) {
        const arg = argv[i];
        if ((arg === '--project' || arg === '-p') && argv[i + 1]) {
            overrides.cocosProjectPath = argv[++i];
        } else if (arg.startsWith('--project=')) {
            overrides.cocosProjectPath = arg.slice('--project='.length);
        }
    }
    if (process.env.COCOS_PROJECT_PATH) {
        overrides.cocosProjectPath = process.env.COCOS_PROJECT_PATH;
    }
    return overrides;
}

function loadLocalEnv(cliOverrides) {
    const overrides =
        cliOverrides !== undefined ? cliOverrides : parseCliOverrides();
    const config = mergeEnvConfig(overrides);
    const cocosProjectPath = resolveCocosProjectPath(config);

    if (!cocosProjectPath) {
        console.error('Could not detect Cocos project path.');
        console.error('Use one of:');
        console.error('  - cd extensions/cocos-mcp-server && npm run deploy-mcp');
        console.error('  - Create local.env.json in dev repo (see local.env.json.example)');
        console.error('  - Pass --project /path/to/cocos-project');
        process.exit(1);
    }

    if (!fs.existsSync(cocosProjectPath)) {
        console.error(`Cocos project not found: ${cocosProjectPath}`);
        process.exit(1);
    }

    return {
        cocosProjectPath,
        extensionName: config.extensionName || getExtensionPackageName(),
        port: resolveMcpPort(cocosProjectPath),
        mcpServerName: config.mcpServerName || 'cocos-creator',
    };
}

function resolveMcpPort(cocosProjectPath) {
    const settingsPath = path.join(cocosProjectPath, 'settings', 'mcp-server.json');
    if (!fs.existsSync(settingsPath)) {
        return DEFAULT_MCP_PORT;
    }
    try {
        const settings = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
        if (typeof settings.port === 'number' && settings.port > 0) {
            return settings.port;
        }
    } catch (error) {
        console.warn(`Warning: could not read ${settingsPath}, using default port: ${error.message}`);
    }
    return DEFAULT_MCP_PORT;
}

module.exports = {
    loadLocalEnv,
    parseCliOverrides,
    resolveMcpPort,
    inferCocosProjectFromExtensionLayout,
    EXTENSION_ROOT,
    EXAMPLE_PATH,
    DEFAULT_MCP_PORT,
};
