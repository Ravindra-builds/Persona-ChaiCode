// import { fetchYouTubeVideos } from "@/lib/youtube";

// export const tools = {
//     fetchYouTubeVideos,
// };

export const youtubeTool = {
  name: "search_youtube",
  description:
    "Search relevant YouTube videos whenever the user explicitly asks for video recommendations, tutorials, playlists, or requests a deep explanation that would benefit from watching a video.",

  parameters: {
    type: "object",
    properties: {
      topic: {
        type: "string",
        description:
          "The topic to search on YouTube. Example: Docker networking, React Context API, Redis caching.",
      },
    },

    required: ["topic"],
  },
};