import type { Message } from "@langchain/langgraph-sdk";
import { memo } from "react";

import {
  Message as AIElementMessage,
  MessageContent as AIElementMessageContent,
  MessageResponse as AIElementMessageResponse,
  MessageToolbar,
} from "@/components/ai-elements/message";
import {
  extractContentFromMessage,
  hasReasoning,
  hasToolCalls,
} from "@/core/messages/utils";
import { useRehypeSplitWordsIntoSpans } from "@/core/rehype";
import { cn } from "@/lib/utils";

import { CopyButton } from "../copy-button";

import { MessageGroup } from "./message-group";

export function MessageListItem({
  className,
  message,
  messagesInGroup,
  isLoading,
}: {
  className?: string;
  message: Message;
  messagesInGroup: Message[];
  isLoading?: boolean;
}) {
  return (
    <AIElementMessage
      className={cn("group/conversation-message relative w-full", className)}
      from={message.type === "human" ? "user" : "assistant"}
    >
      <MessageContent
        className={message.type === "human" ? "w-fit" : "w-full"}
        message={message}
        messagesInGroup={messagesInGroup}
        isLoading={isLoading}
      />
      <MessageToolbar
        className={cn(
          message.type === "human" && "justify-end",
          message.type === "human" ? "-bottom-9" : "-bottom-8",
          "absolute right-0 left-0 z-20 opacity-0 transition-opacity delay-200 duration-300 group-hover/conversation-message:opacity-100",
        )}
      >
        <div className="flex gap-1">
          <CopyButton clipboardData={extractContentFromMessage(message)} />
        </div>
      </MessageToolbar>
    </AIElementMessage>
  );
}

function MessageContent_({
  className,
  message,
  messagesInGroup,
  isLoading = false,
}: {
  className?: string;
  message: Message;
  messagesInGroup: Message[];
  isLoading?: boolean;
}) {
  const rehypePlugins = useRehypeSplitWordsIntoSpans(isLoading);
  return (
    <AIElementMessageContent className={className}>
      {hasReasoning(message) && (
        <MessageGroup messages={messagesInGroup} isLoading={isLoading} />
      )}
      <AIElementMessageResponse rehypePlugins={rehypePlugins}>
        {extractContentFromMessage(message)}
      </AIElementMessageResponse>
      {hasToolCalls(message) && (
        <MessageGroup messages={messagesInGroup} isLoading={isLoading} />
      )}
    </AIElementMessageContent>
  );
}
const MessageContent = memo(MessageContent_);
