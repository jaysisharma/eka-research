"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import styles from "./page.module.css";

const RULES = [
  { label: "At least 8 characters",       test: (p: string) => p.length >= 8 },
  { label: "One uppercase letter",        test: (p: string) => /[A-Z]/.test(p) },
  { label: "One number",                  test: (p: string) => /[0-9]/.test(p) },
  { label: "One special character",       test: (p: string) => /[^A-Za-z0-9]/.test(p) },
];

export default function PasswordForm() {
  const [current, setCurrent] = useState("");
  const [next,    setNext]    = useState("");
  const [confirm, setConfirm] = useState("");
  const [show,    setShow]    = useState(false);
  const [saving,  setSaving]  = useState(false);
  const [error,   setError]   = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!current || !next || !confirm)      { setError("All fields are required.");               return; }
    if (!RULES.every((r) => r.test(next)))  { setError("New password doesn't meet the rules.");   return; }
    if (next !== confirm)                   { setError("New passwords don't match.");             return; }

    setSaving(true);
    try {
      const res = await fetch("/api/admin/password", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ currentPassword: current, newPassword: next }),
      });
      const data = await res.json() as { error?: string };
      if (!res.ok) {
        setError(data.error ?? "Something went wrong.");
        return;
      }
      setCurrent("");
      setNext("");
      setConfirm("");
      setSuccess("Password updated. Use the new password next time you sign in.");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const type = show ? "text" : "password";

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      <label className={styles.field}>
        <span className={styles.label}>Current password</span>
        <input
          className={styles.input} type={type} value={current}
          autoComplete="current-password"
          onChange={(e) => setCurrent(e.target.value)}
        />
      </label>

      <label className={styles.field}>
        <span className={styles.label}>New password</span>
        <input
          className={styles.input} type={type} value={next}
          autoComplete="new-password"
          onChange={(e) => setNext(e.target.value)}
        />
      </label>

      <ul className={styles.rules}>
        {RULES.map((r) => (
          <li key={r.label} className={styles.rule} data-met={r.test(next)}>
            {r.label}
          </li>
        ))}
      </ul>

      <label className={styles.field}>
        <span className={styles.label}>Confirm new password</span>
        <input
          className={styles.input} type={type} value={confirm}
          autoComplete="new-password"
          onChange={(e) => setConfirm(e.target.value)}
        />
      </label>

      <button type="button" className={styles.toggleBtn} onClick={() => setShow((s) => !s)}>
        {show ? <EyeOff size={14} /> : <Eye size={14} />}
        {show ? "Hide passwords" : "Show passwords"}
      </button>

      {error   && <p className={styles.error}   role="alert">{error}</p>}
      {success && <p className={styles.success} role="status">{success}</p>}

      <button type="submit" className={styles.submitBtn} disabled={saving}>
        {saving ? "Updating…" : "Update password"}
      </button>
    </form>
  );
}
