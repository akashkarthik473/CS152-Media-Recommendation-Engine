import { Link } from "react-router";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";

export function NotFoundPage() {
  return (
    <div className="auth">
      <Card className="auth__card" padding="lg">
        <header className="auth__header">
          <h1 className="auth__title">Page not found</h1>
          <p className="auth__subtitle">The page you&apos;re looking for doesn&apos;t exist.</p>
        </header>
        <Link to="/">
          <Button fullWidth>Back to home</Button>
        </Link>
      </Card>
    </div>
  );
}
