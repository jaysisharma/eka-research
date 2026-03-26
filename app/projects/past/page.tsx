import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CalendarDays, Tag, CheckCircle2, ArrowLeft, BookOpen } from "lucide-react";
import { buildMetadata } from "@/lib/seo";
import { PROJECTS } from "@/lib/constants";
import styles from "./page.module.css";

export const metadata = buildMetadata({
  title: "Past Projects",
  description:
    "A record of completed Eka Research projects — StratoNepal balloon flights, the Geminid citizen science campaign, and the School Telescope Initiative.",
  path: "/projects/past",
});

const completed = PROJECTS.filter((p) => p.status === "completed");

// Aggregate stats from completed work
const STATS = [
  { value: String(completed.length), label: "Projects completed" },
  { value: "3,800+", label: "Meteors recorded" },
  { value: "4", label: "Balloon flights" },
  { value: "1,400+", label: "Students reached" },
];

export default function PastProjectsPage() {
  return (
    <main>

      {/* ── Hero ── */}
      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <Link href="/projects" className={styles.backLink}>
            <ArrowLeft size={13} /> All projects
          </Link>
          <div className={styles.heroLabel}>
            <CheckCircle2 size={13} />
            Completed Work
          </div>
          <h1 className={styles.heroHeading}>
            The foundation we{" "}
            <span className={styles.heroAccent}>built on.</span>
          </h1>
          <p className={styles.heroSub}>
            Every completed project leaves behind open data, published findings, and lessons that feed our next mission. This is the record of what Eka has done.
          </p>
          <div className={styles.heroLinks}>
            <Link href="/articles" className={styles.heroBtn}>
              Read our publications <ArrowRight size={14} />
            </Link>
            <Link href="/projects" className={styles.heroGhost}>
              See ongoing work
            </Link>
          </div>
        </div>
        <div className={styles.heroBg} aria-hidden="true" />
      </section>

      {/* ── Stats strip ── */}
      <div className={styles.statsStrip}>
        <div className={styles.statsInner}>
          {STATS.map(({ value, label }) => (
            <div key={label} className={styles.statItem}>
              <span className={styles.statValue}>{value}</span>
              <span className={styles.statLabel}>{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Projects archive ── */}
      <section className={styles.archiveSection}>
        <div className={styles.archiveInner}>
          <div className={styles.archiveHeader}>
            <h2 className={styles.archiveHeading}>Project archive</h2>
            <p className={styles.archiveSub}>
              {completed.length} completed project{completed.length !== 1 ? "s" : ""} · all datasets open-access where applicable
            </p>
          </div>

          <div className={styles.archiveList}>
            {completed.map((project) => (
              <article key={project.id} className={styles.card}>

                {/* Thumbnail */}
                <div className={styles.cardThumb}>
                  <Image
                    src={project.image}
                    alt={project.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 360px"
                    className={styles.cardThumbImg}
                  />
                  <div className={styles.cardThumbOverlay} />
                  <div className={styles.completedBadge}>
                    <CheckCircle2 size={11} />
                    Completed
                  </div>
                </div>

                {/* Content */}
                <div className={styles.cardContent}>
                  <div className={styles.cardMeta}>
                    <span className={styles.cardPeriod}>
                      <CalendarDays size={12} />
                      {project.period}
                    </span>
                  </div>

                  <h3 className={styles.cardTitle}>{project.title}</h3>
                  <p className={styles.cardDesc}>{project.description}</p>

                  {/* Outcome highlight */}
                  {project.outcome && (
                    <div className={styles.outcome}>
                      <CheckCircle2 size={13} className={styles.outcomeIcon} />
                      <p className={styles.outcomeText}>{project.outcome}</p>
                    </div>
                  )}

                  {/* Tags */}
                  <div className={styles.cardTags}>
                    {project.tags.map((t) => (
                      <span key={t} className={styles.tag}>
                        <Tag size={10} />
                        {t}
                      </span>
                    ))}
                  </div>

                  <Link href={project.href} className={styles.cardLink}>
                    Read project report <ArrowRight size={13} />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ── Research CTA ── */}
      <section className={styles.cta}>
        <div className={styles.ctaInner}>
          <div className={styles.ctaIcon}>
            <BookOpen size={24} />
          </div>
          <div className={styles.ctaText}>
            <h2 className={styles.ctaHeading}>All findings are published openly.</h2>
            <p className={styles.ctaSub}>
              Datasets, analysis code, and papers from completed projects are freely available in our research articles section.
            </p>
          </div>
          <div className={styles.ctaActions}>
            <Link href="/articles" className={styles.ctaBtn}>
              Browse publications <ArrowRight size={14} />
            </Link>
            <Link href="/projects/upcoming" className={styles.ctaGhost}>
              What&apos;s coming next
            </Link>
          </div>
        </div>
      </section>

    </main>
  );
}
