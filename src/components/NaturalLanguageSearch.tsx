import React, { useState } from "react";
import { processNaturalLanguageSearch } from "../services/naturalLanguageSearch";
import type { ParsedQueryIntent } from "../services/naturalLanguageSearch";
import type { Movie } from "../types";

interface NaturalLanguageSearchProps {
  onResults: (movies: Movie[], intent: ParsedQueryIntent) => void;
  onClear: () => void;
}

const PRESET_QUERIES = [
  "Mind-bending thriller under 2 hours",
  "Good Telugu comedy for family",
  "Something like Interstellar but shorter",
  "Dark psychological thriller from last 10 years",
  "Heartwarming Hindi romance"
];

export const NaturalLanguageSearch: React.FC<NaturalLanguageSearchProps> = ({
  onResults,
  onClear
}) => {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeIntent, setActiveIntent] = useState<ParsedQueryIntent | null>(null);

  const handleSearch = async (textToSearch: string) => {
    if (!textToSearch.trim()) return;
    setLoading(true);
    try {
      const { movies, intent } = await processNaturalLanguageSearch(textToSearch);
      setActiveIntent(intent);
      onResults(movies, intent);
    } catch (err) {
      console.error("AI Search Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch(query);
    }
  };

  const handleClear = () => {
    setQuery("");
    setActiveIntent(null);
    onClear();
  };

  return (
    <div
      style={{
        background: "linear-gradient(135deg, rgba(17, 24, 39, 0.8) 0%, rgba(30, 27, 75, 0.6) 100%)",
        border: "1px solid rgba(139, 92, 246, 0.3)",
        borderRadius: "20px",
        padding: "24px",
        boxShadow: "0 8px 30px rgba(0, 0, 0, 0.4)",
        display: "flex",
        flexDirection: "column",
        gap: "16px"
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "10px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{
            width: "36px",
            height: "36px",
            borderRadius: "10px",
            background: "linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "1.1rem"
          }}>
            🤖
          </div>
          <div>
            <h3 style={{ fontSize: "1.15rem", fontWeight: 700, margin: 0, color: "#ffffff" }}>
              Smart AI Search & Intent Discovery
            </h3>
            <p style={{ fontSize: "0.82rem", color: "#cbd5e1", margin: 0 }}>
              Describe what you feel like watching in plain English
            </p>
          </div>
        </div>

        {activeIntent && (
          <button
            onClick={handleClear}
            style={{
              padding: "6px 14px",
              background: "rgba(255, 255, 255, 0.08)",
              border: "1px solid rgba(255, 255, 255, 0.12)",
              color: "#cbd5e1",
              borderRadius: "8px",
              fontSize: "0.82rem",
              fontWeight: 500
            }}
          >
            Reset AI Filter
          </button>
        )}
      </div>

      {/* Input bar */}
      <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
        <span style={{ position: "absolute", left: "16px", color: "#a78bfa", fontSize: "1.2rem" }}>
          ✨
        </span>
        <input
          type="text"
          placeholder='Try "I want a mind-bending sci-fi movie under 2 hours"...'
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          style={{
            width: "100%",
            padding: "14px 110px 14px 48px",
            background: "rgba(15, 23, 42, 0.9)",
            border: "1px solid rgba(139, 92, 246, 0.4)",
            borderRadius: "12px",
            color: "#ffffff",
            fontSize: "0.95rem"
          }}
        />
        <button
          onClick={() => handleSearch(query)}
          disabled={loading}
          style={{
            position: "absolute",
            right: "8px",
            padding: "8px 18px",
            background: "linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)",
            color: "#ffffff",
            borderRadius: "8px",
            fontWeight: 600,
            fontSize: "0.88rem",
            opacity: loading ? 0.7 : 1
          }}
        >
          {loading ? "Parsing..." : "Ask AI"}
        </button>
      </div>

      {/* Preset pills */}
      <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
        <span style={{ fontSize: "0.8rem", color: "#94a3b8", fontWeight: 600 }}>Try asking:</span>
        {PRESET_QUERIES.map((preset, idx) => (
          <button
            key={idx}
            onClick={() => {
              setQuery(preset);
              handleSearch(preset);
            }}
            style={{
              padding: "4px 12px",
              background: query === preset ? "rgba(139, 92, 246, 0.3)" : "rgba(255, 255, 255, 0.05)",
              border: query === preset ? "1px solid #8b5cf6" : "1px solid rgba(255, 255, 255, 0.1)",
              color: query === preset ? "#c084fc" : "#cbd5e1",
              borderRadius: "20px",
              fontSize: "0.8rem",
              fontWeight: 500
            }}
          >
            {preset}
          </button>
        ))}
      </div>

      {/* Detected Intent Tags */}
      {activeIntent && activeIntent.detectedTags.length > 0 && (
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          padding: "10px 14px",
          background: "rgba(139, 92, 246, 0.15)",
          borderRadius: "10px",
          border: "1px solid rgba(139, 92, 246, 0.3)",
          marginTop: "4px"
        }}>
          <span style={{ fontSize: "0.82rem", color: "#c084fc", fontWeight: 700 }}>AI Extracted Intent:</span>
          {activeIntent.detectedTags.map((tag, i) => (
            <span
              key={i}
              style={{
                background: "#8b5cf6",
                color: "#ffffff",
                fontSize: "0.75rem",
                fontWeight: 700,
                padding: "2px 8px",
                borderRadius: "10px"
              }}
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};
