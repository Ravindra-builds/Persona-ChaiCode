import { NextResponse } from "next/server";
import { createUser, findUserByEmail, findUserByGoogleId, linkGoogleAccount } from "@/lib/auth";
import { generateRefreshToken, refreshTokenCookieOptions } from "@/lib/tokens";
import { env } from "@/config/env";

interface GoogleTokenResponse {
  access_token?: string;
  error?: string;
}

interface GoogleUserInfo {
  sub: string;
  email: string;
  name?: string;
}

export async function GET(req: Request) {
  try {
    if (!env.GOOGLE_CLIENT_ID || !env.GOOGLE_CLIENT_SECRET || !env.GOOGLE_REDIRECT_URI) {
      return NextResponse.json({ error: "Google OAuth is not configured." }, { status: 501 });
    }

    const code = new URL(req.url).searchParams.get("code");
    if (!code) {
      return NextResponse.json({ error: "Missing Google OAuth code." }, { status: 400 });
    }

    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: env.GOOGLE_CLIENT_ID,
        client_secret: env.GOOGLE_CLIENT_SECRET,
        redirect_uri: env.GOOGLE_REDIRECT_URI,
        grant_type: "authorization_code",
      }),
    });

    const tokenData = (await tokenRes.json()) as GoogleTokenResponse;
    if (!tokenRes.ok || !tokenData.access_token) {
      return NextResponse.json({ error: tokenData.error ?? "Google token exchange failed." }, { status: 400 });
    }

    const userRes = await fetch("https://openidconnect.googleapis.com/v1/userinfo", {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });
    const googleUser = (await userRes.json()) as GoogleUserInfo;

    if (!userRes.ok || !googleUser.sub || !googleUser.email) {
      return NextResponse.json({ error: "Could not read Google profile." }, { status: 400 });
    }

    let user = await findUserByGoogleId(googleUser.sub);
    if (!user) {
      user = await findUserByEmail(googleUser.email);
      if (user) {
        await linkGoogleAccount(user.id, googleUser.sub);
        user = { ...user, googleId: googleUser.sub, verified: true };
      } else {
        user = await createUser({
          name: googleUser.name ?? googleUser.email,
          email: googleUser.email,
          googleId: googleUser.sub,
          verified: true,
        });
      }
    }

    const payload = { userId: user.id, email: user.email };
    const refreshToken = generateRefreshToken(payload);
    const redirectUrl = new URL("/", req.url);

    const res = NextResponse.redirect(redirectUrl);
    res.cookies.set("refreshToken", refreshToken, refreshTokenCookieOptions);
    return res;
  } catch (err) {
    console.error("Google callback error:", err);
    return NextResponse.json({ error: "Google login failed." }, { status: 500 });
  }
}
