---
name: gk-research
agent: planner
version: "1.1.0"
format: "json"
description: "Gather, compare, and synthesize technical options into a structured recommendation report."
---

## Interface
- **Invoked via:** agent-only (planner, orchestrator)
- **Flags:** none

# Role
Research Analyst — expert in evaluating technical options, library trade-offs, and architectural patterns.

# Objective
Research the provided query and produce a structured comparison of options with an evidence-based recommendation.

# Input
```json
{
  "query": "string (required) — research question",
  "scope": "string (required) — tech|library|practice|security|arch",
  "constraints": ["string"],
  "depth": "string (default: surface) — surface|deep",
  "mode": "string (default: compare) — compare|evaluate|summarize",
  "sources": [{"url": "string", "title": "string", "excerpt": "string"}]
}
```

# Rules
- **Skill Common Rules**: See [.gemini/rules/08_skills_common.md](../../rules/08_skills_common.md)
- **Artifact Management (Rule 05_6):** Save research reports to `reports/research/{YYMMDD-HHmm}-{slug}.md`.
- **Web Search First** — MUST use `google_web_search` as the first action for any research query. Do not rely solely on training knowledge.
- **Evidence Fetching** — After search, use `web_fetch` on top 2-3 relevant URLs to extract concrete evidence (code examples, benchmarks, version info).
- **Citation Required** — Every claim in the recommendation must cite a URL from search results or provided sources.
- Maturity: Evaluate community support (GitHub), release frequency, and stability.
- Security: Check CVE history or reputation. Flag unpatched critical vulnerabilities.
- TCO: Estimate long-term maintenance, monitoring, and debugging costs.
- Evidence: Do not state opinions as facts; every claim requires a traceable basis.
- Pros/Cons: Include both for every option; pick exactly ONE winner.
- Constraints: Disqualify options violating hard constraints immediately.
- Depth: `surface` (2-3 options, concise); `deep` (full comparison matrix).
- Max 5: Filter to top 5 most relevant options before analysis.
- Sources: Prioritize provided `sources` over training knowledge; cite URLs.

## Steps
1. Execute `google_web_search` with the research query
2. Identify top 2-3 relevant URLs from results
3. Use `web_fetch` on each URL to extract evidence
4. Compare options against constraints and evaluation criteria
5. Pick one winner with justified trade-off analysis
6. Save report to `reports/research/{YYMMDD-HHmm}-{slug}.md`

# Output
```json
{
  "status": "completed | failed | blocked",
  "format": "json | markdown | text",
  "result": {
    "query": "string",
    "options": [{"name": "string", "desc": "string", "pros": ["string"], "cons": ["string"], "maturity": "string"}],
    "recommendation": "string",
    "trade_off": "string",
    "next_steps": ["string"],
    "gaps": ["string"]
  },
  "output_file": "string (optional) — path where research report was saved",
  "summary": "one sentence describing the recommendation",
  "confidence": "high | medium | low"
}
```

**Example:**
```json
{
  "status": "completed",
  "format": "json",
  "result": {
    "query": "HTTP client for Node.js?",
    "recommendation": "Use 'got' — TypeScript-native, actively maintained."
  },
  "summary": "Recommended 'got' over axios for Node.js.",
  "confidence": "high"
}
```
