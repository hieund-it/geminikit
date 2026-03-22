"""
Bridge orchestrator: polls .bridge/queue/ for pending tasks, dispatches to
Gemini (execute) then Claude (review), handles retry logic and state tracking.
Python 3.10+ stdlib only.
"""

import argparse
import glob
import logging
import os
import importlib.util
import signal
import subprocess
import sys
import time
from datetime import datetime, timezone
from pathlib import Path


def _load_task_schema():
    """Load task-schema module dynamically (kebab filename can't use regular import)."""
    schema_path = Path(__file__).parent / "task-schema.py"
    spec = importlib.util.spec_from_file_location("task_schema", schema_path)
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


_schema = _load_task_schema()
TASK_STATUSES = _schema.TASK_STATUSES
create_pipeline_state = _schema.create_pipeline_state
read_json_atomic = _schema.read_json_atomic
write_json_atomic = _schema.write_json_atomic

# Timeouts in seconds
GEMINI_TIMEOUT = 300
CLAUDE_TIMEOUT = 120
POLL_INTERVAL = 2  # seconds between queue scans

_shutdown_requested = False


# ---------------------------------------------------------------------------
# Logging setup
# ---------------------------------------------------------------------------

def setup_logging(log_dir: Path) -> logging.Logger:
    """Configure file + console logging; returns root logger."""
    log_dir.mkdir(parents=True, exist_ok=True)
    stamp = datetime.now().strftime("%Y%m%d-%H%M%S")
    log_file = log_dir / f"pipeline-{stamp}.log"

    fmt = "[%(asctime)s] [%(levelname)s] %(message)s"
    datefmt = "%Y-%m-%dT%H:%M:%S"

    logging.basicConfig(
        level=logging.INFO,
        format=fmt,
        datefmt=datefmt,
        handlers=[
            logging.FileHandler(log_file, encoding="utf-8"),
            logging.StreamHandler(sys.stdout),
        ],
    )
    return logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# Queue helpers
# ---------------------------------------------------------------------------

def find_next_task(queue_dir: Path) -> dict | None:
    """
    Scan queue_dir for task-*.json files with status 'pending'.
    Returns the first pending task sorted by ID (FIFO), or None.
    """
    pattern = str(queue_dir / "task-*.json")
    task_files = sorted(glob.glob(pattern))  # sorted by filename = by ID
    for fpath in task_files:
        try:
            task = read_json_atomic(fpath)
            if task.get("status") == "pending":
                task["_path"] = fpath  # stash path for later writes
                return task
        except Exception as e:
            logging.warning("Failed to read task file %s: %s", fpath, e)
    return None


def _task_path(task: dict, queue_dir: Path) -> Path:
    """Resolve task file path from stashed _path or reconstruct it."""
    if "_path" in task:
        return Path(task["_path"])
    return queue_dir / f"task-{task['id']}.json"


def _save_task(task: dict, queue_dir: Path) -> None:
    """Persist task dict to disk, stripping internal _path key."""
    path = _task_path(task, queue_dir)
    data = {k: v for k, v in task.items() if not k.startswith("_")}
    data["updated_at"] = datetime.now(timezone.utc).isoformat()
    write_json_atomic(str(path), data)


# ---------------------------------------------------------------------------
# Gemini dispatch
# ---------------------------------------------------------------------------

