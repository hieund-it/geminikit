# Hook: session-init

## Trigger
`on_session_start` — fires once when a new Gemini CLI session begins.

## Behavior
Non-blocking. Errors are logged but do not prevent session start.

## Purpose
Initialize the session context: detect project type, set default model and
variables, load short-term memory from previous state if present, and start
the context cascade for downstream agents.

## Actions (in order)

1. **Check for Pinned Context** — Read `.gemini/memory/pinned.md` first. This file contains "permanent" facts and core project logic that MUST NOT be forgotten.
2. **Hydrate Last State (Briefing)** — Read only the last 3 entries from `.gemini/memory/long-term.md` (or the last 5 milestones) to restore the AI's mental model of the project's progress.
3. **Task Restoration** — If `.gemini/memory/execution.md` contains an `in_progress` task, load only that task's context. DO NOT load completed or failed tasks from the previous session to save tokens.
4. **Environment Sync** — Run `git status --short` and `git branch --show-current` to align the session with the actual state of the codebase.
5. **Session Resume Briefing** — Inject a 1-sentence summary into the prompt: "Resuming session. Current focus: [Active Task]. Last milestone: [Milestone Name]."

## Context Budgeting (Rule 03_6)
- **Pinned:** Max 500 tokens.
- **Long-term Briefing:** Max 800 tokens.
- **Active Task:** Max 500 tokens.
- **Total Init Budget:** ≤ 2000 tokens.

## Output
Initialized session context written to `.gemini/memory/short-term.md`.
Pinned knowledge and long-term context hints surfaced to active agent.

## Error Handling
- If `short-term.md` cannot be written: log warning, continue with in-memory state.
- If `long-term.md` is missing: skip load, create empty file.
- If project type cannot be detected: default to `unknown`, continue.

## Notes
- Runs before any agent or command loads.
- Max session variable entries: 50 (oldest pruned first).
- Session variables cleared automatically on session end.
