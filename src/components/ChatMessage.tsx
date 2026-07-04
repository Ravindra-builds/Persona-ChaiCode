"use client";

interface ChatMessageProps {
  role: "user" | "assistant";
  content: string;
  mentor: "hitesh" | "piyush";
}

export function ChatMessage({ role, content, mentor }: ChatMessageProps) {
  const isUser = role === "user";
  const mentorLabel = mentor === "hitesh" ? "C Hitesh" : "S Piyush";

  return (
    <div className={`mb-4 flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[min(82%,44rem)] rounded-xl px-4 py-3 text-sm leading-relaxed shadow-sm ${
          isUser
            ? "rounded-br-sm bg-slate-950 text-white dark:bg-white dark:text-slate-950"
            : mentor === "hitesh"
              ? "rounded-bl-sm border border-amber-200 bg-amber-50 text-amber-950 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-100"
              : "rounded-bl-sm border border-sky-200 bg-sky-50 text-slate-950 dark:border-sky-500/20 dark:bg-sky-500/10 dark:text-sky-50"
        }`}
      >
        {!isUser && (
          <div className={`mb-1 text-xs font-bold ${mentor === "hitesh" ? "text-amber-700 dark:text-amber-300" : "text-sky-700 dark:text-sky-300"}`}>
            {mentorLabel}
          </div>
        )}
        <div className="whitespace-pre-wrap font-mono text-[13px]">{content}</div>
      </div>
    </div>
  );
}
