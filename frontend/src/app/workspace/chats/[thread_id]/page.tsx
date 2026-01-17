"use client";

import { FilesIcon, XIcon } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { useSidebar } from "@/components/ui/sidebar";
import {
  ArtifactFileDetail,
  useArtifacts,
} from "@/components/workspace/artifacts";
import { FlipDisplay } from "@/components/workspace/flip-display";
import { InputBox } from "@/components/workspace/input-box";
import { MessageList } from "@/components/workspace/messages";
import { Tooltip } from "@/components/workspace/tooltip";
import { useLocalSettings } from "@/core/settings";
import { type AgentThread } from "@/core/threads";
import { useSubmitThread, useThreadStream } from "@/core/threads/hooks";
import { pathOfThread, titleOfThread } from "@/core/threads/utils";
import { uuid } from "@/core/utils/uuid";
import { cn } from "@/lib/utils";
import { ConversationEmptyState } from "@/components/ai-elements/conversation";

export default function ChatPage() {
  const router = useRouter();
  const [settings, setSettings] = useLocalSettings();
  const { setOpen: setSidebarOpen } = useSidebar();
  const {
    open: artifactsOpen,
    setOpen: setArtifactsOpen,
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
  const title = useMemo(
    () => (isNewThread ? "" : titleOfThread(thread as unknown as AgentThread)),
    [thread, isNewThread],
  );

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
          <header className="absolute top-0 right-0 left-0 z-30 flex h-12 shrink-0 items-center px-4 drop-shadow-2xl backdrop-blur">
            <div className="flex w-full items-center text-sm font-medium">
              <FlipDisplay
                uniqueKey={title}
                className="w-fit overflow-hidden text-ellipsis whitespace-nowrap"
              >
                {title}
              </FlipDisplay>
            </div>
            <div>
              {!artifactsOpen && (
                <Tooltip content="Show artifacts">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setArtifactsOpen(true);
                      setSidebarOpen(false);
                    }}
                  >
                    <FilesIcon />
                  </Button>
                </Tooltip>
              )}
            </div>
          </header>
          <main className="flex min-h-0 grow flex-col">
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
            />
          ) : (
            <div className="flex size-full items-center justify-center">
              <ConversationEmptyState
                icon={<FilesIcon />}
                title="No artifact selected"
                description="Select an artifact to view its details"
              />
            </div>
          )}
        </div>
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}
