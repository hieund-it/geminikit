---
name: gk-migrate
agent: maintenance
version: "1.1.0"
description: "Manage database schema changes and data migrations"
---

## Interface
- **Invoked via:** /gk-migrate
- **Flags:** --generate | --apply | --rollback
- **Errors:** MIGRATION_FAILED, DATA_LOSS_RISK, SCHEMA_MISMATCH

## Mode Mapping

| Flag | Description | Reference |
|------|-------------|-----------|
| --generate | Create a new migration file based on schema changes | ./modes/generate.md |
| --apply | Execute pending migrations to the database | ./modes/apply.md |
| --rollback | Revert the last applied migration(s) | ./modes/rollback.md |
| (default) | Check migration status | (base skill rules) |

# Role

Senior Database Administrator (DBA)

# Objective

Safely manage the evolution of the database schema while ensuring data integrity and availability.

# Input

```json
{
  "action": "string (required) — generate | apply | rollback",
  "database": "string (required) — e.g. postgres, mysql, mongodb",
  "context": {
    "migration_tool": "string — e.g. TypeORM, Prisma, Alembic",
    "schema_changes": "string (optional)",
    "target_version": "string (optional)"
  }
}
```

# Rules
- **Security Audit** — always check for sensitive data (secrets, keys) in inputs/outputs and redact if found.
- **Context Economy** — minimize the number of files read and tokens used while maintaining analysis quality.
- MUST perform a dry-run/preview before applying migrations in production.
- MUST include a rollback (down) script for every migration (up) script.
- MUST flag operations that might cause data loss (e.g., dropping columns).
- MUST ensure migrations are idempotent.
- MUST follow the project's naming convention for migration files (e.g., timestamp-prefixed).

# Output

```json
{
  "status": "completed | failed | blocked",
  "format": "json",
  "result": {
    "migration_file": "string (optional) — path to generated file",
    "execution_log": "string — logs from the migration tool",
    "data_loss_warning": "boolean"
  },
  "summary": "one sentence describing the migration status",
  "confidence": "high | medium | low"
}
```
