"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Upload, Loader2 } from "lucide-react";
import styles from "../cms.module.css";

type FormValues = {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  date: string;
  imageUrl: string;
  href: string;
  featured: boolean;
  published: boolean;
};

type Props = {
  mode: "create" | "edit";
  postId?: string;
  initial?: Partial<FormValues>;
};

function slugify(s: string) {
  return s.toLowerCase().trim().replace(/[^\w\s-]/g, "").replace(/[\s_-]+/g, "-").replace(/^-+|-+$/g, "");
}

export function NewsForm({ mode, postId, initial }: Props) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);

  const [values, setValues] = useState<FormValues>({
    slug: initial?.slug ?? "",
    title: initial?.title ?? "",
    excerpt: initial?.excerpt ?? "",
    category: initial?.category ?? "announcement",
    date: initial?.date ?? new Date().toISOString().split("T")[0],
    imageUrl: initial?.imageUrl ?? "",
    href: initial?.href ?? "",
    featured: initial?.featured ?? false,
    published: initial?.published ?? true,
  });

  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function set<K extends keyof FormValues>(k: K, v: FormValues[K]) {
    setValues((prev) => ({ ...prev, [k]: v }));
  }

  function handleTitleChange(title: string) {
    set("title", title);
    if (mode === "create") set("slug", slugify(title));
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
      const url = mode === "create" ? "/api/admin/news" : `/api/admin/news/${postId}`;
      const method = mode === "create" ? "POST" : "PUT";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Save failed");
      router.push("/admin/news");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed");
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      {error && <p className={styles.error}>{error}</p>}

      {/* Title + Slug */}
      <div className={styles.row}>
        <div className={styles.field}>
          <label className={styles.label}>Title *</label>
          <input className={styles.input} value={values.title} onChange={(e) => handleTitleChange(e.target.value)} required placeholder="Eka Research publishes in MNRAS…" />
        </div>
        <div className={styles.field}>
          <label className={styles.label}>Slug *</label>
          <input className={styles.input} value={values.slug} onChange={(e) => set("slug", e.target.value)} required placeholder="meteor-paper-mnras-2024" />
        </div>
      </div>

      {/* Category + Date */}
      <div className={styles.row}>
        <div className={styles.field}>
          <label className={styles.label}>Category *</label>
          <select className={styles.select} value={values.category} onChange={(e) => set("category", e.target.value)}>
            <option value="announcement">Announcement</option>
            <option value="publication">Publication</option>
            <option value="milestone">Milestone</option>
            <option value="event">Event</option>
            <option value="media">Media</option>
          </select>
        </div>
        <div className={styles.field}>
          <label className={styles.label}>Date *</label>
          <input className={styles.input} type="date" value={values.date} onChange={(e) => set("date", e.target.value)} required />
        </div>
      </div>

      {/* Excerpt */}
      <div className={styles.field}>
        <label className={styles.label}>Excerpt *</label>
        <textarea className={styles.textarea} rows={4} value={values.excerpt} onChange={(e) => set("excerpt", e.target.value)} required placeholder="A short summary shown on the news listing page…" />
      </div>

      {/* Link */}
      <div className={styles.field}>
        <label className={styles.label}>
          Link (href) * <span className={styles.optional}>— internal path or external URL</span>
        </label>
        <input className={styles.input} value={values.href} onChange={(e) => set("href", e.target.value)} required placeholder="/articles/meteor-network-nepal-2024 or https://…" />
      </div>

      {/* Image */}
      <div className={styles.field}>
        <label className={styles.label}>Cover image</label>
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
          Featured (shown as hero)
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
          {saving ? <><Loader2 size={15} className={styles.spin} /> Saving…</> : mode === "create" ? "Publish post" : "Save changes"}
        </button>
      </div>
    </form>
  );
}
