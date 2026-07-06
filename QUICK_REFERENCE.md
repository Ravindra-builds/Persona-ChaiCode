# Quick Reference Guide

## API Endpoints

### Authentication

#### Login
```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}

Response:
{
  "success": true,
  "accessToken": "token...",
  "user": {
    "id": "user_id",
    "name": "User Name",
    "email": "user@example.com",
    "verified": true
  }
}
```

**Rate Limit:** 6 attempts/hour per email
**Success Response:** 200
**Rate Limit Error:** 429
**Auth Error:** 401
**Unverified Email:** 403

#### Register
```bash
POST /api/auth/register
Content-Type: application/json

{
  "name": "User Name",
  "email": "user@example.com",
  "password": "password123"
}

Response:
{
  "success": true,
  "message": "Account created. Check your inbox for the OTP.",
  "userId": "user_id"
}
```

**Rate Limit:** 3 attempts/hour per email
**Success Response:** 200
**Duplicate User:** 409
**Validation Error:** 400
**Email Service Error:** 500

#### Verify OTP
```bash
POST /api/auth/otp/verify
Content-Type: application/json

{
  "email": "user@example.com",
  "code": "123456"
}

Response:
{
  "success": true,
  "message": "Email verified successfully"
}
```

**Rate Limit:** 5 attempts/15 minutes per email
**Success Response:** 200
**Invalid OTP:** 400
**Rate Limit Error:** 429
**User Not Found:** 404

#### Refresh Token
```bash
POST /api/auth/refresh
Cookie: refreshToken=...

Response:
{
  "success": true,
  "accessToken": "new_token...",
  "user": {
    "id": "user_id",
    "name": "User Name",
    "email": "user@example.com",
    "verified": true
  }
}
```

**Rate Limit:** 10 attempts/5 minutes per user
**Success Response:** 200
**Missing Token:** 401
**Invalid Token:** 401
**Rate Limit Error:** 429

#### Logout
```bash
POST /api/auth/logout

Response:
{
  "success": true,
  "message": "Logged out"
}
```

### Chat

#### Send Message
```bash
POST /api/chat
Content-Type: application/json
Authorization: Bearer <access_token>

{
  "mentor": "hitesh",
  "messages": [
    {
      "role": "user",
      "content": "Hello, teach me about React"
    }
  ],
  "userId": "user_id"  // Optional
}

Response:
{
  "success": true,
  "reply": "Here's what you need to know about React..."
}
```

**Available Mentors:** "hitesh", "piyush"
**Rate Limit:** 12 messages/24 hours per user
**Success Response:** 200
**Rate Limit Error:** 429
**LLM Error:** 500
**Validation Error:** 400

### Health Check

#### Check API Health
```bash
GET /api/health

Response:
{
  "ok": true
}
```

**Success Response:** 200
**Database Down:** 500

---

## Rate Limiting

### Current Limits

| Endpoint | Limit | Window |
|----------|-------|--------|
| Chat | 12 messages | 24 hours |
| Login | 6 attempts | 1 hour |
| OTP Verify | 5 attempts | 15 minutes |
| Register | 3 attempts | 1 hour |
| Refresh Token | 10 attempts | 5 minutes |

### Rate Limit Error Response

```json
{
  "success": false,
  "error": "You have reached your daily message limit (12 messages per 24 hours). Please try again tomorrow.",
  "type": "RATE_LIMIT_ERROR"
}
```

**HTTP Status:** 429 Too Many Requests

---

## Error Responses

### Validation Error (400)
```json
{
  "success": false,
  "error": "Validation failed",
  "type": "VALIDATION_ERROR",
  "details": {
    "email": ["Invalid email format"]
  }
}
```

### Authentication Error (401)
```json
{
  "success": false,
  "error": "Invalid email or password.",
  "type": "AUTHENTICATION_ERROR"
}
```

### Authorization Error (403)
```json
{
  "success": false,
  "error": "Please verify your email before logging in.",
  "type": "AUTHORIZATION_ERROR"
}
```

### Not Found Error (404)
```json
{
  "success": false,
  "error": "User not found",
  "type": "NOT_FOUND_ERROR"
}
```

### Rate Limit Error (429)
```json
{
  "success": false,
  "error": "Too many requests message",
  "type": "RATE_LIMIT_ERROR"
}
```

### Server Error (500)
```json
{
  "success": false,
  "error": "Internal server error occurred",
  "type": "INTERNAL_SERVER_ERROR"
}
```

---

## Local Development

### Install Dependencies
```bash
npm install
```

### Run Development Server
```bash
npm run dev
```

Access at: `http://localhost:3000`

