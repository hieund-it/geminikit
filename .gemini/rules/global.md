# Global Rules

Constraints that apply to all agents and skills. These supplement `system.md`.

## Core Principles

- **YAGNI** – Implement only what the current task explicitly requires. No speculative additions.
- **KISS** – Prefer the simplest solution that works. Avoid over-engineering.
- **DRY** – Extract repeated logic. Reference existing tools/skills before writing new ones.
- **No assumptions** – If a requirement is ambiguous, ask before proceeding.
- **Minimal scope** – Do not expand task boundaries without explicit instruction.

## Output Format

- Default output format: structured JSON or Markdown, never raw prose blobs.
- All agent reports must conform to `schemas/report-schema.json`.
- Always include a one-sentence `summary` field at the top of any report.
- Use bullet lists, not paragraphs, for findings and recommendations.
- Never truncate output with "..." — either complete it or state what is omitted and why.

## File Conventions

- File names: `kebab-case`, descriptive, self-documenting for LLM tools.
- Max 200 lines per code file. Split into modules when exceeded.
- No generic names: `utils.js`, `helper.py`, `misc.ts` are not acceptable.
- New files must be created with `Write` tool; existing files with `Edit` tool only.

## Error Handling

- Always use try/catch (or equivalent) for I/O and external calls.
- On error, return a structured object: `{ status: "failed", error: { code, message, context } }`.
- Never swallow errors silently. Log or surface all failures.
- Distinguish between retryable errors (network, rate-limit) and terminal errors (schema violation).

## Code Quality

- No commented-out code in final output.
- No `TODO` or `FIXME` left in committed files unless tracked in the plan.
- Validate inputs at function/skill boundary before any processing.
- Write code that reads like documentation — prefer clarity over cleverness.

## Token Efficiency

- Load only the context needed for the current step (progressive disclosure).
- Prefer referencing schema files over duplicating field definitions in prose.
- Summarize large inputs before passing downstream; preserve originals in `metadata`.
