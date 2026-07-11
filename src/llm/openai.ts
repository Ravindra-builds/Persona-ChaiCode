import OpenAI from "openai";
import { env } from "@/config/env";
import { youtubeToolOpenAI } from "./tools";
import type { AIResponse, ChatMessage, ToolCall } from "./types";

const client = new OpenAI({ apiKey: env.OPENAI_API_KEY });

type OpenAIRaw = {
  assistantMessage: OpenAI.Chat.Completions.ChatCompletionMessage;
};

export async function callOpenAI(
  systemPrompt: string,
  messages: ChatMessage[],
): Promise<AIResponse> {
  const response = await client.chat.completions.create({
    model: env.OPENAI_MODEL,
    messages: [
      { role: "system", content: systemPrompt },
      ...messages,
    ],
    tools: [youtubeToolOpenAI],
  });

  const assistantMessage = response.choices[0].message;
  const toolCall = assistantMessage.tool_calls?.[0];

  console.log("Assistant Message:", assistantMessage);
  console.log("Tool Call:", toolCall);

  if (!toolCall || toolCall.type !== "function") {
    return { type: "text", content: assistantMessage.content ?? "" };
  }

  return {
    type: "tool_call",
    toolCall: {
      id: toolCall.id,
      name: toolCall.function.name,
      args: JSON.parse(toolCall.function.arguments || "{}"),
    },
    raw: { assistantMessage } satisfies OpenAIRaw,
  };
}

export async function continueOpenAIWithToolResult(
  systemPrompt: string,
  messages: ChatMessage[],
  toolCall: ToolCall,
  toolResult: unknown,
  raw: unknown,
): Promise<AIResponse> {
  const { assistantMessage } = raw as OpenAIRaw;

  const final = await client.chat.completions.create({
    model: env.OPENAI_MODEL,
    messages: [
      { role: "system", content: systemPrompt },
      ...messages,
      assistantMessage,
      {
        role: "tool",
        tool_call_id: toolCall.id,
        content: JSON.stringify(toolResult),
      },
    ],
  });
  console.log("Final OpenAI response after tool call:", final);
  console.log("Final OpenAI response message:", final.choices[0].message);
  return { type: "text", content: final.choices[0].message.content ?? "" };
}