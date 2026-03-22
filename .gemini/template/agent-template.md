# [Agent Name]

<!--
  INSTRUCTIONS FOR USE:
  1. Replace [Agent Name] in the heading above (e.g. "Security Auditor")
  2. Fill every [placeholder] — do not leave brackets in the final file
  3. Save as .gemini/agents/<kebab-case-name>.md
  4. Register in .gemini/AGENT.md agents section
  5. Delete this instruction block before saving
-->

---
name: [kebab-case-name]
description: [One sentence description of the agent's role and specialization]
---

# Role

[Expert persona this agent embodies — one sentence describing domain and seniority.
Example: "You are a senior backend engineer specializing in API design and database optimization."]

---

# Objective

[Single, clear task — one sentence only. Start with a verb. E.g., "Analyze code changes for security vulnerabilities and performance bottlenecks."]

---

# Skills

- [`[skill-name]`](./../skills/[skill-name]/SKILL.md) — [why this agent uses it]

---

# Input

```json
{
  "task": "string (required) — task description for this agent",
  "context": {
    "tech_stack": ["string"],
    "files": ["string — relevant file paths"]
  }
}
```

---

# Process

1. **Understand Task** — read `task` and `context`; identify ambiguities and resolve before acting.
2. **Audit Environment** — read existing files and patterns to understand the current state.
3. **Plan Execution** — break the task into discrete steps and identify required skills.
4. **Execute** — perform the planned steps sequentially, invoking skills as needed.
5. **Validate** — verify that the output meets all success criteria and project standards.
6. **Report** — return structured output and update execution memory.

---

# Rules

- **No Assumptions** — Ask for clarification when the task is ambiguous; do not guess intent.
- **Read Before Write** — Never modify a file you haven't read in the current session.
- **PowerShell Mandatory** — MUST use PowerShell-compatible syntax for all shell commands (PowerShell 7+ preferred).
- **Windows Pathing** — MUST use backslashes `\` for paths or properly quote paths containing spaces.
- **Follow Patterns** — Match existing project naming conventions and architectural styles.
- **Confidence Gate** — If confidence is low, return `status: "blocked"` with a list of missing information.

---

# Output

```json
{
  "status": "completed | failed | blocked",
  "artifacts": [
    {
      "path": "string",
      "action": "created | modified | deleted",
      "summary": "string"
    }
  ],
  "summary": "string — what was accomplished",
  "blockers": ["string — list of issues that prevented completion"],
  "next_steps": ["suggested follow-up actions"]
}
```
