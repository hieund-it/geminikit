# Hook: post-tool

## Trigger
`after_tool_call` — fires after every tool invocation, whether it succeeded or failed.

## Behavior
Non-blocking. Always runs. Errors in this hook are logged, not raised.

## Purpose
Sanitize tool output before it reaches the agent, update execution memory
with results, and strip any sensitive data that leaked into the response.
**Note:** This hook is automatically enforced by `.gemini/hooks/post-tool-handler.js`.

## Actions (in order)

1. **Native Pre-processing (Node.js)** — Before the agent receives the tool output, the CLI invokes `.gemini/hooks/post-tool-handler.js` to perform the following:
   - **Strip sensitive data:** Automatically redact API keys, JWTs, and passwords using RegEx.
   - **Truncate large outputs:** Trim results exceeding 50KB to prevent context overflow.
   - **Update execution memory (Delta-only):** Append a single log line to `.gemini/memory/execution.md` with tool status and duration.
2. **Aggressive Token Pruning (AI-driven)** — After native processing, if the total prompt token count still exceeds 4000 (Rule 03_5 Trigger):
   - Invoke `summarize` skill on the most recent, verbose changes.
   - The generated summary MUST *replace* the original verbose content in the active prompt construction.
3. **Surface sanitized result to agent** — The agent receives the pre-processed and sanitized object.

## Output
Sanitized result object passed back to the calling agent. Execution log updated.

## Redaction Patterns
| Pattern            | Replacement   |
|--------------------|---------------|
| `sk-[A-Za-z0-9]+` | `[REDACTED]`  |
| `AIza[A-Za-z0-9_-]{35}` | `[REDACTED]` |
| `eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+` | `[REDACTED]` |
| `password=.*`      | `password=[REDACTED]` |
| `://user:pass@`    | `://[REDACTED]@` |

## Error Handling
- Log write failure: swallow, continue.
- Redaction failure: pass output unmodified, log warning.
- Truncation failure: pass full output, log warning.

## Notes
- Execution log entries kept for current task only; cleared on task completion.
- Token usage from tool response appended to log when available.
