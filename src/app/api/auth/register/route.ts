import { NextResponse } from "next/server";
import { z } from "zod";
import { createUser, findUserByEmail, hashPassword } from "@/lib/auth";
import { createAndSendOtp } from "@/services/otpService";
import { checkRegistrationRateLimit } from "@/utils/rateLimitingUtils";
import {
  handleApiError,
  ValidationError,
  AppError,
  EmailServiceError,
} from "@/utils/errorHandler";

const registerSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(255, "Name is too long"),
  email: z.string().trim().email("Invalid email format").max(255).toLowerCase(),
  password: z.string().min(6, "Password must be at least 6 characters").max(128, "Password is too long"),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, password } = registerSchema.parse(body);

    try {
      await checkRegistrationRateLimit(email);
    } catch (rateLimitError) {
      return handleApiError(rateLimitError, "Register: Rate limit exceeded");
    }

    // Check if user already exists
    const existing = await findUserByEmail(email);
    if (existing) {
      return handleApiError(
        new AppError(
          "An account with this email already exists.",
          409,
          "CONFLICT_ERROR"
        ),
        "Register: User already exists"
      );
    }

    const passwordHash = await hashPassword(password);
    const user = await createUser({ name, email, passwordHash, verified: false });

    try {
      await createAndSendOtp({ email, name });
    } catch (emailError) {
      return handleApiError(
        new EmailServiceError(
          "Failed to send OTP. Please try again or contact support."
        ),
        "Register: OTP send failed"
      );
    }

    return NextResponse.json({
      success: true,
      message: "Account created. Check your inbox for the OTP.",
      userId: user.id,
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return handleApiError(
        new ValidationError("Validation failed", err.flatten().fieldErrors as any),
        "Register: Validation error"
      );
    }
    return handleApiError(err, "Register: Unexpected error");
  }
}
