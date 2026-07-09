import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getChatRateLimitStatus } from "@/utils/rateLimitingUtils";
import { RATE_LIMITS } from "@/utils/constants";

export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const status = await getChatRateLimitStatus(userId);
    console.log("Rate limit status:", status);

    return NextResponse.json(status);
  } catch (error) {
    console.error("Failed to fetch rate limit status:", error);

    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}