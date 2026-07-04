import { NextResponse } from "next/server";
import { env } from "@/config/env";

export async function GET() {
  if (!env.GOOGLE_CLIENT_ID || !env.GOOGLE_REDIRECT_URI) {
    return NextResponse.json({ error: "Google OAuth is not configured." }, { status: 501 });
  }

  const url = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  url.searchParams.set("client_id", env.GOOGLE_CLIENT_ID);
  url.searchParams.set("redirect_uri", env.GOOGLE_REDIRECT_URI);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", "openid email profile");
  url.searchParams.set("prompt", "select_account");

  return NextResponse.redirect(url);
}
