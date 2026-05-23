"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft, ChevronRight, ChevronDown, RefreshCw,
  X, Plus, AlertCircle, Sparkles, Settings
} from "lucide-react";
import styles from "./form.module.css";
import ImageUpload from "@/components/ui/ImageUpload";

/* ── Types ───────────────────────────────────────────────────────────── */

export type ProjectStatus = "active" | "completed" | "planned" | "on_hold";

export interface CategoryOption { id: string; name: string; slug: string; }

export type ProjectFormData = {
  title:        string;
  description:  string;
  status:       ProjectStatus;
  categoryId:   string;
  period:       string;
  tags:         string[];
  imageUrl:     string;
  href:         string;
  featured:     boolean;
  outcome:      string;
  phase:        string;
  launchTarget: string;
  published:    boolean;
};

export const BLANK_FORM: ProjectFormData = {
  title: "", description: "", status: "planned",
  categoryId: "", period: "", tags: [],
  imageUrl: "", href: "",
  featured: false, outcome: "",
  phase: "", launchTarget: "", published: true,
};

/* ── Tag input (chip-based) ──────────────────────────────────────────── */

function TagInput({ tags, onChange }: { tags: string[]; onChange: (next: string[]) => void }) {
  const [input, setInput] = useState("");

  const add = () => {
    const val = input.trim();
    if (val && !tags.includes(val)) onChange([...tags, val]);
    setInput("");
  };

  const remove = (tag: string) => onChange(tags.filter((t) => t !== tag));

  const onKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") { e.preventDefault(); add(); }
    if (e.key === "Backspace" && !input && tags.length > 0) remove(tags[tags.length - 1]);
  };

  return (
    <div className={styles.tagBox}>
      {tags.map((tag) => (
        <span key={tag} className={styles.chip}>
          {tag}
          <button type="button" onClick={() => remove(tag)}><X size={10} /></button>
        </span>
      ))}
      <input
        className={styles.tagInlineInput}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={onKey}
        onBlur={add}
        placeholder={tags.length === 0 ? "Type a tag, press Enter…" : ""}
      />
    </div>
  );
}

/* ── New category inline ─────────────────────────────────────────────── */

function NewCategoryInline({ onCreated }: { onCreated: (cat: CategoryOption) => void }) {
  const [open, setOpen]  = useState(false);
  const [name, setName]  = useState("");
  const [busy, setBusy]  = useState(false);
  const [err,  setErr]   = useState("");

  const submit = async () => {
    if (!name.trim()) { setErr("Name is required."); return; }
    setBusy(true); setErr("");
    try {
      const res  = await fetch("/api/admin/projects/categories", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim() }),
      });
      const data = await res.json() as CategoryOption & { error?: string };
      if (!res.ok) { setErr(data.error ?? "Failed."); return; }
      onCreated(data);
      setName(""); setOpen(false);
    } finally { setBusy(false); }
  };

  if (!open) {
    return (
      <button type="button" className={styles.newCatBtn} onClick={() => setOpen(true)}>
        <Plus size={11} /> New category
      </button>
    );
  }

  return (
    <div className={styles.newCatRow}>
      <input
        className={`${styles.input} ${styles.newCatInput}`}
        placeholder="Category name…"
        value={name}
        onChange={(e) => setName(e.target.value)}
        onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); submit(); } }}
        autoFocus
      />
      <button type="button" className={styles.newCatSave} onClick={submit} disabled={busy}>
        {busy ? "…" : "Add"}
      </button>
      <button type="button" className={styles.newCatCancel} onClick={() => setOpen(false)}>
        ✕
      </button>
      {err && <span className={styles.hint} style={{ color: "var(--color-error)" }}>{err}</span>}
    </div>
  );
}

/* ── Main form ───────────────────────────────────────────────────────── */

interface Props {
  mode:       "new" | "edit";
  form:       ProjectFormData;
  saving:     boolean;
  error?:     string;
  categories: CategoryOption[];
  onCategoryCreated: (cat: CategoryOption) => void;
  onChange:   (key: keyof ProjectFormData, value: ProjectFormData[keyof ProjectFormData]) => void;
  onSave:     () => void;
}

