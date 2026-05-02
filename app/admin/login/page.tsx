"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn, getSession, signOut } from "next-auth/react";
import { Eye, EyeOff, ArrowRight, Loader2, ShieldCheck } from "lucide-react";
import styles from "./page.module.css";

function AdminLoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const callbackUrl = params.get("callbackUrl") ?? "/admin";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);

  function validate() {
    const e: { email?: string; password?: string } = {};
    if (!email.trim()) e.email = "Email address is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = "Please enter a valid email address.";
    if (!password) e.password = "Password is required.";
    return e;
  }

  function clearError(field: "email" | "password") {
    setErrors((prev) => { const next = { ...prev }; delete next[field]; return next; });
  }

  async function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    setServerError("");
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setLoading(true);

    const result = await signIn("credentials", { email, password, redirect: false });

    if (result?.error) {
      setServerError("Incorrect email or password.");
      setLoading(false);
      return;
    }

    const session = await getSession();

    if (session?.user?.role !== "ADMIN") {
      await signOut({ redirect: false });
      setServerError("This account does not have admin access.");
      setLoading(false);
      return;
    }

    router.push(callbackUrl);
    router.refresh();
  }

  return (
    <div className={styles.card}>
      <div className={styles.cardGlow} aria-hidden="true" />

      <div className={styles.header}>
        <div className={styles.iconWrap}>
          <ShieldCheck size={22} strokeWidth={1.75} />
        </div>
        <div>
          <h1 className={styles.heading}>Admin access</h1>
          <p className={styles.sub}>Restricted to authorised personnel only.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className={styles.form} noValidate>
        <div className={styles.field}>
          <label htmlFor="email" className={styles.label}>Email address</label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => { setEmail(e.target.value); clearError("email"); }}
            className={`${styles.input} ${errors.email ? styles.inputError : ""}`}
            placeholder="admin@ekaresearch.org"
          />
          {errors.email && <span className={styles.fieldError} role="alert">{errors.email}</span>}
        </div>

        <div className={styles.field}>
          <label htmlFor="password" className={styles.label}>Password</label>
          <div className={styles.inputWrap}>
            <input
              id="password"
              type={showPwd ? "text" : "password"}
              autoComplete="current-password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); clearError("password"); }}
              className={`${styles.input} ${errors.password ? styles.inputError : ""}`}
              placeholder="••••••••"
            />
            <button
              type="button"
              className={styles.eyeBtn}
              onClick={() => setShowPwd((v) => !v)}
              aria-label={showPwd ? "Hide password" : "Show password"}
            >
              {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
          {errors.password && <span className={styles.fieldError} role="alert">{errors.password}</span>}
        </div>

        {serverError && (
          <p className={styles.errorBanner} role="alert">{serverError}</p>
        )}

        <button type="submit" className={styles.submitBtn} disabled={loading}>
          {loading
            ? <Loader2 size={15} className={styles.spinner} />
            : <>Sign in <ArrowRight size={14} /></>}
        </button>
      </form>

      <p className={styles.footer}>
        Not an admin?{" "}
        <Link href="/auth/login" className={styles.footerLink}>Member login →</Link>
      </p>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <div className={styles.page}>
      <div className={styles.bg} aria-hidden="true" />

      <Link href="/" className={styles.logo}>
        Eka <span className={styles.logoAccent}>Research</span>
      </Link>

      <Suspense fallback={<div className={styles.card} />}>
        <AdminLoginForm />
      </Suspense>
    </div>
  );
}
