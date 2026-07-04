import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().min(1),
  JWT_SECRET: z.string().default("dev-secret-change-in-prod"),
  JWT_REFRESH_SECRET: z.string().default("dev-refresh-secret-change-in-prod"),
  ACCESS_TOKEN_EXPIRY: z.string().default("15m"),
  REFRESH_TOKEN_EXPIRY: z.string().default("7d"),
  GEMINI_API_KEY: z.string().default(""),
  OPENAI_API_KEY: z.string().default(""),
  OPENAI_MODEL: z.string().default("gpt-4.1"),
  GEMINI_MODEL: z.string().default("gemini-2.0-flash"),
  GOOGLE_CLIENT_ID: z.string().default(""),
  GOOGLE_CLIENT_SECRET: z.string().default(""),
  GOOGLE_REDIRECT_URI: z.string().default("http://localhost:3000/api/auth/google/callback"),
  LLM_PROVIDER: z.enum(["gemini", "openai"]).default("gemini"),
  SKIP_AUTH: z.string().default("true"),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("Invalid env variables:", parsed.error.flatten().fieldErrors);
  throw new Error("Invalid environment variables");
}

export const env = parsed.data;
