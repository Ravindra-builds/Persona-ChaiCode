"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { ChatInterface } from "@/components/ChatInterface";
import { useAuth } from "@/components/AuthContext";

export default function HiteshPage() {
  const { accessToken, user, refreshAccessToken } = useAuth();
  const router = useRouter();

  useEffect(() => {
    (async () => {
      if (!accessToken && !user) {
        const token = await refreshAccessToken();
        if (!token) router.replace("/login");
      }
    })();
  }, [accessToken, user, refreshAccessToken, router]);

  return <ChatInterface mentor="hitesh" />;
}
