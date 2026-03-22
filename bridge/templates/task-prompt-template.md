---
variables: [task_id, task_title, task_type, phase, implementation_steps, context_files, success_criteria, phase_description]
---
# Bridge Task: {{task_title}}

**Task ID:** {{task_id}}
**Type:** {{task_type}}
**Phase:** {{phase}}
**Description:** {{phase_description}}

## Instructions

{{implementation_steps}}

## Files to Work With

{{context_files}}

## Success Criteria

{{success_criteria}}

## IMPORTANT: After completing the task

Update the task file at `.bridge/queue/{{task_id}}.json`:
- Set `status` to `"gemini_done"`
- Write a concise summary in `gemini_summary` (files changed, approach taken)
- Update `updated_at` to current ISO 8601 UTC timestamp

Do not modify any other fields in the task JSON.
