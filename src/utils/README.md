# Utilities Documentation

This folder contains all utility functions for error handling and rate limiting.

## Files Overview

### 1. `constants.ts`

Centralized configuration for rate limits and HTTP status codes.

**Rate Limits:**
- **CHAT:** 12 messages per 24 hours (86400 seconds)
- **LOGIN:** 6 attempts per 1 hour (3600 seconds)
- **OTP:** 5 attempts per 15 minutes (900 seconds)
- **REGISTER:** 3 attempts per 1 hour (3600 seconds)
- **REFRESH_TOKEN:** 10 attempts per 5 minutes (300 seconds)

**HTTP Status Codes:**
Standard HTTP status codes for API responses.

**Error Types:**
Enumeration of all error types used in the application.

### 2. `errorHandler.ts`

Comprehensive error handling system with custom error classes.

**Error Classes:**

- **`AppError`** - Base error class for all application errors
- **`ValidationError`** - Input validation errors (400)
- **`AuthenticationError`** - Auth failures (401)
- **`AuthorizationError`** - Permission denied (403)
- **`NotFoundError`** - Resource not found (404)
- **`RateLimitError`** - Rate limit exceeded (429)
- **`DatabaseError`** - Database operation failed (500)
- **`RedisError`** - Cache operation failed (500)
- **`LLMError`** - LLM API errors (500)
- **`EmailServiceError`** - Email sending failed (500)

**Key Functions:**

```typescript
// Convert any error to AppError
convertToAppError(error: unknown): AppError

// Log errors with context
logError(error: unknown, context: string, level?: "error" | "warn"): void

// Handle API errors and return standardized response
handleApiError(error: unknown, context: string, isDevelopment?: boolean): NextResponse

// Wrap async handler with error handling
withErrorHandling<T, R>(handler: (...args: T) => Promise<Response>, context: string)
```

**Usage Example:**

```typescript
import { 
  handleApiError, 
  ValidationError, 
  AuthenticationError 
} from "@/utils/errorHandler";

export async function POST(req: Request) {
  try {
    // Your logic here
    throw new ValidationError("Invalid email");
  } catch (err) {
    return handleApiError(err, "MyRoute: Context");
  }
}
```

### 3. `rateLimitingUtils.ts`

Redis-based rate limiting for protecting APIs.

**Core Function:**

```typescript
checkRateLimit(identifier: string, config: RateLimitConfig): Promise<{
  allowed: boolean;
  remaining: number;
  resetTime: number;
}>
```

**Convenience Functions:**

```typescript
// Check chat message rate limit
checkChatRateLimit(userId: string)

// Check login attempts rate limit
checkLoginRateLimit(identifier: string)

// Check OTP verification rate limit
checkOtpRateLimit(email: string)

// Check registration rate limit
checkRegistrationRateLimit(email: string)

// Check token refresh rate limit
checkRefreshTokenRateLimit(userId: string)

// Reset a specific rate limit
resetRateLimit(key: string): Promise<void>

// Get current rate limit status
getRateLimitStatus(identifier: string, config: RateLimitConfig)
```

**Usage Example:**

```typescript
import { checkChatRateLimit, checkLoginRateLimit } from "@/utils/rateLimitingUtils";
import { RateLimitError } from "@/utils/errorHandler";

export async function POST(req: Request) {
  try {
    // Check rate limit
    await checkChatRateLimit(userId);
    
    // If limit exceeded, error is thrown and caught below
    // Otherwise, proceed with request
    
  } catch (err) {
    if (err instanceof RateLimitError) {
      return handleApiError(err, "Context: Rate limited");
    }
  }
}
```

## Integration with API Routes

All API routes have been updated to use the error handling and rate limiting utilities:

### Authentication Routes

**`/api/auth/login`**
- Rate limit: 6 attempts/hour
- Returns 401 for invalid credentials
- Returns 403 for unverified emails
- Returns 429 for rate limit exceeded

**`/api/auth/register`**
- Rate limit: 3 attempts/hour
- Returns 409 for existing users
- Sends OTP on success
- Returns 500 if email service fails

**`/api/auth/otp/verify`**
- Rate limit: 5 attempts/15 minutes
- Returns 404 if user not found
- Returns 400 if OTP invalid
- Returns 200 on success

**`/api/auth/refresh`**
- Rate limit: 10 attempts/5 minutes
- Returns 401 for missing/invalid token
- Returns 404 if user not found
- Returns 200 with new access token

### Chat Route

**`/api/chat`**
- Rate limit: 12 messages/24 hours
- Returns 400 for invalid schema
- Returns 429 for rate limit exceeded
- Returns 500 for LLM failures

## Error Response Format

All errors return standardized JSON:

```json
{
  "success": false,
  "error": "Error message",
  "type": "ERROR_TYPE",
  "details": {} // Optional - for validation errors
}
```

**Development Mode:**
Includes `stack` property for debugging.

**Production Mode:**
Stack trace removed for security.

## Redis Keys Format

Rate limit keys in Redis:

```
ratelimit:chat:{userId}
ratelimit:login:{email}
ratelimit:otp:{email}
ratelimit:register:{email}
ratelimit:refresh:{userId}
```

Each key expires automatically based on the configured window.

## Best Practices

1. **Always use error classes:**
   ```typescript
   throw new ValidationError("Invalid input", details);
   ```

2. **Provide context for logging:**
   ```typescript
   handleApiError(error, "ChatRoute: LLM failure");
   ```

3. **Check rate limits early:**
   ```typescript
   // Check rate limit before expensive operations
   await checkChatRateLimit(userId);
   const response = await expensiveOperation();
   ```

4. **Handle specific errors:**
   ```typescript
   catch (err) {
     if (err instanceof RateLimitError) {
       // Handle rate limit
     } else if (err instanceof ValidationError) {
       // Handle validation
     } else {
       // Handle other errors
     }
   }
   ```

5. **Reset limits on success:**
   ```typescript
   // After successful login, reset the rate limit
   await resetRateLimit(`login:${email}`);
   ```

## Testing Rate Limits

```bash
# Test chat rate limit - send 12 requests, 13th should fail
for i in {1..13}; do
  curl -X POST http://localhost:3000/api/chat \
    -H "Content-Type: application/json" \
    -d '{"userId":"test","mentor":"hitesh","messages":[{"role":"user","content":"Hello"}]}'
done

# Test login rate limit - send 6 requests, 7th should fail
for i in {1..7}; do
  curl -X POST http://localhost:3000/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"test@example.com","password":"password"}'
done
```

## Troubleshooting

**Rate limit not working:**
1. Check Redis connection: Verify `UPSTASH_REDIS_REST_URL` and token
2. Check rate limit key in Redis: `redis-cli get ratelimit:chat:{userId}`
3. Check rate limit config: Verify constants in `constants.ts`

**Errors not being logged:**
1. Check Node environment: Should be "development" or "production"
2. Check console configuration: Ensure stdout is not redirected
3. Add explicit logging: Use `logError()` function directly

**Wrong status code returned:**
1. Check error class hierarchy: Verify correct error class is thrown
2. Check HTTP status codes: Review in `constants.ts`
3. Test with curl: Verify response code matches expectation

---

**Last Updated:** 2024
**Version:** 1.0.0
