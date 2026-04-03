"use client";

import { useState, useId } from "react";
import { ArrowRight, Check, Loader2 } from "lucide-react";
import styles from "./page.module.css";

const LEVELS = [
  "Student",
  "Undergraduate",
  "Masters / Graduate",
  "PhD Researcher",
  "Professional / Working",
  "Other",
];

const INTERESTS = [
  "Observational Astronomy",
  "Meteor Science",
  "Space Weather",
  "Atmospheric Physics",
  "Astrophysics",
  "Science Education",
  "General curiosity",
];

type FormState = "idle" | "loading" | "success";

type Errors = { name?: string; email?: string; level?: string };

function validateEmail(v: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}

export default function JoinForm() {
  const formId = useId();
  const [formState, setFormState] = useState<FormState>("idle");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [level, setLevel] = useState("");
  const [interest, setInterest] = useState("");
  const [errors, setErrors] = useState<Errors>({});

  function validate(): Errors {
    const e: Errors = {};
    if (!name.trim() || name.trim().length < 2) e.name = "Please enter your full name (at least 2 characters).";
    if (!email.trim()) e.email = "Email address is required.";
    else if (!validateEmail(email)) e.email = "Please enter a valid email address.";
    if (!level) e.level = "Please select your level.";
    return e;
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setFormState("loading");
    await new Promise((r) => setTimeout(r, 1100));
    setFormState("success");
  }

  function clearError(field: keyof Errors) {
    setErrors((prev) => { const next = { ...prev }; delete next[field]; return next; });
  }

  if (formState === "success") {
    return (
      <div className={styles.successCard}>
        <div className={styles.successIconWrap}>
          <Check size={22} strokeWidth={2.5} />
        </div>
        <h3 className={styles.successHeading}>Welcome to Eka Research!</h3>
        <p className={styles.successSub}>
          Hi <strong className={styles.successName}>{name}</strong> — your membership is active.
          We&apos;ve sent a welcome email to <em>{email}</em> with your member ID and
          access details.
        </p>
        <div className={styles.successPill}>
          <span className={styles.successDot} />
          Membership active
        </div>
      </div>
    );
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      <div className={styles.formRow}>
        <div className={styles.formGroup}>
          <label htmlFor={`${formId}-name`} className={styles.formLabel}>
            Full name <span className={styles.required}>*</span>
          </label>
          <input
            id={`${formId}-name`}
            type="text"
            className={`${styles.formInput} ${errors.name ? styles.formInputError : ""}`}
            placeholder="Aarav Sharma"
            value={name}
            onChange={(e) => { setName(e.target.value); clearError("name"); }}
          />
          {errors.name && <span className={styles.fieldError} role="alert">{errors.name}</span>}
        </div>
        <div className={styles.formGroup}>
          <label htmlFor={`${formId}-email`} className={styles.formLabel}>
            Email address <span className={styles.required}>*</span>
          </label>
          <input
            id={`${formId}-email`}
            type="email"
            className={`${styles.formInput} ${errors.email ? styles.formInputError : ""}`}
            placeholder="you@example.com"
            value={email}
            onChange={(e) => { setEmail(e.target.value); clearError("email"); }}
          />
          {errors.email && <span className={styles.fieldError} role="alert">{errors.email}</span>}
        </div>
      </div>

      <div className={styles.formRow}>
        <div className={styles.formGroup}>
          <label htmlFor={`${formId}-level`} className={styles.formLabel}>
            Your level <span className={styles.required}>*</span>
          </label>
          <select
            id={`${formId}-level`}
            className={`${styles.formSelect} ${errors.level ? styles.formSelectError : ""}`}
            value={level}
            onChange={(e) => { setLevel(e.target.value); clearError("level"); }}
          >
            <option value="" disabled>Select…</option>
            {LEVELS.map((l) => (
              <option key={l} value={l}>{l}</option>
            ))}
          </select>
          {errors.level && <span className={styles.fieldError} role="alert">{errors.level}</span>}
        </div>
        <div className={styles.formGroup}>
          <label htmlFor={`${formId}-interest`} className={styles.formLabel}>
            Area of interest
          </label>
          <select
            id={`${formId}-interest`}
            className={styles.formSelect}
            value={interest}
            onChange={(e) => setInterest(e.target.value)}
          >
            <option value="">Select (optional)</option>
            {INTERESTS.map((i) => (
              <option key={i} value={i}>{i}</option>
            ))}
          </select>
        </div>
      </div>

      <button
        type="submit"
        className={styles.submitBtn}
        disabled={formState === "loading"}
      >
        {formState === "loading" ? (
          <>
            <Loader2 size={16} className={styles.spinner} />
            Creating your membership…
          </>
        ) : (
          <>
            Join now — it&apos;s free
            <ArrowRight size={16} />
          </>
        )}
      </button>

      <p className={styles.formNote}>
        Free forever · No credit card · No approval queue
      </p>
    </form>
  );
}
