import { db } from "@/db";
import { prompts } from "@/db/schema";
import { Mentor } from "@/llm/types";
import { eq } from "drizzle-orm";

export async function getSystemPrompt(mentor: Mentor) {
  const prompt = await db.query.prompts.findFirst({
    where: eq(prompts.mentor, mentor),
  });

  if (!prompt) {
    throw new Error(`No prompt found for ${mentor}`);
  }

  return prompt;
}