# Production Deployment Guide

This guide explains how to deploy the Dual Mentor System to Render using Docker.

## Prerequisites

- Docker installed locally
- Docker Hub account (or any container registry)
- Render account
- Neon PostgreSQL database (already configured)
- Upstash Redis instance
- Environment variables ready

## Environment Setup

### 1. Create `.env.production` file

Copy `.env.production.example` and fill in all required environment variables:

```bash
cp .env.production.example .env.production
```

Required variables:
- `DATABASE_URL` - Neon PostgreSQL connection string
- `UPSTASH_REDIS_REST_URL` - Upstash Redis REST URL
- `UPSTASH_REDIS_REST_TOKEN` - Upstash Redis token
- `JWT_SECRET` - Generate a secure random string
- `JWT_REFRESH_SECRET` - Generate a secure random string
- `GOOGLE_CLIENT_ID` - From Google OAuth
- `GOOGLE_CLIENT_SECRET` - From Google OAuth
- `GOOGLE_CALLBACK_URL` - Your production domain + `/api/auth/google/callback`
- `EMAIL_USER` - Email service username
- `EMAIL_PASSWORD` - Email service password
- `OPENAI_API_KEY` - OpenAI API key
- `GOOGLE_GENERATIVE_AI_KEY` - Google Generative AI key

### 2. Generate Secure Secrets

```bash
# Generate JWT secrets
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Local Testing with Docker

### 1. Build Docker Image

```bash
docker build -t dual-mentor-system:latest .
```

### 2. Run with Docker Compose

```bash
# Load environment variables
docker-compose up -d
```

### 3. Verify Application

```bash
# Check health
curl http://localhost:3000/api/health

# View logs
docker-compose logs -f app
```

## Deploy to Render

### 1. Connect GitHub Repository

1. Push your code to GitHub
2. Go to [Render Dashboard](https://dashboard.render.com)
3. Click "New +" → "Web Service"
4. Connect your GitHub repository

### 2. Configure Web Service

**Settings:**
- **Name:** `dual-mentor-system`
- **Environment:** Docker
- **Region:** Choose based on your users' location
- **Branch:** `main` (or your deployment branch)

**Build Settings:**
- **Dockerfile path:** `./Dockerfile`
- **Build context:** Leave empty

### 3. Set Environment Variables

In Render dashboard, go to **Environment** tab and add all variables from `.env.production`:

```
DATABASE_URL=postgresql://...
UPSTASH_REDIS_REST_URL=https://...
UPSTASH_REDIS_REST_TOKEN=...
JWT_SECRET=...
JWT_REFRESH_SECRET=...
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GOOGLE_CALLBACK_URL=https://your-render-url.onrender.com/api/auth/google/callback
EMAIL_USER=...
EMAIL_PASSWORD=...
OPENAI_API_KEY=...
GOOGLE_GENERATIVE_AI_KEY=...
NODE_ENV=production
```

### 4. Deploy

Click "Create Web Service" and wait for deployment to complete.

## Rate Limiting Configuration

The application includes comprehensive rate limiting:

- **Chat/Messages:** 12 messages per 24 hours per user
- **Login:** 6 attempts per hour per user  
- **OTP Verification:** 5 attempts per 15 minutes per email
- **Registration:** 3 attempts per hour per email
- **Token Refresh:** 10 attempts per 5 minutes per user

Rate limits are enforced via Redis and will return HTTP 429 (Too Many Requests) when exceeded.

## Error Handling

The application includes comprehensive error handling:

- **Validation Errors** (400) - Invalid input data
- **Authentication Errors** (401) - Login/token issues
- **Authorization Errors** (403) - Email not verified
- **Not Found Errors** (404) - Resource not found
- **Rate Limit Errors** (429) - Too many requests
- **Server Errors** (500) - Internal server errors

All errors return standardized JSON responses:

```json
{
  "success": false,
  "error": "Error message",
  "type": "ERROR_TYPE",
  "details": {} // Optional validation details
}
```

## Monitoring

### Health Check Endpoint

```bash
GET /api/health
```

Returns 200 if database is accessible.

### Logs

View logs in Render dashboard or via CLI:

```bash
render logs --service dual-mentor-system
```

### Common Issues

**Issue:** Database connection timeout
- **Solution:** Verify `DATABASE_URL` is correct and Neon is accessible

**Issue:** Redis errors
- **Solution:** Check `UPSTASH_REDIS_REST_URL` and token are valid

**Issue:** Rate limit errors
- **Solution:** Normal behavior after limit exceeded. Wait for window to reset.

**Issue:** LLM errors
- **Solution:** Verify API keys are valid and have sufficient quota

## Database Management

### Run Migrations

Migrations run automatically on deployment, but you can also run manually:

```bash
npm run build
npm start
```

### Access Database

Use Neon's dashboard to manage your database:
https://console.neon.tech

## Scaling

**Render Free Tier Limits:**
- 750 hours/month of service time
- 100 GB bandwidth/month
- Spin down after 15 min of inactivity

**For Production:**
- Upgrade to Paid tier
- Enable auto-scaling
- Set up monitoring alerts

## Troubleshooting

### View Deployment Logs

```bash
# In Render dashboard, check the "Logs" tab for:
- Build logs
- Runtime logs
- Deployment errors
```

### Test API Endpoints

```bash
# Test health endpoint
curl https://your-app.onrender.com/api/health

# Test login (with valid credentials)
curl -X POST https://your-app.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

### Debug Rate Limiting

Rate limit key format in Redis:
- `ratelimit:chat:{userId}` - Chat messages
- `ratelimit:login:{email}` - Login attempts
- `ratelimit:otp:{email}` - OTP attempts
- `ratelimit:register:{email}` - Registration attempts
- `ratelimit:refresh:{userId}` - Token refresh

### Performance Optimization

1. **Enable Caching:** Results are cached via Upstash Redis
2. **Use CDN:** Render provides automatic CDN for static assets
3. **Monitor Response Times:** Check Render dashboard metrics
4. **Optimize Database Queries:** Use Neon's monitoring tools

## Security Best Practices

1. **Secrets Management:**
   - Never commit `.env` files
   - Use Render's environment variables
   - Rotate secrets regularly

2. **Database Security:**
   - Use strong passwords
   - Enable SSL connections (done by default on Neon)
   - Restrict IP access if possible

3. **API Security:**
   - Rate limiting prevents abuse
   - Input validation prevents injection attacks
   - CORS is configured in Next.js

4. **Email Security:**
   - Use app-specific passwords for email services
   - Never commit email credentials

## Rollback

If deployment fails:

1. Go to Render dashboard
2. Click on your service
3. Go to "Deploy" tab
4. Click on previous successful deployment
5. Click "Redeploy"

## Support

- **Render Documentation:** https://render.com/docs
- **Neon Documentation:** https://neon.tech/docs
- **Upstash Documentation:** https://upstash.com/docs
- **Next.js Documentation:** https://nextjs.org/docs

---

**Last Updated:** 2024
**Version:** 1.0.0
