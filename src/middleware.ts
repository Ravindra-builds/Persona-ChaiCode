import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isPublicRoute = createRouteMatcher([
  "/login(.*)",
  "/sign-up(.*)",
  "/api/health",
  "/",
]);


export default clerkMiddleware(async (auth, req) => {
  // Allow public routes
  if (isPublicRoute(req)) {
    return NextResponse.next();
  }

  // Protect all other routes
  const { userId } = await auth();
  
  if (!userId) {
    return (await auth()).redirectToSignIn({ returnBackUrl: req.url });
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|gif|svg|ttf|woff2?|ico|cur|heic|heif|webmanifest)(?:\\?.*)?$)[^?]*(?:\\?.*)?$)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
