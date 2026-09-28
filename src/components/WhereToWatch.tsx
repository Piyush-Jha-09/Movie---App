import React, { useEffect, useState } from "react";
import { getMovieWatchProviders, LOGO_BASE_URL } from "../services/whereToWatch";
import type { MovieAvailabilityData } from "../types";

interface WhereToWatchProps {
  movieId: number;
}

export const WhereToWatch: React.FC<WhereToWatchProps> = ({ movieId }) => {
  const [data, setData] = useState<MovieAvailabilityData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProviders();
  }, [movieId]);

  const loadProviders = async () => {
    setLoading(true);
    const res = await getMovieWatchProviders(movieId, "IN");
    setData(res);
    setLoading(false);
  };

  if (loading) {
    return (
      <div style={{ color: "#94a3b8", fontSize: "0.9rem", padding: "10px 0" }}>
        Checking availability...
      </div>
    );
  }

  const hasStream = data?.flatrate && data.flatrate.length > 0;
  const hasRent = data?.rent && data.rent.length > 0;
  const hasBuy = data?.buy && data.buy.length > 0;

  if (!data || (!hasStream && !hasRent && !hasBuy)) {
    return (
      <div
        style={{
          background: "rgba(17, 24, 39, 0.6)",
          border: "1px dashed rgba(255, 255, 255, 0.12)",
          borderRadius: "12px",
          padding: "16px 20px",
          color: "#94a3b8",
          fontSize: "0.9rem",
          display: "flex",
          alignItems: "center",
          gap: "10px"
        }}
      >
        <span>📺</span>
        <span>Availability data for this title is currently unlisted or theatre-only in your region.</span>
      </div>
    );
  }

  return (
    <div
      style={{
        background: "rgba(17, 24, 39, 0.8)",
        border: "1px solid rgba(255, 255, 255, 0.1)",
        borderRadius: "16px",
        padding: "20px 24px",
        display: "flex",
        flexDirection: "column",
        gap: "16px"
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h3 style={{ fontSize: "1.1rem", fontWeight: 700, margin: 0, display: "flex", alignItems: "center", gap: "8px" }}>
          📺 Where to Watch
        </h3>
        {data.link && (
          <a
            href={data.link}
            target="_blank"
            rel="noopener noreferrer"
            style={{ fontSize: "0.82rem", color: "#3b82f6", textDecoration: "none", fontWeight: 600 }}
          >
            Powered by JustWatch ↗
          </a>
        )}
      </div>

      {/* Stream / Subscription */}
      {hasStream && (
        <div>
          <span style={{ fontSize: "0.82rem", color: "#94a3b8", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px" }}>
            Streaming Subscription
          </span>
          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", marginTop: "8px" }}>
            {data.flatrate!.map((provider) => (
              <div
                key={provider.provider_id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  background: "rgba(255, 255, 255, 0.06)",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  borderRadius: "10px",
                  padding: "6px 12px"
                }}
              >
                <img
                  src={`${LOGO_BASE_URL}${provider.logo_path}`}
                  alt={provider.provider_name}
                  style={{ width: "24px", height: "24px", borderRadius: "6px" }}
                />
                <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "#ffffff" }}>
                  {provider.provider_name}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Rent or Buy */}
      {(hasRent || hasBuy) && (() => {
        const combined = (data.rent || []).concat(data.buy || []);
        const uniqueRentBuy: typeof combined = [];
        const seenIds = new Set<string>();
        combined.forEach((item) => {
          const idStr = String(item.provider_id || item.provider_name);
          if (!seenIds.has(idStr)) {
            seenIds.add(idStr);
            uniqueRentBuy.push(item);
          }
        });
        return (
          <div>
            <span style={{ fontSize: "0.82rem", color: "#94a3b8", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px" }}>
              Rent or Purchase
            </span>
            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginTop: "8px" }}>
              {uniqueRentBuy.slice(0, 6).map((provider, idx) => (
                <div
                  key={`${provider.provider_id}-${idx}`}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    background: "rgba(255, 255, 255, 0.04)",
                    border: "1px solid rgba(255, 255, 255, 0.08)",
                    borderRadius: "10px",
                    padding: "6px 12px"
                  }}
                >
                  <img
                    src={`${LOGO_BASE_URL}${provider.logo_path}`}
                    alt={provider.provider_name}
                    style={{ width: "22px", height: "22px", borderRadius: "4px" }}
                  />
                  <span style={{ fontSize: "0.82rem", color: "#cbd5e1" }}>
                    {provider.provider_name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        );
      })()}
    </div>
  );
};
