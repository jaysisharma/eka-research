"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, BookOpen, Compass, Megaphone, Lock, X, Loader2, CheckCircle2, GraduationCap, Linkedin } from "lucide-react";
import styles from "./page.module.css";

interface DbMentor {
  id: string;
  name: string;
  expertise: string;
  bio: string | null;
  imageUrl: string | null;
  linkedIn: string | null;
}

interface DbProgram {
  id: string;
  description: string;
  duration: string;
  structure: string | null;
  nextCohort: string | null;
  isOpen: boolean;
}

interface MentoringListProps {
  program: DbProgram;
  mentors: DbMentor[];
  isLoggedIn: boolean;
  user?: {
    name?: string | null;
    email?: string | null;
  };
}

const STEPS = [
  {
    num: "01",
    title: "Apply",
    desc: "Fill out a short form telling us your goals, background, and what kind of guidance you're looking for.",
  },
  {
    num: "02",
    title: "Get matched",
    desc: "We review your application and match you with a mentor within two weeks.",
  },
  {
    num: "03",
    title: "Intro call",
    desc: "A 30-minute introductory session to align on goals, expectations, and a rough plan.",
  },
  {
    num: "04",
    title: "Ongoing sessions",
    desc: "Regular 1-on-1 meetings — monthly at minimum — for as long as the relationship is valuable.",
  },
];

const TRACKS = [
  {
    Icon: BookOpen,
    title: "Research mentoring",
    desc: "For students working on projects, papers, or theses in astronomy, atmospheric physics, or related fields. Your mentor will help you navigate literature, methodology, and scientific writing.",
    tags: ["BSc / MSc students", "Research projects", "Paper writing"],
  },
  {
    Icon: Compass,
    title: "Career guidance",
    desc: "For those figuring out next steps — grad school applications, academic careers, research fellowships, or transitions into science-adjacent roles. Practical, experience-based advice.",
    tags: ["Grad school", "Academia", "Fellowships"],
  },
  {
    Icon: Megaphone,
    title: "Education & outreach",
    desc: "For aspiring science communicators, educators, and public outreach practitioners. Learn how to design programmes, engage communities, and communicate science effectively.",
    tags: ["Science communication", "Teaching", "Programme design"],
  },
];

const FAQS = [
  {
    q: "Do I need to be an Eka member?",
    a: "Yes — the mentoring program is open to all Eka members. Membership is free and takes under 2 minutes.",
  },
  {
    q: "Is there a fee?",
    a: "No. The program is entirely free for mentees. Mentors contribute their time voluntarily.",
  },
  {
    q: "How long does a mentorship last?",
    a: "There's no fixed end date. Most relationships run for 6–12 months, but some continue much longer. You and your mentor decide together.",
  },
  {
    q: "Can I be matched with a mentor outside Nepal?",
    a: "Yes. All sessions are remote-friendly, and several of our mentors are based internationally.",
  },
];

