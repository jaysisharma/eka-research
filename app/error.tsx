"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log to console in dev; swap for Sentry / LogRocket in production
    console.error("[Page Error]", error);
  }, [error]);

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "2rem",
      background: "var(--bg-base)",
      fontFamily: "var(--font-body)",
    }}>
      <div style={{
        maxWidth: "480px",
        width: "100%",
        textAlign: "center",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "1.25rem",
      }}>
        {/* Icon */}
        <div style={{
          width: "56px",
          height: "56px",
          borderRadius: "50%",
          background: "color-mix(in srgb, var(--color-error) 12%, transparent)",
          border: "1px solid color-mix(in srgb, var(--color-error) 25%, transparent)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "var(--color-error)",
        }}>
          <AlertTriangle size={24} strokeWidth={1.75} />
        </div>

        {/* Heading */}
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          <h1 style={{
            fontFamily: "var(--font-heading)",
            fontSize: "clamp(1.5rem, 3vw, 2rem)",
            fontWeight: 700,
            letterSpacing: "-0.02em",
            color: "var(--text-primary)",
            margin: 0,
          }}>
            Something went wrong
          </h1>
          <p style={{
            fontSize: "var(--text-base)",
            color: "var(--text-secondary)",
            lineHeight: 1.6,
            margin: 0,
          }}>
            An unexpected error occurred on this page. You can try again or return home.
          </p>
        </div>

        {/* Error digest for support */}
        {error.digest && (
          <p style={{
            fontSize: "var(--text-xs)",
            color: "var(--text-muted)",
            fontFamily: "monospace",
            background: "var(--bg-subtle)",
            border: "1px solid var(--border-default)",
            borderRadius: "var(--radius-md)",
            padding: "0.25rem 0.75rem",
            margin: 0,
          }}>
            Error ID: {error.digest}
          </p>
        )}

        {/* Actions */}
        <div style={{
          display: "flex",
          gap: "0.75rem",
          flexWrap: "wrap",
          justifyContent: "center",
          paddingTop: "0.25rem",
        }}>
          <button
            onClick={reset}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              padding: "0.625rem 1.25rem",
              background: "var(--color-brand-gold)",
              color: "var(--color-brand-navy)",
              border: "none",
              borderRadius: "9999px",
              fontSize: "var(--text-sm)",
              fontWeight: 600,
              fontFamily: "var(--font-body)",
              cursor: "pointer",
            }}
          >
            <RefreshCw size={14} strokeWidth={2} />
            Try again
          </button>
          <Link
            href="/"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              padding: "0.625rem 1.25rem",
              background: "transparent",
              color: "var(--text-secondary)",
              border: "1px solid var(--border-default)",
              borderRadius: "9999px",
              fontSize: "var(--text-sm)",
              fontWeight: 500,
              fontFamily: "var(--font-body)",
              textDecoration: "none",
            }}
          >
            <Home size={14} strokeWidth={2} />
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}
