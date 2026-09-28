import React, { useEffect, useState } from "react";
import {
  searchMovies,
  discoverMovies,
  getTrendingWorld,
  getTrendingIndia,
  getTrendingHindi
} from "../movieAPI";
import MovieCard from "../components/MovieCard";
import { HeroBanner } from "../components/HeroBanner";
import { Toast } from "../components/Toast";
import type { Movie } from "../types";

export default function Home() {
  const [query, setQuery] = useState("");
  const [language, setLanguage] = useState("all");
  const [year, setYear] = useState("all");

  const [results, setResults] = useState<Movie[]>([]);
  const [world, setWorld] = useState<Movie[]>([]);
  const [india, setIndia] = useState<Movie[]>([]);
  const [hindi, setHindi] = useState<Movie[]>([]);
  const [featuredMovie, setFeaturedMovie] = useState<Movie | null>(null);
  const [history, setHistory] = useState<string[]>([]);
  const [watchlistIds, setWatchlistIds] = useState<number[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<"success" | "info" | "warning">("success");

  useEffect(() => {
    loadData();
    loadWatchlist();
    loadHistory();
  }, []);

  const loadWatchlist = () => {
    try {
      const saved = JSON.parse(localStorage.getItem("watchlist") || "[]");
      setWatchlistIds(saved.map((m: Movie) => m.id));
    } catch {
      setWatchlistIds([]);
    }
  };

  const showToast = (msg: string, type: "success" | "info" | "warning" = "success") => {
    setToastMessage(msg);
    setToastType(type);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleWatchlistToggle = (movie: Movie) => {
    try {
      const existing: Movie[] = JSON.parse(localStorage.getItem("watchlist") || "[]");
      const exists = existing.some((m) => m.id === movie.id);
      let updated: Movie[];

      if (exists) {
        updated = existing.filter((m) => m.id !== movie.id);
        showToast(`Removed "${movie.title}" from Watchlist`, "warning");
      } else {
        updated = [...existing, movie];
        showToast(`Added "${movie.title}" to Watchlist!`, "success");
      }

      localStorage.setItem("watchlist", JSON.stringify(updated));
      setWatchlistIds(updated.map((m) => m.id));
      window.dispatchEvent(new Event("watchlistUpdated"));
    } catch (err) {
      console.error("Watchlist toggle failed:", err);
    }
  };

  const loadData = async () => {
    try {
      const worldRes = await getTrendingWorld();
      const worldMovies: Movie[] = worldRes.data.results || [];
      setWorld(worldMovies.slice(0, 10));

      if (worldMovies.length > 0) {
        setFeaturedMovie(worldMovies[0]);
      }

      const indiaRes = await getTrendingIndia();
      setIndia((indiaRes.data.results || []).slice(0, 10));

      const hindiRes = await getTrendingHindi();
      setHindi((hindiRes.data.results || []).slice(0, 10));
    } catch (err) {
      console.error("Failed to load trending data:", err);
    }
  };

  const loadHistory = () => {
    const saved = localStorage.getItem("history");
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch {
        setHistory([]);
      }
    }
  };

  const saveHistory = (text: string) => {
    if (!text.trim()) return;
    const updated = [text, ...history.filter((h) => h.toLowerCase() !== text.toLowerCase())].slice(0, 6);
    setHistory(updated);
    localStorage.setItem("history", JSON.stringify(updated));
  };

  const executeSearch = async (searchQuery: string, searchLang = language, searchYear = year) => {
    let movies: Movie[] = [];

    try {
      if (searchQuery.trim()) {
        const res = await searchMovies(searchQuery);
        movies = res.data.results || [];
        saveHistory(searchQuery);
      } else {
        const res = await discoverMovies(searchLang, searchYear);
        movies = res.data.results || [];
      }
      setResults(movies.slice(0, 18));
    } catch (err) {
      console.error("Search error:", err);
    }
  };

  const handleSearchClick = () => {
    executeSearch(query);
  };

  const handleTagClick = (tag: string) => {
    setQuery(tag);
    executeSearch(tag);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      executeSearch(query);
    }
  };

  const handleClearSearch = () => {
    setQuery("");
    setResults([]);
  };

  return (
    <div style={{ minHeight: "100vh", paddingBottom: "60px", background: "#090d16", color: "#ffffff" }}>
      {/* Toast Notification */}
      <Toast message={toastMessage} type={toastType} />

      {/* Hero Banner featuring top trending movie */}
      {!results.length && (
        <HeroBanner
          movie={featuredMovie}
          onWatchlistToggle={handleWatchlistToggle}
          isInWatchlist={featuredMovie ? watchlistIds.includes(featuredMovie.id) : false}
        />
      )}

      <div style={{ padding: "0 5%" }}>
        {/* Search & Filter Bar */}
        <div
          style={{
            background: "rgba(17, 24, 39, 0.7)",
            backdropFilter: "blur(16px)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            borderRadius: "16px",
            padding: "20px 24px",
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.4)",
            display: "flex",
            flexDirection: "column",
            gap: "16px",
            marginBottom: "36px"
          }}
        >
          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", alignItems: "center" }}>
            {/* Search Input Container */}
            <div style={{ position: "relative", flex: "1 1 300px", display: "flex", alignItems: "center" }}>
              <span style={{ position: "absolute", left: "14px", color: "#94a3b8", fontSize: "1.1rem" }}>🔍</span>
              <input
                type="text"
                placeholder="Search movies by title, genre, actor..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                style={{
                  width: "100%",
                  padding: "12px 40px 12px 42px",
                  background: "#0f172a",
                  border: "1px solid rgba(255, 255, 255, 0.12)",
                  borderRadius: "10px",
                  color: "#ffffff",
                  fontSize: "0.95rem"
                }}
              />
              {query && (
                <button
                  onClick={handleClearSearch}
                  style={{
                    position: "absolute",
                    right: "12px",
                    background: "none",
                    color: "#94a3b8",
                    fontSize: "0.9rem",
                    padding: "4px"
                  }}
                >
                  ✕
                </button>
              )}
            </div>

            {/* Language Filter */}
            <select
              value={language}
              onChange={(e) => {
                setLanguage(e.target.value);
                executeSearch(query, e.target.value, year);
              }}
              style={{
                padding: "12px 16px",
                background: "#0f172a",
                border: "1px solid rgba(255, 255, 255, 0.12)",
                borderRadius: "10px",
                color: "#ffffff",
                fontSize: "0.9rem",
                cursor: "pointer"
              }}
            >
              <option value="all">🌐 All Languages</option>
              <option value="hi">🇮🇳 Hindi</option>
              <option value="en">🇺🇸 English</option>
              <option value="te">🎬 Telugu</option>
              <option value="ta">🎬 Tamil</option>
              <option value="ko">🇰🇷 Korean</option>
              <option value="ja">🇯🇵 Japanese</option>
            </select>

            {/* Year Filter */}
            <select
              value={year}
              onChange={(e) => {
                setYear(e.target.value);
                executeSearch(query, language, e.target.value);
              }}
              style={{
                padding: "12px 16px",
                background: "#0f172a",
                border: "1px solid rgba(255, 255, 255, 0.12)",
                borderRadius: "10px",
                color: "#ffffff",
                fontSize: "0.9rem",
                cursor: "pointer"
              }}
            >
              <option value="all">📅 All Years</option>
              <option value="2025">2025</option>
              <option value="2024">2024</option>
              <option value="2023">2023</option>
              <option value="2022">2022</option>
              <option value="2021">2021</option>
              <option value="2020">2020</option>
            </select>

            {/* Search Button */}
            <button
              onClick={handleSearchClick}
              style={{
                padding: "12px 28px",
                background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
                color: "#ffffff",
                border: "none",
                borderRadius: "10px",
                fontWeight: 600,
                fontSize: "0.95rem",
                boxShadow: "0 4px 15px rgba(59, 130, 246, 0.3)"
              }}
            >
              Search
            </button>
          </div>

          {/* Recent Searches Tags */}
          {history.length > 0 && (
            <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap", paddingTop: "4px" }}>
              <span style={{ fontSize: "0.85rem", color: "#94a3b8", fontWeight: 500 }}>Recent Searches:</span>
              {history.map((tag, idx) => (
                <button
                  key={idx}
                  onClick={() => handleTagClick(tag)}
                  style={{
                    padding: "4px 12px",
                    background: query === tag ? "rgba(59, 130, 246, 0.25)" : "rgba(255, 255, 255, 0.06)",
                    border: query === tag ? "1px solid #3b82f6" : "1px solid rgba(255, 255, 255, 0.1)",
                    color: query === tag ? "#60a5fa" : "#cbd5e1",
                    borderRadius: "20px",
                    fontSize: "0.82rem",
                    fontWeight: 500,
                    transition: "all 0.2s ease"
                  }}
                >
                  {tag}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Search Results Section */}
        {results.length > 0 && (
          <section style={{ marginBottom: "48px" }} className="fade-in">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h2 style={{ fontSize: "1.6rem", fontWeight: 700, display: "flex", alignItems: "center", gap: "10px" }}>
                🎯 Search Results {query && <span style={{ color: "#3b82f6" }}>"{query}"</span>}
              </h2>
              <button
                onClick={handleClearSearch}
                style={{
                  background: "rgba(255, 255, 255, 0.08)",
                  color: "#cbd5e1",
                  padding: "6px 14px",
                  borderRadius: "8px",
                  fontSize: "0.85rem",
                  fontWeight: 500
                }}
              >
                Clear Results
              </button>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "24px" }}>
              {results.map((movie) => (
                <MovieCard
                  key={movie.id}
                  movie={movie}
                  onWatchlistToggle={handleWatchlistToggle}
                  isInWatchlist={watchlistIds.includes(movie.id)}
                />
              ))}
            </div>
          </section>
        )}

        {/* Trending Sections */}
        {!results.length && (
          <>
            {/* Quick Banner to Personalized For You */}
            <div style={{
              background: "linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(139, 92, 246, 0.15) 100%)",
              border: "1px solid rgba(59, 130, 246, 0.3)",
              borderRadius: "16px",
              padding: "20px 24px",
              marginBottom: "40px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "16px"
            }}>
              <div>
                <h3 style={{ fontSize: "1.2rem", fontWeight: 800, margin: 0, color: "#ffffff", display: "flex", alignItems: "center", gap: "8px" }}>
                  ✨ Looking for tailored recommendations?
                </h3>
                <p style={{ color: "#cbd5e1", fontSize: "0.9rem", margin: "4px 0 0 0" }}>
                  Explore personalized rows, mood filters, and natural language AI search built from your movie DNA.
                </p>
              </div>

              <a
                href="/for-you"
                style={{
                  padding: "10px 20px",
                  background: "linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)",
                  color: "#ffffff",
                  textDecoration: "none",
                  borderRadius: "10px",
                  fontWeight: 700,
                  fontSize: "0.9rem",
                  boxShadow: "0 4px 15px rgba(59, 130, 246, 0.4)"
                }}
              >
                Go to For You Hub ➔
              </a>
            </div>

            {/* Worldwide Trending */}
            <section style={{ marginBottom: "48px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px" }}>
                <h2 style={{ fontSize: "1.5rem", fontWeight: 700 }}>🌍 Trending Worldwide</h2>
                <span style={{ fontSize: "0.85rem", color: "#94a3b8" }}>Top movies this week</span>
              </div>
              <div style={{ display: "flex", gap: "20px", overflowX: "auto", paddingBottom: "16px", scrollbarWidth: "thin" }}>
                {world.map((movie) => (
                  <MovieCard
                    key={movie.id}
                    movie={movie}
                    onWatchlistToggle={handleWatchlistToggle}
                    isInWatchlist={watchlistIds.includes(movie.id)}
                  />
                ))}
              </div>
            </section>

            {/* Trending India */}
            <section style={{ marginBottom: "48px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px" }}>
                <h2 style={{ fontSize: "1.5rem", fontWeight: 700 }}>🇮🇳 Trending in India</h2>
                <span style={{ fontSize: "0.85rem", color: "#94a3b8" }}>Popular Indian releases</span>
              </div>
              <div style={{ display: "flex", gap: "20px", overflowX: "auto", paddingBottom: "16px", scrollbarWidth: "thin" }}>
                {india.map((movie) => (
                  <MovieCard
                    key={movie.id}
                    movie={movie}
                    onWatchlistToggle={handleWatchlistToggle}
                    isInWatchlist={watchlistIds.includes(movie.id)}
                  />
                ))}
              </div>
            </section>

            {/* Trending Hindi */}
            <section style={{ marginBottom: "48px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px" }}>
                <h2 style={{ fontSize: "1.5rem", fontWeight: 700 }}>🎬 Trending Hindi Cinema</h2>
                <span style={{ fontSize: "0.85rem", color: "#94a3b8" }}>Top Bollywood hits</span>
              </div>
              <div style={{ display: "flex", gap: "20px", overflowX: "auto", paddingBottom: "16px", scrollbarWidth: "thin" }}>
                {hindi.map((movie) => (
                  <MovieCard
                    key={movie.id}
                    movie={movie}
                    onWatchlistToggle={handleWatchlistToggle}
                    isInWatchlist={watchlistIds.includes(movie.id)}
                  />
                ))}
              </div>
            </section>
          </>
        )}
      </div>
    </div>
  );
}
