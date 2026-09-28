import { useEffect, useState } from "react";
import {
  getTasteDNAStats,
  getWatchHistory,
  clearWatchHistory,
  removeWatchHistoryItem,
  getUserPreferences,
  setUserPreferences,
  GENRE_MAP
} from "../services/preferenceStore";
import type { TasteProfileStats } from "../services/preferenceStore";
import MovieCard from "../components/MovieCard";
import { Toast } from "../components/Toast";
import type { UserPreferences, WatchHistoryItem } from "../types";

const ALL_GENRES = Object.entries(GENRE_MAP).map(([id, name]) => ({ id: Number(id), name }));
const ALL_LANGUAGES = [
  { code: "en", name: "🇺🇸 English" },
  { code: "hi", name: "🇮🇳 Hindi" },
  { code: "te", name: "🎬 Telugu" },
  { code: "ta", name: "🎬 Tamil" },
  { code: "ml", name: "🎬 Malayalam" },
  { code: "kn", name: "🎬 Kannada" },
  { code: "bn", name: "🎬 Bengali" },
  { code: "mr", name: "🎬 Marathi" },
  { code: "ko", name: "🇰🇷 Korean" },
  { code: "ja", name: "🇯🇵 Japanese" }
];

export default function TasteProfile() {
  const [stats, setStats] = useState<TasteProfileStats | null>(null);
  const [prefs, setPrefs] = useState<UserPreferences>(getUserPreferences());
  const [history, setHistory] = useState<WatchHistoryItem[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    loadData();
    window.addEventListener("cineverseUserDataChanged", loadData);
    return () => window.removeEventListener("cineverseUserDataChanged", loadData);
  }, []);

  const loadData = () => {
    setStats(getTasteDNAStats());
    setPrefs(getUserPreferences());
    setHistory(getWatchHistory());
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleToggleGenre = (genreId: number) => {
    const current = prefs.genres || [];
    const updated = current.includes(genreId)
      ? current.filter((id) => id !== genreId)
      : [...current, genreId];
    const newPrefs = { ...prefs, genres: updated };
    setPrefs(newPrefs);
    setUserPreferences(newPrefs);
    showToast("Updated genre preferences!");
  };

  const handleToggleLanguage = (langCode: string) => {
    const current = prefs.languages || [];
    const updated = current.includes(langCode)
      ? current.filter((c) => c !== langCode)
      : [...current, langCode];
    const newPrefs = { ...prefs, languages: updated };
    setPrefs(newPrefs);
    setUserPreferences(newPrefs);
    showToast("Updated language preferences!");
  };

  const handleClearHistory = () => {
    if (window.confirm("Are you sure you want to clear your watch history?")) {
      clearWatchHistory();
      showToast("Cleared Watch History!");
    }
  };

  const handleRemoveHistoryItem = (movieId: number) => {
    removeWatchHistoryItem(movieId);
    showToast("Removed movie from Watch History");
  };

  return (
    <div style={{ minHeight: "100vh", padding: "40px 5% 80px 5%", background: "#090d16", color: "#ffffff" }} className="fade-in">
      <Toast message={toastMessage} />

      {/* Header */}
      <div style={{ marginBottom: "40px", textAlign: "center" }}>
        <div style={{
          display: "inline-flex",
          padding: "8px 18px",
          background: "linear-gradient(135deg, rgba(139, 92, 246, 0.2) 0%, rgba(236, 72, 153, 0.2) 100%)",
          border: "1px solid rgba(139, 92, 246, 0.4)",
          borderRadius: "20px",
          color: "#c084fc",
          fontSize: "0.88rem",
          fontWeight: 700,
          marginBottom: "14px"
        }}>
          🧬 Your Movie DNA Profile
        </div>
        <h1 style={{ fontSize: "clamp(2rem, 3.5vw, 3rem)", fontWeight: 800, margin: 0 }}>
          Taste & Activity Analytics
        </h1>
        <p style={{ color: "#cbd5e1", fontSize: "1rem", marginTop: "8px" }}>
          Real-time analytics generated from your ratings, likes, dislikes, and watch behavior.
        </p>
      </div>

      {/* Stats Cards Grid */}
      {stats && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "20px", marginBottom: "48px" }}>
          <div style={{ background: "#111827", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "16px", padding: "20px", textAlign: "center" }}>
            <div style={{ fontSize: "2rem", marginBottom: "4px" }}>⭐</div>
            <div style={{ fontSize: "1.8rem", fontWeight: 800, color: "#fbbf24" }}>{stats.averageUserRating > 0 ? stats.averageUserRating : "N/A"}</div>
            <div style={{ fontSize: "0.85rem", color: "#94a3b8", fontWeight: 600 }}>Avg Rating Given ({stats.ratedCount} rated)</div>
          </div>

          <div style={{ background: "#111827", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "16px", padding: "20px", textAlign: "center" }}>
            <div style={{ fontSize: "2rem", marginBottom: "4px" }}>👍</div>
            <div style={{ fontSize: "1.8rem", fontWeight: 800, color: "#34d399" }}>{stats.likedCount}</div>
            <div style={{ fontSize: "0.85rem", color: "#94a3b8", fontWeight: 600 }}>Movies Liked</div>
          </div>

          <div style={{ background: "#111827", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "16px", padding: "20px", textAlign: "center" }}>
            <div style={{ fontSize: "2rem", marginBottom: "4px" }}>👎</div>
            <div style={{ fontSize: "1.8rem", fontWeight: 800, color: "#f87171" }}>{stats.dislikedCount}</div>
            <div style={{ fontSize: "0.85rem", color: "#94a3b8", fontWeight: 600 }}>Movies Disliked</div>
          </div>

          <div style={{ background: "#111827", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "16px", padding: "20px", textAlign: "center" }}>
            <div style={{ fontSize: "2rem", marginBottom: "4px" }}>🍿</div>
            <div style={{ fontSize: "1.8rem", fontWeight: 800, color: "#60a5fa" }}>{stats.watchedCount}</div>
            <div style={{ fontSize: "0.85rem", color: "#94a3b8", fontWeight: 600 }}>Watch History Items</div>
          </div>
        </div>
      )}

      {/* Top Genres breakdown */}
      {stats && stats.topGenres.length > 0 && (
        <section style={{ marginBottom: "48px" }}>
          <h2 style={{ fontSize: "1.4rem", fontWeight: 700, marginBottom: "20px" }}>
            📊 Your Top Favorite Genres
          </h2>
          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
            {stats.topGenres.map((g) => (
              <div
                key={g.id}
                style={{
                  background: "rgba(59, 130, 246, 0.15)",
                  border: "1px solid rgba(59, 130, 246, 0.3)",
                  borderRadius: "12px",
                  padding: "10px 18px",
                  display: "flex",
                  alignItems: "center",
                  gap: "10px"
                }}
              >
                <span style={{ fontSize: "0.95rem", fontWeight: 700, color: "#ffffff" }}>{g.name}</span>
                <span style={{ background: "#3b82f6", color: "#fff", fontSize: "0.75rem", fontWeight: 700, padding: "2px 8px", borderRadius: "10px" }}>
                  {g.count} pts
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Preferences Customizer */}
      <section style={{ marginBottom: "48px", background: "rgba(17, 24, 39, 0.8)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "20px", padding: "28px" }}>
        <h2 style={{ fontSize: "1.4rem", fontWeight: 700, marginBottom: "8px" }}>
          ⚙️ Customize Preferences
        </h2>
        <p style={{ color: "#94a3b8", fontSize: "0.9rem", marginBottom: "24px" }}>
          Select your favorite genres and languages to tailor your CineVerse recommendations.
        </p>

        {/* Favorite Genres */}
        <div style={{ marginBottom: "24px" }}>
          <h4 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: "12px", color: "#cbd5e1" }}>
            Preferred Genres
          </h4>
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            {ALL_GENRES.map((g) => {
              const active = (prefs.genres || []).includes(g.id);
              return (
                <button
                  key={g.id}
                  onClick={() => handleToggleGenre(g.id)}
                  style={{
                    padding: "8px 14px",
                    borderRadius: "10px",
                    background: active ? "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)" : "rgba(255,255,255,0.06)",
                    border: active ? "1px solid #60a5fa" : "1px solid rgba(255,255,255,0.1)",
                    color: active ? "#ffffff" : "#94a3b8",
                    fontSize: "0.85rem",
                    fontWeight: 600
                  }}
                >
                  {g.name} {active && "✓"}
                </button>
              );
            })}
          </div>
        </div>

        {/* Preferred Languages */}
        <div>
          <h4 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: "12px", color: "#cbd5e1" }}>
            Preferred Languages
          </h4>
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            {ALL_LANGUAGES.map((l) => {
              const active = (prefs.languages || []).includes(l.code);
              return (
                <button
                  key={l.code}
                  onClick={() => handleToggleLanguage(l.code)}
                  style={{
                    padding: "8px 16px",
                    borderRadius: "10px",
                    background: active ? "linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)" : "rgba(255,255,255,0.06)",
                    border: active ? "1px solid #c084fc" : "1px solid rgba(255,255,255,0.1)",
                    color: active ? "#ffffff" : "#94a3b8",
                    fontSize: "0.88rem",
                    fontWeight: 600
                  }}
                >
                  {l.name} {active && "✓"}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Watch History Section */}
      <section>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <div>
            <h2 style={{ fontSize: "1.4rem", fontWeight: 700, margin: 0 }}>
              📜 Watch & Interaction History ({history.length})
            </h2>
            <p style={{ fontSize: "0.85rem", color: "#94a3b8", margin: 0 }}>
              Movies you have visited or interacted with
            </p>
          </div>

          {history.length > 0 && (
            <button
              onClick={handleClearHistory}
              style={{
                padding: "8px 16px",
                background: "rgba(239, 68, 68, 0.15)",
                border: "1px solid rgba(239, 68, 68, 0.4)",
                color: "#f87171",
                borderRadius: "8px",
                fontWeight: 600,
                fontSize: "0.85rem"
              }}
            >
              Clear History
            </button>
          )}
        </div>

        {history.length === 0 ? (
          <div style={{ padding: "40px", background: "#111827", borderRadius: "16px", textAlign: "center", color: "#94a3b8" }}>
            Your watch history is currently empty. Browse movies to build your history!
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "24px" }}>
            {history.map((item) => (
              <div key={item.movieId} style={{ position: "relative" }}>
                <MovieCard movie={item.movie} />
                <button
                  onClick={() => handleRemoveHistoryItem(item.movieId)}
                  style={{
                    marginTop: "6px",
                    width: "100%",
                    padding: "4px",
                    background: "rgba(239,68,68,0.1)",
                    color: "#f87171",
                    border: "1px solid rgba(239,68,68,0.3)",
                    borderRadius: "6px",
                    fontSize: "0.75rem"
                  }}
                >
                  Remove from history
                </button>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
