# Onboarding to Gemini Kit

Welcome to the Gemini Kit project! This guide provides a rapid introduction to the framework.

## 1. What is Gemini Kit?

Gemini Kit is a multi-agent AI framework that orchestrates specialized AI "Agents" (like Developers, Planners, and Reviewers) to autonomously yet safely complete complex software engineering tasks.

## 2. Core Concepts

- **Orchestrator**: The central brain that parses user commands, decomposes tasks, and delegates work to the appropriate agent.
- **Agents**: Specialized roles defined in `.gemini/agents/`. Each agent has a specific persona, set of skills, and responsibility. See the [Agent Registry](AGENTS_REGISTRY.md) for a full list.
- **Skills**: Atomic capabilities (e.g., `gk-git`, `gk-debug`, `gk-plan`) that agents use to perform actions. These are the building blocks of the system.
- **Registry**: The single source of truth for all commands and skills, located at `.gemini/REGISTRY.md`.

## 3. How to Get Started

1.  **Read the Architecture**: Start with the [System Architecture](ARCHITECTURE.md) document to understand how the components fit together.
2.  **Review the Commands**: Check the [Commands Reference](COMMANDS_REFERENCE.md) to learn how to interact with the system using `/gk-...` commands.
3.  **Try a Command**:
    - Use `/gk-ask "What is the purpose of the researcher agent?"` to query the system about itself.
    - Use `/gk-plan "Refactor the login logic to use a new authentication service"` to see how the Planner agent breaks down a task.

## 4. Key Files & Directories

- **`.gemini/`**: The heart of the framework, containing all agents, skills, rules, and configuration.
- **`src/`**: The source code for the `gk` command-line interface (CLI).
- **`docs/`**: Project documentation (you are here!).
- **`GEMINI.md`**: The root configuration and entry point for the Orchestrator.
