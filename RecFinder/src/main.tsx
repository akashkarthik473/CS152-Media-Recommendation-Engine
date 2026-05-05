import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";
import "./styles/global.css";

// entry point for the Vite build, mounts the App component into the #root element from
// index.html and wraps it in StrictMode to surface common React issues in development
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
