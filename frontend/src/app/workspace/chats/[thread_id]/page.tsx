"use client";

import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

import { BreadcrumbItem } from "@/components/ui/breadcrumb";
import { ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { InputBox } from "@/components/workspace/input-box";
import { MessageList } from "@/components/workspace/message-list/message-list";
import {
  WorkspaceContainer,
  WorkspaceBody,
  WorkspaceHeader,
} from "@/components/workspace/workspace-container";
import { useLocalSettings } from "@/core/settings";
import { type AgentThread } from "@/core/threads";
import { useSubmitThread, useThreadStream } from "@/core/threads/hooks";
import { pathOfThread, titleOfThread } from "@/core/threads/utils";
import { uuid } from "@/core/utils/uuid";

export default function ChatPage() {
  const router = useRouter();
  const { thread_id: threadIdFromPath } = useParams<{ thread_id: string }>();
  const isNewThread = useMemo(
    () => threadIdFromPath === "new",
    [threadIdFromPath],
  );
  const [threadId, setThreadId] = useState<string | null>(null);
  const { threadContext, setThreadContext } = useLocalSettings();

  useEffect(() => {
    if (threadIdFromPath !== "new") {
      setThreadId(threadIdFromPath);
    } else {
      setThreadId(uuid());
    }
  }, [threadIdFromPath]);
  const thread = useThreadStream({
    isNewThread,
    threadId,
  });
  const handleSubmit = useSubmitThread({
    isNewThread,
    threadId,
    thread,
    threadContext,
    afterSubmit() {
      router.push(pathOfThread(threadId!));
    },
  });
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
        <ResizablePanelGroup orientation="horizontal">
          <ResizablePanel className="relative" defaultSize={46}>
            <div className="flex size-full justify-center">
              <MessageList className="size-full" thread={thread} />
            </div>
            <div className="absolute right-0 bottom-0 left-0 flex justify-center px-4">
              <InputBox
                className="w-full max-w-(--container-width-md)"
                autoFocus={isNewThread}
                status={thread.isLoading ? "streaming" : "ready"}
                context={threadContext}
                onContextChange={setThreadContext}
                onSubmit={handleSubmit}
                onStop={handleStop}
              />
            </div>
          </ResizablePanel>
          {/* <ResizableHandle />
          <ResizablePanel defaultSize={64}></ResizablePanel> */}
        </ResizablePanelGroup>
      </WorkspaceBody>
    </WorkspaceContainer>
  );
}
