from typing import TypedDict

from langchain.agents import AgentState


class SandboxState(TypedDict):
    sandbox_id: str | None = None


class ThreadState(AgentState):
    sandbox: SandboxState | None = None