def dispatch_gemini(task: dict, queue_dir: Path, project_root: Path, logger: logging.Logger) -> bool:
    """
    Dispatch task to Gemini for execution.
    Returns True if Gemini updated status to 'gemini_done', False otherwise.
    """
    task_file = _task_path(task, queue_dir)
    prompt = (
        f"{task['prompt']}\n\n"
        f"---\n"
        f"BRIDGE TASK: {task['id']}\n"
        f"After completing the task, update the task file at: {task_file}\n"
        f"Set status to 'gemini_done', write gemini_summary, update updated_at."
    )

    # Mark as executing before dispatch
    task["status"] = "executing"
    _save_task(task, queue_dir)
    logger.info("Dispatching task %s to Gemini", task["id"])

    cmd = ["gemini", "-p", prompt, "--yolo", "--approval-mode", "yolo"]
    try:
        result = subprocess.run(
            cmd,
            capture_output=True,
            text=True,
            timeout=GEMINI_TIMEOUT,
            cwd=str(project_root),
        )
    except subprocess.TimeoutExpired:
        logger.error("Task %s: Gemini timed out after %ds", task["id"], GEMINI_TIMEOUT)
        task["status"] = "failed"
        task["gemini_summary"] = f"Timed out after {GEMINI_TIMEOUT}s"
        _save_task(task, queue_dir)
        return False
    except FileNotFoundError:
        logger.error("Task %s: 'gemini' command not found in PATH", task["id"])
        task["status"] = "failed"
        task["gemini_summary"] = "gemini command not found"
        _save_task(task, queue_dir)
        return False

    # Re-read task to check if Gemini Skill updated the status
    try:
        updated = read_json_atomic(str(task_file))
        if updated.get("status") == "gemini_done":
            logger.info("Task %s: Gemini completed (status=gemini_done)", task["id"])
            # Merge updated fields into local task dict
            task.update(updated)
            task["_path"] = str(task_file)
            return True
    except Exception as e:
        logger.warning("Task %s: Could not re-read task file: %s", task["id"], e)

    # Gemini exited but didn't update status
    if result.returncode != 0:
        logger.error("Task %s: Gemini exited %d. stderr: %s", task["id"], result.returncode, result.stderr[:500])
        task["status"] = "failed"
        task["gemini_summary"] = f"exit_code={result.returncode}: {result.stderr[:300]}"
        _save_task(task, queue_dir)
        return False

    # Exit 0 but status not updated — treat as incomplete
    logger.warning("Task %s: Gemini exited 0 but did not update status to gemini_done", task["id"])
    task["status"] = "failed"
    task["gemini_summary"] = "Gemini did not update task status after execution"
    _save_task(task, queue_dir)
    return False


# ---------------------------------------------------------------------------
# Claude review
# ---------------------------------------------------------------------------

def dispatch_claude_review(task: dict, project_root: Path, logger: logging.Logger) -> tuple[bool, str]:
    """
    Send task to Claude for code review.
    Returns (passed: bool, summary: str).
    Falls back to FAIL if BRIDGE_STATUS marker is absent.
    """
    review_prompt = (
        f"{task['review_prompt']}\n\n"
        f"---\n"
        f"Gemini Summary:\n{task.get('gemini_summary') or '(no summary provided)'}\n\n"
        f"Context files: {', '.join(task.get('context_files', [])) or 'none'}\n\n"
        f"End your review with exactly one of:\n"
        f"BRIDGE_STATUS: PASS\n"
        f"BRIDGE_STATUS: FAIL"
    )

    cmd = ["claude", "--print", review_prompt]
    logger.info("Task %s: sending to Claude for review", task["id"])
    try:
        result = subprocess.run(
            cmd,
            capture_output=True,
            text=True,
            timeout=CLAUDE_TIMEOUT,
            cwd=str(project_root),
        )
    except subprocess.TimeoutExpired:
        logger.error("Task %s: Claude review timed out after %ds", task["id"], CLAUDE_TIMEOUT)
        return False, f"Claude review timed out after {CLAUDE_TIMEOUT}s"
    except FileNotFoundError:
        logger.error("Task %s: 'claude' command not found in PATH", task["id"])
        return False, "claude command not found"

    output = result.stdout

    # Parse machine-readable status marker
    if "BRIDGE_STATUS: PASS" in output:
        # Extract summary: text before the marker line
        summary = output.split("BRIDGE_STATUS:")[0].strip()
        logger.info("Task %s: Claude review PASSED", task["id"])
        return True, summary
    elif "BRIDGE_STATUS: FAIL" in output:
        summary = output.split("BRIDGE_STATUS:")[0].strip()
        logger.info("Task %s: Claude review FAILED", task["id"])
        return False, summary
    else:
        # No marker found — treat as FAIL with full output as context
        logger.warning("Task %s: No BRIDGE_STATUS marker in Claude output — treating as FAIL", task["id"])
        return False, output[:1000]


# ---------------------------------------------------------------------------
# Review result handling
# ---------------------------------------------------------------------------

