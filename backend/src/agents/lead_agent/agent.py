from langchain.agents import create_agent

from src.agents.lead_agent.prompt import apply_prompt_template
from src.agents.thread_state import ThreadState
from src.models import create_chat_model
from src.sandbox.middleware import SandboxMiddleware
from src.tools import get_available_tools

lead_agent = create_agent(
    model=create_chat_model(thinking_enabled=True),
    tools=get_available_tools(),
    middleware=[SandboxMiddleware()],
    system_prompt=apply_prompt_template(),
    state_schema=ThreadState,
)
