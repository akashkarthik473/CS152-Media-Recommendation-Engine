import { Link, NavLink, useNavigate } from "react-router";
import { useAuth } from "../hooks/useAuth";
import { Button } from "./ui/Button";
import "./Navbar.css";

// Navbar shown at the top of every page, switches between auth'd and anonymous controls
// based on the current auth status pulled from AuthContext
// Output: JSX header containing the brand, page links, and user/auth actions
export function Navbar() {
  const { status, user, logout } = useAuth();
  const navigate = useNavigate();

  // logs the user out and bounces them back to the login page
  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="navbar">
      <div className="navbar__inner">
        <Link to="/" className="navbar__brand">
          <span className="navbar__brand-mark" aria-hidden />
          <span className="navbar__brand-text">RecFinder</span>
        </Link>

        <nav className="navbar__links">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              isActive ? "navbar__link navbar__link--active" : "navbar__link"
            }
          >
            Discover
          </NavLink>
          <NavLink  
            to="/list"
            end
            className={({ isActive }) =>
              isActive ? "navbar__link navbar__link--active" : "navbar__link"
            }
          >
           List
          </NavLink>
        </nav>

        <div className="navbar__actions">
          {status === "authenticated" && user ? (
            <>
              <span className="navbar__user">@{user.username}</span>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                Sign out
              </Button>
            </>
          ) : status === "anonymous" ? (
            <>
              <Link to="/login">
                <Button variant="ghost" size="sm">
                  Log in
                </Button>
              </Link>
              <Link to="/signup">
                <Button variant="primary" size="sm">
                  Sign up
                </Button>
              </Link>
            </>
          ) : null}
        </div>
      </div>
    </header>
  );
}
