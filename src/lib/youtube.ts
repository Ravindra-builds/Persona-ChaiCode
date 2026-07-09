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

function fallbackChannelInfo(mentor: "hitesh" | "piyush") {
  return {
    profileImage: buildAvatarSvg(mentor === "hitesh" ? "CA C" : "PG"),
    channelTitle: mentor === "hitesh" ? "Chai aur Code" : "Piyush Garg",
    videos: [],
  };
}

export async function fetchYouTubeVideos(mentor: "hitesh" | "piyush", limit = 3, topic?: string): Promise<YouTubeChannelInfo> {
  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) {
    return fallbackChannelInfo(mentor);
  }

  const baseQueries = topic?.trim()
    ? [
        `${topic.trim()} ${mentor === "hitesh" ? "chai aur code" : "piyush garg"}`,
        mentor === "hitesh" ? `${topic.trim()} piyush garg` : `${topic.trim()} chai aur code`,
      ]
    : [mentor === "hitesh" ? "chai aur code" : "piyush garg"];

  try {
    let videos: YouTubeVideo[] = [];

    for (const query of baseQueries) {
      const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=${limit}&order=date&q=${encodeURIComponent(query)}&type=video&key=${apiKey}`;
      const searchResponse = await fetch(searchUrl);
      const searchData = await searchResponse.json();
      const items = Array.isArray(searchData.items) ? searchData.items : [];
      const candidateVideos = items.map((item: any) => ({
        id: item.id?.videoId ?? "",
        title: item.snippet?.title ?? "Untitled video",
        description: item.snippet?.description ?? "",
        url: `https://www.youtube.com/watch?v=${item.id?.videoId ?? ""}`,
        thumbnail: item.snippet?.thumbnails?.high?.url ?? item.snippet?.thumbnails?.default?.url ?? "",
        channelTitle: item.snippet?.channelTitle ?? (mentor === "hitesh" ? "Chai aur Code" : "Piyush Garg"),
        publishedAt: item.snippet?.publishedAt ?? "",
        channelId: item.snippet?.channelId,
      }));

      if (candidateVideos.length) {
        videos = candidateVideos;
        break;
      }
    }

    if (!videos.length) {
      return fallbackChannelInfo(mentor);
    }

    const channelIds = videos
      .map((video: YouTubeVideo) => video.channelId)
      .filter((channelId: string | undefined): channelId is string => Boolean(channelId))
      .join(",");
    const profileImage = channelIds
      ? await (async () => {
          try {
            const channelUrl = `https://www.googleapis.com/youtube/v3/channels?part=snippet&id=${channelIds}&key=${apiKey}`;
            const channelResponse = await fetch(channelUrl);
            const channelData = await channelResponse.json();
            const firstChannel = Array.isArray(channelData.items) ? channelData.items[0] : null;
            return firstChannel?.snippet?.thumbnails?.high?.url ?? firstChannel?.snippet?.thumbnails?.default?.url ?? buildAvatarSvg(mentor === "hitesh" ? "CA C" : "PG");
          } catch {
            return buildAvatarSvg(mentor === "hitesh" ? "CA C" : "PG");
          }
        })()
      : buildAvatarSvg(mentor === "hitesh" ? "CA C" : "PG");

    return {
      profileImage,
      channelTitle: videos[0]?.channelTitle ?? (mentor === "hitesh" ? "Chai aur Code" : "Piyush Garg"),
      videos,
    };
  } catch {
    return fallbackChannelInfo(mentor);
  }
}
