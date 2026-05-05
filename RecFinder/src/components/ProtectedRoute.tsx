import { Navigate, Outlet, useLocation } from "react-router";
import { useAuth } from "../hooks/useAuth";
import { Spinner } from "./ui/Spinner";

// Route guard wrapped around routes that require a logged in user, shows a spinner
// while auth is resolving and redirects anonymous users to /login
// Output: JSX Outlet, Spinner, or Navigate depending on auth status
export function ProtectedRoute() {
  const { status } = useAuth();
  const location = useLocation();

  // still resolving the stored token so show a loading spinner instead of flickering
  // between a redirect and the protected page
  if (status === "loading") {
    return (
      <div className="route-loading">
        <Spinner label="Loading…" />
      </div>
    );
  }

  // not logged in so send them to /login and remember where they were trying to go so we
  // can bounce them back after a successful login
  if (status === "anonymous") {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return <Outlet />;
}
