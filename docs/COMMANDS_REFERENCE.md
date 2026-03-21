# Commands Reference

This guide details the commands available in Gemini Kit to interact with agents and skills.

## General Syntax
```bash
/gk-<command> [--mode <value>] [arguments]
```

## Available Commands

### Analysis & Review
- **/gk-analyze**: Analyze code/system structure.
  - Flags: `--deep`, `--security`, `--perf`
  - Agent: `reviewer`
- **/gk-review**: Comprehensive code review.
  - Flags: `--strict`, `--quick`, `--security`
  - Agent: `reviewer`
- **/gk-compare-logic**: Compare legacy vs. new logic.
  - Agent: `comparator`

### Development & Debugging
- **/gk-debug**: Identify root causes of errors.
  - Flags: `--trace`, `--deep`
  - Agent: `developer`
- **/gk-design**: Generate UI specs or review UI.
  - Flags: `--spec`, `--review`
  - Agent: `designer`
- **/gk-create**: Generate new skills/agents.
  - Flags: `--skill`
  - Agent: `developer`

### Planning & Research
- **/gk-plan**: Break down tasks into plans.
  - Flags: `--fast`, `--deep`, `--parallel`, `--dry-run`
  - Agent: `planner`
- **/gk-brainstorm**: Architectural brainstorming.
  - Agent: `architect`
- **/gk-onboard**: Rapid project onboarding.
  - Flags: `--deep`
  - Agent: `researcher`
- **/gk-ask**: Ask technical questions.
  - Flags: `--deep`, `--quick`
  - Agent: `self`

### Operations & Config
- **/gk-mcp-manager**: Manage MCP servers.
  - Agent: `mcp-manager`

## Agent-Only Commands
These are internal capabilities automatically invoked by the system or specific agents:
- **Git Operations**: `developer` (Commit, PR, Status)
- **Documentation**: `documenter` (Generate/Update docs)
- **SQL Optimization**: `developer`
- **Summarization**: `orchestrator`
