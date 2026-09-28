import type { Movie, MovieReaction, WatchHistoryItem, UserPreferences } from "../types";

const LIKES_KEY = "cineverse_likes_v1";
const RATINGS_KEY = "cineverse_ratings_v1";
const HISTORY_KEY = "cineverse_history_v1";
const PREFS_KEY = "cineverse_user_prefs_v1";

export const EVENT_USER_DATA_CHANGED = "cineverseUserDataChanged";

export const defaultPreferences: UserPreferences = {
  genres: [], // e.g. 28 (Action), 878 (Sci-Fi)
  languages: ["en", "hi"],
  minRating: 6.0,
  maxRuntime: 180,
  minRuntime: 60,
  favoriteDecades: [],
  favoriteActors: [],
  favoriteDirectors: []
};

function safeGetJSON<T>(key: string, fallback: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch {
    return fallback;
  }
}

function safeSetJSON<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    window.dispatchEvent(new Event(EVENT_USER_DATA_CHANGED));
  } catch (err) {
    console.error("Storage error:", err);
  }
}

// --- LIKES & DISLIKES ---
export function getReactionsMap(): Record<number, MovieReaction> {
  return safeGetJSON<Record<number, MovieReaction>>(LIKES_KEY, {});
}

export function getMovieReaction(movieId: number): MovieReaction {
  const map = getReactionsMap();
  return map[movieId] || null;
}

export function setMovieReaction(movieId: number, reaction: MovieReaction): void {
  const map = getReactionsMap();
  if (reaction === null) {
    delete map[movieId];
  } else {
    map[movieId] = reaction;
  }
  safeSetJSON(LIKES_KEY, map);
}

export function getLikedMovieIds(): number[] {
  const map = getReactionsMap();
  return Object.keys(map)
    .map(Number)
    .filter((id) => map[id] === "like");
}

export function getDislikedMovieIds(): number[] {
  const map = getReactionsMap();
  return Object.keys(map)
    .map(Number)
    .filter((id) => map[id] === "dislike");
}

// --- RATINGS ---
export function getRatingsMap(): Record<number, number> {
  return safeGetJSON<Record<number, number>>(RATINGS_KEY, {});
}

export function getMovieRating(movieId: number): number {
  const map = getRatingsMap();
  return map[movieId] || 0;
}

export function setMovieRating(movieId: number, rating: number): void {
  const map = getRatingsMap();
  if (rating <= 0) {
    delete map[movieId];
  } else {
    map[movieId] = rating;
  }
  safeSetJSON(RATINGS_KEY, map);
}

// --- WATCH HISTORY ---
export function getWatchHistory(): WatchHistoryItem[] {
  return safeGetJSON<WatchHistoryItem[]>(HISTORY_KEY, []);
}

export function isMovieWatched(movieId: number): boolean {
  const history = getWatchHistory();
  return history.some((item) => item.movieId === movieId);
}

export function recordMovieWatch(movie: Movie): void {
  if (!movie || !movie.id) return;
  const history = getWatchHistory();
  const filtered = history.filter((item) => item.movieId !== movie.id);
  const updated: WatchHistoryItem[] = [
    { movieId: movie.id, movie, viewedAt: Date.now() },
    ...filtered
  ].slice(0, 100); // Keep last 100 items
  safeSetJSON(HISTORY_KEY, updated);
}

export function toggleMovieWatched(movie: Movie): boolean {
  if (!movie || !movie.id) return false;
  const watched = isMovieWatched(movie.id);
  if (watched) {
    removeWatchHistoryItem(movie.id);
    return false;
  } else {
    recordMovieWatch(movie);
    return true;
  }
}

export function removeWatchHistoryItem(movieId: number): void {
  const history = getWatchHistory();
  const updated = history.filter((item) => item.movieId !== movieId);
  safeSetJSON(HISTORY_KEY, updated);
}

export function clearWatchHistory(): void {
  safeSetJSON(HISTORY_KEY, []);
}

// --- USER PREFERENCES ---
export function getUserPreferences(): UserPreferences {
  return safeGetJSON<UserPreferences>(PREFS_KEY, defaultPreferences);
}

export function setUserPreferences(prefs: UserPreferences): void {
  safeSetJSON(PREFS_KEY, prefs);
}

// --- TASTE DNA & ANALYTICS ---
export interface TasteProfileStats {
  likedCount: number;
  dislikedCount: number;
  ratedCount: number;
  watchedCount: number;
  averageUserRating: number;
  topGenres: { id: number; name: string; count: number }[];
  preferredLanguages: string[];
}

export const GENRE_MAP: Record<number, string> = {
  28: "Action",
  12: "Adventure",
  16: "Animation",
  35: "Comedy",
  80: "Crime",
  99: "Documentary",
  18: "Drama",
  10751: "Family",
  14: "Fantasy",
  36: "History",
  27: "Horror",
  10402: "Music",
  9648: "Mystery",
  10749: "Romance",
  878: "Sci-Fi",
  10770: "TV Movie",
  53: "Thriller",
  10752: "War",
  37: "Western"
};

export function getTasteDNAStats(): TasteProfileStats {
  const reactions = getReactionsMap();
  const ratings = getRatingsMap();
  const history = getWatchHistory();
  const prefs = getUserPreferences();

  const likedIds = getLikedMovieIds();
  const dislikedIds = getDislikedMovieIds();
  const ratedEntries = Object.entries(ratings);

  const totalRatingSum = ratedEntries.reduce((sum, [_, r]) => sum + r, 0);
  const averageUserRating = ratedEntries.length > 0 ? Number((totalRatingSum / ratedEntries.length).toFixed(1)) : 0;

  // Count genre frequencies from watch history and user preferences
  const genreCounts: Record<number, number> = {};

  // Add weight from preferences
  (prefs.genres || []).forEach((gId) => {
    genreCounts[gId] = (genreCounts[gId] || 0) + 5;
  });

  // Add weight from watched & liked movies
  history.forEach((item) => {
    const reaction = reactions[item.movieId];
    const weight = reaction === "like" ? 3 : reaction === "dislike" ? -2 : 1;
    (item.movie.genre_ids || []).forEach((gId) => {
      genreCounts[gId] = Math.max(0, (genreCounts[gId] || 0) + weight);
    });
  });

  const sortedGenres = Object.entries(genreCounts)
    .map(([idStr, count]) => {
      const id = Number(idStr);
      return { id, name: GENRE_MAP[id] || `Genre ${id}`, count };
    })
    .sort((a, b) => b.count - a.count)
    .filter((g) => g.count > 0);

  return {
    likedCount: likedIds.length,
    dislikedCount: dislikedIds.length,
    ratedCount: ratedEntries.length,
    watchedCount: history.length,
    averageUserRating,
    topGenres: sortedGenres,
    preferredLanguages: prefs.languages || ["en", "hi"]
  };
}
