# Commands Reference

This guide details the AI-driven commands available in Gemini Kit to interact with agents and skills. For command-line operations like `gk init` and `gk list`, please refer to the main [README](https://github.com/hieund-it/geminikit/blob/main/README.md).

## General Syntax
```bash
/gk-<command> [--mode <value>] [arguments]
```
The Orchestrator parses these commands and routes them to the appropriate agent and skill.

## Available Commands

| Command | Agent | Description |
|---------|-------|-------------|
| `/gk-analyze` | `reviewer` | Analyze code/system structure for complexity, dependencies, and risks. |
| `/gk-ask` | `(self)` | Ask technical and general questions with grounded context. |
| `/gk-brainstorm` | `researcher` | Brainstorm software solutions and architectural options. |
| `/gk-compare-logic` | `comparator` | Compare business logic between legacy and new systems. |
| `/gk-create` | `developer` | Generate new skill and agent files from templates. |
| `/gk-debug` | `developer` | Identify the root cause of a software error. |
| `/gk-design` | `designer` | Generate or review UI specifications. |
| `/gk-fix-bug` | `developer` | Automatically find and fix bugs from error logs. |
| `/gk-mcp-manager` | `mcp-manager` | Manage MCP server configurations. |
| `/gk-onboard` | `researcher` | Quickly grasp a new project's architecture and workflow. |
| `/gk-plan` | `planner` | Break down a complex task into an executable plan. |
| `/gk-review` | `reviewer` | Perform a comprehensive review of code quality, security, and performance. |

## Agent-Only Skills
These are internal capabilities automatically invoked by the system or specific agents, and are not typically called directly by the user:

- **`gk-document`**: Invoked by the `documenter` to generate documentation.
- **`gk-git`**: Invoked by the `developer` to execute git operations.
- **`gk-research`**: Invoked by the `planner` to gather technical information.
- **`gk-sql`**: Invoked by the `developer` to optimize a SQL query.
- **`gk-summarize`**: Invoked by the `orchestrator` to compress context.
