# Memory: long-term

## Schema Definition

Persistent knowledge that survives across sessions. Append-only during a session.
Pruned when entry count exceeds 200 (oldest entries removed first).

```yaml
# Entry format (one block per entry):
# ---
# id: string (UUID v4)
# timestamp: ISO 8601
# project: string (project_name tag for filtering)
# category: decision | pattern | preference | issue | milestone
# title: string (one line, searchable)
# body: string (markdown, max 500 chars)
# tags: [string]
# ---
```

## Categories

| Category    | When to use |
|-------------|-------------|
| `decision`  | Architecture or approach choices made for a project |
| `pattern`   | Recurring solutions or code patterns worth reusing |
| `preference`| User-stated preferences for style, tools, or workflow |
| `issue`     | Known bugs, limitations, or gotchas encountered |
| `milestone` | Completed phases, releases, or significant events |

## Protocol

| Rule | Detail |
|------|--------|
| TTL | Persistent � survives all sessions |
| Max entries | 200 � oldest pruned when exceeded |
| Write access | Any agent via append (no in-place edits) |
| Read access | All agents and hooks |
| Pruning | Automated: remove oldest when count > 200 |
| Manual curation | Review and clean entries periodically |

## Entries

<!-- Agents append new entries below this line. Keep entries in reverse chronological order. -->

---
id: \"00000000-0000-0000-0000-000000000004\"
timestamp: \"2026-03-23T12:00:00Z\"
project: \"geminikit\"
category: milestone
title: \"Session-wide System Update & Infrastructure Overhaul\"
body: |
  Updated core system files (GEMINI.md, system.md, AGENT.md, rules), hooks,
  and memory infrastructure. Batch updated all 14 agents and 25 skills to
  follow new security and persistence standards. Fixed memory file path issues.
tags: [infrastructure, batch-update, documentation]
---
id: \"00000000-0000-0000-0000-000000000003\"
timestamp: \"2026-03-22T15:00:00Z\"
project: \"geminikit\"
category: decision
title: \"Established Context Economy as Core Principle\"
body: |
  Defined token optimization as a foundational mandate for all agents. Updated 
  core system files and workflow rules to enforce efficient context usage.
tags: [context-economy, optimization, design-principles]
---
id: \"00000000-0000-0000-0000-000000000002\"
timestamp: \"2026-03-21T10:00:00Z\"
project: \"geminikit\"
category: milestone
title: \"Implemented Auto-Persistence & Security Framework\"
body: |
  Implemented Auto-Sync, Silent Summarization, and Implicit Export. Added 
  Agent Permission Matrix, Forbidden Paths (Blacklist), Tool Access Control, 
  and Secret Masking to the security framework.
tags: [auto-persistence, security-framework, infrastructure]
---
id: \"00000000-0000-0000-0000-000000000001\"
timestamp: \"2026-03-19T13:11:00Z\"
project: \"geminikit\"
category: milestone
title: \"Phase 06 hooks/memory/tools infrastructure created\"
body: |
  Created 14 files under .gemini/: hooks (session-init, pre-tool, post-tool),
  memory (short-term, long-term, execution), tools (db, api, script),
  prompts (task-decomposition, skill-router), templates (skill, agent, command).
tags: [phase-06, infrastructure, geminikit]
---

## Notes
- Never store API keys, tokens, passwords, or secrets in this file.
- Entries are tagged with `project` for cross-project installations.
- `session-init` hook loads the 5 most recent entries matching `project_name`.
- Body text is limited to 500 characters to control file growth.
