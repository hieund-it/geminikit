---
name: claude-handoff-rules
version: "1.0.0"
description: "Input/output contract for ingesting Claude-generated plans into Gemini Kit via /gk-plan --from."
---

# Claude Handoff Rules

<critical>All components processing Claude plans via --from MUST comply with CHR-1 to CHR-9. Non-compliance is a system error.</critical>

## Input Rules

### CHR-1: Source Validation
MUST verify: directory exists, `plan.md` present, ≥1 `phase-NN-*.md` file present.
MUST return `error.code: "INVALID_PLAN_SOURCE"` if any check fails.

### CHR-2: Plan Parsing Order
MUST parse phase files in ascending numeric prefix order (01 before 02).
MUST NOT use file modification time as sort key.

### CHR-3: Phase Field Validation
Each phase file MUST contain YAML frontmatter with: `agent`, `depends_on`, `status`.
Each phase file MUST contain sections: `## Related Code Files`, `## Success Criteria`.
MUST return `error.code: "MISSING_PHASE_FIELDS"` with list of missing fields on failure.

### CHR-4: Dependency Resolution
MUST resolve `depends_on` phase IDs to taskIds before building the execution DAG.
MUST detect circular dependencies at parse time.
MUST return `error.code: "CIRCULAR_DEPENDENCY"` and halt on detection.

### CHR-5: Agent/Skill Validation
MUST validate `agent` value against task-schema agent enum.
MUST validate `skill` (if present) against agent's allowed skill list per AR-1.
MUST return `status: "blocked"` with reason if validation fails.

## Output Rules

### CHR-6: Phase Frontmatter Writeback
After each phase completes, MUST update only these three frontmatter fields: `status`, `executed_at`, `execution_summary`.
MUST NOT overwrite any other frontmatter fields.
`executed_at` format: ISO 8601 date-time string (e.g. `2026-03-19T21:37:00+07:00`).

### CHR-7: Summary Report
After full plan execution, MUST write report to `plans/reports/gemini-{slug}-execution-{YYMMDD}.md`.
Report MUST include: `phases_completed`, `phases_failed`, `blocked_phases`, `total_effort`.

### CHR-8: Console JSON Output
MUST print to stdout on completion:
```json
{ "status": "completed|failed|partial", "phases_completed": 0, "phases_failed": 0, "report_path": "string" }
```

## Error Protocol

### CHR-9: Blocked Escalation
MUST pause phases whose `depends_on` targets have `status: "failed"`.
MUST continue executing phases with no failed dependencies.
MUST list all blocked phases in the CHR-7 summary report.
MUST NOT silently skip blocked phases.
