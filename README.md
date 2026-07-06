# MentorOS — Chat with Hitesh & Piyush

A Next.js 16 chat app that lets users talk to two mentor personas:
- **Hitesh** for fundamentals, JavaScript, React, DSA, and career guidance.
- **Piyush** for backend architecture, infra, AWS, scaling, and system design.

The project includes authentication, protected tutor pages, rate limiting, and support for two LLM providers.

---

## Tech Stack

| Layer | Tech |
|---|---|
| Framework | Next.js 16.2.6 (App Router) |
| UI | React 19.2.6 + Tailwind CSS 4 |
| Language | TypeScript |
| Database | PostgreSQL |
| ORM | Drizzle ORM |
| Auth | JWT access + refresh tokens |
| LLM | Google Gemini / OpenAI |
| Cache | Upstash Redis (external) |

---

## What is included

- Landing page with mentor selection
- Protected chat pages for `/hitesh` and `/piyush`
- `AuthContext` for in-memory access token state
- `ThemeContext` with dark/light toggle and SSR-safe hydration
- Chat API route with LLM response generation
- Auth API routes for login, refresh, logout, OTP, and Google OAuth
- Environment validation via `src/config/env.ts`
- Redis-based rate limiting support in `src/utils/rateLimitingUtils.ts`


---

## Local Setup

### Prerequisites

- Node.js 18+ installed
- PostgreSQL available locally or remotely
- `npm` available

### Install

```bash
# 1. Clone the repo
git clone https://github.com/Ravindra-builds/Persona-ChaiCode

cd Persona-ChaiCode

# 2. Install dependencies
npm install
```

### Environment

Copy `.env.example` and fill in the required values:

```bash
cp .env.example .env
```

At minimum, set:

```env
DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:5432/app_db
JWT_SECRET=your-jwt-secret
JWT_REFRESH_SECRET=your-refresh-secret
LLM_PROVIDER=gemini
GEMINI_API_KEY=your-gemini-key
SKIP_AUTH=true
```

Other useful values:

```env
OPENAI_API_KEY=your-openai-key
OPENAI_MODEL=gpt-4.1
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GOOGLE_REDIRECT_URI=http://localhost:3000/api/auth/google/callback
UPSTASH_REDIS_REST_URL=...
UPSTASH_REDIS_REST_TOKEN=...
```

### Run locally

```bash
# 4. Push database schema
npx drizzle-kit push

# 5. Start dev server
npm run dev
```

Then open `http://localhost:3000`.

---

## Scripts

```bash
npm run dev
npm run build
npm run start
npm run lint
npm run typecheck
```

---

## Environment Variables

Required:

- `DATABASE_URL`
- `JWT_SECRET`
- `JWT_REFRESH_SECRET`
- `LLM_PROVIDER` (`gemini` or `openai`)

Optional but recommended:

- `GEMINI_API_KEY`
- `OPENAI_API_KEY`
- `OPENAI_MODEL`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `GOOGLE_REDIRECT_URI`
- `UPSTASH_REDIS_REST_URL`
- `UPSTASH_REDIS_REST_TOKEN`
- `SKIP_AUTH=true` for local testing without login

---

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── auth/
│   │   │   ├── login/route.ts
│   │   │   ├── register/route.ts
│   │   │   ├── otp/verify/route.ts
│   │   │   ├── google/route.ts
│   │   │   ├── google/callback/route.ts
│   │   │   ├── refresh/route.ts
│   │   │   └── logout/route.ts
│   │   ├── chat/route.ts
│   │   └── health/route.ts
│   ├── globals.css
│   ├── layout.tsx
│   ├── page.tsx
│   ├── login/page.tsx
│   ├── hitesh/page.tsx
│   └── piyush/page.tsx
├── components/
│   ├── AuthContext.tsx
│   ├── ChatInterface.tsx
│   ├── ChatMessage.tsx
│   ├── LoginForm.tsx
│   ├── Providers.tsx
│   ├── ThemeContext.tsx
│   └── ThemeToggle.tsx
├── config/
│   └── env.ts
├── db/
│   ├── index.ts
│   └── schema.ts
├── llm/
│   ├── gemini.ts
│   ├── openai.ts
│   └── index.ts
├── lib/
│   ├── auth.ts
│   ├── otp.ts
│   └── tokens.ts
└── utils/
    ├── errorHandler.ts
    ├── rateLimitingUtils.ts
    └── constants.ts
```

---

## Authentication

Supported auth flows:

1. Email/password register and login
2. OTP verification
3. Google OAuth

The app stores:

- Access tokens in React context (`AuthContext`)
- Refresh tokens in HTTP-only cookies

---

## Skipping Auth for Testing

The middleware checks `SKIP_AUTH` env variable. With `SKIP_AUTH=true`:

- All page routes are accessible without login
- Chat API works without auth headers
- Login page still works if you want to test it

To fully remove auth checks: **delete `src/middleware.ts`**.

---

## Switching LLM Providers

By default, the app uses **Gemini** (free tier, good for dev).

To switch to OpenAI for production:

1. Set `LLM_PROVIDER=openai` in `.env`
2. Set `OPENAI_API_KEY=your-key` in `.env`
3. In `src/llm/index.ts`, uncomment the OpenAI lines and comment out the Gemini call

The `generateReply()` function is the single interface — swapping providers doesn't break anything else.

---

## API Endpoints

| Method | Path | Description |
|---|---|---|
| POST | `/api/auth/register` | Register with email/password |
| POST | `/api/auth/login` | Login, get access token + refresh cookie |
| POST | `/api/auth/otp/verify` | Verify email with OTP |
| GET | `/api/auth/google` | Start Google OAuth flow |
| GET | `/api/auth/google/callback` | Google OAuth callback |
| POST | `/api/auth/refresh` | Refresh access token |
| POST | `/api/auth/logout` | Clear refresh cookie |
| POST | `/api/chat` | Send message, get mentor reply |

---

## Mentor Personas

### ☕ Hitesh Choudhary — Chai aur Code

- Warm Hinglish, chai vibes
- **No spoon-feeding** — max 3-5 lines of code, then you continue
- Best for: fundamentals, JS, React, motivation, career

### 🏗️ Piyush Garg — Systems Architect

- Direct, analytical, tech flirt
- Full implementations, Dockerfiles, configs
- Best for: backend, infra, scaling, Docker, AWS, system design

---

## License

MIT
