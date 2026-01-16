import type { HumanMessage } from "@langchain/core/messages";
import type { ThreadsClient } from "@langchain/langgraph-sdk/client";
import { useStream, type UseStream } from "@langchain/langgraph-sdk/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";

import type { PromptInputMessage } from "@/components/ai-elements/prompt-input";

import { getAPIClient } from "../api";

import type {
  AgentThread,
  AgentThreadContext,
  AgentThreadState,
} from "./types";

export function useThreadStream({
  threadId,
  isNewThread,
}: {
  isNewThread: boolean;
  threadId: string | null | undefined;
}) {
  const queryClient = useQueryClient();
  return useStream<AgentThreadState>({
    client: getAPIClient(),
    assistantId: "lead_agent",
    threadId: isNewThread ? undefined : threadId,
    reconnectOnMount: true,
    fetchStateHistory: true,
    onFinish() {
      void queryClient.invalidateQueries({ queryKey: ["threads", "search"] });
    },
  });
}

export function useSubmitThread({
  threadId,
  thread,
  threadContext,
  isNewThread,
  message,
}: {
  isNewThread: boolean;
  threadId: string;
  thread: UseStream<AgentThreadState>;
  threadContext: AgentThreadContext;
  message: PromptInputMessage;
}) {
  const queryClient = useQueryClient();
  const text = message.text.trim();
  const callback = useCallback(async () => {
    await thread.submit(
      {
        messages: [
          {
            type: "human",
            content: [
              {
                type: "text",
                text,
              },
            ],
          },
        ] as HumanMessage[],
      },
      {
        threadId: isNewThread ? threadId : undefined,
        streamSubgraphs: true,
        streamResumable: true,
        context: {
          ...threadContext,
          thread_id: threadId,
        },
      },
    );
    void queryClient.invalidateQueries({ queryKey: ["threads", "search"] });
  }, [queryClient, thread, threadContext, threadId, isNewThread, text]);
  return callback;
}

export function useThreads(
  params: Parameters<ThreadsClient["search"]>[0] = {
    limit: 50,
    sortBy: "updated_at",
    sortOrder: "desc",
  },
) {
  const langGraphClient = getAPIClient();
  return useQuery<AgentThread[]>({
    queryKey: ["threads", "search", params],
    queryFn: async () => {
      const response =
        await langGraphClient.threads.search<AgentThreadState>(params);
      return response as AgentThread[];
    },
  });
}

export function useDeleteThread() {
  const queryClient = useQueryClient();
  const langGraphClient = getAPIClient();
  return useMutation({
    mutationFn: async ({ threadId }: { threadId: string }) => {
      await langGraphClient.threads.delete(threadId);
    },
    onSuccess(_, { threadId }) {
      queryClient.setQueriesData(
        {
          queryKey: ["threads", "search"],
          exact: false,
        },
        (oldData: Array<AgentThread>) => {
          return oldData.filter((t) => t.thread_id !== threadId);
        },
      );
    },
  });
}
