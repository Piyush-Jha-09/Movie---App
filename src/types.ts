export interface Movie {
  id: number;
  title: string;
  poster_path: string | null;
  backdrop_path: string | null;
  vote_average: number;
  vote_count?: number;
  release_date?: string;
  overview: string;
  genre_ids?: number[];
  original_language?: string;
}

export interface Genre {
  id: number;
  name: string;
}

export interface CastMember {
  id: number;
  name: string;
  character: string;
  profile_path: string | null;
}

export interface MovieDetailsType extends Movie {
  tagline?: string;
  runtime?: number;
  genres: Genre[];
  status?: string;
  budget?: number;
  revenue?: number;
}

// User Reactions & Ratings
export type MovieReaction = "like" | "dislike" | null;

export interface MovieRating {
  movieId: number;
  rating: number; // 1 to 5 stars
  timestamp: number;
}

export interface WatchHistoryItem {
  movieId: number;
  movie: Movie;
  viewedAt: number;
}

export interface UserPreferences {
  genres: number[];
  languages: string[];
  minRating: number;
  maxRuntime?: number;
  minRuntime?: number;
  favoriteDecades?: string[];
  favoriteActors?: string[];
  favoriteDirectors?: string[];
}

export interface RecommendationExplanation {
  movieId: number;
  reasons: string[];
  score: number;
}

export interface MoodConfig {
  id: string;
  name: string;
  emoji: string;
  description: string;
  primaryGenreId: number;
  secondaryGenreIds?: number[];
  excludeGenreIds?: number[];
  minVoteAverage?: number;
}

export interface WatchProviderItem {
  provider_id: number;
  provider_name: string;
  logo_path: string;
}

export interface MovieAvailabilityData {
  link?: string;
  flatrate?: WatchProviderItem[];
  rent?: WatchProviderItem[];
  buy?: WatchProviderItem[];
}

export interface GroupUserPreference {
  name: string;
  preferences: UserPreferences;
  likedMovieIds: number[];
  dislikedMovieIds: number[];
}

