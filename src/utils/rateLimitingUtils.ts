import { Redis } from "@upstash/redis";
import { RATE_LIMITS } from "./constants";
import { RateLimitError, RedisError } from "./errorHandler";

// Validate environment variables
if (
  !process.env.UPSTASH_REDIS_REST_URL ||
  !process.env.UPSTASH_REDIS_REST_TOKEN
) {
  throw new Error(
    "Missing UPSTASH_REDIS_REST_URL or UPSTASH_REDIS_REST_TOKEN"
  );
}

export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

export interface RateLimitConfig {
  limit: number;
  message: string;
}

function getTodayKey(identifier: string): string {
  const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD (UTC)
  return `ratelimit:${identifier}:${today}`;
}

function secondsUntilMidnight(): number {
  const now = new Date();

  const midnight = new Date(now);
  midnight.setHours(24, 0, 0, 0);

  return Math.ceil((midnight.getTime() - now.getTime()) / 1000);
}

/**
 * Checks and increments today's usage.
 */
export async function checkRateLimit(
  identifier: string,
  config: RateLimitConfig
): Promise<{
  allowed: boolean;
  current: number;
  remaining: number;
  retryAfter: number;
}> {
  try {
    const key = getTodayKey(identifier);

    const current = await redis.incr(key);

    if (current === 1) {
      await redis.expire(key, secondsUntilMidnight());
    }

    const ttl = await redis.ttl(key);

    return {
      allowed: current <= config.limit,
      current,
      remaining: Math.max(0, config.limit - current),
      retryAfter: Math.max(0, ttl),
    };
  } catch (error) {
    console.error("Rate limit error:", error);
    throw new RedisError("Failed to check rate limit");
  }
}

/**
 * Chat rate limiter.
 */
export async function checkChatRateLimit(userId: string) {
  const result = await checkRateLimit(`chat:${userId}`, RATE_LIMITS.CHAT);

  if (!result.allowed) {
    throw new RateLimitError(RATE_LIMITS.CHAT.message);
  }

  return result;
}

/**
 * Returns today's usage WITHOUT incrementing.
 */
export async function getRateLimitStatus(
  identifier: string,
  config: RateLimitConfig
): Promise<{
  current: number;
  limit: number;
  remaining: number;
  retryAfter: number;
}> {
  try {
    const key = getTodayKey(identifier);

    const current = Number(await redis.get(key)) || 0;
    const ttl = await redis.ttl(key);

    return {
      current,
      limit: config.limit,
      remaining: Math.max(0, config.limit - current),
      retryAfter: Math.max(0, ttl),
    };
  } catch (error) {
    console.error("Failed to fetch rate limit status:", error);
    throw new RedisError("Failed to fetch rate limit status");
  }
}

/**
 * Resets today's limit manually.
 */
export async function resetRateLimit(identifier: string): Promise<void> {
  try {
    const key = getTodayKey(identifier);
    await redis.del(key);
  } catch (error) {
    console.error("Failed to reset rate limit:", error);
    throw new RedisError("Failed to reset rate limit");
  }
}