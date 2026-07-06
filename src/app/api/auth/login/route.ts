import { NextResponse } from "next/server";
import { z } from "zod";
import { comparePassword, findUserByEmail } from "@/lib/auth";
import { generateAccessToken, generateRefreshToken, refreshTokenCookieOptions } from "@/lib/tokens";
import { checkLoginRateLimit, resetRateLimit } from "@/utils/rateLimitingUtils";
import {
  handleApiError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  DatabaseError,
} from "@/utils/errorHandler";

const loginSchema = z.object({
  email: z.string().trim().email().toLowerCase(),
  password: z.string().min(1, "Password is required"),
});

export async function POST(req: Request) {
  try {
    let userIdentifier = req.headers.get("x-forwarded-for") || "unknown";

    try {
  
      const body = await req.json();
      userIdentifier = body.email || userIdentifier;
      await checkLoginRateLimit(userIdentifier);

      const { email, password } = loginSchema.parse(body);

      // Find user by email
      const user = await findUserByEmail(email);
      if (!user?.passwordHash) {
        return handleApiError(
          new AuthenticationError("Invalid email or password."),
          "Login: Invalid credentials"
        );
      }

      // Verify password
      const validPassword = await comparePassword(password, user.passwordHash);
      if (!validPassword) {
        return handleApiError(
          new AuthenticationError("Invalid email or password."),
          "Login: Invalid password"
        );
      }

      // Check email verification
      if (!user.verified) {
        return handleApiError(
          new AuthorizationError("Please verify your email before logging in."),
          "Login: Email not verified"
        );
      }

      // Generate tokens
      const payload = { userId: user.id, email: user.email };
      const accessToken = generateAccessToken(payload);
      const refreshToken = generateRefreshToken(payload);

      // Reset rate limit on successful login
      await resetRateLimit(`login:${email}`);

      const res = NextResponse.json({
        success: true,
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
        return handleApiError(
          new ValidationError("Validation failed", err.flatten().fieldErrors as any),
          "Login: Validation error"
        );
      }
      throw err;
    }
  } catch (err) {
    return handleApiError(err, "Login: Unexpected error");
  }
}
