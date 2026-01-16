import type { Message } from "@langchain/langgraph-sdk";
import { memo } from "react";

import {
  Message as AIElementMessage,
  MessageContent as AIElementMessageContent,
  MessageResponse as AIElementMessageResponse,
} from "@/components/ai-elements/message";
import {
  extractContentFromMessage,
  hasReasoning,
  hasToolCalls,
} from "@/core/messages/utils";
import { useRehypeSplitWordsIntoSpans } from "@/core/rehype";
import { cn } from "@/lib/utils";

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
      className={cn("relative", "group/conversation-message", className)}
      from={message.type === "human" ? "user" : "assistant"}
    >
      <MessageContent
        className={className}
        message={message}
        messagesInGroup={messagesInGroup}
        isLoading={isLoading}
      />
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
        <MessageGroup
          className="mb-2"
          messages={[message]}
          isLoading={isLoading}
        />
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
