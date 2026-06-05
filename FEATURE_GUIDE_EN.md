# Cocos Creator MCP Server Feature Guide

## Overview

The Cocos Creator MCP Server is a comprehensive Model Context Protocol (MCP) server plugin designed for Cocos Creator 3.8+, enabling AI assistants to interact with the Cocos Creator editor through standardized protocols.

This document provides detailed information about all available MCP tools and their usage.

## Tool Categories

The MCP server provides **157 tools** organized into 14 main categories by functionality:

1. [Scene Tools](#1-scene-tools)
2. [Node Tools](#2-node-tools)
3. [Component Management Tools](#3-component-management-tools)
4. [Prefab Tools](#4-prefab-tools)
5. [Project Control Tools](#5-project-control-tools)
6. [Debug Tools](#6-debug-tools)
7. [Preferences Tools](#7-preferences-tools)
8. [Server Tools](#8-server-tools)
9. [Broadcast Tools](#9-broadcast-tools)
10. [Scene Advanced Tools](#10-scene-advanced-tools)
11. [Scene View Tools](#11-scene-view-tools)
12. [Reference Image Tools](#12-reference-image-tools)
13. [Asset Advanced Tools](#13-asset-advanced-tools)
14. [Validation Tools](#14-validation-tools)

---

## 1. Scene Tools

### 1.1 scene_get_current_scene
Get current scene information

**Parameters**: None

**Returns**: Current scene name, UUID, type, active status, and node count

**Example**:
```json
{
  "tool": "scene_get_current_scene",
  "arguments": {}
}
```

### 1.2 scene_get_scene_list
Get all scenes in the project

**Parameters**: None

**Returns**: List of all scenes in the project, including names, paths, and UUIDs

**Example**:
```json
{
  "tool": "scene_get_scene_list",
  "arguments": {}
}
```

### 1.3 scene_open_scene
Open a scene by path

**Parameters**:
- `scenePath` (string, required): Scene file path

**Example**:
```json
{
  "tool": "scene_open_scene",
  "arguments": {
    "scenePath": "db://assets/scenes/GameScene.scene"
  }
}
```

### 1.4 scene_save_scene
Save current scene

**Parameters**: None

**Example**:
```json
{
  "tool": "scene_save_scene",
  "arguments": {}
}
```

### 1.5 scene_create_scene
Create a new scene asset

**Parameters**:
- `sceneName` (string, required): Name of the new scene
- `savePath` (string, required): Path to save the scene

**Example**:
```json
{
  "tool": "scene_create_scene",
  "arguments": {
    "sceneName": "NewLevel",
    "savePath": "db://assets/scenes/NewLevel.scene"
  }
}
```

### 1.6 scene_save_scene_as
Save scene as a new file

**Parameters**:
- `path` (string, required): Path to save the scene

**Example**:
```json
{
  "tool": "scene_save_scene_as",
  "arguments": {
    "path": "db://assets/scenes/GameScene_Copy.scene"
  }
}
```

### 1.7 scene_close_scene
Close current scene

**Parameters**: None

**Example**:
```json
{
  "tool": "scene_close_scene",
  "arguments": {}
}
```

### 1.8 scene_get_scene_hierarchy
Get the complete hierarchy of current scene

**Parameters**:
- `includeComponents` (boolean, optional): Whether to include component information, defaults to false

**Example**:
```json
{
  "tool": "scene_get_scene_hierarchy",
  "arguments": {
    "includeComponents": true
  }
}
```

---

## 2. Node Tools

### 2.1 node_create_node
Create a new node in the scene

**Parameters**:
- `name` (string, required): Node name
- `parentUuid` (string, **strongly recommended**): Parent node UUID. **Important**: It is strongly recommended to always provide this parameter. Use `get_current_scene` or `get_all_nodes` to find parent node UUIDs. If not provided, the node will be created at the scene root.
- `nodeType` (string, optional): Node type, options: `Node`, `2DNode`, `3DNode`, defaults to `Node`
- `siblingIndex` (number, optional): Sibling index, -1 means append at end, defaults to -1

**Important Note**: To ensure the node is created at the expected location, always provide the `parentUuid` parameter. You can obtain parent node UUIDs by:
- Using `scene_get_current_scene` to get the scene root node UUID
- Using `node_get_all_nodes` to view all nodes and their UUIDs
- Using `node_find_node_by_name` to find specific node UUIDs

**Example**:
```json
{
  "tool": "node_create_node",
  "arguments": {
    "name": "PlayerNode",
    "nodeType": "2DNode",
    "parentUuid": "parent-uuid-here"
  }
}
```

### 2.2 node_get_node_info
Get node information by UUID

**Parameters**:
- `uuid` (string, required): Node UUID

**Example**:
```json
{
  "tool": "node_get_node_info",
  "arguments": {
    "uuid": "node-uuid-here"
  }
}
```

### 2.3 node_find_nodes
Find nodes by name pattern

**Parameters**:
- `pattern` (string, required): Name pattern to search
- `exactMatch` (boolean, optional): Whether to match exactly, defaults to false

**Example**:
```json
{
  "tool": "node_find_nodes",
  "arguments": {
    "pattern": "Enemy",
    "exactMatch": false
  }
}
```

### 2.4 node_find_node_by_name
Find the first node by exact name

**Parameters**:
- `name` (string, required): Node name to find

**Example**:
```json
{
  "tool": "node_find_node_by_name",
  "arguments": {
    "name": "Player"
  }
}
```

### 2.5 node_get_all_nodes
Get all nodes in the scene with their UUIDs

**Parameters**: None

**Example**:
```json
{
  "tool": "node_get_all_nodes",
  "arguments": {}
}
```

### 2.6 node_set_node_property
Set node property value

**Parameters**:
- `uuid` (string, required): Node UUID
- `property` (string, required): Property name (e.g., position, rotation, scale, active)
- `value` (any, required): Property value

**Example**:
```json
{
  "tool": "node_set_node_property",
  "arguments": {
    "uuid": "node-uuid-here",
    "property": "position",
    "value": {"x": 100, "y": 200, "z": 0}
  }
}
```

### 2.7 node_delete_node
Delete a node from the scene

**Parameters**:
- `uuid` (string, required): UUID of the node to delete

**Example**:
```json
{
  "tool": "node_delete_node",
  "arguments": {
    "uuid": "node-uuid-here"
  }
}
```

### 2.8 node_move_node
Move a node to a new parent

**Parameters**:
- `nodeUuid` (string, required): UUID of the node to move
- `newParentUuid` (string, required): New parent node UUID
- `siblingIndex` (number, optional): Sibling index in the new parent, defaults to -1

**Example**:
```json
{
  "tool": "node_move_node",
  "arguments": {
    "nodeUuid": "node-uuid-here",
    "newParentUuid": "parent-uuid-here",
    "siblingIndex": 0
  }
}
```

### 2.9 node_duplicate_node
Duplicate a node

**Parameters**:
- `uuid` (string, required): UUID of the node to duplicate
- `includeChildren` (boolean, optional): Whether to include child nodes, defaults to true

**Example**:
```json
{
  "tool": "node_duplicate_node",
  "arguments": {
    "uuid": "node-uuid-here",
    "includeChildren": true
  }
}
```

---

## 3. Component Management Tools

### 3.1 component_add_component
Add a component to a specific node

**Parameters**:
- `nodeUuid` (string, **required**): Target node UUID. **Important**: You must specify the exact node to add the component to. Use `get_all_nodes` or `find_node_by_name` to get the UUID of the desired node.
- `componentType` (string, required): Component type (e.g., cc.Sprite, cc.Label, cc.Button)

**Important Note**: Before adding a component, ensure:
1. First use `node_get_all_nodes` or `node_find_node_by_name` to find the target node's UUID
2. Verify the node exists and the UUID is correct
3. Choose the appropriate component type

**Example**:
```json
{
  "tool": "component_add_component",
  "arguments": {
    "nodeUuid": "node-uuid-here",
    "componentType": "cc.Sprite"
  }
}
```

### 3.2 component_remove_component
Remove a component from a node

**Parameters**:
- `nodeUuid` (string, required): Node UUID
- `componentType` (string, required): Component type to remove

**Example**:
```json
{
  "tool": "component_remove_component",
  "arguments": {
    "nodeUuid": "node-uuid-here",
    "componentType": "cc.Sprite"
  }
}
```

### 3.3 component_get_components
Get all components of a node

**Parameters**:
- `nodeUuid` (string, required): Node UUID

**Example**:
```json
{
  "tool": "component_get_components",
  "arguments": {
    "nodeUuid": "node-uuid-here"
  }
}
```

### 3.4 component_get_component_info
Get specific component information

**Parameters**:
- `nodeUuid` (string, required): Node UUID
- `componentType` (string, required): Component type to get info for

**Example**:
```json
{
  "tool": "component_get_component_info",
  "arguments": {
    "nodeUuid": "node-uuid-here",
    "componentType": "cc.Sprite"
  }
}
```

### 3.5 component_set_component_property
Set component property value

**Parameters**:
- `nodeUuid` (string, required): Node UUID
- `componentType` (string, required): Component type
- `property` (string, required): Property name
- `value` (any, required): Property value

**Example**:
```json
{
  "tool": "component_set_component_property",
  "arguments": {
    "nodeUuid": "node-uuid-here",
    "componentType": "cc.Sprite",
    "property": "spriteFrame",
    "value": "sprite-frame-uuid"
  }
}
```

### 3.6 component_attach_script
Attach a script component to a node

**Parameters**:
- `nodeUuid` (string, required): Node UUID
- `scriptPath` (string, required): Script asset path

**Example**:
```json
{
  "tool": "component_attach_script",
  "arguments": {
    "nodeUuid": "node-uuid-here",
    "scriptPath": "db://assets/scripts/PlayerController.ts"
  }
}
```

### 3.7 component_get_available_components
Get list of available component types

**Parameters**:
- `category` (string, optional): Component category filter, options: `all`, `renderer`, `ui`, `physics`, `animation`, `audio`, defaults to `all`

**Example**:
```json
{
  "tool": "component_get_available_components",
  "arguments": {
    "category": "ui"
  }
}
```

---

## 4. Prefab Tools

**⚠️ Known Issue**: When using standard Cocos Creator API for prefab instantiation, complex prefabs with child nodes may not be properly restored. While prefab creation functionality can correctly save all child node information, the instantiation process through `create-node` with `assetUuid` has limitations that may result in missing child nodes in the instantiated prefab.

### 4.1 prefab_get_prefab_list
Get all prefabs in the project

**Parameters**:
- `folder` (string, optional): Search folder path, defaults to `db://assets`

**Example**:
```json
{
  "tool": "prefab_get_prefab_list",
  "arguments": {
    "folder": "db://assets/prefabs"
  }
}
```

### 4.2 prefab_load_prefab
Load a prefab by path

**Parameters**:
- `prefabPath` (string, required): Prefab asset path

**Example**:
```json
{
  "tool": "prefab_load_prefab",
  "arguments": {
    "prefabPath": "db://assets/prefabs/Enemy.prefab"
  }
}
```

### 4.3 prefab_instantiate_prefab
Instantiate a prefab in the scene

**Parameters**:
- `prefabPath` (string, required): Prefab asset path
- `parentUuid` (string, optional): Parent node UUID
- `position` (object, optional): Initial position with x, y, z properties

**Example**:
```json
{
  "tool": "prefab_instantiate_prefab",
  "arguments": {
    "prefabPath": "db://assets/prefabs/Enemy.prefab",
    "parentUuid": "parent-uuid-here",
    "position": {"x": 100, "y": 200, "z": 0}
  }
}
```

**⚠️ Functionality Limitation**: Complex prefabs with child nodes may not instantiate correctly. Due to Cocos Creator API limitations in the standard `create-node` method using `assetUuid`, only the root node may be created, and child nodes may be lost. This is a known issue with the current implementation.

### 4.4 prefab_create_prefab
Create a prefab from a node

**Parameters**:
- `nodeUuid` (string, required): Source node UUID
- `savePath` (string, required): Path to save the prefab
- `prefabName` (string, required): Prefab name

**Example**:
```json
{
  "tool": "prefab_create_prefab",
  "arguments": {
    "nodeUuid": "node-uuid-here",
    "savePath": "db://assets/prefabs/",
    "prefabName": "MyPrefab"
  }
}
```

### 4.5 prefab_create_prefab_from_node
Create a prefab from a node (alias for create_prefab)

**Parameters**:
- `nodeUuid` (string, required): Source node UUID
- `prefabPath` (string, required): Path to save the prefab

**Example**:
```json
{
  "tool": "prefab_create_prefab_from_node",
  "arguments": {
    "nodeUuid": "node-uuid-here",
    "prefabPath": "db://assets/prefabs/MyPrefab.prefab"
  }
}
```

### 4.6 prefab_update_prefab
Update an existing prefab

**Parameters**:
- `prefabPath` (string, required): Prefab asset path
- `nodeUuid` (string, required): Node UUID containing changes

**Example**:
```json
{
  "tool": "prefab_update_prefab",
  "arguments": {
    "prefabPath": "db://assets/prefabs/Enemy.prefab",
    "nodeUuid": "node-uuid-here"
  }
}
```

### 4.7 prefab_revert_prefab
Revert a prefab instance to its original state

**Parameters**:
- `nodeUuid` (string, required): Prefab instance node UUID

**Example**:
```json
{
  "tool": "prefab_revert_prefab",
  "arguments": {
    "nodeUuid": "prefab-instance-uuid-here"
  }
}
```

### 4.8 prefab_get_prefab_info
Get detailed prefab information

**Parameters**:
- `prefabPath` (string, required): Prefab asset path

**Example**:
```json
{
  "tool": "prefab_get_prefab_info",
  "arguments": {
    "prefabPath": "db://assets/prefabs/Enemy.prefab"
  }
}
```

---

## 5. Project Control Tools

### 5.1 project_run_project
Run the project in preview mode

**Parameters**:
- `platform` (string, optional): Target platform, options: `browser`, `simulator`, `preview`, defaults to `browser`

**Example**:
```json
{
  "tool": "project_run_project",
  "arguments": {
    "platform": "browser"
  }
}
```

### 5.2 project_build_project
Build the project

**Parameters**:
- `platform` (string, required): Build platform, options: `web-mobile`, `web-desktop`, `ios`, `android`, `windows`, `mac`
- `debug` (boolean, optional): Whether to build in debug mode, defaults to true

**Example**:
```json
{
  "tool": "project_build_project",
  "arguments": {
    "platform": "web-mobile",
    "debug": false
  }
}
```

### 5.3 project_get_project_info
Get project information

**Parameters**: None

**Example**:
```json
{
  "tool": "project_get_project_info",
  "arguments": {}
}
```

### 5.4 project_get_project_settings
Get project settings

**Parameters**:
- `category` (string, optional): Settings category, options: `general`, `physics`, `render`, `assets`, defaults to `general`

**Example**:
```json
{
  "tool": "project_get_project_settings",
  "arguments": {
    "category": "physics"
  }
}
```

### 5.5 project_refresh_assets
Refresh the asset database

**Parameters**:
- `folder` (string, optional): Specific folder to refresh

**Example**:
```json
{
  "tool": "project_refresh_assets",
  "arguments": {
    "folder": "db://assets/textures"
  }
}
```

### 5.6 project_import_asset
Import an asset file

**Parameters**:
- `sourcePath` (string, required): Source file path
- `targetFolder` (string, required): Target folder in assets

**Example**:
```json
{
  "tool": "project_import_asset",
  "arguments": {
    "sourcePath": "/path/to/image.png",
    "targetFolder": "db://assets/textures"
  }
}
```

### 5.7 project_get_asset_info
Get asset information

**Parameters**:
- `assetPath` (string, required): Asset path

**Example**:
```json
{
  "tool": "project_get_asset_info",
  "arguments": {
    "assetPath": "db://assets/textures/player.png"
  }
}
```

### 5.8 project_get_assets
Get assets by type

**Parameters**:
- `type` (string, optional): Asset type filter, options: `all`, `scene`, `prefab`, `script`, `texture`, `material`, `mesh`, `audio`, `animation`, defaults to `all`
- `folder` (string, optional): Search folder, defaults to `db://assets`

**Example**:
```json
{
  "tool": "project_get_assets",
  "arguments": {
    "type": "texture",
    "folder": "db://assets/textures"
  }
}
```

### 5.9 project_get_build_settings
Get build settings

**Parameters**: None

**Example**:
```json
{
  "tool": "project_get_build_settings",
  "arguments": {}
}
```

### 5.10 project_open_build_panel
Open the build panel in the editor

**Parameters**: None

**Example**:
```json
{
  "tool": "project_open_build_panel",
  "arguments": {}
}
```

### 5.11 project_check_builder_status
Check if the builder worker process is ready

**Parameters**: None

**Example**:
```json
{
  "tool": "project_check_builder_status",
  "arguments": {}
}
```

### 5.12 project_start_preview_server
Start the preview server

**Parameters**:
- `port` (number, optional): Preview server port, defaults to 7456

**Example**:
```json
{
  "tool": "project_start_preview_server",
  "arguments": {
    "port": 8080
  }
}
```

### 5.13 project_stop_preview_server
Stop the preview server

**Parameters**: None

**Example**:
```json
{
  "tool": "project_stop_preview_server",
  "arguments": {}
}
```

### 5.14 project_create_asset
Create a new asset file or folder

**Parameters**:
- `url` (string, required): Asset URL
- `content` (string, optional): File content, null means create folder
- `overwrite` (boolean, optional): Whether to overwrite existing file, defaults to false

**Example**:
```json
{
  "tool": "project_create_asset",
  "arguments": {
    "url": "db://assets/scripts/NewScript.ts",
    "content": "// New TypeScript script\n",
    "overwrite": false
  }
}
```

### 5.15 project_copy_asset
Copy an asset to another location

**Parameters**:
- `source` (string, required): Source asset URL
- `target` (string, required): Target location URL
- `overwrite` (boolean, optional): Whether to overwrite existing file, defaults to false

**Example**:
```json
{
  "tool": "project_copy_asset",
  "arguments": {
    "source": "db://assets/textures/player.png",
    "target": "db://assets/textures/backup/player.png",
    "overwrite": false
  }
}
```

### 5.16 project_move_asset
Move an asset to another location

**Parameters**:
- `source` (string, required): Source asset URL
- `target` (string, required): Target location URL
- `overwrite` (boolean, optional): Whether to overwrite existing file, defaults to false

**Example**:
```json
{
  "tool": "project_move_asset",
  "arguments": {
    "source": "db://assets/textures/old_player.png",
    "target": "db://assets/textures/player.png",
    "overwrite": true
  }
}
```

### 5.17 project_delete_asset
Delete an asset

**Parameters**:
- `url` (string, required): Asset URL to delete

**Example**:
```json
{
  "tool": "project_delete_asset",
  "arguments": {
    "url": "db://assets/textures/unused.png"
  }
}
```

### 5.18 project_save_asset
Save asset content

**Parameters**:
- `url` (string, required): Asset URL
- `content` (string, required): Asset content

**Example**:
```json
{
  "tool": "project_save_asset",
  "arguments": {
    "url": "db://assets/scripts/GameManager.ts",
    "content": "// Updated script content\n"
  }
}
```

### 5.19 project_reimport_asset
Reimport an asset

**Parameters**:
- `url` (string, required): Asset URL to reimport

**Example**:
```json
{
  "tool": "project_reimport_asset",
  "arguments": {
    "url": "db://assets/textures/player.png"
  }
}
```

### 5.20 project_query_asset_path
Get asset disk path

**Parameters**:
- `url` (string, required): Asset URL

**Example**:
```json
{
  "tool": "project_query_asset_path",
  "arguments": {
    "url": "db://assets/textures/player.png"
  }
}
```

### 5.21 project_query_asset_uuid
Get asset UUID from URL

**Parameters**:
- `url` (string, required): Asset URL

**Example**:
```json
{
  "tool": "project_query_asset_uuid",
  "arguments": {
    "url": "db://assets/textures/player.png"
  }
}
```

### 5.22 project_query_asset_url
Get asset URL from UUID

**Parameters**:
- `uuid` (string, required): Asset UUID

**Example**:
```json
{
  "tool": "project_query_asset_url",
  "arguments": {
    "uuid": "asset-uuid-here"
  }
}
```

---

## 6. Debug Tools

### 6.1 debug_get_console_logs
Get editor console logs

**Parameters**:
- `limit` (number, optional): Number of latest logs to retrieve, defaults to 100
- `filter` (string, optional): Filter logs by type, options: `all`, `log`, `warn`, `error`, `info`, defaults to `all`

**Example**:
```json
{
  "tool": "debug_get_console_logs",
  "arguments": {
    "limit": 50,
    "filter": "error"
  }
}
```

### 6.2 debug_clear_console
Clear the editor console

**Parameters**: None

**Example**:
```json
{
  "tool": "debug_clear_console",
  "arguments": {}
}
```

### 6.3 debug_execute_script
Execute JavaScript code in scene context

**Parameters**:
- `script` (string, required): JavaScript code to execute

**Example**:
```json
{
  "tool": "debug_execute_script",
  "arguments": {
    "script": "console.log('Hello from MCP!');"
  }
}
```

### 6.4 debug_get_node_tree
Get detailed node tree for debugging

**Parameters**:
- `rootUuid` (string, optional): Root node UUID, if not provided uses scene root node
- `maxDepth` (number, optional): Maximum tree depth, defaults to 10

**Example**:
```json
{
  "tool": "debug_get_node_tree",
  "arguments": {
    "rootUuid": "root-node-uuid",
    "maxDepth": 5
  }
}
```

### 6.5 debug_get_performance_stats
Get performance statistics

**Parameters**: None

**Example**:
```json
{
  "tool": "debug_get_performance_stats",
  "arguments": {}
}
```

### 6.6 debug_validate_scene
Validate if the current scene has issues

**Parameters**:
- `checkMissingAssets` (boolean, optional): Check for missing asset references, defaults to true
- `checkPerformance` (boolean, optional): Check for performance issues, defaults to true

**Example**:
```json
{
  "tool": "debug_validate_scene",
  "arguments": {
    "checkMissingAssets": true,
    "checkPerformance": true
  }
}
```

### 6.7 debug_get_editor_info
Get editor and environment information

**Parameters**: None

**Example**:
```json
{
  "tool": "debug_get_editor_info",
  "arguments": {}
}
```

### 6.8 debug_get_project_logs
Get project logs from temp/logs/project.log file

**Parameters**:
- `lines` (number, optional): Number of lines to read from the end of the log file, default is 100, range: 1-10000
- `filterKeyword` (string, optional): Filter logs by specific keyword
- `logLevel` (string, optional): Filter by log level, options: `ERROR`, `WARN`, `INFO`, `DEBUG`, `TRACE`, `ALL`, defaults to `ALL`

**Example**:
```json
{
  "tool": "debug_get_project_logs",
  "arguments": {
    "lines": 200,
    "filterKeyword": "prefab",
    "logLevel": "INFO"
  }
}
```

### 6.9 debug_get_log_file_info
Get project log file information

**Parameters**: None

**Returns**: File size, last modified time, line count, and file path information

**Example**:
```json
{
  "tool": "debug_get_log_file_info",
  "arguments": {}
}
```

### 6.10 debug_search_project_logs
Search for specific patterns or errors in project logs

**Parameters**:
- `pattern` (string, required): Search pattern (supports regex)
- `maxResults` (number, optional): Maximum number of matching results, defaults to 20, range: 1-100
- `contextLines` (number, optional): Number of context lines to show around each match, defaults to 2, range: 0-10

**Example**:
```json
{
  "tool": "debug_search_project_logs",
  "arguments": {
    "pattern": "error|failed|exception",
    "maxResults": 10,
    "contextLines": 3
  }
}
```

---

## 7. Preferences Tools

### 7.1 preferences_get_preferences
Get editor preferences

**Parameters**:
- `key` (string, optional): Specific preference key to get

**Example**:
```json
{
  "tool": "preferences_get_preferences",
  "arguments": {
    "key": "editor.theme"
  }
}
```

### 7.2 preferences_set_preferences
Set editor preferences

**Parameters**:
- `key` (string, required): Preference key to set
- `value` (any, required): Preference value to set

**Example**:
```json
{
  "tool": "preferences_set_preferences",
  "arguments": {
    "key": "editor.theme",
    "value": "dark"
  }
}
```

### 7.3 preferences_get_global_preferences
Get global editor preferences

**Parameters**:
- `key` (string, optional): Global preference key to get

**Example**:
```json
{
  "tool": "preferences_get_global_preferences",
  "arguments": {
    "key": "global.autoSave"
  }
}
```

### 7.4 preferences_set_global_preferences
Set global editor preferences

**Parameters**:
- `key` (string, required): Global preference key to set
- `value` (any, required): Global preference value to set

**Example**:
```json
{
  "tool": "preferences_set_global_preferences",
  "arguments": {
    "key": "global.autoSave",
    "value": true
  }
}
```

### 7.5 preferences_get_recent_projects
Get recently opened projects

**Parameters**: None

**Example**:
```json
{
  "tool": "preferences_get_recent_projects",
  "arguments": {}
}
```

### 7.6 preferences_clear_recent_projects
Clear the list of recently opened projects

**Parameters**: None

**Example**:
```json
{
  "tool": "preferences_clear_recent_projects",
  "arguments": {}
}
```

---

## 8. Server Tools

### 8.1 server_get_server_info
Get server information

**Parameters**: None

**Example**:
```json
{
  "tool": "server_get_server_info",
  "arguments": {}
}
```

### 8.2 server_broadcast_custom_message
Broadcast a custom message

**Parameters**:
- `message` (string, required): Message name
- `data` (any, optional): Message data

**Example**:
```json
{
  "tool": "server_broadcast_custom_message",
  "arguments": {
    "message": "custom_event",
    "data": {"type": "test", "value": 123}
  }
}
```

### 8.3 server_get_editor_version
Get editor version information

**Parameters**: None

**Example**:
```json
{
  "tool": "server_get_editor_version",
  "arguments": {}
}
```

### 8.4 server_get_project_name
Get current project name

**Parameters**: None

**Example**:
```json
{
  "tool": "server_get_project_name",
  "arguments": {}
}
```

### 8.5 server_get_project_path
Get current project path

**Parameters**: None

**Example**:
```json
{
  "tool": "server_get_project_path",
  "arguments": {}
}
```

### 8.6 server_get_project_uuid
Get current project UUID

**Parameters**: None

**Example**:
```json
{
  "tool": "server_get_project_uuid",
  "arguments": {}
}
```

### 8.7 server_restart_editor
Request to restart the editor

**Parameters**: None

**Example**:
```json
{
  "tool": "server_restart_editor",
  "arguments": {}
}
```

### 8.8 server_quit_editor
Request to quit the editor

**Parameters**: None

**Example**:
```json
{
  "tool": "server_quit_editor",
  "arguments": {}
}
```

---

## 9. Broadcast Tools

### 9.1 broadcast_get_broadcast_log
Get recent broadcast message log

**Parameters**:
- `limit` (number, optional): Number of latest messages to return, defaults to 50
- `messageType` (string, optional): Filter by message type

**Example**:
```json
{
  "tool": "broadcast_get_broadcast_log",
  "arguments": {
    "limit": 100,
    "messageType": "scene_change"
  }
}
```

### 9.2 broadcast_listen_broadcast
Start listening for specific broadcast messages

**Parameters**:
- `messageType` (string, required): Message type to listen for

**Example**:
```json
{
  "tool": "broadcast_listen_broadcast",
  "arguments": {
    "messageType": "node_created"
  }
}
```

### 9.3 broadcast_stop_listening
Stop listening for specific broadcast messages

**Parameters**:
- `messageType` (string, required): Message type to stop listening for

**Example**:
```json
{
  "tool": "broadcast_stop_listening",
  "arguments": {
    "messageType": "node_created"
  }
}
```

### 9.4 broadcast_clear_broadcast_log
Clear broadcast message log

**Parameters**: None

**Example**:
```json
{
  "tool": "broadcast_clear_broadcast_log",
  "arguments": {}
}
```

### 9.5 broadcast_get_active_listeners
Get list of active broadcast listeners

**Parameters**: None

**Example**:
```json
{
  "tool": "broadcast_get_active_listeners",
  "arguments": {}
}
```

---

## 10. Scene Advanced Tools

Advanced scene operation tools providing node property reset, array operations, copy-paste, undo recording, and other advanced features.

### 10.1 scene-advanced_reset_node_property
Reset node property to default value

**Parameters**:
- `uuid` (string, required): Node UUID
- `path` (string, required): Property path (e.g., position, rotation, scale)

**Example**:
```json
{
  "tool": "scene-advanced_reset_node_property",
  "arguments": {
    "uuid": "node-uuid-here",
    "path": "position"
  }
}
```

### 10.2 scene-advanced_move_array_element
Move array element position

**Parameters**:
- `uuid` (string, required): Node UUID
- `path` (string, required): Array property path (e.g., __comps__)
- `target` (number, required): Target item original index
- `offset` (number, required): Offset amount (positive or negative)

### 10.3 scene-advanced_remove_array_element
Remove array element

**Parameters**:
- `uuid` (string, required): Node UUID
- `path` (string, required): Array property path
- `target` (number, required): Index of item to remove

### 10.4 scene-advanced_copy_node
Copy node

**Parameters**:
- `uuid` (string, required): UUID of node to copy

### 10.5 scene-advanced_paste_node
Paste node

**Parameters**:
- `parentUuid` (string, optional): Parent node UUID, paste to scene root if not specified

### 10.6 scene-advanced_cut_node
Cut node

**Parameters**:
- `uuid` (string, required): UUID of node to cut

### 10.7 scene-advanced_reset_node_transform
Reset node transform (position, rotation, scale) to default values

**Parameters**:
- `uuid` (string, required): Node UUID

### 10.8 scene-advanced_reset_component
Reset component properties to default values

**Parameters**:
- `uuid` (string, required): Node UUID
- `component` (string, required): Component type name

### 10.9 scene-advanced_restore_prefab
Restore prefab instance

**Parameters**:
- `uuid` (string, required): Prefab instance node UUID

### 10.10 scene-advanced_execute_component_method
Execute component method

**Parameters**:
- `uuid` (string, required): Node UUID
- `component` (string, required): Component type
- `method` (string, required): Method name
- `args` (array, optional): Method arguments array

### 10.11 scene-advanced_execute_scene_script
Execute scene script

**Parameters**:
- `script` (string, required): Script content
- `args` (object, optional): Script arguments

### 10.12 scene-advanced_scene_snapshot
Create scene snapshot

**Parameters**:
- `name` (string, optional): Snapshot name

### 10.13 scene-advanced_scene_snapshot_abort
Abort current scene snapshot operation

**Parameters**: None

### 10.14 scene-advanced_begin_undo_recording
Begin undo recording

**Parameters**:
- `name` (string, optional): Undo operation name

### 10.15 scene-advanced_end_undo_recording
End undo recording

**Parameters**: None

### 10.16 scene-advanced_cancel_undo_recording
Cancel undo recording

**Parameters**: None

### 10.17 scene-advanced_soft_reload_scene
Soft reload scene (without losing editor state)

**Parameters**: None

### 10.18 scene-advanced_query_scene_ready
Query if scene is ready

**Parameters**: None

### 10.19 scene-advanced_query_scene_dirty
Query if scene has been modified

**Parameters**: None

### 10.20 scene-advanced_query_scene_classes
Query available scene classes

**Parameters**: None

### 10.21 scene-advanced_query_scene_components
Query all components in scene

**Parameters**: None

### 10.22 scene-advanced_query_component_has_script
Query if component has script

**Parameters**:
- `component` (string, required): Component type

### 10.23 scene-advanced_query_nodes_by_asset_uuid
Query nodes using specific asset by asset UUID

**Parameters**:
- `assetUuid` (string, required): Asset UUID

---

## 11. Scene View Tools

Scene view control tools providing Gizmo tool switching, view modes, grid display, camera control, and other features.

### 11.1 scene-view_change_gizmo_tool
Change Gizmo tool

**Parameters**:
- `name` (string, required): Tool name, options: position, rotation, scale, rect

### 11.2 scene-view_query_gizmo_tool_name
Query current Gizmo tool name

**Parameters**: None

### 11.3 scene-view_change_gizmo_pivot
Change transform pivot point

**Parameters**:
- `name` (string, required): Pivot point, options: pivot, center

### 11.4 scene-view_query_gizmo_pivot
Query current Gizmo pivot point

**Parameters**: None

### 11.5 scene-view_query_gizmo_view_mode
Query Gizmo view mode

**Parameters**: None

### 11.6 scene-view_change_gizmo_coordinate
Change Gizmo coordinate system

**Parameters**:
- `name` (string, required): Coordinate system, options: local, world

### 11.7 scene-view_query_gizmo_coordinate
Query current Gizmo coordinate system

**Parameters**: None

### 11.8 scene-view_change_view_mode_2d_3d
Switch 2D/3D view mode

**Parameters**:
- `mode` (string, required): View mode, options: 2d, 3d

### 11.9 scene-view_query_view_mode_2d_3d
Query current 2D/3D view mode

**Parameters**: None

### 11.10 scene-view_set_grid_visible
Set grid visibility

**Parameters**:
- `visible` (boolean, required): Whether to show grid

### 11.11 scene-view_query_grid_visible
Query grid visibility

**Parameters**: None

### 11.12 scene-view_set_icon_gizmo_3d
Set 3D icon Gizmo display

**Parameters**:
- `visible` (boolean, required): Whether to show

### 11.13 scene-view_query_icon_gizmo_3d
Query 3D icon Gizmo display status

**Parameters**: None

### 11.14 scene-view_set_icon_gizmo_size
Set icon Gizmo size

**Parameters**:
- `size` (number, required): Icon size

### 11.15 scene-view_query_icon_gizmo_size
Query icon Gizmo size

**Parameters**: None

### 11.16 scene-view_focus_camera_on_nodes
Focus camera on specified nodes

**Parameters**:
- `uuids` (array, required): Array of node UUIDs

### 11.17 scene-view_align_camera_with_view
Align camera with current view

**Parameters**: None

### 11.18 scene-view_align_view_with_node
Align view with node

**Parameters**:
- `uuid` (string, required): Node UUID

### 11.19 scene-view_get_scene_view_status
Get scene view status

**Parameters**: None

### 11.20 scene-view_reset_scene_view
Reset scene view

**Parameters**: None

---

## 12. Reference Image Tools

Reference image management tools for adding, managing, and controlling reference images in scenes.

### 12.1 reference-image_add_reference_image
Add reference image(s) to scene

**Parameters**:
- `paths` (array, required): Array of reference image absolute paths

**Example**:
```json
{
  "tool": "reference-image_add_reference_image",
  "arguments": {
    "paths": ["/path/to/image1.png", "/path/to/image2.png"]
  }
}
```

### 12.2 reference-image_remove_reference_image
Remove reference image(s)

**Parameters**:
- `paths` (array, optional): Array of reference image paths to remove, empty array removes current reference image

### 12.3 reference-image_switch_reference_image
Switch to specified reference image

**Parameters**:
- `path` (string, required): Reference image absolute path
- `sceneUUID` (string, optional): Specific scene UUID

### 12.4 reference-image_set_reference_image_data
Set reference image data

**Parameters**:
- `path` (string, required): Reference image path
- `data` (object, required): Image data (position, scale, opacity, etc.)

### 12.5 reference-image_query_reference_image_config
Query reference image configuration

**Parameters**: None

### 12.6 reference-image_query_current_reference_image
Query current reference image

**Parameters**: None

### 12.7 reference-image_refresh_reference_image
Refresh reference image

**Parameters**: None

### 12.8 reference-image_set_reference_image_position
Set reference image position

**Parameters**:
- `path` (string, required): Reference image path
- `position` (object, required): Position object {x, y, z}

### 12.9 reference-image_set_reference_image_scale
Set reference image scale

**Parameters**:
- `path` (string, required): Reference image path
- `scale` (object, required): Scale object {x, y, z}

### 12.10 reference-image_set_reference_image_opacity
Set reference image opacity

**Parameters**:
- `path` (string, required): Reference image path
- `opacity` (number, required): Opacity value (0-1)

### 12.11 reference-image_list_reference_images
List all reference images

**Parameters**: None

### 12.12 reference-image_clear_all_reference_images
Clear all reference images

**Parameters**: None

---

## 13. Asset Advanced Tools

Advanced asset management tools providing batch import/delete, dependency analysis, asset validation, and other features.

### 13.1 asset-advanced_save_asset_meta
Save asset meta information

**Parameters**:
- `urlOrUUID` (string, required): Asset URL or UUID
- `content` (string, required): Asset meta serialized content string

### 13.2 asset-advanced_generate_available_url
Generate available URL based on input URL

**Parameters**:
- `url` (string, required): Asset URL to generate available URL for

### 13.3 asset-advanced_query_asset_db_ready
Query if asset database is ready

**Parameters**: None

### 13.4 asset-advanced_open_asset_external
Open asset with external program

**Parameters**:
- `urlOrUUID` (string, required): Asset URL or UUID to open

### 13.5 asset-advanced_batch_import_assets
Batch import assets

**Parameters**:
- `sourceDir` (string, required): Source directory path
- `targetDir` (string, required): Target directory path
- `overwrite` (boolean, optional): Whether to overwrite existing assets

### 13.6 asset-advanced_batch_delete_assets
Batch delete assets

**Parameters**:
- `urls` (array, required): Array of asset URLs to delete

### 13.7 asset-advanced_validate_asset_references
Validate asset references

**Parameters**: None

### 13.8 asset-advanced_get_asset_dependencies [Unavailable]
Get asset dependency relationships

**Status**: This tool is currently unavailable, requires additional dependency analysis APIs from Cocos Creator.

**Parameters**:
- `urlOrUUID` (string, required): Asset URL or UUID

### 13.9 asset-advanced_get_unused_assets [Unavailable]
Get unused assets

**Status**: This tool is currently unavailable, requires comprehensive project analysis capabilities.

**Parameters**: None

### 13.10 asset-advanced_compress_textures [Unavailable]
Batch compress textures

**Status**: This tool is currently unavailable, requires image processing capabilities.

**Parameters**:
- `directory` (string, required): Texture asset directory
- `quality` (number, optional): Compression quality (0-1)

### 13.11 asset-advanced_export_asset_manifest [Unavailable]
Export asset manifest

**Status**: This tool is currently unavailable.

**Parameters**: None

---

## 14. Validation Tools

Validation tools for validating JSON parameters, creating safe string values, formatting MCP requests, etc.

### 14.1 validation_validate_json_params
Validate and fix JSON parameters

**Parameters**:
- `jsonString` (string, required): JSON string to validate and fix
- `expectedSchema` (object, optional): Expected parameter schema

**Example**:
```json
{
  "tool": "validation_validate_json_params",
  "arguments": {
    "jsonString": "{\"name\": \"test\"}",
    "expectedSchema": {
      "type": "object",
      "properties": {
        "name": {"type": "string"}
      }
    }
  }
}
```

### 14.2 validation_safe_string_value
Create safe string value

**Parameters**:
- `value` (string, required): Value to convert to safe string

### 14.3 validation_format_mcp_request
Format complete MCP request

**Parameters**:
- `toolName` (string, required): Tool name
- `arguments` (object, required): Tool arguments

---

## Third-Party Tool Registration

This plugin supports third-party extensions to dynamically register additional MCP tools via `Editor.Message`.

### Registration Process

1. Call `Editor.Message.request('cocos-mcp-server', 'mcp-register-tools', { providerId, invokeMessage, tools })` in provider extension's `load`.
2. Handle `{ tool, args }` in the method bound to `invokeMessage` and return `{ success, data?, error? }`.
3. Call `mcp-unregister-tools` on `unload`.

Complete instructions and examples: [MCP_EXTERNAL_TOOL_REGISTRATION.md](./MCP_EXTERNAL_TOOL_REGISTRATION.md), [DEV.md § Third-Party Extension Integration](./DEV.md#third-party-extension-integration), [examples/mcp-provider-demo](./examples/mcp-provider-demo).

---

## Technical Support

If you encounter issues during use, you can:

1. Use `debug_get_console_logs` to view detailed error logs
2. Use `debug_validate_scene` to check if the scene has issues
3. Use `debug_get_editor_info` to get environment information
4. Check the MCP server's running status and logs

---

*This document is based on Cocos Creator MCP Server v1.7.4. See [README Changelog](./README.EN.md#changelog) for updates.*

For third-party extension tool registration (v1.5.0+), see **[MCP_EXTERNAL_TOOL_REGISTRATION.md](./MCP_EXTERNAL_TOOL_REGISTRATION.md)** (step-by-step guide for AI and integrators).

### 2. Common UUID Retrieval Methods

- Use `node_get_all_nodes` to get all node UUIDs
- Use `node_find_node_by_name` to find node UUIDs by name
- Use `scene_get_current_scene` to get scene UUID
- Use `prefab_get_prefab_list` to get prefab information

### 3. Asset Path Format

Cocos Creator uses `db://` prefixed asset URL format:
- Scenes: `db://assets/scenes/GameScene.scene`
- Prefabs: `db://assets/prefabs/Player.prefab`
- Scripts: `db://assets/scripts/GameManager.ts`
- Textures: `db://assets/textures/player.png`

### 4. Error Handling

If a tool call fails, an error message will be returned:

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "error": {
    "code": -32000,
    "message": "Tool execution failed",
    "data": {
      "error": "Detailed error message"
    }
  }
}
```

### 5. Best Practices

1. **Query First, Then Operate**: Before modifying nodes or components, first use query tools to get current state
2. **Use UUIDs**: Prefer using UUIDs over names when referencing nodes and assets
3. **Error Checking**: Always check the return value of tool calls to ensure operations succeed
4. **Asset Management**: Before deleting or moving assets, ensure they are not referenced elsewhere
5. **Performance Considerations**: Avoid frequent tool calls in loops, consider batch operations

---

## Technical Support

If you encounter issues during use, you can:

1. Use `debug_get_console_logs` to view detailed error logs
2. Use `debug_validate_scene` to check if the scene has issues
3. Use `debug_get_editor_info` to get environment information
4. Check the MCP server's running status and logs

---

*This document is based on Cocos Creator MCP Server v1.7.3. See [README Changelog](./README.EN.md#changelog) for updates.*

For third-party extension tool registration (v1.5.0+), see **[MCP_EXTERNAL_TOOL_REGISTRATION.md](./MCP_EXTERNAL_TOOL_REGISTRATION.md)** (step-by-step guide for AI and integrators).