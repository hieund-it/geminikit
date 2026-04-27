"""
Bridge orchestrator: polls .bridge/queue/ for pending tasks, dispatches to
Gemini (execute) then Claude (review), handles retry logic and state tracking.
Python 3.10+ stdlib only.
"""

import argparse
import importlib.util
import logging
import signal
import sys
import time
from datetime import datetime
from pathlib import Path

POLL_INTERVAL = 2  # seconds between queue scans
_shutdown_requested = False


# ---------------------------------------------------------------------------
# Dynamic module loader (kebab filenames can't use regular import)
# ---------------------------------------------------------------------------

def _load_module(filename: str):
    """Load a sibling .py module by filename (supports kebab-case names)."""
    path = Path(__file__).parent / filename
    spec = importlib.util.spec_from_file_location(filename.replace("-", "_").removesuffix(".py"), path)
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


_schema = _load_module("task-schema.py")
_queue = _load_module("bridge-queue.py")
_dispatch = _load_module("bridge-dispatch.py")


# ---------------------------------------------------------------------------
# Logging setup
# ---------------------------------------------------------------------------

def setup_logging(log_dir: Path) -> logging.Logger:
    """Configure file + console logging; returns root logger."""
    log_dir.mkdir(parents=True, exist_ok=True)
    stamp = datetime.now().strftime("%Y%m%d-%H%M%S")
    log_file = log_dir / f"pipeline-{stamp}.log"
    fmt = "[%(asctime)s] [%(levelname)s] %(message)s"
    logging.basicConfig(
        level=logging.INFO,
        format=fmt,
        datefmt="%Y-%m-%dT%H:%M:%S",
        handlers=[
            logging.FileHandler(log_file, encoding="utf-8"),
            logging.StreamHandler(sys.stdout),
        ],
    )
    return logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# Main pipeline loop
# ---------------------------------------------------------------------------

def run_pipeline(bridge_dir: Path, logger: logging.Logger) -> None:
    """Main orchestration loop: poll queue, dispatch, review, repeat."""
    queue_dir = bridge_dir / "queue"
    queue_dir.mkdir(parents=True, exist_ok=True)
    state_path = bridge_dir / "state.json"

    if not state_path.exists():
        _schema.write_json_atomic(str(state_path), _schema.create_pipeline_state(""))

    project_root = bridge_dir.parent
    logger.info("Orchestrator started. Polling %s every %ds", queue_dir, POLL_INTERVAL)

    def _update_state():
        _queue.update_pipeline_state(
            bridge_dir, queue_dir, _schema.TASK_STATUSES,
            _schema.read_json_atomic, _schema.write_json_atomic, _schema.create_pipeline_state,
        )

    while not _shutdown_requested:
        _update_state()
        task = _queue.find_next_task(queue_dir, _schema.read_json_atomic)

        if task is None:
            state = _schema.read_json_atomic(str(state_path))
            stats = state.get("stats", {})
            if stats.get("pending", 0) == 0 and stats.get("executing", 0) == 0:
                total = state.get("total_tasks", 0)
                terminal = stats.get("done", 0) + stats.get("failed", 0)
                if total > 0 and terminal >= total:
                    logger.info("All %d tasks complete. Pipeline finished.", total)
                    break
            time.sleep(POLL_INTERVAL)
            continue

        gemini_ok = _dispatch.dispatch_gemini(
            task, queue_dir, project_root, logger,
            _queue.task_path, _queue.save_task, _schema.read_json_atomic,
        )
        if not gemini_ok:
            _update_state()
            continue

        task["status"] = "reviewing"
        _queue.save_task(task, queue_dir, _schema.write_json_atomic)
        passed, summary = _dispatch.dispatch_claude_review(task, project_root, logger)
        _dispatch.handle_review_result(task, passed, summary, queue_dir, logger, _queue.save_task)
        _update_state()

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
    parser.add_argument("--bridge-dir", default=".bridge",
                        help="Path to bridge runtime directory (default: .bridge)")
    args = parser.parse_args()

    bridge_dir = Path(args.bridge_dir).resolve()
    logger = setup_logging(bridge_dir / "logs")

    signal.signal(signal.SIGINT, _handle_signal)
    signal.signal(signal.SIGTERM, _handle_signal)
    run_pipeline(bridge_dir, logger)


if __name__ == "__main__":
    main()
