# 02_WORKFLOW: Orchestration & Execution

## 1. Orchestration Hierarchy
- **Orchestrator:** Routes ONLY; does NOT execute. Decomposes tasks into ≤5 steps.
- **Agents:** Execute assigned tasks; MUST NOT call other Agents directly.
- **Routing:**
  - Simple (1-agent): Direct routing.
  - Complex (Multi-step): Pass through `planner` to generate a roadmap before execution.

## 2. Execution Contract
- MUST follow the workflow: **Research → Strategy → Execution → Validation**.
- **Strategy Phase:**
  1. Determine if the task requires external integrations (DB, API, Repo).
  2. If yes, execute MCP Bridge discovery (`python .gemini/scripts/mcp_bridge.py`).
  3. Incorporate discovered tools from `temp_mcp_manifest.json` into the implementation plan.
- A task is considered complete ONLY after the result has been verified (Validation is the final mandatory step).

## 3. Priority & Conflict Resolution
- Priority order: `blocked_resolution` > `test` > `debug` > `review` > `develop` > `plan`.
- File Conflict: The first agent to claim a file has priority. The second agent MUST wait or redirect.

## 4. Shell & Environment Protocol (Windows/PowerShell)
- **PowerShell Priority:** Since the environment uses `powershell.exe`, Agent MUST use PowerShell-compatible syntax.
- **Command Chaining:** DO NOT use `&&` (Bash/CMD logic). Use `;` (PowerShell separator).
- **Cmdlet Preference:** Prefer official PowerShell Cmdlets (e.g., `Move-Item`, `Copy-Item`, `Remove-Item`) over aliases.
- **Error Handling:** On non-zero exit code, return `status: "failed"`. On timeout (30s), return `error.code: "COMMAND_TIMEOUT"`.
- **Safety Guards:**
  - MUST NOT run destructive commands (rm, format, mkfs) without `confirmed: true`.
  - Hard-blocked patterns: `rm -rf /`, `format C:`, `dd if=`.
- **Output Capture:** Capture stdout and stderr separately; truncate streams at 10KB if exceeded.
- **Path Handling:** Use backslashes `\` for Windows paths or properly quote paths containing spaces.


