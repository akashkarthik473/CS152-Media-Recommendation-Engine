import { useState, type FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { FormField } from "../components/ui/FormField";
import { Alert } from "../components/ui/Alert";
import { ApiError } from "../api/client";
import { useAuth } from "../hooks/useAuth";
import "./AuthPage.css";

// shape of the location state we read after ProtectedRoute redirects an anonymous user
// here, so we can bounce them back to the page they originally wanted
type LocationState = { from?: string };


// Login page component, collects username and password, calls the auth context login,
// and redirects either to the page the user was trying to reach or to the home page
// Output: JSX login form
export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  // path the user was trying to reach before being bounced to login, defaults to home
  const redirectTo = (location.state as LocationState | null)?.from ?? "/";

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  /*
  * Purpose: submits the login form, exchanges credentials for a JWT, and navigates the
  *          user to their original destination on success
  * Input: HTML Form Event Element
  * Output: None
  */
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      //asks the auth context to log in, which stores the token and loads the user profile
      await login({ username, password });
      //replace history so the back button doesn't bring them back to the login screen
      navigate(redirectTo, { replace: true });
    } catch (err) {
      //surface backend message if available, otherwise show a generic failure
      setError(err instanceof ApiError ? err.message : "Login failed. Try again.");
    } finally {
      //always stop the loading state so the user can retry
      setLoading(false);
    }
  };

  return (
    <div className="auth">
      <Card className="auth__card">
        <header className="auth__header">
          <h1 className="auth__title">Welcome back</h1>
          <p className="auth__subtitle">Log in to continue to RecFinder.</p>
        </header>

        {error ? <Alert variant="error">{error}</Alert> : null}

        <form className="auth__form" onSubmit={handleSubmit}>
          <FormField label="Username" htmlFor="username">
            <Input
              id="username"
              type="text"
              autoComplete="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </FormField>
          <FormField label="Password" htmlFor="password">
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </FormField>
          <Button type="submit" fullWidth loading={loading}>
            Log in
          </Button>
        </form>

        <p className="auth__footer">
          New here? <Link to="/signup">Create an account</Link>
        </p>
      </Card>
    </div>
  );
}
