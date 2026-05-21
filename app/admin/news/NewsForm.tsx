"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeft, ChevronRight, RefreshCw, AlertCircle,
} from "lucide-react";
import styles from "./form.module.css";
import ImageUpload from "@/components/ui/ImageUpload";

/* ── Types & Constants ────────────────────────────────────────────────── */

export type NewsCategory = "announcement" | "publication" | "milestone" | "event" | "media";

export const CATEGORY_OPTIONS: { value: NewsCategory; label: string }[] = [
  { value: "announcement", label: "Announcement" },
  { value: "publication", label: "Publication" },
  { value: "milestone", label: "Milestone" },
  { value: "event", label: "Event" },
  { value: "media", label: "Media" },
];

export interface NewsFormData {
  title: string;
  slug: string;
  excerpt: string;
  category: NewsCategory;
  date: string;
  imageUrl: string;
  featured: boolean;
  published: boolean;
}

export const BLANK_FORM: NewsFormData = {
  title: "",
  slug: "",
  excerpt: "",
  category: "announcement",
  date: new Date().toISOString().split("T")[0], // default to today YYYY-MM-DD
  imageUrl: "",
  featured: false,
  published: true,
};

const slugify = (s: string) =>
  s.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

/* ── Toggle Switch Component ─────────────────────────────────────────── */

function Toggle({ on, onChange }: { on: boolean; onChange: () => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      className={`${styles.switchTrack} ${on ? styles.switchOn : ""}`}
      onClick={onChange}
    >
      <span className={styles.switchKnob} />
    </button>
  );
}

/* ── Main Form Component ─────────────────────────────────────────────── */


interface NewsFormProps {
  mode: "new" | "edit";
  form: NewsFormData;
  saving: boolean;
  error?: string;
  onChange: (key: keyof NewsFormData, value: NewsFormData[keyof NewsFormData]) => void;
  onSave: () => void;
}

export default function NewsForm({ mode, form, saving, error, onChange, onSave }: NewsFormProps) {
  const [slugEdited, setSlugEdited] = useState(false);

  // Auto-fill slug if user hasn't touched it yet
  useEffect(() => {
    if (mode === "new" && !slugEdited && form.title) {
      onChange("slug", slugify(form.title));
    }
  }, [form.title, slugEdited, mode, onChange]);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange("title", e.target.value);
  };

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSlugEdited(true);
    onChange("slug", slugify(e.target.value));
  };

  const handleFieldChange = (key: keyof NewsFormData) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    onChange(key, e.target.value);
  };

  const toggleBool = (key: "featured" | "published") => () => {
    onChange(key, !form[key]);
  };

  return (
    <div className={styles.shell}>
      {/* TOP BAR */}
      <header className={styles.topBar}>
        <div className={styles.topBarLeft}>
          <Link href="/admin/news" className={styles.backBtn}>
            <ArrowLeft size={14} /> News Feed
          </Link>
          <ChevronRight size={12} className={styles.breadSep} />
          <span className={styles.topBarTitle}>
            {mode === "new" ? "Write News Post" : "Edit News Post"}
          </span>
        </div>
        <div className={styles.topBarRight}>
          <Link href="/admin/news" className={styles.cancelBtn}>Cancel</Link>
          <button className={styles.saveBtn} onClick={onSave} disabled={saving}>
            {saving ? (
              <>
                <RefreshCw size={13} className={styles.spinSm} /> Saving…
              </>
            ) : mode === "new" ? (
              "Publish Post"
            ) : (
              "Save Changes"
            )}
          </button>
        </div>
      </header>

      {/* 2-COL BODY */}
      <div className={styles.body}>
        {/* LEFT COLUMN: Main Form Details */}
        <div className={styles.main}>
          {error && (
            <div className={styles.errorBanner}>
              <AlertCircle size={14} /> {error}
            </div>
          )}

          <div className={styles.mainCard}>
            {/* Section 01: Core Content */}
            <section className={styles.section}>
              <header className={styles.sectionHead}>
                <span className={styles.sectionNum}>01</span>
                <span className={styles.sectionName}>Core Details</span>
              </header>
              <div className={styles.fields}>
                <div className={styles.field}>
                  <label className={styles.label}>
                    Article Title <span className={styles.req}>*</span>
                  </label>
                  <input
                    className={styles.input}
                    value={form.title}
                    onChange={handleTitleChange}
                    placeholder="Enter article title..."
                  />
                </div>

                <div className={styles.row}>
                  <div className={styles.field}>
                    <label className={styles.label}>
                      URL Slug <span className={styles.req}>*</span>
                    </label>
                    <input
                      className={styles.input}
                      value={form.slug}
                      onChange={handleSlugChange}
                      placeholder="auto-generated-url-slug"
                    />
                    <span className={styles.hint}>
                      Public URL: <span className={styles.slugPreview}>/news/{form.slug || "your-slug"}</span>
                    </span>
                  </div>

                  <div className={styles.field}>
                    <label className={styles.label}>
                      Publish Date <span className={styles.req}>*</span>
                    </label>
                    <input
                      type="date"
                      className={styles.input}
                      value={form.date}
                      onChange={handleFieldChange("date")}
                    />
                  </div>
                </div>

                <div className={styles.field}>
                  <label className={styles.label}>
                    Excerpt / Summary <span className={styles.req}>*</span>
                  </label>
                  <textarea
                    className={`${styles.textarea} ${styles.md}`}
                    value={form.excerpt}
                    onChange={handleFieldChange("excerpt")}
                    placeholder="Provide a brief, compelling summary of the article to entice readers on the home page feed..."
                  />
                  <span className={styles.hint}>
                    Character limit recommended: 150-200 characters.
                  </span>
                </div>
              </div>
            </section>

            {/* Section 02: Media & Imagery */}
            <section className={styles.section}>
              <header className={styles.sectionHead}>
                <span className={styles.sectionNum}>02</span>
                <span className={styles.sectionName}>Featured Media</span>
              </header>
              <div className={styles.fields}>
                <div className={styles.field}>
                  <label className={styles.label}>Featured Banner Image</label>
                  <ImageUpload value={form.imageUrl} onChange={(url) => onChange("imageUrl", url)} />
                  <span className={styles.hint}>
                    Recommended size: 1200x630px. Supports PNG, JPG, WebP. Max 20MB.
                  </span>
                </div>
              </div>
            </section>
          </div>
        </div>

        {/* RIGHT COLUMN: Settings Sidebar */}
        <aside className={styles.sidebar}>
          {/* Card: Visibility & Status */}
          <div className={styles.card}>
            <p className={styles.cardTitle}>Status &amp; Promotion</p>

            <div className={styles.toggleItem}>
              <div>
                <div className={styles.toggleLabel}>Publicly Visible</div>
                <div className={styles.toggleSub}>Publish directly on the live feed</div>
              </div>
              <Toggle on={form.published} onChange={toggleBool("published")} />
            </div>

            <div className={styles.toggleDivider} />

            <div className={styles.toggleItem}>
              <div>
                <div className={styles.toggleLabel}>Featured Story</div>
                <div className={styles.toggleSub}>Pin to top of news page as marquee</div>
              </div>
              <Toggle on={form.featured} onChange={toggleBool("featured")} />
            </div>
          </div>

          {/* Card: Classification */}
          <div className={styles.card}>
            <p className={styles.cardTitle}>Classification</p>
            <div className={styles.field}>
              <label className={styles.label}>
                News Category <span className={styles.req}>*</span>
              </label>
              <select
                className={styles.select}
                value={form.category}
                onChange={handleFieldChange("category")}
              >
                {CATEGORY_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
