"use client";

import { useEffect } from "react";
import { RefreshCw } from "lucide-react";

// global-error.tsx replaces the root layout entirely when the layout itself
// crashes — must include its own <html> and <body>.
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[Global Error]", error);
  }, [error]);

  return (
    <html lang="en" data-theme="dark">
      <body style={{
        margin: 0,
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#090B18",
        fontFamily: "'DM Sans', sans-serif",
        color: "#EDF0FF",
        padding: "2rem",
        textAlign: "center",
      }}>
        <div style={{ maxWidth: "420px", display: "flex", flexDirection: "column", alignItems: "center", gap: "1rem" }}>
          <p style={{ fontSize: "2.5rem", margin: 0 }}>⚠️</p>
          <h1 style={{ fontSize: "1.75rem", fontWeight: 700, margin: 0, letterSpacing: "-0.02em" }}>
            Critical error
          </h1>
          <p style={{ fontSize: "1rem", color: "#9098C0", lineHeight: 1.6, margin: 0 }}>
            The application encountered a critical error. Please try reloading.
          </p>
          {error.digest && (
            <p style={{ fontSize: "0.75rem", color: "#5A6080", fontFamily: "monospace" }}>
              ID: {error.digest}
            </p>
          )}
          <button
            onClick={reset}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              padding: "0.625rem 1.5rem",
              background: "#FEC73E",
              color: "#162161",
              border: "none",
              borderRadius: "9999px",
              fontSize: "0.875rem",
              fontWeight: 700,
              cursor: "pointer",
              marginTop: "0.5rem",
            }}
          >
            <RefreshCw size={14} />
            Reload
          </button>
        </div>
      </body>
    </html>
  );
}
