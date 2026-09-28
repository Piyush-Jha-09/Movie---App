import { useEffect, useState } from "react";
import { discoverMovies, getTrendingIndia, getTrendingHindi } from "../movieAPI";
import MovieCard from "../components/MovieCard";
import type { Movie } from "../types";

const REGIONAL_CATEGORIES = [
  { id: "pan_india", name: "🔥 Pan-India Blockbusters", code: "all" },
  { id: "hindi", name: "🎬 Bollywood / Hindi", code: "hi" },
  { id: "telugu", name: "🎬 Tollywood / Telugu", code: "te" },
  { id: "tamil", name: "🎬 Kollywood / Tamil", code: "ta" },
  { id: "malayalam", name: "🎬 Mollywood / Malayalam", code: "ml" },
  { id: "kannada", name: "🎬 Sandalwood / Kannada", code: "kn" },
  { id: "bengali", name: "🎬 Bengali Cinema", code: "bn" },
  { id: "marathi", name: "🎬 Marathi Cinema", code: "mr" }
];

export default function IndianCinema() {
  const [selectedCategory, setSelectedCategory] = useState("pan_india");
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCategoryData(selectedCategory);
  }, [selectedCategory]);

  const loadCategoryData = async (catId: string) => {
    setLoading(true);
    try {
      if (catId === "pan_india") {
        const res = await getTrendingIndia();
        setMovies(res.data?.results || []);
      } else if (catId === "hindi") {
        const res = await getTrendingHindi();
        setMovies(res.data?.results || []);
      } else {
        const cat = REGIONAL_CATEGORIES.find((c) => c.id === catId);
        const res = await discoverMovies(cat?.code || "hi", "all");
        setMovies(res.data?.results || []);
      }
    } catch (err) {
      console.error(err);
      setMovies([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", padding: "40px 5% 80px 5%", background: "#090d16", color: "#ffffff" }} className="fade-in">
      {/* Hero Header */}
      <div style={{ textAlign: "center", marginBottom: "40px" }}>
        <div style={{
          display: "inline-flex",
          padding: "6px 16px",
          background: "rgba(239, 68, 68, 0.15)",
          border: "1px solid rgba(239, 68, 68, 0.3)",
          borderRadius: "20px",
          color: "#f87171",
          fontSize: "0.85rem",
          fontWeight: 700,
          marginBottom: "12px"
        }}>
          🇮🇳 Indian Cinema Experience
        </div>
        <h1 style={{ fontSize: "clamp(2rem, 3.5vw, 3rem)", fontWeight: 800, margin: 0 }}>
          Discover Regional Masterpieces
        </h1>
        <p style={{ color: "#cbd5e1", fontSize: "1rem", marginTop: "8px", maxWidth: "700px", margin: "8px auto 0 auto" }}>
          Explore trending movies across Bollywood, Telugu, Tamil, Malayalam, Kannada, Marathi, Bengali, and Pan-India blockbusters.
        </p>
      </div>

      {/* Regional Pills Switcher */}
      <div style={{ display: "flex", gap: "10px", overflowX: "auto", paddingBottom: "16px", marginBottom: "40px", scrollbarWidth: "thin" }}>
        {REGIONAL_CATEGORIES.map((cat) => {
          const active = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              style={{
                flexShrink: 0,
                padding: "12px 20px",
                borderRadius: "14px",
                background: active
                  ? "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)"
                  : "rgba(17, 24, 39, 0.8)",
                border: active ? "1px solid #f87171" : "1px solid rgba(255, 255, 255, 0.1)",
                color: "#ffffff",
                fontWeight: 700,
                fontSize: "0.92rem",
                boxShadow: active ? "0 4px 15px rgba(239, 68, 68, 0.4)" : "none",
                transition: "all 0.2s ease"
              }}
            >
              {cat.name}
            </button>
          );
        })}
      </div>

      {/* Movie Grid */}
      {loading ? (
        <div style={{ color: "#94a3b8", textAlign: "center", padding: "60px 0" }}>
          Loading Indian cinema releases...
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "24px" }}>
          {movies.map((movie) => (
            <MovieCard key={movie.id} movie={movie} />
          ))}
        </div>
      )}
    </div>
  );
}
