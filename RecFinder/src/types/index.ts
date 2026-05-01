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
