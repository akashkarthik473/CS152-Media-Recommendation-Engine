export type MediaType = "any" | "movies" | "tv" | "books" | "games";

export type User = {
  id: number;
  username: string;
  email: string;
};

export type AuthToken = {
  access_token: string;
  token_type: string;
};

export type Media = {
  id: number;
  user_id: number;
  mediaType: "book" | "game" | "tv" | "movie";
  title: string;
  subtitle: string;
  posterPath: string | null;
}