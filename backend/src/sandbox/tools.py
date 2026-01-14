from langchain.tools import ToolRuntime, tool
from langgraph.typing import ContextT

from src.agents.thread_state import ThreadState
from src.sandbox.sandbox import Sandbox
from src.sandbox.sandbox_provider import get_sandbox_provider


def sandbox_from_runtime(runtime: ToolRuntime[ContextT, ThreadState] | None = None) -> Sandbox:
    if runtime is None:
        raise ValueError("No sandbox found: No runtime found")
    sandbox_state = runtime.state.get("sandbox")
    if sandbox_state is None:
        raise ValueError("No sandbox found: No sandbox state found in runtime")
    sandbox_id = sandbox_state.get("sandbox_id")
    if sandbox_id is None:
        raise ValueError("No sandbox ID found: No sandbox ID found in sandbox state")
    sandbox = get_sandbox_provider().get(sandbox_id)
    if sandbox is None:
        raise ValueError(f"No sandbox found: sandbox with ID {sandbox_id} not found")
    return sandbox


@tool("bash", parse_docstring=True)
def bash_tool(runtime: ToolRuntime[ContextT, ThreadState], description: str, command: str) -> str:
    """Execute a bash command in a Linux environment.


    - Use `python` to run Python code.
    - Use `pip install` to install Python packages.

    Args:
        description: Explain why you are running this command in short words. ALWAYS PROVIDE THIS PARAMETER FIRST.
        command: The bash command to execute. Always use absolute paths for files and directories.
    """
    try:
        sandbox = sandbox_from_runtime(runtime)
        return sandbox.execute_command(command)
    except Exception as e:
        return f"Error: {e}"


@tool("ls", parse_docstring=True)
def ls_tool(runtime: ToolRuntime[ContextT, ThreadState], description: str, path: str) -> str:
    """List the contents of a directory up to 2 levels deep in tree format.

    Args:
        description: Explain why you are listing this directory in short words. ALWAYS PROVIDE THIS PARAMETER FIRST.
        path: The **absolute** path to the directory to list.
    """
    try:
        sandbox = sandbox_from_runtime(runtime)
        children = sandbox.list_dir(path)
        if not children:
            return "(empty)"
        return "\n".join(children)
    except Exception as e:
        return f"Error: {e}"


@tool("read_file", parse_docstring=True)
def read_file_tool(
    runtime: ToolRuntime[ContextT, ThreadState],
    description: str,
    path: str,
    view_range: tuple[int, int] | None = None,
) -> str:
    """Read the contents of a text file.

    Args:
        description: Explain why you are viewing this file in short words. ALWAYS PROVIDE THIS PARAMETER FIRST.
        path: The **absolute** path to the file to read.
        view_range: The range of lines to view. The range is inclusive and starts at 1. For example, (1, 10) will view the first 10 lines of the file.
    """
    try:
        sandbox = sandbox_from_runtime(runtime)
        content = sandbox.read_file(path)
        if not content:
            return "(empty)"
        if view_range:
            start, end = view_range
            content = "\n".join(content.splitlines()[start - 1 : end])
        return content
    except Exception as e:
        return f"Error: {e}"


@tool("write_file", parse_docstring=True)
def write_file_tool(
    runtime: ToolRuntime[ContextT, ThreadState],
    description: str,
    path: str,
    content: str,
    append: bool = False,
) -> str:
    """Write text content to a file.

    Args:
        description: Explain why you are writing to this file in short words. ALWAYS PROVIDE THIS PARAMETER FIRST.
        path: The **absolute** path to the file to write to. ALWAYS PROVIDE THIS PARAMETER SECOND.
        content: The content to write to the file. ALWAYS PROVIDE THIS PARAMETER THIRD.
    """
    try:
        sandbox = sandbox_from_runtime(runtime)
        sandbox.write_file(path, content, append)
        return "OK"
    except Exception as e:
        return f"Error: {e}"


@tool("str_replace", parse_docstring=True)
def str_replace_tool(
    runtime: ToolRuntime[ContextT, ThreadState],
    description: str,
    path: str,
    old_str: str,
    new_str: str,
    replace_all: bool = False,
) -> str:
    """Replace a substring in a file with another substring.
    If `replace_all` is False (default), the substring to replace must appear **exactly once** in the file.

    Args:
        description: Explain why you are replacing the substring in short words. ALWAYS PROVIDE THIS PARAMETER FIRST.
        path: The **absolute** path to the file to replace the substring in. ALWAYS PROVIDE THIS PARAMETER SECOND.
        old_str: The substring to replace. ALWAYS PROVIDE THIS PARAMETER THIRD.
        new_str: The new substring. ALWAYS PROVIDE THIS PARAMETER FOURTH.
        replace_all: Whether to replace all occurrences of the substring. If False, only the first occurrence will be replaced. Default is False.
    """
    try:
        sandbox = sandbox_from_runtime(runtime)
        content = sandbox.read_file(path)
        if not content:
            return "OK"
        if replace_all:
            content = content.replace(old_str, new_str)
        else:
            content = content.replace(old_str, new_str, 1)
        sandbox.write_file(path, content)
        return "OK"
    except Exception as e:
        return f"Error: {e}"
