"use client";

import { FilesIcon, XIcon } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

import { ConversationEmptyState } from "@/components/ai-elements/conversation";
import { Button } from "@/components/ui/button";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { useSidebar } from "@/components/ui/sidebar";
import {
  ArtifactFileDetail,
  ArtifactFileList,
  useArtifacts,
} from "@/components/workspace/artifacts";
import { InputBox } from "@/components/workspace/input-box";
import { MessageList } from "@/components/workspace/messages";
import { ThreadTitle } from "@/components/workspace/thread-title";
import { Tooltip } from "@/components/workspace/tooltip";
import { Welcome } from "@/components/workspace/welcome";
import { useLocalSettings } from "@/core/settings";
import { type AgentThread } from "@/core/threads";
import { useSubmitThread, useThreadStream } from "@/core/threads/hooks";
import { pathOfThread, titleOfThread } from "@/core/threads/utils";
import { uuid } from "@/core/utils/uuid";
import { cn } from "@/lib/utils";

export default function ChatPage() {
  const router = useRouter();
  const [settings, setSettings] = useLocalSettings();
  const { setOpen: setSidebarOpen } = useSidebar();
  const {
    artifacts,
    open: artifactsOpen,
    setOpen: setArtifactsOpen,
    setArtifacts,
    selectedArtifact,
  } = useArtifacts();

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
  const title = useMemo(() => {
    let result = isNewThread
      ? ""
      : titleOfThread(thread as unknown as AgentThread);
    if (result === "Untitled") {
      result = "";
    }
    return result;
  }, [thread, isNewThread]);

  useEffect(() => {
    setArtifacts(thread.values.artifacts);
  }, [setArtifacts, thread.values.artifacts]);

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
      <ResizablePanel
        className="relative"
        defaultSize={artifactsOpen ? 46 : 100}
        minSize={30}
      >
        <div className="relative flex size-full min-h-0 justify-between">
          <header className="bg-background/80 absolute top-0 right-0 left-0 z-30 flex h-12 shrink-0 items-center px-4 backdrop-blur">
            <div className="flex w-full items-center text-sm font-medium">
              {threadId && title !== "Untitled" && (
                <ThreadTitle threadId={threadId} threadTitle={title} />
              )}
            </div>
            <div>
              {artifacts?.length && !artifactsOpen && (
                <Tooltip content="Show artifacts of this conversation">
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setArtifactsOpen(true);
                      setSidebarOpen(false);
                    }}
                  >
                    <FilesIcon />
                    Artifacts
                  </Button>
                </Tooltip>
              )}
            </div>
          </header>
          <main className="flex min-h-0 grow flex-col">
            <div className="flex size-full justify-center">
              <MessageList
                className="size-full"
                threadId={threadId!}
                thread={thread}
              />
            </div>
            <div className="absolute right-0 bottom-0 left-0 z-30 flex justify-center px-4">
              <div
                className={cn(
                  "relative w-full",
                  isNewThread && "-translate-y-[calc(50vh-120px)]",
                  isNewThread
                    ? "max-w-(--container-width-sm)"
                    : "max-w-(--container-width-md)",
                )}
              >
                <div
                  className={cn(
                    "absolute right-0 bottom-[148px] left-0 flex",
                    isNewThread ? "" : "pointer-events-none opacity-0",
                  )}
                >
                  <Welcome />
                </div>
                <InputBox
                  className={cn("w-full")}
                  autoFocus={isNewThread}
                  status={thread.isLoading ? "streaming" : "ready"}
                  context={settings.context}
                  onContextChange={(context) => setSettings("context", context)}
                  onSubmit={handleSubmit}
                  onStop={handleStop}
                />
              </div>
            </div>
          </main>
        </div>
      </ResizablePanel>
      <ResizableHandle
        className={cn(
          "transition-opacity duration-300",
          !artifactsOpen && "pointer-events-none opacity-0",
        )}
      />
      <ResizablePanel
        className={cn(
          "transition-all duration-300 ease-in-out",
          !artifactsOpen && "opacity-0",
        )}
        defaultSize={artifactsOpen ? 64 : 0}
        minSize={0}
      >
        <div
          className={cn(
            "h-full transition-transform duration-300 ease-in-out",
            artifactsOpen ? "translate-x-0" : "translate-x-full",
          )}
        >
          {selectedArtifact ? (
            <ArtifactFileDetail
              className="size-full"
              filepath={selectedArtifact}
              threadId={threadId!}
            />
          ) : (
            <div className="relative flex size-full justify-center">
              <div className="absolute top-1 right-1 z-30">
                <Button
                  size="icon-sm"
                  variant="ghost"
                  onClick={() => {
                    setArtifactsOpen(false);
                  }}
                >
                  <XIcon />
                </Button>
              </div>
              {thread.values.artifacts?.length === 0 ? (
                <ConversationEmptyState
                  icon={<FilesIcon />}
                  title="No artifact selected"
                  description="Select an artifact to view its details"
                />
              ) : (
                <div className="flex size-full max-w-(--container-width-sm) flex-col justify-center p-4 pt-8">
                  <header className="shrink-0">
                    <h2 className="text-lg font-medium">Artifacts</h2>
                  </header>
                  <main className="min-h-0 grow">
                    <ArtifactFileList
                      className="max-w-(--container-width-sm) p-4 pt-12"
                      files={thread.values.artifacts ?? []}
                      threadId={threadId!}
                    />
                  </main>
                </div>
              )}
            </div>
          )}
        </div>
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}
