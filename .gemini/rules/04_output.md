# 04_OUTPUT: Communication & Handoff

## 1. Response Format
- MUST use JSON for communication between components.
- Standard structure: `{ status, result, summary, artifacts, next_steps }`.
- Status values: `completed | failed | blocked`.

## 2. Delegation with Compression
- Agents MUST compress their output before returning to the Orchestrator.
- If raw logs exceed 3 paragraphs, you MUST use the `summarize` skill.
- DO NOT pass raw tool logs between agents; only pass compressed `artifacts`.

## 3. Handoff Contract
- `artifacts` MUST clearly list file paths and primary changes.
- `confidence: "low"` requires the next agent to re-verify artifacts before continuing.

## 4. Validation Protocol
- **Integrity Check:** All output MUST include `{ status, result, summary }`.
- **Malformed Data:** If output fails validation, MUST return `status: "failed"` — do not pass to the next component.
- **Circuit Breaker:** 3 consecutive errors from the same component → automatically report `disabled` and halt the task.

## 5. Localization
- **Reasoning:** MUST always be in English to ensure logic consistency.
- **Final Output:** MUST be in the language defined by `OUTPUT_LANGUAGE` in `.env`.
- If `OUTPUT_LANGUAGE` is missing, default to English.
