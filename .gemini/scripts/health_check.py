import os
import re
import json
import sys
from datetime import datetime

# Mandatory sections for SKILL.md
MANDATORY_SECTIONS = [
    "## Interface",
    "# Role",
    "# Objective",
    "# Input",
    "# Rules",
    "# Output"
]

# Mandatory rules patterns
MANDATORY_RULES = {
    "PowerShell (Rule 02_4)": r"PowerShell Mandatory",
    "Artifact Management (Rule 05_6)": r"Artifact Management",
    "Security Audit": r"Security Audit",
    "Context Economy": r"Context Economy"
}

def check_skill(skill_name, skill_path):
    report = {
        "name": skill_name,
        "status": "pass",
        "errors": [],
        "warnings": []
    }

    if not os.path.exists(skill_path):
        report["status"] = "fail"
        report["errors"].append(f"SKILL.md not found at {skill_path}")
        return report

    with open(skill_path, 'r', encoding='utf-8') as f:
        content = f.read()
        lines = content.splitlines()

    # 1. Line count check (max 200)
    if len(lines) > 200:
        report["status"] = "fail"
        report["errors"].append(f"Skill file exceeds 200 lines ({len(lines)} lines)")

    # 2. Mandatory sections
    for section in MANDATORY_SECTIONS:
        if section not in content:
            report["status"] = "fail"
            report["errors"].append(f"Missing mandatory section: {section}")

    # 3. Mandatory rules
    rules_section = re.search(r"# Rules(.*?)(# Output|## Steps|$)", content, re.DOTALL)
    if rules_section:
        rules_content = rules_section.group(1)
        for rule_name, pattern in MANDATORY_RULES.items():
            if not re.search(pattern, rules_content, re.IGNORECASE):
                # Specific check for Plan Management if it's 'plan' skill
                if skill_name == "plan" and rule_name == "Artifact Management (Rule 05_6)":
                    if not re.search(r"Plan Storage", rules_content, re.IGNORECASE):
                        report["status"] = "fail"
                        report["errors"].append(f"Missing mandatory rule: Plan Storage (Rule 02_5.1)")
                    continue
                
                report["status"] = "fail"
                report["errors"].append(f"Missing mandatory rule: {rule_name}")
    else:
        report["status"] = "fail"
        report["errors"].append("Rules section not found or malformed")

    # 4. Frontmatter validation
    match = re.search(r"---\n(.*?)\n---", content, re.DOTALL)
    if match:
        frontmatter = match.group(1)
        if f"name: gk-{skill_name}" not in frontmatter:
            report["status"] = "fail"
            report["errors"].append(f"Frontmatter name mismatch: expected 'gk-{skill_name}'")
    else:
        report["status"] = "fail"
        report["errors"].append("YAML Frontmatter not found")

    # 5. Mode mapping check
    if "Flags:" in content and "none" not in content.lower():
        if "## Mode Mapping" not in content:
            report["status"] = "fail"
            report["errors"].append("Skill has flags but missing '## Mode Mapping' table")

    return report

def main():
    registry_file = ".gemini/registry.json"
    if not os.path.exists(registry_file):
        print(f"Error: {registry_file} not found.")
        sys.exit(1)

    with open(registry_file, 'r', encoding='utf-8') as f:
        data = json.load(f)

    full_report = {
        "timestamp": datetime.now().isoformat(),
        "summary": {"total": 0, "pass": 0, "fail": 0},
        "skills": [],
        "agents": [],
        "registry_sync": {"status": "pass", "errors": []}
    }

    # Validate Skills
    for skill in data["skills"]:
        name = skill["name"]
        path = f".gemini/skills/{name}/SKILL.md"
        result = check_skill(name, path)
        full_report["skills"].append(result)
        full_report["summary"]["total"] += 1
        if result["status"] == "pass":
            full_report["summary"]["pass"] += 1
        else:
            full_report["summary"]["fail"] += 1

    # Validate Agents
    for agent in data["agents"]:
        agent_report = {"name": agent["name"], "status": "pass", "errors": []}
        if not os.path.exists(agent["file"]):
            agent_report["status"] = "fail"
            agent_report["errors"].append(f"Agent file not found: {agent['file']}")
        full_report["agents"].append(agent_report)

    # Registry Sync Check (orphan skills)
    skills_dir = ".gemini/skills"
    if os.path.exists(skills_dir):
        disk_skills = [d for d in os.listdir(skills_dir) if os.path.isdir(os.path.join(skills_dir, d))]
        reg_skills = [s["name"] for s in data["skills"]]
        for ds in disk_skills:
            if ds not in reg_skills:
                full_report["registry_sync"]["status"] = "fail"
                full_report["registry_sync"]["errors"].append(f"Orphan skill directory found (not in registry): {ds}")

    # Output to stdout (for CLI) and optionally to a file
    print(json.dumps(full_report, indent=2))

    if full_report["summary"]["fail"] > 0 or full_report["registry_sync"]["status"] == "fail":
        sys.exit(1)

if __name__ == "__main__":
    main()
