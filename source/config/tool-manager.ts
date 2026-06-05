import { v4 as uuidv4 } from 'uuid';
import { ToolConfig, ToolConfiguration, ToolManagerSettings, ToolDefinition } from '../types';
import * as fs from 'fs';
import * as path from 'path';

export class ToolManager {
    private settings: ToolManagerSettings;
    private availableTools: ToolConfig[] = [];
    private builtInTools: ToolConfig[] = [];
    private readonly injectedBuiltinConfigs: { category: string; name: string; description: string }[] | null;

    constructor(builtinToolConfigs?: { category: string; name: string; description: string }[]) {
        this.injectedBuiltinConfigs = builtinToolConfigs ?? null;
        this.settings = this.readToolManagerSettings();
        this.initializeAvailableTools();
        
        // 如果没有配置，自动创建一个默认配置
        if (this.settings.configurations.length === 0) {
            console.log('[ToolManager] No configurations found, creating default configuration...');
            this.createConfiguration('默认配置', '自动创建的默认工具配置');
        }
    }

    private getToolManagerSettingsPath(): string {
        return path.join(Editor.Project.path, 'settings', 'tool-manager.json');
    }

    private ensureSettingsDir(): void {
        const settingsDir = path.dirname(this.getToolManagerSettingsPath());
        if (!fs.existsSync(settingsDir)) {
            fs.mkdirSync(settingsDir, { recursive: true });
        }
    }

    private readToolManagerSettings(): ToolManagerSettings {
        const DEFAULT_TOOL_MANAGER_SETTINGS: ToolManagerSettings = {
            configurations: [],
            currentConfigId: '',
            maxConfigSlots: 5
        };

        try {
            this.ensureSettingsDir();
            const settingsFile = this.getToolManagerSettingsPath();
            if (fs.existsSync(settingsFile)) {
                const content = fs.readFileSync(settingsFile, 'utf8');
                return { ...DEFAULT_TOOL_MANAGER_SETTINGS, ...JSON.parse(content) };
            }
        } catch (e) {
            console.error('Failed to read tool manager settings:', e);
        }
        return DEFAULT_TOOL_MANAGER_SETTINGS;
    }

    private saveToolManagerSettings(settings: ToolManagerSettings): void {
        try {
            this.ensureSettingsDir();
            const settingsFile = this.getToolManagerSettingsPath();
            fs.writeFileSync(settingsFile, JSON.stringify(settings, null, 2));
        } catch (e) {
            console.error('Failed to save tool manager settings:', e);
            throw e;
        }
    }

    private exportToolConfiguration(config: ToolConfiguration): string {
        return JSON.stringify(config, null, 2);
    }

    private importToolConfiguration(configJson: string): ToolConfiguration {
        try {
            const config = JSON.parse(configJson);
            // 验证配置格式
            if (!config.id || !config.name || !Array.isArray(config.tools)) {
                throw new Error('Invalid configuration format');
            }
            return config;
        } catch (e) {
            console.error('Failed to parse tool configuration:', e);
            throw new Error('Invalid JSON format or configuration structure');
        }
    }

    private initializeAvailableTools(): void {
        if (this.injectedBuiltinConfigs && this.injectedBuiltinConfigs.length > 0) {
            this.availableTools = this.injectedBuiltinConfigs.map((config) => ({
                category: config.category,
                name: config.name,
                enabled: true,
                description: config.description,
            }));
            this.builtInTools = this.availableTools.map((tool) => ({ ...tool }));
            console.log(`[ToolManager] Initialized ${this.availableTools.length} tools from Capability Bridge`);
            return;
        }

        console.warn(
            '[ToolManager] No builtin configs injected from Capability Bridge; built-in tool list is empty'
        );
        this.availableTools = [];
        this.builtInTools = [];
    }

