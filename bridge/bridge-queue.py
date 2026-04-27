"""
Queue helpers and pipeline state management for the bridge orchestrator.
Python 3.10+ stdlib only.
"""

import glob
import logging
from datetime import datetime, timezone
from pathlib import Path


def find_next_task(queue_dir: Path, read_json_atomic) -> dict | None:
    """
    Scan queue_dir for task-*.json files with status 'pending'.
    Returns the first pending task sorted by ID (FIFO), or None.
    """
    pattern = str(queue_dir / "task-*.json")
    task_files = sorted(glob.glob(pattern))
    for fpath in task_files:
        try:
            task = read_json_atomic(fpath)
            if task.get("status") == "pending":
                task["_path"] = fpath  # stash path for later writes
                return task
        except Exception as e:
            logging.warning("Failed to read task file %s: %s", fpath, e)
    return None


def task_path(task: dict, queue_dir: Path) -> Path:
    """Resolve task file path from stashed _path or reconstruct it."""
    if "_path" in task:
        return Path(task["_path"])
    return queue_dir / f"{task['id']}.json"


def save_task(task: dict, queue_dir: Path, write_json_atomic) -> None:
    """Persist task dict to disk, stripping internal _path key."""
    path = task_path(task, queue_dir)
    data = {k: v for k, v in task.items() if not k.startswith("_")}
    data["updated_at"] = datetime.now(timezone.utc).isoformat()
    write_json_atomic(str(path), data)


def update_pipeline_state(
    bridge_dir: Path,
    queue_dir: Path,
    task_statuses: list[str],
    read_json_atomic,
    write_json_atomic,
    create_pipeline_state,
) -> None:
    """Recount tasks by status and persist pipeline state."""
    state_path = bridge_dir / "state.json"
    try:
        state = read_json_atomic(str(state_path))
    except (FileNotFoundError, ValueError):
        state = create_pipeline_state("")

    stats = {s: 0 for s in task_statuses}
    task_files = glob.glob(str(queue_dir / "task-*.json"))
    for fpath in task_files:
        try:
            t = read_json_atomic(fpath)
            s = t.get("status", "")
            if s in stats:
                stats[s] += 1
        except Exception:
            pass

    state["stats"] = stats
    state["total_tasks"] = len(task_files)

    if stats["executing"] > 0 or stats["reviewing"] > 0:
        state["pipeline_status"] = "running"
    elif stats["pending"] > 0:
        state["pipeline_status"] = "running"
    elif stats["failed"] > 0 and stats["pending"] == 0:
        state["pipeline_status"] = "failed" if stats["done"] == 0 else "completed"
    elif stats["done"] > 0 and stats["pending"] == 0:
        state["pipeline_status"] = "completed"
    else:
        state["pipeline_status"] = "idle"

    state["updated_at"] = datetime.now(timezone.utc).isoformat()
    write_json_atomic(str(state_path), state)
