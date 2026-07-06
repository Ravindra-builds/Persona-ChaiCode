import { NextResponse } from "next/server";
import { z } from "zod";
import { generateReply, type Mentor } from "@/llm";
import { checkChatRateLimit } from "@/utils/rateLimitingUtils";
import {
  handleApiError,
  ValidationError,
  AuthenticationError,
  LLMError,
} from "@/utils/errorHandler";

const chatSchema = z.object({
  mentor: z.enum(["hitesh", "piyush"]),
  messages: z.array(z.object({ role: z.string(), content: z.string() })).min(1, "At least one message is required"),
  userId: z.string().optional(), 
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { mentor, messages, userId } = chatSchema.parse(body);

   
    const userIdentifier = userId || req.headers.get("x-forwarded-for") || "anonymous";
    try {
      await checkChatRateLimit(userIdentifier);
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
