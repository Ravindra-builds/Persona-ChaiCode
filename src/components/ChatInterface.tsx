"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { ChatMessage } from "./ChatMessage";
import { ThemeToggle } from "./ThemeToggle";

interface ChatVideo {
  title: string;
  url: string;
  thumbnail?: string;
  channelTitle?: string;
}

interface Message {
  role: "user" | "assistant";
  content: string;
  videos?: ChatVideo[];
  channelTitle?: string;
  profileImage?: string;
  sourceMentor?: "hitesh" | "piyush";
}

interface ChatInterfaceProps {
  mentor: "hitesh" | "piyush";
}

const MAX_MESSAGE_LENGTH = 500;

const MENTOR_CONFIG = {
  hitesh: {
    name: "Hitesh",
    subtitle: "Chai aur Code",
    tagline: "Fundamentals first.",
    placeholder: "Ask Hitesh...",
    emptyTitle: "Start with the stuck point.",
    emptyText: "JS, React, DSA, projects, career.",
    avatar: "/asset/hitesh-sir.jpg",
    header:
      "border-[#d6b36a]/25 bg-[#fbfaf7]/85 dark:border-[#d6b36a]/20 dark:bg-[#11100d]/85",
    markClass: "bg-[#d6b36a] text-slate-950",
    inputFocus: "focus:ring-[#d6b36a]/50",
    button:
      "bg-slate-950 hover:bg-slate-800 focus:ring-[#d6b36a]/50 dark:bg-stone-50 dark:text-slate-950 dark:hover:bg-stone-200",
  },
  piyush: {
    name: "Piyush",
    subtitle: "Systems Architect",
    tagline: "Ship the solid version.",
    placeholder: "Ask Piyush...",
    emptyTitle: "Bring the system.",
    emptyText: "Backend, infra, AWS, Docker, scale.",
    avatar: "/asset/piyush-sir.jpg",
    header:
      "border-slate-950/10 bg-[#fbfaf7]/85 dark:border-white/10 dark:bg-[#0a0a0a]/85",
    markClass: "bg-slate-950 text-white dark:bg-stone-50 dark:text-slate-950",
    inputFocus: "focus:ring-slate-400/60",
    button:
      "bg-slate-950 hover:bg-slate-800 focus:ring-slate-400/60 dark:bg-stone-50 dark:text-slate-950 dark:hover:bg-stone-200",
  },
};

function getErrorMessage(data: unknown, fallback: string) {
  if (data && typeof data === "object" && "error" in data) {
    const error = (data as { error: unknown }).error;
    return typeof error === "string" ? error : JSON.stringify(error);
  }
  return fallback;
}

