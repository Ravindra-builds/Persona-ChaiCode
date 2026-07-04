# DualMentor — Chat with Hitesh & Piyush

Two mentors. One app. Learn **fundamentals** with Hitesh Choudhary or architect **systems** with Piyush Garg.

---

## Tech Stack

| Layer | Tech |
|---|---|
| Framework | Next.js 16 (App Router) |
| Styling | Tailwind CSS 4 |
| Language | TypeScript |
| Database | PostgreSQL |
| ORM | Drizzle ORM |
| Auth | JWT (access + refresh tokens) |
| LLM (dev) | Google Gemini |
| LLM (prod) | OpenAI |

---

## Local Setup

### Prerequisites

- **Node.js** 18+ installed
- **PostgreSQL** running locally (or use Docker)
- A **Gemini API key** (free tier works) — [get one here](https://aistudio.google.com/apikey)

### Step-by-step

```bash
# 1. Clone the repo
git clone <your-repo-url>
cd dualmentor

# 2. Install dependencies
npm install

# 3. Copy environment file and fill in your values
cp .env.example .env
```

Edit `.env` — at minimum, set these:

```env
DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:5432/app_db
GEMINI_API_KEY=your-actual-gemini-key
SKIP_AUTH=true    # keeps auth off while testing
```

```bash
# 4. Push database schema
npx drizzle-kit push

# 5. Start dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Project Structure

```
src/
├── config/
│   └── env.ts              # All env vars loaded & validated here
├── db/
│   ├── index.ts            # Drizzle client
│   └── schema.ts           # Users & OTPs tables
├── lib/
│   ├── auth.ts             # User CRUD, password hashing
│   ├── tokens.ts           # JWT generation & verification
│   └── otp.ts              # OTP generation & verification
├── llm/
│   ├── gemini.ts           # Gemini client (default/dev)
│   ├── openai.ts           # OpenAI client (production)
│   └── index.ts            # generateReply() — switches between providers
├── components/
│   ├── AuthContext.tsx      # In-memory access token state
│   ├── ThemeContext.tsx     # Light/dark theme toggle
│   ├── Providers.tsx       # Wraps both contexts
│   ├── ChatInterface.tsx   # Shared chat UI (both mentors)
│   ├── ChatMessage.tsx     # Single message bubble
│   ├── LoginForm.tsx       # Login / Register / OTP form
│   └── ThemeToggle.tsx     # Toggle switch
├── app/
│   ├── layout.tsx          # Root layout with Providers
│   ├── page.tsx            # Landing page with mentor cards
│   ├── globals.css         # Tailwind + custom styles
│   ├── login/page.tsx      # Auth page
│   ├── hitesh/page.tsx     # Hitesh chat
│   ├── piyush/page.tsx     # Piyush chat
│   └── api/
│       ├── auth/
│       │   ├── register/route.ts
│       │   ├── login/route.ts
│       │   ├── otp/verify/route.ts
│       │   ├── google/route.ts
│       │   ├── google/callback/route.ts
│       │   ├── refresh/route.ts
│       │   └── logout/route.ts
│       ├── chat/route.ts   # Main chat endpoint
│       └── health/route.ts
└── middleware.ts           # Auth guard (can be removed for testing)
```

---

## Authentication

Three methods supported:

1. **Email/Password** — Register → OTP verify → Login
2. **OTP Verification** — 6-digit code logged to console in dev
3. **Google OAuth** — Requires Google Cloud setup (client ID + secret)

### Token Strategy

| Token | Storage | Lifetime |
|---|---|---|
| Access Token | In-memory (React context) | 15 minutes |
| Refresh Token | HTTP-only cookie | 7 days |

**No tokens in localStorage.** Access token lives in `AuthContext`. Refresh token is an HTTP-only cookie set by the server.

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
