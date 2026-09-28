import React from "react";
import { useNavigate } from "react-router-dom";
import { getBackdropUrl } from "../movieAPI";
import type { Movie } from "../types";

interface HeroBannerProps {
  movie: Movie | null;
  onWatchlistToggle: (movie: Movie) => void;
  isInWatchlist: boolean;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({
  movie,
  onWatchlistToggle,
  isInWatchlist
}) => {
  const navigate = useNavigate();

  if (!movie) return null;

  const year = movie.release_date ? movie.release_date.split("-")[0] : "";
  const rating = movie.vote_average ? movie.vote_average.toFixed(1) : "N/A";

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "520px",
        backgroundImage: `url(${getBackdropUrl(movie.backdrop_path)})`,
        backgroundSize: "cover",
        backgroundPosition: "center 20%",
        display: "flex",
        alignItems: "flex-end",
        padding: "0 5% 50px 5%",
        marginBottom: "40px",
        borderRadius: "0 0 24px 24px",
        overflow: "hidden"
      }}
    >
      {/* Dark Gradient Overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "linear-gradient(180deg, rgba(9, 13, 22, 0.2) 0%, rgba(9, 13, 22, 0.75) 60%, #090d16 100%), linear-gradient(90deg, #090d16 0%, rgba(9, 13, 22, 0.7) 40%, rgba(9, 13, 22, 0.1) 100%)"
        }}
      />

      {/* Hero Content */}
      <div
        style={{
          position: "relative",
          zIndex: 2,
          maxWidth: "650px",
          display: "flex",
          flexDirection: "column",
          gap: "16px"
        }}
        className="fade-in"
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
          <span style={{
            background: "rgba(59, 130, 246, 0.25)",
            border: "1px solid rgba(59, 130, 246, 0.5)",
            color: "#60a5fa",
            fontWeight: 700,
            fontSize: "0.75rem",
            padding: "4px 10px",
            borderRadius: "20px",
            letterSpacing: "0.5px",
            textTransform: "uppercase"
          }}>
            🔥 Featured Movie
          </span>
          {year && (
            <span style={{ color: "#cbd5e1", fontSize: "0.9rem", fontWeight: 500 }}>
              {year}
            </span>
          )}
          <span style={{
            background: "rgba(251, 191, 36, 0.15)",
            border: "1px solid rgba(251, 191, 36, 0.3)",
            color: "#fbbf24",
            fontWeight: 700,
            fontSize: "0.85rem",
            padding: "3px 8px",
            borderRadius: "6px",
            display: "flex",
            alignItems: "center",
            gap: "4px"
          }}>
            ⭐ {rating}
          </span>
        </div>

        <h1 style={{
          fontSize: "clamp(2rem, 4vw, 3.2rem)",
          fontWeight: 800,
          lineHeight: 1.1,
          letterSpacing: "-0.5px",
          textShadow: "0 4px 12px rgba(0,0,0,0.6)"
        }}>
          {movie.title}
        </h1>

        <p style={{
          fontSize: "1rem",
          lineHeight: 1.5,
          color: "#cbd5e1",
          display: "-webkit-box",
          WebkitLineClamp: 3,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
          textShadow: "0 2px 4px rgba(0,0,0,0.8)"
        }}>
          {movie.overview}
        </p>

        <div style={{ display: "flex", gap: "14px", marginTop: "8px" }}>
          <button
            onClick={() => navigate(`/movie/${movie.id}`)}
            style={{
              padding: "12px 28px",
              borderRadius: "10px",
              background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
              color: "#ffffff",
              fontWeight: 600,
              fontSize: "0.95rem",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              boxShadow: "0 4px 15px rgba(59, 130, 246, 0.4)"
            }}
          >
            ℹ️ View Details
          </button>

          <button
            onClick={() => onWatchlistToggle(movie)}
            style={{
              padding: "12px 24px",
              borderRadius: "10px",
              background: isInWatchlist ? "rgba(16, 185, 129, 0.2)" : "rgba(255, 255, 255, 0.1)",
              border: isInWatchlist ? "1px solid #10b981" : "1px solid rgba(255, 255, 255, 0.2)",
              color: isInWatchlist ? "#34d399" : "#ffffff",
              fontWeight: 600,
              fontSize: "0.95rem",
              backdropFilter: "blur(8px)",
              display: "flex",
              alignItems: "center",
              gap: "8px"
            }}
          >
            {isInWatchlist ? "✓ In Watchlist" : "+ Add Watchlist"}
          </button>
        </div>
      </div>
    </div>
  );
};
