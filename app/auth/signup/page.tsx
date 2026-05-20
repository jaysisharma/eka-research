"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, Loader2, Check } from "lucide-react";
import styles from "./page.module.css";

const ACCOUNT_TYPES = [
  { value: "FREE_USER"  as const, label: "Member" },
  { value: "TEACHER"    as const, label: "Teacher" },
  { value: "RESEARCHER" as const, label: "Researcher" },
];

function SignupForm() {
  const router = useRouter();
  const params = useSearchParams();
  const callbackUrl = params.get("callbackUrl") ?? "/dashboard";

  const loginHref = callbackUrl !== "/dashboard"
    ? `/auth/login?callbackUrl=${encodeURIComponent(callbackUrl)}`
    : "/auth/login";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [accountType, setAccountType] = useState<"FREE_USER" | "TEACHER" | "RESEARCHER">("FREE_USER");
  const [fieldErrors, setFieldErrors] = useState<{ name?: string; email?: string; password?: string }>({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    setServerError("");
    const errs: any = {};
    if (!name.trim()) errs.name = "Full name is required";
    if (!email.includes("@")) errs.email = "Valid email is required";
    if (password.length < 8) errs.password = "Min. 8 characters";
    if (Object.keys(errs).length) { setFieldErrors(errs); return; }
    
    setLoading(true);
    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password, accountType }),
    });

    const data = await res.json();
    setLoading(false);
    if (!res.ok) { setServerError(data.error ?? "Registration failed."); return; }
    setSuccess(true);
    setTimeout(() => router.push(`/auth/verify?email=${encodeURIComponent(email)}`), 1200);
  }

  if (success) {
    return (
      <div className={styles.successBox}>
        <Check className={styles.successIcon} size={48} />
        <h2>Registration Successful</h2>
        <p>Please check your email to verify your account.</p>
      </div>
    );
  }

  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <Link href="/" className={styles.brand}>Eka Research</Link>
        <h1 className={styles.title}>Join Eka Research</h1>
        <p className={styles.subtitle}>Create an account to access research data and community tools.</p>
      </div>

      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.typeSelector}>
          {ACCOUNT_TYPES.map((type) => (
            <button
              key={type.value}
              type="button"
              className={`${styles.typeBtn} ${accountType === type.value ? styles.typeBtnActive : ""}`}
              onClick={() => setAccountType(type.value)}
            >
              {type.label}
            </button>
          ))}
        </div>

        <div className={styles.fieldGroup}>
          <div className={styles.field}>
            <label className={styles.label}>Full Name</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)}
              className={`${styles.input} ${fieldErrors.name ? styles.inputError : ""}`}
              placeholder="John Doe" />
            {fieldErrors.name && <span className={styles.errorText}>{fieldErrors.name}</span>}
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Email Address</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              className={`${styles.input} ${fieldErrors.email ? styles.inputError : ""}`}
              placeholder="name@email.com" />
            {fieldErrors.email && <span className={styles.errorText}>{fieldErrors.email}</span>}
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Password</label>
            <div className={styles.pwWrap}>
              <input type={showPwd ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)}
                className={`${styles.input} ${fieldErrors.password ? styles.inputError : ""}`}
                placeholder="••••••••" />
              <button type="button" className={styles.pwToggle} onClick={() => setShowPwd(!showPwd)}>
                {showPwd ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {fieldErrors.password && <span className={styles.errorText}>{fieldErrors.password}</span>}
          </div>
        </div>

        {serverError && <div className={styles.bannerError}>{serverError}</div>}

        <button type="submit" className={styles.submitBtn} disabled={loading}>
          {loading ? <Loader2 size={18} className={styles.spin} /> : "Create Account"}
        </button>

        <p className={styles.footerText}>
          Already have an account? <Link href={loginHref} className={styles.loginLink}>Sign in</Link>
        </p>
      </form>
    </div>
  );
}

export default function SignupPage() {
  return (
    <main className={styles.page}>
      <Suspense fallback={null}>
        <SignupForm />
      </Suspense>
    </main>
  );
}
