export type Mentor = "hitesh" | "piyush";

export interface YouTubeVideo {
  id: string;
  title: string;
  description: string;
  url: string;
  thumbnail: string;
  channelTitle: string;
  publishedAt: string;
  channelId?: string;
}

export interface YouTubeChannelInfo {
  profileImage: string;
  channelTitle: string;
  videos: YouTubeVideo[];
  sourceMentor: Mentor;
}

const MENTOR_CHANNEL_IDS: Record<Mentor, string> = {
  hitesh: "UCNQ6FEtztATuaVhZKCY28Yw",
  piyush: "UCf9T51_FmMlfhiGpoes0yFA",
};

const MENTOR_CHANNEL_TITLES: Record<Mentor, string> = {
  hitesh: "Chai aur Code",
  piyush: "Piyush Garg",
};

function otherMentor(mentor: Mentor): Mentor {
  return mentor === "hitesh" ? "piyush" : "hitesh";
}

function buildAvatarSvg(label: string) {
  const safeLabel = label.replace(/[^a-zA-Z0-9 ]/g, "").slice(0, 2).toUpperCase();
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 96 96">
      <rect width="96" height="96" rx="24" fill="#111827" />
      <circle cx="48" cy="38" r="20" fill="#f59e0b" />
      <path d="M24 82c5-13 17-20 24-20s19 7 24 20" fill="#38bdf8" />
      <text x="48" y="54" font-family="Arial, sans-serif" font-size="24" font-weight="700" text-anchor="middle" fill="white">${safeLabel}</text>
    </svg>`;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

function fallbackChannelInfo(mentor: Mentor): YouTubeChannelInfo {
  return {
    profileImage: buildAvatarSvg(mentor === "hitesh" ? "CA C" : "PG"),
    channelTitle: MENTOR_CHANNEL_TITLES[mentor],
    videos: [],
    sourceMentor: mentor,
  };
}

async function searchChannelVideos(
  channelId: string,
  apiKey: string,
  limit: number,
  topic?: string,
): Promise<YouTubeVideo[]> {
  const trimmedTopic = topic?.trim();
  const params = new URLSearchParams({
    part: "snippet",
    channelId,
    maxResults: String(limit),
    type: "video",
    order: trimmedTopic ? "relevance" : "date",
    key: apiKey,
  });
  if (trimmedTopic) params.set("q", trimmedTopic);

  const res = await fetch(`https://www.googleapis.com/youtube/v3/search?${params.toString()}`);
  const data = await res.json();
  const items = Array.isArray(data.items) ? data.items : [];

  return items.map((item: any) => ({
    id: item.id?.videoId ?? "",
    title: item.snippet?.title ?? "Untitled video",
    description: item.snippet?.description ?? "",
    url: `https://www.youtube.com/watch?v=${item.id?.videoId ?? ""}`,
    thumbnail: item.snippet?.thumbnails?.high?.url ?? item.snippet?.thumbnails?.default?.url ?? "",
    channelTitle: item.snippet?.channelTitle ?? "",
    publishedAt: item.snippet?.publishedAt ?? "",
    channelId: item.snippet?.channelId,
  }));
}

async function fetchChannelProfileImage(
  channelId: string,
  apiKey: string,
  mentor: Mentor,
): Promise<string> {
  try {
    const url = `https://www.googleapis.com/youtube/v3/channels?part=snippet&id=${channelId}&key=${apiKey}`;
    const res = await fetch(url);
    const data = await res.json();
    const first = Array.isArray(data.items) ? data.items[0] : null;
    return (
      first?.snippet?.thumbnails?.high?.url ??
      first?.snippet?.thumbnails?.default?.url ??
      buildAvatarSvg(mentor === "hitesh" ? "CA C" : "PG")
    );
  } catch {
    return buildAvatarSvg(mentor === "hitesh" ? "CA C" : "PG");
  }
}

export async function fetchYouTubeVideos(
  mentor: Mentor,
  limit = 3,
  topic?: string,
): Promise<YouTubeChannelInfo> {
  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) return fallbackChannelInfo(mentor);

  try {
    let videos = await searchChannelVideos(MENTOR_CHANNEL_IDS[mentor], apiKey, limit, topic);
    let sourceMentor: Mentor = mentor;

    // Nothing on the requested mentor's own channel — let the other mentor recommend instead
    if (!videos.length) {
      const fallback = otherMentor(mentor);
      videos = await searchChannelVideos(MENTOR_CHANNEL_IDS[fallback], apiKey, limit, topic);
      sourceMentor = fallback;
    }

    if (!videos.length) return fallbackChannelInfo(mentor);

    const profileImage = await fetchChannelProfileImage(
      MENTOR_CHANNEL_IDS[sourceMentor],
      apiKey,
      sourceMentor,
    );

    return {
      profileImage,
      channelTitle: videos[0]?.channelTitle ?? MENTOR_CHANNEL_TITLES[sourceMentor],
      videos,
      sourceMentor,
    };
  } catch {
    return fallbackChannelInfo(mentor);
  }
}