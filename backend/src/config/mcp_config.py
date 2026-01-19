"""MCP (Model Context Protocol) configuration."""

import json
import os
from pathlib import Path
from typing import Any

from pydantic import BaseModel, ConfigDict, Field


class McpServerConfig(BaseModel):
    """Configuration for a single MCP server."""

    enabled: bool = Field(default=True, description="Whether this MCP server is enabled")
    command: str = Field(..., description="Command to execute to start the MCP server")
    args: list[str] = Field(default_factory=list, description="Arguments to pass to the command")
    env: dict[str, str] = Field(default_factory=dict, description="Environment variables for the MCP server")
    description: str = Field(default="", description="Human-readable description of what this MCP server provides")
    model_config = ConfigDict(extra="allow")


class McpConfig(BaseModel):
    """Configuration for all MCP servers."""

    mcp_servers: dict[str, McpServerConfig] = Field(
        default_factory=dict,
        description="Map of MCP server name to configuration",
        alias="mcpServers",
    )
    model_config = ConfigDict(extra="allow", populate_by_name=True)

    @classmethod
    def resolve_config_path(cls, config_path: str | None = None) -> Path | None:
        """Resolve the MCP config file path.

        Priority:
        1. If provided `config_path` argument, use it.
        2. If provided `DEER_FLOW_MCP_CONFIG_PATH` environment variable, use it.
        3. Otherwise, check for `mcp_config.json` in the current directory, then in the parent directory.
        4. If not found, return None (MCP is optional).

        Args:
            config_path: Optional path to MCP config file.

        Returns:
            Path to the MCP config file if found, otherwise None.
        """
        if config_path:
            path = Path(config_path)
            if not path.exists():
                raise FileNotFoundError(f"MCP config file specified by param `config_path` not found at {path}")
            return path
        elif os.getenv("DEER_FLOW_MCP_CONFIG_PATH"):
            path = Path(os.getenv("DEER_FLOW_MCP_CONFIG_PATH"))
            if not path.exists():
                raise FileNotFoundError(f"MCP config file specified by environment variable `DEER_FLOW_MCP_CONFIG_PATH` not found at {path}")
            return path
        else:
            # Check if the mcp_config.json is in the current directory
            path = Path(os.getcwd()) / "mcp_config.json"
            if path.exists():
                return path

            # Check if the mcp_config.json is in the parent directory of CWD
            path = Path(os.getcwd()).parent / "mcp_config.json"
            if path.exists():
                return path

            # MCP is optional, so return None if not found
            return None

    @classmethod
    def from_file(cls, config_path: str | None = None) -> "McpConfig":
        """Load MCP config from JSON file.

        See `resolve_config_path` for more details.

        Args:
            config_path: Path to the MCP config file.

        Returns:
            McpConfig: The loaded config, or empty config if file not found.
        """
        resolved_path = cls.resolve_config_path(config_path)
        if resolved_path is None:
            # Return empty config if MCP config file is not found
            return cls(mcp_servers={})

        with open(resolved_path) as f:
            config_data = json.load(f)

        cls.resolve_env_variables(config_data)
        return cls.model_validate(config_data)

    @classmethod
    def resolve_env_variables(cls, config: dict[str, Any]) -> dict[str, Any]:
        """Recursively resolve environment variables in the config.

        Environment variables are resolved using the `os.getenv` function. Example: $OPENAI_API_KEY

        Args:
            config: The config to resolve environment variables in.

        Returns:
            The config with environment variables resolved.
        """
        for key, value in config.items():
            if isinstance(value, str):
                if value.startswith("$"):
                    env_value = os.getenv(value[1:], None)
                    if env_value is not None:
                        config[key] = env_value
                else:
                    config[key] = value
            elif isinstance(value, dict):
                config[key] = cls.resolve_env_variables(value)
            elif isinstance(value, list):
                config[key] = [cls.resolve_env_variables(item) if isinstance(item, dict) else item for item in value]
        return config

    def get_enabled_servers(self) -> dict[str, McpServerConfig]:
        """Get only the enabled MCP servers.

        Returns:
            Dictionary of enabled MCP servers.
        """
        return {name: config for name, config in self.mcp_servers.items() if config.enabled}


_mcp_config: McpConfig | None = None


def get_mcp_config() -> McpConfig:
    """Get the MCP config instance.

    Returns a cached singleton instance. Use `reload_mcp_config()` to reload
    from file, or `reset_mcp_config()` to clear the cache.

    Returns:
        The cached McpConfig instance.
    """
    global _mcp_config
    if _mcp_config is None:
        _mcp_config = McpConfig.from_file()
    return _mcp_config


def reload_mcp_config(config_path: str | None = None) -> McpConfig:
    """Reload the MCP config from file and update the cached instance.

    This is useful when the config file has been modified and you want
    to pick up the changes without restarting the application.

    Args:
        config_path: Optional path to MCP config file. If not provided,
                     uses the default resolution strategy.

    Returns:
        The newly loaded McpConfig instance.
    """
    global _mcp_config
    _mcp_config = McpConfig.from_file(config_path)
    return _mcp_config


def reset_mcp_config() -> None:
    """Reset the cached MCP config instance.

    This clears the singleton cache, causing the next call to
    `get_mcp_config()` to reload from file. Useful for testing
    or when switching between different configurations.
    """
    global _mcp_config
    _mcp_config = None


def set_mcp_config(config: McpConfig) -> None:
    """Set a custom MCP config instance.

    This allows injecting a custom or mock config for testing purposes.

    Args:
        config: The McpConfig instance to use.
    """
    global _mcp_config
    _mcp_config = config
