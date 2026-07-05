import crypto from "crypto";
import { db } from "@/db";
import { otps } from "@/db/schema";
import { eq, and, gt } from "drizzle-orm";
import { sendOtpEmail } from "@/services/emailService";

const otpStore = new Map<string, { code: string; expiresAt: Date; used: boolean }>();

export function generateOtp(): string {
  return crypto.randomInt(100000, 999999).toString();
}

async function isDatabaseAvailable() {
  try {
    await db.execute("select 1");
    return true;
  } catch {
    return false;
  }
}

export async function createOtp(userId: string): Promise<string> {
  const code = generateOtp();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

  const canUseDb = await isDatabaseAvailable();
  if (canUseDb) {
    await db.insert(otps).values({ userId, code, expiresAt });
  } else {
    otpStore.set(userId, { code, expiresAt, used: false });
  }

  return code;
}

export async function verifyOtp(userId: string, code: string): Promise<boolean> {
  const canUseDb = await isDatabaseAvailable();

  if (!canUseDb) {
    const stored = otpStore.get(userId);
    if (!stored || stored.used || stored.code !== code || stored.expiresAt <= new Date()) {
      return false;
    }

    stored.used = true;
    otpStore.set(userId, stored);
    return true;
  }

  const now = new Date();
  const result = await db
    .select()
    .from(otps)
    .where(and(eq(otps.userId, userId), eq(otps.code, code), eq(otps.used, false), gt(otps.expiresAt, now)))
    .limit(1);

  if (result.length === 0) return false;

  await db.update(otps).set({ used: true }).where(eq(otps.id, result[0].id));
  return true;
}

export async function deliverOtp(_userId: string, email: string, code: string): Promise<void> {
  await sendOtpEmail(email, code);
}
