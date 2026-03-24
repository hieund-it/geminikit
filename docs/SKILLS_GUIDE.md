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
- **gk-health-check**: Validate framework compliance across all agents and skills.
- **gk-migrate**: Manages database schema changes and data migrations.
- **gk-refactor**: Improves code structure and maintainability without changing external behavior.
- **gk-skill-creator**: Scaffolds new Agent and Skill files.
- **gk-sql**: Optimizes SQL queries for performance.

### Infrastructure & Operations
- **gk-bridge-task-runner**: Execute a bridge pipeline task and signal completion.
- **gk-deploy**: Executes build and deployment pipelines to various environments.
- **gk-infra**: Manages infrastructure as code (Docker, K8s, Terraform).
- **gk-mcp-manager**: Manages MCP server configurations and connections.
- **gk-monitor**: Analyzes system logs and monitors performance metrics.

### Planning & Research
- **gk-ask**: General Q&A assistant with codebase context.
- **gk-brainstorm**: Facilitates architectural debates and decision making.
- **gk-intake**: Capture, structure, and refine initial user requirements or project ideas.
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

## Skill Development Guidelines

All new skills must adhere to the following framework-level requirements:

### 1. Security Audit
- **Path Validation**: Skills must validate all input paths against the framework's blacklist before execution.
- **Secret Redaction**: Skills that handle sensitive output (logs, env files) must apply pre-emptive masking before returning data to the Agent.
- **Tool Scoping**: Use the most restrictive tool subset possible (e.g., prefer `read_file` over `run_shell_command` with `cat`).

### 2. Context Economy
- **Surgical I/O**: Design inputs and outputs to be as compact as possible. Return specific data points rather than large unstructured blocks.
- **Token Budgeting**: Avoid redundant summaries or verbose process descriptions in the skill's output.
- **Incremental Processing**: For large files, skills should support pagination or range-based reading to avoid context overflow.

### 3. State Management
- **Statelessness**: Skills should be stateless. Any persistent data should be handled via the framework's Memory System (Layer 5).

## Usage
Skills are typically invoked by Agents, not directly by users (except via `/gk-` commands which wrap agents).
