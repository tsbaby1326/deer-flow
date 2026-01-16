"use client";

import type { UseStream } from "@langchain/langgraph-sdk/react";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

import { BreadcrumbItem } from "@/components/ui/breadcrumb";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { ArtifactFileDetail } from "@/components/workspace/artifacts";
import {
  ArtifactsProvider,
  useArtifacts,
} from "@/components/workspace/artifacts/context";
import { InputBox } from "@/components/workspace/input-box";
import { MessageList } from "@/components/workspace/message-list/message-list";
import {
  WorkspaceContainer,
  WorkspaceBody,
  WorkspaceHeader,
} from "@/components/workspace/workspace-container";
import { useLocalSettings } from "@/core/settings";
import { type AgentThread, type AgentThreadState } from "@/core/threads";
import { useSubmitThread, useThreadStream } from "@/core/threads/hooks";
import { pathOfThread, titleOfThread } from "@/core/threads/utils";
import { uuid } from "@/core/utils/uuid";

export default function ChatPage() {
  const { thread_id: threadIdFromPath } = useParams<{ thread_id: string }>();
  const isNewThread = useMemo(
    () => threadIdFromPath === "new",
    [threadIdFromPath],
  );
  const [threadId, setThreadId] = useState<string | null>(null);

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
        <ArtifactsProvider>
          <ThreadDetail
            threadId={threadId}
            thread={thread}
            isNewThread={isNewThread}
          />
        </ArtifactsProvider>
      </WorkspaceBody>
    </WorkspaceContainer>
  );
}

function ThreadDetail({
  threadId,
  thread,
  isNewThread,
}: {
  threadId?: string | null;
  thread: UseStream<AgentThreadState>;
  isNewThread: boolean;
}) {
  const router = useRouter();
  const [settings, setSettings] = useLocalSettings();
  const { open, selectedArtifact } = useArtifacts();
  const handleSubmit = useSubmitThread({
    isNewThread,
    threadId,
    thread,
    threadContext: settings.context,
    afterSubmit() {
      router.push(pathOfThread(threadId!));
    },
  });
  const handleStop = useCallback(async () => {
    await thread.stop();
  }, [thread]);
  return (
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
            context={settings.context}
            onContextChange={(context) => setSettings("context", context)}
            onSubmit={handleSubmit}
            onStop={handleStop}
          />
        </div>
      </ResizablePanel>
      {open && (
        <>
          <ResizableHandle />
          <ResizablePanel defaultSize={64}>
            {selectedArtifact && (
              <ArtifactFileDetail filepath={selectedArtifact} />
            )}
          </ResizablePanel>
        </>
      )}
    </ResizablePanelGroup>
  );
}
