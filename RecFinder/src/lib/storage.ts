import type { Media } from "../types"
const TOKEN_KEY = "recfinder.token";
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

export const tokenStorage = {
  get(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  },
  set(token: string): void {
    localStorage.setItem(TOKEN_KEY, token);
  },
  clear(): void {
    localStorage.removeItem(TOKEN_KEY);
  },
};
