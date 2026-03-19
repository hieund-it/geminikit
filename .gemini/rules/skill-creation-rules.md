# Skill Creation Rules

<critical>Every auto-generated or manually created skill MUST pass the validation checklist before being used in production.</critical>

---

## 1. Structure Rules

**SCR-S1:** MUST start with YAML frontmatter:
```yaml
---
name: skill-name          # kebab-case, unique
version: "1.0.0"          # semver
description: "..."        # one sentence, action-oriented
---
```

**SCR-S2:** MUST contain exactly these sections in order:
`# Role` → `# Objective` → `# Input` → `# Rules` → `# Output`

**SCR-S3:** MUST NOT exceed 200 lines total.

**SCR-S4:** Folder name MUST match `name` field in frontmatter. Entry point MUST be `SKILL.md` (uppercase).
(e.g., `name: sql-optimizer` → `sql-optimizer/SKILL.md`)

**SCR-S5:** MUST NOT import or reference other skill files inline. Cross-skill logic belongs in the orchestrator.

**SCR-S6:** Mode Files (applies when skill has ≥2 modes):
- Create `modes/` subfolder inside the skill folder: `<skill>/modes/<mode-name>.md`
- Mode file frontmatter MUST include: `mode`, `extends`, `version`
- Mode file MUST contain: `# Extra Rules`, `# Extra Output`, `## Steps`, and `## Examples` sections
- MUST NOT redefine fields from base SKILL.md Input schema — inherit as-is
- MUST use additive semantics: Extra Rules append to base, Extra Output fields merge into base schema
- 200-line limit applies per file independently
- Only create `modes/` folder when skill has ≥2 modes (YAGNI)
- Mode file naming: `<mode-name>.md` in kebab-case (no prefix needed — folder provides context)

**SCR-S7:** Mode file template: `.gemini/template/mode-template.md`

**SCR-S8: Interface Section**
SKILL.md MUST include `## Interface` section immediately after frontmatter:
- `Invoked via`: command name (e.g. `/gk-plan`) or `agent-only`
- `Flags`: CLI flags accepted, or `none`
- `Errors`: error codes the skill returns (must match Rules section)

Mode files MUST include `## Steps` and `## Examples` sections.

---

## 2. Behavior Rules

**SCR-B1: Single Responsibility**
MUST perform exactly one task.
MUST NOT combine multiple operations (e.g., "analyze AND fix" is two skills).

**SCR-B2: No Assumption**
MUST NOT assume values for missing input fields.
MUST return `status: "blocked"` with `"missing_fields": []` when required inputs are absent.

**SCR-B3: No Scope Expansion**
MUST NOT perform actions beyond the defined `# Objective`.
MUST NOT call tools not specified in `# Input`.

**SCR-B4: Deterministic Output**
MUST produce identical output for identical input.
MUST NOT use randomness, timestamps, or session state in output logic.

**SCR-B5: Token Efficiency**
MUST NOT include explanatory prose in output when result is consumed by another agent.
MUST truncate outputs exceeding 300 lines and set `"truncated": true`.

**SCR-B6: No Hallucination**
MUST derive all outputs from provided input data only.
MUST flag uncertain findings: `"confidence": "low"` when evidence is incomplete.

---

## 3. Validation Rules

**SCR-V1:** Input schema MUST define:
- All required fields with types
- All optional fields with defaults
- No ambiguous field names

**SCR-V2:** Output schema MUST always include:
```json
{ "status": "completed|failed|blocked", "result": {}, "summary": "string" }
```

**SCR-V3:** MUST include at least one example in `# Output` section showing a real-case response.

**SCR-V4:** On validation failure, MUST return:
```json
{ "status": "failed", "error": { "code": "VALIDATION_ERROR", "message": "...", "fields": [] } }
```

---

## 4. Constraints

**SCR-C1:** MUST be stateless — no session variables, no side effects beyond defined output.

**SCR-C2:** MUST NOT access memory layers directly. Memory access is orchestrator's responsibility.

**SCR-C3:** MUST NOT make network calls. Use tool definitions in `.gemini/tools/` instead.

**SCR-C4:** MUST be compatible with the orchestrator's skill registry in `GEMINI.md`.

**SCR-C5:** MUST NOT hardcode environment-specific values (paths, URLs, credentials).

---

## 5. Skill Template

See: `.gemini/template/skill-template.md`

---

## 6. Validation Checklist

```
STRUCTURE
[ ] YAML frontmatter present (name, version, description)
[ ] All 5 required sections present in correct order
[ ] Folder name matches frontmatter name field
[ ] Entry point is SKILL.md (uppercase)
[ ] ## Interface section present (Invoked via, Flags, Errors)
[ ] If ≥2 modes: modes/ subfolder exists with <mode-name>.md files
[ ] Mode files have frontmatter: mode, extends, version
[ ] Mode files contain # Extra Rules, # Extra Output, ## Steps, ## Examples sections
[ ] Total lines ≤ 200

BEHAVIOR
[ ] Single responsibility (one action only)
[ ] No assumption of missing data
[ ] Deterministic: same input → same output
[ ] No scope expansion beyond Objective

INPUT / OUTPUT
[ ] Input schema: all required fields typed
[ ] Input schema: all optional fields have defaults
[ ] Output schema includes: status, result, summary
[ ] At least one output example provided

CONSTRAINTS
[ ] Stateless (no session state used)
[ ] No direct memory access
[ ] No hardcoded environment values
[ ] No inline imports of other skills

COMPATIBILITY
[ ] Skill name registered in GEMINI.md skill registry
[ ] Input/output compatible with calling agent's contract
[ ] Tested with at least one valid and one invalid input
```
