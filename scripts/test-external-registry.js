#!/usr/bin/env node
/**
 * Unit tests for ExternalToolRegistry (no Cocos Editor required).
 */
const assert = require('assert');
const path = require('path');

const {
    ExternalToolRegistry,
    validateRegisterPayload,
    buildFullToolName,
    resetExternalToolRegistryForTests,
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

function main() {
    console.log('[test-external-registry]');

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

    test('register and list tools', () => {
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

    test('unregister removes tools', () => {
        const registry = new ExternalToolRegistry();
        registry.register({
            providerId: 'temp',
            invokeMessage: 'invoke',
            tools: [{ name: 'one', description: 'One', inputSchema: {} }],
        });
        assert.strictEqual(registry.unregister('temp'), true);
        assert.strictEqual(registry.getMcpToolDefinitions().length, 0);
    });

    test('re-register replaces provider', () => {
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

    test('shared registry reset for tests', () => {
        resetExternalToolRegistryForTests();
        const { getExternalToolRegistry } = require(path.join(__dirname, '../dist/registry/external-tool-registry.js'));
        const registry = getExternalToolRegistry();
        assert.strictEqual(registry.listProviders().length, 0);
    });

    console.log(`\n[test-external-registry] ${passed} passed, ${failed} failed`);
    process.exit(failed > 0 ? 1 : 0);
}

main();