def handle_review_result(
    task: dict,
    passed: bool,
    summary: str,
    queue_dir: Path,
    logger: logging.Logger,
) -> None:
    """Update task status based on review outcome; apply retry logic on failure."""
    task["review_result"] = summary
    task["review_passed"] = passed
    task["status"] = "reviewing"
    _save_task(task, queue_dir)

    if passed:
        task["status"] = "done"
        logger.info("Task %s: marked done", task["id"])
    else:
        if task["retry_count"] < task["max_retries"]:
            task["retry_count"] += 1
            task["status"] = "pending"
            # Append failure context to prompt so Gemini knows what to fix
            task["prompt"] = (
                f"{task['prompt']}\n\n"
                f"--- RETRY {task['retry_count']} ---\n"
                f"Previous attempt failed review. Reviewer feedback:\n{summary[:500]}\n"
                f"Please address the feedback and try again."
            )
            logger.info("Task %s: retry %d/%d queued", task["id"], task["retry_count"], task["max_retries"])
        else:
            task["status"] = "failed"
            logger.warning("Task %s: max retries (%d) exhausted — marked failed", task["id"], task["max_retries"])

    _save_task(task, queue_dir)


# ---------------------------------------------------------------------------
# Pipeline state
# ---------------------------------------------------------------------------

def update_pipeline_state(bridge_dir: Path, queue_dir: Path) -> None:
    """Recount tasks by status and persist pipeline state."""
    state_path = bridge_dir / "state.json"
    try:
        state = read_json_atomic(str(state_path))
    except (FileNotFoundError, ValueError):
        state = create_pipeline_state("")

    stats = {s: 0 for s in TASK_STATUSES}
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

    # Derive overall pipeline status from task counts
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


# ---------------------------------------------------------------------------
# Main loop
# ---------------------------------------------------------------------------

def run_pipeline(bridge_dir: Path, logger: logging.Logger) -> None:
    """Main orchestration loop: poll queue, dispatch, review, repeat."""
    queue_dir = bridge_dir / "queue"
    queue_dir.mkdir(parents=True, exist_ok=True)

    state_path = bridge_dir / "state.json"
    if not state_path.exists():
        write_json_atomic(str(state_path), create_pipeline_state(""))

    project_root = bridge_dir.parent
    logger.info("Orchestrator started. Polling %s every %ds", queue_dir, POLL_INTERVAL)

    while not _shutdown_requested:
        update_pipeline_state(bridge_dir, queue_dir)
        task = find_next_task(queue_dir)

        if task is None:
            # Check if all tasks are terminal (done/failed)
            state = read_json_atomic(str(state_path))
            stats = state.get("stats", {})
            if stats.get("pending", 0) == 0 and stats.get("executing", 0) == 0:
                total = state.get("total_tasks", 0)
                terminal = stats.get("done", 0) + stats.get("failed", 0)
                if total > 0 and terminal >= total:
                    logger.info("All %d tasks complete. Pipeline finished.", total)
                    break
            time.sleep(POLL_INTERVAL)
            continue

        # Dispatch to Gemini for implementation
        gemini_ok = dispatch_gemini(task, queue_dir, project_root, logger)
        if not gemini_ok:
            update_pipeline_state(bridge_dir, queue_dir)
            continue

        # Send to Claude for review
        task["status"] = "reviewing"
        _save_task(task, queue_dir)
        passed, summary = dispatch_claude_review(task, project_root, logger)
        handle_review_result(task, passed, summary, queue_dir, logger)
        update_pipeline_state(bridge_dir, queue_dir)

    if _shutdown_requested:
        logger.info("Graceful shutdown requested. Orchestrator stopped.")


# ---------------------------------------------------------------------------
# Entry point
# ---------------------------------------------------------------------------

def _handle_signal(signum, frame):
    global _shutdown_requested
    logging.info("Signal %d received — requesting graceful shutdown...", signum)
    _shutdown_requested = True


def main():
    parser = argparse.ArgumentParser(description="Claude-Gemini bridge orchestrator")
    parser.add_argument(
        "--bridge-dir",
        default=".bridge",
        help="Path to bridge runtime directory (default: .bridge)",
    )
    args = parser.parse_args()

    bridge_dir = Path(args.bridge_dir).resolve()
    log_dir = bridge_dir / "logs"
    logger = setup_logging(log_dir)

    # Graceful shutdown on Ctrl+C / SIGTERM
    signal.signal(signal.SIGINT, _handle_signal)
    signal.signal(signal.SIGTERM, _handle_signal)

    run_pipeline(bridge_dir, logger)


if __name__ == "__main__":
    main()
