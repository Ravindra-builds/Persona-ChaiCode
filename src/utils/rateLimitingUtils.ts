import { Redis } from "@upstash/redis";
import { RATE_LIMITS } from "./constants";
import { RateLimitError, RedisError } from "./errorHandler";

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

export async function setCache<T>(
  key: string,
  value: T,
  ttl?: number // seconds
) {
  if (ttl) {
    await redis.set(key, value, { ex: ttl });
  } else {
    await redis.set(key, value);
  }
}

export async function getCache<T>(key: string): Promise<T | null> {
  return await redis.get<T>(key);
}

export async function deleteCache(key: string) {
  await redis.del(key);
}

export interface RateLimitConfig {
  limit: number;
  message: string;
}

/**
 * Generates today's Redis key.
 * Example:
 * ratelimit:chat:user_123:2026-07-09
 */
function getTodayKey(identifier: string): string {
  const today = new Date().toISOString().split("T")[0];
  return `ratelimit:${identifier}:${today}`;
}

/**
 * Seconds remaining until local midnight.
 */
function secondsUntilMidnight(): number {
  const now = new Date();

  const midnight = new Date(now);
  midnight.setHours(24, 0, 0, 0);

  return Math.ceil((midnight.getTime() - now.getTime()) / 1000);
}

/**
 * Internal rate limit checker.
 * Increments today's counter.
 */
async function checkRateLimit(
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
 * Internal status checker.
 * Reads today's counter without incrementing.
 */
async function getRateLimitStatus(
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

/* -------------------------------------------------------------------------- */
/*                               Public Helpers                               */
/* -------------------------------------------------------------------------- */

/**
 * Checks chat rate limit.
 * Increments today's message count.
 */
export async function checkChatRateLimit(userId: string) {
  const result = await checkRateLimit(
    `chat:${userId}`,
    RATE_LIMITS.CHAT
  );

  if (!result.allowed) {
    throw new RateLimitError(RATE_LIMITS.CHAT.message);
  }

  return result;
}

/**
 * Returns current chat usage without incrementing.
 */
export async function getChatRateLimitStatus(userId: string) {
  return getRateLimitStatus(
    `chat:${userId}`,
    RATE_LIMITS.CHAT
  );
}

/**
 * Resets today's chat usage.
 */
export async function resetChatRateLimit(userId: string): Promise<void> {
  try {
    const key = getTodayKey(`chat:${userId}`);
    await redis.del(key);
  } catch (error) {
    console.error("Failed to reset rate limit:", error);
    throw new RedisError("Failed to reset rate limit");
  }
}