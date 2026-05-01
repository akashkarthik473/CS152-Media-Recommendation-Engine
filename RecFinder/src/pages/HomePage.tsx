import { useState, type FormEvent } from "react";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Select } from "../components/ui/Select";
import { Alert } from "../components/ui/Alert";
import { recommendationsApi } from "../api/recommendations";
import { ApiError } from "../api/client";
import { useAuth } from "../hooks/useAuth";
import type { MediaType } from "../types";
import "./HomePage.css";

const MEDIA_OPTIONS: { value: MediaType; label: string }[] = [
  { value: "any", label: "Any" },
  { value: "movies", label: "Movies" },
  { value: "tv", label: "TV Shows" },
  { value: "books", label: "Books" },
  { value: "games", label: "Games" },
];

export function HomePage() {
  const { user } = useAuth();
  const [query, setQuery] = useState("");
  const [mediaType, setMediaType] = useState<MediaType>("any");
  const [recs, setRecs] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    setError(null);
    setRecs("");
    try {
      const res = await recommendationsApi.generate({ query, mediaType });
      setRecs(res.recommendations);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="home">
      <header className="home__hero">
        <h1 className="home__title">
          {user ? `Welcome back, ${user.username}` : "Find your next favorite"}
        </h1>
        <p className="home__subtitle">
          Tell us what you love and we&apos;ll surface five tailored recommendations.
        </p>
      </header>

      <Card className="home__card">
        <form className="home__form" onSubmit={handleSubmit}>
          <Select
            aria-label="Media type"
            value={mediaType}
            onChange={(e) => setMediaType(e.target.value as MediaType)}
            options={MEDIA_OPTIONS}
            className="home__select"
          />
          <Input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="e.g. Inception, Severance, The Witcher 3…"
            className="home__input"
          />
          <Button type="submit" loading={loading} disabled={!query.trim()}>
            Recommend
          </Button>
        </form>
      </Card>

      {error ? (
        <div className="home__feedback">
          <Alert variant="error">{error}</Alert>
        </div>
      ) : null}

      {recs ? (
        <Card className="home__results" padding="lg">
          <h2 className="home__results-title">Recommendations</h2>
          <pre className="home__results-body">{recs}</pre>
        </Card>
      ) : null}
    </div>
  );
}
