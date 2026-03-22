"""
Bridge task schema constants, factory functions, and atomic I/O helpers.
No external dependencies — stdlib only (json, os, re, tempfile, datetime).
"""

import json
import os
import re
import tempfile
from datetime import datetime, timezone

# Valid status transitions for pipeline tasks
TASK_STATUSES = [
    "pending",
    "executing",
    "gemini_done",
    "reviewing",
    "review_done",
    "done",
    "failed",
]

TASK_TYPES = ["implement", "fix", "test", "refactor"]

PIPELINE_STATUSES = ["idle", "running", "paused", "completed", "failed"]

# Task IDs must be filesystem-safe: lowercase alphanumeric and hyphens only.
# Prevents path traversal and ensures safe use in filenames.
TASK_ID_PATTERN = re.compile(r'^[a-z0-9-]+$')


def create_task(task_id, phase, title, task_type, prompt, review_prompt, context_files=None):
    """Factory: create a task dict with all required fields and sane defaults."""
    if context_files is None:
        context_files = []
    now = _now_iso()
    return {
        "id": task_id,
        "phase": phase,
        "title": title,
        "type": task_type,
        "prompt": prompt,
        "review_prompt": review_prompt,
        "context_files": context_files,
        "status": "pending",
        "assigned_to": "gemini",
        "retry_count": 0,
        "max_retries": 3,
        "gemini_summary": None,
        "review_result": None,
        "review_passed": None,
        "created_at": now,
        "updated_at": now,
    }


def validate_task(task_dict):
    """
    Validate a task dict against the schema.
    Returns a list of error strings; empty list means valid.
    """
    errors = []
    required = [
        "id", "phase", "title", "type", "prompt", "review_prompt",
        "context_files", "status", "assigned_to", "retry_count",
        "max_retries", "created_at", "updated_at",
    ]
    for field in required:
        if field not in task_dict:
            errors.append(f"Missing required field: {field}")

    # Validate task ID — used directly in file paths, must be safe
    task_id = task_dict.get("id", "")
    if not task_id or not TASK_ID_PATTERN.match(task_id):
        errors.append(f"Invalid task ID '{task_id}': must match [a-z0-9-]+")

    if task_dict.get("type") not in TASK_TYPES:
        errors.append(f"Invalid type '{task_dict.get('type')}': must be one of {TASK_TYPES}")

    if task_dict.get("status") not in TASK_STATUSES:
        errors.append(f"Invalid status '{task_dict.get('status')}': must be one of {TASK_STATUSES}")

    if not isinstance(task_dict.get("context_files", []), list):
        errors.append("context_files must be a list")

    retry = task_dict.get("retry_count", 0)
    max_r = task_dict.get("max_retries", 3)
    if not isinstance(retry, int) or retry < 0:
        errors.append("retry_count must be a non-negative integer")
    if not isinstance(max_r, int) or max_r < 1:
        errors.append("max_retries must be a positive integer")

    return errors


def create_pipeline_state(plan_file):
    """Factory: create initial pipeline state dict."""
    now = _now_iso()
    return {
        "plan_file": str(plan_file),
        "pipeline_status": "idle",
        "total_tasks": 0,
        "stats": {s: 0 for s in TASK_STATUSES},
        "created_at": now,
        "updated_at": now,
    }


def read_json_atomic(path):
    """Read and parse JSON from path. Raises on missing file or parse error."""
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


def write_json_atomic(path, data):
    """
    Write data as pretty-printed JSON to path atomically.
    Uses temp file in same directory + os.replace to prevent corruption
    on crash (atomic on both POSIX and Windows).
    """
    dir_path = os.path.dirname(os.path.abspath(path))
    os.makedirs(dir_path, exist_ok=True)
    fd, tmp_path = tempfile.mkstemp(dir=dir_path, suffix=".tmp")
    try:
        with os.fdopen(fd, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
            f.write("\n")
        os.replace(tmp_path, path)
    except Exception:
        try:
            os.unlink(tmp_path)
        except OSError:
            pass
        raise


def _now_iso():
    """Return current UTC time as ISO 8601 string."""
    return datetime.now(timezone.utc).isoformat()
