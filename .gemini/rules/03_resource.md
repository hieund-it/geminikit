# 03_RESOURCE: Context & Token Optimization

## 1. Surgical Reads & Flash Research
- **Flash First**: Use **Gemini Flash** (via `grep_search` or `glob`) to map the codebase before any implementation.
- **Selective Reading**: NEVER read an entire file if you only need a specific function. Use `grep_search` with `context: 5` to identify relevant lines, then `read_file` with `start_line/end_line`.
- **Context Caching Strategy**: Keep system instructions and core rules (`GEMINI.md`) at the top of the prompt. Avoid frequent changes to these files within a session to leverage model-side caching.
- **Incremental Loading**: Start with the minimum required files. Only expand context if the initial data is insufficient.
- **Large-scale Analysis:** In projects >100 files, MUST use `codebase_investigator` for dependency mapping to save tokens and prevent fragmented context.
- Limit: <5 parallel file reads per turn.

## 2. Token Budget & Model Tiering
- **Cost Policy**: 
    - **Flash**: Research, Discovery, Search, Documentation, Linting.
    - **Pro**: Logic Design, implementation, Security Review, Final Verification.
- Agent context: ≤2000 tokens. Skill context: ≤500 tokens.
- Response length: ≤300 lines. If exceeded, you MUST invoke `summarize` before proceeding.
- **No Over-activation:** DO NOT call `activate_skill` if the task can be handled by core instructions or basic tools (`read_file`, `shell`).
- **Skill Execution Protocol:**
  - Timeout: 30 seconds. On timeout: `error.code: "TIMEOUT"`.
  - Registry: Validate skill exists before calling.
  - No Chaining: Skills MUST NOT invoke other skills.

## 3. Checkpointing & Archiving
- `execution.md` is the "Single Source of Truth" for task recovery.
- **Phase Archiving:** Once a task phase is completed, move detailed logs to `long-term.md` and keep only a one-line summary in `execution.md` to prevent context bloat.
- **Memory Rotation (NEW):**
  - **Threshold:** If `.gemini/memory/execution.md` exceeds 5000 tokens (approx. 20KB), move the oldest 50% of the content to `.gemini/memory/archive/execution_{date}.log`.
  - **Exemption:** `.gemini/memory/pinned.md` is EXEMPT from all rotation, archiving, or summarization policies. It MUST remain intact.
  - **Long-term Cleanup:** Periodically (e.g., every 50 interaction turns), the Orchestrator MUST review `long-term.md` and archive entries older than 3 months into `.gemini/memory/archive/milestones.md`.
- **Garbage Collection (NEW):** Automatically delete temporary files (e.g., `.lock`, `.tmp`, `temp_mcp_manifest.json`) if they persist for more than 1 hour after creation.
- Write results to `execution.md` IMMEDIATELY after each sub-task completion.
- When cleaning context, preserve `execution.md` to rebuild the current state.

## 4. MCP Integration (Python Bridge)
- **Tool Discovery:** If external data/tools are required, Agent MUST run `python .gemini/scripts/mcp_bridge.py`.
- **Manifest Usage:** After discovery, Agent MUST read `.gemini/temp_mcp_manifest.json` to identify available tools.
- **Naming Convention:** Call tools using the `{server_name}_{tool_name}` format.
- **Constraint:** DO NOT attempt to call MCP tools without first running the discovery script.

## 5. Context Overflow Prevention
- **Automatic Session Export:** Before executing a tool, if the total session token count exceeds 80% of the model's maximum limit, the Orchestrator MUST NOT execute the requested tool. Instead, it MUST automatically invoke the `/gk-export-session` command to provide the user with a portable session summary. This prevents context overflow errors and allows the user to seamlessly continue in a new session.

