import React from "react";
import { useNavigate } from "react-router-dom";
import { getPosterUrl } from "../movieAPI";
import { ReactionButtons } from "./ReactionButtons";
import { StarRating } from "./StarRating";
import type { Movie } from "../types";

interface MovieCardProps {
  movie: Movie;
  onWatchlistToggle?: (movie: Movie) => void;
  isInWatchlist?: boolean;
  showRemoveButton?: boolean;
}

const MovieCard: React.FC<MovieCardProps> = ({
  movie,
  onWatchlistToggle,
  isInWatchlist: propsInWatchlist,
  showRemoveButton = false
}) => {
  const navigate = useNavigate();

  // Local state check if prop is not provided
  const checkWatchlistState = (): boolean => {
    if (propsInWatchlist !== undefined) return propsInWatchlist;
    try {
      const saved = JSON.parse(localStorage.getItem("watchlist") || "[]");
      return saved.some((m: Movie) => m.id === movie.id);
    } catch {
      return false;
    }
  };

  const inWatchlist = checkWatchlistState();

  const handleWatchlistClick = (e: React.MouseEvent) => {
    e.stopPropagation();

    if (onWatchlistToggle) {
      onWatchlistToggle(movie);
      return;
    }

    try {
      const existing: Movie[] = JSON.parse(localStorage.getItem("watchlist") || "[]");
      let updated: Movie[];

      if (inWatchlist) {
        updated = existing.filter((m) => m.id !== movie.id);
      } else {
        updated = [...existing, movie];
      }

      localStorage.setItem("watchlist", JSON.stringify(updated));
      window.dispatchEvent(new Event("watchlistUpdated"));
    } catch (err) {
      console.error("Watchlist storage error:", err);
    }
  };

  const rating = movie.vote_average ? movie.vote_average.toFixed(1) : "N/A";
  const year = movie.release_date ? movie.release_date.split("-")[0] : "";

  return (
    <div
      onClick={() => navigate(`/movie/${movie.id}`)}
      style={{
        width: "210px",
        background: "#111827",
        borderRadius: "14px",
        border: "1px solid rgba(255, 255, 255, 0.08)",
        overflow: "hidden",
        color: "#ffffff",
        cursor: "pointer",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
        boxShadow: "0 4px 15px rgba(0,0,0,0.3)"
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-6px)";
        e.currentTarget.style.boxShadow = "0 12px 25px rgba(0, 0, 0, 0.5), 0 0 15px rgba(59, 130, 246, 0.2)";
        e.currentTarget.style.borderColor = "rgba(59, 130, 246, 0.4)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "0 4px 15px rgba(0,0,0,0.3)";
        e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.08)";
      }}
    >
      {/* Poster Container */}
      <div style={{ position: "relative", width: "100%", paddingTop: "150%", background: "#1f293d", overflow: "hidden" }}>
        <img
          src={getPosterUrl(movie.poster_path)}
          alt={movie.title}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover"
          }}
          loading="lazy"
        />

        {/* Rating Badge */}
        <div style={{
          position: "absolute",
          top: "10px",
          right: "10px",
          background: "rgba(9, 13, 22, 0.8)",
          backdropFilter: "blur(6px)",
          border: "1px solid rgba(251, 191, 36, 0.4)",
          color: "#fbbf24",
          fontSize: "0.78rem",
          fontWeight: 700,
          padding: "3px 8px",
          borderRadius: "8px",
          display: "flex",
          alignItems: "center",
          gap: "4px"
        }}>
          ⭐ {rating}
        </div>

        {/* Year Badge if available */}
        {year && (
          <div style={{
            position: "absolute",
            top: "10px",
            left: "10px",
            background: "rgba(9, 13, 22, 0.75)",
            backdropFilter: "blur(6px)",
            color: "#cbd5e1",
            fontSize: "0.75rem",
            fontWeight: 600,
            padding: "3px 8px",
            borderRadius: "8px"
          }}>
            {year}
          </div>
        )}
      </div>

      {/* Card Content */}
      <div style={{ padding: "12px 14px", display: "flex", flexDirection: "column", gap: "10px", flex: 1, justifyContent: "space-between" }}>
        <div>
          <h4 style={{
            fontSize: "0.95rem",
            fontWeight: 700,
            margin: 0,
            lineHeight: "1.3",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis"
          }} title={movie.title}>
            {movie.title}
          </h4>

          {/* Interactive User Rating */}
          <div style={{ marginTop: "6px" }}>
            <StarRating movieId={movie.id} showLabel={false} />
          </div>
        </div>

        {/* Action Controls */}
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {/* Reaction Buttons */}
          <ReactionButtons movieId={movie.id} size="small" />

          {/* Watchlist Action Button */}
          <button
            onClick={handleWatchlistClick}
            style={{
              width: "100%",
              padding: "8px",
              background: showRemoveButton || inWatchlist
                ? "rgba(239, 68, 68, 0.15)"
                : "rgba(59, 130, 246, 0.15)",
              border: showRemoveButton || inWatchlist
                ? "1px solid rgba(239, 68, 68, 0.4)"
                : "1px solid rgba(59, 130, 246, 0.4)",
              color: showRemoveButton || inWatchlist ? "#f87171" : "#60a5fa",
              borderRadius: "8px",
              fontSize: "0.82rem",
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "6px",
              transition: "all 0.2s ease"
            }}
            onMouseEnter={(e) => {
              if (showRemoveButton || inWatchlist) {
                e.currentTarget.style.background = "#ef4444";
                e.currentTarget.style.color = "#ffffff";
              } else {
                e.currentTarget.style.background = "#3b82f6";
                e.currentTarget.style.color = "#ffffff";
              }
            }}
            onMouseLeave={(e) => {
              if (showRemoveButton || inWatchlist) {
                e.currentTarget.style.background = "rgba(239, 68, 68, 0.15)";
                e.currentTarget.style.color = "#f87171";
              } else {
                e.currentTarget.style.background = "rgba(59, 130, 246, 0.15)";
                e.currentTarget.style.color = "#60a5fa";
              }
            }}
          >
            {showRemoveButton ? (
              <>🗑️ Remove</>
            ) : inWatchlist ? (
              <>✓ In Watchlist</>
            ) : (
              <>+ Watchlist</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MovieCard;

