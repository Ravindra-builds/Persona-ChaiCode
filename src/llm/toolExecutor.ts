

import { fetchYouTubeVideos } from "@/lib/youtube";
import type { Mentor } from "./types";

export async function executeTool(
  mentor: Mentor,
  toolName: string,
  args: Record<string, any>
) {
  switch (toolName) {
    case "search_youtube":
      return {
        youtube: await fetchYouTubeVideos(
          mentor,
          3,
          args.topic
        ),
      };

    default:
      throw new Error(`Unknown tool: ${toolName}`);
  }
}