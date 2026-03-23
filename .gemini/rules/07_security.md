# 07_SECURITY: Access Control & Permissions

## 1. Agent Permission Matrix
To minimize risk, agents are restricted to specific operations based on their role.

| Agent | Read Source | Write Source | Shell Access | Memory Access |
|-------|-------------|--------------|--------------|---------------|
| `developer` | YES | YES | YES | READ/WRITE |
| `reviewer` | YES | NO | NO | READ-ONLY |
| `researcher`| YES | NO | NO | READ-ONLY |
| `planner` | YES | NO | NO | READ/WRITE |
| `security` | YES | NO | NO | READ-ONLY |
| `tester` | YES | YES (tests) | YES (tests) | READ-ONLY |

---

## 2. Forbidden Paths (Blacklist)
Agents are strictly PROHIBITED from reading or writing to the following patterns. Any attempt MUST be blocked by the Orchestrator.

- `**/.env*` (Environment secrets)
- `**/secrets.json` / `**/credentials.json`
- `**/*.pem` / `**/*.key` (Private keys/Certificates)
- `**/.git/` (Git internal metadata)
- `**/node_modules/` (Except for version checks)
- `**/dist/` / `**/build/` (Build artifacts)

---

## 3. Tool Access Control
- **Critical Tools:** `run_shell_command`, `write_file`, `replace` are restricted to `developer` and `tester` agents ONLY.
- **Read-only Tools:** `read_file`, `grep_search`, `glob` are available to ALL agents.
- **Elevation:** If an agent needs a restricted tool, it MUST escalate the request to the `developer` agent via the Orchestrator.

---

## 4. Secret Masking (Pre-emptive)
- Agents MUST NOT request the content of `.env` files.
- If a tool accidentally returns a secret, the `post-tool` hook MUST redact it BEFORE the agent sees it.
