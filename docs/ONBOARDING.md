# Onboarding to Gemini Kit

Welcome to the Gemini Kit project! This guide will help you quickly understand the project and get started.

## What is Gemini Kit?

Gemini Kit is a multi-agent AI framework designed to orchestrate specialized "Agents" (like Developers, Planners, Reviewers) to complete complex software engineering tasks autonomously but safely.

## Key Concepts

- **Orchestrator**: The central brain that receives user commands, decomposes them, and delegates to agents.
- **Agents**: Specialized roles defined in `.gemini/agents/`. Each agent has a specific persona and responsibility.
- **Skills**: Atomic capabilities (e.g., `gk-git`, `gk-debug`) that agents use to perform actions.
- **Registry**: The single source of truth for all commands and skills (`.gemini/REGISTRY.md`).

## Tech Stack

- **Core**: Node.js / Python (depending on specific skill implementations).
- **Environment**: Gemini CLI (orchestrator runtime).
- **Configuration**: YAML/JSON for agent/skill definitions.
- **Communication**: JSON-based message passing between agents.

## Getting Started

1.  **Read the Architecture**: Start with [System Architecture](./ARCHITECTURE.md) to understand how pieces fit together.
2.  **Explore Agents**: Check out [Agent Registry](./AGENTS_REGISTRY.md) to know who does what.
3.  **Learn Commands**: Review [Commands Reference](./COMMANDS_REFERENCE.md) to interact with the system.
4.  **Try a Task**: Use `/gk-ask` to query the codebase or `/gk-plan` to break down a simple task.

## Project Structure

- `.gemini/`: Core framework configuration, agents, skills, and rules.
- `src/`: Source code for CLI commands and core logic.
- `docs/`: Project documentation (you are here!).

## Where to find help?

- **Issues**: Check the GitHub Issues tab.
- **Questions**: Use the `/gk-ask` command to ask the system itself about its own codebase!
