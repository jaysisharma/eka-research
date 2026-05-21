"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Send, Loader2 } from "lucide-react";
import Link from "next/link";
import styles from "./page.module.css";

const PAPER_TYPES = ["journal", "conference", "preprint", "report"] as const;

export default function SubmitPaperPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    title:       "",
    authors:     "",
    journal:     "",
    year:        new Date().getFullYear().toString(),
    date:        "",
    type:        "journal",
    disciplines: "",
    abstract:    "",
    doi:         "",
    arxiv:       "",
  });

  function set(field: keyof typeof form, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/research/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Submission failed.");

      // refresh() clears the Next.js RSC cache so the server component
      // re-renders fresh and picks up ?submitted=1 on navigation
      router.refresh();
      router.push("/dashboard/research?submitted=1");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className={styles.page}>

      {/* ── HEADER ── */}
      <header className={styles.header}>
        <Link href="/dashboard/research" className={styles.backBtn}>
          <ArrowLeft size={15} /> Back to My Research
        </Link>
        <div>
          <h1 className={styles.heading}>Submit a Paper</h1>
          <p className={styles.sub}>
            Submitted papers are reviewed by the Eka team before publication.
          </p>
        </div>
      </header>

      <form onSubmit={handleSubmit} className={styles.form}>

        {/* TITLE */}
        <div className={styles.field}>
          <label className={styles.label}>
            Paper Title <span className={styles.required}>*</span>
          </label>
          <input
            type="text"
            className={styles.input}
            value={form.title}
            onChange={(e) => set("title", e.target.value)}
            placeholder="e.g. Atmospheric Spectroscopy of Near-Earth Objects"
            required
          />
        </div>

        {/* AUTHORS */}
        <div className={styles.field}>
          <label className={styles.label}>
            Authors <span className={styles.required}>*</span>
          </label>
          <textarea
            className={styles.textarea}
            rows={3}
            value={form.authors}
            onChange={(e) => set("authors", e.target.value)}
            placeholder={"One author per line:\nJaya Sharma\nRaj Adhikari"}
            required
          />
          <p className={styles.hint}>One author per line.</p>
        </div>

        {/* TYPE + YEAR row */}
        <div className={styles.row}>
          <div className={styles.field}>
            <label className={styles.label}>
              Type <span className={styles.required}>*</span>
            </label>
            <select
              className={styles.select}
              value={form.type}
              onChange={(e) => set("type", e.target.value)}
              required
            >
              {PAPER_TYPES.map((t) => (
                <option key={t} value={t} style={{ textTransform: "capitalize" }}>
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>
              Year <span className={styles.required}>*</span>
            </label>
            <input
              type="number"
              className={styles.input}
              value={form.year}
              onChange={(e) => set("year", e.target.value)}
              min="1900"
              max={new Date().getFullYear() + 1}
              required
            />
          </div>
        </div>

        {/* JOURNAL + DATE row */}
        <div className={styles.row}>
          <div className={styles.field}>
            <label className={styles.label}>
              Journal / Venue <span className={styles.required}>*</span>
            </label>
            <input
              type="text"
              className={styles.input}
              value={form.journal}
              onChange={(e) => set("journal", e.target.value)}
              placeholder="e.g. Astrophysical Journal, arXiv"
              required
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>
              Publication Date <span className={styles.required}>*</span>
            </label>
            <input
              type="date"
              className={styles.input}
              value={form.date}
              onChange={(e) => set("date", e.target.value)}
              required
            />
          </div>
        </div>

        {/* ABSTRACT */}
        <div className={styles.field}>
          <label className={styles.label}>
            Abstract <span className={styles.required}>*</span>
          </label>
          <textarea
            className={styles.textarea}
            rows={6}
            value={form.abstract}
            onChange={(e) => set("abstract", e.target.value)}
            placeholder="A brief summary of the paper's goals, methods, and findings…"
            required
          />
        </div>

        {/* DISCIPLINES */}
        <div className={styles.field}>
          <label className={styles.label}>Disciplines</label>
          <input
            type="text"
            className={styles.input}
            value={form.disciplines}
            onChange={(e) => set("disciplines", e.target.value)}
            placeholder="e.g. Astrophysics, Space Weather, Remote Sensing"
          />
          <p className={styles.hint}>Comma-separated list.</p>
        </div>

        {/* DOI + ARXIV */}
        <div className={styles.row}>
          <div className={styles.field}>
            <label className={styles.label}>DOI</label>
            <input
              type="text"
              className={styles.input}
              value={form.doi}
              onChange={(e) => set("doi", e.target.value)}
              placeholder="10.XXXX/xxxxx"
            />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>arXiv ID</label>
            <input
              type="text"
              className={styles.input}
              value={form.arxiv}
              onChange={(e) => set("arxiv", e.target.value)}
              placeholder="2401.00001"
            />
          </div>
        </div>

        {error && (
          <div className={styles.errorMsg}>{error}</div>
        )}

        <div className={styles.formFooter}>
          <Link href="/dashboard/research" className={styles.cancelBtn}>
            Cancel
          </Link>
          <button type="submit" className={styles.submitBtn} disabled={submitting}>
            {submitting ? (
              <><Loader2 size={15} className={styles.spin} /> Submitting…</>
            ) : (
              <><Send size={15} /> Submit Paper</>
            )}
          </button>
        </div>

      </form>
    </div>
  );
}
