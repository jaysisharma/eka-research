export const dynamic = "force-dynamic";
import Link from "next/link";
import { ArrowRight, BookOpen, Compass, Megaphone } from "lucide-react";
import { buildMetadata } from "@/lib/seo";
import { SITE } from "@/lib/constants";
import styles from "./page.module.css";

export const metadata = buildMetadata({
  title: "Mentoring Program",
  description:
    "Connect with active researchers, academics, and science communicators at Eka Research. Free 1-on-1 mentoring for students and early-career scientists in Nepal.",
  path: "/opportunities/mentoring",
});

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
    a: "Yes — the mentoring program is open to all Eka members. Membership is free and takes under 2 minutes. Join at /opportunities/join.",
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

export default function MentoringPage() {
  return (
    <main>

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
              Get matched with an active researcher, academic, or science
              communicator at Eka. Free 1-on-1 mentoring — no applications,
              no waiting lists, no cost.
            </p>
            <Link
              href={`mailto:${SITE.email}?subject=Mentoring Program — Application`}
              className={styles.heroBtn}
            >
              Apply for mentoring <ArrowRight size={15} />
            </Link>
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
                <dd className={styles.glanceVal}>Ongoing, no fixed end</dd>
              </div>
              <div className={styles.glanceItem}>
                <dt className={styles.glanceKey}>Open to</dt>
                <dd className={styles.glanceVal}>All Eka members</dd>
              </div>
              <div className={styles.glanceItem}>
                <dt className={styles.glanceKey}>Cost</dt>
                <dd className={`${styles.glanceVal} ${styles.glanceFree}`}>Free</dd>
              </div>
            </dl>
          </div>

        </div>
      </section>

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
            <Link
              href={`mailto:${SITE.email}?subject=Mentoring Program — Application`}
              className={styles.faqCtaBtn}
            >
              Apply for mentoring <ArrowRight size={14} />
            </Link>
            <p className={styles.faqCtaNote}>
              Or email us at{" "}
              <a href={`mailto:${SITE.email}`} className={styles.faqCtaEmail}>
                {SITE.email}
              </a>{" "}
              with any questions.
            </p>
          </div>
        </div>
      </section>

    </main>
  );
}
