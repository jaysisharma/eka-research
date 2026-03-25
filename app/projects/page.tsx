import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CalendarDays, Tag, Clock } from "lucide-react";
import PageHero from "@/components/ui/PageHero";
import { buildMetadata } from "@/lib/seo";
import { PROJECTS, type ProjectStatus } from "@/lib/constants";
import styles from "./page.module.css";

export const metadata = buildMetadata({
  title: "Projects",
  description:
    "Explore Eka Research's active, completed, and upcoming projects — from the All Sky Camera network to stratospheric balloon missions and solar eclipse expeditions.",
  path: "/projects",
});

const STATUS_LABEL: Record<ProjectStatus, string> = {
  ongoing:   "Ongoing",
  completed: "Completed",
  upcoming:  "Upcoming",
};

const STATUS_CLASS: Record<ProjectStatus, string> = {
  ongoing:   "statusOngoing",
  completed: "statusCompleted",
  upcoming:  "statusUpcoming",
};

const ongoing   = PROJECTS.filter((p) => p.status === "ongoing");
const completed = PROJECTS.filter((p) => p.status === "completed");
const upcoming  = PROJECTS.filter((p) => p.status === "upcoming");

const featured = ongoing[0] ?? PROJECTS[0];
const restOngoing = ongoing.slice(1);

const IMPACT = [
  { value: "5",     label: "Active instruments" },
  { value: "3,800+", label: "Meteors recorded" },
  { value: "28 km",  label: "Max balloon altitude" },
  { value: "3",     label: "Active projects" },
];

