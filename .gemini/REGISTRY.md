# Gemini Kit Registry

This file is automatically managed by `sync_registry.py`. ALWAYS reference this for command structures and skill paths.

---

## Command Recognition

<!-- GK_COMMAND_TABLE_START -->
| Command | Agent | Skills | Description |
|---------|-------|--------|-------------|
| `/gk-analyze [--deep \| --security \| --perf] <args>` | reviewer | gk-analyze | Analyze code or system structure and report findings on complexity, dependencies, and risks. |
| `/gk-review [--strict \| --quick \| --security \| --perf] <args>` | reviewer | gk-review | Comprehensive review of code quality, security, and performance. |
| `agent-only (developer, reviewer)` | reviewer | gk-review | Design, review, or debug code based on provided spec and context. |
| `/gk-ask [--deep \| --quick] <args>` | (self) | gk-ask | Expert assistant for answering technical and general questions with grounded context. |
| `/gk-brainstorm` | architect | gk-brainstorm | Software solution brainstorming, architectural evaluation, and technical decision debating. |
| `/gk-compare-logic` | comparator | gk-compare-logic | Compares business logic between a legacy system and a new, migrated system by analyzing their source code. |
| `/gk-debug [--trace \| --deep] <args>` | developer | gk-debug | Identify root cause of a software error and recommend a precise fix. |
| `agent-only (documenter)` | documenter | gk-document | Generate accurate technical documentation from provided code content and context. |
| `agent-only (developer) [--dry-run] <args>` | developer | gk-git | Execute git operations: commit, branch, status, PR prep, and conflict detection. |
| `/gk-mcp-manager` | mcp-manager | gk-mcp-manager | Manage MCP server configuration, test connections, and scaffold new servers. |
| `/gk-onboard [--deep] <args>` | researcher | gk-onboard | Helps users quickly grasp a new project securely. Summarizes architecture, tech stack, dependencies, and development workflow while ensuring sensitive data remains confidential. |
| `/gk-plan [--fast \| --deep \| --parallel \| --from <path> \| --dry-run \| --phase <id>] <args>` | planner | gk-plan | Break down a complex task into structured, executable subtasks with dependencies and effort estimates. |
| `agent-only (planner, orchestrator)` | planner | gk-research | Gather, compare, and synthesize technical options into a structured recommendation report. |
| `/gk-create [- `--skill`: Generate a new skill component at `.gemini/skills/<name>/SKILL.md`] <args>` | developer | gk-skill-creator | Generate agent and skill files following Gemini Kit templates and rules. |
| `agent-only (developer)` | developer | gk-sql | Optimize a SQL query for performance while preserving its logical result. |
| `agent-only (orchestrator)` | developer | gk-summarize | Compress conversation history or agent output into a structured, token-efficient summary. |
| `/gk-design [--spec \| --review] <args>` | designer | gk-ui | Generate precise visual component specs or review implemented UI for design quality and accessibility compliance. |

<!-- GK_COMMAND_TABLE_END -->

---

## Skill Registry

<!-- GK_SKILL_REGISTRY_START -->
| Skill | File | Modes | Use for |
|-------|------|-------|---------|
| analyze | `.gemini/skills/analyze/SKILL.md` | `deep`, `perf`, `security` | Analyze code or system structure and report findings on complexity, dependencies, and risks. |
| review | `.gemini/skills/review/SKILL.md` | `strict`, `quick`, `security`, `perf` | Comprehensive review of code quality, security, and performance with actionable findings. |
| ask | `.gemini/skills/ask/SKILL.md` | — | Expert assistant for answering technical and general questions with grounded context. |
| brainstorm | `.gemini/skills/brainstorm/SKILL.md` | — | Software solution brainstorming, architectural evaluation, and technical decision debating. |
| compare-logic | `.gemini/skills/compare-logic/SKILL.md` | `deep`, `quick` | Compares business logic between a legacy system and a new, migrated system by analyzing their source code. |
| debug | `.gemini/skills/debug/SKILL.md` | `deep`, `trace` | Identify root cause of a software error and recommend a precise fix. |
| document | `.gemini/skills/document/SKILL.md` | — | Generate accurate technical documentation from provided code content and context. |
| git | `.gemini/skills/git/SKILL.md` | — | Execute git operations: commit, branch, status, PR prep, and conflict detection. |
| mcp-manager | `.gemini/skills/mcp-manager/SKILL.md` | — | Manage MCP server configuration, test connections, and scaffold new servers. |
| onboard | `.gemini/skills/onboard/SKILL.md` | — | Helps users quickly grasp a new project securely. Summarizes architecture, tech stack, dependencies, and development workflow while ensuring sensitive data remains confidential. |
| plan | `.gemini/skills/plan/SKILL.md` | — | Break down a complex task into structured, executable subtasks with dependencies and effort estimates. |
| research | `.gemini/skills/research/SKILL.md` | — | Gather, compare, and synthesize technical options into a structured recommendation report. |
| skill-creator | `.gemini/skills/skill-creator/SKILL.md` | — | Generate agent and skill files following Gemini Kit templates and rules. |
| sql | `.gemini/skills/sql/SKILL.md` | — | Optimize a SQL query for performance while preserving its logical result. |
| summarize | `.gemini/skills/summarize/SKILL.md` | — | Compress conversation history or agent output into a structured, token-efficient summary. |
| ui | `.gemini/skills/ui/SKILL.md` | — | Generate precise visual component specs or review implemented UI for design quality and accessibility compliance. |

<!-- GK_SKILL_REGISTRY_END -->
