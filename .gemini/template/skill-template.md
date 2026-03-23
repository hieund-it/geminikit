---
name: gk-[skill-name]
agent: [primary-agent-name]
version: "1.0.0"
description: "One sentence: what this skill does (action-oriented)"
---

<!-- Save as: .gemini/skills/<skill-name>/SKILL.md -->
<!-- If skill has ≥2 modes, create .gemini/skills/<skill-name>/modes/<mode>.md for each mode -->
<!-- See: .gemini/template/mode-template.md for mode file format -->

## Interface
- **Invoked via:** /gk-[skill-name] (or "agent-only")
- **Flags:** --flag1 | --flag2 (or "none")
- **Errors:** ERROR_CODE_1, ERROR_CODE_2

## Mode Mapping
<!-- MANDATORY: If skill has flags, you MUST create a Mode Mapping table. -->
<!-- MANDATORY: For each flag, you MUST create a corresponding mode file at .gemini/skills/<skill-name>/modes/<mode>.md -->
<!-- Use plain text paths, NOT @{} syntax — paths are LLM routing hints only. -->

| Flag | Description | Reference |
|------|-------------|-----------|
| --mode-name | What this mode does | ./modes/mode-name.md |
| (default) | Base skill behavior | (base skill rules) |

# Role

[Specific expert role — e.g., "Senior Database Performance Engineer"]

# Objective

[Single, clear task — one sentence only. Start with a verb. E.g., "Optimize SQL queries for performance while preserving logic."]

# Input

```json
{
  "required_field_1": "string (required) — description",
  "required_field_2": "object (required) — description",
  "optional_field":   "string (optional, default: null) — description"
}
```

# Rules

- **Security Audit** — MUST validate all inputs and redact any potential secrets (API keys, passwords) from the output.
- **Context Economy** — MUST minimize token usage. Prefer targeted file reads and incremental processing.
- MUST NOT assume missing data — return `blocked` if required fields absent
- MUST only perform the task defined in Objective — no scope expansion
- MUST NOT call tools or access memory not listed in Input
- MUST return identical output for identical input (deterministic)
- MUST flag uncertainty: include `"confidence": "low"` when evidence is incomplete
- [Add skill-specific rules here]

# Output

```json
{
  "status": "completed | failed | blocked",
  "format": "json | markdown | text",
  "result": {
    // skill-specific result fields here
  },
  "summary": "one sentence describing what was done",
  "confidence": "high | medium | low"
}
```

**On blocked (missing required input):**
```json
{
  "status": "blocked",
  "format": "json",
  "missing_fields": ["field_name"],
  "summary": "Cannot proceed: required fields missing"
}
```

**On failure:**
```json
{
  "status": "failed",
  "format": "json",
  "error": { "code": "ERROR_CODE", "message": "description" },
  "summary": "one sentence"
}
```

**Example (happy path):**
```json
{
  "status": "completed",
  "format": "json",
  "result": { "example_field": "example_value" },
  "summary": "Task completed successfully.",
  "confidence": "high"
}
```
