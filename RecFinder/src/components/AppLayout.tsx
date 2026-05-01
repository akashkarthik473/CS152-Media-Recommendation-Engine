import { Outlet } from "react-router";
import { Navbar } from "./Navbar";
import "./AppLayout.css";

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
