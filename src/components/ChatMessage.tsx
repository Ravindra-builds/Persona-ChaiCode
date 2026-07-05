"use client";

interface ChatMessageProps {
  role: "user" | "assistant";
  content: string;
  mentor: "hitesh" | "piyush";
  profileImage?: string;
  videos?: Array<{ title: string; url: string }>;
  channelTitle?: string;
}

function parseVideoBlocks(content: string) {
  const lines = content.split("\n");
  const videoLines = lines.filter((line) => line.includes("https://www.youtube.com/watch?v="));

  if (!videoLines.length) return { text: content, videos: [] };

  const cleanText = lines
    .filter((line) => !line.includes("https://www.youtube.com/watch?v="))
    .join("\n")
    .trim();

  const videos = videoLines.map((line) => {
    const titleMatch = line.match(/^[-*]\s*(.+?)\s*\|/);
    const urlMatch = line.match(/https:\/\/www\.youtube\.com\/watch\?v=([^\s]+)/);
    return {
      title: titleMatch?.[1]?.trim() ?? "Recommended video",
      url: urlMatch?.[0] ?? "",
    };
  });

  return { text: cleanText, videos };
}

export function ChatMessage({ role, content, mentor, profileImage, videos: propVideos, channelTitle }: ChatMessageProps) {
  const isUser = role === "user";
  const mentorLabel = mentor === "hitesh" ? "Hitesh" : "Piyush";
  const { text, videos } = parseVideoBlocks(content);
  const resolvedVideos = propVideos?.length ? propVideos : videos;
  const resolvedChannelTitle = channelTitle ?? (mentor === "hitesh" ? "Chai aur Code" : "Piyush Garg");

  return (
    <div className={`mb-5 flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[min(86%,46rem)] rounded-lg px-4 py-3 text-sm leading-relaxed shadow-sm ${
          isUser
            ? "bg-slate-950 text-white dark:bg-stone-50 dark:text-slate-950"
            : "border border-slate-950/10 bg-white/78 text-slate-900 backdrop-blur dark:border-white/10 dark:bg-white/[0.06] dark:text-stone-100"
        }`}
      >
        {!isUser && (
          <div className="mb-3 flex items-center gap-2 border-b border-slate-950/10 pb-2 text-xs font-bold text-slate-500 dark:border-white/10 dark:text-stone-400">
            {profileImage ? (
              <img src={profileImage} alt={resolvedChannelTitle} className="h-7 w-7 rounded object-cover" />
            ) : (
              <span className={`inline-flex h-7 w-7 items-center justify-center rounded text-[11px] font-black ${mentor === "hitesh" ? "bg-[#d6b36a] text-slate-950" : "bg-slate-950 text-white dark:bg-stone-50 dark:text-slate-950"}`}>
                {mentor === "hitesh" ? "C" : "S"}
              </span>
            )}
            <div>
              <div className="text-slate-800 dark:text-stone-200">{mentorLabel}</div>
              <div className="font-medium opacity-70">{resolvedChannelTitle}</div>
            </div>
          </div>
        )}
        <div className="whitespace-pre-wrap text-[14px] leading-7">{text}</div>
        {resolvedVideos.length > 0 && (
          <div className="mt-3 grid gap-2">
            {resolvedVideos.map((video) => (
              <a
                key={video.url}
                href={video.url}
                target="_blank"
                rel="noreferrer"
                className="block rounded-md border border-slate-950/10 bg-slate-950/[0.03] px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-950/[0.06] dark:border-white/10 dark:bg-white/5 dark:text-stone-200 dark:hover:bg-white/10"
              >
                Play {video.title}
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}