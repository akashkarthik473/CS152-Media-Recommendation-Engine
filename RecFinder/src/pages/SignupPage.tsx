import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { FormField } from "../components/ui/FormField";
import { Alert } from "../components/ui/Alert";
import { ApiError } from "../api/client";
import { useAuth } from "../hooks/useAuth";
import "./AuthPage.css";

export function SignupPage() {
  const { signup } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await signup({ username, email, password });
      navigate("/", { replace: true });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Sign up failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth">
      <Card className="auth__card">
        <header className="auth__header">
          <h1 className="auth__title">Create your account</h1>
          <p className="auth__subtitle">Get personalized recommendations in seconds.</p>
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
          <FormField label="Email" htmlFor="email">
            <Input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </FormField>
          <FormField label="Password" htmlFor="password" hint="At least 8 characters.">
            <Input
              id="password"
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={8}
              required
            />
          </FormField>
          <Button type="submit" fullWidth loading={loading}>
            Create account
          </Button>
        </form>

        <p className="auth__footer">
          Already have an account? <Link to="/login">Log in</Link>
        </p>
      </Card>
    </div>
  );
}
