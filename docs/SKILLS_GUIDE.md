# Skills Guide

Skills are atomic units of capability that Agents use to perform specific tasks. Each skill is designed to do one thing well.

## Core Skills

### Analysis & Review
- **gk-analyze**: Deep analysis of code structure, dependencies, and performance/security risks.
- **gk-review**: Comprehensive code review with scoring and actionable feedback.
- **gk-compare-logic**: Compares business logic between two systems (legacy vs. new).
- **gk-ui**: Generates UI specifications and validates implementation against design.

### Development & Ops
- **gk-debug**: Diagnoses errors and suggests fixes (supports trace mode).
- **gk-git**: Handles version control operations (commit, branch, status).
- **gk-mcp-manager**: Manages MCP server configurations and connections.
- **gk-sql**: Optimizes SQL queries for performance.
- **gk-skill-creator**: Scaffolds new Agent and Skill files.

### Planning & Research
- **gk-plan**: Decomposes complex tasks into execution phases.
- **gk-brainstorm**: Facilitates architectural debates and decision making.
- **gk-research**: Gathers technical information and synthesizes options.
- **gk-onboard**: Summarizes project context for rapid onboarding.
- **gk-ask**: General Q&A assistant with codebase context.

### Documentation & Utility
- **gk-document**: Generates technical documentation from code.
- **gk-summarize**: Compresses conversation history and outputs.
- **gk-export-session**: Exports current session state.

## Skill Structure
Each skill is defined by a `SKILL.md` file containing:
- **Role**: The persona assumed by the skill.
- **Objective**: The specific goal of the skill.
- **Input Schema**: The JSON structure required to invoke the skill.
- **Process**: Step-by-step execution logic.
- **Output Schema**: The JSON structure returned by the skill.

## Usage
Skills are typically invoked by Agents, not directly by users (except via `/gk-` commands which wrap agents).
