"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  RefreshCw, Plus, Save, Pencil, Trash2, X, Check, Loader2, Users,
} from "lucide-react";
import styles from "./page.module.css";

/* ── Types ───────────────────────────────────────────────────────────── */

interface Program {
  id:          string;
  description: string;
  duration:    string;
  structure:   string | null;
  nextCohort:  string | null;
  isOpen:      boolean;
  _count:      { applications: number };
}

interface Mentor {
  id:        string;
  name:      string;
  expertise: string;
  bio:       string | null;
  imageUrl:  string | null;
  linkedIn:  string | null;
  active:    boolean;
}

interface MentorDraft {
  name:      string;
  expertise: string;
  bio:       string;
  imageUrl:  string;
  linkedIn:  string;
  active:    boolean;
}

const BLANK_MENTOR: MentorDraft = {
  name: "", expertise: "", bio: "", imageUrl: "", linkedIn: "", active: true,
};

/* ── Toggle ──────────────────────────────────────────────────────────── */

function Toggle({ on, onChange }: { on: boolean; onChange: () => void }) {
  return (
    <button type="button" role="switch" aria-checked={on}
      className={`${styles.switchTrack} ${on ? styles.switchOn : ""}`}
      onClick={onChange}>
      <span className={styles.switchKnob} />
    </button>
  );
}

/* ── Page ────────────────────────────────────────────────────────────── */

