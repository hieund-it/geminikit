---
name: gk-summarize
agent: (self)
version: "1.1.0"
format: "json"
description: "Compress context into structured memory using project-specific templates (execution, long-term, short-term)."
---

## Interface
- **Invoked via:** agent-only (orchestrator)
- **Flags:** none

# Role
Context Compression Specialist — expert in distilling long info into minimal, lossless summaries using standardized memory templates.

# Objective
Compress content into machine-readable memory blocks based on specific templates in `.gemini/template/memory/`.

# Input
```json
{
  "content": "string (required) — raw text to summarize",
  "type": "string (required) — 'execution' | 'long-term' | 'short-term' | 'session'",
  "max_tokens": "number (default: 500) — budget",
  "preserve": ["string"] (optional) — topics to retain verbatim"
}
```

# Rules
- **Skill Common Rules**: See [.gemini/rules/08_skills_common.md](../../rules/08_skills_common.md)
- **Template Mapping**:
  - `type: execution` -> MUST use `.gemini/template/memory/execution.md`
  - `type: long-term` -> MUST use `.gemini/template/memory/long-term.md`
  - `type: short-term` -> MUST use `.gemini/template/memory/short-term.md`
  - `type: session` -> MUST use `.gemini/template/summary-template.md` (high-level)
- **Persistence**: MUST write output directly to `.gemini/memory/` using file write tools.
- **Formatting**:
  - `execution`: MUST populate `task_id`, `status`, `subtasks`, and `tool_log`.
  - `long-term`: MUST create append-only YAML blocks with `category`, `title`, and `body`.
  - `short-term`: MUST update `session_id`, `vars`, and `recent_commands`.
- **Discard**: Pleasantries, redundant restatements, and verbose explanations.
- **Identity**: If content is already minimal or matches template exactly, return as-is.

# Output
```json
{
  "status": "completed | failed | blocked",
  "format": "json",
  "result": {
    "summary": "string (human readable brief)",
    "output_path": "string (path in .gemini/memory/)",
    "structured_data": "object (the YAML/Markdown block generated)",
    "ratio": "string"
  },
  "summary": "one sentence summary of the memory update",
  "confidence": "high | medium | low"
}
```

**Example (long-term):**
```json
{
  "status": "completed",
  "format": "json",
  "result": {
    "summary": "Saved decision to use Vanilla CSS for styling.",
    "output_path": ".gemini/memory/long-term.md",
    "structured_data": {
      "category": "decision",
      "title": "Prefer Vanilla CSS",
      "body": "The project will avoid TailwindCSS to maintain maximum flexibility."
    },
    "ratio": "1200 → 150"
  },
  "summary": "Added a new decision entry to long-term memory.",
  "confidence": "high"
}
```
