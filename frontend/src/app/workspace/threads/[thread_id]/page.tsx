"use client";

import { useStream } from "@langchain/langgraph-sdk/react";
import { useParams } from "next/navigation";

import { getLangGraphClient } from "@/core/api";
import type { MessageThreadState } from "@/core/thread";

const apiClient = getLangGraphClient();

export default function TestPage() {
  const { thread_id: threadId } = useParams<{ thread_id: string }>();
  const thread = useStream<MessageThreadState>({
    client: apiClient,
    assistantId: "lead_agent",
    threadId,
    reconnectOnMount: true,
    fetchStateHistory: true,
  });
  return (
    <div className="p-4">
      <div>{threadId}</div>
      <div>{thread.isLoading ? "loading" : "not loading"}</div>
    </div>
  );
}
