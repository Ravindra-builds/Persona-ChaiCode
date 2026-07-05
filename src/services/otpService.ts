import { createOtp, deliverOtp, verifyOtp } from "@/lib/otp";
import { findUserByEmail } from "@/lib/auth";

export interface CreateOtpPayload {
  email: string;
  name?: string;
}

export async function createAndSendOtp({ email }: CreateOtpPayload) {
  const user = await findUserByEmail(email);
  if (!user) {
    throw new Error("No account found for this email.");
  }

  const code = await createOtp(user.id);
  await deliverOtp(user.id, email, code);
  return { userId: user.id, code };
}

export async function verifyOtpCode({ email, otp }: { email: string; otp: string }) {
  const user = await findUserByEmail(email);
  if (!user) {
    throw new Error("No verification code found. Please request a new one.");
  }

  const isValid = await verifyOtp(user.id, otp);
  if (!isValid) {
    throw new Error("Invalid verification code.");
  }

  return true;
}
