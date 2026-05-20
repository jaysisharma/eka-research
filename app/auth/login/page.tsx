"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn, getSession } from "next-auth/react";
import { Eye, EyeOff, Loader2, CheckCircle2 } from "lucide-react";
import styles from "./page.module.css";

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const callbackUrl = params.get("callbackUrl") ?? "/dashboard";
  const verified = params.get("verified") === "1";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);

  const signupHref = callbackUrl !== "/dashboard"
    ? `/auth/signup?callbackUrl=${encodeURIComponent(callbackUrl)}`
    : "/auth/signup";

  function validate() {
    const e: { email?: string; password?: string } = {};
    if (!email.trim()) e.email = "Email address is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = "Please enter a valid email.";
    if (!password) e.password = "Password is required.";
    return e;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setServerError("");
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setLoading(true);

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setServerError("Invalid email or password.");
      return;
    }

    const session = await getSession();
    const dest = session?.user?.role === "ADMIN" ? "/admin/dashboard" : callbackUrl;
    router.push(dest);
    router.refresh();
  }

  function clearError(field: "email" | "password") {
    setErrors((prev) => { const next = { ...prev }; delete next[field]; return next; });
  }

  return (
    <div className={styles.card}>
      {verified && (
        <div className={styles.verifiedBanner}>
          <CheckCircle2 size={16} />
          Email verified — please sign in.
        </div>
      )}

      <div className={styles.cardHeader}>
        <Link href="/" className={styles.brand}>Eka Research</Link>
        <h1 className={styles.title}>Welcome Back</h1>
        <p className={styles.subtitle}>Sign in to your research account.</p>
      </div>

      <form onSubmit={handleSubmit} className={styles.form} noValidate>
        <div className={styles.fieldGroup}>
          <div className={styles.field}>
            <label htmlFor="email" className={styles.label}>Email Address</label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); clearError("email"); }}
              className={`${styles.input} ${errors.email ? styles.inputError : ""}`}
              placeholder="name@email.com"
            />
            {errors.email && <span className={styles.errorText}>{errors.email}</span>}
          </div>

          <div className={styles.field}>
            <div className={styles.labelRow}>
              <label htmlFor="password" className={styles.label}>Password</label>
              <Link href="/auth/forgot-password" className={styles.forgotLink}>Forgot password?</Link>
            </div>
            <div className={styles.pwWrap}>
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
                className={styles.pwToggle}
                onClick={() => setShowPwd((v) => !v)}
              >
                {showPwd ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.password && <span className={styles.errorText}>{errors.password}</span>}
          </div>
        </div>

        {serverError && <div className={styles.bannerError}>{serverError}</div>}

        <button type="submit" className={styles.submitBtn} disabled={loading}>
          {loading ? <Loader2 size={18} className={styles.spin} /> : "Sign In"}
        </button>

        <p className={styles.footerText}>
          Don&apos;t have an account? <Link href={signupHref} className={styles.signupLink}>Create one</Link>
        </p>
      </form>
    </div>
  );
}

export default function LoginPage() {
  return (
    <main className={styles.page}>
      <Suspense fallback={null}>
        <LoginForm />
      </Suspense>
    </main>
  );
}
