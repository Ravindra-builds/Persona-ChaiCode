

import type { YouTubeChannelInfo } from "@/lib/youtube";




export interface ToolResults {
  youtube?: YouTubeChannelInfo;
}

export type GenerateReplyResult = {
  reply: string;
  youtube?: YouTubeChannelInfo;
};



export interface LLMResponse {
  reply: string;
  toolCalls?: ToolCall[];
}

export type Mentor = "hitesh" | "piyush";

export type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

export type ToolCall = {
  id: string;
  name: string;
  args: Record<string, any>;
};

export type AIResponse =
  | { type: "text"; content: string }
  | { type: "tool_call"; toolCall: ToolCall; raw: unknown };