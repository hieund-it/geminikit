---
name: mcp-manager
description: Manage MCP server configuration, test connections, and scaffold new servers. Use this skill to add/edit/remove MCP servers or to troubleshoot connectivity.
---

# MCP Manager

## Overview

This skill provides tools to manage the Model Context Protocol (MCP) configuration in the current workspace. It allows you to:
- List, add, and remove MCP servers in `.gemini/mcp-config.json`.
- Test connections to configured MCP servers to verify they are running and reachable.
- Scaffold new MCP servers using Python.

## Usage

### 1. Manage Configuration

Use the `scripts/manage_mcp_config.py` script to modify the MCP configuration.

**List Servers:**
```bash
python .gemini/skills/mcp-manager/mcp-manager/scripts/manage_mcp_config.py list
```

**Add Server:**
```bash
python .gemini/skills/mcp-manager/mcp-manager/scripts/manage_mcp_config.py add <name> <command> --args "<arg1> <arg2>" --desc "Description"
```
*Note: Pass args as a single string if multiple.*

**Remove Server:**
```bash
python .gemini/skills/mcp-manager/mcp-manager/scripts/manage_mcp_config.py remove <name>
```

### 2. Test Connections

Use the `scripts/test_connection.py` script to verify server connectivity.

**Test All Servers:**
```bash
python .gemini/skills/mcp-manager/mcp-manager/scripts/test_connection.py
```

**Test Specific Server:**
```bash
python .gemini/skills/mcp-manager/mcp-manager/scripts/test_connection.py <server_name>
```

### 3. Scaffold Server

To create a new Python MCP server, copy the template from `assets/server_template_python/server.py` to your desired location.

```bash
cp .gemini/skills/mcp-manager/mcp-manager/assets/server_template_python/server.py <destination>/my_server.py
```

Then add it to the configuration:
```bash
python .gemini/skills/mcp-manager/mcp-manager/scripts/manage_mcp_config.py add my-server python --args "<destination>/my_server.py"
```

## Debugging

If connections fail, check:
1.  **Command Path:** Ensure the command (e.g., `python`, `npx`) is in the system PATH.
2.  **Arguments:** Verify arguments are correct and file paths are absolute or relative to the workspace root.
3.  **Environment Variables:** If the server requires env vars (e.g., API keys), ensure they are set in `.gemini/.env` or passed via `--env`.
