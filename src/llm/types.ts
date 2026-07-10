

import type { YouTubeChannelInfo } from "@/lib/youtube";

export type Mentor = "hitesh" | "piyush";

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface ToolResults {
  youtube?: YouTubeChannelInfo;
}

export interface AIResponse {
  reply: string;
  tools?: ToolResults;
}

export interface ToolCall {
  id: string;

  name: string;

  arguments: Record<string, any>;
}

export interface LLMResponse {
  reply: string;
  toolCalls?: ToolCall[];
}