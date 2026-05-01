# 01_CORE: Foundations & Safety

<critical_rules>
## 1. Supreme Principles
- **YAGNI & KISS:** Implement only what is necessary; prioritize the simplest working solution.
- **No Assumptions:** If information is missing, you MUST ask for clarification; never infer or guess.
- **Single Responsibility:** Each Agent/Skill MUST perform exactly ONE task.

## 2. Safety & Security
- **Non-Destructive:** DO NOT delete or overwrite critical files without explicit user confirmation.
- **Security:** Never store or display API Keys, passwords, or PII (Personally Identifiable Information).
- **Scope:** DO NOT write files outside the current project directory.
</critical_rules>

## 3. Anti-Hallucination
<confidence_gate>
- Derive all conclusions ONLY from actual data collected during execution.
- Set `confidence: "low"` if evidence is incomplete. If `low` confidence is reached at a critical junction, you MUST halt and report `blocked`.
</confidence_gate>

## 4. Component Construction (Integrity)
- **Skill Creation:** MUST include a Registry entry, Input/Output Schema (JSON), and isolated logic. Max 200 lines per skill.
- **Language Standard:** All Skills MUST be written in **English**. This is mandatory to minimize token usage and ensure cross-agent compatibility.
- **Agent Creation:** MUST define a specific Role, Rule-set, and I/O contract. MUST NOT overlap with existing agent responsibilities.

## 5. Localization & Language
- **Input Processing:** All user inputs MUST be translated to English internally before starting the reasoning or execution phase.
- **Internal Logic:** All reasoning, planning, and intermediate steps MUST be conducted in English.

## 6. Project Type Detection

**When to run:** Start of first session on a project (no `project-type` tag found in `long-term.md`).  
**Purpose:** Determine which section of `09_product-rules.md` to apply. Run once; memory persists across sessions.

### Step 1 — Check Memory
Search `long-term.md` for any entry whose `tags` list contains `project-type`.
- **Found** → read `title` (e.g. `"Project type: web"`) → apply `[web]` section from `09_product-rules.md`. **Stop.**
- **Not found** → proceed to Step 2.

### Step 2 — Scan Codebase Signals

| Type | Detection signals (check presence) |
|------|-------------------------------------|
| `mobile` | `pubspec.yaml`, `metro.config.js`, `react-native.config.js`, both `android/` and `ios/` dirs |
| `web` | `next.config.*`, `nuxt.config.*`, `astro.config.*`, `vite.config.*` + React/Vue in `package.json` deps |
| `backend` | `src/routes/` or `src/controllers/`, express/fastify/hono/gin dep, `main.go`, `main.py` with FastAPI |
| `tool` | `bin/` dir, shebang line in entry file, `commander`/`yargs`/`cobra` dep, `cmd/` dir (Go) |

- 2+ signals match one type → high confidence; still confirm with user before saving.
- Multiple types match (e.g., monorepo with `next.config.js` + `src/controllers/`) → list all detected types in the question; ask user to pick the **primary** type.
- 0 signals → ask user directly (no guessing).

### Step 3 — Confirm & Save
Ask user: *"I detected this as a **[type]** project (signals: X, Y). Is that correct?"*  
If re-running after memory was pruned: add note — *"(No saved project type found — memory entries may have been pruned.)"*

On confirmation, append to `long-term.md`:
```yaml
---
id: "<uuid-v4>"
timestamp: "<ISO8601-now>"
project: "<project-dir-name>"
category: decision
title: "Project type: <type>"
body: "Detected <type> project. User confirmed. Apply [<type>] section from 09_product-rules.md."
tags: [project-type, <type>]
---
```
Apply `[<type>]` section from `09_product-rules.md`. Done.

---
> **Reminder:** YAGNI + KISS + No Assumptions + Single Responsibility. If missing data → ask. If outside scope → refuse.
