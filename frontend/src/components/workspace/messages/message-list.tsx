import type { UseStream } from "@langchain/langgraph-sdk/react";

import {
  Conversation,
  ConversationContent,
} from "@/components/ai-elements/conversation";
import {
  extractPresentFilesFromMessage,
  groupMessages,
  hasPresentFiles,
} from "@/core/messages/utils";
import type { AgentThreadState } from "@/core/threads";
import { cn } from "@/lib/utils";

import { ArtifactFileList } from "../artifacts/artifact-file-list";
import { StreamingIndicator } from "../streaming-indicator";

import { MessageGroup } from "./message-group";
import { MessageListItem } from "./message-list-item";
import { MessageListSkeleton } from "./skeleton";

export function MessageList({
  className,
  threadId,
  thread,
}: {
  className?: string;
  threadId: string;
  thread: UseStream<AgentThreadState>;
}) {
  if (thread.isThreadLoading) {
    return <MessageListSkeleton />;
  }
  return (
    <Conversation
      className={cn("flex size-full flex-col justify-center", className)}
    >
      <ConversationContent className="mx-auto w-full max-w-(--container-width-md) gap-10 pt-12">
        {groupMessages(thread.messages, (group) => {
          if (group.type === "human" || group.type === "assistant") {
            return (
              <MessageListItem
                key={group.id}
                message={group.messages[0]!}
                isLoading={thread.isLoading}
              />
            );
          }
          if (group.type === "assistant:present-files") {
            const files = [];
            for (const message of group.messages) {
              if (hasPresentFiles(message)) {
                files.push(...extractPresentFilesFromMessage(message));
              }
            }
            return (
              <ArtifactFileList
                key={group.id}
                files={files}
                threadId={threadId}
              />
            );
          }
          return (
            <MessageGroup
              key={"group-" + group.id}
              messages={group.messages}
              isLoading={thread.isLoading}
            />
          );
        })}
        {thread.isLoading && <StreamingIndicator className="my-4" />}
        <div className="h-40" />
      </ConversationContent>
    </Conversation>
  );
}
