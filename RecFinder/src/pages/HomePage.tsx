import { act, useState, type FormEvent } from "react";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Select } from "../components/ui/Select";
import { Alert } from "../components/ui/Alert";
import { recommendationsApi } from "../api/recommendations";
import { ApiError } from "../api/client";
import { useAuth } from "../hooks/useAuth";
import type { Media } from "../types"
import type { MediaType } from "../types";
import "./HomePage.css";
import { mediaListStorage } from "../lib/storage";

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
  const [listType, setListType] = useState<MediaType>("any");
  const [recs, setRecs] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"search" | "list">("search"); //controls the tabs the users is on

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

  /*
  * Purpose: gets user curated lists from local storage and queries gemini with them
  * Input: HTML Form Event Element
  * Output: None
  */
  const handleListSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    //grabs list of all the media the user has curated 
    const stored = mediaListStorage.get()

    //array to hold the fitlered media items
    let selected: Media[] = [];

    //converts mediaType labels used to control the UI to strings matching the internal labesl in each media object 
    const typeMap: Record<string, Media["mediaType"]> = {
      movies: "movie",
      tv: "tv",
      books: "book",
      games: "game",
    };

    //uses the typeMap to convert the current listType string into a string that can be used to filter the Media list
    const selectedType = typeMap[listType];

    //if listType is "any" the whole "stored" array is stored in "selected" otherwise the "stored" array is filtered by selected type and stored into "selected"
    switch (listType) {
      case "any":
        selected = stored;
        break;
      default:
        selected = stored.filter(
          (item) => item.mediaType === selectedType
        );
    }
    
    //grabs the titles of all the filtered media items and joins them into one string seperating them using commas
    const titles = selected.map((i) => i.title).join(", ");

    //calls the recommendation api to recieve the gemini recommendations using the concatenated list of titles as the query, and the current list type as the mediaType
    try {
      const res = await recommendationsApi.generate({ query: titles, mediaType });
      setRecs(res.recommendations);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong. Try again.");
    } finally { //onec api call is over no matter it worked or not stop loading state
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
          <div className="home__tabs">
            <button
            className={activeTab === "search" ? "tab tab--active" : "tab"}
            onClick={() => setActiveTab("search")}
            type="button"
          >
            Search
          </button>

          <button
            className={activeTab === "list" ? "tab tab--active" : "tab"}
            onClick={() => setActiveTab("list")}
            type="button"
          >
            List
          </button>
        </div>
      </header>
      
      {activeTab == "search" &&(
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
      )}

      {activeTab == "list" && (
      <Card className="home__card">
        <form className="home__form" onSubmit={handleListSubmit}>
          <Select
            aria-label="Media type"
            value={mediaType}
            onChange={(e) => setMediaType(e.target.value as MediaType)}
            options={MEDIA_OPTIONS}
            className="home__select"
          />  
          <Select
              aria-label="Media type"
              value={listType}
              onChange={(e) => setListType(e.target.value as MediaType)}
              options={MEDIA_OPTIONS}
              className="home__select"
            />
          <Button type="submit" loading={loading}>
            Recommend
          </Button>
        </form>
      </Card>
      )}

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