export default function ProjectForm({
  mode, form, saving, error, categories, onCategoryCreated, onChange, onSave,
}: Props) {
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [hrefEdited, setHrefEdited] = useState(false);

  // Auto-fill canonical path if user hasn't touched it yet
  useState(() => {
    // If we have an existing href, mark as edited so we don't overwrite it
    if (form.href) {
      setHrefEdited(true);
    }
  });

  const slugify = (s: string) =>
    s.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    onChange("title", val);
    if (mode === "new" && !hrefEdited) {
      onChange("href", `/projects/${slugify(val)}`);
    }
  };

  const str  = (key: keyof ProjectFormData) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      onChange(key, e.target.value);

  const toggle = (key: "featured" | "published") => () => onChange(key, !form[key]);

  return (
    <div className={styles.shell}>

      {/* ── TOPBAR ── */}
      <header className={styles.topBar}>
        <div className={styles.topBarLeft}>
          <Link href="/admin/projects" className={styles.backBtn}>
            <ArrowLeft size={14} /> Projects
          </Link>
          <ChevronRight size={12} className={styles.breadSep} />
          <span className={styles.topBarTitle}>
            {mode === "new" ? "New Project" : "Edit Project"}
          </span>
        </div>
        <div className={styles.topBarRight}>
          <Link href="/admin/projects" className={styles.cancelBtn}>Cancel</Link>
          <button className={styles.saveBtn} onClick={onSave} disabled={saving}>
            {saving
              ? <><RefreshCw size={13} className={styles.spinSm} /> Saving…</>
              : mode === "new" ? "Add Project" : "Save Changes"}
          </button>
        </div>
      </header>

      {/* ── UNIFIED BODY ── */}
      <div className={styles.body} style={{ display: "block", maxWidth: "800px" }}>
        
        {error && (
          <div className={styles.errorBanner} style={{ marginBottom: "20px" }}>
            <AlertCircle size={14} /> {error}
          </div>
        )}

        <div className={styles.mainCard} style={{ border: "1px solid var(--border-default)" }}>
          
          {/* 1. cover image banner at top */}
          <div className={styles.section} style={{ padding: "24px 32px" }}>
            <div className={styles.field}>
              <label className={styles.label}>Cover Image</label>
              <ImageUpload
                value={form.imageUrl || ""}
                onChange={(url) => onChange("imageUrl", url)}
                label="Upload Cover Image"
              />
            </div>
          </div>

          {/* 2. Core Metadata Details */}
          <section className={styles.section}>
            <header className={styles.sectionHead}>
              <span className={styles.sectionNum}>01</span>
              <span className={styles.sectionName}>Core Information</span>
            </header>
            
            <div className={styles.row}>
              {/* Left column */}
              <div className={styles.fields}>
                <div className={styles.field}>
                  <label className={styles.label}>
                    Title <span className={styles.req}>*</span>
                  </label>
                  <input
                    className={styles.input}
                    value={form.title || ""}
                    onChange={handleTitleChange}
                    placeholder="e.g. Himalayan Weather Station Network"
                  />
                </div>

                <div className={styles.field}>
                  <label className={styles.label}>
                    Category <span className={styles.req}>*</span>
                  </label>
                  {categories.length === 0 ? (
                    <p className={styles.hint}>No categories yet — create one below.</p>
                  ) : (
                    <select
                      className={styles.select}
                      value={form.categoryId || ""}
                      onChange={(e) => onChange("categoryId", e.target.value)}
                    >
                      <option value="">— Select —</option>
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  )}
                  <NewCategoryInline onCreated={(cat) => {
                    onCategoryCreated(cat);
                    onChange("categoryId", cat.id);
                  }} />
                </div>

                <div className={styles.field}>
                  <label className={styles.label}>
                    Project Status <span className={styles.req}>*</span>
                  </label>
                  <select
                    className={styles.select}
                    value={form.status || "planned"}
                    onChange={(e) => onChange("status", e.target.value as ProjectStatus)}
                  >
                    <option value="planned">Planned / Upcoming</option>
                    <option value="active">Active / Ongoing</option>
                    <option value="completed">Completed / Archival</option>
                    <option value="on_hold">On Hold</option>
                  </select>
                </div>
              </div>

              {/* Right column: Description */}
              <div className={styles.field}>
                <label className={styles.label}>
                  Description <span className={styles.req}>*</span>
                </label>
                <textarea
                  className={styles.textarea}
                  value={form.description || ""}
                  onChange={str("description")}
                  placeholder="Detail the atmospheric studies, cosmic ray flux detection, hardware assemblies, or educational outreach objectives..."
                  style={{ height: "100%", minHeight: "186px", resize: "none" }}
                />
              </div>
            </div>

          </section>

          {/* 3. Progressive Disclosure Collapsible Section */}
          <section className={styles.section} style={{ background: "rgba(255, 255, 255, 0.015)" }}>
            <button
              type="button"
              onClick={() => setAdvancedOpen(!advancedOpen)}
              style={{
                display: "flex",
                width: "100%",
                alignItems: "center",
                justifyContent: "space-between",
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: "4px 0",
                color: "var(--text-primary)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <Settings size={16} style={{ color: "var(--color-brand-gold)" }} />
                <span className={styles.sectionName} style={{ margin: 0, textTransform: "none", letterSpacing: "0", fontSize: "14px", fontWeight: "700" }}>
                  Advanced Settings &amp; Extra Details
                </span>
              </div>
              <ChevronDown
                size={16}
                style={{
                  transition: "transform 0.25s ease",
                  transform: advancedOpen ? "rotate(180deg)" : "rotate(0deg)",
                  color: "var(--text-muted)"
                }}
              />
            </button>

            {advancedOpen && (
              <div style={{ marginTop: "24px", animation: "fadeIn 0.2s ease-out" }}>
                <div className={styles.row}>
                  {/* Left: Timeline, URL, Phase, Target & Tags */}
                  <div className={styles.fields}>
                    <div className={styles.row}>
                      <div className={styles.field}>
                        <label className={styles.label}>
                          Timeline Period <span className={styles.req}>*</span>
                        </label>
                        <input
                          className={styles.input}
                          value={form.period || ""}
                          onChange={str("period")}
                          placeholder="e.g. 2023 – present"
                        />
                      </div>

                      <div className={styles.field}>
                        <label className={styles.label}>
                          Canonical URL Path <span className={styles.req}>*</span>
                        </label>
                        <input
                          className={styles.input}
                          value={form.href || ""}
                          onChange={(e) => {
                            setHrefEdited(true);
                            onChange("href", e.target.value);
                          }}
                          placeholder="e.g. /projects/himalayan-weather-network"
                        />
                      </div>
                    </div>

                    <div className={styles.row}>
                      <div className={styles.field}>
                        <label className={styles.label}>Development Phase</label>
                        <input
                          className={styles.input}
                          value={form.phase || ""}
                          onChange={str("phase")}
                          placeholder="e.g. Field Survey, Instrument Design"
                        />
                      </div>

                      <div className={styles.field}>
                        <label className={styles.label}>Launch Target Window</label>
                        <input
                          className={styles.input}
                          value={form.launchTarget || ""}
                          onChange={str("launchTarget")}
                          placeholder="e.g. Mid 2026, Q1 2027"
                        />
                      </div>
                    </div>

                    <div className={styles.field}>
                      <label className={styles.label}>Classification Tags</label>
                      <TagInput tags={form.tags || []} onChange={(v) => onChange("tags", v)} />
                      <span className={styles.hint}>Press Enter or comma to register tags</span>
                    </div>
                  </div>

                  {/* Right: Outcome */}
                  <div className={styles.field}>
                    <label className={styles.label}>Project Outcomes / Impact</label>
                    <textarea
                      className={styles.textarea}
                      value={form.outcome || ""}
                      onChange={str("outcome")}
                      placeholder="Summarize flights reached, datasets open-published, or student counts reached..."
                      style={{ height: "100%", minHeight: "186px", resize: "none" }}
                    />
                  </div>
                </div>
              </div>
            )}
          </section>

          {/* 4. Toggles Footer */}
          <div style={{ display: "flex", gap: "28px", padding: "24px 32px", borderTop: "1px dashed var(--border-default)", background: "rgba(255, 255, 255, 0.01)" }}>
            <label className={styles.toggleLabel} style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer", userSelect: "none" }}>
              <input
                type="checkbox"
                checked={form.published}
                onChange={toggle("published")}
                style={{ width: "18px", height: "18px", accentColor: "var(--color-brand-gold)" }}
              />
              <span className={styles.toggleText}>
                <strong>Visible on live site</strong>
              </span>
            </label>

            <label className={styles.toggleLabel} style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer", userSelect: "none" }}>
              <input
                type="checkbox"
                checked={form.featured}
                onChange={toggle("featured")}
                style={{ width: "18px", height: "18px", accentColor: "var(--color-brand-gold)" }}
              />
              <span className={styles.toggleText}>
                <strong>Featured Highlight</strong>
              </span>
            </label>
          </div>

        </div>
      </div>
    </div>
  );
}
