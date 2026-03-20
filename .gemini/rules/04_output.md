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
- **Malformed Data:** If output fails validation, BẮT BUỘC trả về `status: "failed"` và không được chuyển giao cho thành phần kế tiếp.
- **Circuit Breaker:** 3 liên tiếp lỗi từ cùng một thành phần → Tự động báo cáo `disabled` và dừng tác vụ.

