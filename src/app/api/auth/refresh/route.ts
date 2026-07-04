import { NextResponse } from "next/server";
import { findUserByEmail } from "@/lib/auth";
import { generateAccessToken, verifyRefreshToken } from "@/lib/tokens";

export async function POST(req: Request) {
  try {
    const cookie = req.headers.get("cookie") ?? "";
    const refreshToken = cookie
      .split(";")
      .map((part) => part.trim())
      .find((part) => part.startsWith("refreshToken="))
      ?.slice("refreshToken=".length);

    if (!refreshToken) {
      return NextResponse.json({ error: "Missing refresh token." }, { status: 401 });
    }

    const payload = verifyRefreshToken(decodeURIComponent(refreshToken));
    const user = await findUserByEmail(payload.email);
    if (!user) {
      return NextResponse.json({ error: "User no longer exists." }, { status: 401 });
    }

    const accessToken = generateAccessToken({ userId: user.id, email: user.email });
    return NextResponse.json({
      accessToken,
      user: {
        id: user.id,
        name: user.name ?? user.email,
        email: user.email,
        verified: user.verified,
      },
    });
  } catch (err) {
    console.error("Refresh error:", err);
    return NextResponse.json({ error: "Invalid refresh token." }, { status: 401 });
  }
}
