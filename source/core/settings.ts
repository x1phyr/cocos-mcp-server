import * as fs from 'fs';
import { DEFAULT_MCP_PORT } from './constants';
import {
    ensureUserConfigDir,
    getMcpServerSettingsPath,
    getToolManagerSettingsPath,
    migrateLegacyProjectSettingsIfNeeded,
} from './config-path';
import { MCPServerSettings, ToolManagerSettings, ToolConfiguration, ToolConfig } from '../types';

const DEFAULT_SETTINGS: MCPServerSettings = {
    port: DEFAULT_MCP_PORT,
    autoStart: false,
    enableDebugLog: false,
    allowedOrigins: ['*'],
    maxConnections: 10
};

const DEFAULT_TOOL_MANAGER_SETTINGS: ToolManagerSettings = {
    configurations: [],
    currentConfigId: '',
    maxConfigSlots: 5
};

export function readSettings(): MCPServerSettings {
    try {
        migrateLegacyProjectSettingsIfNeeded();
        ensureUserConfigDir();
        const settingsFile = getMcpServerSettingsPath();
        if (fs.existsSync(settingsFile)) {
            const content = fs.readFileSync(settingsFile, 'utf8');
            return { ...DEFAULT_SETTINGS, ...JSON.parse(content) };
        }
    } catch (e) {
        console.error('Failed to read settings:', e);
    }
    return DEFAULT_SETTINGS;
}

export function saveSettings(settings: MCPServerSettings): void {
    try {
        ensureUserConfigDir();
        const settingsFile = getMcpServerSettingsPath();
        fs.writeFileSync(settingsFile, JSON.stringify(settings, null, 2));
    } catch (e) {
        console.error('Failed to save settings:', e);
        throw e;
    }
}

export function validateMcpServerSettings(settings: Partial<MCPServerSettings>): string | null {
    const port = settings.port;
    if (port === undefined || !Number.isInteger(port) || port < 1024 || port > 65535) {
        return '端口必须是 1024–65535 之间的整数';
    }
    const maxConnections = settings.maxConnections;
    if (
        maxConnections !== undefined &&
        (!Number.isInteger(maxConnections) || maxConnections < 1 || maxConnections > 100)
    ) {
        return '最大连接数必须是 1–100 之间的整数';
    }
    return null;
}

export function readToolManagerSettings(): ToolManagerSettings {
    try {
        migrateLegacyProjectSettingsIfNeeded();
        ensureUserConfigDir();
        const settingsFile = getToolManagerSettingsPath();
        if (fs.existsSync(settingsFile)) {
            const content = fs.readFileSync(settingsFile, 'utf8');
            return { ...DEFAULT_TOOL_MANAGER_SETTINGS, ...JSON.parse(content) };
        }
    } catch (e) {
        console.error('Failed to read tool manager settings:', e);
    }
    return DEFAULT_TOOL_MANAGER_SETTINGS;
}

export function saveToolManagerSettings(settings: ToolManagerSettings): void {
    try {
        ensureUserConfigDir();
        const settingsFile = getToolManagerSettingsPath();
        fs.writeFileSync(settingsFile, JSON.stringify(settings, null, 2));
    } catch (e) {
        console.error('Failed to save tool manager settings:', e);
        throw e;
    }
}

export function exportToolConfiguration(config: ToolConfiguration): string {
    return JSON.stringify(config, null, 2);
}

export function importToolConfiguration(configJson: string): ToolConfiguration {
    try {
        const config = JSON.parse(configJson);
        if (!config.id || !config.name || !Array.isArray(config.tools)) {
            throw new Error('Invalid configuration format');
        }
        return config;
    } catch (e) {
        console.error('Failed to parse tool configuration:', e);
        throw new Error('Invalid JSON format or configuration structure');
    }
}

export { DEFAULT_SETTINGS, DEFAULT_TOOL_MANAGER_SETTINGS };
