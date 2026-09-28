import React from "react";
import type { MoodConfig } from "../types";

export const MOOD_LIST: MoodConfig[] = [
  { id: "romantic", name: "Love & Romance", emoji: "❤️", description: "Love stories & romance", primaryGenreId: 10749, secondaryGenreIds: [18, 35], excludeGenreIds: [27, 10752] },
  { id: "funny", name: "Funny", emoji: "😂", description: "Laugh-out-loud comedy", primaryGenreId: 35, secondaryGenreIds: [10751, 16] },
  { id: "exciting", name: "Exciting", emoji: "🔥", description: "High-octane action & thrillers", primaryGenreId: 28, secondaryGenreIds: [12, 53, 80] },
  { id: "scary", name: "Scary", emoji: "😨", description: "Chilling horror & suspense", primaryGenreId: 27, secondaryGenreIds: [9648, 53] },
  { id: "emotional", name: "Emotional", emoji: "😭", description: "Heartwarming & tear-jerkers", primaryGenreId: 18, secondaryGenreIds: [10749, 10751] },
  { id: "thoughtful", name: "Thought-provoking", emoji: "🧠", description: "Deep concepts & history", primaryGenreId: 878, secondaryGenreIds: [36, 99, 9648, 18] },
  { id: "mindbending", name: "Mind-bending", emoji: "🤯", description: "Twists, puzzles & Sci-Fi", primaryGenreId: 878, secondaryGenreIds: [53, 9648] },
  { id: "dramatic", name: "Dramatic", emoji: "🎭", description: "Intense crime & drama", primaryGenreId: 18, secondaryGenreIds: [80, 36, 9648] },
  { id: "relaxed", name: "Relaxed", emoji: "😌", description: "Lighthearted & easygoing", primaryGenreId: 10751, secondaryGenreIds: [35, 16] },
  { id: "easy", name: "Easy Watch", emoji: "🍿", description: "Fun, comfortable entertainment", primaryGenreId: 35, secondaryGenreIds: [10751, 16] }
];

interface MoodSelectorProps {
  selectedMoodId: string | null;
  onSelectMood: (mood: MoodConfig | null) => void;
}

export const MoodSelector: React.FC<MoodSelectorProps> = ({
  selectedMoodId,
  onSelectMood
}) => {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h3 style={{ fontSize: "1.2rem", fontWeight: 700, margin: 0, display: "flex", alignItems: "center", gap: "8px" }}>
          🎭 What's your mood?
        </h3>
        {selectedMoodId && (
          <button
            onClick={() => onSelectMood(null)}
            style={{
              fontSize: "0.82rem",
              color: "#94a3b8",
              background: "rgba(255, 255, 255, 0.08)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              borderRadius: "6px",
              padding: "4px 10px"
            }}
          >
            Clear Mood
          </button>
        )}
      </div>

      <div style={{ display: "flex", gap: "10px", overflowX: "auto", paddingBottom: "10px", scrollbarWidth: "thin" }}>
        {MOOD_LIST.map((mood) => {
          const active = selectedMoodId === mood.id;
          return (
            <button
              key={mood.id}
              onClick={() => onSelectMood(active ? null : mood)}
              style={{
                flexShrink: 0,
                padding: "10px 16px",
                borderRadius: "14px",
                background: active
                  ? "linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)"
                  : "rgba(17, 24, 39, 0.7)",
                border: active ? "1px solid #60a5fa" : "1px solid rgba(255, 255, 255, 0.1)",
                color: "#ffffff",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                boxShadow: active ? "0 4px 15px rgba(59, 130, 246, 0.4)" : "none",
                transition: "all 0.2s ease"
              }}
            >
              <span style={{ fontSize: "1.3rem" }}>{mood.emoji}</span>
              <div style={{ textAlign: "left" }}>
                <div style={{ fontSize: "0.9rem", fontWeight: 700 }}>{mood.name}</div>
                <div style={{ fontSize: "0.72rem", color: active ? "#e2e8f0" : "#94a3b8" }}>
                  {mood.description}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
