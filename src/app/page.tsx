"use client";

import Link from "next/link";
import { useAuth } from "@/components/AuthContext";
import { ThemeToggle } from "@/components/ThemeToggle";

const mentors = [
  {
    href: "/hitesh",
    code: "01",
    name: "Hitesh",
    studio: "Chai aur Code",
    line: "JS, React, DSA, career.",
    avatar: "/asset/hitesh-sir.jpg",
    accent: "from-[#d6b36a] to-[#8b5e20]",
    ring: "group-hover:border-[#d6b36a]/55",
  },
  {
    href: "/piyush",
    code: "02",
    name: "Piyush",
    studio: "Systems Architect",
    line: "Backend, infra, AWS, scale.",
    avatar: "/asset/piyush-sir.jpg",
    accent: "from-[#111827] to-[#64748b] dark:from-[#f7f4ed] dark:to-[#8f8a80]",
    ring: "group-hover:border-slate-900/35 dark:group-hover:border-white/35",
  },
];

export default function Home() {
  const { user, logout } = useAuth();

  return (
    <div className="mesh-bg min-h-screen text-slate-950 dark:text-stone-50">
      <nav className="mx-auto flex w-full max-w-7xl items-center justify-between px-5 py-5">
        <Link href="/" className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/80 p-1 shadow-lg shadow-slate-900/10 ring-1 ring-slate-950/10 dark:bg-slate-900/80 dark:ring-white/10">
            <img src="/asset/logo.png" alt="MentorOS logo" className="h-7 w-7 object-contain" />
          </span>
          <span className="text-sm font-semibold tracking-[0.22em] text-slate-800 dark:text-stone-200">MENTOROS</span>
        </Link>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          {user ? (
            <>
              <span className="hidden max-w-32 truncate text-sm text-slate-600 dark:text-stone-400 sm:inline">{user.name}</span>
              <button
                onClick={logout}
                className="rounded-md border border-slate-950/10 bg-white/55 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-white dark:border-white/10 dark:bg-white/5 dark:text-stone-200 dark:hover:bg-white/10"
                type="button"
              >
                Logout
              </button>
            </>
          ) : (
            <Link
              href="/login"
              className="rounded-md bg-slate-950 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-slate-900/15 transition hover:-translate-y-0.5 dark:bg-stone-50 dark:text-slate-950"
            >
              Login
            </Link>
          )}
        </div>
      </nav>

      <main className="mx-auto grid min-h-[calc(100vh-88px)] w-full max-w-7xl items-center gap-8 px-5 pb-8 lg:grid-cols-[0.9fr_1.1fr]">
        <section className="max-w-xl">
          <div className="mb-6 h-px w-24 bg-slate-950/40 dark:bg-stone-100/40" />
          <p className="mb-4 text-xs font-bold uppercase tracking-[0.35em] text-[#8b5e20] dark:text-[#d6b36a]">Choose signal</p>
          <h1 className="text-5xl font-semibold leading-[0.95] tracking-tight text-slate-950 dark:text-stone-50 sm:text-7xl">
            One desk.
            <br />
            Two minds.
          </h1>
          <p className="mt-6 max-w-md text-base leading-7 text-slate-600 dark:text-stone-400">
            Pick the mentor that fits the problem and start the conversation.
          </p>
        </section>

        <section className="grid gap-4">
          {mentors.map((mentor) => (
            <Link
              key={mentor.href}
              href={mentor.href}
              className={`group glass-panel-strong relative overflow-hidden rounded-lg p-5 transition duration-300 hover:-translate-y-1 ${mentor.ring}`}
            >
              <div className={`absolute inset-y-0 left-0 w-1 bg-linear-to-b ${mentor.accent}`} />
              <div className="grid gap-5 sm:grid-cols-[auto_1fr_auto] sm:items-center">
                <div className={`flex h-20 w-20 items-center justify-center rounded-lg bg-linear-to-br ${mentor.accent} p-0.5 shadow-xl shadow-slate-900/15`}>
                  <img
                    src={mentor.avatar}
                    alt={mentor.name}
                    className="h-full w-full rounded-lg object-cover"
                  />
                </div>
                <div>
                  <div className="mb-3 text-xs font-bold tracking-[0.28em] text-slate-400 dark:text-stone-500">{mentor.code}</div>
                  <h2 className="text-3xl font-semibold tracking-tight text-slate-950 dark:text-stone-50">{mentor.name}</h2>
                  <p className="mt-2 text-sm text-slate-500 dark:text-stone-400">{mentor.studio}</p>
                </div>
                <div className="flex items-end justify-between gap-4 sm:block sm:text-right">
                  <p className="text-sm text-slate-600 dark:text-stone-400">{mentor.line}</p>
                  <div className="mt-4 text-sm font-bold text-slate-950 transition group-hover:translate-x-1 dark:text-stone-50">Open</div>
                </div>
              </div>
            </Link>
          ))}

          <div className="grid grid-cols-3 gap-3">
            {["Focused", "Private", "Fast"].map((item) => (
              <div key={item} className="rounded-md border border-slate-950/10 bg-white/45 px-3 py-4 text-center text-xs font-bold uppercase tracking-[0.18em] text-slate-500 backdrop-blur dark:border-white/10 dark:bg-white/5 dark:text-stone-400">
                {item}
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}