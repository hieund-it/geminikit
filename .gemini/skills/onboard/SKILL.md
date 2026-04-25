---
name: gk-onboard
agent: researcher
version: "1.3.0"
format: "json"
description: "Helps users quickly grasp a new project securely. Summarizes architecture, tech stack, dependencies, and development workflow while ensuring sensitive data remains confidential."
---

## Interface
- **Invoked via:** /gk-onboard
- **Flags:** --deep

## Mode Mapping

| Flag | Description | Reference |
|------|-------------|-----------|
| --deep | Exhaustive repository-wide scan and multi-layer dependency analysis | ./modes/deep.md |
| (default) | Standard high-level project summary | (base skill rules) |

# Role
Onboarding Specialist — expert in codebase analysis, tech stack detection, and architectural mapping.

# Objective
Summarize project architecture, tech stack, dependencies, and development workflow while ensuring sensitive data remains confidential.

# Input
```json
{
  "project_path": "string (required) — absolute path to project root",
  "deep_analysis": "boolean (optional, default: false) — if true, performs deep scan"
}
```

# Rules
- **Skill Common Rules**: See [.gemini/rules/08_skills_common.md](../../rules/08_skills_common.md)
- Discovery: Use `ls` or `glob` to identify directory structure.
- **EXCLUDE from scan**: `.gemini/`, `GEMINI.md`, `.geminiignore` — these are AI framework config files, NOT part of the project being onboarded.
- Surgical Read: Use `grep_search` for tech stack signatures (React, Express, etc.).
- Dependency Analysis: Extract critical versions from `package.json`, `requirements.txt`, etc.
- Security: DO NOT read `.env`, `secrets.json`, etc. Report only their presence. Redact any discovered secrets immediately.
- Architecture: Identify entry points and core modules. Focus on application source code, not framework tooling.
- Token Efficiency: Limit `read_file` to 20-50 lines; prefer `grep_search`.
- **Version Verification** — After detecting dependencies from local files, use `google_web_search` to verify latest stable versions and check for known deprecations or security advisories.

## Steps
1. Scan project root to identify directory structure
2. Identify core tech stack (React, Node, Python, etc.)
3. Extract critical dependencies and version information
4. Verify detected dependency versions against latest stable via `google_web_search`
5. Map system architecture and primary entry points
6. Perform initial security audit (secrets presence)
7. Generate summary report for new developer onboarding

# Output
```json
{
  "status": "completed | failed | blocked",
  "format": "json | markdown | text",
  "result": {
    "tech_stack": ["string"],
    "runtime": "string",
    "dependencies": "object",
    "architecture": "object",
    "security_audit": "string",
    "artifacts": ["string"]
  },
  "summary": "one sentence describing project onboarding results",
  "confidence": "high | medium | low"
}
```

**Example:**
```json
{
  "status": "completed",
  "format": "json",
  "result": {
    "tech_stack": ["React", "Node.js"],
    "runtime": "v18.0.0",
    "architecture": { "entry": "src/index.js" }
  },
  "summary": "Onboarding completed for React/Node.js project.",
  "confidence": "high"
}
```
