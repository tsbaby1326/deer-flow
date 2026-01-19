# MCP (Model Context Protocol) Setup Guide

This guide explains how to configure and use MCP servers with DeerFlow to extend your agent's capabilities.

## What is MCP?

MCP (Model Context Protocol) is a standardized protocol for integrating external tools and services with AI agents. It allows DeerFlow to connect to various MCP servers that provide additional capabilities like file system access, database queries, web browsing, and more.

DeerFlow uses [langchain-mcp-adapters](https://github.com/langchain-ai/langchain-mcp-adapters) to seamlessly integrate MCP servers with the LangChain/LangGraph ecosystem.

## Quick Start

1. **Copy the example configuration:**
   ```bash
   cp mcp_config.example.json mcp_config.json
   ```

2. **Enable desired MCP servers:**
   Edit `mcp_config.json` and set `"enabled": true` for the servers you want to use.

3. **Configure environment variables:**
   Set any required API keys or credentials:
   ```bash
   export GITHUB_TOKEN="your_github_token"
   export BRAVE_API_KEY="your_brave_api_key"
   # etc.
   ```

4. **Install MCP dependencies:**
   ```bash
   cd backend
   make install
   ```

5. **Restart the application:**
   MCP tools will be automatically loaded and cached when first needed.
   ```bash
   cd backend
   make dev
   ```

   **Note**: MCP tools use lazy initialization - they are automatically loaded on first use.
   This works in both:
   - **FastAPI server**: Eagerly initialized at startup for best performance
   - **LangGraph Studio**: Automatically initialized on first agent creation

## Configuration Format

MCP servers are configured in `mcp_config.json`:

```json
{
  "mcpServers": {
    "server-name": {
      "enabled": true,
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-package"],
      "env": {
        "API_KEY": "$ENV_VAR_NAME"
      },
      "description": "What this server provides"
    }
  }
}
```

### Configuration Fields

- **enabled** (boolean): Whether this MCP server is active
- **command** (string): Command to execute (e.g., "npx", "python", "node")
- **args** (array): Command arguments
- **env** (object): Environment variables (supports `$VAR_NAME` syntax)
- **description** (string): Human-readable description

## Environment Variables

Environment variables in the config use the `$VARIABLE_NAME` syntax and are resolved at runtime:

```json
"env": {
  "GITHUB_PERSONAL_ACCESS_TOKEN": "$GITHUB_TOKEN"
}
```

This will use the value of the `GITHUB_TOKEN` environment variable.

## Popular MCP Servers

### Filesystem Access
Provides read/write access to specified directories:
```json
"filesystem": {
  "enabled": true,
  "command": "npx",
  "args": ["-y", "@modelcontextprotocol/server-filesystem", "/path/to/allowed/files"]
}
```

### PostgreSQL Database
Connect to PostgreSQL databases:
```json
"postgres": {
  "enabled": true,
  "command": "npx",
  "args": ["-y", "@modelcontextprotocol/server-postgres", "postgresql://localhost/mydb"],
  "env": {
    "PGPASSWORD": "$POSTGRES_PASSWORD"
  }
}
```

### GitHub Integration
Interact with GitHub repositories:
```json
"github": {
  "enabled": true,
  "command": "npx",
  "args": ["-y", "@modelcontextprotocol/server-github"],
  "env": {
    "GITHUB_PERSONAL_ACCESS_TOKEN": "$GITHUB_TOKEN"
  }
}
```

### Brave Search
Web search capabilities:
```json
"brave-search": {
  "enabled": true,
  "command": "npx",
  "args": ["-y", "@modelcontextprotocol/server-brave-search"],
  "env": {
    "BRAVE_API_KEY": "$BRAVE_API_KEY"
  }
}
```

### Puppeteer Browser Automation
Control headless browser:
```json
"puppeteer": {
  "enabled": true,
  "command": "npx",
  "args": ["-y", "@modelcontextprotocol/server-puppeteer"]
}
```

## Custom MCP Servers

You can also create your own MCP servers or use third-party implementations:

```json
"my-custom-server": {
  "enabled": true,
  "command": "python",
  "args": ["-m", "my_mcp_server_package"],
  "env": {
    "API_KEY": "$MY_API_KEY"
  },
  "description": "My custom MCP server"
}
```

## Configuration File Location

The MCP config file is loaded with the following priority:

1. Explicit path via `DEER_FLOW_MCP_CONFIG_PATH` environment variable
2. `mcp_config.json` in current directory (backend/)
3. `mcp_config.json` in parent directory (project root - **recommended**)

**Recommended location:** `/path/to/deer-flow/mcp_config.json`

## Tool Naming Convention

MCP tools are automatically named with the pattern:
```
mcp_{server_name}_{tool_name}
```

For example, a tool named `read_file` from the `filesystem` server becomes:
```
mcp_filesystem_read_file
```

## Custom Scripts and Initialization

MCP tools are automatically initialized on first use, so you don't need to do anything special:

```python
from src.agents import make_lead_agent

# MCP tools will be automatically loaded when the agent is created
agent = make_lead_agent(config)
```

**Optional**: For better performance in long-running scripts, you can pre-initialize:

```python
import asyncio
from src.mcp import initialize_mcp_tools
from src.agents import make_lead_agent

async def main():
    # Optional: Pre-load MCP tools for faster first agent creation
    await initialize_mcp_tools()

    # Create agent - MCP tools are already loaded
    agent = make_lead_agent(config)
    # ... rest of your code

if __name__ == "__main__":
    asyncio.run(main())
```

## Troubleshooting

### MCP tools not loading

1. Check that `mcp` package is installed:
   ```bash
   cd backend
   python -c "import mcp; print(mcp.__version__)"
   ```

2. Verify your MCP config is valid JSON:
   ```bash
   python -m json.tool mcp_config.json
   ```

3. Check application logs for MCP-related errors:
   ```bash
   # Look for lines containing "MCP"
   grep -i mcp logs/app.log
   ```

### Server fails to start

1. Verify the command and arguments are correct
2. Check that required npm packages are installed globally or with npx
3. Ensure environment variables are set correctly

### Tools not appearing

1. Verify the server is enabled: `"enabled": true`
2. Check that the server starts successfully (see logs)
3. Ensure there are no permission issues with the command

## Security Considerations

- The `mcp_config.json` file may contain sensitive information and is excluded from git by default
- Only enable MCP servers from trusted sources
- Be cautious with filesystem and database access - restrict paths/permissions appropriately
- Review the capabilities of each MCP server before enabling it

## Resources

- MCP Specification: https://modelcontextprotocol.io
- Official MCP Servers: https://github.com/modelcontextprotocol/servers
- LangChain MCP Adapters: https://github.com/langchain-ai/langchain-mcp-adapters
- DeerFlow Documentation: See `CLAUDE.md` and `config.example.yaml`
