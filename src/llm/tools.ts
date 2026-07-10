export const youtubeTool = {
  type: "function",
  function: {
    name: "search_youtube",
    description: "...",
    parameters: {
      type: "object",
      properties: {
        topic: {
          type: "string",
          description: "..."
        }
      },
      required: ["topic"]
    }
  }
} as const;