"use client";

interface ChatVideo {
  title: string;
  url: string;
  thumbnail?: string;
  channelTitle?: string;
}

interface ChatMessageProps {
  role: "user" | "assistant";
  content: string;
  mentor: "hitesh" | "piyush";
  profileImage?: string;
  videos?: ChatVideo[];
  channelTitle?: string;
  sourceMentor?: "hitesh" | "piyush";
}

function parseVideoBlocks(content: string) {
  const lines = content.split("\n");
  const videoLines = lines.filter((line) => line.includes("https://www.youtube.com/watch?v="));

  if (!videoLines.length) return { text: content, videos: [] as ChatVideo[] };

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

export function ChatMessage({
  role,
  content,
  mentor,
  profileImage,
  videos: propVideos,
  channelTitle,
  sourceMentor,
}: ChatMessageProps) {
  const isUser = role === "user";
  const mentorLabel = mentor;
  const { text, videos: parsedVideos } = parseVideoBlocks(content);

  const resolvedChannelTitle = channelTitle ?? (mentor === "hitesh" ? "Chai aur Code" : "Piyush Garg");
  const resolvedVideos: ChatVideo[] = propVideos?.length
    ? propVideos.map((v) => ({ ...v, channelTitle: v.channelTitle ?? resolvedChannelTitle }))
    : parsedVideos;

  const fallbackProfileImage = mentor === "hitesh" ? "/asset/hitesh-sir.jpg" : "/asset/piyush-sir.jpg";
  const avatarSrc = profileImage || fallbackProfileImage;

  const isCrossRecommended = Boolean(sourceMentor && sourceMentor !== mentor);

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
            <img src={avatarSrc} alt={resolvedChannelTitle} className="h-8 w-8 rounded-full object-cover ring-1 ring-slate-950/10" />
            <div>
              <div className="text-slate-800 dark:text-stone-200">{mentorLabel}</div>
              <div className="font-medium opacity-70">{resolvedChannelTitle}</div>
            </div>
          </div>
        )}

        <div className="whitespace-pre-wrap text-[14px] leading-7">{text}</div>

        {resolvedVideos.length > 0 && (
          <div className="mt-3">
            {isCrossRecommended && (
              <p className="mb-2 text-[11px] font-medium text-slate-500 dark:text-stone-400">
                Nothing fresh on {mentorLabel}&apos;s channel — {resolvedChannelTitle} has this one:
              </p>
            )}
            <div className="grid gap-3 sm:grid-cols-2">
              {resolvedVideos.map((video) => (
                <a
                  key={video.url}
                  href={video.url}
                  target="_blank"
                  rel="noreferrer"
                  className="group block overflow-hidden rounded-lg border border-slate-950/10 bg-white transition hover:shadow-md dark:border-white/10 dark:bg-white/[0.04]"
                >
                  {video.thumbnail ? (
                    <div className="aspect-video w-full overflow-hidden bg-slate-100 dark:bg-white/5">
                      <img
                        src={video.thumbnail}
                        alt={video.title}
                        className="h-full w-full object-cover transition duration-200 group-hover:scale-105"
                      />
                    </div>
                  ) : (
                    <div className="flex aspect-video w-full items-center justify-center bg-slate-100 text-[11px] text-slate-400 dark:bg-white/5 dark:text-stone-500">
                      No thumbnail
                    </div>
                  )}
                  <div className="p-2.5">
                    <p className="line-clamp-2 text-xs font-semibold text-slate-800 dark:text-stone-100">
                      {video.title}
                    </p>
                    {video.channelTitle && (
                      <p className="mt-1 text-[11px] text-slate-500 dark:text-stone-400">{video.channelTitle}</p>
                    )}
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}