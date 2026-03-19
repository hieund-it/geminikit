---
name: core-rules
version: "1.0.0"
description: "Minimal production-ready ruleset covering all 12 mandatory categories."
---

# CORE RULES — GeminiKit

> All components (orchestrator, agents, skills, tools) MUST comply. No exceptions.

---

## 1. Execution
- MUST perform exactly ONE task per invocation (single responsibility).
- MUST produce same output for same input (deterministic).
- MUST validate input schema before processing — `blocked` on missing required fields.

## 2. Context Management
- MUST load only files needed for current step (progressive disclosure).
- Load order: `system.md` → `AGENT.md` → agent file → skill file (on invoke only).
- Max tokens: 2000/agent context, 500/skill. Summarize before passing to next step.

## 3. Orchestration Contract
- Orchestrator: routes ONLY — MUST NOT execute tasks.
- Agents: execute ONLY — MUST NOT route to other agents.
- MUST decompose tasks into ≤5 numbered subtasks before delegating.
- Sequential when B depends on A. Parallel when independent.

## 4. I/O Schema
- All responses MUST include: `{ status, result, summary }`.
- Status values: `completed | failed | blocked` — no others.
- Failed MUST include `error: { code, message }`. Blocked MUST include `blockers: []`.
- External plan ingestion via `--from`: MUST apply `rules/claude-handoff-rules.md` CHR-1 to CHR-9.
- MUST validate source, parse phases in order, resolve deps, and writeback output per CHR rules.

## 5. Anti-Hallucination
- MUST derive all outputs from provided input data ONLY.
- MUST NOT generate code, queries, or decisions from assumed context.
- MUST set `"confidence": "low"` when evidence is incomplete.
- Confidence gate: if output `confidence` = `"low"` on a blocking decision, MUST return `status: "blocked"` instead of proceeding.

## 6. Responsibility Isolation
- Orchestrator routes. Agent executes. Skill processes. Tool calls external.
- No component may cross into another's domain.
- File ownership: agent owns files it writes. Two agents MUST NOT write same file.

## 7. Skill Invocation
- MUST validate skill exists in registry before calling.
- MUST pass input as JSON matching skill's defined schema.
- Skill timeout: 30s. On timeout: `error.code: "SKILL_TIMEOUT"` — no auto-retry.
- Skills MUST NOT invoke other skills.

## 8. Error Handling & Retry
- Max 2 retries per task. 3rd failure → `error.code: "MAX_RETRIES_EXCEEDED"`, halt.
- Circuit breaker: 3 failures from same component in session → mark `disabled`, escalate.
- On `blocked`: collect missing inputs, retry ONCE. On `failed`: report root cause, no retry.

## 9. Validation
- Input: all required fields must be typed and present.
- Output: validate `{ status, result, summary }` schema on every response.
- Malformed output = `status: "failed"` — MUST NOT pass bad data to next component.

## 10. Performance & File Size Budget
- Tool timeouts: script 60s, skill 30s, memory 10s.
- Max 10 tool calls per agent turn.
- Truncate outputs > 300 lines, set `"truncated": true`.
- File size caps: `GEMINI.md` ≤150 lines, `AGENT.md` ≤120, `agents/*.md` ≤120, `commands/*.md` ≤30, `commands/refs/*.md` ≤30, `rules/*.md` ≤80, `skills/*.md` ≤200, `template/*.md` ≤80.
- MUST NOT load a file exceeding its cap without summarizing first.

## 11. Memory Management
- Layers: `short-term` (session), `execution` (task), `long-term` (persistent).
- Read lowest TTL first. Write task results to execution immediately on completion.
- Evict: short-term at 50 entries (FIFO), long-term at 200 entries (FIFO).
- MUST NOT store credentials or PII in any memory layer.

## 12. Priority & Conflict Resolution
- Priority order: `blocked_resolution` > `test` > `debug` > `review` > `develop` > `plan`.
- File conflict: first-claim wins. Second agent must wait or redirect.
- Circular dependency detected at plan time → reject plan, return `error.code: "CIRCULAR_DEPENDENCY"`.
- Routing ambiguity → ask user ONE targeted question. Never auto-select silently.
- Input ambiguity in agents → ask ONE clarifying question, halt execution until answered. Never assume or implement the "safest" interpretation silently.
