# Hook: pre-tool

## Trigger
`before_tool_call` — fires before every tool invocation.

## Behavior
Blocking. A validation failure halts the tool call and returns an error to the agent.

## Purpose
Validate tool inputs, enforce safety rules, and log the invocation before
execution. Prevents dangerous operations from reaching external systems.

## Actions (in order)

1. **Log invocation** — append to `.gemini/memory/execution.md`:
   ```
   [<timestamp>] TOOL_CALL tool=<tool_name> inputs=<sanitized_inputs>
   ```
2. **Validate input schema** — confirm required fields are present and typed correctly.
   - Missing required field → block with: `InputError: missing field '<field>'`
   - Wrong type → block with: `InputError: '<field>' must be <expected_type>`
3. **Check path safety** — for any input containing a file path:
   - Reject paths with `../` traversal sequences.
   - Reject paths outside the current `working_dir`.
   - Block with: `SecurityError: path escapes working directory`
4. **Check tool allowlist** — verify tool name appears in approved list:
   - Approved: `read_file`, `write_file`, `search`, `db-tool`, `api-tool`, `script-tool`
   - Unknown tool → block with: `PolicyError: tool '<name>' not in allowlist`
5. **Block destructive operations** — pattern-match inputs for danger signals:
   - `rm -rf`, `DROP TABLE`, `DELETE FROM` without `WHERE`, `format`, `mkfs`
   - If detected and no explicit `confirmed: true` flag → block with:
     `SafetyError: destructive operation requires confirmation flag`

## Output
- **Approved:** pass inputs unchanged to tool executor.
- **Blocked:** return structured error `{ approved: false, reason: "<message>" }`.

## Error Handling
Non-critical log failures are swallowed. Validation errors always block.

## Notes
- Sensitive field names (`password`, `token`, `secret`, `key`, `credential`)
  are redacted to `[REDACTED]` in logs before writing.
- Hook overhead target: < 5ms per invocation.
