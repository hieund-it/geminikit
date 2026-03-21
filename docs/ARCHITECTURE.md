# System Architecture - Gemini Kit

## Overview
Gemini Kit is a multi-agent AI development framework designed to run inside the Gemini CLI. It optimizes token usage and standardizes software engineering workflows through the use of specialized agents, atomic skills, and strict rule enforcement.

## System Architecture Diagram

```
[Layer 1] ENTRY POINT
User Input (/gk:...) ──► GEMINI.md / AGENT.md
                           │
                           ▼
                  Parse & Complexity Check
                           │
                           ▼
[Layer 2]      ┌──────────────────────────────┐
AGENTS         │     ORCHESTRATOR      │
(Role)         └───────────┬──────────┘
                           │ Route
           ┌──────┬────────┼───────┬─────────┬─────────┐
           ▼      ▼        ▼       ▼         ▼         ▼
      Planner  Developer Tester Reviewer Documenter Researcher
          │       │        │       │         │         │
          │       │        │       │         │         │
[Layer 3] ▼       ▼        ▼       ▼         ▼         ▼
SKILLS   plan    debug    test   review    document  onboard
(Action) analyze  sql            analyze             brainstorm
         research git              api
                  │        │       │         │         │
                  └────────┴───────┴─────────┴─────────┘
                                   │
                                   ▼
[Layer 4] TOOLS   Files • Shell • Search • Database • API
                                   │
                                   ▼
[Layer 5] MEMORY  Short-Term • Execution State • Long-Term
```

The system is built on a 5-layer architecture, ensuring separation of concerns and scalability:
1.  **Entry Point:** `GEMINI.md` / `AGENT.md` - Responsible for parsing commands, checking complexity, and routing to the appropriate agent.
2.  **Agents:** Specialized executors with single roles (e.g., `planner`, `developer`).
3.  **Skills:** Atomic, stateless processors that perform specific tasks (e.g., `debug`, `plan`).
4.  **Tools:** External I/O interfaces.
5.  **Memory:** State management for short-term and long-term context.

## Core Components

### 1. Orchestrator
The central brain of the system. Its primary responsibilities are:
- **Parsing**: Detecting commands and user intent.
- **Decomposition**: Breaking down complex requests into manageable subtasks (max 5 per request).
- **Delegation**: Selecting the right Agent for each task.
- **Aggregation**: Summarizing results from various agents into a cohesive response.

### 2. Agents
Specialized entities with defined roles and rules (located in `.gemini/agents/`). See [Agent Registry](AGENTS_REGISTRY.md) for details.
- **Planner**: Creates execution roadmaps for complex tasks.
- **Developer**: Implements code, fixes bugs, and manages Git.
- **Reviewer**: Analyzes code quality, security, and performance.
- **Researcher**: Gathers information and performs brainstorming.
- **Documenter**: Generates technical documentation.

### 3. Skills
Atomic, reusable units of functionality (located in `.gemini/skills/`). Skills follow a strict Input/Output schema and perform one specific job (e.g., `gk-summarize`, `gk-analyze`, `gk-git`).

## Operational Workflow

Gemini Kit follows a mandatory four-phase lifecycle for every task:

1.  **Research**: Mapping the codebase, validating assumptions, and reproducing issues.
2.  **Strategy**: Formulating a plan. For complex tasks, this involves the **Planner** agent.
3.  **Execution**: Performing the actual work (Plan -> Act -> Validate).
4.  **Validation**: Mandatory final step to ensure correctness and prevent regressions.

### Complex Task Workflow
For multi-step or ambiguous tasks (e.g., "build a login system"), the framework follows a specific planning and execution cycle:

```
    User Request (Complex/Ambiguous)
                 │
                 ▼
          [ 1. PLAN ] ───► Planner Agent
                 │            │ Decompose Task
                 │            ▼
                 │       Execution Plan (DAG)
                 │       [Phase 1] → [Phase 2] → [Phase 3]
                 │
                 ▼
          [ 2. EXECUTE ] ◄── Loop through Phases ──┐
                 │                                 │
      ┌──────────┴──────────┐                      │
      ▼                     ▼                      │
  Developer             Reviewer                   │
(Implement)             (Audit)                    │
      │                     │                      │
      └──────────┬──────────┘                      │
                 ▼                                 │
          Update Memory/Context ───────────────────┘
                 │
                 ▼
          [ 3. VALIDATE ]
                 │
                 ▼
            Final Output
```

## Communication Protocol
- **Structured I/O**: Agents and Skills communicate using JSON schemas defined in `.gemini/schemas/`.
- **Handoffs**: Data is passed between agents using a standard handoff envelope (from_agent, to_agent, artifacts, context).
- **Memory**: System state is persisted in `.gemini/memory/` (execution.md, long-term.md).

## Safety & Governance
- **Confirmation Gate**: Any plan modifying the system requires explicit user approval.
- **Global Rules**: Core principles like **YAGNI**, **KISS**, and **DRY** are enforced via `.gemini/system.md` and `.gemini/rules/`.

## Rules & Standards
The framework operates under strict global rules:
-   **Core:** Foundational principles and safety (`01_core.md`).
-   **Workflow:** Orchestration and execution logic (`02_workflow.md`).
-   **Resource:** Token and context optimization (`03_resource.md`).
-   **Output:** Communication protocols (`04_output.md`).
-   **Development:** Coding standards and task execution (`05_development.md`).
-   **Documentation:** Document management rules (`06_documentation.md`).
