# 🦌 DeerFlow - v2

> Originated from Open Source, give back to Open Source.

A LangGraph-based AI agent backend with sandbox execution capabilities.

## Quick Start

1. **Check system requirements**:
   ```bash
   make check
   ```
   This will verify that you have all required tools installed:
   - Node.js 22+
   - pnpm
   - uv (Python package manager)
   - nginx

2. **Configure the application**:
   ```bash
   # Copy example configuration
   cp config.example.yaml config.yaml

   # Set your API keys
   export OPENAI_API_KEY="your-key-here"
   # or edit config.yaml directly

   # Optional: Enable MCP servers and skills
   cp extensions_config.example.json extensions_config.json
   # Edit extensions_config.json to enable desired MCP servers and skills
   ```

3. **Install dependencies**:
   ```bash
   make install
   ```

4. **Run development server** (starts frontend, backend, and nginx):
   ```bash
   make dev
   ```

5. **Access the application**:
   - Web Interface: http://localhost:2026
   - All API requests are automatically proxied through nginx

### Manual Deployment

If you need to start services individually:

1. **Start backend services**:
   ```bash
   # Terminal 1: Start LangGraph Server (port 2024)
   cd backend
   make dev

   # Terminal 2: Start Gateway API (port 8001)
   cd backend
   make gateway

   # Terminal 3: Start Frontend (port 3000)
   cd frontend
   pnpm dev
   ```

2. **Start nginx**:
   ```bash
   make nginx
   # or directly: nginx -c $(pwd)/nginx.conf -g 'daemon off;'
   ```

3. **Access the application**:
   - Web Interface: http://localhost:2026

The nginx configuration provides:
- Unified entry point on port 2026
- Routes `/api/langgraph/*` to LangGraph Server (2024)
- Routes other `/api/*` endpoints to Gateway API (8001)
- Routes non-API requests to Frontend (3000)
- Centralized CORS handling
- SSE/streaming support for real-time agent responses
- Optimized timeouts for long-running operations

## Project Structure

```
deer-flow/
├── config.example.yaml    # Configuration template (copy to config.yaml)
├── nginx.conf            # Nginx reverse proxy configuration
├── backend/              # Backend application
│   ├── src/             # Source code
│   │   ├── gateway/     # Gateway API (port 8001)
│   │   └── agents/      # LangGraph agents (port 2024)
│   └── docs/            # Documentation
├── frontend/            # Frontend application
└── skills/              # Agent skills
    ├── public/          # Public skills
    └── custom/          # Custom skills
```

### Architecture

```
Browser
  ↓
Nginx (port 2026) ← Unified entry point
  ├→ Frontend (port 3000) ← / (non-API requests)
  ├→ Gateway API (port 8001) ← /api/models, /api/mcp, /api/skills, /api/threads/*/artifacts
  └→ LangGraph Server (port 2024) ← /api/langgraph/* (agent interactions)
```

## Documentation

- [Configuration Guide](backend/docs/CONFIGURATION.md) - Setup and configuration instructions
- [Architecture Overview](backend/CLAUDE.md) - Technical architecture details
- [MCP Setup Guide](MCP_SETUP.md) - Configure Model Context Protocol servers for additional tools

## License

This project is open source and available under the [MIT License](./LICENSE).

## Acknowledgments

DeerFlow is built upon the incredible work of the open-source community. We are deeply grateful to all the projects and contributors whose efforts have made DeerFlow possible. Truly, we stand on the shoulders of giants.

We would like to extend our sincere appreciation to the following projects for their invaluable contributions:

- **[LangChain](https://github.com/langchain-ai/langchain)**: Their exceptional framework powers our LLM interactions and chains, enabling seamless integration and functionality.
- **[LangGraph](https://github.com/langchain-ai/langgraph)**: Their innovative approach to multi-agent orchestration has been instrumental in enabling DeerFlow's sophisticated workflows.

These projects exemplify the transformative power of open-source collaboration, and we are proud to build upon their foundations.

### Key Contributors

A heartfelt thank you goes out to the core authors of `DeerFlow`, whose vision, passion, and dedication have brought this project to life:

- **[Daniel Walnut](https://github.com/hetaoBackend/)**
- **[Henry Li](https://github.com/magiccube/)**

Your unwavering commitment and expertise have been the driving force behind DeerFlow's success. We are honored to have you at the helm of this journey.

## Star History

[![Star History Chart](https://api.star-history.com/svg?repos=bytedance/deer-flow&type=Date)](https://star-history.com/#bytedance/deer-flow&Date)
