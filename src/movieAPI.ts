import axios from "axios";

export const IMG = "https://image.tmdb.org/t/p/w500";
export const BACKDROP_ORIGINAL = "https://image.tmdb.org/t/p/original";
export const BACKDROP_W1280 = "https://image.tmdb.org/t/p/w1280";
export const PROFILE_W185 = "https://image.tmdb.org/t/p/w185";

// Image Fallback Placeholder Generator
export const getPosterUrl = (path: string | null): string => {
  if (path) return `${IMG}${path}`;
  return "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=500&q=80";
};

export const getBackdropUrl = (path: string | null): string => {
  if (path) return `${BACKDROP_W1280}${path}`;
  return "https://images.unsplash.com/photo-1574267432553-4b4628081c31?auto=format&fit=crop&w=1280&q=80";
};

const api = axios.create({
  baseURL: "https://api.themoviedb.org/3",
  params: {
    api_key: import.meta.env.VITE_TMDB_KEY
  }
});

// SEARCH
export const searchMovies = (query: string) =>
  api.get("/search/movie", {
    params: { query, include_adult: false }
  });

// DETAILS
export const getMovieDetails = (id: number) =>
  api.get(`/movie/${id}`);

// CREDITS (CAST & CREW)
export const getMovieCredits = (id: number) =>
  api.get(`/movie/${id}/credits`);

// VIDEOS
export const getMovieVideos = (id: number) =>
  api.get(`/movie/${id}/videos`);

// TRENDING WORLD
export const getTrendingWorld = () =>
  api.get("/trending/movie/week");

// TRENDING INDIA (recent)
export const getTrendingIndia = () =>
  api.get("/discover/movie", {
    params: {
      region: "IN",
      sort_by: "popularity.desc",
      "primary_release_date.gte": "2022-01-01"
    }
  });

// TRENDING HINDI (recent only)
export const getTrendingHindi = () =>
  api.get("/discover/movie", {
    params: {
      with_original_language: "hi",
      sort_by: "popularity.desc",
      "primary_release_date.gte": "2022-01-01"
    }
  });

// DISCOVER FILTER
export const discoverMovies = (language: string, year: string) =>
  api.get("/discover/movie", {
    params: {
      sort_by: "popularity.desc",
      ...(language !== "all" && { with_original_language: language }),
      ...(year !== "all" && { primary_release_year: year })
    }
  });

// DISCOVER BY GENRE WITH PAGINATION
export const discoverMoviesByGenre = (genreId: number, language = "all", page = 1, sortBy = "popularity.desc") =>
  api.get("/discover/movie", {
    params: {
      with_genres: genreId,
      sort_by: sortBy,
      page,
      ...(language !== "all" && { with_original_language: language })
    }
  });

// RECOMMENDATION
export const getRecommendations = async (movie: any) => {
  try {
    const similarPromise = api.get(`/movie/${movie.id}/similar`).catch(() => ({ data: { results: [] } }));
    
    const genreIds = movie.genres?.map((g: any) => g.id).join(",");
    const genrePromise = genreIds 
      ? api.get("/discover/movie", {
          params: {
            with_genres: genreIds,
            sort_by: "popularity.desc"
          }
        }).catch(() => ({ data: { results: [] } }))
      : Promise.resolve({ data: { results: [] } });

    const [similar, genreBased] = await Promise.all([similarPromise, genrePromise]);

    const combined = [
      ...(similar.data?.results || []),
      ...(genreBased.data?.results || [])
    ].filter((m: any) => m.id !== movie.id);

    const unique = new Map();
    combined.forEach((m: any) => unique.set(m.id, m));

    return Array.from(unique.values()).slice(0, 12);
  } catch (error) {
    console.error("Error fetching recommendations:", error);
    return [];
  }
};
