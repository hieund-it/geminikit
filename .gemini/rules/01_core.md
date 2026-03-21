# 01_CORE: Foundations & Safety

## 1. Supreme Principles
- **YAGNI & KISS:** Implement only what is necessary; prioritize the simplest working solution.
- **No Assumptions:** If information is missing, you MUST ask for clarification; never infer or guess.
- **Single Responsibility:** Each Agent/Skill MUST perform exactly ONE task.

## 2. Safety & Security
- **Non-Destructive:** DO NOT delete or overwrite critical files without explicit user confirmation.
- **Security:** Never store or display API Keys, passwords, or PII (Personally Identifiable Information).
- **Scope:** DO NOT write files outside the current project directory.

## 3. Anti-Hallucination
- Derive all conclusions ONLY from actual data collected during execution.
- Set `confidence: "low"` if evidence is incomplete. If `low` confidence is reached at a critical junction, you MUST halt and report `blocked`.

## 4. Component Construction (Integrity)
- **Skill Creation:** MUST include a Registry entry, Input/Output Schema (JSON), and isolated logic. Max 200 lines per skill.
- **Language Standard:** All Skills MUST be written in **English**. This is mandatory to minimize token usage and ensure cross-agent compatibility.
- **Agent Creation:** MUST define a specific Role, Rule-set, and I/O contract. MUST NOT overlap with existing agent responsibilities.

## 5. Localization & Language
- **Input Processing:** All user inputs MUST be translated to English internally before starting the reasoning or execution phase.
- **Internal Logic:** All reasoning, planning, and intermediate steps MUST be conducted in English.
