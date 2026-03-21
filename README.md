# Gemini Kit (gemini-kit)

**Gemini Kit** is a multi-agent AI development framework designed to run inside the **Gemini CLI**. It provides a structured environment for orchestrating specialized AI agents and atomic skills to deliver high-quality software engineering outcomes while optimizing token usage and ensuring strict architectural compliance.

---

## 🚀 Overview

The framework transforms a single AI interaction into a coordinated effort among specialized agents. It follows the **Research → Strategy → Execution** lifecycle, ensuring every task is planned, implemented, and validated with precision.

### Core Principles
- **YAGNI** (You Ain't Gonna Need It): Focus only on the current task.
- **KISS** (Keep It Simple, Stupid): Prefer the simplest working solution.
- **DRY** (Don't Repeat Yourself): Maintain a single source of truth for logic and rules.
- **Single Responsibility**: Each component (agent, skill, rule) has exactly one job.
- **No Assumptions**: Ask for clarification instead of guessing.

---

## ⚙️ Installation

### Requirements
- [Gemini CLI](https://github.com/google-gemini/gemini-cli) installed
- Node.js >= 18

### Install via npm (recommended)

```bash
npm install -g github:hieund-it/geminikit
```

### Initialize in your project

```bash
cd your-project
gk init
```

This scaffolds `.gemini/` and `GEMINI.md` into the current directory.

### Configure API key

```bash
cp .gemini/.env.example .gemini/.env
```

Open `.gemini/.env` and add your `GOOGLE_API_KEY`.

### Commands

| Command | Description |
|---------|-------------|
| `gk init` | Scaffold `.gemini/` and `GEMINI.md` into current project |
| `gk list` | List available agents and skills |
| `gk update` | Update to the latest version |

### Alternative: Clone directly

```bash
git clone https://github.com/hieund-it/geminikit.git
cd gemini-kit
npm install
```

---

## 🏗️ Architecture

Gemini Kit operates on a 5-layer responsibility model:

1.  **Layer 1: Entry Point (`GEMINI.md`)**: Command parsing, complexity checking, and initial routing.
2.  **Layer 2: Agents (`agents/`)**: Specialized executors (e.g., `planner`, `developer`, `tester`).
3.  **Layer 3: Skills (`skills/`)**: Atomic, stateless processors for specific tasks (e.g., `debug`, `sql`, `plan`).
4.  **Layer 4: Tools (`tools/`)**: Definitions for external I/O (Database, Scripts).
5.  **Layer 5: Memory (`memory/`)**: State management (Short-term, Long-term, Execution).

---

## 🤖 Agent Registry

The framework employs specialized agents for different stages of the development lifecycle:

| Agent | Specialization | Key Skills |
| :--- | :--- | :--- |
| **Planner** | Task decomposition & dependency mapping | `plan`, `research` |
| **Developer** | Implementation & debugging | `debug`, `git`, `sql` |
| **Tester** | QA, validation & test coverage | `debug`, `analyze` |
| **Reviewer** | Code quality & security auditing | `review`, `analyze` |
| **Architect** | High-level system design | `brainstorm`, `analyze` |
| **Researcher** | Technical research & onboarding | `brainstorm`, `onboard` |
| **Documenter** | Technical writing & documentation | `document` |
| **MCP Manager** | Model Context Protocol administration | `mcp-manager` |

---

## 🛠️ Commands & Usage

Commands follow the `/gk:<command>` syntax:

- `/gk:plan [task]` - Decompose a complex task into an executable plan.
- `/gk:debug [issue]` - Trace and fix bugs or performance issues.
- `/gk:analyze [path]` - Perform security, performance, or architectural analysis.
- `/gk:review [file]` - Conduct a strict code review based on project standards.
- `/gk:test [scope]` - Run unit, integration, or full system tests.
- `/gk:help` - Display command and framework help.

---

## ⚙️ Configuration & Settings

The framework is highly configurable through files in the `.gemini/` directory:

### Runtime Settings (`settings.json`)
- **Default Model**: `gemini-3-flash-preview`
- **Session Limits**: 100 turns max.
- **Security**: YOLO mode disabled by default.

### Extended Configuration (`config.yaml`)
- **Model Routing**: 
    - Reasoning-heavy tasks (Planner, Reviewer): `gemini-2.0-pro`
    - Speed-focused tasks (Developer, Tester): `gemini-2.0-flash`
- **Token Optimization**: 
    - Progressive disclosure (load skills on demand).
    - Max context per agent: 2000 tokens.
    - Compressed memory and structured (JSON) I/O.
- **Memory Management**: 
    - Short-term (session-scoped).
    - Long-term (persistent across sessions).
    - Execution (task-scoped).

### Framework Metadata (`geminikit.config.json`)
Defines the internal registry of available agents, skills, and command triggers used by the framework's orchestration logic.

---

## 📂 Project Structure

```text
.gemini/
├── agents/       # Agent role definitions
├── skills/       # Atomic task executors
├── rules/        # Strict behavioral guidelines (01_core...06_documentation)
├── hooks/        # Lifecycle triggers (session-init, pre/post-tool)
├── memory/       # State persistence layers
├── schemas/      # JSON I/O contracts
├── tools/        # External integration definitions
├── prompts/      # Reusable prompt templates
└── AGENT.md      # Framework Orchestrator core
```

---

## 🚦 Safety & Validation

- **No destructive operations** without explicit user confirmation.
- **Zero-leak policy**: No credentials or PII ever logged or committed.
- **Mandatory Validation**: Every implementation must be verified with tests before completion.
