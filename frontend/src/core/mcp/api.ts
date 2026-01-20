import { env } from "@/env";

import type { MCPConfig } from "./types";

export async function loadMCPConfig() {
  const response = await fetch(
    `${env.NEXT_PUBLIC_BACKEND_BASE_URL}/api/mcp/config`,
  );
  return response.json() as Promise<MCPConfig>;
}

export async function updateMCPConfig(config: MCPConfig) {
  const response = await fetch(
    `${env.NEXT_PUBLIC_BACKEND_BASE_URL}/api/mcp/config`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(config),
    },
  );
  return response.json();
}
