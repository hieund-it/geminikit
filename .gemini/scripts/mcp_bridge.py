import asyncio
import json
import os
from pathlib import Path
from mcp import ClientSession, StdioServerParameters
from mcp.client.stdio import stdio_client
from dotenv import load_dotenv

# 1. Load environment variables from .gemini/.env file
env_path = Path(__file__).parent.parent / ".env"
load_dotenv(dotenv_path=env_path)

async def fetch_mcp_tools():
    config_path = Path(__file__).parent.parent / "mcp-config.json"
    if not config_path.exists():
        print(f"Error: {config_path} not found.")
        return

    with open(config_path, "r", encoding="utf-8") as f:
        config = json.load(f)

    all_gemini_tools = []

    for name, srv in config.get("mcpServers", {}).items():
        print(f"Connecting to MCP Server: {name}...")
        
        # 2. Resolve environment variables in config
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
                    
                    for tool in tools_result.tools:
                        gemini_tool = {
                            "name": f"{name}_{tool.name}",
                            "description": f"[MCP: {name}] {tool.description}",
                            "parameters": tool.input_schema if hasattr(tool, 'input_schema') else tool.inputSchema
                        }
                        all_gemini_tools.append(gemini_tool)
                        
        except Exception as e:
            print(f"Failed to connect to {name}: {str(e)}")

    output_path = Path(__file__).parent.parent / "temp_mcp_manifest.json"
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(all_gemini_tools, f, indent=2)
    
    print(f"Successfully mapped {len(all_gemini_tools)} MCP tools to Gemini.")

if __name__ == "__main__":
    asyncio.run(fetch_mcp_tools())
