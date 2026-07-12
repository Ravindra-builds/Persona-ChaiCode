# MentorOS 🚀

> AI mentors inspired by Hitesh Choudhary and Piyush Garg — built with Next.js, OpenAI/Gemini, Clerk, Neon, Drizzle, and Upstash Redis.

🌐 **Live Demo:** https://persona-chaicode.onrender.com/

---

## ✨ Overview

MentorOS is an AI-powered mentoring platform where you can chat with mentors inspired by the publicly observable teaching styles of **Hitesh Choudhary** and **Piyush Garg**.

Each mentor has a unique personality, teaching philosophy, and response style, creating a more natural and engaging learning experience.

---

## ✨ Features

- 🤖 AI mentor personas
  - ☕ **Hitesh** – Fundamentals, JavaScript, React, DSA & Career Guidance
  - 🏗️ **Piyush** – Backend, System Design, Docker, AWS & Production Engineering
- 🎥 AI-driven YouTube recommendations (tool calling)
  - Mentors search their own channel first, cross-recommend from the other mentor's channel when nothing relevant is found
  - Results rendered as rich video cards (thumbnail, title, channel) in chat
- 🔐 Authentication with Clerk
- 🔐 Authentication with Clerk
- 💬 Real-time chat experience
- 🧠 Database-driven system prompts
- ⚡ Redis prompt caching
- 🚦 Daily message rate limiting (12 messages/day)
- 🌙 Light & Dark mode
- 🔒 Protected mentor pages
- 🔄 Switch between Gemini and OpenAI using a single environment variable
- 📱 Responsive UI

---

# 🛠 Tech Stack

| Layer | Technology |
|--------|------------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| UI | React 19 + Tailwind CSS 4 |
| Authentication | Clerk |
| Database | Neon PostgreSQL |
| ORM | Drizzle ORM |
| Cache | Upstash Redis |
| AI Providers | OpenAI / Google Gemini |
| Video Data | YouTube Data API v3 |
| Deployment | Render |

---

# 🏗 Architecture

```text
                User
                  │
                  ▼
          Next.js API Route
                  │
        ┌─────────┴─────────┐
        ▼                   ▼
   Upstash Redis       Neon Database
   (Prompt Cache)     (Mentor Prompts)
        │                   │
        └─────────┬─────────┘
                  ▼
           OpenAI / Gemini
                  │
         ┌────────┴────────┐
         ▼                 ▼
     Text Reply      Tool Call Requested
                            │
                            ▼
                     toolExecutor.ts
                            │
                            ▼
                   YouTube Data API v3
                   (channel-scoped search)
                            │
              ┌─────────────┴─────────────┐
              ▼                           ▼
     Structured video data        Trimmed summary sent
     returned to client            back to model for
     (for video cards)             final text reply
```

---

# 🚀 Getting Started

## 1. Clone the repository

```bash
git clone https://github.com/Ravindra-builds/Persona-ChaiCode.git

cd Persona-ChaiCode
```

---

## 2. Install dependencies

```bash
npm install
```

---

## 3. Configure environment variables

Create a `.env.local` file.

```env
# Clerk

NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/login
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up

NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=/
NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL=/

NEXT_PUBLIC_CLERK_SIGN_IN_FORCE_REDIRECT_URL=/
NEXT_PUBLIC_CLERK_SIGN_UP_FORCE_REDIRECT_URL=/

# AI

OPENAI_API_KEY=
OPENAI_MODEL=gpt-4.1

GEMINI_API_KEY=
GEMINI_MODEL=gemini-2.5-flash

LLM_PROVIDER=openai

# YouTube

YOUTUBE_API_KEY=

# Database

DATABASE_URL=

# Redis

UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
```

---

## 4. Run database migrations

```bash
npx drizzle-kit generate

npx drizzle-kit migrate
```

---

## 5. Start the development server

```bash
npm run dev
```

Open:

```
http://localhost:3000
```

---

# 📂 Project Structure

