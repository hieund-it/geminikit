---
variables: [task_id, task_title, phase, gemini_summary, context_files, success_criteria, implementation_steps]
---
# Code Review: {{task_title}}

**Task ID:** {{task_id}}
**Phase:** {{phase}}

## What Gemini Did

{{gemini_summary}}

## Files Changed

{{context_files}}

## Expected Outcome

{{success_criteria}}

## Original Spec

{{implementation_steps}}

## Review Checklist

1. Code compiles and has no syntax errors
2. Implementation matches the spec above
3. No security issues (injection, hardcoded secrets, path traversal, etc.)
4. Code follows project conventions (naming, structure, file size)
5. Edge cases and error scenarios handled appropriately

## Output Format

Provide a brief summary of your findings, then end with **exactly one** of:

```
BRIDGE_STATUS: PASS
```
```
BRIDGE_STATUS: FAIL
```

Use `PASS` only if all checklist items pass. Use `FAIL` if any item fails — include specific details about what needs to be fixed.
