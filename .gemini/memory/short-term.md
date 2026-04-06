# Session Context
Loaded: 2026-04-06T16:40:01.199Z
Session: unknown
## Pinned Context
# Pinned Knowledge (Immutable Context)

Use this file to store critical project-wide information that AI MUST always remember. 
This data is exempt from summarization, truncation, or archiving.

## Critical Business Logic
<!-- Add project-specific business rules here. Example: JWT expiration must be set to 24 hours for production. -->

## Global Architectural Rules
<!-- Add project-specific architectural rules here. Example: All new API endpoints must follow RESTful conventions. -->

## Project Context
<!-- Fill in after installing in your project:
- Current Phase: [e.g., Planning | Development | Testing | Production]
- Primary Tech Stack: [e.g., React, Node.js, PostgreSQL]
-->

---
*Note: AI will never modify this file unless explicitly instructed by the user.*

## Recent History
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

