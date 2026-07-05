"use client";

import { useTheme } from "@/components/ThemeContext";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      onClick={toggleTheme}
 className="relative h-9 w-16 rounded-md border border-slate-950/10 bg-white/55 p-1 text-[10px] font-bold uppercase tracking-wide text-slate-500 shadow-sm transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-[#d6b36a]/50 focus:ring-offset-2 dark:border-white/10 dark:bg-white/5 dark:text-stone-400 dark:focus:ring-offset-slate-950"      aria-label="Toggle theme"
      type="button"
    >
     <span className="absolute left-2 top-1/2 -translate-y-1/2">LT</span>
      <span className="absolute right-2 top-1/2 -translate-y-1/2">DK</span>
      <span
        className="absolute left-1 top-1 h-7 w-7 rounded bg-slate-950 shadow-md transition-transform duration-300 dark:bg-stone-50"
        style={{ transform: isDark ? "translateX(28px)" : "translateX(0)" }}
      />
    </button>
  );
}
