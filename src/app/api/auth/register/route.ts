import { NextResponse } from "next/server";
import { z } from "zod";
import { createUser, findUserByEmail, hashPassword } from "@/lib/auth";
import { createOtp } from "@/lib/otp";

const registerSchema = z.object({
  name: z.string().trim().min(2).max(255),
  email: z.string().trim().email().max(255).toLowerCase(),
  password: z.string().min(6).max(128),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, password } = registerSchema.parse(body);

    const existing = await findUserByEmail(email);
    if (existing) {
      return NextResponse.json({ error: "An account with this email already exists." }, { status: 409 });
    }

    const passwordHash = await hashPassword(password);
    const user = await createUser({ name, email, passwordHash, verified: false });
    const code = await createOtp(user.id);

    console.info(`OTP for ${email}: ${code}`);
    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.flatten().fieldErrors }, { status: 400 });
    }

    console.error("Register error:", err);
    return NextResponse.json({ error: "Registration failed." }, { status: 500 });
  }
}
