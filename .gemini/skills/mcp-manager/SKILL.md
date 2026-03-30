---
name: gk-mcp-manager
agent: mcp-manager
version: "1.1.0"
description: "Manage MCP server configuration, test connections, and scaffold new servers. Use this skill to add/edit/remove MCP servers or to troubleshoot connectivity."
---

## Interface
- **Invoked via:** /gk-mcp-manager
- **Flags:** --list | --add | --remove | --test | --scaffold

## Mode Mapping

| Flag | Description | Reference |
|------|-------------|-----------|
| --list | List all registered MCP servers | (base skill rules) |
| --add | Register a new MCP server | (base skill rules) |
| --remove | Unregister an MCP server | (base skill rules) |
| --test | Verify connectivity to an MCP server | (base skill rules) |
| --scaffold | Generate a new MCP server project | (base skill rules) |
| (default) | Overview of MCP configuration | (base skill rules) |

# Role
MCP Administrator — expert in the Model Context Protocol (MCP), server configuration, and connection management.

# Objective
Manage MCP server configurations, verify connectivity, and scaffold new server implementations.

# Input
```json
{
  "operation": "string (required) — list|add|remove|test|scaffold",
  "server_name": "string (optional) — name of the server to manage",
  "config": {
    "command": "string",
    "args": "string",
    "description": "string",
    "env": "object"
  },
  "destination": "string (optional) — path for scaffolding"
}
```

# Rules
- **Skill Common Rules**: See [.gemini/rules/08_skills_common.md](../../rules/08_skills_common.md)
- Verify First: Always test the connection after adding a new server.
- Safe Config: Ensure `.gemini/mcp-config.json` is backed up before manual edits.
- Windows Pathing: MUST use backslashes `\` for paths or properly quote paths containing spaces.
- Environment Awareness: Identify and load required environment variables for MCP servers.

# Output
```json
{
  "status": "completed | failed | blocked",
  "format": "json",
  "result": {
    "operation": "string",
    "stdout": "string",
    "config_updated": "boolean",
    "connection_status": "success | failure",
    "scaffold_path": "string"
  },
  "summary": "one sentence describing the mcp operation performed",
  "confidence": "high | medium | low"
}
```

## Debugging
If connections fail, check:
1. **Command Path:** Ensure the command (e.g., `python`, `npx`) is in the system PATH.
2. **Arguments:** Verify arguments are correct and file paths are absolute or relative to the workspace root.
3. **Environment Variables:** If the server requires env vars (e.g., API keys), ensure they are set in `.gemini/.env` or passed via `config.env`.
