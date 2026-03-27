"use client";

import type { ReactNode } from "react";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { apiJson } from "../lib/api";
import { AuthSession, AuthUser, clearSession, getStoredSession, persistSession } from "../lib/auth";

type LoginResponse = AuthSession;

type AuthContextValue = {
  user: AuthUser | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const syncFromStorage = useCallback(async () => {
    const session = getStoredSession();

    if (!session) {
      setUser(null);
      setAccessToken(null);
      setLoading(false);
      return;
    }

    setUser(session.user);
    setAccessToken(session.accessToken);

    try {
      const freshUser = await apiJson<AuthUser>("/v1/auth/me");
      persistSession({ accessToken: session.accessToken, user: freshUser });
      setUser(freshUser);
      setAccessToken(session.accessToken);
    } catch {
      clearSession();
      setUser(null);
      setAccessToken(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    syncFromStorage();

    const handleAuthChanged = () => {
      const session = getStoredSession();
      setUser(session?.user ?? null);
      setAccessToken(session?.accessToken ?? null);
      setLoading(false);
    };

    window.addEventListener("vet-clinic-auth-changed", handleAuthChanged);
    return () => window.removeEventListener("vet-clinic-auth-changed", handleAuthChanged);
  }, [syncFromStorage]);

  const login = useCallback(async (email: string, password: string) => {
    const session = await apiJson<LoginResponse>(
      "/v1/auth/login",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      },
      { auth: false },
    );

    persistSession(session);
    setUser(session.user);
    setAccessToken(session.accessToken);
  }, []);

  const logout = useCallback(() => {
    clearSession();
    setUser(null);
    setAccessToken(null);
  }, []);

  const value = useMemo<AuthContextValue>(() => ({
    user,
    accessToken,
    isAuthenticated: Boolean(user && accessToken),
    loading,
    login,
    logout,
  }), [accessToken, loading, login, logout, user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
}
