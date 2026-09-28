import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  getMovieDetails,
  getMovieVideos,
  getMovieCredits,
  getPosterUrl,
  getBackdropUrl,
  PROFILE_W185
} from "../movieAPI";
import MovieCard from "../components/MovieCard";
import { Toast } from "../components/Toast";
import { ReactionButtons } from "../components/ReactionButtons";
import { StarRating } from "../components/StarRating";
import { WhereToWatch } from "../components/WhereToWatch";
import {
  recordMovieWatch,
  isMovieWatched,
  toggleMovieWatched
} from "../services/preferenceStore";
import { getSeedMovieRecommendations } from "../services/recommendationEngine";
import type { Movie, MovieDetailsType, CastMember } from "../types";

export default function MovieDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [movie, setMovie] = useState<MovieDetailsType | null>(null);
  const [trailer, setTrailer] = useState("");
  const [cast, setCast] = useState<CastMember[]>([]);
  const [recommend, setRecommend] = useState<Movie[]>([]);
  const [isInWatchlist, setIsInWatchlist] = useState(false);
  const [isWatched, setIsWatched] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<"success" | "info" | "warning">("success");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadData();
      checkWatchlist();
      checkWatchedState();
      window.scrollTo(0, 0);
    }
  }, [id]);

  const checkWatchlist = () => {
    try {
      const saved = JSON.parse(localStorage.getItem("watchlist") || "[]");
      setIsInWatchlist(saved.some((m: Movie) => m.id === Number(id)));
    } catch {
      setIsInWatchlist(false);
    }
  };

  const checkWatchedState = () => {
    if (id) {
      setIsWatched(isMovieWatched(Number(id)));
    }
  };

  const showToast = (msg: string, type: "success" | "info" | "warning" = "success") => {
    setToastMessage(msg);
    setToastType(type);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleWatchlistToggle = () => {
    if (!movie) return;
    try {
      const existing: Movie[] = JSON.parse(localStorage.getItem("watchlist") || "[]");
      let updated: Movie[];

      if (isInWatchlist) {
        updated = existing.filter((m) => m.id !== movie.id);
        showToast(`Removed "${movie.title}" from Watchlist`, "warning");
      } else {
        updated = [...existing, movie];
        showToast(`Added "${movie.title}" to Watchlist!`, "success");
      }

      localStorage.setItem("watchlist", JSON.stringify(updated));
      setIsInWatchlist(!isInWatchlist);
      window.dispatchEvent(new Event("watchlistUpdated"));
    } catch (err) {
      console.error("Watchlist error:", err);
    }
  };

  const handleWatchedToggle = () => {
    if (!movie) return;
    const nextWatched = toggleMovieWatched(movie);
    setIsWatched(nextWatched);
    if (nextWatched) {
      showToast(`Marked "${movie.title}" as Watched!`, "success");
    } else {
      showToast(`Removed "${movie.title}" from Watched list`, "warning");
    }
  };

  const handleShare = async () => {
    if (!movie) return;
    const shareData = {
      title: movie.title,
      text: `Check out "${movie.title}" on CineVerse!`,
      url: window.location.href
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        showToast("Movie link copied!", "success");
      }
    } catch {
      try {
        await navigator.clipboard.writeText(window.location.href);
        showToast("Movie link copied!", "success");
      } catch {
        showToast("Failed to copy link", "warning");
      }
    }
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const detailRes = await getMovieDetails(Number(id));
      const movieData = detailRes.data;
      setMovie(movieData);

      // Track intentional detail view in user watch history
      recordMovieWatch(movieData);

      // Videos (Prioritize official trailers)
      const videosRes = await getMovieVideos(Number(id));
      const results = videosRes.data?.results || [];
      const officialTrailer = results.find(
        (v: any) => v.type === "Trailer" && v.site === "YouTube" && v.official
      );
      const fallbackTrailer = results.find(
        (v: any) => v.type === "Trailer" && v.site === "YouTube"
      );
      const anyVideo = results.find((v: any) => v.site === "YouTube");
      setTrailer(officialTrailer?.key || fallbackTrailer?.key || anyVideo?.key || "");

      // Credits (Cast)
      const creditsRes = await getMovieCredits(Number(id));
      setCast((creditsRes.data?.cast || []).slice(0, 10));

      // Weighted Multi-Signal Recommendations
      const recsScored = await getSeedMovieRecommendations(movieData);
      setRecommend(recsScored.map((r) => r.movie));
    } catch (err) {
      console.error("Failed to load details:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: "80vh", display: "flex", justifyContent: "center", alignItems: "center", color: "#ffffff" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "2rem", marginBottom: "12px" }}>🍿</div>
          <p style={{ color: "#94a3b8", fontWeight: 500 }}>Loading movie details...</p>
        </div>
      </div>
    );
  }

  if (!movie) {
    return (
      <div style={{ padding: "60px 5%", color: "#ffffff", textAlign: "center" }}>
        <h2>Movie Not Found</h2>
        <button onClick={() => navigate("/")} style={{ marginTop: "16px", padding: "10px 20px", background: "#3b82f6", color: "#fff", borderRadius: "8px" }}>
          Return Home
        </button>
      </div>
    );
  }

  const formatRuntime = (mins?: number) => {
    if (!mins) return "";
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return `${h}h ${m}m`;
  };

  const rating = movie.vote_average ? movie.vote_average.toFixed(1) : "N/A";
  const year = movie.release_date ? movie.release_date.split("-")[0] : "";

  return (
    <div style={{ minHeight: "100vh", background: "#090d16", color: "#ffffff", paddingBottom: "80px" }} className="fade-in">
      <Toast message={toastMessage} type={toastType} />

      {/* Hero Header with Backdrop */}
      <div style={{
        position: "relative",
        width: "100%",
        minHeight: "480px",
        backgroundImage: `url(${getBackdropUrl(movie.backdrop_path)})`,
        backgroundSize: "cover",
        backgroundPosition: "center 20%",
        display: "flex",
        alignItems: "flex-end"
      }}>
        {/* Gradient Overlay */}
        <div style={{
          position: "absolute",
          inset: 0,
          background: "linear-gradient(180deg, rgba(9, 13, 22, 0.4) 0%, rgba(9, 13, 22, 0.85) 70%, #090d16 100%), linear-gradient(90deg, #090d16 0%, rgba(9, 13, 22, 0.7) 40%, rgba(9, 13, 22, 0.2) 100%)"
        }} />

        {/* Hero Info */}
        <div style={{
          position: "relative",
          zIndex: 2,
          padding: "40px 5%",
          width: "100%",
          display: "flex",
          gap: "36px",
          flexWrap: "wrap",
          alignItems: "flex-end"
        }}>
          {/* Poster */}
          <img
            src={getPosterUrl(movie.poster_path)}
            alt={movie.title}
            style={{
              width: "240px",
              borderRadius: "16px",
              boxShadow: "0 12px 30px rgba(0,0,0,0.6)",
              border: "1px solid rgba(255,255,255,0.15)",
              flexShrink: 0
            }}
          />

          {/* Metadata */}
          <div style={{ flex: 1, minWidth: "280px", display: "flex", flexDirection: "column", gap: "16px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
              <span style={{
                background: "rgba(251, 191, 36, 0.15)",
                border: "1px solid rgba(251, 191, 36, 0.4)",
                color: "#fbbf24",
                fontWeight: 700,
                fontSize: "0.9rem",
                padding: "4px 10px",
                borderRadius: "8px"
              }}>
                ⭐ {rating} / 10 ({movie.vote_count || 0} votes)
              </span>

              {year && <span style={{ color: "#cbd5e1", fontSize: "0.95rem" }}>{year}</span>}
              {movie.runtime && <span style={{ color: "#cbd5e1", fontSize: "0.95rem" }}>• {formatRuntime(movie.runtime)}</span>}
            </div>

            <h1 style={{ fontSize: "clamp(2rem, 3.5vw, 3rem)", fontWeight: 800, lineHeight: 1.1 }}>
              {movie.title}
            </h1>

            {movie.tagline && (
              <p style={{ fontSize: "1.05rem", fontStyle: "italic", color: "#94a3b8" }}>
                "{movie.tagline}"
              </p>
            )}

            {/* Genres */}
            {movie.genres && (
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                {movie.genres.map((g) => (
                  <span
                    key={g.id}
                    style={{
                      background: "rgba(59, 130, 246, 0.15)",
                      border: "1px solid rgba(59, 130, 246, 0.3)",
                      color: "#60a5fa",
                      padding: "4px 12px",
                      borderRadius: "20px",
                      fontSize: "0.82rem",
                      fontWeight: 600
                    }}
                  >
                    {g.name}
                  </span>
                ))}
              </div>
            )}

            <p style={{ fontSize: "1rem", lineHeight: 1.6, color: "#cbd5e1", maxWidth: "800px" }}>
              {movie.overview}
            </p>

            {/* User Interaction Controls (Rating, Reaction, Watched, Watchlist & Share) */}
            <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", alignItems: "center", marginTop: "8px" }}>
              <StarRating movieId={movie.id} />
              <ReactionButtons movieId={movie.id} size="medium" />

              <button
                onClick={handleWatchedToggle}
                style={{
                  padding: "10px 18px",
                  borderRadius: "10px",
                  background: isWatched ? "rgba(16, 185, 129, 0.2)" : "rgba(255, 255, 255, 0.08)",
                  border: isWatched ? "1px solid #10b981" : "1px solid rgba(255, 255, 255, 0.15)",
                  color: isWatched ? "#34d399" : "#ffffff",
                  fontWeight: 600,
                  fontSize: "0.92rem",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px"
                }}
              >
                {isWatched ? "✅ Watched" : "👁️ Mark as Watched"}
              </button>

              <button
                onClick={handleWatchlistToggle}
                style={{
                  padding: "10px 18px",
                  borderRadius: "10px",
                  background: isInWatchlist ? "rgba(239, 68, 68, 0.2)" : "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
                  border: isInWatchlist ? "1px solid #ef4444" : "none",
                  color: isInWatchlist ? "#f87171" : "#ffffff",
                  fontWeight: 600,
                  fontSize: "0.92rem",
                  boxShadow: isInWatchlist ? "none" : "0 4px 15px rgba(59, 130, 246, 0.4)"
                }}
              >
                {isInWatchlist ? "🗑️ Remove Watchlist" : "📌 Add to Watchlist"}
              </button>

              <button
                onClick={handleShare}
                style={{
                  padding: "10px 18px",
                  borderRadius: "10px",
                  background: "rgba(255, 255, 255, 0.08)",
                  border: "1px solid rgba(255, 255, 255, 0.15)",
                  color: "#ffffff",
                  fontWeight: 600,
                  fontSize: "0.92rem",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px"
                }}
              >
                🔗 Share
              </button>
            </div>
          </div>
        </div>
      </div>

      <div style={{ padding: "0 5%", marginTop: "40px", display: "flex", flexDirection: "column", gap: "50px" }}>
        {/* Where to Watch Availability */}
        <WhereToWatch movieId={movie.id} />
        {/* Cast Section */}
        {cast.length > 0 && (
          <section>
            <h2 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "20px" }}>🎭 Key Cast</h2>
            <div style={{ display: "flex", gap: "16px", overflowX: "auto", paddingBottom: "12px" }}>
              {cast.map((actor) => (
                <div
                  key={actor.id}
                  style={{
                    width: "120px",
                    flexShrink: 0,
                    textAlign: "center",
                    background: "#111827",
                    borderRadius: "12px",
                    padding: "10px",
                    border: "1px solid rgba(255,255,255,0.06)"
                  }}
                >
                  <img
                    src={actor.profile_path ? `${PROFILE_W185}${actor.profile_path}` : "https://via.placeholder.com/100x100?text=Actor"}
                    alt={actor.name}
                    style={{ width: "80px", height: "80px", borderRadius: "50%", objectFit: "cover", margin: "0 auto 8px auto" }}
                  />
                  <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "#ffffff", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {actor.name}
                  </div>
                  <div style={{ fontSize: "0.75rem", color: "#94a3b8", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {actor.character}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Trailer Section */}
        {trailer && (
          <section>
            <h2 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "20px" }}>🎥 Official Trailer</h2>
            <div style={{
              position: "relative",
              width: "100%",
              maxWidth: "900px",
              paddingTop: "56.25%",
              borderRadius: "16px",
              overflow: "hidden",
              boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
              border: "1px solid rgba(255,255,255,0.1)"
            }}>
              <iframe
                style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", border: "none" }}
                src={`https://www.youtube-nocookie.com/embed/${trailer}`}
                title="Movie Trailer"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </section>
        )}

        {/* Recommended Movies */}
        {recommend.length > 0 && (
          <section>
            <h2 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "20px" }}>🍿 You Might Also Like</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "24px" }}>
              {recommend.map((recMovie) => (
                <MovieCard key={recMovie.id} movie={recMovie} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
