import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@clerk/nextjs/server";
import { generateReply } from "@/llm";
import { ChatMessage, Mentor } from "@/llm/types";
import { checkChatRateLimit } from "@/utils/rateLimitingUtils";
import {
  handleApiError,
  ValidationError,
  LLMError,
} from "@/utils/errorHandler";

const chatSchema = z.object({
  mentor: z.enum(["hitesh", "piyush"]),
  messages: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().min(1).max(3000, "Message is too long"),
      }),
    )
    .min(1, "At least one message is required")
    .max(30, "Conversation is too long"),
});

export async function POST(req: Request) {
  try {
    // Get authenticated user from Clerk
    const { userId } = await auth();

    if (!userId) {
      return handleApiError(
        new Error("Unauthorized. Please sign in."),
        "Chat: Unauthorized access",
      );
    }

    const body = await req.json();
    const { mentor, messages } = chatSchema.parse(body);

    // Apply rate limiting using Clerk userId
    try {
      await checkChatRateLimit(userId);
    } catch (rateLimitError) {
      return handleApiError(rateLimitError, "Chat: Rate limit exceeded");
    }

    try {
      const { reply, youtube } = await generateReply(
        mentor as Mentor,
        messages as ChatMessage[],
      );

      return NextResponse.json({
        success: true,
        reply,
        youtube: youtube
          ? {
              videos: youtube.videos,
              channelTitle: youtube.channelTitle,
              profileImage: youtube.profileImage,
              sourceMentor: youtube.sourceMentor,
            }
          : undefined,
      });
    } catch (llmError) {
      console.error("LLM generation error:", llmError);

      const message =
        llmError instanceof Error ? llmError.message : "Unknown LLM error";
        
       console.error(
    `[LLM_FAILURE] provider=${process.env.LLM_PROVIDER} model=${
      process.env.LLM_PROVIDER === "openai" ? process.env.OPENAI_MODEL : process.env.GEMINI_MODEL
    } mentor=${mentor} error="${message}"`,
  );

      const manyReq =
        message.includes("429") ||
        message.includes("RESOURCE_EXHAUSTED") ||
        message.includes("quota") ||
        message.includes("Rate limit exceeded");
      if (manyReq) {
        console.error(`[LLM_QUOTA_EXCEEDED] provider=${process.env.LLM_PROVIDER}`);
        return handleApiError(
          new LLMError(
            "I'm handling a lot of conversations right now. Please try again in a little while.",
          ),
          "Chat: Too many requests, please try after some time",
        );
      }

      return handleApiError(
        new LLMError(`Having issues with the LLM, try again later.`),
        "Chat: LLM generation failed",
      );
    }
  } catch (err) {
    if (err instanceof z.ZodError) {
      return handleApiError(
        new ValidationError(
          "Validation failed",
          err.flatten().fieldErrors as any,
        ),
        "Chat: Validation error",
      );
    }
    return handleApiError(err, "Chat: Unexpected error");
  }
}
