#!/usr/bin/env node
/**
 * Unit tests for ToolRegistry and CapabilityManager (no Cocos Editor required).
 */
const assert = require('assert');
const path = require('path');

const {
    ToolRegistry,
} = require(path.join(__dirname, '../dist/registry/tool-registry.js'));
const {
    validateRegisterPayload,
    buildFullToolName,
} = require(path.join(__dirname, '../dist/registry/register-types.js'));
const {
    CapabilityManager,
    resetCapabilityManagerForTests,
} = require(path.join(__dirname, '../dist/bridge/capability-manager.js'));
const {
    ExternalToolRegistry,
} = require(path.join(__dirname, '../dist/registry/external-tool-registry.js'));

let passed = 0;
let failed = 0;

function test(name, fn) {
    try {
        fn();
        passed++;
        console.log(`  OK ${name}`);
    } catch (error) {
        failed++;
        console.error(`  FAIL ${name}:`, error.message);
    }
}

async function testAsync(name, fn) {
    try {
        await fn();
        passed++;
        console.log(`  OK ${name}`);
    } catch (error) {
        failed++;
        console.error(`  FAIL ${name}:`, error.message);
    }
}

function createMockPlugin(providerId, namespace, tools, handler) {
    return {
        providerId,
        getTools() {
            return tools.map((t) => ({ ...t, namespace }));
        },
        async callTool(shortName, args) {
            return handler(shortName, args);
        },
    };
}

