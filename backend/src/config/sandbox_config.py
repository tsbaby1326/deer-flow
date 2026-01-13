from pydantic import BaseModel, Field


class SandboxConfig(BaseModel):
    """Config section for a sandbox"""

    use: str = Field(
        ...,
        description="Class path of the sandbox provider(e.g. src.sandbox.local:LocalSandbox)",
    )
