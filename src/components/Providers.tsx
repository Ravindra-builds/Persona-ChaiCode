"use client";

import { ThemeProvider } from "./ThemeContext";
import { ClerkProvider } from "@clerk/nextjs";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <ThemeProvider>{children}</ThemeProvider>
    </ClerkProvider>
  );
}
