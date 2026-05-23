"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft, ChevronRight, RefreshCw,
  Upload, X, ExternalLink, Github, Database, AlertCircle,
} from "lucide-react";
import styles from "./form.module.css";
import MarkdownEditor from "./MarkdownEditor";
import ImageUpload from "@/components/ui/ImageUpload";

/* ── Types & constants ───────────────────────────────────────────────── */

export type PaperType         = "journal" | "conference" | "preprint" | "report";
export type PublicationStatus = "draft" | "under_review" | "accepted" | "published";

export const DISCIPLINES = [
  "Astrophysics", "Atmospheric Physics", "Astrodynamics",
  "Cosmology", "Data Science", "Gravitational Physics",
  "Instrumentation", "Mathematics", "Meteor Science",
  "Observational Astronomy", "Physics", "Planetary Science",
  "Space Education", "Space Weather", "Stellar Physics",
];

export interface UserOption { id: string; name: string; email: string; }

export type PaperFormData = {
  title:                string;
  abstract:             string;
  type:                 PaperType;
  publicationStatus:    PublicationStatus;
  authors:              string;
  internalContributors: string[];
  journal:              string;
  publicationDate:      string;
  doi:                  string;
  arxiv:                string;
  disciplines:          string[];
  pdfUrl:               string;
  externalUrl:          string;
  githubUrl:            string;
  datasetUrl:           string;
  featured:             boolean;
  published:            boolean;
  isPremium:            boolean;
  content:              string;
};

