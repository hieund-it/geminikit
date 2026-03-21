import argparse
import json
import sys
from pathlib import Path

# Project root calculation
project_root = Path(__file__).parent.parent.parent.parent.parent
config_path = project_root / ".gemini" / "mcp-config.json"

def load_config():
    if not config_path.exists():
        print(f"Error: {config_path} not found.")
        sys.exit(1)
    with open(config_path, "r", encoding="utf-8") as f:
        return json.load(f)

def save_config(config):
    with open(config_path, "w", encoding="utf-8") as f:
        json.dump(config, f, indent=2)
    print(f"Config updated at {config_path}")

def list_servers():
    config = load_config()
    print("Configured MCP Servers:")
    for name, details in config.get("mcpServers", {}).items():
        print(f"- {name}: {details.get('description', 'No description')}")
        print(f"  Command: {details.get('command')} {' '.join(details.get('args', []))}")

def add_server(name, command, args, description=None, env=None):
    config = load_config()
    if name in config.get("mcpServers", {}):
        print(f"Error: Server '{name}' already exists.")
        sys.exit(1)
    
    new_server = {
        "command": command,
        "args": args,
        "description": description or f"Custom MCP server: {name}"
    }
    if env:
        new_server["env"] = env

    if "mcpServers" not in config:
        config["mcpServers"] = {}
        
    config["mcpServers"][name] = new_server
    save_config(config)
    print(f"Added server '{name}'.")

def remove_server(name):
    config = load_config()
    if name not in config.get("mcpServers", {}):
        print(f"Error: Server '{name}' not found.")
        sys.exit(1)
    
    del config["mcpServers"][name]
    save_config(config)
    print(f"Removed server '{name}'.")

def main():
    parser = argparse.ArgumentParser(description="Manage MCP Configuration")
    subparsers = parser.add_subparsers(dest="action", help="Action to perform")

    # List
    subparsers.add_parser("list", help="List configured servers")

    # Add
    add_parser = subparsers.add_parser("add", help="Add a new server")
    add_parser.add_argument("name", help="Server name")
    add_parser.add_argument("command", help="Command to run server")
    add_parser.add_argument("args", nargs="*", help="Arguments for command")
    add_parser.add_argument("--desc", help="Description")
    add_parser.add_argument("--env", help="Environment variables as JSON string")

    # Remove
    remove_parser = subparsers.add_parser("remove", help="Remove a server")
    remove_parser.add_argument("name", help="Server name to remove")

    args = parser.parse_args()

    if args.action == "list":
        list_servers()
    elif args.action == "add":
        env_dict = json.loads(args.env) if args.env else None
        add_server(args.name, args.command, args.args, args.desc, env_dict)
    elif args.action == "remove":
        remove_server(args.name)
    else:
        parser.print_help()

if __name__ == "__main__":
    main()
