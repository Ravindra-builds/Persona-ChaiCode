import { NextResponse } from "next/server";
import { z } from "zod";
import { findUserByEmail, updateUserVerification } from "@/lib/auth";
import { verifyOtpCode } from "@/services/otpService";

const otpSchema = z.object({
  email: z.string().trim().email().toLowerCase(),
  code: z.string().trim().regex(/^\d{6}$/, "OTP must be 6 digits."),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, code } = otpSchema.parse(body);

    const user = await findUserByEmail(email);
    if (!user) {
      return NextResponse.json({ error: "No account found for this email." }, { status: 404 });
    }

    try {
      await verifyOtpCode({ email, otp: code });
    } catch {
      return NextResponse.json({ error: "Invalid or expired OTP." }, { status: 400 });
    }

    await updateUserVerification(user.id, true);
    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.flatten().fieldErrors }, { status: 400 });
    }

    console.error("OTP verify error:", err);
    return NextResponse.json({ error: "OTP verification failed." }, { status: 500 });
  }
}