```text
.
├── src
│   ├── app
│   │   ├── api
│   │   │   ├── chat
│   │   │   ├── health
│   │   │   └── status
│   │   ├── hitesh
│   │   ├── piyush
│   │   ├── login
│   │   ├── sign-up
│   │   ├── layout.tsx
│   │   └── page.tsx
│   │
│   ├── components
│   │   ├── ChatInterface.tsx
│   │   ├── ChatMessage.tsx
│   │   ├── Providers.tsx
│   │   ├── ThemeContext.tsx
│   │   └── ThemeToggle.tsx
│   │
│   ├── config
│   │   └── env.ts
│   │
│   ├── db
│   │   ├── index.ts
│   │   ├── schema.ts
│   │   └── seed.ts
│   │
│   ├── lib
│   │   ├── prompt-service.ts
│   │   └── youtube.ts
│   │
│   ├── llm
│   │   ├── gemini.ts
│   │   ├── openai.ts
│   │   ├── toolExecutor.ts
│   │   ├── tools.ts
│   │   ├── types.ts
│   │   └── index.ts
│   │
│   ├── utils
│   │   ├── constants.ts
│   │   ├── errorHandler.ts
│   │   └── rateLimitingUtils.ts
│   │
│   └── proxy.ts
│
├── public
├── drizzle.config.ts
├── package.json
└── README.md
```

---

# 🤖 Mentor Personas

## ☕ Hitesh Choudhary

- Explains concepts from first principles
- Friendly and conversational
- Encourages learning instead of spoon-feeding
- Strong focus on JavaScript, React, DSA, and career guidance

---

## 🏗 Piyush Garg

- Architecture-first thinking
- Production-ready implementation
- Backend, Docker, AWS, DevOps & System Design
- Focus on scalability, performance, and engineering best practices

---

# 🧠 Prompt Management

Unlike traditional AI chat apps, MentorOS stores mentor system prompts in **Neon PostgreSQL**.

Benefits:

- Update prompts without redeploying
- Version-ready architecture
- Cleaner codebase
- Easier prompt management

Frequently used prompts are cached using **Upstash Redis** to reduce database reads and improve response time.

---

# 🔐 Authentication

Authentication is handled by **Clerk**.

Features include:

- Email & Password
- Google Authentication
- Session Management
- Protected Routes
- User Management

---

# ⚡ Rate Limiting

Every authenticated user gets:

- **12 messages per day**
- Shared across all mentors
- Automatically resets every day
- Powered by Upstash Redis

---

# 🛡️ Security & Abuse Prevention

- Per-message length capped (500 chars) and enforced server-side via Zod, independent of client-side UI limits
- Conversation history capped at 30 messages per request to prevent oversized context windows in a single call
- Message roles restricted to `user`/`assistant` to prevent system-prompt injection via the API
- All API routes require Clerk authentication; unauthenticated requests are rejected
- 12 messages/day per user, enforced server-side via Upstash Redis, independent of anything the client reports
- Errors are logged server-side with full detail; client responses only ever return safe, generic messages (no stack traces or internal errors leaked outside development mode)

---

# 🤖 AI Provider

Switch between providers with a single environment variable.

```env
LLM_PROVIDER=openai
```

or

```env
LLM_PROVIDER=gemini
```

No code changes required.

---

# 🎥 YouTube Tool Calling

Both mentors can search YouTube on the model's own initiative via function calling (OpenAI `tools` / Gemini `functionDeclarations`).

- Search is scoped to each mentor's actual channel ID, not a text-based guess — avoids surfacing videos from unrelated channels.
- If a mentor's own channel has nothing relevant, the other mentor's channel is searched as a fallback, and the response is labeled as a cross-recommendation.
- Video metadata (thumbnail, title, channel) is captured directly from the tool result and returned to the client alongside the reply — it does not depend on the model accurately repeating it in prose.

---

# 🚀 Future Improvements

- Conversation history
- Streaming responses
- More mentor personas
- Prompt versioning
- Admin dashboard for prompt management
- Voice conversations
- Image understanding
- RAG support
- Multi-model comparison mode

---

# 🤝 Contributing

Contributions, issues, and feature requests are welcome.

If you'd like to improve MentorOS, feel free to open an issue or submit a pull request.

---

# 📜 License

MIT License

---

## 👨‍💻 Author

**Ravindra Yadav**

If you found this project helpful, consider giving it a ⭐.