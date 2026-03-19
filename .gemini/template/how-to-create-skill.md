# How to Create a New Skill

Step-by-step workflow for adding a skill to Gemini Kit. Follow in order — do not skip steps.

---

## Step 1: Verify need

- Does a skill already exist for this task? Check `.gemini/skills/`
- Does this violate SCR-B1 (single responsibility)? If "analyze AND fix" → split into two skills
- If both pass → proceed

## Step 2: Copy template

```bash
cp .gemini/template/skill-template.md .gemini/skills/<skill-name>.md
```

File name MUST be kebab-case and match the `name` field you will set in frontmatter.

## Step 3: Fill frontmatter

```yaml
---
name: <skill-name>          # kebab-case, unique across skills/
version: "1.0.0"            # semver
description: "Verb + what + outcome. One sentence."
---
```

## Step 4: Define each section (in order)

| Section | Rule |
|---------|------|
| `## Interface` | Invoked via (command or agent-only), Flags accepted, Error codes returned |
| `# Role` | One sentence — who this skill is (expert persona) |
| `# Objective` | One sentence — what it produces. Start with a verb. |
| `# Input` | JSON schema: all required fields typed, all optional fields with defaults |
| `# Rules` | MUST/MUST NOT statements. Skill-specific. Min 5 rules. |
| `# Output` | JSON schema inside `result`, then response envelope + blocked + failed + example |

## Step 5: Write the output section

Always use this structure:

```json
// Skill-specific schema (content of result):
{ "field_1": "type", "field_2": "type" }

// Response envelope (required):
{
  "status": "completed | failed | blocked",
  "result": { /* skill-specific fields */ },
  "summary": "one sentence"
}

// On blocked:
{ "status": "blocked", "missing_fields": ["field"], "summary": "Cannot proceed: ..." }

// On failed:
{ "status": "failed", "error": { "code": "ERROR_CODE", "message": "..." }, "summary": "..." }

// Example (happy path):
{ "status": "completed", "result": { ... }, "summary": "..." }
```

## Step 6: Validate against checklist

Run through `.gemini/rules/skill-creation-rules.md` Section 6 checklist:

```
[ ] YAML frontmatter present (name, version, description)
[ ] ## Interface section present (Invoked via, Flags, Errors)
[ ] All 5 sections present in correct order
[ ] File name matches frontmatter name
[ ] Total lines ≤ 200
[ ] Single responsibility
[ ] No assumption of missing data
[ ] Input: all required fields typed, optional fields have defaults
[ ] Output: status + result + summary + blocked + failed + example
[ ] Stateless (no session state)
[ ] No direct memory access
[ ] No hardcoded env values
[ ] If modes: ## Steps and ## Examples sections present in each mode file
```

## Step 7: Register in GEMINI.md

Add a row to the Skill Registry table in `GEMINI.md`:

```markdown
| <name> | `.gemini/skills/<name>.md` | <use case description> |
```

## Step 8: Register in agent role table

In `.gemini/rules/agent-rules.md` AR-1, add the skill to the agent's allowed list if applicable.

---

## Line budget

| Section | Target lines |
|---------|-------------|
| Frontmatter | 5 |
| Role + Objective | 4 |
| Input schema | 10–20 |
| Rules | 8–15 |
| Output (schema + envelope + examples) | 25–35 |
| **Total** | **≤ 200** |
