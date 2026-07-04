import jwt, { type SignOptions } from "jsonwebtoken";
import { env } from "@/config/env";

interface TokenPayload {
  userId: string;
  email: string;
}

export function generateAccessToken(payload: TokenPayload): string {
  const opts: SignOptions = { expiresIn: env.ACCESS_TOKEN_EXPIRY as any };
  return jwt.sign(payload, env.JWT_SECRET, opts);
}

export function generateRefreshToken(payload: TokenPayload): string {
  const opts: SignOptions = { expiresIn: env.REFRESH_TOKEN_EXPIRY as any };
  return jwt.sign(payload, env.JWT_REFRESH_SECRET, opts);
}

export function verifyAccessToken(token: string): TokenPayload {
  return jwt.verify(token, env.JWT_SECRET) as TokenPayload;
}

export function verifyRefreshToken(token: string): TokenPayload {
  return jwt.verify(token, env.JWT_REFRESH_SECRET) as TokenPayload;
}

export const refreshTokenCookieOptions = {
  httpOnly: true,
  secure: env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: 7 * 24 * 60 * 60,
};
