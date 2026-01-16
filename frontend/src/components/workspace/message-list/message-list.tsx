import type { UseStream } from "@langchain/langgraph-sdk/react";

import {
  Conversation,
  ConversationContent,
} from "@/components/ai-elements/conversation";
import {
  extractPresentFilesFromMessage,
  groupMessages,
  hasContent,
  hasPresentFiles,
} from "@/core/messages/utils";
import type { AgentThreadState } from "@/core/threads";
import { cn } from "@/lib/utils";

import { StreamingIndicator } from "../streaming-indicator";

import { MessageGroup } from "./message-group";
import { MessageListItem } from "./message-list-item";
import { PresentFileList } from "./present-file-list";
import { MessageListSkeleton } from "./skeleton";

export function MessageList({
  className,
  thread,
}: {
  className?: string;
  thread: UseStream<AgentThreadState>;
}) {
  if (thread.isThreadLoading) {
    return <MessageListSkeleton />;
  }
  return (
    <Conversation
      className={cn("flex size-full flex-col justify-center pt-2", className)}
    >
      <ConversationContent className="mx-auto w-full max-w-(--container-width-md) gap-10">
        {groupMessages(
          thread.messages,
          (groupedMessages) => {
            if (groupedMessages[0] && hasContent(groupedMessages[0])) {
              const message = groupedMessages[0];
              return (
                <MessageListItem
                  key={message.id}
                  message={message}
                  messagesInGroup={groupedMessages}
                  isLoading={thread.isLoading}
                />
              );
            }
            if (groupedMessages[0] && hasPresentFiles(groupedMessages[0])) {
              const files = [];
              for (const message of groupedMessages) {
                if (hasPresentFiles(message)) {
                  files.push(...extractPresentFilesFromMessage(message));
                }
              }
              return (
                <PresentFileList key={groupedMessages[0].id} files={files} />
              );
            }
            return (
              <MessageGroup
                key={groupedMessages[0]!.id}
                messages={groupedMessages}
                isLoading={thread.isLoading}
              />
            );
          },
          thread.isLoading,
        )}
        {thread.isLoading && <StreamingIndicator className="my-4" />}
        <div className="h-40" />
      </ConversationContent>
    </Conversation>
  );
}
