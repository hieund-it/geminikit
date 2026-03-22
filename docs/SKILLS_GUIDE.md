# Skills Guide

Skills are atomic units of capability that Agents use to perform specific tasks. Each skill is designed to do one thing well.

## Core Skills

### Analysis & Review
- **gk-analyze**: Deep analysis of code structure, dependencies, and performance/security risks.
- **gk-audit**: Audits dependencies and static code for security vulnerabilities and license compliance.
- **gk-compare-logic**: Compares business logic between two systems (legacy vs. new).
- **gk-review**: Comprehensive code review with scoring and actionable feedback.
- **gk-ui**: Generates UI specifications and validates implementation against design.

### Development & Maintenance
- **gk-bug-fixer**: Automatically analyzes error logs to identify root causes and generates verified fixes.
- **gk-debug**: Diagnoses errors and suggests fixes (supports trace mode).
- **gk-git**: Handles version control operations (commit, branch, status).
- **gk-migrate**: Manages database schema changes and data migrations.
- **gk-refactor**: Improves code structure and maintainability without changing external behavior.
- **gk-skill-creator**: Scaffolds new Agent and Skill files.
- **gk-sql**: Optimizes SQL queries for performance.

### Infrastructure & Operations
- **gk-deploy**: Executes build and deployment pipelines to various environments.
- **gk-infra**: Manages infrastructure as code (Docker, K8s, Terraform).
- **gk-mcp-manager**: Manages MCP server configurations and connections.
- **gk-monitor**: Analyzes system logs and monitors performance metrics.

### Planning & Research
- **gk-ask**: General Q&A assistant with codebase context.
- **gk-brainstorm**: Facilitates architectural debates and decision making.
- **gk-onboard**: Summarizes project context for rapid onboarding.
- **gk-plan**: Decomposes complex tasks into execution phases.
- **gk-research**: Gathers technical information and synthesizes options.

### Documentation & Utility
- **gk-document**: Generates technical documentation from code.
- **gk-export-session**: Exports current session state.
- **gk-summarize**: Compresses conversation history and outputs.

## Skill Structure
Each skill is defined by a `SKILL.md` file containing:
- **Role**: The persona assumed by the skill.
- **Objective**: The specific goal of the skill.
- **Input Schema**: The JSON structure required to invoke the skill.
- **Process**: Step-by-step execution logic.
- **Output Schema**: The JSON structure returned by the skill.

## Usage
Skills are typically invoked by Agents, not directly by users (except via `/gk-` commands which wrap agents).
