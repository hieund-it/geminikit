---
name: conflict-resolution-rules
version: "1.0.0"
description: "Rules for resolving priority conflicts and resource contention between agents."
---

# Conflict Resolution Rules

<critical>Unresolved conflicts cause deadlock. Escalate immediately — do not block silently.</critical>

## PCR-1: Task Priority Order
Priority (highest to lowest): `blocked_resolution` > `test` > `debug` > `review` > `develop` > `plan`.
MUST process higher-priority tasks first when queue has concurrent requests.
MUST NOT preempt an in-progress task — queue the higher-priority task.

## PCR-2: File Ownership Conflict
Two agents MUST NOT write to the same file simultaneously.
MUST grant file ownership to first agent that claims it in execution memory.
Second agent MUST wait or be redirected to a different file by orchestrator.
MUST release file ownership immediately on task completion.

## PCR-3: Memory Write Conflict
If two agents write to the same memory key simultaneously: last-write-wins.
MUST prefix memory keys with agent name: `planner.subtasks`, `developer.files_modified`.
MUST NOT use shared unnamespaced keys in short-term memory.

## PCR-4: Dependency Deadlock Prevention
MUST NOT allow circular task dependencies (A → B → A).
Orchestrator MUST detect cycles at decomposition time (OR-4) and reject the plan.
If cycle detected at runtime: fail both tasks, report `error.code: "CIRCULAR_DEPENDENCY"`.

## PCR-5: Ambiguous Command Resolution
If a command matches multiple agents (routing ambiguity): escalate to user with options.
MUST NOT auto-select silently — ask ONE targeted question.
MUST NOT split the same command to two agents without explicit parallel flag.

## PCR-6: Conflict Escalation
If agent detects resource conflict it cannot resolve: MUST return `status: "blocked"`.
MUST include `blockers: [{ type: "resource_conflict", resource: "...", held_by: "..." }]`.
Orchestrator MUST surface conflict to user if retry fails after one attempt.
