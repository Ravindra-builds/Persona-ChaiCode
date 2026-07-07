import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@clerk/nextjs/server";
import { generateReply, type Mentor } from "@/llm";
import { checkChatRateLimit } from "@/utils/rateLimitingUtils";
import {
  handleApiError,
  ValidationError,
  LLMError,
} from "@/utils/errorHandler";

const chatSchema = z.object({
  mentor: z.enum(["hitesh", "piyush"]),
  messages: z.array(z.object({ role: z.string(), content: z.string() })).min(1, "At least one message is required"),
});

export async function POST(req: Request) {
  try {
    // Get authenticated user from Clerk
    const { userId } = await auth();
    
    if (!userId) {
      return handleApiError(
        new Error("Unauthorized. Please sign in."),
        "Chat: Unauthorized access"
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
      const reply = await generateReply(mentor as Mentor, messages);
      return NextResponse.json({
        success: true,
        reply,
      });
    } catch (llmError) {
      return handleApiError(
        new LLMError(
          llmError instanceof Error ? "Having issues with the LLM try again later": "Failed to generate response ,please try after some time"
        ),
        "Chat: LLM generation failed"
      );
    }
  } catch (err) {
    if (err instanceof z.ZodError) {
      return handleApiError(
        new ValidationError("Validation failed", err.flatten().fieldErrors as any),
        "Chat: Validation error"
      );
    }
    return handleApiError(err, "Chat: Unexpected error");
  }
}
