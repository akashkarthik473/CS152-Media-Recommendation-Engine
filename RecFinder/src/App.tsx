import { createBrowserRouter, RouterProvider } from "react-router";
import { AuthProvider } from "./context/AuthContext";
import { AppLayout } from "./components/AppLayout";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { PublicOnlyRoute } from "./components/PublicOnlyRoute";
import { HomePage } from "./pages/HomePage";
import { LoginPage } from "./pages/LoginPage";
import { SignupPage } from "./pages/SignupPage";
import { NotFoundPage } from "./pages/NotFoundPage";
import {MediaListPage} from "./pages/MediaListPage";

const router = createBrowserRouter([
  {
    Component: AppLayout,
    children: [
      {
        Component: ProtectedRoute,
        children: [
            { index: true, Component: HomePage },
            {index: true, path: "list", Component: MediaListPage}
        ],
      },
      {
        Component: PublicOnlyRoute,
        children: [
          { path: "login", Component: LoginPage },
          { path: "signup", Component: SignupPage },
        ],
      },
      { path: "*", Component: NotFoundPage },
    ],
  },
]);

export function App() {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  );
}
