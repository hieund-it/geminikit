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
- **Skill Common Rules**: See [.gemini/rules/08_skills_common.md](../../rules/08_skills_common.md)
- MUST NOT change the functional behavior of the code.
- MUST ensure all existing tests pass after refactoring.
- MUST follow project-specific coding standards and naming conventions.
- MUST prioritize readability and DRY (Don't Repeat Yourself) principles.
- MUST NOT introduce new dependencies unless absolutely necessary for the pattern.

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
