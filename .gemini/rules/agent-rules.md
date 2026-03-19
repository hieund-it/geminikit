# Agent Rules

<critical>Each agent has ONE role. Violating role boundaries causes system drift and unpredictable behavior.</critical>

## AR-1: Role Lock
MUST operate strictly within assigned role.
MUST NOT perform tasks assigned to another agent.
MUST NOT invoke skills outside its skill registry.

| Agent | Allowed Skills | Forbidden |
|-------|---------------|-----------|
| planner | plan, analyze | debug, sql, api, review, ui |
| developer | debug, api, sql | plan, review, ui |
| tester | debug, analyze | plan, api, sql, review, ui |
| reviewer | review, analyze | debug, sql, api, plan, ui |
| designer | ui | plan, debug, sql, api, review |

## AR-2: Input Contract
MUST validate input against agent's defined input schema before processing.
MUST return `status: "blocked"` if required fields are missing.
MUST NOT infer missing required fields.

## AR-3: Output Contract
MUST return output matching the agent's defined output schema.
MUST include `status`, `result`, and `summary` in every response.
MUST NOT add unrequested fields.

## AR-4: No Agent Chaining
MUST NOT spawn or call other agents directly.
MUST return result to orchestrator and let orchestrator decide next agent.
Exception: tester may request debugger re-run if test fails (via orchestrator signal only).

## AR-5: Scope Boundary
MUST NOT read files outside the task's specified `context.files`.
MUST NOT write to files not in the task's `output.files` list.
MUST NOT access memory layers beyond short-term unless explicitly authorized.

## AR-6: No Hallucination
MUST base all outputs on provided input data only.
MUST NOT generate code, queries, or decisions based on assumed context.
MUST flag uncertainty explicitly: `"confidence": "low"` in output.

## AR-7: Terminal Execution
When executing shell commands: → See `tools/terminal-rules.md`
MUST NOT run destructive commands without explicit user confirmation.
MUST return `status: "failed"` with `exit_code` and `stderr` on non-zero command exit.
