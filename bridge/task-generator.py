"""
Bridge task generator: reads plan.md + phase-XX-*.md files, generates
task-*.json files in .bridge/queue/ for the orchestrator to process.
Python 3.10+ stdlib only (re, pathlib, json, argparse).
"""

import argparse
import importlib.util
import re
import sys
from datetime import datetime, timezone
from pathlib import Path


# ---------------------------------------------------------------------------
# Dynamic import for task-schema (kebab filename, not importable via normal import)
# ---------------------------------------------------------------------------

def _load_task_schema():
    schema_path = Path(__file__).parent / "task-schema.py"
    spec = importlib.util.spec_from_file_location("task_schema", schema_path)
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


_schema = _load_task_schema()
create_task = _schema.create_task
validate_task = _schema.validate_task
create_pipeline_state = _schema.create_pipeline_state
write_json_atomic = _schema.write_json_atomic

# ---------------------------------------------------------------------------
# Plan parsing
# ---------------------------------------------------------------------------

def parse_plan(plan_path: Path) -> dict:
    """
    Parse plan.md: extract YAML frontmatter title/status and phase table rows.
    Returns {'title': str, 'status': str, 'phases': [{'num', 'name', 'file_path'}]}
    """
    text = plan_path.read_text(encoding="utf-8")
    plan_dir = plan_path.parent

    # Extract YAML frontmatter (between --- delimiters)
    title = "Unknown Plan"
    status = "pending"
    fm_match = re.search(r'^---\s*\n(.*?)\n---', text, re.DOTALL)
    if fm_match:
        fm = fm_match.group(1)
        t = re.search(r'^title:\s*["\']?(.+?)["\']?\s*$', fm, re.MULTILINE)
        s = re.search(r'^status:\s*(\S+)', fm, re.MULTILINE)
        if t:
            title = t.group(1).strip()
        if s:
            status = s.group(1).strip()

    # Parse phase table rows: | num | Name | effort | status | [file](path) |
    phases = []
    for row in re.finditer(r'^\|\s*(\d+)\s*\|([^|]+)\|([^|]+)\|([^|]+)\|\s*\[([^\]]+)\]\(([^)]+)\)', text, re.MULTILINE):
        num = int(row.group(1))
        name = row.group(2).strip()
        file_ref = row.group(6).strip()

        # Resolve file path relative to plan directory
        file_path = plan_dir / file_ref
        phases.append({"num": num, "name": name, "file_path": file_path})

    return {"title": title, "status": status, "phases": phases}


# ---------------------------------------------------------------------------
# Phase file parsing
# ---------------------------------------------------------------------------

def parse_phase_file(phase_path: Path) -> dict:
    """
    Extract structured sections from a phase-XX-*.md file.
    Returns dict with keys: title, description, steps, context_files, success_criteria.
    """
    if not phase_path.exists():
        return {
            "title": phase_path.stem,
            "description": "",
            "steps": [],
            "context_files": [],
            "success_criteria": [],
        }

    text = phase_path.read_text(encoding="utf-8")

    # Split by ## headers into sections
    sections = {}
    current_header = "preamble"
    current_lines = []
    for line in text.splitlines():
        h = re.match(r'^##\s+(.+)', line)
        if h:
            sections[current_header] = "\n".join(current_lines)
            current_header = h.group(1).strip()
            current_lines = []
        else:
            current_lines.append(line)
    sections[current_header] = "\n".join(current_lines)

    # Phase title from first # heading
    title_match = re.search(r'^#\s+(.+)', text, re.MULTILINE)
    title = title_match.group(1).strip() if title_match else phase_path.stem

    # Description from Overview section
    description = ""
    overview_text = sections.get("Overview", "")
    desc_match = re.search(r'[\*-]\s*\*\*Description:\*\*\s*(.+)', overview_text)
    if desc_match:
        description = desc_match.group(1).strip()

    # Implementation steps: numbered list items
    steps_text = sections.get("Implementation Steps", "")
    steps = re.findall(r'^\d+\.\s+(.+)', steps_text, re.MULTILINE)

    # Context files from Related Code Files section
    files_text = sections.get("Related Code Files", "")
    context_files = re.findall(r'`([^`]+\.[a-z]+)`', files_text)

    # Success criteria: bullet points
    criteria_text = sections.get("Success Criteria", "")
    success_criteria = re.findall(r'^[-*]\s+(.+)', criteria_text, re.MULTILINE)

    return {
        "title": title,
        "description": description,
        "steps": steps,
        "context_files": context_files,
        "success_criteria": success_criteria,
    }


# ---------------------------------------------------------------------------
# Template interpolation
# ---------------------------------------------------------------------------

def apply_template(template_str: str, variables: dict) -> str:
    """Simple {{variable_name}} substitution. No eval, no external deps."""
    result = template_str
    for key, value in variables.items():
        result = result.replace(f"{{{{{key}}}}}", str(value))
    return result


# ---------------------------------------------------------------------------
# Task generation
# ---------------------------------------------------------------------------

def _detect_task_type(phase_data: dict) -> str:
    """Infer task type from title/description keywords."""
    combined = f"{phase_data['title']} {phase_data['description']}".lower()
    if any(w in combined for w in ("test", "testing", "spec", "coverage")):
        return "test"
    if any(w in combined for w in ("fix", "bug", "repair", "patch")):
        return "fix"
    if any(w in combined for w in ("refactor", "cleanup", "reorganize", "restructure")):
        return "refactor"
    return "implement"


