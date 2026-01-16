from langchain.tools import tool


@tool("present_files", parse_docstring=True)
def present_file_tool(filepaths: list[str]) -> str:
    """Make files visible to the user for viewing and rendering in the client interface.

    When to use the present_files tool:

    - Making any file available for the user to view, download, or interact with
    - Presenting multiple related files at once
    - After creating a file that should be presented to the user

    When NOT to use the present_files tool:
    - When you only need to read file contents for your own processing
    - For temporary or intermediate files not meant for user viewing

    Args:
        filepaths: List of absolute file paths to present to the user. **Only** files in `/mnt/user-data/outputs` can be presented.

    Returns:
        "OK" if the files were presented successfully.
    """
    return "OK"
