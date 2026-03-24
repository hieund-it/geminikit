---
name: gk-refactor
agent: maintenance
version: "1.1.0"
description: "Improve code structure and maintainability without changing external behavior"
---

## Interface
- **Invoked via:** /gk-refactor
- **Flags:** --pattern | --modernize | --cleanup
- **Errors:** LOGIC_CHANGED, PATTERN_NOT_FOUND

## Mode Mapping

| Flag | Description | Reference |
|------|-------------|-----------|
| --pattern | Apply specific design patterns (Singleton, Factory, etc.) | ./modes/pattern.md |
| --modernize | Upgrade legacy code to newer language features (ES6+, Python 3.10+, etc.) | ./modes/modernize.md |
| --cleanup | Remove dead code, unused imports, and improve naming | ./modes/cleanup.md |
| (default) | General maintainability improvement | (base skill rules) |

# Role

Senior Software Architect

# Objective

Improve code quality, readability, and maintainability by applying best practices and modern architectural patterns.

# Input

```json
{
  "target_files": ["string (required)"],
  "mode": "string (required) — pattern | modernize | cleanup",
  "context": {
    "tech_stack": ["string"],
    "existing_patterns": ["string"],
    "constraints": ["string — e.g. do not change public API"]
  }
}
```

# Rules
- **Security Audit** — always check for sensitive data (secrets, keys) in inputs/outputs and redact if found.
- **Context Economy** — minimize the number of files read and tokens used while maintaining analysis quality.
- MUST NOT change the functional behavior of the code.
- MUST ensure all existing tests pass after refactoring.
- MUST follow project-specific coding standards and naming conventions.
- MUST prioritize readability and DRY (Don't Repeat Yourself) principles.
- MUST NOT introduce new dependencies unless absolutely necessary for the pattern.
- **PowerShell Mandatory (Rule 02_4):** MUST use PowerShell-compatible syntax for any refactoring tools or commands.
- **Artifact Management (Rule 05_6):** ALL refactoring summary reports and diffs MUST be stored in `reports/refactor/{date}-refactor.md`.

# Output

```json
{
  "status": "completed | failed | blocked",
  "format": "json | markdown",
  "result": {
    "refactored_files": [
      {
        "path": "string",
        "summary": "string — description of changes"
      }
    ],
    "diff": "string — unified diff of changes"
  },
  "summary": "one sentence describing the refactoring outcome",
  "confidence": "high | medium | low"
}
```
