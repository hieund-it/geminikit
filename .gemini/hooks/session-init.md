# Hook: session-init

## Trigger
`on_session_start` — fires once when a new Gemini CLI session begins.

## Behavior
Non-blocking. Errors are logged but do not prevent session start.

## Purpose
Initialize the session context: detect project type, set default model and
variables, load short-term memory from previous state if present, and start
the context cascade for downstream agents.

## Actions (in order)

1. **Detect working directory** — resolve absolute path of CWD.
2. **Detect project type** — inspect root files:
   - `package.json` → `node`
   - `pyproject.toml` / `requirements.txt` → `python`
   - `go.mod` → `go`
   - `Cargo.toml` → `rust`
   - Default → `unknown`
3. **Set session variables** — write to `.gemini/memory/short-term.md`:
   ```yaml
   project_name: <dirname of CWD>
   project_type: <detected type>
   model_default: gemini-2.5-pro
   working_dir: <absolute CWD>
   session_start_time: <ISO 8601 timestamp>
   debug_mode: false
   token_budget: 1000000
   ```
4. **Load long-term memory** — scan `.gemini/memory/long-term.md` for entries
   tagged with `project_name` and inject the 5 most recent as context hints.
5. **Log session start** — append entry to `.gemini/memory/execution.md`:
   ```
   [<timestamp>] SESSION_START project=<project_name> type=<project_type>
   ```

## Output
Initialized session context written to `.gemini/memory/short-term.md`.
Long-term context hints surfaced to active agent.

## Error Handling
- If `short-term.md` cannot be written: log warning, continue with in-memory state.
- If `long-term.md` is missing: skip load, create empty file.
- If project type cannot be detected: default to `unknown`, continue.

## Notes
- Runs before any agent or command loads.
- Max session variable entries: 50 (oldest pruned first).
- Session variables cleared automatically on session end.
