
import { Type, type FunctionDeclaration } from "@google/genai";

export const youtubeToolOpenAI = {
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


export const youtubeToolGemini: FunctionDeclaration = {
  name: "search_youtube",
  description: "Search YouTube for videos on a given topic.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      topic: {
        type: Type.STRING,
        description: "The topic to search YouTube videos for.",
      },
    },
    required: ["topic"],
  },
};