    /**
     * Merge built-in tools from registry into configurations (e.g. after extension upgrade).
     */
    public syncBuiltinToolsFromRegistry(
        builtinConfigs: { category: string; name: string; description: string }[]
    ): void {
        const toolKey = (c: { category: string; name: string }) => `${c.category}\0${c.name}`;
        const previousBuiltinKeys = new Set(this.builtInTools.map(toolKey));
        const enabledByKey = new Map<string, boolean>();

        for (const config of this.settings.configurations) {
            for (const tool of config.tools) {
                if (previousBuiltinKeys.has(toolKey(tool))) {
                    enabledByKey.set(toolKey(tool), tool.enabled);
                }
            }
        }

        this.builtInTools = builtinConfigs.map((config) => ({
            category: config.category,
            name: config.name,
            enabled: enabledByKey.get(toolKey(config)) ?? true,
            description: config.description,
        }));

        const builtinKeySet = new Set(builtinConfigs.map(toolKey));
        const externalTools = this.availableTools.filter((tool) => !previousBuiltinKeys.has(toolKey(tool)));

        this.availableTools = [...this.builtInTools, ...externalTools];

        for (const config of this.settings.configurations) {
            config.tools = config.tools.filter((tool) => {
                if (builtinKeySet.has(toolKey(tool))) {
                    return true;
                }
                return !previousBuiltinKeys.has(toolKey(tool));
            });

            for (const builtin of this.builtInTools) {
                if (!config.tools.some((t) => t.category === builtin.category && t.name === builtin.name)) {
                    config.tools.push({ ...builtin });
                }
            }
            config.updatedAt = new Date().toISOString();
        }

        this.saveSettings();
        console.log(
            `[ToolManager] Synced ${this.builtInTools.length} built-in tool(s), ${this.availableTools.length} total available`
        );
    }

    /**
     * Merge external MCP tools from registry into availableTools and active configuration.
     */
    public syncExternalToolsFromRegistry(
        externalConfigs: { category: string; name: string; description: string }[]
    ): void {
        const externalTools: ToolConfig[] = externalConfigs.map((config) => ({
            category: config.category,
            name: config.name,
            enabled: true,
            description: config.description,
        }));

        this.availableTools = [...this.builtInTools, ...externalTools];

        const externalKey = (c: { category: string; name: string }) => `${c.category}\0${c.name}`;
        const externalKeySet = new Set(externalConfigs.map(externalKey));

        for (const config of this.settings.configurations) {
            config.tools = config.tools.filter((tool) => {
                const isBuiltin = this.builtInTools.some(
                    (b) => b.category === tool.category && b.name === tool.name
                );
                if (isBuiltin) {
                    return true;
                }
                return externalKeySet.has(externalKey(tool));
            });

            for (const ext of externalTools) {
                if (!config.tools.some((t) => t.category === ext.category && t.name === ext.name)) {
                    config.tools.push({ ...ext });
                }
            }
            config.updatedAt = new Date().toISOString();
        }

        this.saveSettings();
        console.log(
            `[ToolManager] Synced ${externalTools.length} external tool(s), ${this.availableTools.length} total available`
        );
    }

    public getAvailableTools(): ToolConfig[] {
        return [...this.availableTools];
    }

    public getConfigurations(): ToolConfiguration[] {
        return [...this.settings.configurations];
    }

    public getCurrentConfiguration(): ToolConfiguration | null {
        if (!this.settings.currentConfigId) {
            return null;
        }
        return this.settings.configurations.find(config => config.id === this.settings.currentConfigId) || null;
    }

