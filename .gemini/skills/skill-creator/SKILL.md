---
name: gk-skill-creator
agent: developer
version: "1.1.0"
description: "Generate agent and skill files following Gemini Kit templates and rules."
---

<!-- Save as: .gemini/skills/skill-creator/SKILL.md -->

## Interface
- **Invoked via:** /gk-create
- **Flags:** --skill | --agent
- **Errors:** INVALID_TYPE, MISSING_NAME, FILE_EXISTS

## Mode Mapping

| Flag | Description | Reference |
|------|-------------|-----------|
| --skill | Generate a new skill component at `.gemini/skills/<name>/SKILL.md` | (base skill rules) |
| --agent | Generate a new agent definition at `.gemini/agents/<name>.md` | (base skill rules) |
| (default) | Standard generation based on input type | (base skill rules) |

## References
- **Skill Creation Guide:** `.gemini/template/how-to-create-skill.md`
- **Skill Template:** `.gemini/template/skill-template.md`
- **Agent Template:** `.gemini/template/agent-template.md`
- **Mode Template:** `.gemini/template/mode-template.md`

## Initialization (Required)
Before starting, write skill state to enable hook context injection:
```json
{
  "skill": "gk-skill-creator",
  "session_id": "<current-session-id>",
  "timestamp": "<ISO-timestamp>"
}
```
Write to: `.gemini/.skill-state.json`
The BeforeAgent hook will inject `skill-template.md` automatically.
**Note:** AfterTool hook auto-syncs skill registry after writing `SKILL.md` — **do NOT manually update `GEMINI.md`**.

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
- **Skill Common Rules**: See [.gemini/rules/08_skills_common.md](../../rules/08_skills_common.md)
- **PRE-FLIGHT (CRITICAL):** MUST read `.gemini/template/how-to-create-skill.md` before generating a new skill.
- **TEMPLATE MANDATE:** MUST use `.gemini/template/skill-template.md` as the absolute base for skills.
- **TEMPLATE MANDATE:** MUST use `.gemini/template/agent-template.md` as the absolute base for agents.
- **MANDATORY**: If the skill has flags, MUST include a `Mode Mapping` table in `SKILL.md`.
- **MANDATORY**: For every flag listed, MUST create a corresponding mode file in the `./modes/` directory using `.gemini/template/mode-template.md`.
- **MANDATORY**: Mode files MUST include `# Extra Rules` and `## Steps` sections.
- **MANDATORY (Rule 02_4):** All generated skills MUST include a rule requiring PowerShell-compatible syntax for shell commands.
- **MANDATORY (Rule 05_6):** All generated skills that produce reports MUST include a rule for storing reports in `reports/{skill-name}/{date}-{type}.md`.
- **MANDATORY (Rule 02_5.1):** All generated skills that produce plans MUST include a rule for storing plans in `plans/{date}-{slug}/plan.md`.
- MUST ensure file name is kebab-case and name matches frontmatter.
- **DUPLICATION POLICY**: If the skill name already exists at `.gemini/skills/<name>/SKILL.md`:
    - MUST read the existing skill first to see if it can be merged.
    - If it's a new version of the same pattern, increment name to `<name>-v2`, `<name>-v3`, etc.
    - MUST update `GEMINI.md` to reflect the new version.
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
