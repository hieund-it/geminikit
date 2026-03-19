---
name: skill-invocation-rules
version: "1.0.0"
description: "Runtime rules for invoking skills from agents and orchestrator."
---

# Skill Invocation Rules

<critical>Skills are atomic units. Invocation protocol is mandatory for all callers.</critical>

## SIR-1: Invocation Gate
MUST validate skill folder exists at `.gemini/skills/<skill>/` before calling.
MUST load skill from `.gemini/skills/<skill>/SKILL.md` (not flat `.md` files).
MUST NOT invoke a skill that is not registered.
MUST return `status: "blocked"` with `missing_fields: ["skill_name"]` if skill not found.

## SIR-2: Input Preparation
MUST pass ALL required fields defined in skill's `# Input` section.
MUST pass input as JSON — no free-form strings.
MUST NOT pass extra fields not defined in the skill's input schema.

## SIR-3: Timeout Enforcement
Each skill invocation MUST complete within 30 seconds.
If timeout reached: cancel call, return `status: "failed"`, `error.code: "SKILL_TIMEOUT"`.
MUST NOT retry timed-out skills automatically — report to orchestrator.

## SIR-4: No Nested Invocation
Skills MUST NOT invoke other skills.
Skills MUST NOT call tools not listed in their `# Input` section.
Cross-skill logic belongs in the orchestrator task decomposition (OR-4).

## SIR-5: Output Validation
Caller MUST validate skill output against `{ status, result, summary }` schema.
If output is malformed: treat as `status: "failed"`, do not silently pass bad data.

## SIR-7: Mode Loading
If invocation includes a `mode` field:
- Load base skill from `.gemini/skills/<skill>/SKILL.md`
- Additionally load `.gemini/skills/<skill>/modes/<mode>.md`
- Merge additively: Extra Rules append to base Rules; Extra Output fields merge into base output schema
- If `modes/` folder missing or specific mode file not found: return `status: "blocked"`, `error.code: "MODE_NOT_FOUND"`
- Log loaded mode in execution log entry

## SIR-6: Invocation Log
MUST log each skill call to execution memory: `{ skill, input_hash, status, duration_ms }`.
Log is used for retry decisions and audit trail.
MUST NOT log sensitive field values — log field names only.
