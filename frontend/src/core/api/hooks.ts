import type { ThreadsClient } from "@langchain/langgraph-sdk/client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import type { AgentThread, AgentThreadState } from "../threads";

import { getLangGraphClient } from "./client";

export function useThreads(
  params: Parameters<ThreadsClient["search"]>[0] = {
    limit: 50,
    sortBy: "updated_at",
    sortOrder: "desc",
  },
) {
  const langGraphClient = getLangGraphClient();
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
  const langGraphClient = getLangGraphClient();
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
