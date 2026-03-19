---
mode: mode-name
extends: parent-skill-name
version: "1.0.0"
---

<!-- Save as: .gemini/skills/<skill-name>/modes/<mode-name>.md -->
<!-- Only create modes/ folder when skill has ≥2 modes (YAGNI) -->

# Extra Rules

- [Rule appended to base skill rules — additive only, no overrides]
- [Each rule should narrow or extend behavior for this specific mode]

# Extra Output

```json
{
  "extra_field_1": "type — description of additional output field",
  "extra_field_2": ["type — description"]
}
```

<!-- Extra Output fields are MERGED into base skill output schema, not replaced -->
<!-- Do not redefine fields already present in the base SKILL.md output -->

## Steps
1. [First action specific to this mode]
2. [Second action]
3. [Third action]

## Examples
**Input:** `/gk-<cmd> --<mode> <example target>`
**Expected behavior:** [Description of what this mode does differently]