### Type Check
```bash
npm run typecheck
```

### Build for Production
```bash
npm run build
npm start
```

### Run with Docker Locally
```bash
# Build image
docker build -t dual-mentor-system:latest .

# Run with Docker Compose
docker-compose up -d

# View logs
docker-compose logs -f app

# Stop
docker-compose down
```

---

## Deployment to Render

### 1. Push to GitHub
```bash
git add .
git commit -m "Add rate limiting, error handling, and Docker"
git push origin main
```

### 2. Create Render Service
- Go to https://dashboard.render.com
- Click "New +" → "Web Service"
- Connect GitHub repository
- Select `dual-mentor-system-prompt`

### 3. Configure Settings
- **Name:** `dual-mentor-system`
- **Environment:** Docker
- **Branch:** main
- **Dockerfile path:** `./Dockerfile`

### 4. Add Environment Variables
In Render dashboard → Environment tab, add:
```
DATABASE_URL=postgresql://...
UPSTASH_REDIS_REST_URL=https://...
UPSTASH_REDIS_REST_TOKEN=...
JWT_SECRET=<random-secure-string>
JWT_REFRESH_SECRET=<random-secure-string>
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GOOGLE_CALLBACK_URL=https://your-render-url.onrender.com/api/auth/google/callback
EMAIL_USER=...
EMAIL_PASSWORD=...
OPENAI_API_KEY=...
GOOGLE_GENERATIVE_AI_KEY=...
NODE_ENV=production
```

### 5. Deploy
Click "Create Web Service" and wait for deployment.

---

## Testing Rate Limits

### Test Chat Rate Limit (12 per 24 hours)
```bash
#!/bin/bash
USER_ID="test_user_123"

# Send 12 requests (should succeed)
for i in {1..12}; do
  echo "Request $i:"
  curl -X POST http://localhost:3000/api/chat \
    -H "Content-Type: application/json" \
    -d "{
      \"userId\": \"$USER_ID\",
      \"mentor\": \"hitesh\",
      \"messages\": [{
        \"role\": \"user\",
        \"content\": \"Hello mentor\"
      }]
    }"
  echo ""
done

# 13th request should fail with 429
echo "Request 13 (should fail):"
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d "{
    \"userId\": \"$USER_ID\",
    \"mentor\": \"hitesh\",
    \"messages\": [{
      \"role\": \"user\",
      \"content\": \"Hello mentor\"
    }]
  }"
```

### Test Login Rate Limit (6 per hour)
```bash
#!/bin/bash
EMAIL="test@example.com"

# Send 6 requests (should succeed)
for i in {1..6}; do
  echo "Login attempt $i:"
  curl -X POST http://localhost:3000/api/auth/login \
    -H "Content-Type: application/json" \
    -d "{
      \"email\": \"$EMAIL\",
      \"password\": \"wrongpassword\"
    }"
  echo ""
done

# 7th request should fail with 429
echo "Login attempt 7 (should fail with rate limit):"
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$EMAIL\",
    \"password\": \"wrongpassword\"
  }"
```

---

## Troubleshooting

### Rate Limit Not Working

**Check Redis Connection:**
```bash
# Test Redis from Node
node -e "
const { Redis } = require('@upstash/redis');
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});
redis.set('test', '1').then(() => console.log('Redis OK'));
"
```

**Check Rate Limit Key in Redis:**
```
Key format: ratelimit:{type}:{identifier}
Examples:
- ratelimit:chat:user123
- ratelimit:login:user@email.com
- ratelimit:otp:user@email.com
```

### LLM Errors

Check API keys:
- `OPENAI_API_KEY` - Valid and has quota
- `GOOGLE_GENERATIVE_AI_KEY` - Valid and has quota

### Database Errors

Test database connection:
```bash
curl http://localhost:3000/api/health
```

Should return `{"ok": true}` if database is connected.

### Email Service Errors

Test email configuration:
- Verify `EMAIL_USER` and `EMAIL_PASSWORD` are correct
- Check email service provider settings
- Verify `EMAIL_FROM` is properly formatted

---

## Files Reference

| File | Purpose |
|------|---------|
| `src/utils/constants.ts` | Rate limit configs |
| `src/utils/errorHandler.ts` | Error classes and handlers |
| `src/utils/rateLimitingUtils.ts` | Rate limiting functions |
| `Dockerfile` | Production Docker build |
| `docker-compose.yml` | Local development Docker |
| `DEPLOYMENT.md` | Complete deployment guide |
| `IMPLEMENTATION_SUMMARY.md` | Implementation details |

---

**Version:** 1.0.0
**Last Updated:** 2024
