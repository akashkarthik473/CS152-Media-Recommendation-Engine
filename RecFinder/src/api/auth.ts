import { api } from "./client";
import type { AuthToken, User } from "../types";

export const authApi = {
  signup(input: { username: string; email: string; password: string }): Promise<User> {
    return api.post<User>("/signup", input);
  },

  login(input: { username: string; password: string }): Promise<AuthToken> {
    const form = new URLSearchParams();
    form.set("username", input.username);
    form.set("password", input.password);
    return api.post<AuthToken>("/token", form);
  },

  me(): Promise<User> {
    return api.get<User>("/me", { auth: true });
  },
};
