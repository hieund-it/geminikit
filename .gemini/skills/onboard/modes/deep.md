---
mode: deep
extends: onboard
version: "1.0.0"
---

# Extra Rules

- Perform an exhaustive repository-wide scan for all architectural patterns.
- Map multi-layer dependencies (transitive) and identify outdated packages.
- Deeply analyze entry points, controllers, services, and data layers.
- Identify custom scripts, build pipelines, and CI/CD configurations.
- Provide a detailed map of all core module relationships and data flows.
- Report potential architectural risks (circular deps, high coupling) as part of onboarding.

# Extra Output

```json
{
  "transitive_dependency_analysis": "string",
  "architectural_risk_report": ["string"],
  "ci_cd_config": ["string"],
  "module_relationship_map": ["string"]
}
```

## Steps
1. Perform deep recursive directory scan
2. Analyze all entry points and core modules
3. Map transitive dependencies and versions
4. Inspect build and CI/CD configurations
5. Generate a deep architectural synthesis

## Examples
**Input:** `/gk-onboard --deep /path/to/large-legacy-system`
**Expected behavior:** Comprehensive architectural mapping, dependency depth analysis, and risk report.
