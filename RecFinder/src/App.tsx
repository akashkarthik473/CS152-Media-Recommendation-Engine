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

// Router definition for the entire app, pages are nested under AppLayout so the navbar
// always renders, then split into ProtectedRoute (auth required) and PublicOnlyRoute
// (only visible to anonymous users) groups, with a catch-all 404 at the end
const router = createBrowserRouter([
  {
    Component: AppLayout,
    children: [
      {
        // pages here are guarded by ProtectedRoute and require a logged in user
        Component: ProtectedRoute,
        children: [
            { index: true, Component: HomePage },
            {index: true, path: "list", Component: MediaListPage}
        ],
      },
      {
        // pages here bounce already-logged-in users back to the home page
        Component: PublicOnlyRoute,
        children: [
          { path: "login", Component: LoginPage },
          { path: "signup", Component: SignupPage },
        ],
      },
      // catch-all that renders the 404 page for any unknown route
      { path: "*", Component: NotFoundPage },
    ],
  },
]);


// Root App component that wires the auth provider around the router so every page can
// read the current auth status through the useAuth hook
// Output: JSX root tree
export function App() {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  );
}
