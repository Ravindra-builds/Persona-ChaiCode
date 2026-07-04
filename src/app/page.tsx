"use client";

import Link from "next/link";
import { useAuth } from "@/components/AuthContext";
import { ThemeToggle } from "@/components/ThemeToggle";

const mentors = [
  {
    href: "/hitesh",
    mark: "C",
    name: "Chai aur Code",
    mentor: "Hitesh Choudhary",
    description: "Fundamentals, career clarity, React, JavaScript, and practical learning discipline.",
    tags: ["JavaScript", "React", "Git", "DSA", "Career"],
    tone: "Warm Hinglish mentor",
    classes: {
      mark: "bg-amber-100 text-amber-800 ring-amber-200 dark:bg-amber-400/10 dark:text-amber-200 dark:ring-amber-400/20",
      border: "hover:border-amber-300 dark:hover:border-amber-500/40",
      cta: "text-amber-700 dark:text-amber-300",
      tag: "bg-amber-500/10 text-amber-800 ring-amber-500/15 dark:text-amber-200",
    },
  },
  {
    href: "/piyush",
    mark: "S",
    name: "Systems Architect",
    mentor: "Piyush Garg",
    description: "Backend, infra, scale, Docker, AWS, and production-grade architecture decisions.",
    tags: ["Backend", "DevOps", "AWS", "Docker", "System Design"],
    tone: "Direct systems thinker",
    classes: {
      mark: "bg-sky-100 text-sky-800 ring-sky-200 dark:bg-sky-400/10 dark:text-sky-200 dark:ring-sky-400/20",
      border: "hover:border-sky-300 dark:hover:border-sky-500/40",
      cta: "text-sky-700 dark:text-sky-300",
      tag: "bg-sky-500/10 text-sky-800 ring-sky-500/15 dark:text-sky-200",
    },
  },
];

export default function Home() {
  const { user, logout } = useAuth();

  return (
    <div className="mesh-bg min-h-screen">
      <nav className="mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-5">
        <Link href="/" className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-950 text-sm font-black text-white shadow-lg shadow-slate-900/15 dark:bg-white dark:text-slate-950">
            DM
          </span>
          <div>
            <h1 className="font-mono text-lg font-bold tracking-tight text-slate-950 dark:text-white">DualMentor</h1>
            <p className="hidden text-xs font-mono text-slate-500 dark:text-slate-400 sm:block">Two coding mentors, one chat desk</p>
          </div>
        </Link>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          {user ? (
            <div className="flex items-center gap-3">
              <span className="hidden max-w-32 truncate text-sm font-mono text-slate-600 dark:text-slate-300 sm:inline">{user.name}</span>
              <button
                onClick={logout}
                className="rounded-lg border border-red-200 px-3 py-2 text-sm font-mono text-red-600 transition hover:bg-red-50 dark:border-red-500/20 dark:text-red-300 dark:hover:bg-red-500/10"
                type="button"
              >
                Logout
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="rounded-lg bg-slate-950 px-4 py-2 text-sm font-mono font-semibold text-white shadow-lg shadow-slate-900/15 transition hover:-translate-y-0.5 dark:bg-white dark:text-slate-950"
            >
              Login
            </Link>
          )}
        </div>
      </nav>

      <main className="mx-auto flex w-full max-w-6xl flex-col px-5 pb-8 pt-8 sm:pt-14">
        <section className="grid items-end gap-8 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <p className="mb-4 inline-flex rounded-full border border-slate-200 bg-white/60 px-3 py-1 text-xs font-mono font-semibold uppercase tracking-wider text-slate-600 shadow-sm dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
              Pick your mentor
            </p>
            <h2 className="max-w-3xl font-mono text-4xl font-black leading-tight tracking-tight text-slate-950 dark:text-white sm:text-6xl">
              Learn faster with the mentor mode that matches your problem.
            </h2>
            <p className="mt-5 max-w-2xl text-base leading-7 text-slate-600 dark:text-slate-300 sm:text-lg">
              Choose fundamentals and motivation with Hitesh, or switch into systems, infra, and production architecture with Piyush.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3 rounded-xl border border-slate-200 bg-white/55 p-3 shadow-xl shadow-slate-900/5 backdrop-blur dark:border-white/10 dark:bg-white/5">
            {[
              ["2", "mentor modes"],
              ["10", "focus areas"],
              ["1", "chat workspace"],
            ].map(([value, label]) => (
              <div key={label} className="rounded-lg bg-white/70 p-4 text-center dark:bg-slate-950/35">
                <div className="font-mono text-2xl font-black text-slate-950 dark:text-white">{value}</div>
                <div className="mt-1 text-xs font-mono text-slate-500 dark:text-slate-400">{label}</div>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-10 grid gap-5 md:grid-cols-2">
          {mentors.map((mentor) => (
            <Link
              key={mentor.href}
              href={mentor.href}
              className={`group rounded-xl border border-slate-200 bg-white/70 p-6 shadow-xl shadow-slate-900/5 backdrop-blur transition duration-300 hover:-translate-y-1 dark:border-white/10 dark:bg-white/5 ${mentor.classes.border}`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-4">
                  <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-lg font-mono text-lg font-black ring-1 ${mentor.classes.mark}`}>
                    {mentor.mark}
                  </span>
                  <div>
                    <h3 className="font-mono text-xl font-bold text-slate-950 dark:text-white">{mentor.name}</h3>
                    <p className="mt-1 text-sm font-mono text-slate-500 dark:text-slate-400">{mentor.mentor}</p>
                  </div>
                </div>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-mono text-slate-500 dark:bg-white/10 dark:text-slate-300">
                  {mentor.tone}
                </span>
              </div>

              <p className="mt-5 min-h-14 text-sm leading-6 text-slate-600 dark:text-slate-300">{mentor.description}</p>

              <div className="mt-5 flex flex-wrap gap-2">
                {mentor.tags.map((tag) => (
                  <span key={tag} className={`rounded-full px-2.5 py-1 text-xs font-mono ring-1 ${mentor.classes.tag}`}>
                    {tag}
                  </span>
                ))}
              </div>

              <div className={`mt-6 flex items-center gap-2 font-mono text-sm font-semibold transition-all group-hover:gap-3 ${mentor.classes.cta}`}>
                Start chat <span aria-hidden="true">-&gt;</span>
              </div>
            </Link>
          ))}
        </section>
      </main>
    </div>
  );
}
