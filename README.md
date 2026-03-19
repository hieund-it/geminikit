# Gemini Kit

A multi-agent AI development framework for Gemini CLI. Optimizes token usage and standardizes software engineering workflows through specialized agents, atomic skills, and strict rule enforcement.

---

## Architecture

5-layer system — each layer has a single responsibility:

```
Layer 1: Entry Point   GEMINI.md / AGENT.md       parse commands, complexity check, route
Layer 2: Agents        planner/developer/tester/reviewer   single-role executors
Layer 3: Skills        debug/sql/api/analyze/plan/review   atomic, stateless processors
Layer 4: Tools         db-tool/api-tool/script-tool        external I/O only
Layer 5: Memory        short-term/execution/long-term      state management
```

---

## Execution Flow

```
User Input (/gk:command or natural language)
       │
       ▼
AGENT.md — parse + complexity check
       │
       ├─ Simple (explicit /gk: command, single agent, clear scope)
       │       └── route directly to target agent
       │
       └─ Complex (multi-step, /gk:plan, natural language, ambiguous)
               └── planner agent → plan.phases[] DAG
                       ├── sequential phases (A depends on B)
                       └── parallel phases (independent)
                                   │
                               skills/ → tools/ → memory/
                                   │
                           Structured JSON + markdown summary
```

---

## Agent Registry

| Agent | Responsibility | Allowed Skills |
|-------|---------------|----------------|
| `planner` | Task decomposition, dependency mapping, effort estimation | plan, analyze |
| `developer` | Implementation, debugging, code generation | debug, api, sql |
| `tester` | Test execution, validation, coverage | debug, analyze |
| `reviewer` | Code review, security analysis, quality gates | review, analyze |

Rules: one agent per task, no agent calls another agent directly, all routing through Orchestrator.

---

## Command System

```
/gk:<command> [--mode] [task]
```

| Command | Agent | Mode Flags |
|---------|-------|------------|
| `/gk:plan` | planner | `--fast`, `--deep`, `--parallel` |
| `/gk:debug` | developer | `--trace`, `--deep` |
| `/gk:analyze` | reviewer | `--deep`, `--security`, `--perf` |
| `/gk:review` | reviewer | `--strict`, `--quick` |
| `/gk:test` | tester | `--unit`, `--integration`, `--all` |
| `/gk:help` | orchestrator | — |

**Examples:**
```
/gk:plan build authentication system
/gk:debug --trace NullPointerException in UserService
/gk:review --strict src/api/auth.py
/gk:analyze --security src/
```

---

## Project Structure

```
.gemini/
├── AGENT.md              # Orchestrator — parse, complexity check, route, aggregate
├── CORE_RULES.md         # Master ruleset — all 12 mandatory categories (80 lines)
├── system.md             # Global rules applied to all components
├── settings.json         # Gemini CLI runtime config
├── config.yaml           # Optional project-level overrides
│
├── agents/               # Role definitions — loaded on demand
│   ├── planner.md
│   ├── developer.md
│   ├── tester.md
│   └── reviewer.md
│
├── skills/               # Atomic, stateless task executors
│   ├── debug.md
│   ├── sql.md
│   ├── api.md
│   ├── analyze.md
│   ├── plan.md
│   ├── review.md
│   └── install.sh
│
├── commands/             # /gk: command handlers
│   ├── plan.md, debug.md, analyze.md, review.md, test.md, help.md
│
├── rules/                # Constraint and policy files
│   ├── safety.md               # SAF-1…8: destructive op guards, input validation
│   ├── orchestrator-rules.md   # OR-1…8: route-only, complexity gate, error escalation
│   ├── agent-rules.md          # AR-1…6: role lock, I/O contract, no chaining
│   ├── context-rules.md        # CR-1…6: progressive disclosure, token budget, memory
│   ├── output-contract.md      # OC-1…7: response schema, per-agent contracts
│   ├── skill-creation-rules.md # SCR-S/B/V/C: structure, behavior, validation
│   ├── skill-invocation-rules.md  # SIR-1…6: runtime invocation protocol
│   └── conflict-resolution-rules.md  # PCR-1…6: priority, file ownership, deadlock
│
├── hooks/                # Lifecycle handlers
│   ├── session-init.md, pre-tool.md, post-tool.md
│
├── memory/               # Context and state
│   ├── short-term.md (TTL: session)
│   ├── execution.md (TTL: task)
│   └── long-term.md (TTL: persistent)
│
├── tools/                # External integration definitions
│   ├── db-tool.md, api-tool.md, script-tool.md
│
├── schemas/              # JSON I/O contracts
│   ├── task-schema.json, report-schema.json, skill-io-schema.json
│
├── prompts/              # Reusable prompt templates
│   ├── task-decomposition.md, skill-router.md
│
└── template/             # Starter templates
    ├── skill-template.md, agent-template.md, command-template.md

docs/                     # Project documentation
plans/                    # Implementation plans and reports
GEMINI.md                 # Framework reference (loaded by Gemini CLI)
```

---

## Rules Catalog

All rules condensed in `.gemini/CORE_RULES.md`. Full rule files in `.gemini/rules/`:

| Category | File | Coverage |
|----------|------|----------|
| Safety | `safety.md` | Input validation, destructive op gates, file boundaries |
| Orchestration | `orchestrator-rules.md` | Route-only, complexity check, error escalation |
| Agent behavior | `agent-rules.md` | Role lock, I/O contracts, no agent chaining |
| Token efficiency | `context-rules.md` | Progressive disclosure, token budget, memory layers |
| Output schema | `output-contract.md` | `{status, result, summary}` for all components |
| Skill creation | `skill-creation-rules.md` | Structure, validation checklist, 200-line limit |
| Skill runtime | `skill-invocation-rules.md` | Registry check, JSON input, 30s timeout |
| Conflicts | `conflict-resolution-rules.md` | Priority order, file ownership, deadlock prevention |

---

## Quick Start

```bash
# Install (creates .gemini/ subdirectories)
./.gemini/skills/install.sh

# First commands
/gk:help
/gk:plan <describe your task>
/gk:debug <error or issue>
```

---

## Principles

- **YAGNI** — don't build what isn't needed now
- **KISS** — simplest solution that works
- **DRY** — no logic duplicated across agents, skills, or rules
- **Single responsibility** — one job per component, no exceptions
- **No assumption** — ask when data is missing, never infer
- **Structured output** — JSON between components, markdown for humans
