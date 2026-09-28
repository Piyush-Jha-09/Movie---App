import axios from "axios";
import type { MovieAvailabilityData } from "../types";

const api = axios.create({
  baseURL: "https://api.themoviedb.org/3",
  params: {
    api_key: import.meta.env.VITE_TMDB_KEY
  }
});

export const LOGO_BASE_URL = "https://image.tmdb.org/t/p/w92";

function deduplicateProviders(providers: any[]): any[] {
  if (!providers || !Array.isArray(providers)) return [];
  const seen = new Set<string>();
  return providers.filter((item) => {
    const key = String(item.provider_id || item.provider_name?.toLowerCase());
    if (!key || seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}

export async function getMovieWatchProviders(movieId: number, region = "IN"): Promise<MovieAvailabilityData | null> {
  try {
    const res = await api.get(`/movie/${movieId}/watch/providers`);
    const results = res.data?.results || {};

    // Region preference e.g. 'IN', fallback to 'US' or first available region
    const regionData = results[region] || results["US"] || Object.values(results)[0];

    if (!regionData) {
      return null;
    }

    return {
      link: regionData.link,
      flatrate: deduplicateProviders(regionData.flatrate || []),
      rent: deduplicateProviders(regionData.rent || []),
      buy: deduplicateProviders(regionData.buy || [])
    };
  } catch (err) {
    console.error("Failed to fetch watch providers:", err);
    return null;
  }
}
