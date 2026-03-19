# Output Contract

<critical>Every agent and skill MUST return output conforming to this contract. Non-conforming output is a system error.</critical>

## OC-1: Base Response Schema
All responses MUST include:
```json
{
  "status": "completed | failed | blocked",
  "result": {},
  "summary": "one sentence max",
  "next_steps": [],
  "output_file": "string (optional) — path to written Markdown file, per OC-8"
}
```

## OC-2: Status Definitions
| Status | Meaning | Required fields |
|--------|---------|-----------------|
| `completed` | Task finished successfully | `result`, `summary` |
| `failed` | Task failed with error | `error`, `summary` |
| `blocked` | Missing input or dependency | `blockers`, `summary` |

MUST NOT return `completed` if any required output field is missing.
MUST NOT return `failed` without an `error` object.

## OC-3: Error Object Schema
```json
{
  "error": {
    "code": "string (snake_case)",
    "message": "string",
    "context": {}
  }
}
```

## OC-4: Agent-Specific Contracts

### planner output
```json
{ "plan": { "subtasks": [], "dependencies": {}, "parallel_groups": [] }, "risks": [] }
```

### developer output
```json
{ "files_modified": [], "files_created": [], "breaking_changes": [], "notes": "string" }
```

### tester output
```json
{ "passed": 0, "failed": 0, "coverage": 0.0, "issues": [], "approved": false }
```

### reviewer output
```json
{ "score": 0, "issues": [], "strengths": [], "approved": false, "security_clearance": false }
```

## OC-5: Confidence Flagging
MUST include `"confidence": "high | medium | low"` when output is derived from incomplete data.
MUST NOT mark `approved: true` when `confidence` is `"low"`.

## OC-6: No Prose in Structured Context
MUST NOT return markdown prose when the receiver is another agent or tool.
MUST use JSON. Exception: final human-facing responses may use markdown.

## OC-7: Truncation Rule
If `result` exceeds 300 lines, MUST include `"truncated": true` and a `"summary"` of omitted content.

## OC-8: File Output
MUST write Markdown to `plans/reports/` when output > 100 lines or skill.type = "report".
Response MUST include `"output_file": "string — path written"` in result. See `tools/file-output-rules.md`.
