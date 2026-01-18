import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";

import { useThread } from "@/components/workspace/messages/context";

import { loadArtifactContent } from "./loader";

export function useArtifactContent({
  filepath,
  threadId,
  enabled,
}: {
  filepath: string;
  threadId: string;
  enabled?: boolean;
}) {
  const isWriteFile = useMemo(() => {
    return filepath.startsWith("write-file:");
  }, [filepath]);
  const { thread } = useThread();
  const content = useMemo(() => {
    if (isWriteFile) {
      const url = new URL(filepath);
      const toolCallId = url.searchParams.get("tool_call_id");
      const messageId = url.searchParams.get("message_id");
      if (messageId && toolCallId) {
        const message = thread.messages.find(
          (message) => message.id === messageId,
        );
        if (message?.type === "ai" && message.tool_calls) {
          const toolCall = message.tool_calls.find(
            (toolCall) => toolCall.id === toolCallId,
          );
          if (toolCall) {
            return toolCall.args.content;
          }
        }
      }
    }
    return null;
  }, [filepath, isWriteFile, thread.messages]);
  const { data, isLoading, error } = useQuery({
    queryKey: ["artifact", filepath, threadId],
    queryFn: () => {
      return loadArtifactContent({ filepath, threadId });
    },
    enabled,
  });
  return { content: isWriteFile ? content : data, isLoading, error };
}
