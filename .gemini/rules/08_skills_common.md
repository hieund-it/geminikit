# Skill Common Rules (08)

These rules apply to all atomic skills within the Gemini Kit framework and must be followed to ensure consistency, security, and efficiency.

## Core Mandates

- **Security Audit** — always check for sensitive data (secrets, keys) in inputs/outputs and redact if found.
- **Context Economy** — minimize the number of files read and tokens used while maintaining analysis quality.
- **Display Convention** — When skill output includes user-facing content, populate the `display` field with a markdown-formatted summary (max 500 words). This field drives what the user sees; `result` is for programmatic consumption.
<no_assumptions>- **No Assumptions** — MUST NOT assume missing data. Return `status: blocked` if required fields are absent in the input.</no_assumptions>
- **PowerShell Mandatory (Rule 02_4):** MUST use PowerShell-compatible syntax for all shell commands.
- **Windows Pathing (Rule 02_4):** MUST use backslashes `\` for paths or properly quote paths containing spaces in a Windows environment.
- **Artifact Management (Rule 05_6):** ALL generated reports, specs, or logs MUST be stored in the appropriate `reports/{skill}/` directory with a timestamped filename (e.g., `{date}-{slug}.md`).

## Execution Excellence

- **Micro-tasking**: Break complex operations into atomic units verifiable with a single deliverable.
- **Validation-Driven**: No subtask is complete without an automated verification (test case or shell check).
- **Evidence over Claims**: Do not report success unless the verification step has passed with zero errors.
- **Structured Output**: ALWAYS prefer structured JSON output matching the skill's defined schema.
- **Confidence Rating**: Include a `confidence` field (`high | medium | low`) in every output to indicate the certainty of the result.
