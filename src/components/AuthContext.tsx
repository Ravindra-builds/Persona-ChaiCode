"use client";

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";

interface User {
  id: string;
  name: string;
  email: string;
  verified: boolean;
}

interface AuthContextType {
  user: User | null;
  accessToken: string | null;
  login: (accessToken: string, user: User) => void;
  logout: () => void;
  refreshAccessToken: () => Promise<string | null>;
}

interface RefreshResponse {
  accessToken: string;
  user?: User;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);

  const login = useCallback((token: string, userData: User) => {
    setAccessToken(token);
    setUser(userData);
  }, []);

  const logout = useCallback(async () => {
    setAccessToken(null);
    setUser(null);
    await fetch("/api/auth/logout", { method: "POST" });
  }, []);

  const refreshAccessToken = useCallback(async (): Promise<string | null> => {
    try {
      const res = await fetch("/api/auth/refresh", { method: "POST" });
      if (!res.ok) return null;

      const data = (await res.json()) as RefreshResponse;
      setAccessToken(data.accessToken);
      if (data.user) setUser(data.user);
      return data.accessToken;
    } catch {
      return null;
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      refreshAccessToken();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [refreshAccessToken]);

  return (
    <AuthContext.Provider value={{ user, accessToken, login, logout, refreshAccessToken }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
