"use client";

import { type HumanMessage } from "@langchain/core/messages";
import { useStream } from "@langchain/langgraph-sdk/react";
import { useQueryClient } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

import type { PromptInputMessage } from "@/components/ai-elements/prompt-input";
import { BreadcrumbItem } from "@/components/ui/breadcrumb";
import { InputBox } from "@/components/workspace/input-box";
import { MessageList } from "@/components/workspace/message-list/message-list";
import {
  WorkspaceContainer,
  WorkspaceBody,
  WorkspaceHeader,
  WorkspaceFooter,
} from "@/components/workspace/workspace-container";
import { getLangGraphClient } from "@/core/api";
import type {
  AgentThread,
  AgentThreadContext,
  AgentThreadState,
} from "@/core/threads";
import { titleOfThread } from "@/core/threads/utils";
import { uuid } from "@/core/utils/uuid";

const langGraphClient = getLangGraphClient();

export default function ChatPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { thread_id: threadIdFromPath } = useParams<{ thread_id: string }>();
  const isNewThread = useMemo(
    () => threadIdFromPath === "new",
    [threadIdFromPath],
  );
  const [threadId, setThreadId] = useState<string | null>(null);
  const [threadContext, setThreadContext] = useState<AgentThreadContext>({
    thread_id: "",
    model: "deepseek-v3.2",
    thinking_enabled: true,
  });
  useEffect(() => {
    if (threadIdFromPath !== "new") {
      setThreadId(threadIdFromPath);
    } else {
      setThreadId(uuid());
    }
  }, [threadIdFromPath]);
  const thread = useStream<AgentThreadState>({
    client: langGraphClient,
    assistantId: "lead_agent",
    threadId: !isNewThread ? threadId : undefined,
    reconnectOnMount: true,
    fetchStateHistory: true,
    onFinish() {
      void queryClient.invalidateQueries({ queryKey: ["threads", "search"] });
    },
  });
  const handleSubmit = useCallback(
    async (message: PromptInputMessage) => {
      const text = message.text.trim();
      if (isNewThread) {
        router.replace(`/workspace/chats/${threadId}`);
      }
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
          threadId: isNewThread ? threadId! : undefined,
          streamSubgraphs: true,
          streamResumable: true,
          context: {
            ...threadContext,
            thread_id: threadId!,
          },
        },
      );
      void queryClient.invalidateQueries({ queryKey: ["threads", "search"] });
    },
    [isNewThread, queryClient, router, thread, threadContext, threadId],
  );
  const handleStop = useCallback(async () => {
    await thread.stop();
  }, [thread]);
  return (
    <WorkspaceContainer>
      <WorkspaceHeader>
        <BreadcrumbItem className="hidden md:block">
          {isNewThread
            ? "New"
            : titleOfThread(thread as unknown as AgentThread)}
        </BreadcrumbItem>
      </WorkspaceHeader>
      <WorkspaceBody>
        <div className="flex size-full justify-center">
          <MessageList className="size-full" thread={thread} />
        </div>
      </WorkspaceBody>
      <WorkspaceFooter>
        <InputBox
          className="max-w-(--container-width-md)"
          autoFocus={isNewThread}
          status={thread.isLoading ? "streaming" : "ready"}
          onSubmit={handleSubmit}
          onStop={handleStop}
        />
      </WorkspaceFooter>
    </WorkspaceContainer>
  );
}
