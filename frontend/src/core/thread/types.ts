import { type BaseMessage } from "@langchain/core/messages";
import type { Thread } from "@langchain/langgraph-sdk";

export interface MessageThreadState extends Record<string, unknown> {
  messages: BaseMessage[];
}

export interface MessageThread extends Thread<MessageThreadState> {}
