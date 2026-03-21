# Gemini Kit

**Gemini Kit** is a multi-agent AI development framework designed to run inside the **Gemini CLI**. It orchestrates specialized agents and atomic skills to deliver high-quality software engineering outcomes, ensuring strict adherence to architectural standards and efficient token usage.

## 🚀 Quick Start

### Prerequisites
- **Gemini CLI** installed.
- **Node.js** (v18+) and **Python** (v3.10+) available.

### Installation

**Option A — Install globally via npm (recommended for client machines)**

```bash
npm install -g github:hieund-it/geminikit
```

This installs the `gk` CLI globally from GitHub and registers it in your PATH. Once installed, scaffold Gemini Kit into any project:

```bash
cd my-project
gk init        # Scaffold .gemini/ structure and GEMINI.md
gk list        # List available agents and skills
gk update      # Pull the latest version from GitHub
gk uninstall   # Remove Gemini Kit from the current project
```

**Option B — Clone and run locally (for contributors)**

```bash
# Clone the repository
git clone https://github.com/hieund-it/geminikit.git
cd geminikit

# Install dependencies
npm install

# Setup environment
cp .gemini/.env.example .env
# Edit .env to add your API keys
```

For detailed setup instructions, see the [Setup Guide](docs/SETUP_GUIDE.md).

## 📚 Documentation

Detailed documentation is available in the `docs/` directory:

- **[System Architecture](docs/ARCHITECTURE.md)**: Understand how the Orchestrator, Agents, and Skills work together.
- **[Agent Registry](docs/AGENTS_REGISTRY.md)**: Detailed profiles of all available agents (Architect, Developer, Reviewer, etc.).
- **[Commands Reference](docs/COMMANDS_REFERENCE.md)**: Guide to using `/gk-` commands.
- **[Skills Guide](docs/SKILLS_GUIDE.md)**: List of atomic capabilities available to agents.
- **[Onboarding](docs/ONBOARDING.md)**: A quick introduction for new developers.
- **[Contributing](docs/CONTRIBUTING.md)**: Guidelines for contributing to the project.
- **[Python Runtime](docs/PYTHON_RUNTIME.md)**: How the local Python environment is managed.

## 🧩 Project Structure

```text
.gemini/
├── agents/       # Agent role definitions
├── skills/       # Atomic task executors (GK Skills)
├── rules/        # Strict behavioral guidelines
├── memory/       # State persistence layers
├── schemas/      # JSON I/O contracts
└── tools/        # External tool definitions
src/              # CLI source code
docs/             # Project documentation
```

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](docs/CONTRIBUTING.md) for details on how to submit pull requests, report issues, and propose new features.

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.
