import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  BookOpen, Plus, Clock,
  CheckCircle2, XCircle, ExternalLink, FileText,
  PartyPopper, ChevronRight,
} from "lucide-react";
import { buildMetadata } from "@/lib/seo";
import styles from "./page.module.css";

export const dynamic = "force-dynamic";

export const metadata = buildMetadata({
  title: "My Research",
  description: "Track and submit your research papers at Eka Research.",
  path: "/dashboard/research",
});

const ALLOWED_ROLES = ["RESEARCHER", "PAID_MEMBER", "TEACHER", "MENTOR", "ADMIN"];

function formatDate(date: Date) {
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

const SUBMISSION_STATUS: Record<string, { label: string; style: string }> = {
  pending:  { label: "Under Review", style: "pending" },
  approved: { label: "Published",    style: "approved" },
  rejected: { label: "Rejected",     style: "rejected" },
};

const TYPE_LABEL: Record<string, string> = {
  journal:    "Journal",
  conference: "Conference",
  preprint:   "Preprint",
  report:     "Report",
};

export default async function ResearchPage({
  searchParams,
}: {
  searchParams: Promise<{ submitted?: string }>;
}) {
  const session = await auth();
  if (!session) redirect("/auth/login");

  const { id: userId, role } = session.user as { id: string; role: string };
  const { submitted } = await searchParams;
  const justSubmitted = submitted === "1";

  if (!ALLOWED_ROLES.includes(role)) {
    redirect("/upgrade");
  }

  const papers = await db.researchArticle.findMany({
    where: { submittedBy: userId },
    orderBy: { createdAt: "desc" },
  });

  const total     = papers.length;
  const pending   = papers.filter((p) => p.submissionStatus === "pending").length;
  const published = papers.filter((p) => p.submissionStatus === "approved").length;
  const rejected  = papers.filter((p) => p.submissionStatus === "rejected").length;

  return (
    <div className={styles.page}>

      {/* ── SUBMISSION SUCCESS BANNER ── */}
      {justSubmitted && (
        <div className={styles.successBanner}>
          <PartyPopper size={18} className={styles.successIcon} />
          <div>
            <p className={styles.successTitle}>Paper submitted successfully!</p>
            <p className={styles.successDesc}>
              Your paper is now under review. The Eka admin team will verify it
              before publishing it to the research archive. You&apos;ll receive an
              email once a decision is made.
            </p>
          </div>
        </div>
      )}

      {/* ── HEADER ── */}
      <header className={styles.header}>
        <div>
          <h1 className={styles.heading}>My Research Papers</h1>
          <p className={styles.sub}>
            {total} paper{total !== 1 ? "s" : ""} submitted
          </p>
        </div>
        <Link href="/dashboard/research/submit" className={styles.submitBtn}>
          <Plus size={16} /> Submit Paper
        </Link>
      </header>

      {/* ── STATS ── */}
      {total > 0 && (
        <div className={styles.statsRow}>
          <div className={styles.statCard}>
            <FileText size={15} className={styles.statIcon} />
            <div>
              <strong className={styles.statValue}>{total}</strong>
              <span className={styles.statLabel}>Total</span>
            </div>
          </div>
          <div className={styles.statCard}>
            <Clock size={15} className={styles.statIconWarning} />
            <div>
              <strong className={styles.statValue}>{pending}</strong>
              <span className={styles.statLabel}>Under Review</span>
            </div>
          </div>
          <div className={styles.statCard}>
            <CheckCircle2 size={15} className={styles.statIconSuccess} />
            <div>
              <strong className={styles.statValue}>{published}</strong>
              <span className={styles.statLabel}>Published</span>
            </div>
          </div>
          <div className={styles.statCard}>
            <XCircle size={15} className={styles.statIconError} />
            <div>
              <strong className={styles.statValue}>{rejected}</strong>
              <span className={styles.statLabel}>Rejected</span>
            </div>
          </div>
        </div>
      )}

      {/* ── PAPER LIST ── */}
      {total === 0 ? (
        <div className={styles.emptyFull}>
          <BookOpen size={44} strokeWidth={1} />
          <p className={styles.emptyTitle}>No papers submitted yet</p>
          <p className={styles.emptySub}>
            Share your research with the Eka community. Submit papers to be
            reviewed and published in the research archive.
          </p>
          <Link href="/dashboard/research/submit" className={styles.emptyBtn}>
            <Plus size={15} /> Submit Your First Paper
          </Link>
        </div>
      ) : (
        <div className={styles.paperList}>
          {papers.map((paper) => {
            const status = SUBMISSION_STATUS[paper.submissionStatus] ?? {
              label: paper.submissionStatus,
              style: "pending",
            };
            const authors: string[] = (() => {
              try { return JSON.parse(paper.authors); } catch { return [paper.authors]; }
            })();
            const disciplines: string[] = (() => {
              try { return JSON.parse(paper.disciplines); } catch { return []; }
            })();

            return (
              <div key={paper.id} className={styles.paperCard}>
                <div className={styles.paperTop}>
                  <div className={styles.paperBadgeRow}>
                    <span className={`${styles.typeBadge} ${styles[`ptype_${paper.type}`]}`}>
                      {TYPE_LABEL[paper.type] ?? paper.type}
                    </span>
                    <span className={`${styles.statusBadge} ${styles[`status_${status.style}`]}`}>
                      {status.label}
                    </span>
                    {paper.isPremium && (
                      <span className={styles.premiumBadge}>Premium</span>
                    )}
                  </div>

                  <div className={styles.paperActions}>
                    {paper.doi && (
                      <a
                        href={`https://doi.org/${paper.doi}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.externalLink}
                      >
                        <ExternalLink size={13} /> DOI
                      </a>
                    )}
                    {paper.externalUrl && (
                      <a
                        href={paper.externalUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.externalLink}
                      >
                        <ExternalLink size={13} /> View
                      </a>
                    )}
                  </div>
                </div>

                <h3 className={styles.paperTitle}>{paper.title}</h3>

                {authors.length > 0 && (
                  <p className={styles.paperAuthors}>
                    {authors.slice(0, 3).join(", ")}
                    {authors.length > 3 && ` +${authors.length - 3} more`}
                  </p>
                )}

                {paper.abstract && (
                  <p className={styles.paperAbstract}>
                    {paper.abstract.length > 200
                      ? paper.abstract.slice(0, 200) + "…"
                      : paper.abstract}
                  </p>
                )}

                {disciplines.length > 0 && (
                  <div className={styles.disciplinesRow}>
                    {disciplines.slice(0, 4).map((d) => (
                      <span key={d} className={styles.disciplineTag}>{d}</span>
                    ))}
                  </div>
                )}

                <div className={styles.paperFooter}>
                  <span className={styles.paperDate}>
                    Submitted {formatDate(paper.createdAt)}
                  </span>
                  {paper.journal && (
                    <span className={styles.journalLabel}>{paper.journal}</span>
                  )}
                  <Link
                    href={`/dashboard/research/${paper.id}`}
                    className={styles.viewBtn}
                  >
                    View details <ChevronRight size={13} />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
