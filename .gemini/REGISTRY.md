# Gemini Kit Registry

This file is automatically managed by `sync_registry.py`. ALWAYS reference this for command structures and skill paths.

---

## Command Recognition

<!-- GK_COMMAND_TABLE_START -->
| Command | Agent | Skills | Description |
|---------|-------|--------|-------------|
| `/gk-analyze [--deep \| --security \| --perf] <args>` | reviewer | gk-analyze | Analyze code or system structure and report findings on complexity, dependencies, and risks. |
| `/gk-audit [--deps \| --static \| --license] <args>` | security | gk-audit | Audit dependencies and static code for security vulnerabilities and license compliance. |
| `/gk-ask [--deep \| --quick] <args>` | (self) | gk-ask | Expert assistant for answering technical and general questions with grounded context. |
| `/gk-brainstorm` | researcher | gk-brainstorm | Software solution brainstorming, architectural evaluation, and technical decision debating. |
| `/gk-compare-logic` | comparator | gk-compare-logic | Compares business logic between a legacy system and a new, migrated system by analyzing their source code. |
| `/gk-debug [--trace \| --deep] <args>` | developer | gk-debug | Identify root cause of a software error and recommend a precise fix. |
| `/gk-fix-bug [--verify \| --deep] <args>` | developer | gk-bug-fixer | Automatically analyze error logs to identify the root cause and generate a verified code fix. |
| `agent-only (documenter)` | documenter | gk-document | Generate accurate technical documentation from provided code content and context. |
| `agent-only (developer) [--dry-run] <args>` | developer | gk-git | Execute git operations: commit, branch, status, PR prep, and conflict detection. |
| `/gk-mcp-manager` | mcp-manager | gk-mcp-manager | Manage MCP server configuration, test connections, and scaffold new servers. |
| `/gk-migrate [--generate \| --apply \| --rollback] <args>` | maintenance | gk-migrate | Manage database schema changes and data migrations. |
| `/gk-monitor [--logs \| --metrics \| --alerts] <args>` | support | gk-monitor | Analyze system logs and monitor performance metrics to detect anomalies. |
| `/gk-onboard [--deep] <args>` | researcher | gk-onboard | Helps users quickly grasp a new project securely. Summarizes architecture, tech stack, dependencies, and development workflow while ensuring sensitive data remains confidential. |
| `/gk-plan [--fast \| --deep \| --parallel \| --from <path> \| --dry-run \| --phase <id>] <args>` | planner | gk-plan | Break down a complex task into structured, executable subtasks with dependencies and effort estimates. |
| `agent-only (planner, orchestrator)` | planner | gk-research | Gather, compare, and synthesize technical options into a structured recommendation report. |
| `/gk-review [--strict \| --quick] <args>` | reviewer | gk-review | Review code for quality, security, performance, and correctness with a scored, actionable report. |
| `/gk-refactor [--pattern \| --modernize \| --cleanup] <args>` | maintenance | gk-refactor | Improve code structure and maintainability without changing external behavior. |
| `/gk-create [- `--skill`: Generate a new skill component at `.gemini/skills/<name>/SKILL.md`] <args>` | developer | gk-skill-creator | Generate agent and skill files following Gemini Kit templates and rules. |
| `agent-only (developer)` | developer | gk-sql | Optimize a SQL query for performance while preserving its logical result. |
| `agent-only (orchestrator)` | developer | gk-summarize | Compress conversation history or agent output into a structured, token-efficient summary. |
| `/gk-design [--spec \| --review] <args>` | designer | gk-ui | Generate precise visual component specs or review implemented UI for design quality and accessibility compliance. |
| `/gk-deploy [--staging \| --production \| --dry-run] <args>` | devops | gk-deploy | Execute build and deployment pipelines to various environments. |
| `/gk-infra [--docker \| --k8s \| --terraform] <args>` | devops | gk-infra | Manage infrastructure as code (Docker, K8s, Terraform configurations). |

