import { NextResponse } from "next/server";
import { z } from "zod";
import { comparePassword, findUserByEmail } from "@/lib/auth";
import { generateAccessToken, generateRefreshToken, refreshTokenCookieOptions } from "@/lib/tokens";

const loginSchema = z.object({
  email: z.string().trim().email().toLowerCase(),
  password: z.string().min(1),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password } = loginSchema.parse(body);

    const user = await findUserByEmail(email);
    if (!user?.passwordHash) {
      return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
    }

    const validPassword = await comparePassword(password, user.passwordHash);
    if (!validPassword) {
      return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
    }

    if (!user.verified) {
      return NextResponse.json({ error: "Please verify your email before logging in." }, { status: 403 });
    }

    const payload = { userId: user.id, email: user.email };
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);
    const res = NextResponse.json({
      accessToken,
      user: {
        id: user.id,
        name: user.name ?? user.email,
        email: user.email,
        verified: user.verified,
      },
    });

    res.cookies.set("refreshToken", refreshToken, refreshTokenCookieOptions);
    return res;
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.flatten().fieldErrors }, { status: 400 });
    }

    console.error("Login error:", err);
    return NextResponse.json({ error: "Login failed." }, { status: 500 });
  }
}
