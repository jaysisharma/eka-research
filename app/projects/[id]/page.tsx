export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, CalendarDays, Tag, CheckCircle2, Rocket } from "lucide-react";
import { db } from "@/lib/db";
import { PROJECTS } from "@/lib/constants";
import { buildMetadata } from "@/lib/seo";
import ProjectGallery from "@/components/projects/ProjectGallery";
import type { Metadata } from "next";
import styles from "./page.module.css";

type Props = { params: Promise<{ id: string }> };

/* Normalised shape used for rendering — decoupled from DB vs static */
type ProjectDetail = {
  title:        string;
  description:  string;
  status:       string;
  period:       string;
  categoryName: string;
  imageUrl:     string | null;
  images:       string[];
  tags:         string[];
  outcome:      string | null;
  phase:        string | null;
  launchTarget: string | null;
};

const parseArr = (raw: string | null | undefined): string[] => {
  if (!raw) return [];
  try { return JSON.parse(raw) as string[]; } catch { return []; }
};

const STATUS_LABEL: Record<string, string> = {
  active:    "Active",
  ongoing:   "Ongoing",
  completed: "Completed",
  planned:   "Upcoming",
  upcoming:  "Upcoming",
  on_hold:   "On Hold",
};

const STATUS_CLASS: Record<string, string> = {
  active:    "statusOngoing",
  ongoing:   "statusOngoing",
  completed: "statusCompleted",
  planned:   "statusUpcoming",
  upcoming:  "statusUpcoming",
  on_hold:   "statusCompleted",
};

const FALLBACK_IMG =
  "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80";

async function resolveProject(id: string): Promise<ProjectDetail | null> {
  /* 1. Try database first */
  try {
    const db_project = await db.project.findFirst({
      where: { OR: [{ id }, { href: `/projects/${id}` }], published: true },
      include: { category: true },
    });
    if (db_project) {
      return {
        title:        db_project.title,
        description:  db_project.description,
        status:       db_project.status,
        period:       db_project.period,
        categoryName: db_project.category.name,
        imageUrl:     db_project.imageUrl ?? null,
        images:       parseArr(db_project.images),
        tags:         parseArr(db_project.tags),
        outcome:      db_project.outcome ?? null,
        phase:        db_project.phase ?? null,
        launchTarget: db_project.launchTarget ?? null,
      };
    }
  } catch {
    /* DB unavailable — fall through to static */
  }

  /* 2. Fall back to static constant (shown when DB is empty) */
  const staticProject = PROJECTS.find(
    (p) => p.id === id || p.href === `/projects/${id}`
  );
  if (!staticProject) return null;

  return {
    title:        staticProject.title,
    description:  staticProject.description,
    status:       staticProject.status,
    period:       staticProject.period,
    categoryName: staticProject.tags[0] ?? "Project",
    imageUrl:     staticProject.image ?? null,
    images:       [],
    tags:         staticProject.tags,
    outcome:      staticProject.outcome ?? null,
    phase:        staticProject.phase ?? null,
    launchTarget: staticProject.launchTarget ?? null,
  };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const project = await resolveProject(id);
  if (!project) return {};
  return buildMetadata({
    title: project.title,
    description: project.description.slice(0, 160),
    path: `/projects/${id}`,
  });
}

export default async function ProjectDetailPage({ params }: Props) {
  const { id } = await params;
  const project = await resolveProject(id);

  if (!project) notFound();

  const label = STATUS_LABEL[project.status] ?? project.status;
  const cls   = STATUS_CLASS[project.status] ?? "statusCompleted";

  return (
    <main className={styles.page}>
      <div className={styles.gridBg} aria-hidden="true" />
      <div className={styles.glow}   aria-hidden="true" />

      <div className={styles.inner}>

        {/* ── Back nav ── */}
        <nav className={styles.breadcrumb}>
          <Link href="/projects" className={styles.backLink}>
            <ArrowLeft size={14} strokeWidth={2} /> Back to Projects
          </Link>
          <span className={styles.breadSep}>/</span>
          <span className={styles.breadCurrent}>{project.categoryName}</span>
        </nav>

        {/* ── Cover image ── */}
        <div className={styles.heroWrap}>
          <Image
            src={project.imageUrl ?? FALLBACK_IMG}
            alt={project.title}
            fill
            sizes="(max-width: 900px) 100vw, 1100px"
            priority
            className={styles.heroImg}
          />
          <div className={styles.heroOverlay} />
          <span className={`${styles.statusBadge} ${styles[cls]}`}>
            <span className={styles.dot} />
            {label}
          </span>
        </div>

        {/* ── Article ── */}
        <article className={styles.article}>

          <div className={styles.meta}>
            <span className={styles.metaItem}>
              <CalendarDays size={13} /> {project.period}
            </span>
            <span className={styles.metaDot} />
            <span className={styles.metaItem}>{project.categoryName}</span>
          </div>

          <h1 className={styles.title}>{project.title}</h1>

          {project.tags.length > 0 && (
            <div className={styles.tags}>
              {project.tags.map((t) => (
                <span key={t} className={styles.tag}>
                  <Tag size={10} /> {t}
                </span>
              ))}
            </div>
          )}

          <hr className={styles.divider} />

          <p className={styles.description}>{project.description}</p>

          {project.outcome && (
            <div className={styles.outcomeBox}>
              <div className={styles.outcomeHead}>
                <CheckCircle2 size={15} /> <span>Impact</span>
              </div>
              <p className={styles.outcomeText}>{project.outcome}</p>
            </div>
          )}

          {(project.phase || project.launchTarget) && (
            <div className={styles.phaseBox}>
              <div className={styles.phaseHead}>
                <Rocket size={15} /> <span>Development</span>
              </div>
              {project.phase && (
                <p className={styles.phaseText}>
                  <strong>Phase:</strong> {project.phase}
                </p>
              )}
              {project.launchTarget && (
                <p className={styles.phaseText}>
                  <strong>Target launch:</strong> {project.launchTarget}
                </p>
              )}
            </div>
          )}

          {/* ── Gallery (cover + all uploaded images) ── */}
          <ProjectGallery
            coverImage={project.imageUrl}
            galleryImages={project.images}
            title={project.title}
          />

        </article>
      </div>
    </main>
  );
}
