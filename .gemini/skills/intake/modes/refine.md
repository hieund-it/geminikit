---
mode: refine
extends: gk-intake
version: "1.0.0"
---

# Extra Rules
- MUST generate 3-5 targeted questions to fill identified gaps.
- MUST focus questions on constraints, target audience, and core functionality.
- MUST NOT provide solutions yet; stay in the discovery phase.

# Extra Output
```json
{
  "clarification_questions": ["string"]
}
```

## Steps
1. Analyze the `raw_input` for missing critical information (Who, What, Why, How).
2. Generate questions that are specific to the gaps found.
3. Suggest 2-3 optional "nice-to-have" features based on the core idea.

## Examples
**Input:** `/gk-intake --refine "I want to build a simple todo app"`
**Expected behavior:** Instead of just structuring, it asks about persistence, platforms, and specific features (reminders, tags, etc.).
