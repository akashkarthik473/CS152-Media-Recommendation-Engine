import { Outlet } from "react-router";
import { Navbar } from "./Navbar";
import "./AppLayout.css";

// top-level layout component that wraps every routed page with the shared Navbar so the
// nav bar stays in place while the content area swaps based on the current route
// Output: JSX shell containing the Navbar and the active route's Outlet
export function AppLayout() {
  return (
    <div className="app-shell">
      <Navbar />
      <main className="app-main">
        <Outlet />
      </main>
    </div>
  );
}
