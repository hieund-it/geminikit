# Memory: execution

## Schema Definition

Current task execution state. Cleared when the active task completes.
Updated by `pre-tool` and `post-tool` hooks and by agents on subtask completion.

```yaml
# Task block format:
# ---
# task_id: string (UUID v4)
# task_title: string
# status: pending | in_progress | completed | failed
# started_at: ISO 8601
# completed_at: ISO 8601 | null
# current_phase: string
# agent: string
#
# subtasks:
#   - id: string
#     title: string
#     agent: string
#     status: pending | in_progress | completed | failed | skipped
#     started_at: ISO 8601 | null
#     completed_at: ISO 8601 | null
#     depends_on: [subtask_id]
#
# errors:
#   - timestamp: ISO 8601
#     source: string (tool or agent name)
#     message: string
#
# tool_log: (last 20 entries, FIFO)
#   - timestamp: ISO 8601
#     tool: string
#     status: ok | error
#     duration_ms: integer
# ---
```

## Protocol

| Rule | Detail |
|------|--------|
| Max tool_log entries | 20 (FIFO eviction) |
| Write access | `pre-tool` hook (tool_log), `post-tool` hook (tool_log, errors), agents (subtasks, status) |
| Read access | All agents and hooks |
| Clear trigger | Task status set to `completed` or `failed` |

## Active Task

```yaml
task_id: "task-01-01"
task_title: "Phase 1: Hello World"
status: completed
started_at: "2026-03-24T16:24:00Z"
completed_at: "2026-03-24T16:26:00Z"
current_phase: "Execution"
agent: "developer"

subtasks:
  - id: "create-file"
    title: "Create hello.txt"
    agent: "developer"
    status: completed
    started_at: "2026-03-24T16:24:10Z"
    completed_at: "2026-03-24T16:24:30Z"
    depends_on: []
  - id: "update-task-json"
    title: "Update task JSON file"
    agent: "developer"
    status: completed
    started_at: "2026-03-24T16:24:40Z"
    completed_at: "2026-03-24T16:25:10Z"
    depends_on: [create-file]
  - id: "create-report"
    title: "Create task report"
    agent: "developer"
    status: completed
    started_at: "2026-03-24T16:25:20Z"
    completed_at: "2026-03-24T16:25:40Z"
    depends_on: [update-task-json]

errors: []

tool_log: []
```

## Notes
- Do not store file contents or large data blobs in this file.
- Errors section captures tool failures and agent-reported issues only.
- File is reset to empty template on each new task start.

[2026-04-05T02:58:05.332Z] TOOL read_file → success (42ms)

[2026-04-05T04:51:55.828Z] TOOL unknown → unknown (0ms)

[2026-04-05T04:52:17.358Z] TOOL unknown → unknown (0ms)

[2026-04-05T04:53:33.364Z] TOOL unknown → unknown (0ms)

[2026-04-05T04:55:41.474Z] TOOL unknown → unknown (0ms)

[2026-04-05T04:56:24.612Z] TOOL unknown → unknown (0ms)
