import { GoogleGenerativeAI } from "@google/generative-ai";
import { env } from "@/config/env";

const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);

export async function callGemini(systemPrompt: string, messages: { role: string; content: string }[]): Promise<string> {
  const model = genAI.getGenerativeModel({
    model: env.GEMINI_MODEL,
    systemInstruction: systemPrompt,
  });

  const lastMessage = messages[messages.length - 1];
  if (!lastMessage) return "Please send a message first.";

  const history = messages.slice(0, -1).map((message) => ({
    role: message.role === "assistant" ? "model" : "user",
    parts: [{ text: message.content }],
  }));

  const chat = model.startChat({ history });
  const result = await chat.sendMessage(lastMessage.content);
  return result.response.text();
}
