import { env } from "@/config/env";
import { callGemini, continueGeminiWithToolResult } from "./gemini";
import { callOpenAI, continueOpenAIWithToolResult } from "./openai";
import { getSystemPrompt } from "@/lib/prompt.service";
import { getCache, setCache } from "@/utils/rateLimitingUtils";
import { executeTool } from "./toolExecutor";
import type { AIResponse, ChatMessage, GenerateReplyResult, Mentor } from "./types";
import type { YouTubeChannelInfo } from "@/lib/youtube";

const MAX_TOOL_ROUNDS = 3;

export async function generateReply(
  mentor: Mentor,
  messages: ChatMessage[],
): Promise<GenerateReplyResult> {
  if (!env.GEMINI_API_KEY && !env.OPENAI_API_KEY) {
    const reply = mentor === "hitesh"
      ? "Bhai, pehle API key set karo .env mein - Gemini ya OpenAI, jo bhi ho. Phir chai ke saath code karenge!"
      : "No LLM API key configured. Set GEMINI_API_KEY or OPENAI_API_KEY in your .env file, then restart the server.";
    return { reply };
  }

  const cacheKey = `mentor:${mentor}:systemPrompt`;
  const cached = await getCache(cacheKey);

  let systemPromptContent: string;
  if (typeof cached === "string" && cached.length > 0) {
    console.log("Cache Hit");
    systemPromptContent = cached;
  } else {
    console.log("Cache Miss");
    const systemPrompt = await getSystemPrompt(mentor);
    systemPromptContent = systemPrompt.content;
    await setCache(cacheKey, systemPromptContent, 60 * 60 * 24);
  }

  const useOpenAI = env.LLM_PROVIDER === "openai" && !!env.OPENAI_API_KEY;

  let response: AIResponse = useOpenAI
    ? await callOpenAI(systemPromptContent, messages)
    : await callGemini(systemPromptContent, messages);

  let youtube: YouTubeChannelInfo | undefined;
  let rounds = 0;

  while (response.type === "tool_call" && rounds < MAX_TOOL_ROUNDS) {
    rounds++;
    const { toolCall, raw } = response;
    const toolResult = await executeTool(mentor, toolCall.name, toolCall.args);

    console.log(`Tool Result for ${toolCall.name}:`, toolResult);

    const isYoutubeResult =
      toolCall.name === "search_youtube" &&
      toolResult &&
      typeof toolResult === "object" &&
      "youtube" in toolResult;

    if (isYoutubeResult) {
      youtube = (toolResult as { youtube: YouTubeChannelInfo }).youtube;
      for (const video of youtube.videos) {
        console.log(`Video: ${video.title}, URL: ${video.url}`);
      }
    }

    const toolResultForModel = isYoutubeResult
      ? {
          youtube: {
            videoCount: (toolResult as any).youtube.videos.length,
            titles: (toolResult as any).youtube.videos.map((v: any) => v.title),
          },
        }
      : toolResult;

    response = useOpenAI
      ? await continueOpenAIWithToolResult(systemPromptContent, messages, toolCall, toolResultForModel, raw)
      : await continueGeminiWithToolResult(toolCall, toolResultForModel, raw);
  }

  console.log("Final Response:", response);

  const reply = response.type === "text"
    ? response.content
    : "Sorry, I couldn't generate a response.";

  return { reply, youtube };
}