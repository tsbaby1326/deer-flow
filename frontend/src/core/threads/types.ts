import { type BaseMessage } from "@langchain/core/messages";
import type { Thread } from "@langchain/langgraph-sdk";

export interface AgentThreadState extends Record<string, unknown> {
  title: string;
  messages: BaseMessage[];
}

export interface AgentThread extends Thread<AgentThreadState> {}

export interface AgentThreadContext extends Record<string, unknown> {
  thread_id: string;
  model: string;
  thinking_enabled: boolean;
}
