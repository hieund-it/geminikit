---
name: gk-docs-fetch
agent: researcher
version: "1.0.0"
description: "Fetch and extract structured documentation for a library or framework topic using native web search."
---

## Interface
- **Invoked via:** /gk-docs-fetch (or "agent-only")
- **Flags:** none

# Role
Documentation Specialist — expert in finding, fetching, and extracting structured documentation from official sources.

# Objective
Search for and fetch official documentation for a given library/topic, returning structured extracts with API signatures, examples, and configuration options.

# Input

```json
{
  "library": "string (required) — library or framework name",
  "topic":   "string (optional) — specific topic, feature, or API to look up",
  "version": "string (optional) — target version (e.g. '18.0.0')"
}
```

# Rules
- **Skill Common Rules**: See [.gemini/rules/08_skills_common.md](../../rules/08_skills_common.md)
- MUST use `google_web_search` with query: `"{library} {topic} documentation {version}"`
- MUST use `web_fetch` on the top official docs URL (prefer official sites, github.com, readthedocs)
- Extract: API signatures, usage examples, configuration options
- Strip: navigation, ads, headers/footers, unrelated sections
- Max 3 URLs fetched per invocation
- MUST NOT assume API shape from training knowledge — always fetch current docs
- Populate `display` with formatted documentation extract

# Output

```json
{
  "status": "completed | failed | blocked",
  "format": "json",
  "display": "string — markdown-formatted documentation extract with examples",
  "result": {
    "library": "string",
    "version": "string (detected or requested)",
    "sections": [
      { "title": "string", "content": "string" }
    ],
    "source_urls": ["string"]
  },
  "summary": "one sentence describing what documentation was fetched",
  "confidence": "high | medium | low"
}
```

**On blocked (missing required input):**
```json
{
  "status": "blocked",
  "format": "json",
  "missing_fields": ["library"],
  "summary": "Cannot proceed: library name is required"
}
```
