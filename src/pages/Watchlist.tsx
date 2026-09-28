import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import MovieCard from "../components/MovieCard";
import { Toast } from "../components/Toast";
import type { Movie } from "../types";

export default function Watchlist() {
  const navigate = useNavigate();
  const [movies, setMovies] = useState<Movie[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    loadWatchlist();
    window.addEventListener("watchlistUpdated", loadWatchlist);
    return () => window.removeEventListener("watchlistUpdated", loadWatchlist);
  }, []);

  const loadWatchlist = () => {
    try {
      const saved = localStorage.getItem("watchlist");
      if (saved) {
        setMovies(JSON.parse(saved));
      } else {
        setMovies([]);
      }
    } catch {
      setMovies([]);
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleRemove = (movie: Movie) => {
    const updated = movies.filter((m) => m.id !== movie.id);
    localStorage.setItem("watchlist", JSON.stringify(updated));
    setMovies(updated);
    window.dispatchEvent(new Event("watchlistUpdated"));
    showToast(`Removed "${movie.title}" from Watchlist`);
  };

  const handleClearAll = () => {
    if (window.confirm("Are you sure you want to clear your entire watchlist?")) {
      localStorage.removeItem("watchlist");
      setMovies([]);
      window.dispatchEvent(new Event("watchlistUpdated"));
      showToast("Cleared Watchlist");
    }
  };

  return (
    <div style={{ minHeight: "100vh", padding: "40px 5%", background: "#090d16", color: "#ffffff" }} className="fade-in">
      <Toast message={toastMessage} type="warning" />

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <h1 style={{ fontSize: "2rem", fontWeight: 800, margin: 0, display: "flex", alignItems: "center", gap: "12px" }}>
            📌 My Watchlist
          </h1>
          <p style={{ color: "#94a3b8", fontSize: "0.95rem", marginTop: "6px" }}>
            {movies.length === 1 ? "1 saved movie" : `${movies.length} saved movies`}
          </p>
        </div>

        {movies.length > 0 && (
          <button
            onClick={handleClearAll}
            style={{
              padding: "10px 18px",
              background: "rgba(239, 68, 68, 0.15)",
              border: "1px solid rgba(239, 68, 68, 0.4)",
              color: "#f87171",
              borderRadius: "10px",
              fontWeight: 600,
              fontSize: "0.88rem"
            }}
          >
            🗑️ Clear Watchlist
          </button>
        )}
      </div>

      {/* Empty State */}
      {movies.length === 0 && (
        <div style={{
          textAlign: "center",
          padding: "80px 20px",
          background: "#111827",
          borderRadius: "20px",
          border: "1px dashed rgba(255, 255, 255, 0.15)",
          maxWidth: "600px",
          margin: "40px auto"
        }}>
          <div style={{ fontSize: "3.5rem", marginBottom: "16px" }}>🍿</div>
          <h3 style={{ fontSize: "1.4rem", fontWeight: 700, marginBottom: "8px" }}>Your Watchlist is empty</h3>
          <p style={{ color: "#94a3b8", fontSize: "0.95rem", marginBottom: "24px" }}>
            Explore trending movies and click "+ Watchlist" to save them for later!
          </p>
          <button
            onClick={() => navigate("/")}
            style={{
              padding: "12px 28px",
              background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
              color: "#ffffff",
              borderRadius: "10px",
              fontWeight: 600,
              fontSize: "0.95rem",
              boxShadow: "0 4px 15px rgba(59, 130, 246, 0.4)"
            }}
          >
            Discover Movies
          </button>
        </div>
      )}

      {/* Grid */}
      {movies.length > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "24px" }}>
          {movies.map((movie) => (
            <MovieCard
              key={movie.id}
              movie={movie}
              onWatchlistToggle={handleRemove}
              isInWatchlist={true}
              showRemoveButton={true}
            />
          ))}
        </div>
      )}
    </div>
  );
}
