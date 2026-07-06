import { NextResponse } from "next/server";
import { z } from "zod";
import { findUserByEmail, updateUserVerification } from "@/lib/auth";
import { verifyOtpCode } from "@/services/otpService";
import { checkOtpRateLimit } from "@/utils/rateLimitingUtils";
import {
  handleApiError,
  ValidationError,
  NotFoundError,
  AuthenticationError,
  EmailServiceError,
} from "@/utils/errorHandler";

const otpSchema = z.object({
  email: z.string().trim().email("Invalid email format").toLowerCase(),
  code: z.string().trim().regex(/^\d{6}$/, "OTP must be 6 digits."),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, code } = otpSchema.parse(body);

    // Rate limit check
    try {
      await checkOtpRateLimit(email);
    } catch (rateLimitError) {
      return handleApiError(rateLimitError, "OTP Verify: Rate limit exceeded");
    }

    // Find user
    const user = await findUserByEmail(email);
    if (!user) {
      return handleApiError(
        new NotFoundError("User"),
        "OTP Verify: User not found"
      );
    }

    // Verify OTP
    try {
      await verifyOtpCode({ email, otp: code });
    } catch (otpError) {
      return handleApiError(
        new AuthenticationError(
          "Invalid or expired OTP. Please request a new one."
        ),
        "OTP Verify: Invalid OTP"
      );
    }

    // Update user verification status
    try {
      await updateUserVerification(user.id, true);
    } catch (updateError) {
      return handleApiError(
        new EmailServiceError("Failed to verify email. Please try again."),
        "OTP Verify: Update verification failed"
      );
    }

    return NextResponse.json({
      success: true,
      message: "Email verified successfully",
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return handleApiError(
        new ValidationError("Validation failed", err.flatten().fieldErrors as any),
        "OTP Verify: Validation error"
      );
    }
    return handleApiError(err, "OTP Verify: Unexpected error");
  }
}
