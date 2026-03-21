# Setup Guide

This guide covers the initial setup and configuration of the Gemini Kit environment.

## Prerequisites

- **Node.js**: Version 18+ recommended.
- **Python**: Version 3.10+ (for some skills).
- **Git**: Installed and configured.
- **Gemini CLI**: Ensure you have the latest version installed.

## Installation

1.  **Clone the Repository**:
    ```bash
    git clone https://github.com/google/geminikit.git
    cd geminikit
    ```

2.  **Install Dependencies**:
    ```bash
    npm install
    ```

3.  **Environment Variables**:
    Create a `.env` file in the root directory (copy from `.env.example` if available).
    ```bash
    cp .gemini/.env.example .env
    ```
    Add necessary API keys (e.g., for Google Search, MCP servers).

## Configuration

### MCP Servers (`.gemini/mcp-config.json`)

Gemini Kit uses Model Context Protocol (MCP) to connect to external tools.
To configure servers, edit `.gemini/mcp-config.json` or use the manager:
```bash
/gk-mcp-manager
```

### Agent Customization (`.gemini/agents/*.md`)

You can customize agent behavior by editing their markdown definition files.
Changes are picked up immediately by the Orchestrator.

## Verification

To verify your installation, run:
```bash
/gk-ask "What is the status of the system?"
```
If you receive a response from the Orchestrator, you are good to go!
