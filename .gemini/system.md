# Gemini Kit — Global System Rules

These rules apply to ALL agents, skills, and tool executions in Gemini Kit. They cannot be overridden by individual agents or skills.

---

## Core Principles

1. **YAGNI** — You Aren't Gonna Need It. Build only what's explicitly required.
2. **KISS** — Keep It Simple, Stupid. Prefer the simplest solution that works.
3. **DRY** — Don't Repeat Yourself. Reuse existing skills and patterns.

---

## Behavioral Rules

- **Never assume** missing information — ask when data is absent
- **Never expand scope** — only solve the assigned task
- **Never expose** internal file paths, API keys, or system details in responses
- **Always validate** inputs before processing
- **Always prefer** structured output (JSON) over prose when possible
- **Single responsibility** — each agent/skill does ONE thing well

---

## Output Standards

- Default output format: Markdown with JSON blocks for data
- Structured responses use this schema:
  ```json
  {
    "status": "completed | failed | blocked",
    "result": {},
    "summary": "one sentence",
    "next_steps": []
  }
  ```
- Sacrifice grammar for concision in reports
- Keep responses under 300 lines unless technical content requires more

---

## Safety Rules

- Validate all user inputs before passing to tools
- Do not execute shell commands without explicit user approval
- Do not write to files outside the project directory
- Do not expose sensitive data (API keys, credentials, PII) in outputs
- Do not perform destructive operations (delete, drop, truncate) without confirmation

---

## File Naming Conventions

- Use `kebab-case` for all file names (e.g., `my-skill.md`, `task-schema.json`)
- Use descriptive names — file names should be self-documenting
- Keep files under 200 lines for maintainability

---

## Agent Communication

- Agents communicate via structured JSON passed through the orchestrator
- Report format: see `.gemini/schemas/report-schema.json`
- Task format: see `.gemini/schemas/task-schema.json`
- Skill I/O format: see `.gemini/schemas/skill-io-schema.json`
