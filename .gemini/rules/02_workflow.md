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
- **Confirmation Gate:** Upon completion of the Strategy Phase (Planning), the Orchestrator MUST present the plan to the user and **wait for explicit confirmation** (e.g., "Plan approved", "Proceed") before proceeding to the Execution Phase.
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

## 5. Persistence & Documentation
- **5.1 Plan Storage (CRITICAL):** ALL plans generated during Research/Strategy (manually or via `enter_plan_mode`) MUST be persisted to the project's `plans/{date}-{slug}/plan.md` directory immediately. NEVER rely on system temporary (tmp) directories for plan storage. This ensures transparency, traceability, and consistency across sessions.
- **5.2 Memory Updates:** After each completed phase or task, update `.gemini/memory/execution.md` with the current state.
- **5.3 Auto-Persistence (NEW):**
  - **Auto-Sync:** At the end of every interaction turn (before the final response to the user), the Orchestrator MUST automatically synchronize the current session state to `.gemini/memory/`.
  - **Auto-Summarize:** If the current `execution.md` or session context exceeds 2000 tokens, or upon completion of a major Directive, the Orchestrator MUST silently invoke the `summarize` skill to update `long-term.md` and `short-term.md`.
  - **Implicit Export:** Treat the final response as an implicit `export-session` trigger, ensuring all artifacts and decisions are captured in the project's memory folder.

- **5.4 Concurrency & Locking (NEW):**
  - **Lock File:** Before any write operation to `.gemini/memory/`, the Orchestrator MUST check for `.gemini/memory/session.lock`.
  - **Race Prevention:** If a lock exists, retry up to 3 times (500ms intervals). If it persists, log a warning and append to a temporary buffer.
  - **Atomic Writes:** Always release the lock immediately after a successful write operation.

