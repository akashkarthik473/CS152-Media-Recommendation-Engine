import { api } from "./client";
import type { MediaType } from "../types";

type RecommendationResponse = {
  recommendations: string;
};

export const recommendationsApi = {
  generate(input: { query: string; mediaType: MediaType }): Promise<RecommendationResponse> {
    return api.post<RecommendationResponse>(
      "/recommend",
      { query: input.query, media_type: input.mediaType },
      { auth: true },
    );
  },
};
