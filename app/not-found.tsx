import Link from "next/link";
import { ArrowRight, Telescope } from "lucide-react";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Page not found",
  description: "The page you're looking for doesn't exist.",
  path: "/404",
});

export default function NotFound() {
  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "2rem",
      background: "var(--bg-base)",
      fontFamily: "var(--font-body)",
      textAlign: "center",
    }}>
      <div style={{
        maxWidth: "480px",
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
          background: "rgba(254, 199, 62, 0.1)",
          border: "1px solid rgba(254, 199, 62, 0.2)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "var(--color-brand-gold)",
        }}>
          <Telescope size={24} strokeWidth={1.75} />
        </div>

        {/* 404 */}
        <p style={{
          fontFamily: "var(--font-heading)",
          fontSize: "clamp(4rem, 10vw, 6rem)",
          fontWeight: 700,
          letterSpacing: "-0.04em",
          color: "var(--border-strong)",
          lineHeight: 1,
          margin: 0,
        }}>
          404
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          <h1 style={{
            fontFamily: "var(--font-heading)",
            fontSize: "clamp(1.25rem, 3vw, 1.75rem)",
            fontWeight: 700,
            letterSpacing: "-0.02em",
            color: "var(--text-primary)",
            margin: 0,
          }}>
            This page doesn&apos;t exist
          </h1>
          <p style={{
            fontSize: "var(--text-base)",
            color: "var(--text-secondary)",
            lineHeight: 1.6,
            margin: 0,
          }}>
            The page you&apos;re looking for may have moved or never existed. Let&apos;s get you back on track.
          </p>
        </div>

        <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", justifyContent: "center" }}>
          <Link
            href="/"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              padding: "0.625rem 1.5rem",
              background: "var(--color-brand-gold)",
              color: "var(--color-brand-navy)",
              borderRadius: "9999px",
              fontSize: "var(--text-sm)",
              fontWeight: 700,
              textDecoration: "none",
            }}
          >
            Go home <ArrowRight size={14} />
          </Link>
          <Link
            href="/research"
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
              textDecoration: "none",
            }}
          >
            View research
          </Link>
        </div>
      </div>
    </div>
  );
}
