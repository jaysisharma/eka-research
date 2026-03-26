"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Upload, Loader2 } from "lucide-react";
import styles from "../cms.module.css";

type FormValues = {
  title: string;
  authors: string;
  ekaAuthors: string;
  journal: string;
  year: string;
  date: string;
  type: string;
  disciplines: string;
  abstract: string;
  imageUrl: string;
  doi: string;
  arxiv: string;
  featured: boolean;
  published: boolean;
};

type Props = {
  mode: "create" | "edit";
  articleId?: string;
  initial?: Partial<FormValues>;
};

export function ResearchForm({ mode, articleId, initial }: Props) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);

  const [values, setValues] = useState<FormValues>({
    title: initial?.title ?? "",
    authors: initial?.authors ?? "",
    ekaAuthors: initial?.ekaAuthors ?? "",
    journal: initial?.journal ?? "",
    year: initial?.year ?? String(new Date().getFullYear()),
    date: initial?.date ?? new Date().toISOString().split("T")[0],
    type: initial?.type ?? "journal",
    disciplines: initial?.disciplines ?? "",
    abstract: initial?.abstract ?? "",
    imageUrl: initial?.imageUrl ?? "",
    doi: initial?.doi ?? "",
    arxiv: initial?.arxiv ?? "",
    featured: initial?.featured ?? false,
    published: initial?.published ?? true,
  });

  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function set<K extends keyof FormValues>(k: K, v: FormValues[K]) {
    setValues((prev) => ({ ...prev, [k]: v }));
  }

  async function handleImageUpload(file: File) {
    setUploading(true);
    setError("");
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Upload failed");
      set("imageUrl", data.url);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const authors = values.authors.split("\n").map((s) => s.trim()).filter(Boolean);
      const ekaAuthors = values.ekaAuthors.split("\n").map((s) => s.trim()).filter(Boolean);
      const disciplines = values.disciplines.split(",").map((s) => s.trim()).filter(Boolean);

      const payload = {
        title: values.title,
        authors,
        ekaAuthors,
        journal: values.journal,
        year: Number(values.year),
        date: values.date,
        type: values.type,
        disciplines,
        abstract: values.abstract,
        imageUrl: values.imageUrl || null,
        doi: values.doi || null,
        arxiv: values.arxiv || null,
        featured: values.featured,
        published: values.published,
      };

      const url = mode === "create" ? "/api/admin/research" : `/api/admin/research/${articleId}`;
      const method = mode === "create" ? "POST" : "PUT";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Save failed");
      router.push("/admin/research");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed");
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      {error && <p className={styles.error}>{error}</p>}

      {/* Title */}
      <div className={styles.field}>
        <label className={styles.label}>Title *</label>
        <input className={styles.input} value={values.title} onChange={(e) => set("title", e.target.value)} required placeholder="Full paper title as it appears in the journal…" />
      </div>

      {/* Authors + Eka Authors */}
      <div className={styles.row}>
        <div className={styles.field}>
          <label className={styles.label}>Authors * <span className={styles.optional}>(one per line)</span></label>
          <textarea className={styles.textarea} rows={4} value={values.authors} onChange={(e) => set("authors", e.target.value)} required placeholder={"A. Sharma\nP. Thapa\nR. Adhikari"} />
        </div>
        <div className={styles.field}>
          <label className={styles.label}>Eka authors <span className={styles.optional}>(one per line — highlighted in gold)</span></label>
          <textarea className={styles.textarea} rows={4} value={values.ekaAuthors} onChange={(e) => set("ekaAuthors", e.target.value)} placeholder={"A. Sharma\nP. Thapa"} />
        </div>
      </div>

      {/* Journal + Year + Date */}
      <div className={styles.row3}>
        <div className={styles.field}>
          <label className={styles.label}>Journal / Venue *</label>
          <input className={styles.input} value={values.journal} onChange={(e) => set("journal", e.target.value)} required placeholder="Monthly Notices of the Royal Astronomical Society" />
        </div>
        <div className={styles.field}>
          <label className={styles.label}>Year *</label>
          <input className={styles.input} type="number" min={2000} max={2100} value={values.year} onChange={(e) => set("year", e.target.value)} required />
        </div>
        <div className={styles.field}>
          <label className={styles.label}>Publication date *</label>
          <input className={styles.input} type="date" value={values.date} onChange={(e) => set("date", e.target.value)} required />
        </div>
      </div>

      {/* Type + Disciplines */}
      <div className={styles.row}>
        <div className={styles.field}>
          <label className={styles.label}>Article type *</label>
          <select className={styles.select} value={values.type} onChange={(e) => set("type", e.target.value)}>
            <option value="journal">Journal</option>
            <option value="conference">Conference</option>
            <option value="preprint">Preprint</option>
            <option value="report">Report</option>
          </select>
        </div>
        <div className={styles.field}>
          <label className={styles.label}>Disciplines <span className={styles.optional}>(comma-separated)</span></label>
          <input className={styles.input} value={values.disciplines} onChange={(e) => set("disciplines", e.target.value)} placeholder="Meteor Science, Instrumentation" />
        </div>
      </div>

      {/* Abstract */}
      <div className={styles.field}>
        <label className={styles.label}>Abstract *</label>
        <textarea className={styles.textarea} rows={6} value={values.abstract} onChange={(e) => set("abstract", e.target.value)} required placeholder="Paste the paper abstract here…" />
      </div>

      {/* DOI + arXiv */}
      <div className={styles.row}>
        <div className={styles.field}>
          <label className={styles.label}>DOI <span className={styles.optional}>(without https://doi.org/)</span></label>
          <input className={styles.input} value={values.doi} onChange={(e) => set("doi", e.target.value)} placeholder="10.1093/mnras/stae2241" />
        </div>
        <div className={styles.field}>
          <label className={styles.label}>arXiv ID <span className={styles.optional}>(numbers only)</span></label>
          <input className={styles.input} value={values.arxiv} onChange={(e) => set("arxiv", e.target.value)} placeholder="2302.14821" />
        </div>
      </div>

      {/* Image */}
      <div className={styles.field}>
        <label className={styles.label}>Cover image <span className={styles.optional}>(optional)</span></label>
        <div className={styles.uploadArea}>
          {values.imageUrl ? (
            <div className={styles.imagePreview}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={values.imageUrl} alt="Cover" className={styles.previewImg} />
              <button type="button" className={styles.changeImageBtn} onClick={() => fileRef.current?.click()}>Change image</button>
            </div>
          ) : (
            <button type="button" className={styles.uploadBtn} onClick={() => fileRef.current?.click()} disabled={uploading}>
              {uploading ? <><Loader2 size={16} className={styles.spin} /> Uploading…</> : <><Upload size={16} /> Upload image</>}
            </button>
          )}
          <input ref={fileRef} type="file" accept="image/*" className={styles.hidden} onChange={(e) => { const f = e.target.files?.[0]; if (f) handleImageUpload(f); }} />
        </div>
        <p className={styles.hint}>Or paste a URL directly:</p>
        <input className={styles.input} value={values.imageUrl} onChange={(e) => set("imageUrl", e.target.value)} placeholder="https://images.unsplash.com/…" />
      </div>

      {/* Checkboxes */}
      <div className={styles.checkRow}>
        <label className={styles.checkLabel}>
          <input type="checkbox" checked={values.featured} onChange={(e) => set("featured", e.target.checked)} className={styles.checkbox} />
          Featured (shown on research page)
        </label>
        <label className={styles.checkLabel}>
          <input type="checkbox" checked={values.published} onChange={(e) => set("published", e.target.checked)} className={styles.checkbox} />
          Published (visible on site)
        </label>
      </div>

      {/* Actions */}
      <div className={styles.formActions}>
        <button type="button" className={styles.cancelBtn} onClick={() => router.back()}>Cancel</button>
        <button type="submit" className={styles.saveBtn} disabled={saving}>
          {saving ? <><Loader2 size={15} className={styles.spin} /> Saving…</> : mode === "create" ? "Add article" : "Save changes"}
        </button>
      </div>
    </form>
  );
}
