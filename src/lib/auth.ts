import bcrypt from "bcryptjs";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function findUserByEmail(email: string) {
  const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
  return result[0] ?? null;
}

export async function findUserByGoogleId(googleId: string) {
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
  const result = await db.insert(users).values(data).returning();
  return result[0];
}

export async function updateUserVerification(userId: string, verified: boolean) {
  await db.update(users).set({ verified, updatedAt: new Date() }).where(eq(users.id, userId));
}

export async function linkGoogleAccount(userId: string, googleId: string) {
  await db.update(users).set({ googleId, verified: true, updatedAt: new Date() }).where(eq(users.id, userId));
}
