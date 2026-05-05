import { createContext, useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { authApi } from "../api/auth";
import { api } from "../api/client";
import { mediaListStorage, tokenStorage } from "../lib/storage";
import type { User } from "../types";

// the three possible states the app can be in: still hydrating, signed in, or signed out
type AuthStatus = "loading" | "authenticated" | "anonymous";

// shape of the value exposed by the AuthContext, consumed through the useAuth hook
// status: current AuthStatus
// user: the logged in User or null
// login/signup/logout: functions that mutate auth state and the stored token
export type AuthContextValue = {
  status: AuthStatus;
  user: User | null;
  login: (input: { username: string; password: string }) => Promise<void>;
  signup: (input: { username: string; email: string; password: string }) => Promise<void>;
  logout: () => void;
};

// React context that holds the auth value, defaults to null so useAuth can throw if it
// is consumed outside of an AuthProvider
export const AuthContext = createContext<AuthContextValue | null>(null);


// Provider component that owns the auth state and exposes login/signup/logout helpers
// to the rest of the tree, mounted near the root of the app
// Input: children to render inside the provider
// Output: JSX AuthContext.Provider wrapping the children
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [status, setStatus] = useState<AuthStatus>("loading");

  // on mount we check if a token is already in localStorage and try to fetch the matching
  // user, if the token is missing or invalid we drop into the anonymous state
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
      // token was bad so wipe it and treat the user as logged out
      tokenStorage.clear();
      setUser(null);
      setStatus("anonymous");
    }
  }, []);

  // run the hydrate flow exactly once when the provider mounts
  useEffect(() => {
    void hydrate();
  }, [hydrate]);

  // logs the user in by exchanging credentials for a token, persisting it, then loading
  // the user profile and their saved media list
  // Input: object with username and password
  const login = useCallback(async (input: { username: string; password: string }) => {
    const token = await authApi.login(input);
    tokenStorage.set(token.access_token);
    const me = await authApi.me();
    setUser(me);
    setStatus("authenticated");

    //After Logging in application calls the media_list api to retreive past media they have stored
    try {
      const mediaList = await api.post<any[]>("/media_list", { user_id: me.id }, { auth: true });
      mediaListStorage.set(mediaList);
      console.log("Loaded user media list", mediaList);
    } catch (error) {
      // failed to fetch the saved list, clear any stale local copy so we don't show wrong data
      mediaListStorage.clear();
      console.error("Failed to load user media list after login", error);
    }
  }, []);

  // signs the user up and immediately logs them in so they don't have to fill the form twice
  // Input: object with username, email, and password
  const signup = useCallback(
    async (input: { username: string; email: string; password: string }) => {
      await authApi.signup(input);
      await login({ username: input.username, password: input.password });
    },
    [login],
  );

  // logs the user out by clearing the token, the cached media list, and resetting state
  const logout = useCallback(() => {
    tokenStorage.clear();
    mediaListStorage.clear();
    setUser(null);
    setStatus("anonymous");
  }, []);

  // memoizes the context value so consumers don't re-render unless something actually changed
  const value = useMemo<AuthContextValue>(
    () => ({ status, user, login, signup, logout }),
    [status, user, login, signup, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
