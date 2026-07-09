

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