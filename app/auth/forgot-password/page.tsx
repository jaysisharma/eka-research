"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Loader2, MailCheck } from "lucide-react";
import styles from "./page.module.css";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }
    setLoading(true);
    const res = await fetch("/api/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error ?? "Something went wrong. Please try again.");
      return;
    }
    setSent(true);
  }

  return (
    <div className={styles.page}>
      <div className={styles.bg} aria-hidden="true" />
      <Link href="/" className={styles.logo}>
        Eka <span className={styles.logoAccent}>Research</span>
      </Link>

      <div className={styles.card}>
        <div className={styles.cardGlow} aria-hidden="true" />

        {sent ? (
          <div className={styles.sentWrap}>
            <div className={styles.iconWrap}>
              <MailCheck size={26} strokeWidth={1.75} />
            </div>
            <h1 className={styles.heading}>Check your inbox</h1>
            <p className={styles.sub}>
              If an account exists for <strong className={styles.emailHighlight}>{email}</strong>,
              we&apos;ve sent a reset link. Check your spam folder too.
            </p>
            <Link href="/auth/login" className={styles.backLink}>
              ← Back to sign in
            </Link>
          </div>
        ) : (
          <>
            <div className={styles.header}>
              <h1 className={styles.heading}>Forgot your password?</h1>
              <p className={styles.sub}>
                Enter your email and we&apos;ll send you a reset link.
              </p>
            </div>

            <form onSubmit={handleSubmit} className={styles.form} noValidate>
              <div className={styles.field}>
                <label htmlFor="email" className={styles.label}>Email address</label>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError(""); }}
                  className={`${styles.input} ${error ? styles.inputError : ""}`}
                  placeholder="you@example.com"
                />
                {error && <span className={styles.fieldError} role="alert">{error}</span>}
              </div>

              <button type="submit" className={styles.submitBtn} disabled={loading}>
                {loading
                  ? <Loader2 size={15} className={styles.spinner} />
                  : <>Send reset link <ArrowRight size={14} /></>}
              </button>
            </form>

            <p className={styles.footer}>
              Remembered it?{" "}
              <Link href="/auth/login" className={styles.footerLink}>Sign in</Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
