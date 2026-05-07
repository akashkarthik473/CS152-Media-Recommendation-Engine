// Allowed values for the media type filter on the recommendation forms, "any" means
// don't narrow the recommendation by category
export type MediaType = "any" | "movies" | "tv" | "books" | "games";

// Public user shape returned by the backend /me and /signup endpoints, mirrors the
// UserPublic Pydantic model on the server side
export type User = {
  id: number;
  username: string;
  email: string;
};

// Shape of the JWT token response returned by the backend /token endpoint
export type AuthToken = {
  access_token: string;
  token_type: string;
};

// Shape of a saved media item shown on the user's media list, mirrors the Media ORM
// model on the server side and is also what we cache in localStorage
export type Media = {
  id: number;
  user_id: number;
  mediaType: "book" | "game" | "tv" | "movie";
  title: string;
  subtitle: string;
  posterPath: string | null;
}

// Shape of a recommendation item in the gemini api JSON response
export type RecommendationItem = {
  title: string;
  description: string;
}

