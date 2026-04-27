"""
Gemini and Claude dispatch logic for the bridge orchestrator.
Python 3.10+ stdlib only.
"""

import logging
import subprocess
import sys
from pathlib import Path

# Timeouts in seconds
GEMINI_TIMEOUT = 300
CLAUDE_TIMEOUT = 120


def find_cli(name: str) -> str:
    """
    Resolve CLI executable, appending .cmd on Windows so subprocess can find
    npm-installed binaries (e.g. gemini.cmd, claude.cmd) without shell=True.
    """
    if sys.platform == "win32":
        import shutil
        cmd_name = name + ".cmd"
        if shutil.which(cmd_name):
            return cmd_name
    return name


def dispatch_gemini(
    task: dict,
    queue_dir: Path,
    project_root: Path,
    logger: logging.Logger,
    task_path_fn,
    save_task_fn,
    read_json_atomic,
) -> bool:
    """
    Dispatch task to Gemini for execution.
    Returns True if Gemini updated status to 'gemini_done', False otherwise.
    """
    task_file = task_path_fn(task, queue_dir)
    prompt = (
        f"{task['prompt']}\n\n"
        f"---\n"
        f"BRIDGE TASK: {task['id']}\n"
        f"After completing the task, update the task file at: {task_file}\n"
        f"Set status to 'gemini_done', write gemini_summary, update updated_at."
    )

    task["status"] = "executing"
    save_task_fn(task, queue_dir)
    logger.info("Dispatching task %s to Gemini", task["id"])

    cmd = [find_cli("gemini"), "-p", prompt, "--yolo", "--approval-mode", "yolo"]
    try:
        result = subprocess.run(
            cmd, capture_output=True, text=True,
            timeout=GEMINI_TIMEOUT, cwd=str(project_root),
        )
    except subprocess.TimeoutExpired:
        logger.error("Task %s: Gemini timed out after %ds", task["id"], GEMINI_TIMEOUT)
        task["status"] = "failed"
        task["gemini_summary"] = f"Timed out after {GEMINI_TIMEOUT}s"
        save_task_fn(task, queue_dir)
        return False
    except FileNotFoundError:
        logger.error("Task %s: 'gemini' command not found in PATH", task["id"])
        task["status"] = "failed"
        task["gemini_summary"] = "gemini command not found"
        save_task_fn(task, queue_dir)
        return False

    # Re-read task to check if Gemini Skill updated the status
    try:
        updated = read_json_atomic(str(task_file))
        if updated.get("status") == "gemini_done":
            logger.info("Task %s: Gemini completed (status=gemini_done)", task["id"])
            task.update(updated)
            task["_path"] = str(task_file)
            return True
    except Exception as e:
        logger.warning("Task %s: Could not re-read task file: %s", task["id"], e)

    if result.returncode != 0:
        logger.error("Task %s: Gemini exited %d. stderr: %s", task["id"], result.returncode, result.stderr[:500])
        task["status"] = "failed"
        task["gemini_summary"] = f"exit_code={result.returncode}: {result.stderr[:300]}"
        save_task_fn(task, queue_dir)
        return False

    # Exit 0 but status not updated — treat as incomplete
    logger.warning("Task %s: Gemini exited 0 but did not update status to gemini_done", task["id"])
    task["status"] = "failed"
    task["gemini_summary"] = "Gemini did not update task status after execution"
    save_task_fn(task, queue_dir)
    return False


def dispatch_claude_review(
    task: dict,
    project_root: Path,
    logger: logging.Logger,
) -> tuple[bool, str]:
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

    cmd = [find_cli("claude"), "--print", review_prompt]
    logger.info("Task %s: sending to Claude for review", task["id"])
    try:
        result = subprocess.run(
            cmd, capture_output=True, text=True,
            timeout=CLAUDE_TIMEOUT, cwd=str(project_root),
        )
    except subprocess.TimeoutExpired:
        logger.error("Task %s: Claude review timed out after %ds", task["id"], CLAUDE_TIMEOUT)
        return False, f"Claude review timed out after {CLAUDE_TIMEOUT}s"
    except FileNotFoundError:
        logger.error("Task %s: 'claude' command not found in PATH", task["id"])
        return False, "claude command not found"

    output = result.stdout
    if "BRIDGE_STATUS: PASS" in output:
        return True, output.split("BRIDGE_STATUS:")[0].strip()
    elif "BRIDGE_STATUS: FAIL" in output:
        return False, output.split("BRIDGE_STATUS:")[0].strip()
    else:
        logger.warning("Task %s: No BRIDGE_STATUS marker in Claude output — treating as FAIL", task["id"])
        return False, output[:1000]


def handle_review_result(
    task: dict,
    passed: bool,
    summary: str,
    queue_dir: Path,
    logger: logging.Logger,
    save_task_fn,
) -> None:
    """Update task status based on review outcome; apply retry logic on failure."""
    task["review_result"] = summary
    task["review_passed"] = passed

    if passed:
        task["status"] = "done"
        logger.info("Task %s: marked done", task["id"])
    else:
        if task["retry_count"] < task["max_retries"]:
            task["retry_count"] += 1
            task["status"] = "pending"
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

    save_task_fn(task, queue_dir)
