import React, { useState } from "react";
import { processNaturalLanguageSearch } from "../services/naturalLanguageSearch";
import { getPersonalizedRecommendations } from "../services/recommendationEngine";
import MovieCard from "./MovieCard";
import type { Movie } from "../types";

interface Message {
  id: string;
  sender: "user" | "assistant";
  text: string;
  movies?: Movie[];
}

interface MovieAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MovieAssistantModal: React.FC<MovieAssistantModalProps> = ({
  isOpen,
  onClose
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      sender: "assistant",
      text: "👋 Hi! I'm CineVerse AI Assistant. How can I help you find the perfect movie today? You can ask me e.g., 'Suggest a mind-bending sci-fi under 2 hours' or 'I have 90 minutes and want something hilarious'."
    }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSend = async (textToSend: string) => {
    if (!textToSend.trim()) return;

    const userMsg: Message = { id: String(Date.now()), sender: "user", text: textToSend };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      if (textToSend.toLowerCase().includes("recommend for me") || textToSend.toLowerCase().includes("top picks")) {
        const recs = await getPersonalizedRecommendations(6);
        const movies = recs.map((r) => r.movie);
        const botMsg: Message = {
          id: String(Date.now() + 1),
          sender: "assistant",
          text: `Based on your CineVerse DNA taste profile, here are 6 top recommendations curated for you:`,
          movies
        };
        setMessages((prev) => [...prev, botMsg]);
      } else {
        const { movies, intent } = await processNaturalLanguageSearch(textToSend);
        let replyText = `I found ${movies.length} movies matching your request!`;
        if (intent.detectedTags.length > 0) {
          replyText += ` (Filtered by: ${intent.detectedTags.join(", ")})`;
        }
        const botMsg: Message = {
          id: String(Date.now() + 1),
          sender: "assistant",
          text: movies.length > 0 ? replyText : "I couldn't find exact matches for that query, but try searching for a specific genre or actor!",
          movies: movies.slice(0, 6)
        };
        setMessages((prev) => [...prev, botMsg]);
      }
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        { id: String(Date.now() + 1), sender: "assistant", text: "Sorry, I encountered an issue fetching recommendations. Please try again!" }
      ]);
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
        background: "rgba(0, 0, 0, 0.75)",
        backdropFilter: "blur(8px)",
        display: "flex",
        justifyContent: "flex-end"
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "520px",
          height: "100%",
          background: "#0d1322",
          borderLeft: "1px solid rgba(255, 255, 255, 0.12)",
          display: "flex",
          flexDirection: "column",
          boxShadow: "-10px 0 40px rgba(0,0,0,0.8)"
        }}
        className="fade-in"
      >
        {/* Modal Header */}
        <div style={{
          padding: "20px 24px",
          borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          background: "rgba(17, 24, 39, 0.8)"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{
              width: "38px",
              height: "38px",
              borderRadius: "10px",
              background: "linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "1.2rem"
            }}>
              🤖
            </div>
            <div>
              <h3 style={{ fontSize: "1.1rem", fontWeight: 700, margin: 0, color: "#ffffff" }}>
                AI Movie Assistant
              </h3>
              <span style={{ fontSize: "0.75rem", color: "#34d399", fontWeight: 600 }}>
                ● Active & Ready
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{ background: "none", color: "#94a3b8", fontSize: "1.2rem", padding: "4px" }}
          >
            ✕
          </button>
        </div>

        {/* Chat History */}
        <div style={{ flex: 1, padding: "20px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "16px" }}>
          {messages.map((msg) => (
            <div
              key={msg.id}
              style={{
                alignSelf: msg.sender === "user" ? "flex-end" : "flex-start",
                maxWidth: "85%",
                display: "flex",
                flexDirection: "column",
                gap: "10px"
              }}
            >
              <div
                style={{
                  padding: "12px 16px",
                  borderRadius: msg.sender === "user" ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                  background: msg.sender === "user" ? "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)" : "rgba(31, 41, 61, 0.8)",
                  color: "#ffffff",
                  fontSize: "0.92rem",
                  lineHeight: 1.5,
                  border: msg.sender === "user" ? "none" : "1px solid rgba(255, 255, 255, 0.08)"
                }}
              >
                {msg.text}
              </div>

              {/* Render Movies if attached */}
              {msg.movies && msg.movies.length > 0 && (
                <div style={{ display: "flex", gap: "12px", overflowX: "auto", paddingBottom: "8px", width: "100%" }}>
                  {msg.movies.map((movie) => (
                    <div key={movie.id} style={{ transform: "scale(0.85)", transformOrigin: "top left" }}>
                      <MovieCard movie={movie} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div style={{ alignSelf: "flex-start", color: "#94a3b8", fontSize: "0.85rem", fontStyle: "italic" }}>
              AI Assistant is thinking...
            </div>
          )}
        </div>

        {/* Quick Prompts */}
        <div style={{ padding: "0 20px 10px 20px", display: "flex", gap: "8px", overflowX: "auto" }}>
          <button
            onClick={() => handleSend("Recommend for me based on my taste")}
            style={{
              padding: "6px 12px",
              background: "rgba(255, 255, 255, 0.06)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              borderRadius: "14px",
              color: "#cbd5e1",
              fontSize: "0.78rem",
              whiteSpace: "nowrap"
            }}
          >
            ✨ Recommend For Me
          </button>
          <button
            onClick={() => handleSend("I have 90 minutes and want something exciting")}
            style={{
              padding: "6px 12px",
              background: "rgba(255, 255, 255, 0.06)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              borderRadius: "14px",
              color: "#cbd5e1",
              fontSize: "0.78rem",
              whiteSpace: "nowrap"
            }}
          >
            ⏱️ 90 Min Exciting Movie
          </button>
        </div>

        {/* Chat Input */}
        <div style={{ padding: "16px 20px", borderTop: "1px solid rgba(255, 255, 255, 0.08)", background: "#090d16" }}>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend(input);
            }}
            style={{ display: "flex", gap: "10px" }}
          >
            <input
              type="text"
              placeholder="Ask anything about movies..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              style={{
                flex: 1,
                padding: "12px 16px",
                background: "#111827",
                border: "1px solid rgba(255, 255, 255, 0.12)",
                borderRadius: "10px",
                color: "#ffffff",
                fontSize: "0.9rem"
              }}
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              style={{
                padding: "12px 20px",
                background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
                color: "#ffffff",
                borderRadius: "10px",
                fontWeight: 600,
                fontSize: "0.9rem"
              }}
            >
              Send
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
