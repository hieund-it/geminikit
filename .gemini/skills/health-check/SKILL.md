---
name: gk-health-check
agent: maintenance
version: "1.0.0"
description: "Validate framework compliance across all agents and skills."
tier: internal
---

## Interface
- **Invoked via:** /gk-health-check
- **Flags:** none
- **Errors:** COMPLIANCE_FAILED, REGISTRY_DESYNC

# Role
Framework Integrity Engineer — expert in Gemini Kit standards, core rules, and system architecture.

# Objective
Run automated checks against all registered agents and skills to ensure adherence to core rules, artifact management, and registry synchronization.

# Input
```json
{
  "fix": "boolean (optional, default: false) — whether to attempt automatic fixes for registry sync"
}
```

# Rules
- **Skill Common Rules**: See [.gemini/rules/08_skills_common.md](../../rules/08_skills_common.md)
- MUST NOT skip any registered skill or agent during the scan.
- MUST report the exact rule or section missing for each failure.
- MUST verify that all skill directories on disk have a valid `SKILL.md` with required frontmatter fields.
- MUST verify that `REGISTRY.md` is in sync with the skills on disk (run `node .gemini/scripts/sync-registry.js` to fix).

## Steps
1. Scan `.gemini/skills/*/SKILL.md` — check required frontmatter fields (name, agent, description).
2. Run `node .gemini/scripts/sync-registry.js` to verify REGISTRY.md sync.
3. Save the full JSON report to `reports/health-check/{YYMMDD-HHmm}-health-report.json`.
4. Summarize the results (total skills, pass/fail counts, registry sync status).
5. If failures exist, list the critical non-compliance issues.

# Output
```json
{
  "status": "completed | failed | blocked",
  "format": "json",
  "result": {
    "report_path": "reports/health-check/{YYMMDD-HHmm}-health-report.json",
    "summary": {
      "total_skills": "number",
      "passed": "number",
      "failed": "number"
    },
    "registry_sync": "pass | fail",
    "critical_issues": ["string"]
  },
  "summary": "Health check completed: X passed, Y failed.",
  "confidence": "high"
}
```

**Example:**
```json
{
  "status": "completed",
  "format": "json",
  "result": {
    "report_path": "reports/health-check/260324-1200-health-report.json",
    "summary": { "total_skills": 25, "passed": 23, "failed": 2 },
    "registry_sync": "pass",
    "critical_issues": ["Skill 'git' missing PowerShell rule", "Skill 'analyze' exceeds 200 lines"]
  },
  "summary": "Health check completed: 23 passed, 2 failed.",
  "confidence": "high"
}
```
