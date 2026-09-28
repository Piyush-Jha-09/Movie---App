export default function About() {
  const features = [
    { icon: "🔎", title: "Smart Movie Search", desc: "Instant title search with recent search memory tag history." },
    { icon: "🔥", title: "Live TMDB Trending", desc: "Real-time weekly trending data globally, in India, and Bollywood Hindi cinema." },
    { icon: "🎯", title: "Intelligent Recommendations", desc: "Hybrid movie recommendations combining genre similarity and TMDB metrics." },
    { icon: "📌", title: "Personal Watchlist", desc: "Persistent local watchlist storage with one-click saved status sync across tabs." },
    { icon: "🎥", title: "Trailer Integration", desc: "Direct YouTube official trailer playback embedded in details view." },
    { icon: "🌐", title: "Multi-Language & Year Filter", desc: "Filter discoveries by Hindi, English, Korean, Japanese, Telugu, and release year." }
  ];

  const techStack = ["React 19", "TypeScript", "Vite", "Axios", "TMDB REST API", "React Router v7"];

  return (
    <div style={{ minHeight: "100vh", padding: "40px 5% 80px 5%", background: "#090d16", color: "#ffffff" }} className="fade-in">
      <div style={{ maxWidth: "900px", margin: "0 auto" }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "48px" }}>
          <div style={{
            display: "inline-flex",
            padding: "8px 16px",
            background: "rgba(59, 130, 246, 0.15)",
            border: "1px solid rgba(59, 130, 246, 0.3)",
            borderRadius: "20px",
            color: "#60a5fa",
            fontSize: "0.85rem",
            fontWeight: 700,
            marginBottom: "16px"
          }}>
            🎬 About CineVerse
          </div>

          <h1 style={{ fontSize: "clamp(2rem, 3.5vw, 2.8rem)", fontWeight: 800, marginBottom: "16px" }}>
            Smart Cinema Discovery Platform
          </h1>

          <p style={{ fontSize: "1.05rem", color: "#cbd5e1", lineHeight: 1.6, maxWidth: "700px", margin: "0 auto" }}>
            CineVerse is a modern, high-performance movie web application engineered to offer movie enthusiasts effortless discovery, rich recommendations, and instant trailers.
          </p>
        </div>

        {/* Feature Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "20px", marginBottom: "48px" }}>
          {features.map((f, i) => (
            <div
              key={i}
              style={{
                background: "#111827",
                border: "1px solid rgba(255, 255, 255, 0.08)",
                borderRadius: "16px",
                padding: "24px",
                display: "flex",
                flexDirection: "column",
                gap: "10px"
              }}
            >
              <div style={{ fontSize: "2rem" }}>{f.icon}</div>
              <h3 style={{ fontSize: "1.1rem", fontWeight: 700, margin: 0 }}>{f.title}</h3>
              <p style={{ fontSize: "0.9rem", color: "#94a3b8", lineHeight: 1.5, margin: 0 }}>{f.desc}</p>
            </div>
          ))}
        </div>

        {/* Tech Stack Card */}
        <div style={{
          background: "linear-gradient(135deg, rgba(17, 24, 39, 0.8) 0%, rgba(31, 41, 61, 0.8) 100%)",
          border: "1px solid rgba(255, 255, 255, 0.12)",
          borderRadius: "20px",
          padding: "32px",
          textAlign: "center"
        }}>
          <h3 style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: "16px" }}>🛠️ Built With Modern Web Technologies</h3>
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", justifyContent: "center" }}>
            {techStack.map((tech, idx) => (
              <span
                key={idx}
                style={{
                  background: "rgba(255, 255, 255, 0.08)",
                  border: "1px solid rgba(255, 255, 255, 0.15)",
                  color: "#cbd5e1",
                  padding: "6px 16px",
                  borderRadius: "20px",
                  fontSize: "0.88rem",
                  fontWeight: 600
                }}
              >
                {tech}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
