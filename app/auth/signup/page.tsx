"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, ArrowRight, Loader2, Check, Telescope, CalendarCheck, Database, GraduationCap } from "lucide-react";
import styles from "./page.module.css";
import { ROLE_LABELS } from "@/lib/access";

const LEVELS = [
  "Student", "Undergraduate student", "Postgraduate student",
  "Researcher / Academic", "Working professional", "Other",
];

const INTERESTS = [
  "Meteor science & detection", "Atmospheric physics", "Space weather",
  "Astronomy & astrophysics", "Science education", "Science communication",
  "Data science & engineering", "Other",
];

const ACCOUNT_TYPES = [
  { value: "FREE_USER"  as const, label: "Free Member",  desc: "Events, news & community" },
  { value: "TEACHER"    as const, label: "Teacher",      desc: "Auto-verified with university email" },
  { value: "RESEARCHER" as const, label: "Researcher",   desc: "Auto-verified with university email" },
];

const PERKS = [
  { icon: CalendarCheck, text: "Guided meteor observation nights" },
  { icon: Telescope,     text: "Telescope & instrument access" },
  { icon: Database,      text: "Meteor, weather & space datasets" },
  { icon: GraduationCap, text: "1-on-1 researcher mentoring" },
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
  const [level, setLevel] = useState("");
  const [interest, setInterest] = useState("");
  const [accountType, setAccountType] = useState<"FREE_USER" | "TEACHER" | "RESEARCHER">("FREE_USER");
  const [fieldErrors, setFieldErrors] = useState<{ name?: string; email?: string; password?: string }>({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [assignedRole, setAssignedRole] = useState<string>("");
  const [pending, setPending] = useState(false);

  const showEduNote = accountType === "TEACHER" || accountType === "RESEARCHER";

  function validate() {
    const e: { name?: string; email?: string; password?: string } = {};
    if (!name.trim() || name.trim().length < 2) e.name = "Please enter your full name (at least 2 characters).";
    if (!email.trim()) e.email = "Email address is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = "Please enter a valid email address.";
    if (!password) e.password = "Password is required.";
    else if (password.length < 8) e.password = "Password must be at least 8 characters.";
    return e;
  }

  function clearFieldError(field: "name" | "email" | "password") {
    setFieldErrors((prev) => { const next = { ...prev }; delete next[field]; return next; });
  }

  function successMessage() {
    if (pending) return "Your request is pending admin verification — you'll be upgraded once approved";
    if (assignedRole === "TEACHER") return "You've joined as a Teacher with premium access";
    if (assignedRole === "RESEARCHER") return "You've joined as a Researcher with premium access";
    const label = ROLE_LABELS[assignedRole as keyof typeof ROLE_LABELS] ?? "Free Member";
    return `You've joined as a ${label}`;
  }

  async function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    setServerError("");
    const errs = validate();
    if (Object.keys(errs).length) { setFieldErrors(errs); return; }
    setFieldErrors({});
    setLoading(true);

    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password, level, interest, accountType }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setServerError(data.error ?? "Registration failed.");
      return;
    }

    setAssignedRole(data.role ?? "FREE_USER");
    setPending(!!data.pending);
    setSuccess(true);

    const verifyHref = `/auth/verify?email=${encodeURIComponent(email)}${callbackUrl !== "/dashboard" ? `&callbackUrl=${encodeURIComponent(callbackUrl)}` : ""}`;
    setTimeout(() => router.push(verifyHref), 1500);
  }

  if (success) {
    return (
      <div className={styles.successWrap}>
        <span className={styles.successIcon}><Check size={26} strokeWidth={2.5} /></span>
        <h1 className={styles.successHeading}>Welcome to Eka Research</h1>
        <p className={styles.successSub}>{successMessage()}</p>
        <p className={styles.successSub}>
          {callbackUrl !== "/dashboard" ? "Continuing to checkout…" : "Taking you to your dashboard…"}
        </p>
      </div>
    );
  }

  return (
    <div className={styles.formInner}>
      {/* Form header */}
      <div className={styles.formHeader}>
        <h1 className={styles.formHeading}>Create your account</h1>
        <p className={styles.formSub}>Free to join. Open to everyone.</p>
      </div>

      <form onSubmit={handleSubmit} className={styles.form} noValidate>

        {/* Account type — full width */}
        <div className={styles.field}>
          <label className={styles.label}>I am a…</label>
          <div className={styles.roleCards}>
            {ACCOUNT_TYPES.map((type) => (
              <button
                key={type.value}
                type="button"
                className={`${styles.roleCard} ${accountType === type.value ? styles.roleCardActive : ""}`}
                onClick={() => setAccountType(type.value)}
              >
                <span className={styles.roleCardTitle}>{type.label}</span>
                <span className={styles.roleCardDesc}>{type.desc}</span>
              </button>
            ))}
          </div>
          {showEduNote && (
            <p className={styles.eduNote}>
              University or .edu email? You&apos;ll be auto-verified instantly. Other emails go through a quick admin review.
            </p>
          )}
        </div>

        {/* Name + Email — 2 columns */}
        <div className={styles.grid2}>
          <div className={styles.field}>
            <label htmlFor="name" className={styles.label}>Full name</label>
            <input id="name" type="text" autoComplete="name"
              value={name}
              onChange={(e) => { setName(e.target.value); clearFieldError("name"); }}
              className={`${styles.input} ${fieldErrors.name ? styles.inputError : ""}`}
              placeholder="Your name" />
            {fieldErrors.name && <span className={styles.fieldError} role="alert">{fieldErrors.name}</span>}
          </div>
          <div className={styles.field}>
            <label htmlFor="email" className={styles.label}>Email address</label>
            <input id="email" type="email" autoComplete="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); clearFieldError("email"); }}
              className={`${styles.input} ${fieldErrors.email ? styles.inputError : ""}`}
              placeholder="you@example.com" />
            {fieldErrors.email && <span className={styles.fieldError} role="alert">{fieldErrors.email}</span>}
          </div>
        </div>

        {/* Password — full width */}
        <div className={styles.field}>
          <label htmlFor="password" className={styles.label}>Password</label>
          <div className={styles.inputWrap}>
            <input id="password" type={showPwd ? "text" : "password"}
              autoComplete="new-password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); clearFieldError("password"); }}
              className={`${styles.input} ${fieldErrors.password ? styles.inputError : ""}`}
              placeholder="Min. 8 characters" />
            <button type="button" className={styles.eyeBtn}
              onClick={() => setShowPwd((v) => !v)}
              aria-label={showPwd ? "Hide password" : "Show password"}>
              {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {fieldErrors.password && <span className={styles.fieldError} role="alert">{fieldErrors.password}</span>}
          {!fieldErrors.password && password.length > 0 && (
            <ul className={styles.pwdHints}>
              <li className={password.length >= 8          ? styles.hintOk : styles.hintFail}>At least 8 characters</li>
              <li className={/[A-Z]/.test(password)        ? styles.hintOk : styles.hintFail}>One uppercase letter</li>
              <li className={/[0-9]/.test(password)        ? styles.hintOk : styles.hintFail}>One number</li>
              <li className={/[^A-Za-z0-9]/.test(password) ? styles.hintOk : styles.hintFail}>One special character</li>
            </ul>
          )}
        </div>

        {/* Level + Interest — 2 columns */}
        <div className={styles.grid2}>
          <div className={styles.field}>
            <label htmlFor="level" className={styles.label}>
              Academic level <span className={styles.optional}>(optional)</span>
            </label>
            <select id="level" value={level} onChange={(e) => setLevel(e.target.value)}
              className={styles.select}>
              <option value="">Select level</option>
              {LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>
          <div className={styles.field}>
            <label htmlFor="interest" className={styles.label}>
              Area of interest <span className={styles.optional}>(optional)</span>
            </label>
            <select id="interest" value={interest} onChange={(e) => setInterest(e.target.value)}
              className={styles.select}>
              <option value="">Select area</option>
              {INTERESTS.map((i) => <option key={i} value={i}>{i}</option>)}
            </select>
          </div>
        </div>

        {/* Server error just above button */}
        {serverError && <p className={styles.errorBanner} role="alert">{serverError}</p>}

        <button type="submit" className={styles.submitBtn} disabled={loading}>
          {loading
            ? <Loader2 size={16} className={styles.spinner} />
            : <>Create membership <ArrowRight size={15} /></>}
        </button>

        <p className={styles.terms}>
          No spam. No selling your data. Just your membership, managed honestly.
        </p>

        <p className={styles.switchBelow}>
          Already a member?{" "}
          <Link href={loginHref} className={styles.switchLink}>Sign in</Link>
        </p>
      </form>
    </div>
  );
}

export default function SignupPage() {
  return (
    <div className={styles.page}>

      {/* Left — brand panel */}
      <div className={styles.leftPanel}>
        <div className={styles.leftInner}>
          <Link href="/" className={styles.logo}>
            Eka <span className={styles.logoAccent}>Research</span>
          </Link>
          <div className={styles.leftContent}>
            <h2 className={styles.leftHeading}>
              Join Nepal&apos;s space research community
            </h2>
            <p className={styles.leftSub}>
              Free to join. No applications, no prerequisites.
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
            Teacher or researcher? Sign up with your .edu email for free premium access.
          </p>
        </div>
      </div>

      {/* Right — form */}
      <div className={styles.rightPanel}>
        <Suspense fallback={<div className={styles.formSkeleton} />}>
          <SignupForm />
        </Suspense>
      </div>

    </div>
  );
}
