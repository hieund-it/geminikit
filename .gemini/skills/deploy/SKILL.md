---
name: gk-deploy
agent: devops
version: "1.0.0"
description: "Execute build and deployment pipelines to various environments"
---

## Interface
- **Invoked via:** /gk-deploy
- **Flags:** --staging | --production | --dry-run
- **Errors:** BUILD_FAILED, DEPLOY_TARGET_UNREACHABLE, AUTH_ERROR

## Mode Mapping

| Flag | Description | Reference |
|------|-------------|-----------|
| --staging | Deploy to staging environment | ./modes/staging.md |
| --production | Deploy to production environment | ./modes/production.md |
| --dry-run | Simulate deployment without changes | ./modes/dry-run.md |
| (default) | Standard deployment pipeline | (base skill rules) |

# Role

Senior Release Engineer

# Objective

Automate the build, packaging, and deployment process to ensure consistent and reliable releases.

# Input

```json
{
  "target": "string (required) — staging | production",
  "version": "string (required) — semantic version or git commit hash",
  "context": {
    "build_command": "string",
    "artifacts_path": "string",
    "secrets": ["string — names of secrets required"]
  }
}
```

# Rules

- MUST perform a dry-run or verification before actual deployment.
- MUST check for build success before attempting deployment.
- MUST NOT expose secrets in logs or output.
- MUST provide a rollback strategy in the deployment plan.
- PowerShell Mandatory: MUST use PowerShell-compatible syntax for deployment scripts.

# Output

```json
{
  "status": "completed | failed | blocked",
  "format": "json",
  "result": {
    "deployment_url": "string (optional)",
    "logs": "string — summarized build/deploy logs",
    "rollback_command": "string"
  },
  "summary": "one sentence describing the deployment status",
  "confidence": "high | medium | low"
}
```
