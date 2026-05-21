"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft, ChevronRight, RefreshCw,
  X, Plus, AlertCircle,
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

/* ── Toggle switch ───────────────────────────────────────────────────── */

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
  const str  = (key: keyof ProjectFormData) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      onChange(key, e.target.value);
  const bool = (key: "featured" | "published") => () => onChange(key, !form[key]);

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

      {/* ── 2-COL BODY ── */}
      <div className={styles.body}>

        {/* LEFT: MAIN CONTENT */}
        <div className={styles.main}>
          {error && (
            <div className={styles.errorBanner}>
              <AlertCircle size={14} /> {error}
            </div>
          )}

          <div className={styles.mainCard}>

            {/* 01 · Core */}
            <section className={styles.section}>
              <header className={styles.sectionHead}>
                <span className={styles.sectionNum}>01</span>
                <span className={styles.sectionName}>Core</span>
              </header>
              <div className={styles.fields}>
                <div className={styles.field}>
                  <label className={styles.label}>
                    Title <span className={styles.req}>*</span>
                  </label>
                  <input className={styles.input} value={form.title}
                    onChange={str("title")} placeholder="Project title" />
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>
                    Description <span className={styles.req}>*</span>
                  </label>
                  <textarea className={`${styles.textarea} ${styles.lg}`}
                    value={form.description} onChange={str("description")}
                    placeholder="What this project is about…" />
                </div>
              </div>
            </section>

            {/* 02 · Timeline */}
            <section className={styles.section}>
              <header className={styles.sectionHead}>
                <span className={styles.sectionNum}>02</span>
                <span className={styles.sectionName}>Timeline &amp; Phase</span>
              </header>
              <div className={styles.fields}>
                <div className={styles.field}>
                  <label className={styles.label}>
                    Period <span className={styles.req}>*</span>
                  </label>
                  <input className={styles.input} value={form.period}
                    onChange={str("period")} placeholder="e.g. 2024–2025 or Ongoing" />
                </div>
                <div className={styles.row}>
                  <div className={styles.field}>
                    <label className={styles.label}>Phase</label>
                    <input className={styles.input} value={form.phase}
                      onChange={str("phase")} placeholder="e.g. Alpha, Beta, Launch" />
                  </div>
                  <div className={styles.field}>
                    <label className={styles.label}>Launch Target</label>
                    <input className={styles.input} value={form.launchTarget}
                      onChange={str("launchTarget")} placeholder="e.g. Q3 2025" />
                  </div>
                </div>
              </div>
            </section>

            {/* 03 · Links & Media */}
            <section className={styles.section}>
              <header className={styles.sectionHead}>
                <span className={styles.sectionNum}>03</span>
                <span className={styles.sectionName}>Links &amp; Media</span>
              </header>
              <div className={styles.fields}>
                <div className={styles.field}>
                  <label className={styles.label}>
                    Project URL <span className={styles.req}>*</span>
                  </label>
                  <input className={styles.input} value={form.href}
                    onChange={str("href")} placeholder="/projects/my-project or https://…" />
                  <span className={styles.hint}>Canonical link on the public site</span>
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>Cover Image</label>
                  <ImageUpload
                    value={form.imageUrl}
                    onChange={(url) => onChange("imageUrl", url)}
                    label="Upload Cover Image"
                  />
                </div>
              </div>
            </section>

            {/* 04 · Outcome */}
            <section className={styles.section}>
              <header className={styles.sectionHead}>
                <span className={styles.sectionNum}>04</span>
                <span className={styles.sectionName}>Outcome &amp; Details</span>
              </header>
              <div className={styles.fields}>
                <div className={styles.field}>
                  <label className={styles.label}>Outcome</label>
                  <textarea className={styles.textarea} value={form.outcome}
                    onChange={str("outcome")}
                    placeholder="What was / is expected to be achieved…" />
                </div>
              </div>
            </section>

          </div>
        </div>

        {/* RIGHT: SIDEBAR */}
        <aside className={styles.sidebar}>

          {/* VISIBILITY */}
          <div className={styles.card}>
            <p className={styles.cardTitle}>Visibility</p>
            <div className={styles.toggleItem}>
              <div>
                <div className={styles.toggleLabel}>Publicly Visible</div>
                <div className={styles.toggleSub}>Show on the public site</div>
              </div>
              <Toggle on={form.published} onChange={bool("published")} />
            </div>
            <div className={styles.toggleDivider} />
            <div className={styles.toggleItem}>
              <div>
                <div className={styles.toggleLabel}>Featured</div>
                <div className={styles.toggleSub}>Highlight on projects page</div>
              </div>
              <Toggle on={form.featured} onChange={bool("featured")} />
            </div>
          </div>

          {/* SETTINGS */}
          <div className={styles.card}>
            <p className={styles.cardTitle}>Settings</p>
            <div className={styles.field}>
              <label className={styles.label}>
                Status <span className={styles.req}>*</span>
              </label>
              <select className={styles.select} value={form.status}
                onChange={(e) => onChange("status", e.target.value as ProjectStatus)}>
                <option value="planned">Planned</option>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
                <option value="on_hold">On Hold</option>
              </select>
            </div>
            <div className={styles.field}>
              <label className={styles.label}>
                Category <span className={styles.req}>*</span>
              </label>
              {categories.length === 0 ? (
                <p className={styles.hint}>No categories yet — create one below.</p>
              ) : (
                <select className={styles.select} value={form.categoryId}
                  onChange={(e) => onChange("categoryId", e.target.value)}>
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
          </div>

          {/* TAGS */}
          <div className={styles.card}>
            <p className={styles.cardTitle}>
              Tags
              {form.tags.length > 0 && (
                <span className={styles.cardCount}>{form.tags.length}</span>
              )}
            </p>
            <TagInput tags={form.tags} onChange={(v) => onChange("tags", v)} />
            <span className={styles.hint}>Press Enter or comma to add a tag</span>
          </div>

        </aside>
      </div>
    </div>
  );
}
