import {
  getTrendingWorld,
  getTrendingIndia,
  getTrendingHindi,
  discoverMovies,
  discoverMoviesByGenre,
  getRecommendations as getTMDBRecommendations
} from "../movieAPI";
import {
  getReactionsMap,
  getRatingsMap,
  getWatchHistory,
  getUserPreferences,
  GENRE_MAP
} from "./preferenceStore";
import type { Movie, MoodConfig } from "../types";

export interface ScoredMovie {
  movie: Movie;
  score: number;
  reasons: string[];
}

const RECENT_MOOD_RECS_KEY = "cineverse_recent_mood_recs_v1";

function getRecentMoodRecs(): Record<string, { date: string; movieIds: number[] }> {
  try {
    const item = localStorage.getItem(RECENT_MOOD_RECS_KEY);
    return item ? JSON.parse(item) : {};
  } catch {
    return {};
  }
}

function recordRecentMoodRecs(moodId: string, dateStr: string, movieIds: number[]) {
  try {
    const data = getRecentMoodRecs();
    data[moodId] = { date: dateStr, movieIds };
    localStorage.setItem(RECENT_MOOD_RECS_KEY, JSON.stringify(data));
  } catch (err) {
    console.error("Failed to store recent mood recs:", err);
  }
}

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

// Map language codes to readable names
const LANG_NAME_MAP: Record<string, string> = {
  en: "English",
  hi: "Hindi",
  te: "Telugu",
  ta: "Tamil",
  ml: "Malayalam",
  kn: "Kannada",
  bn: "Bengali",
  mr: "Marathi",
  ko: "Korean",
  ja: "Japanese"
};

/**
 * Strict, Personalized, Daily-Rotating Mood Recommendation Engine
 */
export async function getMoodRecommendations(mood: MoodConfig, limit = 18): Promise<ScoredMovie[]> {
  try {
    const preferences = getUserPreferences();
    const reactions = getReactionsMap();
    const ratings = getRatingsMap();
    const history = getWatchHistory();
    const watchedIds = new Set(history.map((h) => h.movieId));

    const todayStr = new Date().toISOString().split("T")[0]; // "YYYY-MM-DD"
    const userLangStr = (preferences.languages || ["en", "hi"]).join("_");
    const userGenreStr = (preferences.genres || []).join("_");
    
    // Deterministic daily seed combining date, mood, and user profile
    const dailySeed = hashString(`${todayStr}_${mood.id}_${userLangStr}_${userGenreStr}`);

    // Recent recommendations check
    const recentRecsData = getRecentMoodRecs()[mood.id];
    const recentIds = new Set<number>(
      recentRecsData && recentRecsData.date === todayStr ? [] : (recentRecsData?.movieIds || [])
    );

    // 1. Fetch a Large Candidate Pool for Primary Mood Genre from TMDB
    const candidatesMap = new Map<number, Movie>();
    const userLangs = preferences.languages || ["en", "hi"];

    const fetchPromises: Promise<any>[] = [
      // Page 1 & 2 popular candidates for primary genre
      discoverMoviesByGenre(mood.primaryGenreId, "all", 1, "popularity.desc").then((r) => r.data?.results || []).catch(() => []),
      discoverMoviesByGenre(mood.primaryGenreId, "all", 2, "popularity.desc").then((r) => r.data?.results || []).catch(() => []),
      discoverMoviesByGenre(mood.primaryGenreId, "all", 1, "vote_average.desc").then((r) => r.data?.results || []).catch(() => [])
    ];

    // Page 1 specifically in user's preferred languages
    userLangs.forEach((lang) => {
      fetchPromises.push(
        discoverMoviesByGenre(mood.primaryGenreId, lang, 1, "popularity.desc").then((r) => r.data?.results || []).catch(() => [])
      );
    });

    const candidatePages = await Promise.all(fetchPromises);
    candidatePages.flat().forEach((m: Movie) => {
      if (m && m.id && !candidatesMap.has(m.id)) {
        candidatesMap.set(m.id, m);
      }
    });

    const candidates = Array.from(candidatesMap.values());

    const scored: ScoredMovie[] = [];

    for (const movie of candidates) {
      const genreIds = movie.genre_ids || [];

      // ==========================================
      // HARD FILTERS (ELIGIBILITY)
      // ==========================================

      // Hard Filter 1: Must contain primary mood genre!
      if (!genreIds.includes(mood.primaryGenreId)) {
        continue; // Immediate exclusion!
      }

      // Hard Filter 2: Must NOT contain excluded genres
      if (mood.excludeGenreIds && mood.excludeGenreIds.some((exId) => genreIds.includes(exId))) {
        continue;
      }

      // Hard Filter 3: User disliked check
      if (reactions[movie.id] === "dislike") {
        continue;
      }

      // Hard Filter 4: Must have valid title and poster
      if (!movie.title || (!movie.poster_path && !movie.backdrop_path)) {
        continue;
      }

      // ==========================================
      // SOFT SCORING (RANKING & PERSONALIZATION)
      // ==========================================
      let score = 100; // Base score for passing hard filter
      const reasons: string[] = [];

      const moodGenreName = GENRE_MAP[mood.primaryGenreId] || mood.name;
      reasons.push(`Verified ${moodGenreName} movie`);

      // Language Match (+25)
      const lang = movie.original_language || "en";
      if (userLangs.includes(lang)) {
        score += 25;
        const langName = LANG_NAME_MAP[lang] || lang.toUpperCase();
        reasons.push(`Matches your preferred ${langName} language`);
      }

      // Secondary Mood Genre Match (+15)
      if (mood.secondaryGenreIds) {
        const matchingSecondary = mood.secondaryGenreIds.filter((sId) => genreIds.includes(sId));
        if (matchingSecondary.length > 0) {
          score += matchingSecondary.length * 15;
        }
      }

      // User Preferred Genre Match (+15)
      const userPreferredGenres = preferences.genres || [];
      const matchingUserGenres = genreIds.filter((gId) => userPreferredGenres.includes(gId) && gId !== mood.primaryGenreId);
      if (matchingUserGenres.length > 0) {
        score += matchingUserGenres.length * 15;
      }

      // Rating / Quality (+10 to +20)
      if (movie.vote_average) {
        if (movie.vote_average >= 7.5) {
          score += 20;
          reasons.push(`Critically acclaimed (⭐ ${movie.vote_average.toFixed(1)})`);
        } else if (movie.vote_average >= 6.5) {
          score += 10;
        }
      }

      // User Likes & Star Ratings (+30)
      if (reactions[movie.id] === "like") {
        score += 30;
        reasons.push("You previously liked this movie");
      }
      if (ratings[movie.id]) {
        score += ratings[movie.id] * 5;
      }

      // Recent Recommendation Penalty (-35 for candidate rotation across days)
      if (recentIds.has(movie.id)) {
        score -= 35;
      }

      // Already Watched Penalty (-25)
      if (watchedIds.has(movie.id)) {
        score -= 25;
      }

      // Deterministic Daily Seed Variation Offset (+0 to +15)
      const dailyOffset = (movie.id * dailySeed) % 15;
      score += dailyOffset;

      scored.push({ movie, score, reasons });
    }

    // Rank candidates by final score descending
    scored.sort((a, b) => b.score - a.score);

    const finalResults = scored.slice(0, limit);

    // Record chosen movie IDs for recent recommendation tracking
    if (finalResults.length > 0) {
      recordRecentMoodRecs(mood.id, todayStr, finalResults.map((r) => r.movie.id));
    }

    return finalResults;
  } catch (err) {
    console.error("Mood recommendations error:", err);
    return [];
  }
}

