import type { ThreadsClient } from "@langchain/langgraph-sdk/client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import type { MessageThread, MessageThreadState } from "../thread";

import { getLangGraphClient } from "./client";

export function useThreads(
  params: Parameters<ThreadsClient["search"]>[0] = {
    limit: 50,
    sortBy: "updated_at",
    sortOrder: "desc",
  },
) {
  const langGraphClient = getLangGraphClient();
  return useQuery<MessageThread[]>({
    queryKey: ["threads", "search", params],
    queryFn: async () => {
      const response =
        await langGraphClient.threads.search<MessageThreadState>(params);
      return response as MessageThread[];
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
        (oldData: Array<MessageThread>) => {
          return oldData.filter((t) => t.thread_id !== threadId);
        },
      );
    },
  });
}
