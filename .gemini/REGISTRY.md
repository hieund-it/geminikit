# Gemini Kit Registry

This file is automatically managed by `sync_registry.py`. ALWAYS reference this for command structures and skill paths.

---

## Command Recognition

<!-- GK_COMMAND_TABLE_START -->
| Command | Agent | Skills | Description |
|---------|-------|--------|-------------|
| `/gk-analyze [--deep \| --security \| --perf] <args>` | reviewer | gk-analyze | Analyze code or system structure and report findings on complexity, dependencies, and risks. |
| `/gk-ask [--deep \| --quick] <args>` | (self) | gk-ask | Expert assistant for answering technical and general questions with grounded context. |
| `/gk-audit [--deps \| --static \| --license] <args>` | security | gk-audit | Audit dependencies and static code for security vulnerabilities and license compliance |
| `/gk-brainstorm` | researcher | gk-brainstorm | Software solution brainstorming, architectural evaluation, and technical decision debating. |
| `Bridge orchestrator (`orchestrator.py`) — not directly by users` | developer | gk-bridge-task-runner | Execute a bridge pipeline task and signal completion by updating the task JSON status. |
| `/gk-fix-bug (or "agent-only") [--verify \| --deep] <args>` | developer | gk-bug-fixer | Identify root cause from error logs and generate a verified code fix with regression tests. |
| `/gk-compare-logic [--deep \| --quick] <args>` | comparator | gk-compare-logic | Compares business logic between a legacy system and a new, migrated system by analyzing their source code. |
| `/gk-debug [--trace \| --deep] <args>` | support | gk-debug | Identify root cause of a software error and recommend a precise fix. |
| `/gk-deploy [--staging \| --production \| --dry-run] <args>` | devops | gk-deploy | Execute build and deployment pipelines to various environments |
| `agent-only (documenter)` | documenter | gk-document | Generate accurate technical documentation from provided code content and context. |
| `/gk-export-session` | developer | gk-export-session | Exports the current session state and conversation summary for continuation. |
| `agent-only (developer) [--dry-run] <args>` | developer | gk-git | Execute git operations: commit, branch, status, PR prep, and conflict detection. |
| `/gk-infra [--docker \| --k8s \| --terraform] <args>` | devops | gk-infra | Manage infrastructure as code (Docker, K8s, Terraform configurations) |
| `/gk-mcp-manager` | mcp-manager | gk-mcp-manager | Manage MCP server configuration, test connections, and scaffold new servers. Use this skill to add/edit/remove MCP servers or to troubleshoot connectivity. |
| `/gk-migrate [--generate \| --apply \| --rollback] <args>` | maintenance | gk-migrate | Manage database schema changes and data migrations |
| `/gk-monitor [--logs \| --metrics \| --alerts] <args>` | support | gk-monitor | Analyze system logs and monitor performance metrics to detect anomalies |
| `/gk-onboard [--deep] <args>` | researcher | gk-onboard | Helps users quickly grasp a new project securely. Summarizes architecture, tech stack, dependencies, and development workflow while ensuring sensitive data remains confidential. |
| `/gk-plan [--fast \| --deep \| --parallel \| --from <path> \| --dry-run \| --phase <id>] <args>` | planner | gk-plan | Break down a complex task into structured, executable subtasks with dependencies and effort estimates. |
| `/gk-refactor [--pattern \| --modernize \| --cleanup] <args>` | maintenance | gk-refactor | Improve code structure and maintainability without changing external behavior |
| `agent-only (planner, orchestrator)` | planner | gk-research | Gather, compare, and synthesize technical options into a structured recommendation report. |
| `/gk-review [--strict \| --quick \| --api \| --security \| --perf] <args>` | reviewer | gk-review | Comprehensive review of code quality, API design, security, and performance with actionable findings. |
| `/gk-create [- `--skill`: Generate a new skill component at `.gemini/skills/<name>/SKILL.md`] <args>` | developer | gk-skill-creator | Generate agent and skill files following Gemini Kit templates and rules. |
| `agent-only (developer)` | developer | gk-sql | Optimize a SQL query for performance while preserving its logical result. |
| `agent-only (orchestrator)` | (self) | gk-summarize | Compress conversation history or agent output into a structured, token-efficient summary. |
| `/gk-design [--spec \| --review] <args>` | designer | gk-ui | Generate precise visual component specs or review implemented UI for design quality and accessibility compliance. |

