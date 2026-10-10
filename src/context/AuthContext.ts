import { createContext, createElement, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import {  type User } from "../lib/auth";

const KEY = "apex:user";

type AuthValue = { user: User | null; setUser: (u: User | null) => void; logout: () => void };
const AuthContext = createContext<AuthValue | null>(null);

/**
 * Keeps the signed-in profile (never tokens) so the dashboard survives a refresh.
 * With a real backend, also call GET /auth/me on load to confirm the session cookie is still valid.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<User | null>(() => {
    try {
      const raw = localStorage.getItem(KEY);
      return raw ? (JSON.parse(raw) as User) : null;
    } catch {
      return null;
    }
  });

  const setUser = useCallback((u: User | null) => {
    setUserState(u);
    try {
      if (u) localStorage.setItem(KEY, JSON.stringify(u));
      else localStorage.removeItem(KEY);
    } catch { /* storage unavailable */ }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
  }, [setUser]);

  const value = useMemo(() => ({ user, setUser, logout }), [user, setUser, logout]);
  return createElement(AuthContext.Provider, { value }, children);
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}