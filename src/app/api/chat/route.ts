import { NextResponse } from "next/server";
import { z } from "zod";
import { generateReply, type Mentor } from "@/llm";

const chatSchema = z.object({
  mentor: z.enum(["hitesh", "piyush"]),
  messages: z.array(z.object({ role: z.string(), content: z.string() })).min(1),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { mentor, messages } = chatSchema.parse(body);

    const reply = await generateReply(mentor as Mentor, messages);
    return NextResponse.json({ reply });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.flatten().fieldErrors }, { status: 400 });
    }
    console.error("Chat error:", err);
    return NextResponse.json({ error: "Failed to generate response" }, { status: 500 });
  }
}
