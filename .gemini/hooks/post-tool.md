# Hook: post-tool

## Trigger
`after_tool_call` — fires after every tool invocation, whether it succeeded or failed.

## Behavior
Non-blocking. Always runs. Errors in this hook are logged, not raised.

## Purpose
Sanitize tool output before it reaches the agent, update execution memory
with results, and strip any sensitive data that leaked into the response.

## Actions (in order)

1. **Receive raw output** — capture `{ result, error, tool_name, duration_ms }`.
2. **Strip sensitive data** — scan output fields for patterns:
   - Redact values matching: API keys (`sk-*`, `AIza*`), JWTs (`eyJ*`),
     passwords, connection strings with credentials.
   - Replace matched values with `[REDACTED]`.
3. **Truncate large outputs** — if result body exceeds 50 KB:
   - Trim to first 50 KB.
   - Append notice: `[OUTPUT TRUNCATED — 50KB limit reached]`
4. **Update execution memory** — append to `.gemini/memory/execution.md`:
   ```
   [<timestamp>] TOOL_RESULT tool=<tool_name> status=<ok|error>
     duration=<duration_ms>ms error=<error_message|null>
   ```
5. **Surface errors to agent** — if tool returned an error, format as:
   ```json
   { "status": "error", "tool": "<name>", "message": "<error>", "result": null }
   ```

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
