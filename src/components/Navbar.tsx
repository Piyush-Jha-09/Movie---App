import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";

interface NavbarProps {
  onOpenAssistant?: () => void;
  onOpenMovieNight?: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ onOpenAssistant, onOpenMovieNight }) => {
  const location = useLocation();
  const [watchlistCount, setWatchlistCount] = useState(0);

  const updateCount = () => {
    const saved = localStorage.getItem("watchlist");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setWatchlistCount(parsed.length);
      } catch {
        setWatchlistCount(0);
      }
    } else {
      setWatchlistCount(0);
    }
  };

  useEffect(() => {
    updateCount();
    window.addEventListener("watchlistUpdated", updateCount);
    window.addEventListener("storage", updateCount);
    return () => {
      window.removeEventListener("watchlistUpdated", updateCount);
      window.removeEventListener("storage", updateCount);
    };
  }, [location.pathname]);

  const isActive = (path: string) => location.pathname === path;

  return (
    <header style={{
      position: "sticky",
      top: 0,
      zIndex: 1000,
      backdropFilter: "blur(16px)",
      WebkitBackdropFilter: "blur(16px)",
      background: "rgba(9, 13, 22, 0.85)",
      borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
      padding: "0 4%",
      height: "72px",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center"
    }}>
      <Link to="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: "10px" }}>
        <div style={{
          width: "40px",
          height: "40px",
          borderRadius: "12px",
          background: "linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "1.3rem",
          boxShadow: "0 0 15px rgba(59, 130, 246, 0.4)"
        }}>
          🎬
        </div>
        <span style={{
          fontSize: "1.45rem",
          fontWeight: 800,
          letterSpacing: "-0.5px",
          background: "linear-gradient(135deg, #ffffff 30%, #94a3b8 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent"
        }}>
          CineVerse
        </span>
      </Link>

      <nav style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
        <Link
          to="/"
          style={{
            color: isActive("/") ? "#ffffff" : "#94a3b8",
            textDecoration: "none",
            fontWeight: isActive("/") ? 600 : 500,
            fontSize: "0.9rem",
            padding: "6px 12px",
            borderRadius: "8px",
            background: isActive("/") ? "rgba(255, 255, 255, 0.08)" : "transparent"
          }}
        >
          Home
        </Link>

        <Link
          to="/for-you"
          style={{
            color: isActive("/for-you") ? "#60a5fa" : "#94a3b8",
            textDecoration: "none",
            fontWeight: isActive("/for-you") ? 700 : 500,
            fontSize: "0.9rem",
            padding: "6px 12px",
            borderRadius: "8px",
            background: isActive("/for-you") ? "rgba(59, 130, 246, 0.15)" : "transparent",
            display: "flex",
            alignItems: "center",
            gap: "4px"
          }}
        >
          ✨ For You
        </Link>

        <Link
          to="/indian-cinema"
          style={{
            color: isActive("/indian-cinema") ? "#f87171" : "#94a3b8",
            textDecoration: "none",
            fontWeight: isActive("/indian-cinema") ? 700 : 500,
            fontSize: "0.9rem",
            padding: "6px 12px",
            borderRadius: "8px",
            background: isActive("/indian-cinema") ? "rgba(239, 68, 68, 0.15)" : "transparent"
          }}
        >
          🇮🇳 Indian Cinema
        </Link>

        <Link
          to="/watchlist"
          style={{
            color: isActive("/watchlist") ? "#ffffff" : "#94a3b8",
            textDecoration: "none",
            fontWeight: isActive("/watchlist") ? 600 : 500,
            fontSize: "0.9rem",
            padding: "6px 12px",
            borderRadius: "8px",
            background: isActive("/watchlist") ? "rgba(255, 255, 255, 0.08)" : "transparent",
            display: "flex",
            alignItems: "center",
            gap: "6px"
          }}
        >
          Watchlist
          {watchlistCount > 0 && (
            <span style={{
              background: "#3b82f6",
              color: "#ffffff",
              fontSize: "0.72rem",
              fontWeight: 700,
              padding: "2px 6px",
              borderRadius: "10px",
              minWidth: "18px",
              textAlign: "center"
            }}>
              {watchlistCount}
            </span>
          )}
        </Link>

        <Link
          to="/profile"
          style={{
            color: isActive("/profile") ? "#c084fc" : "#94a3b8",
            textDecoration: "none",
            fontWeight: isActive("/profile") ? 700 : 500,
            fontSize: "0.9rem",
            padding: "6px 12px",
            borderRadius: "8px",
            background: isActive("/profile") ? "rgba(139, 92, 246, 0.15)" : "transparent"
          }}
        >
          🧬 Taste DNA
        </Link>

        <Link
          to="/about"
          style={{
            color: isActive("/about") ? "#ffffff" : "#94a3b8",
            textDecoration: "none",
            fontWeight: isActive("/about") ? 600 : 500,
            fontSize: "0.9rem",
            padding: "6px 12px",
            borderRadius: "8px",
            background: isActive("/about") ? "rgba(255, 255, 255, 0.08)" : "transparent"
          }}
        >
          About
        </Link>

        {/* Modal Buttons */}
        {onOpenMovieNight && (
          <button
            onClick={onOpenMovieNight}
            style={{
              padding: "6px 12px",
              borderRadius: "8px",
              background: "rgba(59, 130, 246, 0.15)",
              border: "1px solid rgba(59, 130, 246, 0.3)",
              color: "#60a5fa",
              fontSize: "0.85rem",
              fontWeight: 600
            }}
          >
            🍿 Movie Night
          </button>
        )}

        {onOpenAssistant && (
          <button
            onClick={onOpenAssistant}
            style={{
              padding: "6px 12px",
              borderRadius: "8px",
              background: "linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)",
              color: "#ffffff",
              fontSize: "0.85rem",
              fontWeight: 600,
              boxShadow: "0 2px 10px rgba(139, 92, 246, 0.3)"
            }}
          >
            🤖 AI Assistant
          </button>
        )}
      </nav>
    </header>
  );
};

export default Navbar;

