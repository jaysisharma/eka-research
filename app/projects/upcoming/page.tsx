export const dynamic = "force-dynamic";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CalendarDays, Tag, Rocket, Clock, ArrowLeft } from "lucide-react";
import { buildMetadata } from "@/lib/seo";
import { PROJECTS } from "@/lib/constants";
import styles from "./page.module.css";

export const metadata = buildMetadata({
  title: "Upcoming Projects",
  description:
    "Projects in planning and early development at Eka Research — from spectral meteor surveys to Nepal's first solar eclipse campaign and a Himalayan dark sky initiative.",
  path: "/projects/upcoming",
});

const upcoming = PROJECTS.filter((p) => p.status === "upcoming");

const PHASES = ["Planning", "Funding", "Instrument Design", "Site Survey", "Pre-launch", "Active"];

function phaseIndex(phase?: string) {
  if (!phase) return -1;
  return PHASES.indexOf(phase);
}

export default function UpcomingProjectsPage() {
  return (
    <main>

      {/* ── Hero ── */}
      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <Link href="/projects" className={styles.backLink}>
            <ArrowLeft size={13} /> All projects
          </Link>
          <div className={styles.heroLabel}>
            <span className={styles.labelDot} />
            Upcoming
          </div>
          <h1 className={styles.heroHeading}>
            What we&apos;re building{" "}
            <span className={styles.heroAccent}>next.</span>
          </h1>
          <p className={styles.heroSub}>
            These projects are in active planning and early development. Get involved before they launch — collaborators, student volunteers, and funding partners welcome.
          </p>
          <Link href="/opportunities/join" className={styles.heroBtn}>
            Get involved early <ArrowRight size={14} />
          </Link>
        </div>
        <div className={styles.heroGlow} aria-hidden="true" />
      </section>

      {/* ── Count strip ── */}
      <div className={styles.countStrip}>
        <div className={styles.countInner}>
          <span className={styles.countNum}>{upcoming.length}</span>
          <span className={styles.countLabel}>
            project{upcoming.length !== 1 ? "s" : ""} in the pipeline
          </span>
          <span className={styles.countSep} aria-hidden="true" />
          <span className={styles.countNote}>
            Open to collaborators · Volunteer positions available
          </span>
        </div>
      </div>

      {/* ── Projects ── */}
      <section className={styles.projectsSection}>
        <div className={styles.projectsInner}>
          {upcoming.map((project, i) => {
            const idx = phaseIndex(project.phase);
            return (
              <article key={project.id} className={styles.card}>

                {/* Image */}
                <div className={styles.cardImgWrap}>
                  <Image
                    src={project.image}
                    alt={project.title}
                    fill
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    className={styles.cardImg}
                    priority={i === 0}
                  />
                  <div className={styles.cardImgOverlay} />

                  {/* Phase badge */}
                  {project.phase && (
                    <div className={styles.phaseBadge}>
                      <Rocket size={11} />
                      {project.phase}
                    </div>
                  )}
                </div>

                {/* Body */}
                <div className={styles.cardBody}>
                  <div className={styles.cardMeta}>
                    <span className={styles.cardLaunch}>
                      <CalendarDays size={13} />
                      {project.launchTarget ?? project.period}
                    </span>
                    <span className={styles.cardUpcomingBadge}>
                      <Clock size={11} />
                      Upcoming
                    </span>
                  </div>

                  <h2 className={styles.cardTitle}>{project.title}</h2>
                  <p className={styles.cardDesc}>{project.description}</p>

                  {/* Phase progress bar */}
                  {project.phase && idx >= 0 && (
                    <div className={styles.phaseBar}>
                      <div className={styles.phaseBarLabel}>
                        <span>Development phase</span>
                        <span className={styles.phaseBarCurrent}>{project.phase}</span>
                      </div>
                      <div className={styles.phaseTrack}>
                        {PHASES.map((ph, pi) => (
                          <div
                            key={ph}
                            className={`${styles.phaseStep} ${pi <= idx ? styles.phaseStepDone : ""} ${pi === idx ? styles.phaseStepActive : ""}`}
                            title={ph}
                          />
                        ))}
                      </div>
                      <div className={styles.phaseNames}>
                        <span>{PHASES[0]}</span>
                        <span>{PHASES[PHASES.length - 1]}</span>
                      </div>
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
                    Project details <ArrowRight size={13} />
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* ── CTA ── */}
      <section className={styles.cta}>
        <div className={styles.ctaInner}>
          <div className={styles.ctaGlow} aria-hidden="true" />
          <h2 className={styles.ctaHeading}>
            Want to shape what&apos;s{" "}
            <span className={styles.ctaAccent}>coming next?</span>
          </h2>
          <p className={styles.ctaSub}>
            Eka is a volunteer-driven organisation. Student researchers, engineers, and educators can contribute to pre-launch phases — from instrument design to outreach planning.
          </p>
          <div className={styles.ctaActions}>
            <Link href="/opportunities/join" className={styles.ctaBtn}>
              Join Eka Research <ArrowRight size={15} />
            </Link>
            <Link href="/contact" className={styles.ctaGhost}>
              Partner / sponsor a project
            </Link>
          </div>
        </div>
      </section>

    </main>
  );
}
