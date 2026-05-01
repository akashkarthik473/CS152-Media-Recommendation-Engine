import { createContext, useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { authApi } from "../api/auth";
import { tokenStorage } from "../lib/storage";
import type { User } from "../types";

type AuthStatus = "loading" | "authenticated" | "anonymous";

export type AuthContextValue = {
  status: AuthStatus;
  user: User | null;
  login: (input: { username: string; password: string }) => Promise<void>;
  signup: (input: { username: string; email: string; password: string }) => Promise<void>;
  logout: () => void;
};

export const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [status, setStatus] = useState<AuthStatus>("loading");

  const hydrate = useCallback(async () => {
    if (!tokenStorage.get()) {
      setStatus("anonymous");
      return;
    }
    try {
      const me = await authApi.me();
      setUser(me);
      setStatus("authenticated");
    } catch {
      tokenStorage.clear();
      setUser(null);
      setStatus("anonymous");
    }
  }, []);

  useEffect(() => {
    void hydrate();
  }, [hydrate]);

  const login = useCallback(async (input: { username: string; password: string }) => {
    const token = await authApi.login(input);
    tokenStorage.set(token.access_token);
    const me = await authApi.me();
    setUser(me);
    setStatus("authenticated");
  }, []);

  const signup = useCallback(
    async (input: { username: string; email: string; password: string }) => {
      await authApi.signup(input);
      await login({ username: input.username, password: input.password });
    },
    [login],
  );

  const logout = useCallback(() => {
    tokenStorage.clear();
    setUser(null);
    setStatus("anonymous");
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({ status, user, login, signup, logout }),
    [status, user, login, signup, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
