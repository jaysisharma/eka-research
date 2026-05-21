"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft, ChevronRight, RefreshCw,
  Upload, X, ExternalLink, Github, Database, AlertCircle,
} from "lucide-react";
import styles from "./form.module.css";
import MarkdownEditor from "./MarkdownEditor";

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

/* ── PDF upload ──────────────────────────────────────────────────────── */

function PdfUpload({ value, onChange }: { value: string; onChange: (url: string) => void }) {
  const inputRef    = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadErr, setUploadErr] = useState("");

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadErr(""); setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res  = await fetch("/api/admin/upload", { method: "POST", body: fd });
      const data = await res.json() as { url?: string; error?: string };
      if (!res.ok) { setUploadErr(data.error ?? "Upload failed."); return; }
      onChange(data.url ?? "");
    } finally { setUploading(false); }
  };

  if (value) {
    return (
      <div className={styles.pdfPreview}>
        <span className={styles.pdfName}>{value.split("/").pop()}</span>
        <a href={value} target="_blank" rel="noopener noreferrer" className={styles.pdfView}>
          <ExternalLink size={11} /> View
        </a>
        <button type="button" className={styles.pdfRemove} onClick={() => onChange("")}>
          <X size={11} /> Remove
        </button>
      </div>
    );
  }

  return (
    <div>
      <input ref={inputRef} type="file" accept=".pdf" className={styles.fileHidden} onChange={handleFile} />
      <button type="button" className={styles.uploadBtn}
        onClick={() => inputRef.current?.click()} disabled={uploading}>
        <Upload size={14} />
        {uploading ? "Uploading…" : "Choose PDF — max 20 MB"}
      </button>
      {uploadErr && <p className={styles.uploadErr}>{uploadErr}</p>}
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
            <ArrowLeft size={14} /> Papers
          </Link>
          <ChevronRight size={12} className={styles.breadSep} />
          <span className={styles.topBarTitle}>
            {mode === "new" ? "New Paper" : "Edit Paper"}
          </span>
        </div>
        <div className={styles.topBarRight}>
          <Link href="/admin/papers" className={styles.cancelBtn}>Cancel</Link>
          <button className={styles.saveBtn} onClick={onSave} disabled={saving}>
            {saving
              ? <><RefreshCw size={13} className={styles.spinSm} /> Saving…</>
              : mode === "new" ? "Add Paper" : "Save Changes"}
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
                    onChange={str("title")} placeholder="Full paper title" />
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>
                    Abstract <span className={styles.req}>*</span>
                  </label>
                  <textarea className={`${styles.textarea} ${styles.lg}`}
                    value={form.abstract} onChange={str("abstract")}
                    placeholder="Paper abstract…" />
                </div>
              </div>
            </section>

            {/* 02 · Authors */}
            <section className={styles.section}>
              <header className={styles.sectionHead}>
                <span className={styles.sectionNum}>02</span>
                <span className={styles.sectionName}>Authors</span>
              </header>
              <div className={styles.fields}>
                <div className={styles.field}>
                  <label className={styles.label}>
                    Author List <span className={styles.req}>*</span>
                  </label>
                  <textarea className={styles.textarea} value={form.authors}
                    onChange={str("authors")}
                    placeholder={"Rima Sharma\nAnil KC\nPriya Thapa"} />
                  <span className={styles.hint}>One name per line — include all authors</span>
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>Internal Contributors</label>
                  <span className={styles.hint} style={{ marginBottom: 8 }}>
                    EKA team members who contributed
                  </span>
                  <UserPicker selected={form.internalContributors} users={users}
                    onChange={(v) => onChange("internalContributors", v)} />
                </div>
              </div>
            </section>

            {/* 03 · Publication */}
            <section className={styles.section}>
              <header className={styles.sectionHead}>
                <span className={styles.sectionNum}>03</span>
                <span className={styles.sectionName}>Publication</span>
              </header>
              <div className={styles.fields}>
                <div className={styles.row}>
                  <div className={styles.field}>
                    <label className={styles.label}>Journal / Venue</label>
                    <input className={styles.input} value={form.journal}
                      onChange={str("journal")} placeholder="e.g. Icarus, arXiv" />
                  </div>
                  <div className={styles.field}>
                    <label className={styles.label}>
                      Publication Date <span className={styles.req}>*</span>
                    </label>
                    <input className={styles.input} value={form.publicationDate}
                      onChange={str("publicationDate")} placeholder="e.g. 2024-03-15" />
                    <span className={styles.hint}>Year is derived automatically</span>
                  </div>
                </div>
                <div className={styles.row}>
                  <div className={styles.field}>
                    <label className={styles.label}>DOI</label>
                    <input className={styles.input} value={form.doi}
                      onChange={str("doi")} placeholder="10.xxxx/xxxxx" />
                  </div>
                  <div className={styles.field}>
                    <label className={styles.label}>arXiv ID</label>
                    <input className={styles.input} value={form.arxiv}
                      onChange={str("arxiv")} placeholder="2401.12345" />
                  </div>
                </div>
              </div>
            </section>

            {/* 04 · Files & Links */}
            <section className={styles.section}>
              <header className={styles.sectionHead}>
                <span className={styles.sectionNum}>04</span>
                <span className={styles.sectionName}>Files &amp; Links</span>
              </header>
              <div className={styles.fields}>
                <div className={styles.field}>
                  <label className={styles.label}>Upload PDF</label>
                  <PdfUpload value={form.pdfUrl} onChange={(v) => onChange("pdfUrl", v)} />
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>
                    <ExternalLink size={11} style={{ display: "inline" }} /> External Paper URL
                  </label>
                  <input className={styles.input} value={form.externalUrl}
                    onChange={str("externalUrl")} placeholder="https://…" />
                  <span className={styles.hint}>Publisher link, ResearchGate, etc.</span>
                </div>
                <div className={styles.row}>
                  <div className={styles.field}>
                    <label className={styles.label}>
                      <Github size={11} style={{ display: "inline" }} /> GitHub Repository
                    </label>
                    <input className={styles.input} value={form.githubUrl}
                      onChange={str("githubUrl")} placeholder="https://github.com/…" />
                  </div>
                  <div className={styles.field}>
                    <label className={styles.label}>
                      <Database size={11} style={{ display: "inline" }} /> Dataset
                    </label>
                    <input className={styles.input} value={form.datasetUrl}
                      onChange={str("datasetUrl")} placeholder="https://zenodo.org/…" />
                  </div>
                </div>
              </div>
            </section>

            {/* 05 · Full Paper Content */}
            <section className={styles.section}>
              <header className={styles.sectionHead}>
                <span className={styles.sectionNum}>05</span>
                <span className={styles.sectionName}>Full Paper</span>
              </header>
              <div className={styles.fields}>
                <div className={styles.field}>
                  <label className={styles.label}>Paper Body</label>
                  <span className={styles.hint} style={{ marginBottom: 10 }}>
                    Write the complete paper using Markdown. Supports headings, lists, blockquotes, code, and links.
                    Use <strong>Ctrl+B</strong> / <strong>Ctrl+I</strong> for bold/italic.
                  </span>
                  <MarkdownEditor
                    value={form.content}
                    onChange={(v) => onChange("content", v)}
                    placeholder={"# Introduction\n\nWrite your introduction here...\n\n## Methodology\n\n## Results\n\n## Discussion\n\n## Conclusion\n\n## References\n\n1. Author, A. (Year). Title. *Journal*, vol(issue), pp."}
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
