import type { BaseMessage } from "@langchain/core/messages";

import type { MessageThread } from "./types";

export function pathOfThread(thread: MessageThread, includeAssistantId = true) {
  if (includeAssistantId) {
    return `/workspace/chats/${thread.thread_id}`;
  }
  return `/workspace/chats/${thread.thread_id}`;
}

export function textOfMessage(message: BaseMessage) {
  if (typeof message.content === "string") {
    return message.content;
  } else if (Array.isArray(message.content)) {
    return message.content.find((part) => part.type === "text" && part.text)
      ?.text as string;
  }
  return null;
}

export function titleOfThread(thread: MessageThread) {
  if (thread.values && "title" in thread.values) {
    return thread.values.title as string;
  }
  return "Untitled";
}
