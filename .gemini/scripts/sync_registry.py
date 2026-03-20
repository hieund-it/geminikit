import os
import re
import json

def get_modes(skill_name):
    modes_dir = f".gemini/skills/{skill_name}/modes"
    if os.path.exists(modes_dir):
        modes = [f.replace(".md", "") for f in os.listdir(modes_dir) if f.endswith(".md")]
        if modes:
            return ", ".join([f"`{m}`" for m in sorted(modes)])
    return "—"

def update_file(file_path, marker_start, marker_end, new_content):
    if not os.path.exists(file_path):
        print(f"Warning: {file_path} not found.")
        return False
    
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    pattern = re.compile(f"{marker_start}.*?{marker_end}", re.DOTALL)
    if not pattern.search(content):
        print(f"Warning: Markers not found in {file_path}")
        return False
    
    updated_content = pattern.sub(f"{marker_start}\n{new_content}\n{marker_end}", content)
    
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(updated_content)
    return True

def main():
    registry_file = ".gemini/registry.json"
    if not os.path.exists(registry_file):
        print(f"Error: {registry_file} not found.")
        return

    with open(registry_file, 'r', encoding='utf-8') as f:
        data = json.load(f)

    # Pre-process: Group skills by agent
    agent_to_skills = {}
    for skill in data["skills"]:
        agent = skill["agent"]
        if agent not in agent_to_skills:
            agent_to_skills[agent] = []
        agent_to_skills[agent].append(skill["name"])

    # 1. Build Agent Registry Table (for GEMINI.md) - ADDED SKILLS COLUMN
    agent_table = "| Agent | Skills | Specialization |\n|-------|--------|----------------|\n"
    for agent in data["agents"]:
        skills_list = ", ".join([f"`{s}`" for s in sorted(agent_to_skills.get(agent['name'], []))])
        if not skills_list: skills_list = "—"
        agent_table += f"| {agent['name']} | {skills_list} | {agent['specialization']} |\n"

    # 2. Build Command Table (for AGENT.md & REGISTRY.md)
    cmd_table_agent = "| Command | Agent | Mode flags |\n|---------|-------|------------|\n"
    cmd_table_registry = "| Command | Agent | Skills | Description |\n|---------|-------|--------|-------------|\n"
    
    for skill in data["skills"]:
        # Escape pipe symbols in flags to prevent breaking markdown tables
        safe_flags = skill['flags'].replace("|", "\\|")
        clean_flags = safe_flags if skill['flags'] != "none" else "—"
        
        cmd_table_agent += f"| `{skill['command']}` | {skill['agent']} | `{clean_flags}` |\n"
        
        full_cmd = f"`{skill['command']}`"
        if skill['flags'] != "none":
            full_cmd = f"`{skill['command']} [{safe_flags}] <args>`"
            
        cmd_table_registry += f"| {full_cmd} | {skill['agent']} | gk-{skill['name']} | {skill['description']} |\n"

    # 3. Build Skill Routing List (for AGENT.md)
    skill_routing = ""
    for skill in data["skills"]:
        skill_routing += f"- `{skill['name']}/SKILL.md` — {skill['description']}\n"

    # 4. Build Skill Registry Table (for REGISTRY.md)
    skill_registry = "| Skill | File | Modes | Use for |\n|-------|------|-------|---------|\n"
    for skill in data["skills"]:
        modes = get_modes(skill["name"])
        skill_registry += f"| {skill['name']} | `.gemini/skills/{skill['name']}/SKILL.md` | {modes} | {skill['description']} |\n"

    # Update files
    update_file("GEMINI.md", "<!-- GK_AGENT_REGISTRY_START -->", "<!-- GK_AGENT_REGISTRY_END -->", agent_table)
    update_file(".gemini/AGENT.md", "<!-- GK_COMMAND_TABLE_START -->", "<!-- GK_COMMAND_TABLE_END -->", cmd_table_agent)
    update_file(".gemini/AGENT.md", "<!-- GK_SKILL_ROUTING_START -->", "<!-- GK_SKILL_ROUTING_END -->", skill_routing)
    update_file(".gemini/REGISTRY.md", "<!-- GK_COMMAND_TABLE_START -->", "<!-- GK_COMMAND_TABLE_END -->", cmd_table_registry)
    update_file(".gemini/REGISTRY.md", "<!-- GK_SKILL_REGISTRY_START -->", "<!-- GK_SKILL_REGISTRY_END -->", skill_registry)
    
    print("Sync completed with enhanced clarity.")

if __name__ == "__main__":
    main()