def generate_tasks(phases: list, template_dir: Path) -> list:
    """
    For each phase, parse its file and produce a task dict.
    Phases with >10 steps are split into sub-tasks of ≤10 steps each.
    """
    task_prompt_path = template_dir / "task-prompt-template.md"
    review_prompt_path = template_dir / "review-prompt-template.md"

    if not task_prompt_path.exists():
        raise FileNotFoundError(
            f"Task prompt template not found: {task_prompt_path}\n"
            "Run 'gk bridge init' to copy templates to .bridge/rules/"
        )

    task_template = task_prompt_path.read_text(encoding="utf-8")
    review_template = review_prompt_path.read_text(encoding="utf-8")

    # Strip YAML frontmatter from templates before interpolation
    task_template = re.sub(r'^---.*?---\s*', '', task_template, flags=re.DOTALL)
    review_template = re.sub(r'^---.*?---\s*', '', review_template, flags=re.DOTALL)

    tasks = []
    for phase in phases:
        phase_data = parse_phase_file(phase["file_path"])
        phase_num = phase["num"]
        task_type = _detect_task_type(phase_data)

        # Split large phases into sub-tasks (max 10 steps each)
        step_chunks = _chunk_steps(phase_data["steps"], chunk_size=10)
        if not step_chunks:
            step_chunks = [[f"Implement phase {phase_num}: {phase_data['title']}"]]

        for step_idx, chunk in enumerate(step_chunks, start=1):
            task_id = f"task-{phase_num:02d}-{step_idx:02d}"
            steps_text = "\n".join(f"{i+1}. {s}" for i, s in enumerate(chunk))
            context_text = "\n".join(f"- {f}" for f in phase_data["context_files"]) or "(none specified)"
            criteria_text = "\n".join(f"- {c}" for c in phase_data["success_criteria"]) or "(see phase spec)"

            variables = {
                "task_id": task_id,
                "task_title": phase_data["title"],
                "task_type": task_type,
                "phase": str(phase_num),
                "implementation_steps": steps_text,
                "context_files": context_text,
                "success_criteria": criteria_text,
                "phase_description": phase_data["description"],
            }

            prompt = apply_template(task_template, variables)
            review_prompt = apply_template(review_template, variables)

            task = create_task(
                task_id=task_id,
                phase=phase_num,
                title=phase_data["title"],
                task_type=task_type,
                prompt=prompt,
                review_prompt=review_prompt,
                context_files=phase_data["context_files"],
            )
            tasks.append(task)

    return tasks


def _chunk_steps(steps: list, chunk_size: int) -> list:
    """Split steps list into chunks of up to chunk_size items."""
    if not steps:
        return []
    return [steps[i:i + chunk_size] for i in range(0, len(steps), chunk_size)]


# ---------------------------------------------------------------------------
# Queue writing
# ---------------------------------------------------------------------------

def write_task_queue(tasks: list, bridge_dir: Path) -> None:
    """Write task JSON files to .bridge/queue/ and initialise state.json."""
    queue_dir = bridge_dir / "queue"
    queue_dir.mkdir(parents=True, exist_ok=True)

    # Clear stale task files from previous runs to prevent orphaned tasks
    for stale in queue_dir.glob("task-*.json"):
        stale.unlink()

    for task in tasks:
        errors = validate_task(task)
        if errors:
            raise ValueError(f"Invalid task {task.get('id')}: {errors}")
        path = queue_dir / f"{task['id']}.json"
        write_json_atomic(str(path), task)

    # Initialise / update state.json with total count
    state_path = bridge_dir / "state.json"
    try:
        from pathlib import Path as _P
        import json as _json
        existing = _json.loads(state_path.read_text(encoding="utf-8")) if state_path.exists() else {}
    except Exception:
        existing = {}

    state = create_pipeline_state(existing.get("plan_file", ""))
    state["total_tasks"] = len(tasks)
    write_json_atomic(str(state_path), state)


# ---------------------------------------------------------------------------
# Entry point
# ---------------------------------------------------------------------------

def main():
    parser = argparse.ArgumentParser(description="Generate bridge task queue from a plan.md")
    parser.add_argument("--plan", required=True, help="Path to plan.md file")
    parser.add_argument("--bridge-dir", default=".bridge", help="Bridge runtime directory (default: .bridge)")
    parser.add_argument("--template-dir", default=None, help="Template directory (default: <bridge-dir>/rules/)")
    args = parser.parse_args()

    plan_path = Path(args.plan).resolve()
    bridge_dir = Path(args.bridge_dir).resolve()
    template_dir = Path(args.template_dir).resolve() if args.template_dir else bridge_dir / "rules"

    if not plan_path.exists():
        print(f"Error: plan file not found: {plan_path}", file=sys.stderr)
        sys.exit(1)

    print(f"Parsing plan: {plan_path}")
    plan = parse_plan(plan_path)
    print(f"  Found {len(plan['phases'])} phase(s): {[p['name'] for p in plan['phases']]}")

    tasks = generate_tasks(plan["phases"], template_dir)
    write_task_queue(tasks, bridge_dir)

    print(f"\nGenerated {len(tasks)} task(s) in {bridge_dir / 'queue'}/")
    for t in tasks:
        print(f"  {t['id']}: {t['title']} [{t['type']}]")


if __name__ == "__main__":
    main()