    public createConfiguration(name: string, description?: string): ToolConfiguration {
        if (this.settings.configurations.length >= this.settings.maxConfigSlots) {
            throw new Error(`已达到最大配置槽位数量 (${this.settings.maxConfigSlots})`);
        }

        const config: ToolConfiguration = {
            id: uuidv4(),
            name,
            description,
            tools: this.availableTools.map(tool => ({ ...tool })),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        this.settings.configurations.push(config);
        this.settings.currentConfigId = config.id;
        this.saveSettings();

        return config;
    }

    public updateConfiguration(configId: string, updates: Partial<ToolConfiguration>): ToolConfiguration {
        const configIndex = this.settings.configurations.findIndex(config => config.id === configId);
        if (configIndex === -1) {
            throw new Error('配置不存在');
        }

        const config = this.settings.configurations[configIndex];
        const updatedConfig: ToolConfiguration = {
            ...config,
            ...updates,
            updatedAt: new Date().toISOString()
        };

        this.settings.configurations[configIndex] = updatedConfig;
        this.saveSettings();

        return updatedConfig;
    }

    public deleteConfiguration(configId: string): void {
        const configIndex = this.settings.configurations.findIndex(config => config.id === configId);
        if (configIndex === -1) {
            throw new Error('配置不存在');
        }

        this.settings.configurations.splice(configIndex, 1);
        
        // 如果删除的是当前配置，清空当前配置ID
        if (this.settings.currentConfigId === configId) {
            this.settings.currentConfigId = this.settings.configurations.length > 0 
                ? this.settings.configurations[0].id 
                : '';
        }

        this.saveSettings();
    }

    public setCurrentConfiguration(configId: string): void {
        const config = this.settings.configurations.find(config => config.id === configId);
        if (!config) {
            throw new Error('配置不存在');
        }

        this.settings.currentConfigId = configId;
        this.saveSettings();
    }

    public updateToolStatus(configId: string, category: string, toolName: string, enabled: boolean): void {
        console.log(`Backend: Updating tool status - configId: ${configId}, category: ${category}, toolName: ${toolName}, enabled: ${enabled}`);
        
        const config = this.settings.configurations.find(config => config.id === configId);
        if (!config) {
            console.error(`Backend: Config not found with ID: ${configId}`);
            throw new Error('配置不存在');
        }

        console.log(`Backend: Found config: ${config.name}`);

        const tool = config.tools.find(t => t.category === category && t.name === toolName);
        if (!tool) {
            console.error(`Backend: Tool not found - category: ${category}, name: ${toolName}`);
            throw new Error('工具不存在');
        }

        console.log(`Backend: Found tool: ${tool.name}, current enabled: ${tool.enabled}, new enabled: ${enabled}`);
        
        tool.enabled = enabled;
        config.updatedAt = new Date().toISOString();
        
        console.log(`Backend: Tool updated, saving settings...`);
        this.saveSettings();
        console.log(`Backend: Settings saved successfully`);
    }

    public updateToolStatusBatch(configId: string, updates: { category: string; name: string; enabled: boolean }[]): void {
        console.log(`Backend: updateToolStatusBatch called with configId: ${configId}`);
        console.log(`Backend: Current configurations count: ${this.settings.configurations.length}`);
        console.log(`Backend: Current config IDs:`, this.settings.configurations.map(c => c.id));
        
        const config = this.settings.configurations.find(config => config.id === configId);
        if (!config) {
            console.error(`Backend: Config not found with ID: ${configId}`);
            console.error(`Backend: Available config IDs:`, this.settings.configurations.map(c => c.id));
            throw new Error('配置不存在');
        }

        console.log(`Backend: Found config: ${config.name}, updating ${updates.length} tools`);

        const missing: string[] = [];

        updates.forEach(update => {
            const tool = config.tools.find(t => t.category === update.category && t.name === update.name);
            if (tool) {
                tool.enabled = update.enabled;
            } else {
                missing.push(`${update.category}.${update.name}`);
            }
        });

        if (missing.length > 0) {
            throw new Error(`工具不存在: ${missing.join(', ')}`);
        }

        config.updatedAt = new Date().toISOString();
        this.saveSettings();
        console.log(`Backend: Batch update completed successfully`);
    }

    public exportConfiguration(configId: string): string {
        const config = this.settings.configurations.find(config => config.id === configId);
        if (!config) {
            throw new Error('配置不存在');
        }

        return this.exportToolConfiguration(config);
    }

    public importConfiguration(configJson: string): ToolConfiguration {
        const config = this.importToolConfiguration(configJson);

        const knownKeys = new Set(
            this.availableTools.map((tool) => `${tool.category}\0${tool.name}`)
        );
        config.tools = config.tools.filter((tool) => {
            const key = `${tool.category}\0${tool.name}`;
            return knownKeys.has(key);
        });

        if (config.tools.length === 0) {
            throw new Error('导入的配置不包含任何已知工具');
        }
        
        // 生成新的ID和时间戳
        config.id = uuidv4();
        config.createdAt = new Date().toISOString();
        config.updatedAt = new Date().toISOString();

        if (this.settings.configurations.length >= this.settings.maxConfigSlots) {
            throw new Error(`已达到最大配置槽位数量 (${this.settings.maxConfigSlots})`);
        }

        this.settings.configurations.push(config);
        this.saveSettings();

        return config;
    }

    public getEnabledTools(): ToolConfig[] {
        const currentConfig = this.getCurrentConfiguration();
        if (!currentConfig) {
            return this.availableTools.filter(tool => tool.enabled);
        }
        return currentConfig.tools.filter(tool => tool.enabled);
    }

    public getToolManagerState() {
        const currentConfig = this.getCurrentConfiguration();
        return {
            success: true,
            currentConfiguration: currentConfig,
            availableTools: currentConfig ? currentConfig.tools : this.getAvailableTools(),
            selectedConfigId: this.settings.currentConfigId,
            configurations: this.getConfigurations(),
            maxConfigSlots: this.settings.maxConfigSlots
        };
    }

    private saveSettings(): void {
        console.log(`Backend: Saving settings, current configs count: ${this.settings.configurations.length}`);
        this.saveToolManagerSettings(this.settings);
        console.log(`Backend: Settings saved to file`);
    }
} 