import { api } from "./client";
import type { Media } from "../types";

// shape of the payload sent when adding a new media item to a user's saved list, the
// fields are flat strings so they can be persisted directly by the backend Media model
type AddMediaInput = {
  user_id: number;
  mediaType: "movie" | "tv" | "book" | "game";
  title: string;
  subtitle: string;
  posterPath: string | null | undefined;
};

// thin wrapper around the media-related backend endpoints so the rest of the frontend
// doesn't have to know which paths or payload shapes the backend uses
export const mediaApi = {
  // calls POST /media to persist a new media item for the current user, returns the
  // created row including its newly assigned id
  // Input: AddMediaInput
  // Output: Promise resolving to a Media row
  addMedia(input: AddMediaInput): Promise<Media> {
    return api.post<Media>("/media", input, { auth: true });
  },

  // calls DELETE /media/{id} to remove a media item the user previously saved
  // Input: media id number
  // Output: Promise resolving to a confirmation object
  deleteMedia(mediaId: number): Promise<{ ok: boolean }> {
    return api.delete<{ ok: boolean }>(`/media/${mediaId}`, undefined, { auth: true });
  },

  // calls POST /media_list to load every media item belonging to the given user, used
  // right after login to hydrate the cached list in localStorage
  // Input: user_id number
  // Output: Promise resolving to a list of Media rows
  listMedia(userId: number): Promise<Media[]> {
    return api.post<Media[]>("/media_list", { user_id: userId }, { auth: true });
  },
};
