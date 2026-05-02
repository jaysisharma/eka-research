"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, ArrowRight, Loader2, Check } from "lucide-react";
import styles from "./page.module.css";

function ResetForm() {
  const router = useRouter();
  const params = useSearchParams();
  const token = params.get("token") ?? "";
  const email = params.get("email") ?? "";

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const checks = {
    length:    password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    number:    /[0-9]/.test(password),
    special:   /[^A-Za-z0-9]/.test(password),
  };

  if (!token || !email) {
    return (
      <div className={styles.card}>
        <div className={styles.cardGlow} aria-hidden="true" />
        <h1 className={styles.heading}>Invalid link</h1>
        <p className={styles.sub}>This reset link is missing required information.</p>
        <Link href="/auth/forgot-password" className={styles.submitBtn} style={{ textDecoration: "none", textAlign: "center" }}>
          Request a new link
        </Link>
      </div>
    );
  }

  async function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    if (!Object.values(checks).every(Boolean)) {
      setError("Password does not meet all requirements.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    const res = await fetch("/api/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, token, password }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error ?? "Something went wrong. Please try again.");
      return;
    }
    setSuccess(true);
    setTimeout(() => router.push("/auth/login"), 2000);
  }

  if (success) {
    return (
      <div className={styles.card}>
        <div className={styles.cardGlow} aria-hidden="true" />
        <div className={styles.successWrap}>
          <span className={styles.successIcon}><Check size={26} strokeWidth={2.5} /></span>
          <h1 className={styles.heading}>Password updated</h1>
          <p className={styles.sub}>Taking you to sign in…</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.card}>
      <div className={styles.cardGlow} aria-hidden="true" />

      <div className={styles.header}>
        <h1 className={styles.heading}>Set a new password</h1>
        <p className={styles.sub}>Choose a strong password for your account.</p>
      </div>

      <form onSubmit={handleSubmit} className={styles.form} noValidate>
        <div className={styles.field}>
          <label htmlFor="password" className={styles.label}>New password</label>
          <div className={styles.inputWrap}>
            <input
              id="password"
              type={showPwd ? "text" : "password"}
              autoComplete="new-password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(""); }}
              className={styles.input}
              placeholder="Min. 8 characters"
            />
            <button type="button" className={styles.eyeBtn}
              onClick={() => setShowPwd((v) => !v)}
              aria-label={showPwd ? "Hide password" : "Show password"}>
              {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>

          {password.length > 0 && (
            <ul className={styles.pwdHints}>
              <li className={checks.length    ? styles.hintOk : styles.hintFail}>At least 8 characters</li>
              <li className={checks.uppercase ? styles.hintOk : styles.hintFail}>One uppercase letter</li>
              <li className={checks.number    ? styles.hintOk : styles.hintFail}>One number</li>
              <li className={checks.special   ? styles.hintOk : styles.hintFail}>One special character</li>
            </ul>
          )}
        </div>

        <div className={styles.field}>
          <label htmlFor="confirm" className={styles.label}>Confirm password</label>
          <input
            id="confirm"
            type={showPwd ? "text" : "password"}
            autoComplete="new-password"
            value={confirm}
            onChange={(e) => { setConfirm(e.target.value); setError(""); }}
            className={`${styles.input} ${confirm && confirm !== password ? styles.inputError : ""}`}
            placeholder="Repeat password"
          />
          {confirm && confirm !== password && (
            <span className={styles.fieldError} role="alert">Passwords do not match.</span>
          )}
        </div>

        {error && <p className={styles.errorBanner} role="alert">{error}</p>}

        <button type="submit" className={styles.submitBtn} disabled={loading}>
          {loading
            ? <Loader2 size={15} className={styles.spinner} />
            : <>Update password <ArrowRight size={14} /></>}
        </button>
      </form>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className={styles.page}>
      <div className={styles.bg} aria-hidden="true" />
      <Link href="/" className={styles.logo}>
        Eka <span className={styles.logoAccent}>Research</span>
      </Link>
      <Suspense fallback={<div className={styles.card} />}>
        <ResetForm />
      </Suspense>
    </div>
  );
}
