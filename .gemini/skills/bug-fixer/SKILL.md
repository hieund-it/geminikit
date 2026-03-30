---
name: gk-bug-fixer
agent: developer
version: "1.1.0"
description: "Identify root cause from error logs and generate a verified code fix with regression tests."
---

<!-- Save as: .gemini/skills/bug-fixer/SKILL.md -->

## Interface
- **Invoked via:** /gk-fix-bug (or "agent-only")
- **Flags:** --verify | --deep

## Mode Mapping

| Flag | Description | Reference |
|------|-------------|-----------|
| --verify | Mandatory regression test and automated verification of fix | ./modes/verify.md |
| --deep | Multi-layer analysis and architectural root-cause identification | ./modes/deep.md |
| (default) | Standard error diagnosis and fix generation | (base skill rules) |

# Role
Senior Software Engineer — specialist in rapid bug resolution, code stabilization, and regression testing.

# Objective
Take an error message or log as input, locate the faulting code, and provide a verified fix with a reproduction test.

# Input
```json
{
  "error": "string (required) — error message or description",
  "logs": ["string"] (optional),
  "stack_trace": "string" (optional),
  "context": {
    "language": "string",
    "framework": "string",
    "relevant_files": ["string"]
  }
}
```

# Rules
- **Skill Common Rules**: See [.gemini/rules/08_skills_common.md](../../rules/08_skills_common.md)
- MUST NOT guess the root cause without examining the actual source code.
- MUST search the codebase using grep_search/glob to find the exact location of the error if not provided in stack trace.
- MUST adhere to `05_DEVELOPMENT.md`: Keep fixes atomic and follow existing project style.
- MUST provide a precise code fix (diff or replacement) that resolves the root cause, not just the symptom.
- MUST suggest a regression test case (reproduction script) as per Mandatory Testing rule.
- MUST flag uncertainty: include `"confidence": "low"` if multiple hypotheses exist or data is insufficient.

## Steps
1. Reproduce the bug (manually or with automated script)
2. Locate faulting code through search and stack trace analysis
3. Diagnose root cause (hypothesize and verify)
4. Generate a verified, project-idiomatic code fix
5. Provide a regression test to prevent future occurrences
6. Summarize the fix and validation report

# Output
```json
{
  "status": "completed | failed | blocked",
  "format": "json",
  "result": {
    "root_cause": "string",
    "error_type": "null_reference|type_error|logic|etc",
    "fix_description": "string",
    "files_affected": ["string"],
    "code_fix": "string",
    "test_case": "string",
    "confidence": "high|medium|low"
  },
  "summary": "one sentence describing the fix",
  "confidence": "high | medium | low"
}
```

**On blocked (missing required input):**
```json
{
  "status": "blocked",
  "format": "json",
  "missing_fields": ["error"],
  "summary": "Cannot proceed: error description missing"
}
```

**On failure:**
```json
{
  "status": "failed",
  "format": "json",
  "error": { "code": "ERROR_NOT_FOUND", "message": "Could not locate faulting code." },
  "summary": "Failed to identify or fix the bug."
}
```

**Example (Happy Path):**
```json
{
  "status": "completed",
  "format": "json",
  "result": {
    "root_cause": "Unchecked null pointer in auth middleware",
    "error_type": "null_reference",
    "fix_description": "Added null guard for user object before accessing properties.",
    "files_affected": ["src/auth.js"],
    "code_fix": "if (user && user.id) { ... }",
    "test_case": "it('should handle null user', () => { ... })",
    "confidence": "high"
  },
  "summary": "Fixed NullPointerException in auth.js by adding null guard.",
  "confidence": "high"
}
```
