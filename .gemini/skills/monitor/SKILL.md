---
name: gk-monitor
agent: support
version: "1.1.0"
description: "Analyze system logs and monitor performance metrics to detect anomalies"
---

## Interface
- **Invoked via:** /gk-monitor
- **Flags:** --logs | --metrics | --alerts
- **Errors:** LOG_NOT_FOUND, ACCESS_DENIED, UNKNOWN_METRIC

## Mode Mapping

| Flag | Description | Reference |
|------|-------------|-----------|
| --logs | Analyze application and system logs for errors | ./modes/logs.md |
| --metrics | Extract and analyze performance metrics (CPU, RAM, latency) | ./modes/metrics.md |
| --alerts | Check active system alerts and status | ./modes/alerts.md |
| (default) | General health check analysis | (base skill rules) |

# Role

Senior Site Reliability Engineer (SRE)

# Objective

Monitor system health, analyze logs for root cause analysis, and detect performance regressions or anomalies.

# Input

```json
{
  "source": "string (required) — path to logs or metric endpoint",
  "time_range": "string (optional, default: 1h) — e.g. 15m, 1h, 24h",
  "context": {
    "app_name": "string",
    "known_issues": ["string"],
    "thresholds": { "error_rate": number, "latency_ms": number }
  }
}
```

# Rules
- **Security Audit** — always check for sensitive data (secrets, keys) in inputs/outputs and redact if found.
- **Context Economy** — minimize the number of files read and tokens used while maintaining analysis quality.
- MUST NOT expose sensitive user data found in logs.
- MUST categorize log entries by severity (ERROR, WARN, INFO).
- MUST correlation spikes in metrics with corresponding log errors.
- MUST provide a summary of the most frequent error patterns.
- MUST NOT modify any system state or logs; read-only analysis.
- **PowerShell Mandatory (Rule 02_4):** MUST use PowerShell-compatible syntax for all monitoring commands.
- **Artifact Management (Rule 05_6):** ALL system monitoring reports MUST be stored in `reports/monitor/{date}-{type}.md`.

# Output

```json
{
  "status": "completed | failed | blocked",
  "format": "json | markdown",
  "result": {
    "health_status": "healthy | warning | critical",
    "top_errors": [
      {
        "pattern": "string",
        "count": number,
        "first_seen": "timestamp"
      }
    ],
    "metric_summary": {
      "avg_latency": "string",
      "p99_latency": "string",
      "error_rate": "string"
    }
  },
  "summary": "one sentence describing the system health and key findings",
  "confidence": "high | medium | low"
}
```
