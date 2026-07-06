import { Redis } from "@upstash/redis";
import { RATE_LIMITS } from "./constants";
import { RateLimitError, RedisError } from "./errorHandler";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

export interface RateLimitConfig {
  limit: number;
  window: number; 
  message: string;
}

/**
 * Generic rate limiter function
 * @param identifier - Unique identifier for the rate limit (user ID, IP, etc.)
 * @param config - Rate limit configuration
 * @returns true if request is allowed, false if rate limit exceeded
 */
export async function checkRateLimit(
  identifier: string,
  config: RateLimitConfig
): Promise<{ allowed: boolean; remaining: number; resetTime: number }> {
  try {
    const key = `ratelimit:${identifier}`;


    const current = await redis.incr(key);

    if (current === 1) {
      await redis.expire(key, config.window);
    }

    const ttl = await redis.ttl(key);

    const remaining = Math.max(0, config.limit - current);
    const allowed = current <= config.limit;

    return {
      allowed,
      remaining,
      resetTime: ttl > 0 ? ttl : 0,
    };
  } catch (error) {
    console.error("Rate limit check error:", error);
  
    throw new RedisError("Failed to check rate limit");
  }
}

/**
 * Check chat/message rate limit
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
 * Check login rate limit
 */
export async function checkLoginRateLimit(identifier: string) {
  const result = await checkRateLimit(
    `login:${identifier}`,
    RATE_LIMITS.LOGIN
  );

  if (!result.allowed) {
    throw new RateLimitError(RATE_LIMITS.LOGIN.message);
  }

  return result;
}

/**
 * Check OTP rate limit
 */
export async function checkOtpRateLimit(email: string) {
  const result = await checkRateLimit(
    `otp:${email}`,
    RATE_LIMITS.OTP
  );

  if (!result.allowed) {
    throw new RateLimitError(RATE_LIMITS.OTP.message);
  }

  return result;
}

/**
 * Check registration rate limit
 */
export async function checkRegistrationRateLimit(email: string) {
  const result = await checkRateLimit(
    `register:${email}`,
    RATE_LIMITS.REGISTER
  );

  if (!result.allowed) {
    throw new RateLimitError(RATE_LIMITS.REGISTER.message);
  }

  return result;
}

/**
 * Check token refresh rate limit
 */
export async function checkRefreshTokenRateLimit(userId: string) {
  const result = await checkRateLimit(
    `refresh:${userId}`,
    RATE_LIMITS.REFRESH_TOKEN
  );

  if (!result.allowed) {
    throw new RateLimitError(RATE_LIMITS.REFRESH_TOKEN.message);
  }

  return result;
}

/**
 * Reset rate limit for a specific key
 */
export async function resetRateLimit(key: string): Promise<void> {
  try {
    await redis.del(`ratelimit:${key}`);
  } catch (error) {
    console.error("Failed to reset rate limit:", error);
    throw new RedisError("Failed to reset rate limit");
  }
}

/**
 * Get current rate limit status
 */
export async function getRateLimitStatus(
  identifier: string,
  config: RateLimitConfig
): Promise<{ current: number; limit: number; remaining: number }> {
  try {
    const key = `ratelimit:${identifier}`;
    const current = (await redis.get(key)) as number | null;

    return {
      current: current || 0,
      limit: config.limit,
      remaining: Math.max(0, config.limit - (current || 0)),
    };
  } catch (error) {
    console.error("Failed to get rate limit status:", error);
    throw new RedisError("Failed to get rate limit status");
  }
}

export { redis };
