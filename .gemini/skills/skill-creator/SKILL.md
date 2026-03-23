---
name: gk-skill-creator
agent: developer
version: "1.1.0"
description: "Generate agent and skill files following Gemini Kit templates and rules."
---

<!-- Save as: .gemini/skills/skill-creator/SKILL.md -->

## Interface
- **Invoked via:** /gk-create
- **Flags:** 
  - `--skill`: Generate a new skill component at `.gemini/skills/<name>/SKILL.md`
  - `--agent`: Generate a new agent definition at `.gemini/agents/<name>.md`
- **Errors:** INVALID_TYPE, MISSING_NAME, FILE_EXISTS

## References
- **Skill Creation Guide:** `.gemini/template/how-to-create-skill.md`
- **Skill Template:** `.gemini/template/skill-template.md`
- **Agent Template:** `.gemini/template/agent-template.md`
- **Mode Template:** `.gemini/template/mode-template.md`

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
- **Security Audit** — always check for sensitive data (secrets, keys) in inputs/outputs and redact if found.
- **Context Economy** — minimize the number of files read and tokens used while maintaining analysis quality.
- **PRE-FLIGHT (CRITICAL):** MUST read `.gemini/template/how-to-create-skill.md` before generating a new skill.
- **TEMPLATE MANDATE:** MUST use `.gemini/template/skill-template.md` as the absolute base for skills.
- **TEMPLATE MANDATE:** MUST use `.gemini/template/agent-template.md` as the absolute base for agents.
- **MANDATORY**: If the skill has flags, MUST include a `Mode Mapping` table in `SKILL.md`.
- **MANDATORY**: For every flag listed, MUST create a corresponding mode file in the `./modes/` directory using `.gemini/template/mode-template.md`.
- **MANDATORY**: Mode files MUST include `# Extra Rules` and `## Steps` sections.
- MUST ensure file name is kebab-case and name matches frontmatter.
- MUST NOT overwrite existing files — return `FILE_EXISTS` if path occupied.
- MUST save skills to `.gemini/skills/<name>/SKILL.md`.
- MUST include YAML frontmatter for skills with `gk-` prefix.
- MUST register the new component in `GEMINI.md` (Skills) or `.gemini/AGENT.md` (Agents).
- MUST follow SCR-B1 (Single Responsibility).
- All content MUST be in English (Rule 01_CORE).
- Agent commands MUST follow PowerShell/Windows syntax (Rule 02_WORKFLOW).
- **TRACEABILITY:** In the `summary` of the output, explicitly mention which template and guide were used for generation.

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
