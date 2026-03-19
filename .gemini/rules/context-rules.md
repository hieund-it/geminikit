# Context Rules

<critical>Token waste is system failure. Every token loaded must earn its place in the context window.</critical>

## CR-1: Progressive Disclosure
MUST load only files required for the current step.
MUST NOT preload all agents, skills, or rules at session start.
Loading order: system.md → AGENT.md → agent file (on route) → skill file (on invoke).

## CR-2: Memory Hierarchy
```
short-term  → session vars, current task state       (TTL: session)
long-term   → project decisions, patterns, history   (TTL: persistent)
execution   → active subtasks, tool call log         (TTL: task)
```
MUST read from lowest TTL layer first (short-term → execution → long-term).
MUST write task results to execution memory immediately on completion.
MUST NOT store sensitive data (API keys, passwords) in any memory layer.

## CR-3: Context Budget & Performance
Max tokens per agent context: 2000.
Max tokens per skill invocation: 500.
Max response lines before summarization: 300.
MUST summarize long file reads before including in context.
Tool timeout: 60s (script), 30s (skill), 10s (memory read/write). Exceed → `error.code: "TIMEOUT"`.
MUST NOT make more than 10 tool calls per agent turn (rate limit).

## CR-7: File Size Enforcement
MUST NOT load a file that exceeds its size cap without summarizing first.
Size caps: `GEMINI.md` ≤150 lines, `AGENT.md` ≤120, `agents/*.md` ≤120, `commands/*.md` ≤40, `commands/refs/*.md` ≤30, `rules/*.md` ≤80, `skills/*.md` ≤200, `template/*.md` ≤80.
When a file exceeds its cap: split into focused sub-files and reference by path.
GEMINI.md is loaded on every request — it has highest priority for size enforcement.

## CR-4: Session Variables
MUST set these vars at session init (via session-init hook):
- `project_name`, `working_dir`, `model_default`, `session_start`
MUST read session vars from short-term memory instead of re-deriving.
MUST NOT re-read config files mid-task if vars already set.

## CR-5: Memory Eviction
MUST evict oldest entries when short-term reaches 50 entries (FIFO).
MUST evict oldest entries when long-term reaches 200 entries (FIFO).
MUST clear execution memory on task completion.

## CR-6: Import References
MUST use file paths (e.g., `@.gemini/agents/planner.md`) instead of inlining file content.
MUST NOT copy-paste content from referenced files into the prompt.
Exception: schemas must be inlined when used for output validation.
