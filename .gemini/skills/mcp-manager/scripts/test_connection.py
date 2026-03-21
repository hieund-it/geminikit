import asyncio
import json
import os
import sys
from pathlib import Path
from mcp import ClientSession, StdioServerParameters
from mcp.client.stdio import stdio_client
from dotenv import load_dotenv

# Load environment variables from project root .gemini/.env file
# Logic: traverse up from this script location to find .gemini
# This script is at .gemini/skills/mcp-manager/mcp-manager/scripts/test_connection.py
# So project root is ../../../../../
project_root = Path(__file__).parent.parent.parent.parent.parent
env_path = project_root / ".gemini" / ".env"
load_dotenv(dotenv_path=env_path)

async def test_connection(server_name=None):
    config_path = project_root / ".gemini" / "mcp-config.json"
    if not config_path.exists():
        print(f"Error: {config_path} not found.")
        return

    with open(config_path, "r", encoding="utf-8") as f:
        config = json.load(f)

    servers_to_test = config.get("mcpServers", {})
    if server_name:
        if server_name not in servers_to_test:
            print(f"Error: Server '{server_name}' not found in configuration.")
            return
        servers_to_test = {server_name: servers_to_test[server_name]}

    results = []

    for name, srv in servers_to_test.items():
        print(f"Testing connection to MCP Server: {name}...")
        
        # Resolve environment variables in config
        env_vars = {**os.environ}
        if "env" in srv:
            for key, value in srv["env"].items():
                if isinstance(value, str) and value.startswith("$"):
                    env_var_name = value[1:]
                    env_vars[key] = os.getenv(env_var_name, value)
                else:
                    env_vars[key] = value

        server_params = StdioServerParameters(
            command=srv["command"],
            args=srv["args"],
            env=env_vars
        )

        try:
            async with stdio_client(server_params) as (read, write):
                async with ClientSession(read, write) as session:
                    await session.initialize()
                    tools_result = await session.list_tools()
                    tool_count = len(tools_result.tools)
                    print(f"✅ Success: Connected to '{name}'. Found {tool_count} tools.")
                    results.append({"name": name, "status": "success", "tools": tool_count})
                        
        except Exception as e:
            print(f"❌ Failed to connect to '{name}': {str(e)}")
            results.append({"name": name, "status": "failed", "error": str(e)})

    return results

if __name__ == "__main__":
    target_server = sys.argv[1] if len(sys.argv) > 1 else None
    asyncio.run(test_connection(target_server))
