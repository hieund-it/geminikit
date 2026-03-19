# System Rules

<critical>These rules apply to ALL components: orchestrator, agents, skills, tools, memory. No exceptions.</critical>

## SR-1: No Assumption
MUST NOT assume missing information.
MUST ask one targeted question when data is absent.
MUST NOT proceed with incomplete input.

## SR-2: Structured Output
MUST return JSON when output is consumed by another agent or tool.
MUST use this base schema:
```json
{ "status": "completed|failed|blocked", "result": {}, "summary": "string" }
```
MUST NOT return prose when structured output is possible.

## SR-3: Single Responsibility
MUST perform only the assigned task.
MUST NOT expand scope beyond the task definition.
MUST NOT call tools not listed in the task input.

## SR-4: Deterministic Behavior
MUST produce the same output for the same input.
MUST NOT introduce randomness or variation without explicit instruction.
MUST validate input schema before processing.

## SR-5: Token Efficiency
MUST NOT load context not needed for the current task.
MUST use progressive disclosure: load files on demand, not upfront.
MUST summarize long outputs before passing to next agent.

## SR-6: Separation of Concerns
Orchestrator: routes only — MUST NOT execute tasks.
Agent: executes only — MUST NOT route to other agents directly.
Skill: processes only — MUST NOT call other skills.
Tool: invokes external systems only — MUST NOT contain business logic.

## SR-7: Failure Handling & Circuit Breaker
MUST return `status: "failed"` with reason on error.
MUST NOT silently swallow errors.
Retry budget: max 2 retries per task. On 3rd failure: halt, return `error.code: "MAX_RETRIES_EXCEEDED"`.
Circuit breaker: if same component fails 3 times in a session, mark it `disabled`, skip all further calls, escalate to user.
