import os
import re
import json

def parse_agent(agent_path):
    with open(agent_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. Extract Name and Description (Specialization)
    name = os.path.basename(agent_path).replace('.md', '')
    specialization = "No specialization found"
    
    # Try frontmatter
    fm_match = re.search(r'^---\n(.*?)\n---', content, re.DOTALL)
    if fm_match:
        for line in fm_match.group(1).split('\n'):
            if 'description:' in line:
                specialization = line.split(':', 1)[1].strip().strip('"')
                break
    
    # If no description in frontmatter, try first paragraph of Role
    if specialization == "No specialization found":
        role_match = re.search(r'# Role\n+(.*?)\n', content)
        if role_match:
            specialization = role_match.group(1).strip()

    return {
        "name": name,
        "file": f".gemini/agents/{os.path.basename(agent_path)}",
        "specialization": specialization
    }

def parse_skill(skill_dir):
    skill_md_path = os.path.join(skill_dir, 'SKILL.md')
    if not os.path.exists(skill_md_path):
        return None
    
    with open(skill_md_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. Extract from Frontmatter
    name = os.path.basename(skill_dir)
    description = "No description found"
    fm_match = re.search(r'^---\n(.*?)\n---', content, re.DOTALL)
    if fm_match:
        for line in fm_match.group(1).split('\n'):
            if 'description:' in line:
                description = line.split(':', 1)[1].strip().strip('"')
                break

    # 2. Extract Command and Flags from Interface section
    command = f"/gk-{name}"
    flags = "none"
    
    cmd_match = re.search(r'- \*\*Invoked via:\*\*\s*(.*)', content)
    if cmd_match:
        command = cmd_match.group(1).strip()
        
    flags_match = re.search(r'- \*\*Flags:\*\*\s*(.*)', content)
    if flags_match:
        flags = flags_match.group(1).strip()

    # 3. Determine Agent — read from frontmatter `agent:` field (source of truth)
    # Falls back to "developer" if not specified in SKILL.md frontmatter
    agent = "developer"
    if fm_match:
        for line in fm_match.group(1).split('\n'):
            if line.startswith('agent:'):
                agent = line.split(':', 1)[1].strip().strip('"')
                break

    return {
        "name": name,
        "agent": agent,
        "command": command,
        "flags": flags,
        "description": description
    }

def main():
    agents_dir = '.gemini/agents'
    skills_dir = '.gemini/skills'
    output_file = '.gemini/registry.json'

    data = {
        "agents": [],
        "skills": []
    }

    # Parse Agents
    if os.path.exists(agents_dir):
        for f in os.listdir(agents_dir):
            if f.endswith('.md'):
                data["agents"].append(parse_agent(os.path.join(agents_dir, f)))

    # Parse Skills
    if os.path.exists(skills_dir):
        for d in os.listdir(skills_dir):
            if os.path.isdir(os.path.join(skills_dir, d)):
                skill_info = parse_skill(os.path.join(skills_dir, d))
                if skill_info:
                    data["skills"].append(skill_info)

    # Sort data for consistency
    data["agents"].sort(key=lambda x: x["name"])
    data["skills"].sort(key=lambda x: x["name"])

    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    
    print(f"Successfully generated {output_file}")
    print(f"Found {len(data['agents'])} agents and {len(data['skills'])} skills.")

if __name__ == "__main__":
    main()
