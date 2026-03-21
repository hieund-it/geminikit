# Contributing to Gemini Kit

We welcome contributions! Please follow these guidelines to ensure consistency and quality.

## Development Workflow

1.  **Fork** the repository and clone your fork.
2.  **Branch** off `main` for your feature or fix: `git checkout -b feature/your-feature-name`.
3.  **Implement** your changes.
    - If adding a new agent/skill, follow the template in `.gemini/template/`.
    - If modifying core logic, update relevant tests.
4.  **Validate** your changes locally.
    - Run existing tests.
    - Ensure no regressions.
5.  **Commit** with clear messages (Conventional Commits preferred): `feat: add new skill for database migration`.
6.  **Push** to your fork and submit a **Pull Request**.

## Coding Standards

- **Language**: TypeScript/JavaScript for logic, Markdown for docs/prompts.
- **Style**: Follow existing patterns. Use `camelCase` for variables, `PascalCase` for classes.
- **Documentation**: All new features must include documentation in `docs/` and docstrings in code.
- **Testing**: Add unit tests for logic-heavy components.

## Adding New Skills

1.  Create a folder in `.gemini/skills/<skill-name>`.
2.  Create `SKILL.md` following the standard schema.
3.  Update `.gemini/REGISTRY.md` to register the new skill.
4.  Add a corresponding command if applicable.

## Reporting Bugs

Please use the issue tracker to report bugs. Include:
- Steps to reproduce.
- Expected behavior.
- Actual behavior.
- Environment details (OS, version).