export default function MentoringList({ program, mentors, isLoggedIn, user }: MentoringListProps) {
  const [modalOpen, setModalOpen] = useState(false);

  // Form State
  const [phone, setPhone] = useState("");
  const [background, setBackground] = useState("");
  const [goals, setGoals] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleOpenApply = () => {
    if (!program.isOpen || !isLoggedIn) return;
    setModalOpen(true);
    setPhone("");
    setBackground("");
    setGoals("");
    setError("");
    setSuccess(false);
  };

  const handleClose = () => {
    setModalOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!background.trim() || !goals.trim()) {
      setError("Please fill in both your research interests and your mentoring goals.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/opportunities/mentoring/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: user?.name || "Anonymous Member",
          email: user?.email || "",
          phone: phone.trim() || null,
          background: background.trim(),
          goals: goals.trim(),
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

  const formatCohortDate = (iso: string | null) => {
    if (!iso) return "TBD";
    return new Date(iso).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className={styles.pageWrapper}>
      {/* ── HERO ── */}
      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <div className={styles.heroPitch}>
            <span className={styles.label}>
              <span className={styles.labelLine} />
              Mentoring Program
            </span>
            <h1 className={styles.heroHeading}>
              Guidance from people{" "}
              <span className={styles.accent}>doing the work</span>
            </h1>
            <p className={styles.heroDesc}>
              {program.description || "Get matched with an active researcher, academic, or science communicator at Eka. Free 1-on-1 mentoring."}
            </p>

            <div className={styles.heroCtaWrapper}>
              {!isLoggedIn ? (
                <div className={styles.heroGuestNotice}>
                  <Link
                    href={`/auth/login?callbackUrl=${encodeURIComponent("/opportunities/mentoring")}`}
                    className={styles.heroBtn}
                  >
                    Sign in to Apply <ArrowRight size={15} />
                  </Link>
                  <p className={styles.guestHint}>
                    No account? <Link href={`/auth/signup?callbackUrl=${encodeURIComponent("/opportunities/mentoring")}`} className={styles.guestLink}>Create one free</Link>
                  </p>
                </div>
              ) : !program.isOpen ? (
                <button className={styles.heroBtnDisabled} disabled>
                  Cohort Closed
                </button>
              ) : (
                <button onClick={handleOpenApply} className={styles.heroBtn}>
                  Apply for mentoring <ArrowRight size={15} />
                </button>
              )}
            </div>
          </div>

          <div className={styles.heroCard}>
            <h2 className={styles.heroCardHeading}>At a glance</h2>
            <dl className={styles.glanceList}>
              <div className={styles.glanceItem}>
                <dt className={styles.glanceKey}>Format</dt>
                <dd className={styles.glanceVal}>1-on-1, remote-friendly</dd>
              </div>
              <div className={styles.glanceItem}>
                <dt className={styles.glanceKey}>Frequency</dt>
                <dd className={styles.glanceVal}>Monthly minimum</dd>
              </div>
              <div className={styles.glanceItem}>
                <dt className={styles.glanceKey}>Duration</dt>
                <dd className={styles.glanceVal}>{program.duration}</dd>
              </div>
              <div className={styles.glanceItem}>
                <dt className={styles.glanceKey}>Next Cohort</dt>
                <dd className={styles.glanceVal}>{formatCohortDate(program.nextCohort)}</dd>
              </div>
              <div className={styles.glanceItem}>
                <dt className={styles.glanceKey}>Applications</dt>
                <dd className={`${styles.glanceVal} ${program.isOpen ? styles.glanceOpen : styles.glanceClosed}`}>
                  {program.isOpen ? "Open" : "Closed"}
                </dd>
              </div>
              <div className={styles.glanceItem}>
                <dt className={styles.glanceKey}>Cost</dt>
                <dd className={`${styles.glanceVal} ${styles.glanceFree}`}>Free</dd>
              </div>
            </dl>
          </div>
        </div>
      </section>

      {/* ── AUTH BANNER FOR GUESTS ── */}
      {!isLoggedIn && (
        <div className={styles.authBanner}>
          <div className={styles.authBannerInner}>
            <Lock size={15} strokeWidth={2} />
            <p className={styles.authBannerText}>
              You need a free Eka account to apply.{" "}
              <Link
                href={`/auth/signup?callbackUrl=${encodeURIComponent("/opportunities/mentoring")}`}
                className={styles.authBannerLink}
              >
                Create your account
              </Link>{" "}
              or{" "}
              <Link
                href={`/auth/login?callbackUrl=${encodeURIComponent("/opportunities/mentoring")}`}
                className={styles.authBannerLink}
              >
                sign in
              </Link>{" "}
              — it takes under 2 minutes.
            </p>
          </div>
        </div>
      )}

      {/* ── COHORT CLOSED WARNING IF CLOSED BUT LOGGED IN ── */}
      {isLoggedIn && !program.isOpen && (
        <div className={styles.closedBanner}>
          <div className={styles.closedBannerInner}>
            <p className={styles.closedBannerText}>
              <strong>Applications are currently closed.</strong> We are processing current cohort pairings. Sign up for updates or check back for the next cohort target: {formatCohortDate(program.nextCohort)}.
            </p>
          </div>
        </div>
      )}

      {/* ── HOW IT WORKS ── */}
      <section className={styles.stepsSection}>
        <div className={styles.stepsInner}>
          <div className={styles.sectionHeader}>
            <span className={styles.label}>
              <span className={styles.labelLine} />
              How it works
            </span>
            <h2 className={styles.sectionHeading}>Four steps from application to mentorship</h2>
          </div>

          <div className={styles.stepsList}>
            {STEPS.map((step, i) => (
              <div key={step.num} className={styles.step}>
                <span className={styles.stepNum}>{step.num}</span>
                {i < STEPS.length - 1 && (
                  <span className={styles.stepLine} aria-hidden="true" />
                )}
                <h3 className={styles.stepTitle}>{step.title}</h3>
                <p className={styles.stepDesc}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TRACKS ── */}
      <section className={styles.tracksSection}>
        <div className={styles.tracksInner}>
          <div className={styles.sectionHeader}>
            <span className={styles.label}>
              <span className={styles.labelLine} />
              Mentoring tracks
            </span>
            <h2 className={styles.sectionHeading}>Three ways we can help</h2>
          </div>

          <div className={styles.tracksList}>
            {TRACKS.map(({ Icon, title, desc, tags }) => (
              <div key={title} className={styles.trackCard}>
                <div className={styles.trackIcon}>
                  <Icon size={20} strokeWidth={1.75} />
                </div>
                <div className={styles.trackBody}>
                  <h3 className={styles.trackTitle}>{title}</h3>
                  <p className={styles.trackDesc}>{desc}</p>
                  <div className={styles.trackTags}>
                    {tags.map((tag) => (
                      <span key={tag} className={styles.trackTag}>{tag}</span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── DYNAMIC MENTORS ROSTER ── */}
      {mentors.length > 0 && (
        <section className={styles.mentorsSection}>
          <div className={styles.mentorsInner}>
            <div className={styles.sectionHeader}>
              <span className={styles.label}>
                <span className={styles.labelLine} />
                Our Mentors
              </span>
              <h2 className={styles.sectionHeading}>Learn from leading experts in research & academia</h2>
            </div>

            <div className={styles.mentorsGrid}>
              {mentors.map((mentor) => (
                <div key={mentor.id} className={styles.mentorCard}>
                  <div className={styles.mentorImageWrapper}>
                    {mentor.imageUrl ? (
                      <img src={mentor.imageUrl} alt={mentor.name} className={styles.mentorImage} />
                    ) : (
                      <div className={styles.mentorPlaceholderImage}>
                        <GraduationCap size={32} />
                      </div>
                    )}
                  </div>
                  <div className={styles.mentorInfo}>
                    <div className={styles.mentorHeader}>
                      <h3 className={styles.mentorName}>{mentor.name}</h3>
                      {mentor.linkedIn && (
                        <a
                          href={mentor.linkedIn}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={styles.mentorLinkedinLink}
                          aria-label={`${mentor.name} LinkedIn Profile`}
                        >
                          <Linkedin size={14} />
                        </a>
                      )}
                    </div>
                    <span className={styles.mentorExpertise}>{mentor.expertise}</span>
                    {mentor.bio && <p className={styles.mentorBio}>{mentor.bio}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── FAQ ── */}
      <section className={styles.faqSection}>
        <div className={styles.faqInner}>
          <div className={styles.sectionHeader}>
            <span className={styles.label}>
              <span className={styles.labelLine} />
              FAQ
            </span>
            <h2 className={styles.sectionHeading}>Common questions</h2>
          </div>

          <div className={styles.faqList}>
            {FAQS.map(({ q, a }) => (
              <details key={q} className={styles.faqItem}>
                <summary className={styles.faqQ}>
                  {q}
                  <span className={styles.faqIcon} aria-hidden="true" />
                </summary>
                <p className={styles.faqA}>{a}</p>
              </details>
            ))}
          </div>

          <div className={styles.faqCta}>
            <p className={styles.faqCtaText}>Ready to apply?</p>
            {isLoggedIn ? (
              program.isOpen ? (
                <button onClick={handleOpenApply} className={styles.faqCtaBtn}>
                  Apply for mentoring <ArrowRight size={14} />
                </button>
              ) : (
                <button className={styles.faqCtaBtnDisabled} disabled>
                  Cohort Closed
                </button>
              )
            ) : (
              <Link
                href={`/auth/login?callbackUrl=${encodeURIComponent("/opportunities/mentoring")}`}
                className={styles.faqCtaBtn}
              >
                Sign in to Apply <ArrowRight size={14} />
              </Link>
            )}
            <p className={styles.faqCtaNote}>
              Or contact our team with any additional questions at{" "}
              <a href="mailto:info@ekaresearch.org" className={styles.faqCtaEmail}>
                info@ekaresearch.org
              </a>
            </p>
          </div>
        </div>
      </section>

      {/* ── INTERACTIVE MENTORING APPLICATION MODAL ── */}
      {modalOpen && (
        <div className={styles.modalOverlay} onClick={handleClose}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <button className={styles.closeBtn} onClick={handleClose} aria-label="Close modal">
              <X size={18} />
            </button>

            {!success ? (
              <form onSubmit={handleSubmit} className={styles.modalForm}>
                <div className={styles.modalHeader}>
                  <GraduationCap size={22} className={styles.modalHeaderIcon} />
                  <div>
                    <h3 className={styles.modalTitle}>Apply for Mentoring</h3>
                    <p className={styles.modalSubtitle}>
                      Cohort Program · <span style={{ opacity: 0.8 }}>Eka Research Nepal</span>
                    </p>
                  </div>
                </div>

                {error && <div className={styles.formError}>{error}</div>}

                <div className={styles.formGrid}>
                  <div className={styles.field}>
                    <label className={styles.formLabel}>Full Name</label>
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
                    <label className={styles.formLabel}>Email Address</label>
                    <input
                      type="email"
                      className={styles.inputDisabled}
                      value={user?.email || ""}
                      readOnly
                      disabled
                    />
                    <span className={styles.fieldHint}>Verified from account</span>
                  </div>

                  <div className={styles.field} style={{ gridColumn: "span 2" }}>
                    <label className={styles.formLabel}>Phone Number (Optional)</label>
                    <input
                      type="tel"
                      className={styles.input}
                      placeholder="+977-98XXXXXXXX"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                  </div>

                  <div className={styles.field} style={{ gridColumn: "span 2" }}>
                    <label className={styles.formLabel}>
                      Academic Background & Research Interests <span className={styles.req}>*</span>
                    </label>
                    <textarea
                      className={`${styles.input} ${styles.textarea}`}
                      rows={4}
                      placeholder="Tell us about your educational background (e.g. BSc Physics, Instrument Engineering) and any specific scientific fields or questions you are passionate about..."
                      value={background}
                      onChange={(e) => setBackground(e.target.value)}
                      required
                    />
                  </div>

                  <div className={styles.field} style={{ gridColumn: "span 2" }}>
                    <label className={styles.formLabel}>
                      Mentoring Goals & Expectations <span className={styles.req}>*</span>
                    </label>
                    <textarea
                      className={`${styles.input} ${styles.textarea}`}
                      rows={4}
                      placeholder="What do you hope to achieve through this mentoring relationship? (e.g., career guidance, manuscript feedback, lab project methodology, grad school advice)..."
                      value={goals}
                      onChange={(e) => setGoals(e.target.value)}
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
                  Fantastic! Your application for the Eka Mentoring Program has been successfully received, <strong>{user?.name}</strong>.
                </p>
                <p className={styles.successSubtext}>
                  Our academic committee will review your research interests and reach out to you at <strong>{user?.email}</strong> within 2 weeks for matching details.
                </p>
                <button className={styles.closeSuccessBtn} onClick={handleClose}>
                  Return to Program Page
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
