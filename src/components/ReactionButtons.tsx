import React, { useState, useEffect } from "react";
import { getMovieReaction, setMovieReaction } from "../services/preferenceStore";
import type { MovieReaction } from "../types";

interface ReactionButtonsProps {
  movieId: number;
  onReactionChange?: (newReaction: MovieReaction) => void;
  size?: "small" | "medium" | "large";
}

export const ReactionButtons: React.FC<ReactionButtonsProps> = ({
  movieId,
  onReactionChange,
  size = "medium"
}) => {
  const [reaction, setReaction] = useState<MovieReaction>(null);

  useEffect(() => {
    setReaction(getMovieReaction(movieId));
  }, [movieId]);

  const handleToggle = (targetReaction: "like" | "dislike", e: React.MouseEvent) => {
    e.stopPropagation();
    const nextReaction = reaction === targetReaction ? null : targetReaction;
    setMovieReaction(movieId, nextReaction);
    setReaction(nextReaction);
    if (onReactionChange) onReactionChange(nextReaction);
  };

  const isSmall = size === "small";
  const padding = isSmall ? "4px 8px" : "6px 12px";
  const fontSize = isSmall ? "0.78rem" : "0.88rem";

  return (
    <div style={{ display: "flex", gap: "6px", alignItems: "center" }} onClick={(e) => e.stopPropagation()}>
      <button
        type="button"
        onClick={(e) => handleToggle("like", e)}
        title="Like movie"
        style={{
          padding,
          fontSize,
          borderRadius: "8px",
          background: reaction === "like" ? "rgba(16, 185, 129, 0.25)" : "rgba(255, 255, 255, 0.06)",
          border: reaction === "like" ? "1px solid #10b981" : "1px solid rgba(255, 255, 255, 0.12)",
          color: reaction === "like" ? "#34d399" : "#94a3b8",
          fontWeight: 600,
          display: "flex",
          alignItems: "center",
          gap: "4px"
        }}
      >
        👍 {reaction === "like" && "Liked"}
      </button>

      <button
        type="button"
        onClick={(e) => handleToggle("dislike", e)}
        title="Dislike / Not Interested"
        style={{
          padding,
          fontSize,
          borderRadius: "8px",
          background: reaction === "dislike" ? "rgba(239, 68, 68, 0.25)" : "rgba(255, 255, 255, 0.06)",
          border: reaction === "dislike" ? "1px solid #ef4444" : "1px solid rgba(255, 255, 255, 0.12)",
          color: reaction === "dislike" ? "#f87171" : "#94a3b8",
          fontWeight: 600,
          display: "flex",
          alignItems: "center",
          gap: "4px"
        }}
      >
        👎 {reaction === "dislike" && "Disliked"}
      </button>
    </div>
  );
};
