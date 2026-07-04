"use client";

import { useTheme } from "@/components/ThemeContext";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      onClick={toggleTheme}
      className="relative h-8 w-16 rounded-full border border-white/40 bg-slate-200 p-1 text-[10px] font-bold uppercase tracking-wide text-slate-600 shadow-inner transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:border-white/10 dark:bg-slate-800 dark:text-slate-300"
      aria-label="Toggle theme"
      type="button"
    >
      <span className="absolute left-2 top-1/2 -translate-y-1/2">L</span>
      <span className="absolute right-2 top-1/2 -translate-y-1/2">D</span>
      <span
        className="absolute left-1 top-1 h-6 w-6 rounded-full bg-white shadow-md transition-transform duration-300 dark:bg-slate-100"
        style={{ transform: isDark ? "translateX(32px)" : "translateX(0)" }}
      />
    </button>
  );
}
