# System Architecture - Gemini Kit

## Overview
Gemini Kit is a multi-agent AI development framework designed to run inside the Gemini CLI. It optimizes token usage and standardizes software engineering workflows through the use of specialized agents, atomic skills, and strict rule enforcement.

## System Architecture Diagram

```
[Layer 1] ENTRY POINT
User Input (/gk-...) ──► .gemini/GEMINI.md
                           │
                           ▼
                  Parse & Complexity Check
                           │
                           ▼
[Layer 2]      ┌──────────────────────────────┐
AGENTS         │         ORCHESTRATOR         │
(Role)         └───────────┬──────────┘
                           │ Route
           ┌──────┬────────┼──────────┬──────────┬─────────┐
           ▼      ▼        ▼          ▼          ▼         ▼
      Planner  Developer  Reviewer   Researcher  Designer  ... (etc.)
          │        │         │          │           │
          │        │         │          │           │
[Layer 3] ▼        ▼         ▼          ▼           ▼
SKILLS  plan     debug     review     onboard       ui
        research git       analyze    brainstorm
                 sql
                 ...
          │        │         │          │           │
          └────────┴─────────┴──────────┴───────────┘
                           │
                           ▼
[Layer 4] TOOLS   Files • Shell • Search • Database • API
                           │
                           ▼
[Layer 5] MEMORY  Short-Term • Execution State • Long-Term
```

The system is built on a 5-layer architecture, ensuring separation of concerns and scalability:
1.  **Entry Point:** `GEMINI.md` - Responsible for parsing commands, checking complexity, and routing to the appropriate agent.
2.  **Agents:** Specialized executors with defined roles (e.g., `planner`, `developer`). See the [Agent Registry](AGENTS_REGISTRY.md) for a complete list.
3.  **Skills:** Atomic, stateless processors that perform specific tasks (e.g., `gk-debug`, `gk-plan`).
4.  **Tools:** External I/O interfaces for interacting with the environment.
5.  **Memory:** State management for short-term and long-term context.

## Core Components

### 1. Orchestrator
The central brain of the system. Its primary responsibilities are:
- **Parsing**: Detecting commands and user intent from `/gk-...` inputs.
- **Decomposition**: Breaking down complex requests into manageable subtasks.
- **Delegation**: Selecting the right Agent for each task based on the [Agent Registry](AGENTS_REGISTRY.md).
- **Aggregation**: Summarizing results from various agents into a cohesive response.

### 2. Agents
Specialized entities with defined roles and rules (located in `.gemini/agents/`). They are the "who" in the system, responsible for executing tasks within their domain. Key agents include:
- **Planner**: Creates execution roadmaps for complex tasks.
- **Developer**: Implements code, fixes bugs, and manages Git.
- **Reviewer**: Analyzes code quality, security, and performance.
- **Researcher**: Gathers information and performs brainstorming.
- **Documenter**: Generates technical documentation.
- **Designer**: Produces and validates UI/UX specifications.

A complete list of agents and their skills is available in the [Agent Registry](AGENTS_REGISTRY.md).

### 3. Skills
Atomic, reusable units of functionality (located in `.gemini/skills/`). Skills are the "what" — they follow a strict Input/Output schema and perform one specific job (e.g., `gk-summarize`, `gk-analyze`, `gk-git`). They are the building blocks that agents use to accomplish their goals.

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
