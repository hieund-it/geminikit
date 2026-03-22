# Agent Registry

This document details the specialized agents within the Gemini Kit framework, their roles, and responsibilities.

## 1. Architect (`architect`)
**Role:** Senior Software Architect
**Specialization:** High-level system design, deep reasoning, and technical trade-off analysis.
**Key Skills:** `gk-brainstorm`, `gk-analyze`
**Responsibility:**
- Evaluates system integrity and scalability.
- Produces Architectural Decision Records (ADRs).
- Debates multiple approaches using first-principles thinking.

## 2. Comparator (`comparator`)
**Role:** System Migration Analyst
**Specialization:** Comparing business logic between legacy and new systems.
**Key Skills:** `gk-compare-logic`
**Responsibility:**
- Analyzes logic parity between old and new codebases.
- Identifies gaps, mismatches, and new features.
- Generates structured comparison reports.

## 3. Designer (`designer`)
**Role:** UI/UX Designer
**Specialization:** Visual specs and UI quality validation.
**Key Skills:** `gk-ui`
**Responsibility:**
- Produces precise visual specifications pre-implementation.
- Validates implemented UI against design standards.
- Ensures accessibility compliance.

## 4. Developer (`developer`)
**Role:** Senior Software Engineer
**Specialization:** Implementation, debugging, and system operations.
**Key Skills:** `gk-debug`, `gk-bug-fixer`, `gk-git`, `gk-sql`, `gk-skill-creator`, `gk-summarize`
**Responsibility:**
- Implements features and fixes bugs.
- Executes Git operations (commit, branch, PR).
- Optimizes SQL queries and creates new skills.
- Manages codebase state and summarization.

## 5. Documenter (`documenter`)
**Role:** Technical Writer
**Specialization:** Generating technical documentation from code.
**Key Skills:** `gk-document`
**Responsibility:**
- Generates READMEs, API references, ADRs, and Changelogs.
- Ensures documentation accurately reflects the actual code behavior ("Code is truth").

## 6. MCP Manager (`mcp-manager`)
**Role:** MCP Administrator
**Specialization:** Managing Model Context Protocol servers.
**Key Skills:** `gk-mcp-manager`
**Responsibility:**
- Manages `.gemini/mcp-config.json`.
- Tests and scaffolds MCP servers.
- Debugs connection issues.

## 7. Planner (`planner`)
**Role:** Senior Technical Architect & Task Planner
**Specialization:** Task decomposition and execution planning.
**Key Skills:** `gk-plan`, `gk-research`
**Responsibility:**
- Decomposes complex requests into executable subtasks.
- Defines dependencies and effort estimates.
- Creates detailed implementation plans.

## 8. Researcher (`researcher`)
**Role:** Research Engineer
**Specialization:** Information gathering and synthesis.
**Key Skills:** `gk-onboard`, `gk-brainstorm`
**Responsibility:**
- Gathers technical info to support decision-making.
- Compares options and trade-offs.
- Produces structured research reports and onboarding guides.

## 9. Reviewer (`reviewer`)
**Role:** Senior Code Reviewer & Security Analyst
**Specialization:** Code quality, security, and performance review.
**Key Skills:** `gk-review`, `gk-analyze`
**Responsibility:**
- Reviews code for correctness, security, and performance.
- Enforces coding standards and security protocols.
- Provides scored, actionable feedback.

## 10. Tester (`tester`)
**Role:** Senior QA Engineer
**Specialization:** Validation, test writing, and coverage reporting.
**Responsibility:**
- Writes and executes comprehensive test cases.
- Measures and reports test coverage.
- Validates that implementations meet requirements.
- Collaborates with `developer` to diagnose failures.
