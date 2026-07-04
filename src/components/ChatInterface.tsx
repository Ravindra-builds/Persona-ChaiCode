"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "./AuthContext";
import { ChatMessage } from "./ChatMessage";
import { ThemeToggle } from "./ThemeToggle";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface ChatInterfaceProps {
  mentor: "hitesh" | "piyush";
}

const MENTOR_CONFIG = {
  hitesh: {
    mark: "C",
    name: "Chai aur Code",
    subtitle: "Hitesh Choudhary",
    tagline: "No spoon-feeding, only real learning.",
    placeholder: "Apna sawaal likho bhai... chai ke saath samajhte hain",
    emptyTitle: "Chai pe charcha karein?",
    emptyText: "Ask about JavaScript, React, DSA, projects, career, or debugging fundamentals.",
    header: "border-amber-200 bg-amber-50/90 dark:border-amber-500/20 dark:bg-amber-500/10",
    markClass: "bg-amber-600 text-white",
    inputFocus: "focus:ring-amber-500",
    button: "bg-amber-600 hover:bg-amber-700 focus:ring-amber-500",
  },
  piyush: {
    mark: "S",
    name: "Systems Architect",
    subtitle: "Piyush Garg",
    tagline: "Production-grade, scalable, brutally honest.",
    placeholder: "Describe your system, infra issue, backend bug, or scaling problem",
    emptyTitle: "Let's architect something solid.",
    emptyText: "Bring a backend, Docker, AWS, database, or system design problem.",
    header: "border-sky-200 bg-sky-50/90 dark:border-sky-500/20 dark:bg-sky-500/10",
    markClass: "bg-sky-600 text-white",
    inputFocus: "focus:ring-sky-500",
    button: "bg-sky-600 hover:bg-sky-700 focus:ring-sky-500",
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
  const [loading, setLoading] = useState(false);
  const { accessToken } = useAuth();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || loading) return;

    const userMsg: Message = { role: "user", content: text };
    const updated = [...messages, userMsg];
    setMessages(updated);
    setInput("");
    setLoading(true);

    try {
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (accessToken) headers.Authorization = `Bearer ${accessToken}`;

      const res = await fetch("/api/chat", {
        method: "POST",
        headers,
        body: JSON.stringify({ mentor, messages: updated }),
      });

      const data = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(getErrorMessage(data, "Failed to generate response"));
      }

      if (data?.reply) {
        setMessages((prev) => [...prev, { role: "assistant", content: data.reply }]);
      } else {
        throw new Error("The mentor returned an empty response.");
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Network error. Check your connection.";
      setMessages((prev) => [...prev, { role: "assistant", content: message }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen flex-col bg-slate-50 text-slate-950 dark:bg-slate-950 dark:text-slate-50">
      <header className={`border-b px-4 py-3 backdrop-blur ${cfg.header}`}>
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-3">
            <Link href="/" className="rounded-lg px-2 py-1 text-sm font-mono text-slate-600 transition hover:bg-white/70 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-white">
              &lt;- Back
            </Link>
            <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg font-mono font-black ${cfg.markClass}`}>
              {cfg.mark}
            </span>
            <div className="min-w-0">
              <h1 className="truncate font-mono text-lg font-bold leading-tight">{cfg.name}</h1>
              <p className="truncate text-xs font-mono text-slate-600 dark:text-slate-300">{cfg.subtitle}</p>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-3">
            <span className="hidden text-xs font-mono text-slate-500 dark:text-slate-400 md:block">{cfg.tagline}</span>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-6">
        <div className="mx-auto max-w-5xl">
          {messages.length === 0 && (
            <div className="flex min-h-[55vh] flex-col items-center justify-center text-center">
              <span className={`mb-4 flex h-16 w-16 items-center justify-center rounded-xl font-mono text-2xl font-black ${cfg.markClass}`}>
                {cfg.mark}
              </span>
              <h2 className="font-mono text-2xl font-bold text-slate-950 dark:text-white">{cfg.emptyTitle}</h2>
              <p className="mt-3 max-w-xl text-sm leading-6 text-slate-500 dark:text-slate-400">{cfg.emptyText}</p>
            </div>
          )}

          {messages.map((msg, i) => (
            <ChatMessage key={`${msg.role}-${i}`} role={msg.role} content={msg.content} mentor={mentor} />
          ))}

          {loading && (
            <div className="mb-4 flex justify-start">
              <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <div className="flex gap-1.5">
                  <span className="h-2 w-2 animate-bounce rounded-full bg-slate-400" style={{ animationDelay: "0ms" }} />
                  <span className="h-2 w-2 animate-bounce rounded-full bg-slate-400" style={{ animationDelay: "150ms" }} />
                  <span className="h-2 w-2 animate-bounce rounded-full bg-slate-400" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="border-t border-slate-200 bg-white/90 px-4 py-3 backdrop-blur dark:border-slate-800 dark:bg-slate-950/90">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            sendMessage();
          }}
          className="mx-auto flex max-w-5xl gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={cfg.placeholder}
            className={`min-w-0 flex-1 rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm font-mono text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 ${cfg.inputFocus}`}
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className={`rounded-lg px-5 py-3 text-sm font-mono font-semibold text-white transition focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-40 dark:focus:ring-offset-slate-950 ${cfg.button}`}
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
}
