"use client";

import { Client as LangGraphClient } from "@langchain/langgraph-sdk/client";

let _singleton: LangGraphClient | null = null;
export function getAPIClient(): LangGraphClient {
  let url: URL | null = null;
  if (typeof window === "undefined") {
    url = new URL("/api/langgraph", "http://localhost:3000");
  } else {
    url = new URL("/api/langgraph", window.location.origin);
  }
  _singleton ??= new LangGraphClient({
    apiUrl: "http://localhost:2024",
  });
  return _singleton;
}
