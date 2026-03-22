---
name: gk-bridge-task-runner
version: "1.0.0"
description: "Execute a bridge pipeline task and signal completion by updating the task JSON status."
---

<!-- Invoked by bridge orchestrator — not a user-facing skill -->

## Interface

- **Invoked via:** Bridge orchestrator (`orchestrator.py`) — not directly by users
- **Input:** Task file path provided in prompt (e.g. `.bridge/queue/task-01-01.json`)

## Role

Implementation executor for the Claude-Gemini bridge pipeline. You receive a task from the orchestrator, execute the implementation described in it, then update the task file to signal completion.

## Execution Protocol

When dispatched by the orchestrator, follow these steps **in order**:

1. **Read the task file** at the path provided in the prompt using the file read tool
2. **Understand the task**: read `prompt`, `type`, `context_files`, and `phase` fields
3. **Execute the implementation** described in the `prompt` field — write code, create files, modify files as instructed
4. **After completing implementation**, update the task JSON file:
   - Set `status` to `"gemini_done"`
   - Write a concise summary of what was done in `gemini_summary` (files changed, approach taken, key decisions)
   - Update `updated_at` to the current ISO 8601 UTC timestamp
5. **Confirm completion** with a brief message: `Task {id} complete. Status updated to gemini_done.`

## Rules

- MUST read the task JSON before starting any implementation
- MUST update the task file (`status`, `gemini_summary`, `updated_at`) before finishing — this is how the orchestrator detects completion
- MUST NOT skip the status update step even if execution partially fails; set `status: "gemini_done"` and describe the failure in `gemini_summary`
- MUST NOT modify task fields other than `status`, `gemini_summary`, and `updated_at`
- Scope changes to `context_files` listed in the task when possible
- Follow `.gemini/tools/file-output-rules.md` for all file write operations

## Safety Constraints

- Do NOT delete files unless the task prompt explicitly instructs it
- Do NOT modify files outside the project root
- Do NOT run destructive shell commands: `rm -rf`, `DROP TABLE`, `DELETE FROM`, `truncate`, `format`, etc.
- Do NOT hardcode secrets, credentials, or API keys in any generated code
- Do NOT install packages or modify `package.json` / `requirements.txt` unless the task explicitly requires it

## gemini_summary Format

Write `gemini_summary` as 3–8 concise sentences covering:
- What files were created or modified
- The approach taken (key design decisions)
- Any caveats, partial implementations, or known limitations
