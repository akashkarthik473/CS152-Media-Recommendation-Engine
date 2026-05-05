import { Navigate, Outlet } from "react-router";
import { useAuth } from "../hooks/useAuth";
import { Spinner } from "./ui/Spinner";

// Route guard for pages that should only be visible to anonymous users (login, signup)
// already-authenticated users are bounced back to the home page
// Output: JSX Outlet, Spinner, or Navigate depending on auth status
export function PublicOnlyRoute() {
  const { status } = useAuth();

  // wait for the auth check to finish before deciding where to send them
  if (status === "loading") {
    return (
      <div className="route-loading">
        <Spinner label="Loading…" />
      </div>
    );
  }

  // already logged in so don't show the public-only page, send them home
  if (status === "authenticated") {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
