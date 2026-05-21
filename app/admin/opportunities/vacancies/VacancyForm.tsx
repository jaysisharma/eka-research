"use client";

import Link from "next/link";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import styles from "./form.module.css";

export type VacancyType   = "FULL_TIME" | "PART_TIME" | "INTERNSHIP" | "VOLUNTEER";
export type VacancyStatus = "DRAFT" | "OPEN" | "CLOSED";

export interface VacancyFormData {
  title:       string;
  type:        VacancyType;
  department:  string;
  description: string;
  deadline:    string; // ISO date string or ""
  status:      VacancyStatus;
}

interface Props {
  mode:     "new" | "edit";
  form:     VacancyFormData;
  saving:   boolean;
  error:    string;
  onChange: (key: keyof VacancyFormData, value: VacancyFormData[keyof VacancyFormData]) => void;
  onSave:   () => void;
}

const TYPE_LABELS: Record<VacancyType, string> = {
  FULL_TIME:  "Full-time",
  PART_TIME:  "Part-time",
  INTERNSHIP: "Internship",
  VOLUNTEER:  "Volunteer",
};

const STATUS_META: Record<VacancyStatus, { label: string; cls: string }> = {
  DRAFT:  { label: "Draft",  cls: styles.chipDraft  },
  OPEN:   { label: "Open",   cls: styles.chipOpen   },
  CLOSED: { label: "Closed", cls: styles.chipClosed },
};

function Toggle({ on, onChange }: { on: boolean; onChange: () => void }) {
  return (
    <button type="button" role="switch" aria-checked={on}
      className={`${styles.switchTrack} ${on ? styles.switchOn : ""}`}
      onClick={onChange}>
      <span className={styles.switchKnob} />
    </button>
  );
}

export default function VacancyForm({ mode, form, saving, error, onChange, onSave }: Props) {
  const title = mode === "new" ? "New Vacancy" : "Edit Vacancy";

  return (
    <div className={styles.shell}>
      {/* TOP BAR */}
      <div className={styles.topBar}>
        <div className={styles.topBarLeft}>
          <Link href="/admin/opportunities/vacancies" className={styles.backBtn}>
            <ArrowLeft size={14} />
          </Link>
          <span className={styles.breadSep}>›</span>
          <span className={styles.topBarTitle}>{title}</span>
        </div>
        <div className={styles.topBarRight}>
          {error && <span className={styles.topBarError}>{error}</span>}
          <button className={styles.saveBtn} onClick={onSave} disabled={saving}>
            {saving ? <Loader2 size={14} className={styles.spin} /> : <Save size={14} />}
            {saving ? "Saving…" : "Save"}
          </button>
        </div>
      </div>

      {/* BODY */}
      <div className={styles.body}>
        {/* MAIN CARD */}
        <div className={styles.mainCard}>
          {/* SECTION 01 — Core */}
          <div className={styles.section}>
            <div className={styles.sectionHead}>
              <span className={styles.sectionNum}>01</span>
              <div>
                <div className={styles.sectionTitle}>Position Details</div>
                <div className={styles.sectionSub}>Title, department, and type of role</div>
              </div>
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Job Title <span className={styles.req}>*</span></label>
              <input className={styles.input}
                placeholder="e.g. Orbital Mechanics Research Intern"
                value={form.title}
                onChange={(e) => onChange("title", e.target.value)} />
            </div>

            <div className={styles.row2}>
              <div className={styles.field}>
                <label className={styles.label}>Department <span className={styles.req}>*</span></label>
                <input className={styles.input}
                  placeholder="e.g. Satellite Technology"
                  value={form.department}
                  onChange={(e) => onChange("department", e.target.value)} />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Employment Type</label>
                <select className={styles.select}
                  value={form.type}
                  onChange={(e) => onChange("type", e.target.value as VacancyType)}>
                  {(Object.keys(TYPE_LABELS) as VacancyType[]).map((t) => (
                    <option key={t} value={t}>{TYPE_LABELS[t]}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* SECTION 02 — Description */}
          <div className={styles.section}>
            <div className={styles.sectionHead}>
              <span className={styles.sectionNum}>02</span>
              <div>
                <div className={styles.sectionTitle}>Description</div>
                <div className={styles.sectionSub}>Role overview, responsibilities, and requirements</div>
              </div>
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Description <span className={styles.req}>*</span></label>
              <textarea className={`${styles.input} ${styles.textarea}`}
                rows={10}
                placeholder="Describe the role, responsibilities, required qualifications, and what the candidate will gain…"
                value={form.description}
                onChange={(e) => onChange("description", e.target.value)} />
            </div>
          </div>
        </div>

        {/* SIDEBAR */}
        <aside className={styles.sidebar}>
          {/* Status card */}
          <div className={styles.card}>
            <div className={styles.cardTitle}>Status</div>
            <div className={styles.statusChips}>
              {(["DRAFT", "OPEN", "CLOSED"] as VacancyStatus[]).map((s) => (
                <button key={s} type="button"
                  className={`${styles.statusChip} ${STATUS_META[s].cls} ${form.status === s ? styles.chipActive : ""}`}
                  onClick={() => onChange("status", s)}>
                  {STATUS_META[s].label}
                </button>
              ))}
            </div>
            <p className={styles.cardHint}>
              {form.status === "DRAFT"  && "Not visible to the public."}
              {form.status === "OPEN"   && "Accepting applications."}
              {form.status === "CLOSED" && "Position filled or no longer accepting."}
            </p>
          </div>

          {/* Deadline card */}
          <div className={styles.card}>
            <div className={styles.cardTitle}>Application Deadline</div>
            <input type="date" className={styles.input}
              value={form.deadline}
              onChange={(e) => onChange("deadline", e.target.value)} />
            <p className={styles.cardHint}>Leave blank for rolling applications.</p>
          </div>

          {/* Quick-publish toggle */}
          <div className={styles.card}>
            <div className={styles.cardRow}>
              <div>
                <div className={styles.cardTitle} style={{ marginBottom: 0 }}>Publish Now</div>
                <p className={styles.cardHint} style={{ margin: 0 }}>Set status to Open</p>
              </div>
              <Toggle
                on={form.status === "OPEN"}
                onChange={() => onChange("status", form.status === "OPEN" ? "DRAFT" : "OPEN")}
              />
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