export const BLANK_FORM: PaperFormData = {
  title: "", abstract: "", type: "journal",
  publicationStatus: "draft", authors: "",
  internalContributors: [], journal: "",
  publicationDate: "", doi: "", arxiv: "",
  disciplines: [], pdfUrl: "", externalUrl: "",
  githubUrl: "", datasetUrl: "",
  featured: false, published: true, isPremium: false, content: "",
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

/* ── Tag picker (disciplines) ────────────────────────────────────────── */

function TagPicker({
  selected, options, onChange,
}: {
  selected: string[]; options: string[];
  onChange: (next: string[]) => void;
}) {
  const toggle = (tag: string) =>
    onChange(selected.includes(tag)
      ? selected.filter((t) => t !== tag)
      : [...selected, tag]);

  return (
    <div className={styles.tagGrid}>
      {options.map((tag) => (
        <button key={tag} type="button"
          onClick={() => toggle(tag)}
          className={`${styles.tagChip} ${selected.includes(tag) ? styles.tagChipOn : ""}`}
        >
          {tag}
        </button>
      ))}
    </div>
  );
}

/* ── User picker ─────────────────────────────────────────────────────── */

function UserPicker({
  selected, users, onChange,
}: {
  selected: string[]; users: UserOption[];
  onChange: (next: string[]) => void;
}) {
  const [q, setQ] = useState("");
  const toggle = (id: string) =>
    onChange(selected.includes(id)
      ? selected.filter((u) => u !== id)
      : [...selected, id]);

  const filtered = users.filter(
    (u) => u.name.toLowerCase().includes(q.toLowerCase()) ||
           u.email.toLowerCase().includes(q.toLowerCase())
  );

  return (
    <div className={styles.userPicker}>
      <input className={styles.input} placeholder="Search team members…"
        value={q} onChange={(e) => setQ(e.target.value)} />
      <div className={styles.userList}>
        {filtered.length === 0
          ? <p className={styles.userEmpty}>No team members found.</p>
          : filtered.map((u) => {
              const checked = selected.includes(u.id);
              return (
                <label key={u.id} className={`${styles.userRow} ${checked ? styles.userRowOn : ""}`}>
                  <input type="checkbox" checked={checked}
                    onChange={() => toggle(u.id)} className={styles.userCheck} />
                  <div className={styles.userAvatar}>{u.name[0]?.toUpperCase()}</div>
                  <div>
                    <div className={styles.userName}>{u.name}</div>
                    <div className={styles.userEmail}>{u.email}</div>
                  </div>
                </label>
              );
            })}
      </div>
      {selected.length > 0 && (
        <div className={styles.chipRow}>
          {selected.map((id) => {
            const u = users.find((x) => x.id === id);
            return u ? (
              <span key={id} className={styles.chip}>
                {u.name}
                <button type="button" onClick={() => toggle(id)}><X size={10} /></button>
              </span>
            ) : null;
          })}
        </div>
      )}
    </div>
  );
}


/* ── Main form ───────────────────────────────────────────────────────── */

interface Props {
  mode:    "new" | "edit";
  form:    PaperFormData;
  saving:  boolean;
  error?:  string;
  users:   UserOption[];
  onChange: (key: keyof PaperFormData, value: PaperFormData[keyof PaperFormData]) => void;
  onSave:  () => void;
}

export default function PaperForm({ mode, form, saving, error, users, onChange, onSave }: Props) {
  const str  = (key: keyof PaperFormData) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      onChange(key, e.target.value);
  const bool = (key: "featured" | "published" | "isPremium") => () => onChange(key, !form[key]);

  return (
    <div className={styles.shell}>

      {/* ── TOPBAR ── */}
      <header className={styles.topBar}>
        <div className={styles.topBarLeft}>
          <Link href="/admin/papers" className={styles.backBtn}>
            <ArrowLeft size={14} /> Research Papers
          </Link>
          <ChevronRight size={12} className={styles.breadSep} />
          <span className={styles.topBarTitle}>
            {mode === "new" ? "New Research Paper" : "Edit Research Paper"}
          </span>
        </div>
        <div className={styles.topBarRight}>
          <Link href="/admin/papers" className={styles.cancelBtn}>Cancel</Link>
          <button className={styles.saveBtn} onClick={onSave} disabled={saving}>
            {saving
              ? <><RefreshCw size={13} className={styles.spinSm} /> Saving…</>
              : mode === "new" ? "Add Research Paper" : "Save Changes"}
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

            {/* 1. Cover Image Banner */}
            <div className={styles.section} style={{ padding: "24px 32px" }}>
              <div className={styles.field}>
                <label className={styles.label}>Cover Image</label>
                <ImageUpload
                  value={form.pdfUrl}
                  onChange={(v) => onChange("pdfUrl", v)}
                  label="Upload Cover Image"
                />
              </div>
            </div>

            {/* 2. Document Content Redesign */}
            <section className={styles.section}>
              <header className={styles.sectionHead}>
                <span className={styles.sectionNum}>01</span>
                <span className={styles.sectionName}>Document Content</span>
              </header>
              <div className={styles.fields}>
                <div className={styles.field}>
                  <label className={styles.label}>
                    Research Paper Title <span className={styles.req}>*</span>
                  </label>
                  <input
                    className={styles.input}
                    value={form.title}
                    onChange={str("title")}
                    placeholder="Full research paper title..."
                    style={{ fontSize: "16px", fontWeight: "600", padding: "12px 16px" }}
                  />
                </div>

                <div className={styles.field} style={{ marginTop: "8px" }}>
                  <label className={styles.label}>
                    Abstract / Summary <span className={styles.req}>*</span>
                  </label>
                  <textarea
                    className={`${styles.textarea} ${styles.lg}`}
                    value={form.abstract}
                    onChange={str("abstract")}
                    placeholder="Provide a concise academic abstract outlining the methodology, findings, and conclusions of the paper..."
                    style={{ minHeight: "148px", resize: "none", fontSize: "14px", lineHeight: "1.6" }}
                  />
                </div>

                <div className={styles.field} style={{ marginTop: "14px" }}>
                  <label className={styles.label}>Paper Body Content</label>
                  <span className={styles.hint} style={{ marginBottom: 10 }}>
                    Write the complete research paper body using Markdown. Supports headers, figures, bullet points, citations, and standard math symbols.
                  </span>
                  <MarkdownEditor
                    value={form.content}
                    onChange={(v) => onChange("content", v)}
                    placeholder={"# Introduction\n\nWrite your introduction here...\n\n## Methodology\n\n## Results\n\n## Discussion\n\n## Conclusion\n\n## References\n\n1. Author, A. (Year). Title. *Journal*, vol(issue), pp."}
                  />
                </div>
              </div>
            </section>

            {/* 3. Authors & Contributions */}
            <section className={styles.section}>
              <header className={styles.sectionHead}>
                <span className={styles.sectionNum}>02</span>
                <span className={styles.sectionName}>Authors &amp; Contributors</span>
              </header>
              <div className={styles.fields}>
                <div className={styles.field}>
                  <label className={styles.label}>
                    External Author List <span className={styles.req}>*</span>
                  </label>
                  <textarea
                    className={styles.textarea}
                    value={form.authors}
                    onChange={str("authors")}
                    placeholder={"Dr. Abhishek Rijal\nProf. Jay Prakash Sharma\nNira Upadhyay"}
                    style={{ minHeight: "90px", resize: "none" }}
                  />
                  <span className={styles.hint}>One external author name per line — include all co-authors.</span>
                </div>

                <div className={styles.field} style={{ marginTop: "12px" }}>
                  <label className={styles.label}>EKA Internal Contributors</label>
                  <span className={styles.hint} style={{ marginBottom: 8 }}>
                    Select existing Eka Research team members who co-authored or contributed to this work:
                  </span>
                  <UserPicker
                    selected={form.internalContributors}
                    users={users}
                    onChange={(v) => onChange("internalContributors", v)}
                  />
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
                <div className={styles.toggleSub}>Highlight on research page</div>
              </div>
              <Toggle on={form.featured} onChange={bool("featured")} />
            </div>
            <div className={styles.toggleDivider} />
            <div className={styles.toggleItem}>
              <div>
                <div className={styles.toggleLabel} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ fontSize: 13 }}>👑</span> Premium Only
                </div>
                <div className={styles.toggleSub}>Restrict full access to paid members</div>
              </div>
              <Toggle on={form.isPremium} onChange={bool("isPremium")} />
            </div>
          </div>

          {/* CLASSIFICATION */}
          <div className={styles.card}>
            <p className={styles.cardTitle}>Classification</p>
            <div className={styles.field}>
              <label className={styles.label}>
                Paper Type <span className={styles.req}>*</span>
              </label>
              <select className={styles.select} value={form.type}
                onChange={(e) => onChange("type", e.target.value as PaperType)}>
                <option value="journal">Journal Article</option>
                <option value="conference">Conference Paper</option>
                <option value="preprint">Preprint</option>
                <option value="report">Report</option>
              </select>
            </div>
            <div className={styles.field}>
              <label className={styles.label}>
                Publication Status <span className={styles.req}>*</span>
              </label>
              <select className={styles.select} value={form.publicationStatus}
                onChange={(e) => onChange("publicationStatus", e.target.value as PublicationStatus)}>
                <option value="draft">Draft</option>
                <option value="under_review">Under Review</option>
                <option value="accepted">Accepted</option>
                <option value="published">Published</option>
              </select>
            </div>
          </div>

          {/* PUBLICATION DETAILS */}
          <div className={styles.card}>
            <p className={styles.cardTitle}>Publication details</p>
            <div className={styles.field}>
              <label className={styles.label}>Journal / Venue</label>
              <input
                className={styles.input}
                value={form.journal}
                onChange={str("journal")}
                placeholder="e.g. Nature Astronomy, arXiv"
              />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>
                Publication Date <span className={styles.req}>*</span>
              </label>
              <input
                className={styles.input}
                value={form.publicationDate}
                onChange={str("publicationDate")}
                placeholder="e.g. 2026-04-18"
              />
              <span className={styles.hint}>Year is derived automatically</span>
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Digital Object Identifier (DOI)</label>
              <input
                className={styles.input}
                value={form.doi}
                onChange={str("doi")}
                placeholder="e.g. 10.1038/s41550..."
              />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>arXiv Identifier</label>
              <input
                className={styles.input}
                value={form.arxiv}
                onChange={str("arxiv")}
                placeholder="e.g. 2604.12345"
              />
            </div>
          </div>

          {/* EXTERNAL REFERENCES */}
          <div className={styles.card}>
            <p className={styles.cardTitle}>External references</p>
            <div className={styles.field}>
              <label className={styles.label}>External Paper URL</label>
              <input
                className={styles.input}
                value={form.externalUrl}
                onChange={str("externalUrl")}
                placeholder="https://researchgate.net/..."
              />
              <span className={styles.hint}>Publisher link, ResearchGate, etc.</span>
            </div>
            <div className={styles.field}>
              <label className={styles.label}>GitHub Repository</label>
              <input
                className={styles.input}
                value={form.githubUrl}
                onChange={str("githubUrl")}
                placeholder="https://github.com/..."
              />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Zenodo / Dataset URL</label>
              <input
                className={styles.input}
                value={form.datasetUrl}
                onChange={str("datasetUrl")}
                placeholder="https://zenodo.org/..."
              />
            </div>
          </div>

          {/* DISCIPLINES */}
          <div className={styles.card}>
            <p className={styles.cardTitle}>
              Disciplines
              {form.disciplines.length > 0 && (
                <span className={styles.cardCount}>{form.disciplines.length}</span>
              )}
            </p>
            <TagPicker selected={form.disciplines} options={DISCIPLINES}
              onChange={(v) => onChange("disciplines", v)} />
          </div>

        </aside>
      </div>
    </div>
  );
}
