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
  const [slugEdited] = useState(false);

  const slugify = (s: string) =>
    s.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    onChange("title", val);
    if (mode === "new" && !slugEdited) {
      onChange("slug", slugify(val));
    }
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
            {/* 1. Cover Image Banner */}
            <div className={styles.section} style={{ padding: "24px 32px" }}>
              <div className={styles.field}>
                <label className={styles.label}>Featured Banner Image</label>
                <ImageUpload
                  value={form.imageUrl}
                  onChange={(url) => onChange("imageUrl", url)}
                  label="Upload Featured Banner"
                />
                <span className={styles.hint}>
                  Recommended size: 1200x630px. Supports PNG, JPG, WebP. Max 20MB.
                </span>
              </div>
            </div>

            {/* 2. Core Content */}
            <section className={styles.section}>
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
                    style={{ fontSize: "16px", fontWeight: "600", padding: "12px 16px" }}
                  />
                </div>

                <div className={styles.field} style={{ marginTop: "14px" }}>
                  <label className={styles.label}>
                    Excerpt / Summary <span className={styles.req}>*</span>
                  </label>
                  <textarea
                    className={styles.textarea}
                    value={form.excerpt}
                    onChange={handleFieldChange("excerpt")}
                    placeholder="Provide a brief, compelling summary of the article to entice readers on the home page feed..."
                    style={{ minHeight: "180px", resize: "none", fontSize: "14px", lineHeight: "1.6" }}
                  />
                  <span className={styles.hint}>
                    Character limit recommended: 150-200 characters.
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

          {/* Card: Article Settings */}
          <div className={styles.card}>
            <p className={styles.cardTitle}>Article Settings</p>
            
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

            <div className={styles.field} style={{ marginTop: "8px" }}>
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
        </aside>
      </div>
    </div>
  );
}