async function main() {
    console.log('[test-tool-registry]');

    test('rejects invalid providerId', () => {
        const err = validateRegisterPayload({ providerId: '9bad', invokeMessage: 'x', tools: [] });
        assert.ok(err && err.includes('providerId'));
    });

    test('rejects built-in namespace', () => {
        const err = validateRegisterPayload({
            providerId: 'my-ext',
            namespace: 'scene',
            invokeMessage: 'invoke',
            tools: [{ name: 'a', description: 'd', inputSchema: {} }],
        });
        assert.ok(err && err.includes('built-in'));
    });

    test('ToolRegistry sync and invoke', async () => {
        const registry = new ToolRegistry(async (providerId, shortName) => {
            assert.strictEqual(providerId, 'mock-provider');
            assert.strictEqual(shortName, 'ping');
            return { success: true, data: 'pong' };
        });
        const result = registry.syncProvider('mock-provider', 'builtin', 'demo', [
            { shortName: 'ping', description: 'Ping', inputSchema: {} },
        ]);
        assert.strictEqual(result.success, true);
        assert.deepStrictEqual(result.registeredToolNames, ['demo_ping']);
        const defs = registry.getMcpToolDefinitions();
        assert.strictEqual(defs.length, 1);
        assert.strictEqual(defs[0].name, buildFullToolName('demo', 'ping'));
        const invoked = await registry.invoke('demo_ping', {});
        assert.strictEqual(invoked.data, 'pong');
    });

    test('ToolRegistry removeProvider', () => {
        const registry = new ToolRegistry(async () => ({ success: true }));
        registry.syncProvider('temp', 'external', 'temp', [
            { shortName: 'one', description: 'One', inputSchema: {} },
        ]);
        assert.strictEqual(registry.removeProvider('temp'), true);
        assert.strictEqual(registry.getMcpToolDefinitions().length, 0);
    });

    test('CapabilityManager builtin mock plugin', async () => {
        const manager = new CapabilityManager();
        const plugin = createMockPlugin(
            'cocos-builtin-mock',
            'mock',
            [{ name: 'hello', description: 'Hello', inputSchema: {} }],
            (shortName) => ({ success: true, data: shortName })
        );
        const reg = manager.registerPlugin(plugin, 'builtin');
        assert.strictEqual(reg.success, true);
        const defs = manager.getAllMcpDefinitions();
        assert.strictEqual(defs.length, 1);
        assert.strictEqual(defs[0].name, 'mock_hello');
        const result = await manager.invokeByFullName('mock_hello', {});
        assert.strictEqual(result.data, 'hello');
    });

    await testAsync('CapabilityManager external register via ExternalToolRegistry', async () => {
        const registry = new ExternalToolRegistry();
        const result = registry.register({
            providerId: 'demo-tools',
            invokeMessage: 'demo-invoke',
            tools: [
                { name: 'ping', description: 'Ping', inputSchema: { type: 'object', properties: {} } },
            ],
        });
        assert.strictEqual(result.success, true);
        assert.deepStrictEqual(result.registeredToolNames, ['demo-tools_ping']);
        const defs = registry.getMcpToolDefinitions();
        assert.strictEqual(defs.length, 1);
        assert.strictEqual(defs[0].name, buildFullToolName('demo-tools', 'ping'));
    });

    test('ExternalToolRegistry re-register replaces provider', () => {
        const registry = new ExternalToolRegistry();
        registry.register({
            providerId: 'p1',
            invokeMessage: 'invoke',
            tools: [{ name: 'a', description: 'A', inputSchema: {} }],
        });
        registry.register({
            providerId: 'p1',
            invokeMessage: 'invoke',
            tools: [{ name: 'b', description: 'B', inputSchema: {} }],
        });
        const names = registry.getMcpToolDefinitions().map((d) => d.name);
        assert.deepStrictEqual(names, ['p1_b']);
        assert.strictEqual(registry.resolveFullToolName('p1_a'), null);
    });

    test('ToolRegistry partial sync does not leave orphan index entries', () => {
        const registry = new ToolRegistry(async () => ({ success: true }));
        registry.syncProvider('p1', 'builtin', 'demo', [
            { shortName: 'first', description: 'First', inputSchema: {} },
        ]);
        const result = registry.syncProvider('p2', 'external', 'demo', [
            { shortName: 'first', description: 'Dup', inputSchema: {} },
            { shortName: 'second', description: 'Second', inputSchema: {} },
        ]);
        assert.strictEqual(result.success, false);
        const names = registry.getMcpToolDefinitions().map((d) => d.name);
        assert.deepStrictEqual(names, ['demo_first']);
        assert.strictEqual(registry.resolveFullToolName('demo_second'), null);
    });

    test('ToolRegistry invoke returns ToolResponse when tool missing', async () => {
        const registry = new ToolRegistry(async () => ({ success: true }));
        const result = await registry.invoke('missing_tool', {});
        assert.strictEqual(result.success, false);
        assert.ok(result.error && result.error.includes('not found'));
    });

    test('registerExternal failure preserves previous provider', () => {
        const manager = new CapabilityManager();
        const first = manager.registerExternal({
            providerId: 'demo-tools',
            invokeMessage: 'demo-invoke',
            tools: [{ name: 'ping', description: 'Ping', inputSchema: {} }],
        });
        assert.strictEqual(first.success, true);
        manager.registerExternal({
            providerId: 'other-tools',
            namespace: 'demo-tools',
            invokeMessage: 'other-invoke',
            tools: [{ name: 'pong', description: 'Pong', inputSchema: {} }],
        });
        const failed = manager.registerExternal({
            providerId: 'demo-tools',
            invokeMessage: 'demo-invoke',
            tools: [
                { name: 'ping', description: 'Ping', inputSchema: {} },
                { name: 'pong', description: 'Pong', inputSchema: {} },
            ],
        });
        assert.strictEqual(failed.success, false);
        const defs = manager.getExternalMcpToolDefinitions();
        assert.strictEqual(defs.length, 2);
        assert.ok(defs.some((d) => d.name === 'demo-tools_ping'));
        assert.ok(defs.some((d) => d.name === 'demo-tools_pong'));
    });

    test('rejects reserved built-in providerId', () => {
        const err = validateRegisterPayload({
            providerId: 'cocos-builtin-scene',
            invokeMessage: 'invoke',
            tools: [{ name: 'a', description: 'd', inputSchema: {} }],
        });
        assert.ok(err && err.includes('reserved'));
    });

    test('rejects duplicate short names in syncProvider batch', () => {
        const registry = new ToolRegistry(async () => ({ success: true }));
        const result = registry.syncProvider('p1', 'builtin', 'demo', [
            { shortName: 'dup', description: 'One', inputSchema: {} },
            { shortName: 'dup', description: 'Two', inputSchema: {} },
        ]);
        assert.strictEqual(result.success, false);
        assert.ok(result.error && result.error.includes('duplicate'));
    });

    test('registerExternal rejects hijack of builtin providerId', () => {
        const manager = new CapabilityManager();
        manager.registerPlugin(
            createMockPlugin(
                'cocos-builtin-scene',
                'scene',
                [{ name: 'ping', description: 'Ping', inputSchema: {} }],
                () => ({ success: true })
            ),
            'builtin'
        );
        const result = manager.registerExternal({
            providerId: 'cocos-builtin-scene',
            invokeMessage: 'evil',
            tools: [{ name: 'hack', description: 'Hack', inputSchema: {} }],
        });
        assert.strictEqual(result.success, false);
        assert.ok(manager.getAllMcpDefinitions().some((d) => d.name === 'scene_ping'));
    });

    test('collision with existing full name', () => {
        const registry = new ExternalToolRegistry();
        registry.register({
            providerId: 'p1',
            invokeMessage: 'invoke',
            tools: [{ name: 'hello', description: 'H', inputSchema: {} }],
        });
        const result = registry.register({
            providerId: 'p2',
            namespace: 'p1',
            invokeMessage: 'invoke2',
            tools: [{ name: 'hello', description: 'H2', inputSchema: {} }],
        });
        assert.strictEqual(result.success, false);
        assert.ok(result.error && result.error.includes('already registered'));
    });

    test('shared manager reset for tests', () => {
        resetCapabilityManagerForTests();
        const { getCapabilityManager } = require(path.join(__dirname, '../dist/bridge/capability-manager.js'));
        const manager = getCapabilityManager();
        assert.strictEqual(manager.getAllMcpDefinitions().length, 0);
    });

    test('builtin plugins expose expected tool count', () => {
        const { createDefaultCapabilityManager } = require(path.join(
            __dirname,
            '../dist/bridge/builtin-registry.js'
        ));
        const manager = createDefaultCapabilityManager();
        const defs = manager.getAllMcpDefinitions();
        assert.ok(defs.length >= 50, `expected at least 50 builtin tools, got ${defs.length}`);
        const names = new Set(defs.map((d) => d.name));
        assert.strictEqual(names.size, defs.length, 'builtin tool names must be unique');
        assert.ok(defs.some((d) => d.name.startsWith('sceneAdvanced_')), 'sceneAdvanced tools missing');
        assert.ok(defs.some((d) => d.name.startsWith('scene_')), 'scene tools missing');
        const summaries = manager.getProviderSummaries();
        assert.strictEqual(summaries.filter((s) => s.kind === 'builtin').length, 14);
    });

    console.log(`\n[test-tool-registry] ${passed} passed, ${failed} failed`);
    process.exit(failed > 0 ? 1 : 0);
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
