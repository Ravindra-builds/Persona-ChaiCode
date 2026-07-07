import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { handleApiError, AuthenticationError } from "@/utils/errorHandler";

/**
 * Sync user data from Clerk to database after registration
 * Clerk handles the actual registration via their hosted UI
 */
export async function POST(req: Request) {
  try {
    const { userId, sessionClaims } = await auth();

    if (!userId) {
      return handleApiError(
        new AuthenticationError("Not authenticated"),
        "Register: No active session"
      );
    }

    // User data is already created by Clerk's webhook
    return NextResponse.json({
      success: true,
      message: "User registration successful",
      userId,
    });
  } catch (err) {
    return handleApiError(err, "Register: Unexpected error");
  }
}

