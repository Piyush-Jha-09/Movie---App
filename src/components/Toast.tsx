import React from "react";

interface ToastProps {
  message: string | null;
  type?: "success" | "info" | "warning";
  onClose?: () => void;
}

export const Toast: React.FC<ToastProps> = ({ message, type = "success" }) => {
  if (!message) return null;

  const getBg = () => {
    switch (type) {
      case "success": return "linear-gradient(135deg, #10b981 0%, #059669 100%)";
      case "warning": return "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)";
      default: return "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)";
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        bottom: "30px",
        right: "30px",
        zIndex: 9999,
        background: getBg(),
        color: "#ffffff",
        padding: "14px 24px",
        borderRadius: "12px",
        boxShadow: "0 10px 25px rgba(0, 0, 0, 0.4)",
        fontWeight: 600,
        fontSize: "0.95rem",
        display: "flex",
        alignItems: "center",
        gap: "10px",
        animation: "fadeIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)"
      }}
    >
      <span>{type === "success" ? "✨" : type === "warning" ? "📌" : "ℹ️"}</span>
      <span>{message}</span>
    </div>
  );
};
