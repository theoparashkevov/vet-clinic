"use client";

import type { ReactNode } from "react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { apiJson, AuthError } from "../lib/api";

// Client-specific types
export type ClientUser = {
  id: string;
  name: string;
  email: string;
  role: "client";
  phone?: string;
};

export type ClientSession = {
  accessToken: string;
  user: ClientUser;
};

// Storage keys for client auth (separate from staff auth)
const CLIENT_TOKEN_KEY = "vet-clinic-client.access-token";
const CLIENT_USER_KEY = "vet-clinic-client.user";
export const CLIENT_AUTH_CHANGED_EVENT = "vet-clinic-client-auth-changed";

type LoginResponse = ClientSession;

type ClientAuthContextValue = {
  user: ClientUser | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
};

const ClientAuthContext = createContext<ClientAuthContextValue | null>(null);

// Helper functions for client storage
function canUseStorage() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function emitClientAuthChanged() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(CLIENT_AUTH_CHANGED_EVENT));
  }
}

export function getClientStoredToken() {
  if (!canUseStorage()) return null;
  return window.localStorage.getItem(CLIENT_TOKEN_KEY);
}

export function getClientStoredUser(): ClientUser | null {
  if (!canUseStorage()) return null;
  const raw = window.localStorage.getItem(CLIENT_USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as ClientUser;
  } catch {
    return null;
  }
}

export function getClientStoredSession(): ClientSession | null {
  const accessToken = getClientStoredToken();
  const user = getClientStoredUser();
  if (!accessToken || !user) return null;
  return { accessToken, user };
}

export function persistClientSession(session: ClientSession) {
  if (!canUseStorage()) return;
  window.localStorage.setItem(CLIENT_TOKEN_KEY, session.accessToken);
  window.localStorage.setItem(CLIENT_USER_KEY, JSON.stringify(session.user));
  emitClientAuthChanged();
}

export function clearClientSession() {
  if (!canUseStorage()) return;
  window.localStorage.removeItem(CLIENT_TOKEN_KEY);
  window.localStorage.removeItem(CLIENT_USER_KEY);
  emitClientAuthChanged();
}

// Provider component
export function ClientAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<ClientUser | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const syncFromStorage = useCallback(async () => {
    const session = getClientStoredSession();

    if (!session) {
      setUser(null);
      setAccessToken(null);
      setLoading(false);
      return;
    }

    setUser(session.user);
    setAccessToken(session.accessToken);

    // Verify session is still valid
    try {
      const freshUser = await apiJson<ClientUser>("/v1/client/me", {
        headers: {
          Authorization: `Bearer ${session.accessToken}`,
        },
      });
      persistClientSession({ accessToken: session.accessToken, user: freshUser });
      setUser(freshUser);
    } catch (e: unknown) {
      if (e instanceof AuthError) {
        clearClientSession();
        setUser(null);
        setAccessToken(null);
        setError("Your session has expired. Please sign in again.");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    syncFromStorage();

    const handleAuthChanged = () => {
      const session = getClientStoredSession();
      setUser(session?.user ?? null);
      setAccessToken(session?.accessToken ?? null);
      setLoading(false);
    };

    window.addEventListener(CLIENT_AUTH_CHANGED_EVENT, handleAuthChanged);
    return () =>
      window.removeEventListener(CLIENT_AUTH_CHANGED_EVENT, handleAuthChanged);
  }, [syncFromStorage]);

  const login = useCallback(async (email: string, password: string) => {
    setError(null);
    const session = await apiJson<LoginResponse>(
      "/v1/client/auth/login",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      },
      { auth: false }
    );

    persistClientSession(session);
    setUser(session.user);
    setAccessToken(session.accessToken);
  }, []);

  const logout = useCallback(async () => {
    try {
      await apiJson("/v1/client/auth/logout", { method: "POST" });
    } catch {
      // Ignore logout errors
    }
    clearClientSession();
    setUser(null);
    setAccessToken(null);
  }, []);

  const clearError = useCallback(() => setError(null), []);

  const value = useMemo<ClientAuthContextValue>(
    () => ({
      user,
      accessToken,
      isAuthenticated: Boolean(user && accessToken),
      loading,
      error,
      login,
      logout,
      clearError,
    }),
    [accessToken, loading, error, login, logout, clearError, user]
  );

  return (
    <ClientAuthContext.Provider value={value}>
      {children}
    </ClientAuthContext.Provider>
  );
}

export function useClientAuth() {
  const context = useContext(ClientAuthContext);
  if (!context) {
    throw new Error("useClientAuth must be used within ClientAuthProvider");
  }
  return context;
}

// Hook for protected routes
export function useRequireClientAuth() {
  const { isAuthenticated, loading, user } = useClientAuth();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (!loading) {
      setIsReady(true);
    }
  }, [loading]);

  return {
    isAuthenticated,
    loading,
    isReady,
    user,
  };
}