export function ChatInterface({ mentor }: ChatInterfaceProps) {
  const cfg = MENTOR_CONFIG[mentor];
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const remainingChars = MAX_MESSAGE_LENGTH - input.length;
  const [loading, setLoading] = useState(false);

  const [rateLimit, setRateLimit] = useState<{
    current: number;
    limit: number;
    remaining: number;
  } | null>(null);
  const { isSignedIn } = useAuth();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, loading]);

  useEffect(() => {
    if (isSignedIn) {
      fetchRateLimit();
    }
  }, [isSignedIn]);

  async function fetchRateLimit() {
    try {
      const res = await fetch("/api/chat/status");

      if (!res.ok) return;

      const data = await res.json();

      setRateLimit(data);
    } catch (err) {
      console.error("Failed to fetch rate limit:", err);
    }
  }

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || loading || text.length > MAX_MESSAGE_LENGTH) return;

    const userMsg: Message = { role: "user", content: text };
    const updated = [...messages, userMsg];
    setMessages(updated);
    setInput("");
    setLoading(true);

    try {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      // Clerk handles auth automatically via middleware

      const res = await fetch("/api/chat", {
        method: "POST",
        headers,
        body: JSON.stringify({
          mentor,
          messages: updated.map(({ role, content }) => ({ role, content })),
        }),
      });

      const data = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(getErrorMessage(data, "Failed to generate response"));
      }

      if (data?.reply) {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: data.reply,
            videos: data.youtube?.videos,
            channelTitle: data.youtube?.channelTitle,
            profileImage: data.youtube?.profileImage,
            sourceMentor: data.youtube?.sourceMentor,
          },
        ]);

        await fetchRateLimit();
      } else {
        throw new Error("The mentor returned an empty response.");
      }
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Network error. Check your connection.";
      setMessages((prev) => [...prev, { role: "assistant", content: message }]);
    } finally {
      setLoading(false);
    }
  };

  const badgeColor = !rateLimit
    ? ""
    : rateLimit.remaining <= 2
      ? "border-red-200 bg-red-50 text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300"
      : rateLimit.remaining <= 5
        ? "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-300"
        : "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300";

  return (
    <div className="mesh-bg flex h-screen flex-col text-slate-950 dark:text-stone-50">
      <header className={`border-b px-4 py-3 backdrop-blur-xl ${cfg.header}`}>
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-3">
            <Link
              href="/"
              className="rounded-md border border-slate-950/10 bg-white/45 px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-white dark:border-white/10 dark:bg-white/5 dark:text-stone-300 dark:hover:bg-white/10"
            >
              Back
            </Link>
            <img
              src={cfg.avatar}
              alt={cfg.name}
              className="h-10 w-10 shrink-0 rounded-md object-cover shadow-lg shadow-slate-900/10"
            />
            <div className="min-w-0">
              <h1 className="truncate text-lg font-semibold leading-tight">
                {cfg.name}
              </h1>

              <p className="truncate text-xs font-semibold uppercase tracking-[0.22em] text-slate-500 dark:text-stone-500">
                {cfg.subtitle}
              </p>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-3">
            <span className="hidden text-sm text-slate-500 dark:text-stone-400 md:block">
              {cfg.tagline}
            </span>
            <div className="flex shrink-0 items-center gap-2">
              {rateLimit && (
                <div className="flex shrink-0 items-center gap-3">
                  {rateLimit && (
                    <div
                      className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium shadow-sm transition-colors ${badgeColor}`}
                    >
                      <span
                        className={`h-2 w-2 rounded-full ${
                          rateLimit.remaining <= 2
                            ? "bg-red-500"
                            : rateLimit.remaining <= 5
                              ? "bg-amber-500"
                              : "bg-emerald-500"
                        }`}
                      />

                      {/* Mobile */}
                      <span className="sm:hidden">
                        {rateLimit.remaining}/{rateLimit.limit} msg
                      </span>

                      {/* Tablet */}
                      <span className="hidden sm:inline lg:hidden">
                        {rateLimit.remaining} left
                      </span>

                      {/* Desktop */}
                      <span className="hidden lg:inline">
                        {rateLimit.remaining} of {rateLimit.limit} messages left
                        today
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-6">
        <div className="mx-auto max-w-4xl">
          {messages.length === 0 && (
            <div className="flex min-h-[58vh] flex-col items-center justify-center text-center">
              <img
                src={cfg.avatar}
                alt={cfg.name}
                className="mb-5 h-20 w-20 rounded-lg object-cover shadow-2xl shadow-slate-900/15"
              />
              <h2 className="text-3xl font-semibold tracking-tight text-slate-950 dark:text-stone-50">
                {cfg.emptyTitle}
              </h2>
              <p className="mt-3 max-w-xl text-sm leading-6 text-slate-500 dark:text-stone-400">
                {cfg.emptyText}
              </p>
            </div>
          )}

          {messages.map((msg, i) => (
            <ChatMessage
              key={`${msg.role}-${i}`}
              role={msg.role}
              content={msg.content}
              mentor={mentor}
              profileImage={cfg.avatar}
              videos={msg.videos}
              channelTitle={msg.channelTitle}
              sourceMentor={msg.sourceMentor}
            />
          ))}

          {loading && (
            <div className="mb-4 flex justify-start">
              <div className="rounded-lg border border-slate-950/10 bg-white/80 px-4 py-3 shadow-sm backdrop-blur dark:border-white/10 dark:bg-white/5">
                <div className="flex gap-1.5">
                  <span
                    className="h-2 w-2 animate-bounce rounded-full bg-[#d6b36a]"
                    style={{ animationDelay: "0ms" }}
                  />
                  <span
                    className="h-2 w-2 animate-bounce rounded-full bg-[#d6b36a]"
                    style={{ animationDelay: "150ms" }}
                  />
                  <span
                    className="h-2 w-2 animate-bounce rounded-full bg-[#d6b36a]"
                    style={{ animationDelay: "300ms" }}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="border-t border-slate-950/10 bg-[#fbfaf7]/88 px-4 py-4 backdrop-blur-xl dark:border-white/10 dark:bg-[#090909]/88">
        {" "}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            sendMessage();
          }}
          className="mx-auto flex max-w-4xl gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) =>
              setInput(e.target.value.slice(0, MAX_MESSAGE_LENGTH))
            }
            placeholder={cfg.placeholder}
            className={`glass-input min-w-0 flex-1 rounded-md px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 dark:text-stone-100 dark:placeholder:text-stone-600 ${cfg.inputFocus}`}
            disabled={loading}
            maxLength={MAX_MESSAGE_LENGTH}
            
          />
          
          <button
            type="submit"
            disabled={
              loading || !input.trim() || input.length > MAX_MESSAGE_LENGTH
            }
            className={`rounded-md px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-slate-900/10 transition focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-40 dark:focus:ring-offset-slate-950 ${cfg.button}`}
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
}