/**
 * Hybrid Recommendation Engine
 * Combines TMDB candidates, user preferences, likes, dislikes, ratings, history & watchlist.
 */
export async function getPersonalizedRecommendations(limit = 18): Promise<ScoredMovie[]> {
  try {
    const preferences = getUserPreferences();
    const reactions = getReactionsMap();
    const ratings = getRatingsMap();
    const history = getWatchHistory();

    const watchedIds = new Set(history.map((h) => h.movieId));

    // Get candidate movies from multiple TMDB endpoints
    const candidatesMap = new Map<number, Movie>();

    const fetchPromises = [
      getTrendingWorld().then((res) => res.data?.results || []).catch(() => []),
      getTrendingIndia().then((res) => res.data?.results || []).catch(() => []),
      getTrendingHindi().then((res) => res.data?.results || []).catch(() => [])
    ];

    // Add genre discovery candidates if preferences set
    if (preferences.genres && preferences.genres.length > 0) {
      fetchPromises.push(
        discoverMovies("all", "all")
          .then((res) => res.data?.results || [])
          .catch(() => [])
      );
    }

    // Add language discovery candidates
    (preferences.languages || ["en", "hi"]).forEach((lang) => {
      fetchPromises.push(
        discoverMovies(lang, "all")
          .then((res) => res.data?.results || [])
          .catch(() => [])
      );
    });

    const candidateResults = await Promise.all(fetchPromises);
    candidateResults.flat().forEach((m: Movie) => {
      if (m && m.id && !candidatesMap.has(m.id)) {
        candidatesMap.set(m.id, m);
      }
    });

    const candidates = Array.from(candidatesMap.values());

    // Score candidates
    const scored: ScoredMovie[] = [];

    for (const movie of candidates) {
      // 1. HARD FILTER: Remove disliked movies
      if (reactions[movie.id] === "dislike") {
        continue;
      }

      let score = 50; // Base baseline score
      const reasons: string[] = [];

      const genreIds = movie.genre_ids || [];
      const lang = movie.original_language || "en";

      // 2. Genre Match Scoring
      const preferredGenres = preferences.genres || [];
      const matchingGenreNames: string[] = [];

      genreIds.forEach((gId) => {
        if (preferredGenres.includes(gId)) {
          score += 15;
          if (GENRE_MAP[gId]) matchingGenreNames.push(GENRE_MAP[gId]);
        }
      });

      if (matchingGenreNames.length > 0) {
        reasons.push(`Matches your preference for ${matchingGenreNames.slice(0, 2).join(" & ")}`);
      }

      // 3. Language Match
      const preferredLangs = preferences.languages || ["en", "hi"];
      if (preferredLangs.includes(lang)) {
        score += 15;
        const langName = LANG_NAME_MAP[lang] || lang.toUpperCase();
        reasons.push(`Available in your preferred language (${langName})`);
      }

      // 4. Quality & Popularity
      if (movie.vote_average) {
        if (movie.vote_average >= 8.0) {
          score += 20;
          reasons.push(`Critically acclaimed (⭐ ${movie.vote_average.toFixed(1)})`);
        } else if (movie.vote_average >= 7.0) {
          score += 10;
        }
      }

      // 5. User Reaction & Rating Signals
      if (reactions[movie.id] === "like") {
        score += 30;
        reasons.push("You previously liked this movie");
      }

      if (ratings[movie.id]) {
        const userR = ratings[movie.id];
        score += userR * 5;
        if (userR >= 4) {
          reasons.push(`You rated this ${userR}/5 stars`);
        }
      }

      // 6. Watch History & Already Seen Penalty
      if (watchedIds.has(movie.id)) {
        score -= 35; // Lower priority for already watched movies
      }

      // If no reasons generated, provide default popularity reason
      if (reasons.length === 0) {
        reasons.push("Popular release matching community trends");
      }

      scored.push({ movie, score, reasons });
    }

    // Rank candidates by score descending
    scored.sort((a, b) => b.score - a.score);

    return scored.slice(0, limit);
  } catch (error) {
    console.error("Recommendation scoring error:", error);
    return [];
  }
}

