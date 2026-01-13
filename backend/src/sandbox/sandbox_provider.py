from abc import ABC, abstractmethod

from src.config import get_app_config
from src.reflection import resolve_class
from src.sandbox.sandbox import Sandbox


class SandboxProvider(ABC):
    """Abstract base class for sandbox providers"""

    @abstractmethod
    def acquire(self) -> str:
        """Acquire a sandbox environment.

        Returns:
            The ID of the acquired sandbox environment.
        """
        pass

    @abstractmethod
    def get(self, sandbox_id: str) -> Sandbox:
        """Get a sandbox environment by ID.

        Args:
            sandbox_id: The ID of the sandbox environment to retain.
        """
        pass

    @abstractmethod
    def release(self, sandbox_id: str) -> None:
        """Release a sandbox environment.

        Args:
            sandbox_id: The ID of the sandbox environment to destroy.
        """
        pass


_default_sandbox_provider: SandboxProvider | None = None


def get_sandbox_provider() -> SandboxProvider:
    """Get the sandbox provider.

    Returns:
        A sandbox provider.
    """
    global _default_sandbox_provider
    if _default_sandbox_provider is None:
        config = get_app_config()
        cls = resolve_class(config.sandbox.use, SandboxProvider)
        _default_sandbox_provider = cls()
    return _default_sandbox_provider
