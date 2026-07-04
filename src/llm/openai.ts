import OpenAI from "openai";
import { env } from "@/config/env";

const client = new OpenAI({ apiKey: env.OPENAI_API_KEY });

export async function callOpenAI(systemPrompt: string, messages: { role: string; content: string }[]): Promise<string> {
  const response = await client.chat.completions.create({
    model: env.OPENAI_MODEL,
    messages: [
      { role: "system", content: systemPrompt },
      ...messages.map((m) => ({ role: m.role as "user" | "assistant", content: m.content })),
    ],
  });
  return response.choices[0]?.message?.content ?? "No response generated.";
}
