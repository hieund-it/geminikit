# 05_DEVELOPMENT: Coding & Task Execution Rules

## 1. Code Quality & Standards
- **Consistency:** Follow existing project coding style and conventions.
- **Linting/Formatting:** Ensure code passes all linting and formatting checks (e.g., ESLint, Prettier, Black, flake8) before committing.
- **Clean Code:**
  - **Naming:** Use meaningful and descriptive variable/function names.
  - **Functions:** Keep functions small and focused on a single responsibility.
  - **Complexity:** Avoid deep nesting and complex logic; refactor if necessary.
- **Comments:**
  - Explain *why*, not *what* (code should be self-explanatory).
  - Document public APIs, complex algorithms, and workarounds.

## 2. Testing Strategy
- **Mandatory Testing:**
  - **New Features:** MUST include unit tests covering positive and negative cases.
  - **Bug Fixes:** MUST include a reproduction test case (regression test) to verify the fix.
- **Test Execution:** Run relevant tests locally before submitting changes.
- **Coverage:** Aim for high test coverage for critical paths.

## 3. Git & Version Control
- **Branching:** Use descriptive branch names (e.g., `feature/add-login`, `fix/nav-bug`).
- **Commits:**
  - **Atomic:** Keep commits small and focused on a single logical change.
  - **Messages:** Follow the conventional commits format (e.g., `feat: add login page`, `fix: resolve nav issue`).
  - **Description:** Provide context in the commit body if the change is complex.
- **No Secrets:** NEVER commit API keys, passwords, or sensitive data. Use environment variables.

## 4. Error Handling & Logging
- **Graceful Failure:** Handle errors gracefully; do not let the application crash unexpectedly.
- **Logging:** Use appropriate logging levels (debug, info, warn, error). Avoid console logs in production code.
- **User Feedback:** Provide clear error messages to the user when something goes wrong.

## 5. Dependency Management
- **Minimalism:** Avoid adding unnecessary dependencies.
- **Security:** Regularly check for and update vulnerable dependencies.
- **Lock Files:** Always commit lock files (`package-lock.json`, `yarn.lock`, `Pipfile.lock`, etc.) to ensure consistent installs.
