import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { handleApiError, AuthenticationError } from "@/utils/errorHandler";

/**
 * Get current authenticated user info
 * Clerk handles the actual login via their hosted UI
 */
export async function POST(req: Request) {
  try {
    const { userId, sessionClaims } = await auth();

    if (!userId) {
      return handleApiError(
        new AuthenticationError("Not authenticated"),
        "Login: No active session"
      );
    }

    const user = sessionClaims?.metadata as any;

    return NextResponse.json({
      success: true,
      user: {
        id: userId,
        email: sessionClaims?.email,
        name: user?.name || sessionClaims?.username,
      },
    });
  } catch (err) {
    return handleApiError(err, "Login: Unexpected error");
  }
}

