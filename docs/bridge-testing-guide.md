# Bridge Testing Guide

Hướng dẫn chạy thử pipeline `gk bridge` từ Claude đến Gemini với 1 task đơn giản.

---

## Prerequisites

```bash
gk --version       # GeminiKit CLI
claude --version   # Claude CLI
gemini --version   # Gemini CLI (phải có trong PATH)
```

Nếu thiếu Gemini CLI:
```bash
npm install -g @google/gemini-cli
```

---

## Step 1 — Tạo minimal plan để test

Tạo 2 file sau trong `plans/test-bridge/`:

**`plans/test-bridge/plan.md`**
```markdown
---
title: Bridge Test Plan
status: pending
---

# Bridge Test Plan

| Phase | Name | Effort | Status | File |
|-------|------|--------|--------|------|
| 1 | Hello World | XS | pending | [phase-01-hello.md](phase-01-hello.md) |
```

**`plans/test-bridge/phase-01-hello.md`**
```markdown
# Phase 1: Hello World

## Overview
- **Description:** Create a simple hello.txt file to verify bridge pipeline

## Related Code Files
- `hello.txt`

## Implementation Steps
1. Create file `hello.txt` with content "Hello from Gemini Bridge!"

## Success Criteria
- `hello.txt` exists with correct content
```

---

## Step 2 — Init bridge queue

```bash
gk bridge init --plan plans/test-bridge/plan.md
```

Kết quả mong đợi:
```
✓ Created .bridge/ directory structure
✓ Using plan: plans/test-bridge/plan.md
✓ Generated 1 task(s) in .bridge/queue/
  task-01-01: Hello World [implement]
```

Verify task file tồn tại và đúng format:
```bash
cat .bridge/queue/task-01-01.json
```

Expected: `"status": "pending"`, `"assigned_to": "gemini"`

---

## Step 3 — Chạy pipeline

```bash
gk bridge start
```

Pipeline tự động thực hiện theo thứ tự:

```
pending → executing   (orchestrator gọi Gemini)
executing → gemini_done  (Gemini update task file)
gemini_done → reviewing  (orchestrator gọi Claude review)
reviewing → done / pending (retry)
```

Ctrl+C để dừng gracefully nếu cần.

---

## Step 4 — Kiểm tra kết quả

```bash
# Tổng quan pipeline
gk bridge status

# Chi tiết task
cat .bridge/queue/task-01-01.json

# Full logs
cat .bridge/logs/pipeline-*.log
```

**Task thành công:** `"status": "done"`, `hello.txt` được tạo trong project root.

**Task thất bại:** `"status": "failed"`, đọc `gemini_summary` và `review_result` trong task JSON để debug.

---

## Debugging

### Quick status check
```bash
python -c "
import json, glob
for f in glob.glob('.bridge/queue/*.json'):
    t = json.load(open(f))
    print(f.split('/')[-1], '->', t['status'])
    if t.get('gemini_summary'): print('  summary:', t['gemini_summary'][:100])
"
```

### Common issues

| Symptom | Nguyên nhân | Fix |
|---------|-------------|-----|
| `gemini command not found` | Gemini CLI chưa install | `npm install -g @google/gemini-cli` |
| Task mãi ở `executing` | Gemini không update status file | Check log — Gemini có đang dùng bridge-task-runner skill không |
| `BRIDGE_STATUS` missing | Claude output thiếu marker | Check Claude CLI có đang chạy `--print` mode không |
| Task retry 3 lần rồi `failed` | Review liên tục fail | Đọc `review_result` trong task JSON, fix prompt hoặc implementation |

### Reset và chạy lại

```bash
gk bridge reset        # xóa state, giữ queue
gk bridge init --plan plans/test-bridge/plan.md   # tạo lại queue
gk bridge start
```

---

## Flow diagram

```
Claude CLI (orchestrator.py)
    │
    ├── Đọc .bridge/queue/task-01-01.json (status=pending)
    │
    ├── Gọi: gemini -p "<task prompt>" --yolo
    │       └── Gemini execute task
    │           └── Cập nhật task-01-01.json: status=gemini_done
    │
    ├── Gọi: claude --print "<review prompt>"
    │       └── Claude review output
    │           └── Output có "BRIDGE_STATUS: PASS" hoặc "BRIDGE_STATUS: FAIL"
    │
    └── Cập nhật task-01-01.json: status=done (hoặc pending nếu retry)
```
