from src.sandbox.local.local_sandbox import LocalSandbox
from src.sandbox.sandbox import Sandbox
from src.sandbox.sandbox_provider import SandboxProvider

_singleton: LocalSandbox | None = None


class LocalSandboxProvider(SandboxProvider):
    def acquire(self) -> Sandbox:
        global _singleton
        if _singleton is None:
            _singleton = LocalSandbox("local")
        return _singleton.id

    def get(self, sandbox_id: str) -> None:
        if _singleton is None:
            self.acquire()
        return _singleton

    def release(self, sandbox_id: str) -> None:
        pass
