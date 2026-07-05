"use client";

import { useTheme } from "@/components/ThemeContext";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      onClick={toggleTheme}
      className="relative mr-1 inline-flex h-8 w-8 items-center rounded-full border border-slate-200 bg-white/80 p-1 shadow-sm transition-all duration-300 hover:bg-white focus:outline-none focus:ring-2 focus:ring-[#d6b36a]/50 focus:ring-offset-2 dark:border-white/10 dark:bg-slate-900/70 dark:hover:bg-slate-800 dark:focus:ring-offset-slate-950"
      aria-label="Toggle theme"
      type="button"
    >
{isDark ?
<span className={`relative z-10  flex h-10 w-10 items-center justify-center  "text-slate-300"`}>
        <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M12 3v2.2M12 18.8V21M4.9 4.9l1.6 1.6M17.5 17.5l1.6 1.6M3 12h2.2M18.8 12H21M4.9 19.1l1.6-1.6M17.5 6.5l1.6-1.6" strokeLinecap="round" />
          <circle cx="12" cy="12" r="3.8" />
        </svg>
      </span>
      :
      <span className={`relative z-10 flex  h-8 w-8 items-center justify-center ${isDark ? "text-black" : "text-slate-600"}`}>
        <svg viewBox="0 0 24 24" className="h-6 w-6" fill="black" stroke="currentColor" strokeWidth="1.8">
          <path d="M20 15.5A8.5 8.5 0 1 1 8.5 4a7 7 0 1 0 11.5 11.5Z" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span> 
}
      
      
    </button>
  );
}
