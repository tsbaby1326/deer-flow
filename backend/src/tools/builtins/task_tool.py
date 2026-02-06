"""Task tool for delegating work to subagents."""

import uuid
from typing import Literal

from langchain.tools import ToolRuntime, tool
from langgraph.typing import ContextT

from src.agents.thread_state import ThreadState
from src.subagents import SubagentExecutor, get_subagent_config
from src.subagents.executor import SubagentStatus, get_background_task_result


@tool("task", parse_docstring=True)
def task_tool(
    runtime: ToolRuntime[ContextT, ThreadState],
    subagent_type: Literal["general-purpose", "bash"],
    prompt: str,
    description: str,
    max_turns: int | None = None,
    run_in_background: bool = False,
) -> str:
    """Delegate a task to a specialized subagent that runs in its own context.

    Subagents help you:
    - Preserve context by keeping exploration and implementation separate
    - Handle complex multi-step tasks autonomously
    - Execute commands or operations in isolated contexts

    Available subagent types:
    - **general-purpose**: A capable agent for complex, multi-step tasks that require
      both exploration and action. Use when the task requires complex reasoning,
      multiple dependent steps, or would benefit from isolated context.
    - **bash**: Command execution specialist for running bash commands. Use for
      git operations, build processes, or when command output would be verbose.

    When to use this tool:
    - Complex tasks requiring multiple steps or tools
    - Tasks that produce verbose output
    - When you want to isolate context from the main conversation
    - Parallel research or exploration tasks

    When NOT to use this tool:
    - Simple, single-step operations (use tools directly)
    - Tasks requiring user interaction or clarification

    Args:
        subagent_type: The type of subagent to use.
        prompt: The task description for the subagent. Be specific and clear about what needs to be done.
        description: A short (3-5 word) description of the task for logging/display.
        max_turns: Optional maximum number of agent turns. Defaults to subagent's configured max.
        run_in_background: If True, run the task in background and return a task ID immediately.
    """
    # Get subagent configuration
    config = get_subagent_config(subagent_type)
    if config is None:
        return f"Error: Unknown subagent type '{subagent_type}'. Available: general-purpose, bash"

    # Override max_turns if specified
    if max_turns is not None:
        # Create a copy with updated max_turns
        from dataclasses import replace

        config = replace(config, max_turns=max_turns)

    # Extract parent context from runtime
    sandbox_state = None
    thread_data = None
    thread_id = None
    parent_model = None
    trace_id = None

    if runtime is not None:
        sandbox_state = runtime.state.get("sandbox")
        thread_data = runtime.state.get("thread_data")
        thread_id = runtime.context.get("thread_id")

        # Try to get parent model from configurable
        metadata = runtime.config.get("metadata", {})
        parent_model = metadata.get("model_name")

        # Get or generate trace_id for distributed tracing
        trace_id = metadata.get("trace_id") or str(uuid.uuid4())[:8]

    # Get available tools (excluding task tool to prevent nesting)
    # Lazy import to avoid circular dependency
    from src.tools import get_available_tools

    # Subagents should not have subagent tools enabled (prevent recursive nesting)
    tools = get_available_tools(model_name=parent_model, subagent_enabled=False)

    # Create executor
    executor = SubagentExecutor(
        config=config,
        tools=tools,
        parent_model=parent_model,
        sandbox_state=sandbox_state,
        thread_data=thread_data,
        thread_id=thread_id,
        trace_id=trace_id,
    )

    if run_in_background:
        # Start background execution
        task_id = executor.execute_async(prompt)
        return f"""Background task started with ID: {task_id} (trace: {trace_id})

⚠️ IMPORTANT: You MUST poll this task until completion before responding to the user.

Next steps:
1. Call task_status("{task_id}") to check progress
2. If status is "pending" or "running", wait briefly and call task_status again
3. Continue polling until status is "completed" or "failed"
4. Only then report results to the user

DO NOT end the conversation without retrieving the task result."""

    # Synchronous execution
    result = executor.execute(prompt)

    if result.status == SubagentStatus.COMPLETED:
        return f"[Subagent: {subagent_type} | trace={result.trace_id}]\n\n{result.result}"
    elif result.status == SubagentStatus.FAILED:
        return f"[Subagent: {subagent_type} | trace={result.trace_id}] Task failed: {result.error}"
    else:
        return f"[Subagent: {subagent_type} | trace={result.trace_id}] Unexpected status: {result.status.value}"


@tool("task_status", parse_docstring=True)
def task_status_tool(
    task_id: str,
) -> str:
    """Check the status of a background task and retrieve its result.

    Use this tool to check on tasks that were started with run_in_background=True.

    Args:
        task_id: The task ID returned when starting the background task.
    """
    result = get_background_task_result(task_id)

    if result is None:
        return f"Error: No task found with ID '{task_id}'"

    status_str = f"Task ID: {result.task_id}\nTrace ID: {result.trace_id}\nStatus: {result.status.value}"

    if result.started_at:
        status_str += f"\nStarted: {result.started_at.isoformat()}"

    if result.completed_at:
        status_str += f"\nCompleted: {result.completed_at.isoformat()}"

    if result.status == SubagentStatus.COMPLETED and result.result:
        status_str += f"\n\n✅ Task completed successfully.\n\nResult:\n{result.result}"
    elif result.status == SubagentStatus.FAILED and result.error:
        status_str += f"\n\n❌ Task failed.\n\nError: {result.error}"
    elif result.status in (SubagentStatus.PENDING, SubagentStatus.RUNNING):
        status_str += f"\n\n⏳ Task is still {result.status.value}. You MUST continue polling.\n\nAction required: Call task_status(\"{result.task_id}\") again after a brief wait."

    return status_str
