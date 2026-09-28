import { useEffect, useState } from "react";
import {
  getPersonalizedRecommendations,
  getMoodRecommendations
} from "../services/recommendationEngine";
import type { ScoredMovie } from "../services/recommendationEngine";
import MovieCard from "../components/MovieCard";
import { MoodSelector } from "../components/MoodSelector";
import { NaturalLanguageSearch } from "../components/NaturalLanguageSearch";
import type { Movie, MoodConfig } from "../types";

export default function ForYou() {
  const [recommendations, setRecommendations] = useState<ScoredMovie[]>([]);
  const [selectedMood, setSelectedMood] = useState<MoodConfig | null>(null);
  const [moodRecommendations, setMoodRecommendations] = useState<ScoredMovie[]>([]);
  const [moodCache, setMoodCache] = useState<Record<string, ScoredMovie[]>>({});
  const [aiResults, setAiResults] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [moodLoading, setMoodLoading] = useState(false);

  useEffect(() => {
    loadPersonalizedData();
    window.addEventListener("cineverseUserDataChanged", loadPersonalizedData);
    return () => window.removeEventListener("cineverseUserDataChanged", loadPersonalizedData);
  }, []);

  useEffect(() => {
    if (selectedMood) {
      loadMoodData(selectedMood);
    } else {
      setMoodRecommendations([]);
    }
  }, [selectedMood]);

  const loadPersonalizedData = async () => {
    setLoading(true);
    try {
      const recs = await getPersonalizedRecommendations(24);
      setRecommendations(recs);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadMoodData = async (mood: MoodConfig) => {
    if (moodCache[mood.id]) {
      setMoodRecommendations(moodCache[mood.id]);
      return;
    }
    setMoodLoading(true);
    try {
      const recs = await getMoodRecommendations(mood, 18);
      setMoodCache((prev) => ({ ...prev, [mood.id]: recs }));
      setMoodRecommendations(recs);
    } catch (err) {
      console.error("Mood load error:", err);
      setMoodRecommendations([]);
    } finally {
      setMoodLoading(false);
    }
  };

  const displayedRecs = selectedMood ? moodRecommendations : recommendations;
  const isCurrentlyLoading = selectedMood ? moodLoading : loading;

  return (
    <div style={{ minHeight: "100vh", padding: "40px 5% 80px 5%", background: "#090d16", color: "#ffffff" }} className="fade-in">
      {/* Header */}
      <div style={{ marginBottom: "36px" }}>
        <div style={{
          display: "inline-flex",
          padding: "6px 14px",
          background: "linear-gradient(135deg, rgba(59, 130, 246, 0.2) 0%, rgba(139, 92, 246, 0.2) 100%)",
          border: "1px solid rgba(59, 130, 246, 0.4)",
          borderRadius: "20px",
          color: "#60a5fa",
          fontSize: "0.85rem",
          fontWeight: 700,
          marginBottom: "12px"
        }}>
          ✨ Tailored Recommendations
        </div>
        <h1 style={{ fontSize: "clamp(2rem, 3.5vw, 2.8rem)", fontWeight: 800, margin: 0 }}>
          Personalized For You
        </h1>
        <p style={{ color: "#cbd5e1", fontSize: "1rem", marginTop: "8px", maxWidth: "700px" }}>
          Curated movie picks generated dynamically using your taste DNA, likes, star ratings, and watch history signals.
        </p>
      </div>

      {/* Natural Language AI Search */}
      <div style={{ marginBottom: "40px" }}>
        <NaturalLanguageSearch
          onResults={(movies) => setAiResults(movies)}
          onClear={() => setAiResults([])}
        />
      </div>

      {/* AI Search Results Section */}
      {aiResults.length > 0 && (
        <section style={{ marginBottom: "48px" }} className="fade-in">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
            <h2 style={{ fontSize: "1.5rem", fontWeight: 700 }}>🤖 AI Smart Search Results</h2>
            <button
              onClick={() => setAiResults([])}
              style={{ padding: "6px 14px", background: "rgba(255,255,255,0.08)", color: "#cbd5e1", borderRadius: "8px" }}
            >
              Clear AI Results
            </button>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "24px" }}>
            {aiResults.map((movie) => (
              <MovieCard key={movie.id} movie={movie} />
            ))}
          </div>
        </section>
      )}

      {/* Mood Selector */}
      <div style={{ marginBottom: "40px" }}>
        <MoodSelector
          selectedMoodId={selectedMood ? selectedMood.id : null}
          onSelectMood={(mood) => setSelectedMood(mood)}
        />
      </div>

      {/* Recommended For You Grid */}
      <section style={{ marginBottom: "48px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px", marginBottom: "24px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
            <h2 style={{ fontSize: "1.6rem", fontWeight: 800, margin: 0 }}>
              {selectedMood ? `${selectedMood.emoji} ${selectedMood.name} Mood` : "🎯 Top Recommended For You"}
            </h2>
            <span style={{ fontSize: "0.85rem", color: "#94a3b8" }}>
              ({displayedRecs.length} curated picks)
            </span>
          </div>

          {selectedMood && (
            <span style={{
              fontSize: "0.78rem",
              background: "rgba(16, 185, 129, 0.15)",
              border: "1px solid rgba(16, 185, 129, 0.3)",
              color: "#34d399",
              padding: "4px 10px",
              borderRadius: "12px",
              fontWeight: 600
            }}>
              ✨ Fresh picks for today • Hard Filtered
            </span>
          )}
        </div>

        {isCurrentlyLoading ? (
          <div style={{ color: "#94a3b8", padding: "40px 0", textAlign: "center" }}>
            {selectedMood ? `Curating strict ${selectedMood.name} movies...` : "Computing personalized scores..."}
          </div>
        ) : displayedRecs.length === 0 ? (
          <div style={{ padding: "40px", background: "#111827", borderRadius: "16px", textAlign: "center", color: "#94a3b8" }}>
            We couldn't find enough matches for this mood right now. Try another mood.
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "24px" }}>
            {displayedRecs.map(({ movie, reasons }) => (
              <div key={movie.id} style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <MovieCard movie={movie} />
                {/* Recommendation Reason Tag */}
                {reasons.length > 0 && (
                  <div style={{
                    fontSize: "0.75rem",
                    color: "#93c5fd",
                    background: "rgba(59, 130, 246, 0.12)",
                    border: "1px solid rgba(59, 130, 246, 0.25)",
                    padding: "4px 8px",
                    borderRadius: "6px",
                    lineHeight: "1.3"
                  }}>
                    💡 {reasons[0]}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
