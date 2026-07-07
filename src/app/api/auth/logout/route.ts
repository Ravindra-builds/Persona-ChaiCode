import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

/**
 * Logout endpoint
 * Clerk handles session termination via their UI components
 */
export async function POST() {
  try {
    // Clerk's signOut should be called from client-side components
    // This endpoint is kept for consistency
    return NextResponse.json({ 
      success: true,
      message: "Logout successful. Please use Clerk's SignOut component on client-side." 
    });
  } catch (err) {
    return NextResponse.json({ error: "Logout failed" }, { status: 500 });
  }
}