<!-- GK_COMMAND_TABLE_END -->

---

## Skill Registry

<!-- GK_SKILL_REGISTRY_START -->
| Skill | File | Modes | Use for |
|-------|------|-------|---------|
| analyze | `.gemini/skills/analyze/SKILL.md` | `deep`, `perf`, `security` | Analyze code or system structure and report findings on complexity, dependencies, and risks. |
| ask | `.gemini/skills/ask/SKILL.md` | `deep`, `quick` | Expert assistant for answering technical and general questions with grounded context. |
| audit | `.gemini/skills/audit/SKILL.md` | — | Audit dependencies and static code for security vulnerabilities and license compliance |
| brainstorm | `.gemini/skills/brainstorm/SKILL.md` | — | Software solution brainstorming, architectural evaluation, and technical decision debating. |
| bridge-task-runner | `.gemini/skills/bridge-task-runner/SKILL.md` | — | Execute a bridge pipeline task and signal completion by updating the task JSON status. |
| bug-fixer | `.gemini/skills/bug-fixer/SKILL.md` | `deep`, `verify` | Identify root cause from error logs and generate a verified code fix with regression tests. |
| compare-logic | `.gemini/skills/compare-logic/SKILL.md` | `deep`, `quick` | Compares business logic between a legacy system and a new, migrated system by analyzing their source code. |
| debug | `.gemini/skills/debug/SKILL.md` | `deep`, `trace` | Identify root cause of a software error and recommend a precise fix. |
| deploy | `.gemini/skills/deploy/SKILL.md` | — | Execute build and deployment pipelines to various environments |
| document | `.gemini/skills/document/SKILL.md` | — | Generate accurate technical documentation from provided code content and context. |
| export-session | `.gemini/skills/export-session/SKILL.md` | — | Exports the current session state and conversation summary for continuation. |
| git | `.gemini/skills/git/SKILL.md` | — | Execute git operations: commit, branch, status, PR prep, and conflict detection. |
| infra | `.gemini/skills/infra/SKILL.md` | — | Manage infrastructure as code (Docker, K8s, Terraform configurations) |
| mcp-manager | `.gemini/skills/mcp-manager/SKILL.md` | — | Manage MCP server configuration, test connections, and scaffold new servers. Use this skill to add/edit/remove MCP servers or to troubleshoot connectivity. |
| migrate | `.gemini/skills/migrate/SKILL.md` | — | Manage database schema changes and data migrations |
| monitor | `.gemini/skills/monitor/SKILL.md` | — | Analyze system logs and monitor performance metrics to detect anomalies |
| onboard | `.gemini/skills/onboard/SKILL.md` | `deep` | Helps users quickly grasp a new project securely. Summarizes architecture, tech stack, dependencies, and development workflow while ensuring sensitive data remains confidential. |
| plan | `.gemini/skills/plan/SKILL.md` | `deep`, `dry-run`, `fast`, `from`, `parallel`, `phase` | Break down a complex task into structured, executable subtasks with dependencies and effort estimates. |
| refactor | `.gemini/skills/refactor/SKILL.md` | — | Improve code structure and maintainability without changing external behavior |
| research | `.gemini/skills/research/SKILL.md` | — | Gather, compare, and synthesize technical options into a structured recommendation report. |
| review | `.gemini/skills/review/SKILL.md` | `api`, `perf`, `quick`, `security`, `strict` | Comprehensive review of code quality, API design, security, and performance with actionable findings. |
| skill-creator | `.gemini/skills/skill-creator/SKILL.md` | — | Generate agent and skill files following Gemini Kit templates and rules. |
| sql | `.gemini/skills/sql/SKILL.md` | — | Optimize a SQL query for performance while preserving its logical result. |
| summarize | `.gemini/skills/summarize/SKILL.md` | — | Compress conversation history or agent output into a structured, token-efficient summary. |
| ui | `.gemini/skills/ui/SKILL.md` | `review`, `spec` | Generate precise visual component specs or review implemented UI for design quality and accessibility compliance. |

<!-- GK_SKILL_REGISTRY_END -->