export default function AdminMentoringPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [program,  setProgram]  = useState<Program | null>(null);
  const [mentors,  setMentors]  = useState<Mentor[]>([]);
  const [loading,  setLoading]  = useState(true);

  // program form state
  const [progForm,    setProgForm]    = useState({ description: "", duration: "", structure: "", nextCohort: "", isOpen: false });
  const [progSaving,  setProgSaving]  = useState(false);
  const [progError,   setProgError]   = useState("");
  const [progSuccess, setProgSuccess] = useState(false);

  // mentor add/edit state
  const [showMentorForm, setShowMentorForm] = useState(false);
  const [editingMentor,  setEditingMentor]  = useState<string | null>(null); // id or null = new
  const [mentorDraft,    setMentorDraft]    = useState<MentorDraft>(BLANK_MENTOR);
  const [mentorSaving,   setMentorSaving]   = useState(false);
  const [mentorError,    setMentorError]    = useState("");
  const [busy,           setBusy]           = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (status === "unauthenticated") router.push("/auth/login");
    else if (status === "authenticated" && session?.user?.role !== "ADMIN") router.push("/dashboard");
  }, [status, session, router]);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [progRes, mentRes] = await Promise.all([
        fetch("/api/admin/opportunities/mentoring"),
        fetch("/api/admin/opportunities/mentors"),
      ]);
      const prog = await progRes.json() as Program | null;
      const ment = await mentRes.json() as Mentor[];
      setProgram(prog);
      setMentors(Array.isArray(ment) ? ment : []);
      if (prog) {
        setProgForm({
          description: prog.description,
          duration:    prog.duration,
          structure:   prog.structure ?? "",
          nextCohort:  prog.nextCohort
            ? new Date(prog.nextCohort).toISOString().slice(0, 10)
            : "",
          isOpen: prog.isOpen,
        });
      }
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchAll(); }, []);

  /* ── Program save ── */
  const saveProgram = async () => {
    setProgError(""); setProgSuccess(false);
    if (!progForm.description.trim()) { setProgError("Description is required."); return; }
    if (!progForm.duration.trim())    { setProgError("Duration is required.");    return; }

    setProgSaving(true);
    try {
      const method = program ? "PATCH" : "POST";
      const res = await fetch("/api/admin/opportunities/mentoring", {
        method, headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...progForm,
          nextCohort: progForm.nextCohort || null,
        }),
      });
      if (!res.ok) {
        const d = await res.json() as { error?: string };
        setProgError(d.error ?? "Save failed."); return;
      }
      const updated = await res.json() as Program;
      setProgram(updated);
      setProgSuccess(true);
      setTimeout(() => setProgSuccess(false), 2500);
    } finally { setProgSaving(false); }
  };

  /* ── Mentor add / edit ── */
  const openNewMentor = () => {
    setEditingMentor(null);
    setMentorDraft(BLANK_MENTOR);
    setMentorError("");
    setShowMentorForm(true);
  };

  const openEditMentor = (m: Mentor) => {
    setEditingMentor(m.id);
    setMentorDraft({
      name: m.name, expertise: m.expertise,
      bio: m.bio ?? "", imageUrl: m.imageUrl ?? "",
      linkedIn: m.linkedIn ?? "", active: m.active,
    });
    setMentorError("");
    setShowMentorForm(true);
  };

  const saveMentor = async () => {
    setMentorError("");
    if (!mentorDraft.name.trim())      { setMentorError("Name is required.");      return; }
    if (!mentorDraft.expertise.trim()) { setMentorError("Expertise is required."); return; }

    setMentorSaving(true);
    try {
      const isEdit = editingMentor !== null;
      const url    = isEdit
        ? `/api/admin/opportunities/mentors/${editingMentor}`
        : "/api/admin/opportunities/mentors";
      const res = await fetch(url, {
        method:  isEdit ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name:      mentorDraft.name.trim(),
          expertise: mentorDraft.expertise.trim(),
          bio:       mentorDraft.bio.trim()      || null,
          imageUrl:  mentorDraft.imageUrl.trim() || null,
          linkedIn:  mentorDraft.linkedIn.trim() || null,
          active:    mentorDraft.active,
        }),
      });
      if (!res.ok) {
        const d = await res.json() as { error?: string };
        setMentorError(d.error ?? "Save failed."); return;
      }
      const saved = await res.json() as Mentor;
      setMentors((prev) =>
        isEdit
          ? prev.map((m) => m.id === editingMentor ? saved : m)
          : [...prev, saved]
      );
      setShowMentorForm(false);
    } finally { setMentorSaving(false); }
  };

  const deleteMentor = async (id: string) => {
    if (!confirm("Delete this mentor?")) return;
    setBusy((b) => ({ ...b, [id]: true }));
    try {
      const res = await fetch(`/api/admin/opportunities/mentors/${id}`, { method: "DELETE" });
      if (res.ok) setMentors((prev) => prev.filter((m) => m.id !== id));
    } finally { setBusy((b) => ({ ...b, [id]: false })); }
  };

  const toggleActive = async (m: Mentor) => {
    setBusy((b) => ({ ...b, [m.id]: true }));
    try {
      const res = await fetch(`/api/admin/opportunities/mentors/${m.id}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: !m.active }),
      });
      if (res.ok) setMentors((prev) => prev.map((x) => x.id === m.id ? { ...x, active: !m.active } : x));
    } finally { setBusy((b) => ({ ...b, [m.id]: false })); }
  };

  if (status === "loading" || loading) {
    return (
      <div className={styles.loadingScreen}>
        <RefreshCw className={styles.spinner} size={28} />
        <p>Loading mentoring…</p>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      {/* HEADER */}
      <header className={styles.header}>
        <div>
          <h1 className={styles.pageTitle}>Mentoring Program</h1>
          <p className={styles.pageSubtitle}>
            Configure the program settings, manage the mentor roster, and control intake.
          </p>
        </div>
        <div className={styles.headerRight}>
          {program && (
            <div className={`${styles.openBadge} ${program.isOpen ? styles.openBadgeOn : ""}`}>
              {program.isOpen ? "Accepting Applications" : "Applications Closed"}
            </div>
          )}
        </div>
      </header>

      <div className={styles.layout}>
        {/* ── LEFT COLUMN ── */}
        <div className={styles.leftCol}>
          {/* PROGRAM SETTINGS */}
          <section className={styles.card}>
            <div className={styles.cardHeader}>
              <h2 className={styles.cardTitle}>Program Settings</h2>
              {program && (
                <span className={styles.appCount}>
                  {program._count.applications} application{program._count.applications !== 1 && "s"}
                </span>
              )}
            </div>

            {progError   && <div className={styles.errorBar}>{progError}</div>}
            {progSuccess  && <div className={styles.successBar}>Saved successfully.</div>}

            <div className={styles.field}>
              <label className={styles.label}>Description <span className={styles.req}>*</span></label>
              <textarea className={`${styles.input} ${styles.textarea}`} rows={4}
                placeholder="What is the mentoring program? Who is it for?"
                value={progForm.description}
                onChange={(e) => setProgForm((f) => ({ ...f, description: e.target.value }))} />
            </div>

            <div className={styles.row2}>
              <div className={styles.field}>
                <label className={styles.label}>Duration <span className={styles.req}>*</span></label>
                <input className={styles.input} placeholder="e.g. 3 months"
                  value={progForm.duration}
                  onChange={(e) => setProgForm((f) => ({ ...f, duration: e.target.value }))} />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Next Cohort Date</label>
                <input type="date" className={styles.input}
                  value={progForm.nextCohort}
                  onChange={(e) => setProgForm((f) => ({ ...f, nextCohort: e.target.value }))} />
              </div>
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Structure / How it Works</label>
              <textarea className={`${styles.input} ${styles.textarea}`} rows={3}
                placeholder="Describe the format — weekly calls, project reviews, etc."
                value={progForm.structure}
                onChange={(e) => setProgForm((f) => ({ ...f, structure: e.target.value }))} />
            </div>

            <div className={styles.settingsFooter}>
              <div className={styles.toggleRow}>
                <div>
                  <div className={styles.toggleLabel}>Accept Applications</div>
                  <div className={styles.toggleHint}>Enables the Apply button on the public page</div>
                </div>
                <Toggle
                  on={progForm.isOpen}
                  onChange={() => setProgForm((f) => ({ ...f, isOpen: !f.isOpen }))}
                />
              </div>
              <button className={styles.saveBtn} onClick={saveProgram} disabled={progSaving}>
                {progSaving ? <Loader2 size={14} className={styles.spin} /> : <Save size={14} />}
                {progSaving ? "Saving…" : "Save Settings"}
              </button>
            </div>
          </section>
        </div>

        {/* ── RIGHT COLUMN ── */}
        <div className={styles.rightCol}>
          {/* MENTOR ROSTER */}
          <section className={styles.card}>
            <div className={styles.cardHeader}>
              <h2 className={styles.cardTitle}>Mentor Roster</h2>
              <button className={styles.addMentorBtn} onClick={openNewMentor}>
                <Plus size={13} /> Add Mentor
              </button>
            </div>

            {/* ADD / EDIT INLINE FORM */}
            {showMentorForm && (
              <div className={styles.mentorForm}>
                <div className={styles.mentorFormHeader}>
                  <span className={styles.mentorFormTitle}>
                    {editingMentor ? "Edit Mentor" : "New Mentor"}
                  </span>
                  <button className={styles.mentorFormClose}
                    onClick={() => setShowMentorForm(false)}>
                    <X size={14} />
                  </button>
                </div>

                {mentorError && <div className={styles.errorBar}>{mentorError}</div>}

                <div className={styles.row2}>
                  <div className={styles.field}>
                    <label className={styles.label}>Name <span className={styles.req}>*</span></label>
                    <input className={styles.input} placeholder="Full name"
                      value={mentorDraft.name}
                      onChange={(e) => setMentorDraft((d) => ({ ...d, name: e.target.value }))} />
                  </div>
                  <div className={styles.field}>
                    <label className={styles.label}>Expertise <span className={styles.req}>*</span></label>
                    <input className={styles.input} placeholder="e.g. Orbital Mechanics"
                      value={mentorDraft.expertise}
                      onChange={(e) => setMentorDraft((d) => ({ ...d, expertise: e.target.value }))} />
                  </div>
                </div>

                <div className={styles.field}>
                  <label className={styles.label}>Bio</label>
                  <textarea className={`${styles.input} ${styles.textarea}`} rows={3}
                    placeholder="Short bio shown on the public page…"
                    value={mentorDraft.bio}
                    onChange={(e) => setMentorDraft((d) => ({ ...d, bio: e.target.value }))} />
                </div>

                <div className={styles.row2}>
                  <div className={styles.field}>
                    <label className={styles.label}>Photo URL</label>
                    <input className={styles.input} placeholder="https://…"
                      value={mentorDraft.imageUrl}
                      onChange={(e) => setMentorDraft((d) => ({ ...d, imageUrl: e.target.value }))} />
                  </div>
                  <div className={styles.field}>
                    <label className={styles.label}>LinkedIn URL</label>
                    <input className={styles.input} placeholder="https://linkedin.com/in/…"
                      value={mentorDraft.linkedIn}
                      onChange={(e) => setMentorDraft((d) => ({ ...d, linkedIn: e.target.value }))} />
                  </div>
                </div>

                <div className={styles.mentorFormFooter}>
                  <div className={styles.toggleRow}>
                    <span className={styles.toggleLabel}>Active (visible on public page)</span>
                    <Toggle on={mentorDraft.active} onChange={() => setMentorDraft((d) => ({ ...d, active: !d.active }))} />
                  </div>
                  <div className={styles.mentorFormActions}>
                    <button className={styles.cancelBtn} onClick={() => setShowMentorForm(false)}>
                      Cancel
                    </button>
                    <button className={styles.saveBtn} onClick={saveMentor} disabled={mentorSaving}>
                      {mentorSaving ? <Loader2 size={13} className={styles.spin} /> : <Check size={13} />}
                      {mentorSaving ? "Saving…" : "Save Mentor"}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* MENTOR LIST */}
            {mentors.length === 0 ? (
              <div className={styles.emptyMentors}>
                <Users size={28} style={{ opacity: 0.25, marginBottom: 10 }} />
                <p>No mentors added yet.</p>
              </div>
            ) : (
              <div className={styles.mentorList}>
                {mentors.map((m) => {
                  const isBusy = busy[m.id] ?? false;
                  return (
                    <div key={m.id} className={`${styles.mentorRow} ${!m.active ? styles.mentorInactive : ""}`}>
                      {/* AVATAR */}
                      <div className={styles.mentorAvatar}>
                        {m.imageUrl
                          // eslint-disable-next-line @next/next/no-img-element
                          ? <img src={m.imageUrl} alt={m.name} className={styles.avatarImg} />
                          : <span className={styles.avatarInitial}>{m.name[0]}</span>
                        }
                      </div>
                      <div className={styles.mentorInfo}>
                        <div className={styles.mentorName}>
                          {m.name}
                          {!m.active && <span className={styles.inactiveBadge}>Hidden</span>}
                        </div>
                        <div className={styles.mentorExpertise}>{m.expertise}</div>
                      </div>
                      <div className={styles.mentorActions}>
                        <Toggle on={m.active} onChange={() => toggleActive(m)} />
                        <button className={styles.iconBtn} onClick={() => openEditMentor(m)}>
                          <Pencil size={12} />
                        </button>
                        <button className={styles.iconBtnDanger} disabled={isBusy}
                          onClick={() => deleteMentor(m.id)}>
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
