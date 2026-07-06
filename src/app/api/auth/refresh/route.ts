import { NextResponse } from "next/server";
import { findUserByEmail } from "@/lib/auth";
import { generateAccessToken, verifyRefreshToken } from "@/lib/tokens";
import { checkRefreshTokenRateLimit } from "@/utils/rateLimitingUtils";
import {
  handleApiError,
  AuthenticationError,
  NotFoundError,
} from "@/utils/errorHandler";

export async function POST(req: Request) {
  try {
 
    const cookie = req.headers.get("cookie") ?? "";
    const refreshToken = cookie
      .split(";")
      .map((part) => part.trim())
      .find((part) => part.startsWith("refreshToken="))
      ?.slice("refreshToken=".length);

    if (!refreshToken) {
      return handleApiError(
        new AuthenticationError("Missing refresh token."),
        "Refresh: Missing token"
      );
    }

  
    let payload: any;
    try {
      payload = verifyRefreshToken(decodeURIComponent(refreshToken));
    } catch (tokenError) {
      return handleApiError(
        new AuthenticationError("Invalid or expired refresh token."),
        "Refresh: Invalid token"
      );
    }


    try {
      await checkRefreshTokenRateLimit(payload.userId);
    } catch (rateLimitError) {
      return handleApiError(rateLimitError, "Refresh: Rate limit exceeded");
    }


    const user = await findUserByEmail(payload.email);
    if (!user) {
      return handleApiError(
        new NotFoundError("User"),
        "Refresh: User not found"
      );
    }


    const accessToken = generateAccessToken({ userId: user.id, email: user.email });
    
    return NextResponse.json({
      success: true,
      accessToken,
      user: {
        id: user.id,
        name: user.name ?? user.email,
        email: user.email,
        verified: user.verified,
      },
    });
  } catch (err) {
    return handleApiError(err, "Refresh: Unexpected error");
  }
}
