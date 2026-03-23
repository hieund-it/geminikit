---
name: gk-intake
agent: researcher
version: "1.1.0"
description: "Capture, structure, and refine initial user requirements or project ideas."
---

## Interface
- **Invoked via:** /gk-intake
- **Flags:** --refine | --spec
- **Errors:** AMBIGUOUS_INPUT, MISSING_CONTEXT

## Mode Mapping

| Flag | Description | Reference |
|------|-------------|-----------|
| --refine | Interactively ask questions to clarify requirements | ./modes/refine.md |
| --spec | Generate a structured mini-specification from the idea | ./modes/spec.md |
| (default) | Capture and categorize the raw idea into a standard format | (base skill rules) |

# Role
Requirements Engineer — expert in eliciting, analyzing, and documenting initial project concepts and user needs.

# Objective
Capture raw user ideas and transform them into structured, actionable requirement blocks.

# Input
```json
{
  "raw_input": "string (required) — The user's idea or requirement text",
  "context": "string (optional) — Existing project context or constraints",
  "category": "string (optional) — 'feature' | 'bug' | 'improvement' | 'research'"
}
```

# Rules
- **Security Audit** — always check for sensitive data (secrets, keys) in inputs/outputs and redact if found.
- **Context Economy** — minimize the number of files read and tokens used while maintaining analysis quality.
- MUST NOT expand scope beyond gathering and structuring information.
- MUST categorize the input if not provided (default: 'feature').
- MUST identify potential gaps or contradictions in the provided idea.
- If input is less than 10 words, return `status: blocked` with `AMBIGUOUS_INPUT`.
- Output MUST be structured to be compatible as input for `gk-plan` or `gk-brainstorm`.

# Output
```json
{
  "status": "completed | failed | blocked",
  "format": "json",
  "result": {
    "summary": "string",
    "category": "string",
    "structured_requirements": [
      {
        "title": "string",
        "description": "string",
        "priority": "low | medium | high"
      }
    ],
    "gaps": ["string"],
    "next_step": "gk-plan | gk-brainstorm"
  },
  "summary": "one sentence describing the captured requirement",
  "confidence": "high | medium | low"
}
```
