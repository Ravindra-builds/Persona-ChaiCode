import bcrypt from "bcryptjs";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import {
  createUserFallback,
  findUserByEmailFallback,
  findUserByGoogleIdFallback,
  linkGoogleAccountFallback,
  updateUserVerificationFallback,
} from "@/lib/auth-store";

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

async function isDatabaseAvailable() {
  try {
    await db.execute("select 1");
    return true;
  } catch {
    return false;
  }
}

export async function findUserByEmail(email: string) {
  const canUseDb = await isDatabaseAvailable();
  if (!canUseDb) {
    return findUserByEmailFallback(email);
  }

  const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
  return result[0] ?? null;
}

export async function findUserByGoogleId(googleId: string) {
  const canUseDb = await isDatabaseAvailable();
  if (!canUseDb) {
    return findUserByGoogleIdFallback(googleId);
  }

  const result = await db.select().from(users).where(eq(users.googleId, googleId)).limit(1);
  return result[0] ?? null;
}

export async function createUser(data: {
  name: string;
  email: string;
  passwordHash?: string;
  googleId?: string;
  verified?: boolean;
}) {
  const canUseDb = await isDatabaseAvailable();
  if (!canUseDb) {
    return createUserFallback(data);
  }

  const result = await db.insert(users).values(data).returning();
  return result[0];
}

export async function updateUserVerification(userId: string, verified: boolean) {
  const canUseDb = await isDatabaseAvailable();
  if (!canUseDb) {
    await updateUserVerificationFallback(userId, verified);
    return;
  }

  await db.update(users).set({ verified, updatedAt: new Date() }).where(eq(users.id, userId));
}

export async function linkGoogleAccount(userId: string, googleId: string) {
  const canUseDb = await isDatabaseAvailable();
  if (!canUseDb) {
    await linkGoogleAccountFallback(userId, googleId);
    return;
  }

  await db.update(users).set({ googleId, verified: true, updatedAt: new Date() }).where(eq(users.id, userId));
}
