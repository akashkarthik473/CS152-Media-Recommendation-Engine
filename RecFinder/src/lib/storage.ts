import type { Media } from "../types"

// localStorage key the JWT bearer token is saved under
const TOKEN_KEY = "recfinder.token";

// localStorage key the cached user media list is saved under
const MEDIA_LIST_KEY = "recfinder.media_list";

//creates a mediaListStorage object with three helper methods
export const mediaListStorage = {

  //gets raw JSON data, parses it, and returns it as an array of Media objects
  get(): Media[] {
    const raw = localStorage.getItem(MEDIA_LIST_KEY);
    if (!raw) return [];
    try {
      const data = JSON.parse(raw)

      //if data is not Array return an empty list, also regardless treat data as an array of Media objects
      return Array.isArray(data) ? (data as Media []) : [];
    } catch {
      return [];
    }
  },
  //takes a value turns it into a string and saves it in local storage
  set(value: unknown): void {
    localStorage.setItem(MEDIA_LIST_KEY, JSON.stringify(value));
  },
  //clears local storage data in the object
  clear(): void {
    localStorage.removeItem(MEDIA_LIST_KEY);
  },

};

// helper object that wraps localStorage for the JWT bearer token so the rest of the app
// doesn't have to know which key it lives under
export const tokenStorage = {
  // returns the saved token or null if the user is not signed in
  // Output: token string or null
  get(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  },
  // saves the token to localStorage so it survives page refreshes
  // Input: token string
  set(token: string): void {
    localStorage.setItem(TOKEN_KEY, token);
  },
  // removes the token from localStorage on logout or auth failure
  clear(): void {
    localStorage.removeItem(TOKEN_KEY);
  },
};
