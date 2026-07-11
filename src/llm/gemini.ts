import { GoogleGenAI, type Chat } from "@google/genai";
import { env } from "@/config/env";
import { youtubeToolGemini } from "./tools";
import type { AIResponse, ChatMessage, ToolCall } from "./types";

const ai = new GoogleGenAI({});

type GeminiRaw = {
  chat: Chat;
};

export async function callGemini(
  systemPrompt: string,
  messages: ChatMessage[],
): Promise<AIResponse> {
  const lastMessage = messages[messages.length - 1];
  if (!lastMessage) {
    return { type: "text", content: "Please send a message first." };
  }

  const history = messages.slice(0, -1).map((message) => ({
    role: message.role === "assistant" ? "model" : "user",
    parts: [{ text: message.content }],
  }));

  const chat = ai.chats.create({
    model: env.GEMINI_MODEL,
    config: {
      systemInstruction: systemPrompt,
      tools: [{ functionDeclarations: [youtubeToolGemini] }],
    },
    history,
  });

  const result = await chat.sendMessage({ message: lastMessage.content });
  const call = result.functionCalls?.[0];

  if (!call) {
    return { type: "text", content: result.text ?? "No response from Gemini." };
  }

  return {
    type: "tool_call",
    toolCall: {
      id: call.id ?? call.name ?? "tool_call",
      name: call.name ?? "",
      args: (call.args ?? {}) as Record<string, any>,
    },
    raw: { chat } satisfies GeminiRaw,
  };
}

export async function continueGeminiWithToolResult(
  toolCall: ToolCall,
  toolResult: unknown,
  raw: unknown,
): Promise<AIResponse> {
  const { chat } = raw as GeminiRaw;

  const result = await chat.sendMessage({
    message: {
      functionResponse: {
        name: toolCall.name,
        response: { result: toolResult },
      },
    },
  });
  console.log("Gemini response after tool call:", result);
  
  return { type: "text", content: result.text ?? "No response from Gemini." };
}