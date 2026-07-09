import { env } from "@/config/env";
import { callGemini } from "./gemini";
import { callOpenAI } from "./openai";
import { getSystemPrompt} from "@/lib/prompt.service";
import { getCache,setCache } from "@/utils/rateLimitingUtils";

export type Mentor = "hitesh" | "piyush";



export async function generateReply(
  mentor: Mentor,
  messages: { role: string; content: string }[],
): Promise<string> {

  const prompt = await getCache(`mentor:${mentor}:systemPrompt`);

if (prompt) {
  console.log("Cache Hit");
} else {
  console.log("Cache Miss");
}
  const systemPrompt = await getSystemPrompt(mentor);

  await setCache(`mentor:${mentor}:systemPrompt`, systemPrompt, 60 * 60 * 24); // Cache for 24 hours


  if (env.LLM_PROVIDER === "openai" && env.OPENAI_API_KEY) {
    return callOpenAI(systemPrompt.content, messages);
  }

  if (!env.GEMINI_API_KEY && !env.OPENAI_API_KEY) {
    return mentor === "hitesh"
      ? "Bhai, pehle API key set karo .env mein - Gemini ya OpenAI, jo bhi ho. Phir chai ke saath code karenge!"
      : "No LLM API key configured. Set GEMINI_API_KEY or OPENAI_API_KEY in your .env file, then restart the server.";
  }

  return callGemini(systemPrompt.content, messages);
}
