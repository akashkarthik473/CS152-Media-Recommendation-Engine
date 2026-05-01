import { Navigate, Outlet, useLocation } from "react-router";
import { useAuth } from "../hooks/useAuth";
import { Spinner } from "./ui/Spinner";

export function ProtectedRoute() {
  const { status } = useAuth();
  const location = useLocation();

  if (status === "loading") {
    return (
      <div className="route-loading">
        <Spinner label="Loading…" />
      </div>
    );
  }

  if (status === "anonymous") {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return <Outlet />;
}
