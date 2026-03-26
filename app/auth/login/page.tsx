"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn, getSession } from "next-auth/react";
import { Eye, EyeOff, ArrowRight, Loader2, Telescope, Star, Globe } from "lucide-react";
import styles from "./page.module.css";

const PERKS = [
  { icon: Telescope, text: "Access to meteor observation data & archives" },
  { icon: Star,      text: "Members-only research papers & datasets" },
  { icon: Globe,     text: "Join Nepal's growing space science community" },
];

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const callbackUrl = params.get("callbackUrl") ?? "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const signupHref = callbackUrl !== "/dashboard"
    ? `/auth/signup?callbackUrl=${encodeURIComponent(callbackUrl)}`
    : "/auth/signup";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError("That email and password don't match. Try again.");
      return;
    }

    const session = await getSession();
    const dest = session?.user?.role === "ADMIN" ? "/admin" : callbackUrl;
    router.push(dest);
    router.refresh();
  }

  return (
    <div className={styles.formInner}>
      <div className={styles.formHeader}>
        <h1 className={styles.formHeading}>Welcome back</h1>
        <p className={styles.formSub}>
          Good to see you. Your research community is waiting.
        </p>
      </div>

      <form onSubmit={handleSubmit} className={styles.form} noValidate>
        <div className={styles.field}>
          <label htmlFor="email" className={styles.label}>Email address</label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={styles.input}
            placeholder="you@example.com"
          />
        </div>

        <div className={styles.field}>
          <label htmlFor="password" className={styles.label}>Password</label>
          <div className={styles.inputWrap}>
            <input
              id="password"
              type={showPwd ? "text" : "password"}
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={styles.input}
              placeholder="••••••••"
            />
            <button
              type="button"
              className={styles.eyeBtn}
              onClick={() => setShowPwd((v) => !v)}
              aria-label={showPwd ? "Hide password" : "Show password"}
            >
              {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        {error && <p className={styles.errorBanner} role="alert">{error}</p>}

        <button type="submit" className={styles.submitBtn} disabled={loading}>
          {loading
            ? <Loader2 size={16} className={styles.spinner} />
            : <>Sign in <ArrowRight size={15} /></>}
        </button>

        <p className={styles.switchBelow}>
          New here?{" "}
          <Link href={signupHref} className={styles.switchLink}>
            Create a free account
          </Link>
        </p>
      </form>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className={styles.page}>

      {/* Left — brand panel with space image */}
      <div className={styles.leftPanel}>
        <div className={styles.leftInner}>
          <Link href="/" className={styles.logo}>
            Eka <span className={styles.logoAccent}>Research</span>
          </Link>
          <div className={styles.leftContent}>
            <h2 className={styles.leftHeading}>
              Nepal&apos;s space research community
            </h2>
            <p className={styles.leftSub}>
              From Class&nbsp;9 students to PhD researchers — everyone has a place here.
            </p>
            <ul className={styles.perkList}>
              {PERKS.map(({ icon: Icon, text }) => (
                <li key={text} className={styles.perkItem}>
                  <span className={styles.perkIcon}><Icon size={15} strokeWidth={1.75} /></span>
                  {text}
                </li>
              ))}
            </ul>
          </div>
          <p className={styles.leftNote}>
            Don&apos;t have an account? Sign up free — no prerequisites, no applications.
          </p>
        </div>
      </div>

      {/* Right — form */}
      <div className={styles.rightPanel}>
        <Suspense fallback={<div className={styles.formSkeleton} />}>
          <LoginForm />
        </Suspense>
      </div>

    </div>
  );
}
