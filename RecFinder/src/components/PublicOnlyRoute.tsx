import { Navigate, Outlet } from "react-router";
import { useAuth } from "../hooks/useAuth";
import { Spinner } from "./ui/Spinner";

export function PublicOnlyRoute() {
  const { status } = useAuth();

  if (status === "loading") {
    return (
      <div className="route-loading">
        <Spinner label="Loading…" />
      </div>
    );
  }

  if (status === "authenticated") {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
