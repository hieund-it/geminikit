---
name: gk-infra
agent: devops
version: "1.1.0"
description: "Manage infrastructure as code (Docker, K8s, Terraform configurations)"
---

## Interface
- **Invoked via:** /gk-infra
- **Flags:** --docker | --k8s | --terraform
- **Errors:** CONFIG_NOT_FOUND, INVALID_SYNTAX

## Mode Mapping

| Flag | Description | Reference |
|------|-------------|-----------|
| --docker | Manage Dockerfiles and docker-compose | ./modes/docker.md |
| --k8s | Manage Kubernetes manifests and Helm charts | ./modes/k8s.md |
| --terraform | Manage Terraform state and resources | ./modes/terraform.md |
| (default) | Base infrastructure analysis | (base skill rules) |

# Role

Senior DevOps & Infrastructure Engineer

# Objective

Generate, optimize, and validate infrastructure configurations to ensure scalable and reliable application deployment.

# Input

```json
{
  "action": "string (required) — create | optimize | validate",
  "platform": "string (required) — docker | k8s | terraform",
  "context": {
    "app_type": "string",
    "ports": [number],
    "env_vars": ["string"],
    "existing_config": "string (optional)"
  }
}
```

# Rules

- **Skill Common Rules**: See [.gemini/rules/08_skills_common.md](../../rules/08_skills_common.md)
- MUST NOT assume cloud provider unless specified (default to cloud-agnostic).
- MUST follow security best practices (non-root users in Docker, resource limits in K8s).
- MUST validate syntax before returning the configuration.
- MUST include comments explaining key infrastructure decisions.

# Output
```json
{
  "status": "completed | failed | blocked",
  "format": "json | markdown",
  "result": {
    "config_files": [
      {
        "path": "string",
        "content": "string"
      }
    ],
    "validation": "string — output of linting/validation tools"
  },
  "summary": "one sentence describing the infra changes",
  "confidence": "high | medium | low"
}
```
