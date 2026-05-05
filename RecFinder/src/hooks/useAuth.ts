import { useContext } from "react";
import { AuthContext, type AuthContextValue } from "../context/AuthContext";

// convenience hook that pulls the auth value out of context and throws if it is used
// outside of an AuthProvider, used by every component that needs to know who the user is
// Output: AuthContextValue
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
