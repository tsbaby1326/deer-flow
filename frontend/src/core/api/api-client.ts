"use client";

import { Client as LangGraphClient } from "@langchain/langgraph-sdk/client";

import { getBackendBaseURL } from "../config";

let _singleton: LangGraphClient | null = null;
export function getAPIClient(): LangGraphClient {
  _singleton ??= new LangGraphClient({
    apiUrl: getBackendBaseURL(),
  });
  return _singleton;
}
