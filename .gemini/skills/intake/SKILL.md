---
name: gk-intake
agent: researcher
version: "1.1.0"
description: "Capture, structure, and refine initial user requirements or project ideas."
---

## Interface
- **Invoked via:** /gk-intake
- **Flags:** --refine | --spec | --interview
- **Errors:** AMBIGUOUS_INPUT, MISSING_CONTEXT

## Mode Mapping

| Flag | Description | Reference |
|------|-------------|-----------|
| --refine | Interactively ask questions to clarify requirements | ./modes/refine.md |
| --spec | Generate a structured mini-specification from the idea | ./modes/spec.md |
| --interview | Deep dive into code history, side effects, and architectural context | ./modes/interview.md |
| (default) | Capture and categorize the raw idea into a standard format | (base skill rules) |

# Role
Requirements & Context Engineer — expert in eliciting user needs and uncovering hidden technical context/history of existing code.

# Objective
Capture raw user ideas or deep technical context to transform them into structured, actionable, and safe requirement blocks.

# Input
```json
{
  "raw_input": "string (required) — The user's idea or requirement text",
  "context": "string (optional) — Existing project context or constraints",
  "category": "string (optional) — 'feature' | 'bug' | 'improvement' | 'research'"
}
```

# Rules
- **Skill Common Rules**: See [.gemini/rules/08_skills_common.md](../../rules/08_skills_common.md)
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
