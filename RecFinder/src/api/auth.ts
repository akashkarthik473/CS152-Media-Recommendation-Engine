import { api } from "./client";
import type { AuthToken, User } from "../types";

// thin wrapper around the auth-related backend endpoints so the rest of the frontend
// doesn't have to know which paths or payload shapes the backend uses
export const authApi = {
  // calls POST /signup to create a new account, the body matches the UserCreate model
  // Input: object with username, email, password
  // Output: Promise resolving to the created User
  signup(input: { username: string; email: string; password: string }): Promise<User> {
    return api.post<User>("/signup", input);
  },

  // calls POST /token with form-encoded credentials and gets back an access token
  // Input: object with username and password
  // Output: Promise resolving to an AuthToken (access_token + token_type)
  login(input: { username: string; password: string }): Promise<AuthToken> {
    // FastAPI's OAuth2 password flow expects form encoding so we build URLSearchParams here
    const form = new URLSearchParams();
    form.set("username", input.username);
    form.set("password", input.password);
    return api.post<AuthToken>("/token", form);
  },

  // calls GET /me using the stored JWT to look up the currently logged in user
  // Output: Promise resolving to the current User
  me(): Promise<User> {
    return api.get<User>("/me", { auth: true });
  },
};
