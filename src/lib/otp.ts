import crypto from "crypto";
import { db } from "@/db";
import { otps } from "@/db/schema";
import { eq, and, gt } from "drizzle-orm";

export function generateOtp(): string {
  return crypto.randomInt(100000, 999999).toString();
}

export async function createOtp(userId: string): Promise<string> {
  const code = generateOtp();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

  await db.insert(otps).values({ userId, code, expiresAt });
  return code;
}

export async function verifyOtp(userId: string, code: string): Promise<boolean> {
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
