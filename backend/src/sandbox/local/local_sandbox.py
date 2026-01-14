import os
import subprocess

from src.sandbox.local.list_dir import list_dir
from src.sandbox.sandbox import Sandbox


class LocalSandbox(Sandbox):
    def __init__(self, id: str):
        super().__init__(id)

    def execute_command(self, command: str) -> str:
        result = subprocess.run(
            command,
            executable="/bin/zsh",
            shell=True,
            capture_output=True,
            text=True,
            timeout=30,
        )
        output = result.stdout
        if result.stderr:
            output += f"\nStd Error:\n{result.stderr}" if output else result.stderr
        if result.returncode != 0:
            output += f"\nExit Code: {result.returncode}"
        return output if output else "(no output)"

    def list_dir(self, path: str, max_depth=2) -> list[str]:
        return list_dir(path, max_depth)

    def read_file(self, path: str) -> str:
        with open(path) as f:
            return f.read()

    def write_file(self, path: str, content: str, append: bool = False) -> None:
        dir_path = os.path.dirname(path)
        if dir_path:
            os.makedirs(dir_path, exist_ok=True)
        mode = "a" if append else "w"
        with open(path, mode) as f:
            f.write(content)


if __name__ == "__main__":
    sandbox = LocalSandbox("test")
    print(sandbox.list_dir("/Users/Henry/mnt"))
