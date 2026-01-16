import type { UseStream } from "@langchain/langgraph-sdk/react";

import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import { groupMessages, hasContent } from "@/core/messages/utils";
import type { AgentThreadState } from "@/core/threads";
import { cn } from "@/lib/utils";

import { StreamingIndicator } from "../streaming-indicator";

import { MessageGroup } from "./message-group";
import { MessageListItem } from "./message-list-item";
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
      <ConversationContent className="mx-auto w-full max-w-(--container-width-md)">
        {groupMessages(
          thread.messages,
          (groupedMessages, groupIndex, isLastGroup) => {
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
      <ConversationScrollButton className="-translate-y-16 backdrop-blur-xs" />
    </Conversation>
  );
}
