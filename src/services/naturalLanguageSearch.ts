import { searchMovies, discoverMovies } from "../movieAPI";
import type { Movie } from "../types";

export interface ParsedQueryIntent {
  rawQuery: string;
  genres: number[];
  language?: string;
  maxRuntime?: number;
  year?: string;
  minRating?: number;
  searchTerm?: string;
  detectedTags: string[];
}

const KEYWORD_GENRE_MAP: Record<string, number> = {
  action: 28,
  adventure: 12,
  animation: 16,
  animated: 16,
  cartoon: 16,
  comedy: 35,
  funny: 35,
  hilarious: 35,
  crime: 80,
  mob: 80,
  gangster: 80,
  documentary: 99,
  drama: 18,
  dramatic: 18,
  family: 10751,
  kids: 10751,
  fantasy: 14,
  magic: 14,
  history: 36,
  historical: 36,
  horror: 27,
  scary: 27,
  spooky: 27,
  music: 10402,
  musical: 10402,
  mystery: 9648,
  detective: 9648,
  romance: 10749,
  romantic: 10749,
  love: 10749,
  scifi: 878,
  "sci-fi": 878,
  science: 878,
  space: 878,
  futuristic: 878,
  thriller: 53,
  suspense: 53,
  thrilling: 53,
  mindbending: 53,
  "mind-bending": 53,
  war: 10752,
  military: 10752,
  western: 37
};

const KEYWORD_LANG_MAP: Record<string, string> = {
  hindi: "hi",
  bollywood: "hi",
  english: "en",
  hollywood: "en",
  telugu: "te",
  tollywood: "te",
  tamil: "ta",
  kollywood: "ta",
  malayalam: "ml",
  mollywood: "ml",
  kannada: "kn",
  bengali: "bn",
  marathi: "mr",
  korean: "ko",
  japanese: "ja",
  anime: "ja"
};

export function parseNaturalLanguageQuery(query: string): ParsedQueryIntent {
  const lower = query.toLowerCase();
  const detectedTags: string[] = [];

  const foundGenres = new Set<number>();
  let language: string | undefined;
  let maxRuntime: number | undefined;
  let year: string | undefined;
  let minRating: number | undefined;

  // Extract Genres
  Object.entries(KEYWORD_GENRE_MAP).forEach(([kw, gId]) => {
    if (lower.includes(kw)) {
      foundGenres.add(gId);
      detectedTags.push(kw);
    }
  });

  // Extract Languages
  Object.entries(KEYWORD_LANG_MAP).forEach(([kw, langCode]) => {
    if (lower.includes(kw)) {
      language = langCode;
      detectedTags.push(kw);
    }
  });

  // Extract Runtime
  if (lower.includes("under 90 min") || lower.includes("short movie") || lower.includes("quick")) {
    maxRuntime = 90;
    detectedTags.push("< 90 mins");
  } else if (lower.includes("under 2 hours") || lower.includes("under 120 min") || lower.includes("2 hrs")) {
    maxRuntime = 120;
    detectedTags.push("< 2 hours");
  }

  // Extract Years / Decades
  if (lower.includes("2024") || lower.includes("recent") || lower.includes("new")) {
    year = "2024";
    detectedTags.push("Recent / 2024");
  } else if (lower.includes("2023")) {
    year = "2023";
    detectedTags.push("2023");
  } else if (lower.includes("90s") || lower.includes("1990")) {
    year = "1995";
    detectedTags.push("90s Classic");
  }

  // Extract Rating quality intent
  if (lower.includes("good") || lower.includes("best") || lower.includes("top rated") || lower.includes("masterpiece")) {
    minRating = 7.5;
    detectedTags.push("Top Rated");
  }

  // Clean title search term if specific title mentioned e.g. "like Interstellar"
  let searchTerm = "";
  const matchLike = lower.match(/(?:like|similar to)\s+([a-z0-9\s]+)/);
  if (matchLike && matchLike[1]) {
    searchTerm = matchLike[1].trim();
  }

  return {
    rawQuery: query,
    genres: Array.from(foundGenres),
    language,
    maxRuntime,
    year,
    minRating,
    searchTerm,
    detectedTags
  };
}

export async function processNaturalLanguageSearch(query: string): Promise<{ movies: Movie[]; intent: ParsedQueryIntent }> {
  const intent = parseNaturalLanguageQuery(query);

  try {
    let results: Movie[] = [];

    // If specific movie mentioned (e.g. "like Interstellar")
    if (intent.searchTerm) {
      const searchRes = await searchMovies(intent.searchTerm);
      results = searchRes.data?.results || [];
    } else if (intent.genres.length > 0 || intent.language || intent.year) {
      // Use discover API with extracted parameters
      const langParam = intent.language || "all";
      const yearParam = intent.year || "all";
      const discoverRes = await discoverMovies(langParam, yearParam);
      results = discoverRes.data?.results || [];

      // Filter by detected genres locally if provided
      if (intent.genres.length > 0) {
        results = results.filter((m) =>
          m.genre_ids?.some((gId) => intent.genres.includes(gId))
        );
      }
    } else {
      // Direct text search fallback
      const searchRes = await searchMovies(query);
      results = searchRes.data?.results || [];
    }

    // Post-filter by rating quality if requested
    if (intent.minRating) {
      const filteredByRating = results.filter((m) => (m.vote_average || 0) >= intent.minRating!);
      if (filteredByRating.length > 0) {
        results = filteredByRating;
      }
    }

    return { movies: results.slice(0, 18), intent };
  } catch (err) {
    console.error("Natural language search error:", err);
    return { movies: [], intent };
  }
}
