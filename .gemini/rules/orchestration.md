# Orchestration Rules

Rules for task routing, agent selection, execution patterns, and result aggregation.

## Agent Selection

| Command type           | Primary agent  | Notes                                  |
|------------------------|----------------|----------------------------------------|
| plan / design          | planner        | Decomposes into phase files            |
| implement / build      | developer      | Owns file-level implementation         |
| test / verify          | tester         | Read-only on implementation files      |
| review / audit         | reviewer       | Read-only; produces report only        |
| debug / diagnose       | debugger       | May read logs, run test commands       |
| document / update docs | docs-manager   | Owns `docs/` directory                 |
| research / explore     | researcher     | Read-only; no file writes              |

Select the most specific agent. Default to `developer` only if no other agent fits.

## Task Decomposition

- Maximum 5 subtasks per request. If more are needed, create a phase plan first.
- Each subtask must map to exactly one agent and one skill (or a defined sequence).
- Subtasks must have explicit input/output contracts referencing the schemas.
- Never create a subtask that has no clear completion criterion.

## Execution Patterns

### Sequential (dependent tasks)
Use when task B requires output from task A.
```
task-A → [output] → task-B → [output] → task-C
```
Each agent must complete and report before the next starts.

### Parallel (independent tasks)
Use when tasks share no file ownership and have no data dependency.
```
task-A ──┐
task-B ──┼──→ aggregator
task-C ──┘
```
Verify no file overlap before spawning parallel agents.

### Fan-out (research/gather)
Use for multi-source research where each branch explores a distinct topic.
```
orchestrator → researcher-1 (topic-A)
             → researcher-2 (topic-B)
             → researcher-3 (topic-C)
             → planner (synthesize)
```

## File Ownership

- Each agent in a parallel execution must own distinct file paths.
- Declare ownership as glob patterns in the task description before spawning.
- If two agents need the same file, the orchestrator owns that file and handles merges.
- Ownership conflicts must be escalated immediately — never silently overwrite.

## Conflict Resolution

1. File conflict → stop both agents, escalate to orchestrator.
2. Schema mismatch between agent outputs → orchestrator normalizes before passing downstream.
3. Blocked task → report blockers as `blockedBy` task IDs; do not busy-wait.
4. Failed subtask → orchestrator decides: retry, reassign, or escalate to user.

## Result Aggregation

- Collect all subtask reports conforming to `schemas/report-schema.json`.
- Merge `findings` arrays; deduplicate by content hash (not exact string match).
- Surface all `blockers` to the user before marking a phase complete.
- Final response format: structured summary + findings + next steps. No raw agent dumps.

## Memory Protocol

- Short-term (session): pass outputs directly as `input.context` to next agent.
- Long-term (cross-session): write to `docs/` or plan files; never rely on agent memory.
- Never assume previous session context is available. Always reload from files.