<!-- GK_COMMAND_TABLE_END -->

---

## Skill Registry

<!-- GK_SKILL_REGISTRY_START -->
| Skill | File | Modes | Use for |
|-------|------|-------|---------|
| analyze | `.gemini/skills/analyze/SKILL.md` | `deep`, `perf`, `security` | Analyze code or system structure and report findings on complexity, dependencies, and risks. |
| audit | `.gemini/skills/audit/SKILL.md` | `deps`, `static`, `license` | Audit dependencies and static code for security vulnerabilities and license compliance. |
| ask | `.gemini/skills/ask/SKILL.md` | `deep`, `quick` | Expert assistant for answering technical and general questions with grounded context. |
| brainstorm | `.gemini/skills/brainstorm/SKILL.md` | — | Software solution brainstorming, architectural evaluation, and technical decision debating. |
| compare-logic | `.gemini/skills/compare-logic/SKILL.md` | `deep`, `quick` | Compares business logic between a legacy system and a new, migrated system by analyzing their source code. |
| debug | `.gemini/skills/debug/SKILL.md` | `deep`, `trace` | Identify root cause of a software error and recommend a precise fix. |
| deploy | `.gemini/skills/deploy/SKILL.md` | `staging`, `production`, `dry-run` | Execute build and deployment pipelines to various environments. |
| bug-fixer | `.gemini/skills/bug-fixer/SKILL.md` | `verify`, `deep` | Automatically analyze error logs to identify the root cause and generate a verified code fix. |
| document | `.gemini/skills/document/SKILL.md` | — | Generate accurate technical documentation from provided code content and context. |
| git | `.gemini/skills/git/SKILL.md` | — | Execute git operations: commit, branch, status, PR prep, and conflict detection. |
| infra | `.gemini/skills/infra/SKILL.md` | `docker`, `k8s`, `terraform` | Manage infrastructure as code (Docker, K8s, Terraform configurations). |
| mcp-manager | `.gemini/skills/mcp-manager/SKILL.md` | — | Manage MCP server configuration, test connections, and scaffold new servers. |
| migrate | `.gemini/skills/migrate/SKILL.md` | `generate`, `apply`, `rollback` | Manage database schema changes and data migrations. |
| monitor | `.gemini/skills/monitor/SKILL.md` | `logs`, `metrics`, `alerts` | Analyze system logs and monitor performance metrics to detect anomalies. |
| onboard | `.gemini/skills/onboard/SKILL.md` | `deep` | Helps users quickly grasp a new project securely. Summarizes architecture, tech stack, dependencies, and development workflow while ensuring sensitive data remains confidential. |
| plan | `.gemini/skills/plan/SKILL.md` | `fast`, `deep`, `parallel`, `from`, `dry-run`, `phase` | Break down a complex task into structured, executable subtasks with dependencies and effort estimates. |
| research | `.gemini/skills/research/SKILL.md` | — | Gather, compare, and synthesize technical options into a structured recommendation report. |
| review | `.gemini/skills/review/SKILL.md` | `strict`, `quick`, `api`, `security`, `perf` | Review code for quality, security, performance, and correctness with a scored, actionable report. |
| refactor | `.gemini/skills/refactor/SKILL.md` | `pattern`, `modernize`, `cleanup` | Improve code structure and maintainability without changing external behavior. |
| skill-creator | `.gemini/skills/skill-creator/SKILL.md` | — | Generate agent and skill files following Gemini Kit templates and rules. |
| sql | `.gemini/skills/sql/SKILL.md` | — | Optimize a SQL query for performance while preserving its logical result. |
| summarize | `.gemini/skills/summarize/SKILL.md` | — | Compress conversation history or agent output into a structured, token-efficient summary. |
| ui | `.gemini/skills/ui/SKILL.md` | `spec`, `review` | Generate precise visual component specs or review implemented UI for design quality and accessibility compliance. |

<!-- GK_SKILL_REGISTRY_END -->
