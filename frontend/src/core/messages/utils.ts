import type { Message } from "@langchain/langgraph-sdk";

export function groupMessages<T>(
  messages: Message[],
  mapper: (groupedMessages: Message[]) => T,
  isLoading = false,
): T[] {
  if (messages.length === 0) {
    return [];
  }
  const groups: Message[][] = [];
  let currentGroup: Message[] = [];
  const yieldCurrentGroup = () => {
    if (currentGroup.length > 0) {
      groups.push(currentGroup);
      currentGroup = [];
    }
  };
  let messageIndex = 0;
  for (const message of messages) {
    if (message.type === "human") {
      // Human messages are always shown as a individual group
      yieldCurrentGroup();
      currentGroup.push(message);
      yieldCurrentGroup();
    } else if (message.type === "tool") {
      // Tool messages are always shown with the assistant messages that contains the tool calls
      currentGroup.push(message);
    } else if (message.type === "ai") {
      if (
        hasToolCalls(message) ||
        (extractTextFromMessage(message) === "" &&
          extractReasoningContentFromMessage(message) !== "" &&
          messageIndex === messages.length - 1 &&
          isLoading)
      ) {
        if (message.tool_calls?.[0]?.name === "present_files") {
          // When `present_files` called, put them into an individual group
          yieldCurrentGroup();
          currentGroup.push(message);
        } else {
          // Assistant messages without any content are folded into the previous group
          // Normally, these are tool calls (with or without thinking)
          currentGroup.push(message);
        }
      } else {
        // Assistant messages with content (text or images) are shown as a group if they have content
        // No matter whether it has tool calls or not
        if (hasReasoning(message)) {
          currentGroup.push(message);
        }
        yieldCurrentGroup();
        currentGroup.push(message);
      }
    }
    messageIndex++;
  }
  yieldCurrentGroup();

  const resultsOfGroups: T[] = [];
  for (const group of groups) {
    const resultOfGroup = mapper(group);
    if (resultOfGroup !== undefined && resultOfGroup !== null) {
      resultsOfGroups.push(resultOfGroup);
    }
  }
  return resultsOfGroups;
}

export function extractTextFromMessage(message: Message) {
  if (typeof message.content === "string") {
    return message.content.trim();
  }
  if (Array.isArray(message.content)) {
    return message.content
      .map((content) => (content.type === "text" ? content.text : ""))
      .join("\n")
      .trim();
  }
  return "";
}

export function extractContentFromMessage(message: Message) {
  if (typeof message.content === "string") {
    return message.content.trim();
  }
  if (Array.isArray(message.content)) {
    return message.content
      .map((content) => {
        switch (content.type) {
          case "text":
            return content.text;
          case "image_url":
            const imageURL = extractURLFromImageURLContent(content.image_url);
            return `![image](${imageURL})`;
          default:
            return "";
        }
      })
      .join("\n")
      .trim();
  }
  return "";
}

export function extractReasoningContentFromMessage(message: Message) {
  if (message.type !== "ai" || !message.additional_kwargs) {
    return null;
  }
  if ("reasoning_content" in message.additional_kwargs) {
    return message.additional_kwargs.reasoning_content as string | null;
  }
  return null;
}

export function extractURLFromImageURLContent(
  content:
    | string
    | {
        url: string;
      },
) {
  if (typeof content === "string") {
    return content;
  }
  return content.url;
}

export function hasContent(message: Message) {
  if (typeof message.content === "string") {
    return message.content.trim().length > 0;
  }
  if (Array.isArray(message.content)) {
    return message.content.length > 0;
  }
  return false;
}

export function hasReasoning(message: Message) {
  return (
    message.type === "ai" &&
    typeof message.additional_kwargs?.reasoning_content === "string"
  );
}

export function hasToolCalls(message: Message) {
  return (
    message.type === "ai" && message.tool_calls && message.tool_calls.length > 0
  );
}

export function hasPresentFiles(message: Message) {
  return (
    message.type === "ai" && message.tool_calls?.[0]?.name === "present_files"
  );
}

export function extractPresentFilesFromMessage(message: Message) {
  if (message.type !== "ai" || !hasPresentFiles(message)) {
    return [];
  }
  const files: string[] = [];
  for (const toolCall of message.tool_calls ?? []) {
    if (
      toolCall.name === "present_files" &&
      Array.isArray(toolCall.args.filepaths)
    ) {
      files.push(...(toolCall.args.filepaths as string[]));
    }
  }
  return files;
}

export function findToolCallResult(toolCallId: string, messages: Message[]) {
  for (const message of messages) {
    if (message.type === "tool" && message.tool_call_id === toolCallId) {
      const content = extractTextFromMessage(message);
      if (content) {
        return content;
      }
    }
  }
  return undefined;
}
