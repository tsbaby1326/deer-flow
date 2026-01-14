from langchain.tools import BaseTool

from src.config import get_app_config
from src.reflection import resolve_variable


def get_available_tools(groups: list[str] | None = None) -> list[BaseTool]:
    """Get all available tools from config"""
    config = get_app_config()
    return [resolve_variable(tool.use, BaseTool) for tool in config.tools if groups is None or tool.group in groups]