/**
 * Get Recommendations specific to a seed movie with multi-signal weighted scoring
 */
export async function getSeedMovieRecommendations(seedMovie: Movie): Promise<ScoredMovie[]> {
  try {
    if (!seedMovie || !seedMovie.id) return [];
    
    const tmdbRecs = await getTMDBRecommendations(seedMovie);
    const reactions = getReactionsMap();
    const ratings = getRatingsMap();
    const preferences = getUserPreferences();
    const history = getWatchHistory();
    const watchedIds = new Set(history.map((h) => h.movieId));

    const seedGenres = new Set<number>(seedMovie.genre_ids || []);
    const seedLang = seedMovie.original_language || "en";

    const scored: ScoredMovie[] = tmdbRecs
      .filter((m) => m && m.id && m.id !== seedMovie.id && reactions[m.id] !== "dislike")
      .map((m) => {
        let score = 50; // Base similarity score
        const reasons: string[] = [];

        // 1. Shared Genre Similarity
        const candidateGenres = m.genre_ids || [];
        const sharedGenres = candidateGenres.filter((gId: number) => seedGenres.has(gId));
        if (sharedGenres.length > 0) {
          score += sharedGenres.length * 20;
          const genreNames = sharedGenres.map((gId: number) => GENRE_MAP[gId]).filter(Boolean);
          if (genreNames.length > 0) {
            reasons.push(`Shares ${genreNames.slice(0, 2).join(" & ")} with "${seedMovie.title}"`);
          }
        }

        // 2. Shared Language Match
        if (m.original_language && m.original_language === seedLang) {
          score += 15;
        }

        // 3. User Taste & Preferences
        const preferredLangs = preferences.languages || ["en", "hi"];
        if (m.original_language && preferredLangs.includes(m.original_language)) {
          score += 15;
        }

        if (reactions[m.id] === "like") {
          score += 25;
          reasons.push("You previously liked this movie");
        }

        if (ratings[m.id]) {
          score += ratings[m.id] * 5;
        }

        // 4. Quality & Acclaim
        if (m.vote_average) {
          if (m.vote_average >= 7.5) {
            score += 15;
            reasons.push(`Critically acclaimed (⭐ ${m.vote_average.toFixed(1)})`);
          } else if (m.vote_average >= 6.5) {
            score += 8;
          }
        }

        // 5. Watch History penalty (-15)
        if (watchedIds.has(m.id)) {
          score -= 15;
        }

        if (reasons.length === 0) {
          reasons.push(`Similar themes & style to "${seedMovie.title}"`);
        }

        return {
          movie: m,
          score,
          reasons
        };
      });

    // Rank candidates by final weighted score descending
    scored.sort((a, b) => b.score - a.score);

    return scored.slice(0, 12);
  } catch (err) {
    console.error("Seed recommendations error:", err);
    return [];
  }
}
