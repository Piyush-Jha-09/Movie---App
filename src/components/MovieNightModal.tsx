import React, { useState } from "react";
import { discoverMovies } from "../movieAPI";
import MovieCard from "./MovieCard";
import type { Movie, GroupUserPreference } from "../types";

interface MovieNightModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MovieNightModal: React.FC<MovieNightModalProps> = ({
  isOpen,
  onClose
}) => {
  const [activeTab, setActiveTab] = useState<"night" | "group">("night");

  // Movie Night State
  const [audience, setAudience] = useState<string>("friends");
  const [mood, setMood] = useState<string>("exciting");
  const [language, setLanguage] = useState<string>("all");
  const [loading, setLoading] = useState(false);
  const [curatedResults, setCuratedResults] = useState<Movie[]>([]);

  // Group Matcher State
  const [groupUsers, setGroupUsers] = useState<GroupUserPreference[]>([
    { name: "User 1", preferences: { genres: [28, 878], languages: ["en"], minRating: 6 }, likedMovieIds: [], dislikedMovieIds: [] },
    { name: "User 2", preferences: { genres: [18, 53], languages: ["en"], minRating: 6 }, likedMovieIds: [], dislikedMovieIds: [] }
  ]);
  const [newUserName, setNewUserName] = useState("");
  const [groupResults, setGroupResults] = useState<Movie[]>([]);

  if (!isOpen) return null;

  const handleGenerateMovieNight = async () => {
    setLoading(true);
    try {
      const res = await discoverMovies(language, "all");
      let movies: Movie[] = res.data?.results || [];

      // Map mood & audience to genre filters
      let genreFilter: number[] = [];
      if (mood === "exciting") genreFilter = [28, 53, 12];
      else if (mood === "funny") genreFilter = [35];
      else if (mood === "scary") genreFilter = [27, 9648];
      else if (mood === "emotional") genreFilter = [18, 10749];
      else if (mood === "mindbending") genreFilter = [878, 53];
      else genreFilter = [10751, 35, 16]; // Family/Relaxed

      if (audience === "family") {
        movies = movies.filter((m) => m.genre_ids?.includes(10751) || m.genre_ids?.includes(16) || m.genre_ids?.includes(35));
      } else if (genreFilter.length > 0) {
        movies = movies.filter((m) => m.genre_ids?.some((gId) => genreFilter.includes(gId)));
      }

      setCuratedResults(movies.slice(0, 10));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddGroupUser = () => {
    if (!newUserName.trim()) return;
    setGroupUsers((prev) => [
      ...prev,
      { name: newUserName, preferences: { genres: [28, 35], languages: ["en"], minRating: 6 }, likedMovieIds: [], dislikedMovieIds: [] }
    ]);
    setNewUserName("");
  };

  const handleCalculateGroupMatches = async () => {
    setLoading(true);
    try {
      const res = await discoverMovies("all", "all");
      const movies: Movie[] = res.data?.results || [];

      // Combine genres across all users
      const allGenres = groupUsers.flatMap((u) => u.preferences.genres);
      const genreCounts: Record<number, number> = {};
      allGenres.forEach((gId) => {
        genreCounts[gId] = (genreCounts[gId] || 0) + 1;
      });

      // Score movies by compatibility
      const scored = movies.map((m) => {
        let compatibilityScore = 50;
        m.genre_ids?.forEach((gId) => {
          if (genreCounts[gId]) {
            compatibilityScore += genreCounts[gId] * 20;
          }
        });
        return { movie: m, compatibilityScore };
      });

      scored.sort((a, b) => b.compatibilityScore - a.compatibilityScore);
      setGroupResults(scored.map((s) => s.movie).slice(0, 10));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 99999,
        background: "rgba(0, 0, 0, 0.8)",
        backdropFilter: "blur(10px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px"
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "850px",
          maxHeight: "90vh",
          background: "#0d1322",
          border: "1px solid rgba(255, 255, 255, 0.15)",
          borderRadius: "24px",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          boxShadow: "0 20px 50px rgba(0,0,0,0.9)"
        }}
        className="fade-in"
      >
        {/* Header */}
        <div style={{
          padding: "20px 28px",
          borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
          background: "rgba(17, 24, 39, 0.8)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            <span style={{ fontSize: "1.8rem" }}>🎬</span>
            <div>
              <h2 style={{ fontSize: "1.4rem", fontWeight: 800, margin: 0, color: "#ffffff" }}>
                Movie Night & Group Recommendations
              </h2>
              <p style={{ fontSize: "0.85rem", color: "#94a3b8", margin: 0 }}>
                Curate the perfect watch session for yourself, couples, or group of friends
              </p>
            </div>
          </div>

          <button onClick={onClose} style={{ background: "none", color: "#94a3b8", fontSize: "1.3rem" }}>
            ✕
          </button>
        </div>

        {/* Tab Switcher */}
        <div style={{ display: "flex", borderBottom: "1px solid rgba(255, 255, 255, 0.08)", background: "#090d16" }}>
          <button
            onClick={() => setActiveTab("night")}
            style={{
              flex: 1,
              padding: "14px",
              fontWeight: 700,
              fontSize: "0.95rem",
              background: activeTab === "night" ? "rgba(59, 130, 246, 0.15)" : "transparent",
              color: activeTab === "night" ? "#60a5fa" : "#94a3b8",
              borderBottom: activeTab === "night" ? "2px solid #3b82f6" : "none"
            }}
          >
            🍿 Movie Night Curator
          </button>
          <button
            onClick={() => setActiveTab("group")}
            style={{
              flex: 1,
              padding: "14px",
              fontWeight: 700,
              fontSize: "0.95rem",
              background: activeTab === "group" ? "rgba(139, 92, 246, 0.15)" : "transparent",
              color: activeTab === "group" ? "#c084fc" : "#94a3b8",
              borderBottom: activeTab === "group" ? "2px solid #8b5cf6" : "none"
            }}
          >
            👥 Group Matcher (Multi-User)
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ flex: 1, overflowY: "auto", padding: "28px" }}>
          {activeTab === "night" ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
              {/* Form Controls */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "20px" }}>
                {/* Audience */}
                <div>
                  <label style={{ fontSize: "0.85rem", fontWeight: 700, color: "#cbd5e1", display: "block", marginBottom: "8px" }}>
                    Who is watching?
                  </label>
                  <select
                    value={audience}
                    onChange={(e) => setAudience(e.target.value)}
                    style={{ width: "100%", padding: "12px", background: "#111827", border: "1px solid rgba(255,255,255,0.12)", borderRadius: "10px", color: "#fff" }}
                  >
                    <option value="solo">👤 Just Me (Solo)</option>
                    <option value="couple">❤️ Couple</option>
                    <option value="friends">🥳 Friends</option>
                    <option value="family">👨‍👩‍👧‍👦 Family</option>
                  </select>
                </div>

                {/* Mood */}
                <div>
                  <label style={{ fontSize: "0.85rem", fontWeight: 700, color: "#cbd5e1", display: "block", marginBottom: "8px" }}>
                    Vibe / Mood
                  </label>
                  <select
                    value={mood}
                    onChange={(e) => setMood(e.target.value)}
                    style={{ width: "100%", padding: "12px", background: "#111827", border: "1px solid rgba(255,255,255,0.12)", borderRadius: "10px", color: "#fff" }}
                  >
                    <option value="exciting">🔥 Exciting & Action</option>
                    <option value="funny">😂 Funny & Comedy</option>
                    <option value="scary">😨 Scary Horror</option>
                    <option value="emotional">😭 Emotional & Drama</option>
                    <option value="mindbending">🤯 Mind-bending Sci-Fi</option>
                    <option value="relaxed">😌 Relaxed & Easy</option>
                  </select>
                </div>

                {/* Language */}
                <div>
                  <label style={{ fontSize: "0.85rem", fontWeight: 700, color: "#cbd5e1", display: "block", marginBottom: "8px" }}>
                    Language
                  </label>
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    style={{ width: "100%", padding: "12px", background: "#111827", border: "1px solid rgba(255,255,255,0.12)", borderRadius: "10px", color: "#fff" }}
                  >
                    <option value="all">🌐 Any Language</option>
                    <option value="hi">🇮🇳 Hindi</option>
                    <option value="en">🇺🇸 English</option>
                    <option value="te">🎬 Telugu</option>
                    <option value="ta">🎬 Tamil</option>
                    <option value="ko">🇰🇷 Korean</option>
                  </select>
                </div>
              </div>

              <button
                onClick={handleGenerateMovieNight}
                disabled={loading}
                style={{
                  padding: "14px",
                  background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
                  color: "#ffffff",
                  borderRadius: "12px",
                  fontWeight: 700,
                  fontSize: "1rem",
                  boxShadow: "0 4px 20px rgba(59, 130, 246, 0.4)"
                }}
              >
                {loading ? "Curating Movie Night..." : "🍿 Generate Movie Night List"}
              </button>

              {/* Curated Results */}
              {curatedResults.length > 0 && (
                <div>
                  <h3 style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: "16px" }}>
                    ✨ Curated For Your Movie Night
                  </h3>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: "20px" }}>
                    {curatedResults.map((m) => (
                      <MovieCard key={m.id} movie={m} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
              {/* Group Users Manager */}
              <div>
                <h3 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "12px" }}>
                  👥 Group Participants ({groupUsers.length})
                </h3>

                <div style={{ display: "flex", gap: "10px", marginBottom: "16px" }}>
                  <input
                    type="text"
                    placeholder="Add friend name (e.g., Sarah)..."
                    value={newUserName}
                    onChange={(e) => setNewUserName(e.target.value)}
                    style={{ flex: 1, padding: "10px 14px", background: "#111827", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "#fff" }}
                  />
                  <button
                    onClick={handleAddGroupUser}
                    style={{ padding: "10px 16px", background: "#8b5cf6", color: "#fff", borderRadius: "8px", fontWeight: 600 }}
                  >
                    + Add Participant
                  </button>
                </div>

                <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                  {groupUsers.map((u, i) => (
                    <div
                      key={i}
                      style={{
                        padding: "10px 16px",
                        background: "rgba(139, 92, 246, 0.15)",
                        border: "1px solid rgba(139, 92, 246, 0.3)",
                        borderRadius: "12px",
                        display: "flex",
                        alignItems: "center",
                        gap: "10px"
                      }}
                    >
                      <span style={{ fontWeight: 700, color: "#c084fc" }}>👤 {u.name}</span>
                      {groupUsers.length > 2 && (
                        <button
                          onClick={() => setGroupUsers((prev) => prev.filter((_, idx) => idx !== i))}
                          style={{ background: "none", color: "#94a3b8", fontSize: "0.8rem" }}
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={handleCalculateGroupMatches}
                disabled={loading}
                style={{
                  padding: "14px",
                  background: "linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)",
                  color: "#ffffff",
                  borderRadius: "12px",
                  fontWeight: 700,
                  fontSize: "1rem",
                  boxShadow: "0 4px 20px rgba(139, 92, 246, 0.4)"
                }}
              >
                {loading ? "Matching Group Tastes..." : "🤝 Find Common Group Movies"}
              </button>

              {/* Group Results */}
              {groupResults.length > 0 && (
                <div>
                  <h3 style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: "16px" }}>
                    🎯 Top Group Compatibility Matches
                  </h3>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: "20px" }}>
                    {groupResults.map((m) => (
                      <MovieCard key={m.id} movie={m} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
