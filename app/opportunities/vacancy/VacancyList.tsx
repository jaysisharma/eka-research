"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { ArrowRight, MapPin, Calendar, Wifi, Lock, X, Loader2, CheckCircle2, Search, Briefcase } from "lucide-react";
import styles from "./page.module.css";

type VacancyType = "FULL_TIME" | "PART_TIME" | "INTERNSHIP" | "VOLUNTEER";

interface DbVacancy {
  id: string;
  title: string;
  type: VacancyType;
  department: string;
  description: string;
  deadline: string | null;
  status: string;
  createdAt: string;
}

interface UserSession {
  name?: string | null;
  email?: string | null;
}

interface VacancyListProps {
  vacancies: DbVacancy[];
  isLoggedIn: boolean;
  user?: UserSession;
}

const TYPE_LABELS: Record<VacancyType, string> = {
  FULL_TIME: "Full-time",
  PART_TIME: "Part-time",
  INTERNSHIP: "Internship",
  VOLUNTEER: "Volunteer",
};

export default function VacancyList({ vacancies, isLoggedIn, user }: VacancyListProps) {
  const [search, setSearch] = useState("");
  const [selectedType, setSelectedType] = useState<VacancyType | "ALL">("ALL");
  const [activeVacancy, setActiveVacancy] = useState<DbVacancy | null>(null);

  // Form State
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return vacancies.filter((v) => {
      const matchSearch = !q || v.title.toLowerCase().includes(q) || v.department.toLowerCase().includes(q);
      const matchType = selectedType === "ALL" || v.type === selectedType;
      return matchSearch && matchType;
    });
  }, [vacancies, search, selectedType]);

  const handleOpenApply = (vacancy: DbVacancy) => {
    setActiveVacancy(vacancy);
    setPhone("");
    setMessage("");
    setError("");
    setSuccess(false);
  };

  const handleClose = () => {
    setActiveVacancy(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeVacancy) return;
    if (!message.trim()) {
      setError("Cover note / message is required.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const res = await fetch(`/api/opportunities/vacancies/${activeVacancy.id}/apply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: user?.name || "Anonymous Member",
          email: user?.email || "",
          phone: phone.trim() || null,
          message: message.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to submit application.");
      } else {
        setSuccess(true);
      }
    } catch (err) {
      setError("An unexpected network error occurred. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const formatDeadline = (iso: string | null) => {
    if (!iso) return "Rolling Application";
    return new Date(iso).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className={styles.listWrapper}>
      {/* ── SEARCH & FILTER BAR ── */}
      <div className={styles.toolbar}>
        <div className={styles.searchBox}>
          <Search size={16} className={styles.searchIcon} />
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Search roles or departments..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className={styles.filterBtns}>
          {(["ALL", "FULL_TIME", "PART_TIME", "INTERNSHIP", "VOLUNTEER"] as const).map((t) => (
            <button
              key={t}
              className={`${styles.filterBtn} ${selectedType === t ? styles.filterActive : ""}`}
              onClick={() => setSelectedType(t)}
            >
              {t === "ALL" ? "All Roles" : TYPE_LABELS[t]}
            </button>
          ))}
        </div>
      </div>

      {/* ── VACANCIES LISTING ── */}
      {filtered.length === 0 ? (
        <div className={styles.emptyWrap}>
          <Briefcase size={36} className={styles.emptyIcon} />
          <p className={styles.emptyText}>No open positions match your search filter.</p>
        </div>
      ) : (
        <div className={styles.list}>
          {filtered.map((vacancy) => {
            const isIntern = vacancy.type === "INTERNSHIP";
            return (
              <article key={vacancy.id} className={styles.card}>
                {/* Header info */}
                <div className={styles.cardHead}>
                  <div className={styles.cardMeta}>
                    <span className={styles.typeBadge}>
                      {TYPE_LABELS[vacancy.type] ?? vacancy.type}
                    </span>
                    <span className={styles.metaDot} aria-hidden="true" />
                    <span className={styles.dept}>{vacancy.department}</span>
                  </div>

                  <div className={styles.cardAttrs}>
                    <span className={styles.attr}>
                      <MapPin size={12} strokeWidth={2} />
                      Kathmandu, HQ
                    </span>
                    <span className={styles.attr}>
                      <Wifi size={12} strokeWidth={2} />
                      {isIntern ? "Hybrid / Remote ok" : "On-site"}
                    </span>
                    <span className={styles.attr}>
                      <Calendar size={12} strokeWidth={2} />
                      Deadline: {formatDeadline(vacancy.deadline)}
                    </span>
                  </div>
                </div>

                {/* Title */}
                <h2 className={styles.cardTitle}>{vacancy.title}</h2>

                {/* Description */}
                <div className={styles.cardDesc} style={{ whiteSpace: "pre-wrap" }}>
                  {vacancy.description}
                </div>

                {/* Action CTA */}
                <div className={styles.cardFooter}>
                  {isLoggedIn ? (
                    <button
                      onClick={() => handleOpenApply(vacancy)}
                      className={styles.applyBtn}
                    >
                      Apply now <ArrowRight size={14} />
                    </button>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                      <Link
                        href={`/auth/login?callbackUrl=${encodeURIComponent("/opportunities/vacancy")}`}
                        className={styles.applyBtn}
                      >
                        Sign in to apply <ArrowRight size={14} />
                      </Link>
                      <p className={styles.applyNote}>
                        No account?{" "}
                        <Link
                          href={`/auth/signup?callbackUrl=${encodeURIComponent("/opportunities/vacancy")}`}
                          className={styles.applyNoteLink}
                        >
                          Create one free
                        </Link>
                      </p>
                    </div>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* ── INTERACTIVE APPLICATION MODAL ── */}
      {activeVacancy && (
        <div className={styles.modalOverlay} onClick={handleClose}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <button className={styles.closeBtn} onClick={handleClose} aria-label="Close modal">
              <X size={18} />
            </button>

            {!success ? (
              <form onSubmit={handleSubmit} className={styles.modalForm}>
                <div className={styles.modalHeader}>
                  <Briefcase size={22} className={styles.modalHeaderIcon} />
                  <div>
                    <h3 className={styles.modalTitle}>Apply for Position</h3>
                    <p className={styles.modalSubtitle}>
                      {activeVacancy.title} · <span style={{ opacity: 0.8 }}>{activeVacancy.department}</span>
                    </p>
                  </div>
                </div>

                {error && <div className={styles.formError}>{error}</div>}

                <div className={styles.formGrid}>
                  <div className={styles.field}>
                    <label className={styles.label}>Full Name</label>
                    <input
                      type="text"
                      className={styles.inputDisabled}
                      value={user?.name || ""}
                      readOnly
                      disabled
                    />
                    <span className={styles.fieldHint}>Verified from account</span>
                  </div>

                  <div className={styles.field}>
                    <label className={styles.label}>Email Address</label>
                    <input
                      type="email"
                      className={styles.inputDisabled}
                      value={user?.email || ""}
                      readOnly
                      disabled
                    />
                    <span className={styles.fieldHint}>Verified from account</span>
                  </div>

                  <div className={styles.field}>
                    <label className={styles.label}>Phone Number (Optional)</label>
                    <input
                      type="tel"
                      className={styles.input}
                      placeholder="+977-98XXXXXXXX"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                  </div>

                  <div className={styles.field} style={{ gridColumn: "span 2" }}>
                    <label className={styles.label}>
                      Cover Note / Message <span className={styles.req}>*</span>
                    </label>
                    <textarea
                      className={`${styles.input} ${styles.textarea}`}
                      rows={5}
                      placeholder="Introduce yourself! Let us know why you are a great fit for this position and what relevant skills you bring..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className={styles.modalFooter}>
                  <button
                    type="button"
                    className={styles.cancelBtn}
                    onClick={handleClose}
                    disabled={submitting}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className={styles.submitBtn}
                    disabled={submitting}
                  >
                    {submitting ? (
                      <>
                        <Loader2 size={14} className={styles.spin} /> Submitting...
                      </>
                    ) : (
                      "Submit Application"
                    )}
                  </button>
                </div>
              </form>
            ) : (
              <div className={styles.successScreen}>
                <CheckCircle2 size={56} className={styles.successIcon} />
                <h3 className={styles.successTitle}>Application Submitted!</h3>
                <p className={styles.successText}>
                  Thank you, <strong>{user?.name}</strong>. Your application for the{" "}
                  <strong>{activeVacancy.title}</strong> role has been securely recorded.
                </p>
                <p className={styles.successSubtext}>
                  Our recruitment team will review your profile and get in touch at{" "}
                  <strong>{user?.email}</strong> within 1–2 weeks.
                </p>
                <button className={styles.closeSuccessBtn} onClick={handleClose}>
                  Back to Vacancies
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