export default function ProjectsPage() {
  return (
    <main>

      {/* ── 1. Hero ── */}
      <PageHero
        label="Projects"
        title="Instruments in the field. "
        accentWord="Science in motion."
        description="From real-time sky surveillance to stratospheric ballooning — every Eka project generates data that matters and knowledge that's shared freely."
        align="left"
        variant="dark"
        cta={{ label: "See ongoing work", href: "#ongoing" }}
        ctaSecondary={{ label: "View publications", href: "/articles" }}
      />

      {/* ── 2. Impact stats strip ── */}
      <section className={styles.statsStrip}>
        <div className={styles.statsInner}>
          {IMPACT.map(({ value, label }) => (
            <div key={label} className={styles.statItem}>
              <span className={styles.statValue}>{value}</span>
              <span className={styles.statLabel}>{label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── 3. Featured / ongoing ── */}
      <section className={styles.section} id="ongoing">
        <div className={styles.sectionInner}>
          <div className={styles.sectionHeader}>
            <span className={styles.label}>
              <span className={styles.labelLine} />
              Ongoing
            </span>
            <h2 className={styles.sectionHeading}>Active research projects</h2>
          </div>

          {/* Large featured card */}
          <div className={styles.featuredCard}>
            <div className={styles.featuredImgWrap}>
              <Image
                src={featured.image}
                alt={featured.title}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 55vw"
                className={styles.featuredImg}
              />
              <div className={styles.featuredImgOverlay} />
              <div className={`${styles.featuredStatusBadge} ${styles[STATUS_CLASS[featured.status]]}`}>
                <span className={styles.statusDot} />
                {STATUS_LABEL[featured.status]}
              </div>
            </div>

            <div className={styles.featuredBody}>
              <div className={styles.featuredMeta}>
                <span className={styles.featuredPeriod}>
                  <CalendarDays size={13} />
                  {featured.period}
                </span>
              </div>
              <h2 className={styles.featuredTitle}>{featured.title}</h2>
              <p className={styles.featuredDesc}>{featured.description}</p>
              <div className={styles.featuredTags}>
                {featured.tags.map((t) => (
                  <span key={t} className={styles.tag}>
                    <Tag size={11} />
                    {t}
                  </span>
                ))}
              </div>
              <Link href={featured.href} className={styles.featuredLink}>
                Project details <ArrowRight size={14} />
              </Link>
            </div>
          </div>

          {/* Additional ongoing projects */}
          {restOngoing.length > 0 && (
            <div className={styles.projectsGrid}>
              {restOngoing.map((p) => (
                <ProjectCard key={p.id} project={p} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── 4. Upcoming ── */}
      {upcoming.length > 0 && (
        <section className={`${styles.section} ${styles.sectionSurface}`} id="upcoming">
          <div className={styles.sectionInner}>
            <div className={styles.sectionHeader}>
              <span className={styles.label}>
                <span className={styles.labelLine} />
                Upcoming
              </span>
              <h2 className={styles.sectionHeading}>Coming soon</h2>
              <p className={styles.sectionSub}>
                Projects in planning and early development — get involved before they launch.
              </p>
            </div>

            <div className={styles.upcomingGrid}>
              {upcoming.map((p) => (
                <div key={p.id} className={styles.upcomingCard}>
                  <div className={styles.upcomingImgWrap}>
                    <Image
                      src={p.image}
                      alt={p.title}
                      fill
                      sizes="(max-width: 1024px) 100vw, 50vw"
                      className={styles.upcomingImg}
                    />
                    <div className={styles.upcomingImgOverlay} />
                    <div className={`${styles.upcomingBadge} ${styles.statusUpcoming}`}>
                      <Clock size={12} />
                      {p.period}
                    </div>
                  </div>
                  <div className={styles.upcomingBody}>
                    <h3 className={styles.upcomingTitle}>{p.title}</h3>
                    <p className={styles.upcomingDesc}>{p.description}</p>
                    <div className={styles.featuredTags}>
                      {p.tags.map((t) => (
                        <span key={t} className={styles.tag}>
                          <Tag size={11} />
                          {t}
                        </span>
                      ))}
                    </div>
                    <Link href={p.href} className={styles.cardLink}>
                      Learn more <ArrowRight size={13} />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── 5. Completed ── */}
      {completed.length > 0 && (
        <section className={styles.section} id="past">
          <div className={styles.sectionInner}>
            <div className={styles.sectionHeader}>
              <span className={styles.label}>
                <span className={styles.labelLine} />
                Past Projects
              </span>
              <h2 className={styles.sectionHeading}>Completed work</h2>
              <p className={styles.sectionSub}>
                Every completed project leaves behind open data, published findings, and lessons that feed our next mission.
              </p>
            </div>

            <div className={styles.projectsGrid}>
              {completed.map((p) => (
                <ProjectCard key={p.id} project={p} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── 6. CTA ── */}
      <section className={styles.ctaSection}>
        <div className={styles.ctaInner}>
          <div className={styles.ctaGlow} aria-hidden="true" />
          <h2 className={styles.ctaHeading}>
            Want to contribute to a{" "}
            <span className={styles.ctaAccent}>live project?</span>
          </h2>
          <p className={styles.ctaSub}>
            Members get early access to project data, collaboration opportunities, and the chance to contribute to published research.
          </p>
          <div className={styles.ctaActions}>
            <Link href="/member-benefits" className={styles.ctaBtn}>
              Become a member <ArrowRight size={16} />
            </Link>
            <Link href="/contact" className={styles.ctaBtnGhost}>
              Partner with us
            </Link>
          </div>
        </div>
      </section>

    </main>
  );
}

/* ── Shared project card ── */
function ProjectCard({ project }: { project: (typeof PROJECTS)[number] }) {
  return (
    <Link href={project.href} className={styles.projectCard}>
      <div className={styles.projectImgWrap}>
        <Image
          src={project.image}
          alt={project.title}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className={styles.projectImg}
        />
        <div className={styles.projectImgOverlay} />
        <div className={`${styles.projectStatusBadge} ${styles[STATUS_CLASS[project.status]]}`}>
          <span className={styles.statusDot} />
          {STATUS_LABEL[project.status]}
        </div>
      </div>
      <div className={styles.projectBody}>
        <div className={styles.projectMetaRow}>
          <span className={styles.projectPeriod}>
            <CalendarDays size={12} />
            {project.period}
          </span>
        </div>
        <h3 className={styles.projectTitle}>{project.title}</h3>
        <p className={styles.projectDesc}>{project.description}</p>
        <div className={styles.projectTags}>
          {project.tags.map((t) => (
            <span key={t} className={styles.tag}>
              <Tag size={10} />
              {t}
            </span>
          ))}
        </div>
        <span className={styles.cardLink}>
          Details <ArrowRight size={13} />
        </span>
      </div>
    </Link>
  );
}
