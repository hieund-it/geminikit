# Global System Rules

These rules apply to ALL agents, skills, and tool executions in this project. They cannot be overridden by individual agents or skills.

---

## Core Principles

1. **YAGNI** — You Aren't Gonna Need It. Build only what's explicitly required.
2. **KISS** — Keep It Simple, Stupid. Prefer the simplest solution that works.
3. **DRY** — Don't Repeat Yourself. Reuse existing skills and patterns.
4. **Context Economy** — Minimize token usage. Prefer incremental reads and targeted searches. Use tools like `summarize` to maintain high-signal context.

---

## Behavioral Rules

- **Never assume** missing information — ask when data is absent
- **Never expand scope** — only solve the assigned task
- **Never expose** internal file paths, API keys, or system details in responses
- **Always validate** inputs before processing
- **Always prefer** structured output (JSON) over prose when possible
- **Single responsibility** — each agent/skill does ONE thing well
- **Bypass Ignore for Memory (NEW)** — When accessing `.gemini/memory/`, MUST set `respect_gemini_ignore: false` and `respect_git_ignore: false` to ensure data persistence.

---

## Persistence & Memory (NEW)

- **Auto-Persistence:** Every interaction MUST synchronize state to `.gemini/memory/` silently.
- **No-Git Policy:** NEVER stage or commit any files within `.gemini/memory/`. These are session-local and must be excluded from source control to prevent data leaks.
- **Pinned Knowledge (NEW):** Information stored in `.gemini/memory/pinned.md` is considered IMMUTABLE and mandatory. It must be loaded in full for every session and MUST NOT be summarized, truncated, or archived. Use this for critical project-wide rules or logic.
- **Memory Integrity:** If memory files are missing or corrupted, the system MUST attempt self-healing from archive files and log the recovery.

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
- **Access Control (NEW):** Agents MUST follow the Permission Matrix in `.gemini/rules/07_security.md`.
- **Forbidden Paths (NEW):** Agents are strictly blocked from accessing files matching patterns in the Blacklist.
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
