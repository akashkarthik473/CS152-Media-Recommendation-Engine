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

type LocationState = { from?: string };

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = (location.state as LocationState | null)?.from ?? "/";

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await login({ username, password });
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Login failed. Try again.");
    } finally {
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
