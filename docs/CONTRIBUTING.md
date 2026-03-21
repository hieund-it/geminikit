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

### Languages

| Language | Usage |
|----------|-------|
| **TypeScript / JavaScript** | CLI (`bin/`, `src/`), Node.js logic, skill scripts |
| **Python** | Automation scripts (`.gemini/scripts/`) |
| **Markdown** | Agent definitions, skill prompts, documentation |

### Style
- Variables: `camelCase` (JS/TS), `snake_case` (Python)
- Classes: `PascalCase` (all languages)
- Files: `kebab-case` for JS/TS/Python; respect existing conventions
- **Documentation**: All new features must include docs in `docs/` and docstrings in code.
- **Testing**: Add unit tests for logic-heavy components.

## Adding New Skills

1.  Create a folder in `.gemini/skills/<skill-name>`.
2.  Create `SKILL.md` following the standard schema.
3.  Update `.gemini/REGISTRY.md` to register the new skill.
4.  Add a corresponding command if applicable.

## License

By contributing to Gemini Kit, you agree that your contributions will be licensed under the [MIT License](../LICENSE) that covers this project.

You retain copyright of your own contributions. By submitting a pull request, you confirm that:
- You have the right to submit the work under the MIT License.
- You understand your contribution may be distributed under the MIT License.

## Reporting Bugs

Please use the issue tracker to report bugs. Include:
- Steps to reproduce.
- Expected behavior.
- Actual behavior.
- Environment details (OS, version).
