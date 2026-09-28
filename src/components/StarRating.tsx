import React, { useState, useEffect } from "react";
import { getMovieRating, setMovieRating } from "../services/preferenceStore";

interface StarRatingProps {
  movieId: number;
  onRatingChange?: (rating: number) => void;
  showLabel?: boolean;
}

export const StarRating: React.FC<StarRatingProps> = ({
  movieId,
  onRatingChange,
  showLabel = true
}) => {
  const [rating, setRating] = useState<number>(0);
  const [hoverRating, setHoverRating] = useState<number>(0);

  useEffect(() => {
    setRating(getMovieRating(movieId));
  }, [movieId]);

  const handleStarClick = (star: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const next = rating === star ? 0 : star;
    setMovieRating(movieId, next);
    setRating(next);
    if (onRatingChange) onRatingChange(next);
  };

  return (
    <div
      style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
      onClick={(e) => e.stopPropagation()}
    >
      <div style={{ display: "flex", gap: "2px" }}>
        {[1, 2, 3, 4, 5].map((star) => {
          const active = (hoverRating || rating) >= star;
          return (
            <span
              key={star}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              onClick={(e) => handleStarClick(star, e)}
              style={{
                cursor: "pointer",
                fontSize: "1.2rem",
                color: active ? "#fbbf24" : "rgba(255, 255, 255, 0.2)",
                transition: "color 0.15s ease, transform 0.15s ease",
                transform: active ? "scale(1.1)" : "scale(1)"
              }}
              title={`Rate ${star} star${star > 1 ? "s" : ""}`}
            >
              ★
            </span>
          );
        })}
      </div>

      {showLabel && rating > 0 && (
        <span style={{ fontSize: "0.82rem", color: "#fbbf24", fontWeight: 700 }}>
          ({rating}/5)
        </span>
      )}
    </div>
  );
};
