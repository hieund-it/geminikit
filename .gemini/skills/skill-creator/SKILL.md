---
name: gk-skill-creator
agent: developer
version: "1.0.0"
description: "Generate agent and skill files following Gemini Kit templates and rules."
---

<!-- Save as: .gemini/skills/skill-creator/SKILL.md -->

## Interface
- **Invoked via:** /gk-create
- **Flags:** 
  - `--skill`: Generate a new skill component at `.gemini/skills/<name>/SKILL.md`
  - `--agent`: Generate a new agent definition at `.gemini/agents/<name>.md`
- **Errors:** INVALID_TYPE, MISSING_NAME, FILE_EXISTS

# Role

Senior Gemini Kit Architect

# Objective

Generate a new agent or skill file based on provided templates, ensuring strict adherence to the Gemini Kit framework rules.

# Input

```json
{
  "type": "string (required) — 'skill' or 'agent'",
  "name": "string (required) — kebab-case name",
  "description": "string (required) — one sentence description",
  "agent_specific": {
    "role": "string (optional) — expert persona",
    "responsibilities": ["string"] (optional)
  },
  "skill_specific": {
    "objective": "string (optional) — verb + what + outcome",
    "invoked_via": "string (optional) — command name",
    "flags": ["string"] (optional)
  }
}
```

# Rules

- MUST use `.gemini/template/skill-template.md` for skills.
- MUST use `.gemini/template/agent-template.md` for agents.
- **MANDATORY**: If the skill has flags, MUST include a `Mode Mapping` table in `SKILL.md`.
- **MANDATORY**: For every flag listed, MUST create a corresponding mode file in the `./modes/` directory.
- **MANDATORY**: Mode files MUST follow `.gemini/template/mode-template.md` and include `# Extra Rules` and `## Steps` sections.
- MUST ensure file name is kebab-case.
- MUST NOT overwrite existing files — return `FILE_EXISTS` if path occupied.
- MUST save skills to `.gemini/skills/<name>/SKILL.md`.
- MUST include YAML frontmatter for skills with `gk-` prefix.
- MUST register the new component in `GEMINI.md` (Skills) or `.gemini/AGENT.md` (Agents).
- MUST follow SCR-B1 (Single Responsibility).
- All content MUST be in English (Rule 01_CORE).
- Agent commands MUST follow PowerShell/Windows syntax (Rule 02_WORKFLOW).

# Output

```json
{
  "status": "completed | failed | blocked",
  "format": "json",
  "result": {
    "file_path": "string",
    "content": "string",
    "registrations": ["string"]
  },
  "summary": "one sentence describing what was generated",
  "confidence": "high"
}
```

**Example (skill):**
```json
{
  "status": "completed",
  "format": "json",
  "result": {
    "file_path": ".gemini/skills/my-skill/SKILL.md",
    "content": "...",
    "registrations": ["GEMINI.md"]
  },
  "summary": "Generated skill 'my-skill' at .gemini/skills/my-skill/SKILL.md.",
  "confidence": "high"
}
```
