"""Middleware to inject uploaded files information into agent context."""

import os
from pathlib import Path
from typing import NotRequired, override

from langchain.agents import AgentState
from langchain.agents.middleware import AgentMiddleware
from langchain_core.messages import SystemMessage
from langgraph.runtime import Runtime

from src.agents.middlewares.thread_data_middleware import THREAD_DATA_BASE_DIR


class UploadsMiddlewareState(AgentState):
    """State schema for uploads middleware."""

    uploaded_files: NotRequired[list[dict] | None]


class UploadsMiddleware(AgentMiddleware[UploadsMiddlewareState]):
    """Middleware to inject uploaded files information into the agent context.

    This middleware lists all files in the thread's uploads directory and
    adds a system message with the file list before the agent processes the request.
    """

    state_schema = UploadsMiddlewareState

    def __init__(self, base_dir: str | None = None):
        """Initialize the middleware.

        Args:
            base_dir: Base directory for thread data. Defaults to the current working directory.
        """
        super().__init__()
        self._base_dir = base_dir or os.getcwd()

    def _get_uploads_dir(self, thread_id: str) -> Path:
        """Get the uploads directory for a thread.

        Args:
            thread_id: The thread ID.

        Returns:
            Path to the uploads directory.
        """
        return Path(self._base_dir) / THREAD_DATA_BASE_DIR / thread_id / "user-data" / "uploads"

    def _list_uploaded_files(self, thread_id: str) -> list[dict]:
        """List all files in the uploads directory.

        Args:
            thread_id: The thread ID.

        Returns:
            List of file information dictionaries.
        """
        uploads_dir = self._get_uploads_dir(thread_id)

        if not uploads_dir.exists():
            return []

        files = []
        for file_path in sorted(uploads_dir.iterdir()):
            if file_path.is_file():
                stat = file_path.stat()
                files.append(
                    {
                        "filename": file_path.name,
                        "size": stat.st_size,
                        "path": f"/mnt/user-data/uploads/{file_path.name}",
                        "extension": file_path.suffix,
                    }
                )

        return files

    def _create_files_message(self, files: list[dict]) -> str:
        """Create a formatted message listing uploaded files.

        Args:
            files: List of file information dictionaries.

        Returns:
            Formatted string listing the files.
        """
        if not files:
            return "<uploaded_files>\nNo files have been uploaded yet.\n</uploaded_files>"

        lines = ["<uploaded_files>", "The following files have been uploaded and are available for use:", ""]

        for file in files:
            size_kb = file["size"] / 1024
            if size_kb < 1024:
                size_str = f"{size_kb:.1f} KB"
            else:
                size_str = f"{size_kb / 1024:.1f} MB"

            lines.append(f"- {file['filename']} ({size_str})")
            lines.append(f"  Path: {file['path']}")
            lines.append("")

        lines.append("You can read these files using the `read_file` tool with the paths shown above.")
        lines.append("</uploaded_files>")

        return "\n".join(lines)

    @override
    def before_agent(self, state: UploadsMiddlewareState, runtime: Runtime) -> dict | None:
        """Inject uploaded files information before agent execution.

        Args:
            state: Current agent state.
            runtime: Runtime context containing thread_id.

        Returns:
            State updates including uploaded files list.
        """
        thread_id = runtime.context.get("thread_id")
        if thread_id is None:
            return None

        # List uploaded files
        files = self._list_uploaded_files(thread_id)

        # Create system message with file list
        files_message = self._create_files_message(files)
        system_message = SystemMessage(content=files_message)

        # Inject the message into the message history
        # This will be added after the system prompt but before user messages
        messages = list(state.get("messages", []))

        # Insert after the first system message (the main prompt)
        insert_index = 1 if messages and hasattr(messages[0], "type") and messages[0].type == "system" else 0
        messages.insert(insert_index, system_message)

        return {
            "uploaded_files": files,
            "messages": messages,
        }
