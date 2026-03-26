"use client";

import { useState, useId } from "react";
import { ArrowRight, Check, Loader2 } from "lucide-react";
import styles from "./page.module.css";

const LEVELS = [
  "Class 9–12 Student",
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

export default function JoinForm() {
  const formId = useId();
  const [formState, setFormState] = useState<FormState>("idle");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [level, setLevel] = useState("");
  const [interest, setInterest] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFormState("loading");
    await new Promise((r) => setTimeout(r, 1100));
    setFormState("success");
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
            className={styles.formInput}
            placeholder="Aarav Sharma"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor={`${formId}-email`} className={styles.formLabel}>
            Email address <span className={styles.required}>*</span>
          </label>
          <input
            id={`${formId}-email`}
            type="email"
            className={styles.formInput}
            placeholder="you@example.com"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
      </div>

      <div className={styles.formRow}>
        <div className={styles.formGroup}>
          <label htmlFor={`${formId}-level`} className={styles.formLabel}>
            Your level <span className={styles.required}>*</span>
          </label>
          <select
            id={`${formId}-level`}
            className={styles.formSelect}
            required
            value={level}
            onChange={(e) => setLevel(e.target.value)}
          >
            <option value="" disabled>Select…</option>
            {LEVELS.map((l) => (
              <option key={l} value={l}>{l}</option>
            ))}
          </select>
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
