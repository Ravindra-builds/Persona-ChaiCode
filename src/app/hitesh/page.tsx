"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { ChatInterface } from "@/components/ChatInterface";

export default function PiyushPage() {
  const { isLoaded, isSignedIn } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.replace("/login");
    }
  }, [isLoaded, isSignedIn, router]);

  if (!isLoaded) {
    return null; // or a loading spinner
  }

  if (!isSignedIn) {
    return null;
  }

  return <ChatInterface mentor="hitesh" />;
}