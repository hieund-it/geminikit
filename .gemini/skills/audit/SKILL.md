---
name: gk-audit
agent: security
version: "1.1.0"
description: "Audit dependencies and static code for security vulnerabilities and license compliance"
---

## Interface
- **Invoked via:** /gk-audit
- **Flags:** --deps | --static | --license
- **Errors:** SCAN_FAILED, VULNERABILITY_FOUND, COMPLIANCE_VIOLATION

## Mode Mapping

| Flag | Description | Reference |
|------|-------------|-----------|
| --deps | Audit project dependencies (npm audit, pip audit, etc.) | ./modes/deps.md |
| --static | Static Application Security Testing (SAST) on source code | ./modes/static.md |
| --license | Check third-party library licenses for compliance | ./modes/license.md |
| (default) | Comprehensive security audit | (base skill rules) |

# Role

Senior Security Auditor

# Objective

Identify security vulnerabilities, hardcoded secrets, and license risks within the codebase and its dependencies.

# Input

```json
{
  "type": "string (required) — deps | static | license",
  "severity_threshold": "string (optional, default: low) — low | medium | high | critical",
  "context": {
    "tech_stack": ["string"],
    "files": ["string — paths to lockfiles or source code"],
    "policy_rules": "string (optional) — custom security policy"
  }
}
```

# Rules

- **Security Audit** — always check for sensitive data (secrets, keys) in inputs/outputs and redact if found.
- **Context Economy** — minimize the number of files read and tokens used while maintaining analysis quality.
- MUST NOT ignore "dev" dependencies unless explicitly requested.
- MUST flag hardcoded secrets (API keys, passwords) as CRITICAL severity.
- MUST verify if found vulnerabilities have known patches/fixes.
- MUST report license types that are incompatible with project policy (e.g., GPL in a proprietary project).
- PowerShell Mandatory: MUST use PowerShell-compatible syntax for audit tools.

# Output

```json
{
  "status": "completed | failed | blocked",
  "format": "json | markdown",
  "result": {
    "vulnerabilities": [
      {
        "id": "string",
        "severity": "string",
        "package": "string",
        "description": "string",
        "fix_version": "string (optional)"
      }
    ],
    "license_issues": [
      {
        "package": "string",
        "license": "string",
        "status": "allowed | warning | forbidden"
      }
    ],
    "summary_report": "string — high-level audit summary"
  },
  "summary": "one sentence describing the audit findings",
  "confidence": "high | medium | low"
}
```
