import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, ExternalLink, Github, Database,
  FileText, Calendar, Users, Tag, Clock,
  CheckCircle2, XCircle, BookOpen, Send,
} from "lucide-react";
import { buildMetadata } from "@/lib/seo";
import { renderMarkdown } from "@/lib/markdown";
import type { Metadata } from "next";
import styles from "./page.module.css";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const paper = await db.researchArticle.findUnique({
    where: { id },
    select: { title: true, abstract: true },
  });
  if (!paper) return {};
  return buildMetadata({
    title: paper.title,
    description: paper.abstract?.slice(0, 160) ?? "",
    path: `/dashboard/research/${id}`,
  });
}

const ALLOWED_ROLES = ["RESEARCHER", "PAID_MEMBER", "TEACHER", "MENTOR", "ADMIN"];

const TYPE_LABEL: Record<string, string> = {
  journal:    "Journal Article",
  conference: "Conference Paper",
  preprint:   "Preprint",
  report:     "Technical Report",
};

const STATUS_CONFIG = {
  pending:  { label: "Under Review",  icon: Clock,         cls: "pending"  },
  approved: { label: "Published",     icon: CheckCircle2,  cls: "approved" },
  rejected: { label: "Not Approved",  icon: XCircle,       cls: "rejected" },
} as const;

function parseJson(raw: string): string[] {
  try { return JSON.parse(raw) as string[]; } catch { return []; }
}

export default async function PaperDetailPage({ params }: Props) {
  const { id } = await params;

  const session = await auth();
  if (!session) redirect("/auth/login");

  const { id: userId, role } = session.user as { id: string; role: string };

  if (!ALLOWED_ROLES.includes(role)) redirect("/upgrade");

  const paper = await db.researchArticle.findUnique({ where: { id } });

  if (!paper) notFound();

  // Non-admins can only see their own papers
  if (role !== "ADMIN" && paper.submittedBy !== userId) notFound();

  const authors      = parseJson(paper.authors);
  const ekaAuthors   = parseJson(paper.ekaAuthors);
  const disciplines  = parseJson(paper.disciplines);
  const ekaSet       = new Set(ekaAuthors);

  const statusCfg = STATUS_CONFIG[paper.submissionStatus as keyof typeof STATUS_CONFIG]
    ?? STATUS_CONFIG.pending;
  const StatusIcon = statusCfg.icon;

  return (
    <div className={styles.page}>

      {/* ── BACK NAV ── */}
      <nav className={styles.breadcrumb}>
        <Link href="/dashboard/research" className={styles.backLink}>
          <ArrowLeft size={14} /> My Research
        </Link>
        <span className={styles.sep}>/</span>
        <span className={styles.crumb}>{TYPE_LABEL[paper.type] ?? paper.type}</span>
      </nav>

      {/* ── STATUS BANNER ── */}
      <div className={`${styles.statusBanner} ${styles[`status_${statusCfg.cls}`]}`}>
        <StatusIcon size={16} />
        <div>
          <p className={styles.statusLabel}>{statusCfg.label}</p>
          <p className={styles.statusDesc}>
            {paper.submissionStatus === "pending"  && "Your paper is in the review queue. You'll receive an email once a decision is made."}
            {paper.submissionStatus === "approved" && "This paper is live on the public research archive."}
            {paper.submissionStatus === "rejected" && "This paper was not approved for publication. Contact hello@ekaresearch.org for feedback."}
          </p>
        </div>
        {paper.submissionStatus === "approved" && (
          <Link href={`/articles/${paper.id}`} className={styles.viewPublicBtn}>
            View live <ExternalLink size={13} />
          </Link>
        )}
      </div>

      {/* ── MAIN LAYOUT ── */}
      <div className={styles.layout}>

        {/* ── LEFT: Main content ── */}
        <div className={styles.mainCol}>

          {/* Badges row */}
          <div className={styles.badgeRow}>
            <span className={`${styles.typeBadge} ${styles[`ptype_${paper.type}`]}`}>
              {TYPE_LABEL[paper.type] ?? paper.type}
            </span>
            {paper.isPremium && (
              <span className={styles.premiumBadge}>Premium</span>
            )}
          </div>

          {/* Title */}
          <h1 className={styles.title}>{paper.title}</h1>

          {/* Authors */}
          {authors.length > 0 && (
            <p className={styles.authors}>
              <Users size={13} className={styles.metaIcon} />
              {authors.map((name, i) => (
                <span key={name}>
                  {i > 0 && <span className={styles.authorSep}>, </span>}
                  <span className={ekaSet.has(name) ? styles.authorEka : undefined}>
                    {name}
                    {ekaSet.has(name) && <span className={styles.ekaBadge}>Eka</span>}
                  </span>
                </span>
              ))}
            </p>
          )}

          {/* Journal */}
          {paper.journal && (
            <p className={styles.journal}>
              <BookOpen size={13} className={styles.metaIcon} />
              <em>{paper.journal}</em>
              {paper.publicationDate && (
                <span className={styles.pubDate}> · {paper.publicationDate}</span>
              )}
            </p>
          )}

          <hr className={styles.divider} />

          {/* Abstract */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Abstract</h2>
            <p className={styles.abstract}>{paper.abstract}</p>
          </section>

          {/* Disciplines */}
          {disciplines.length > 0 && (
            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>
                <Tag size={13} style={{ display:"inline", marginRight:6, verticalAlign:"middle" }} />
                Disciplines
              </h2>
              <div className={styles.tagCloud}>
                {disciplines.map((d) => (
                  <span key={d} className={styles.tag}>{d}</span>
                ))}
              </div>
            </section>
          )}

          {/* Full content if written */}
          {paper.content && (
            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>Full Paper</h2>
              <div
                className={styles.paperBody}
                dangerouslySetInnerHTML={{ __html: renderMarkdown(paper.content) }}
              />
            </section>
          )}
        </div>

        {/* ── RIGHT: Sidebar ── */}
        <aside className={styles.sidebar}>

          {/* Access links */}
          <div className={styles.sideCard}>
            <p className={styles.sideCardTitle}>Access links</p>
            <div className={styles.linkStack}>
              {paper.doi && (
                <a href={`https://doi.org/${paper.doi}`} target="_blank" rel="noopener noreferrer" className={styles.accessLink}>
                  <ExternalLink size={12} />
                  <span>
                    <span className={styles.linkLabel}>DOI</span>
                    <span className={styles.linkSub}>{paper.doi}</span>
                  </span>
                </a>
              )}
              {paper.arxiv && (
                <a href={`https://arxiv.org/abs/${paper.arxiv}`} target="_blank" rel="noopener noreferrer" className={styles.accessLink}>
                  <ExternalLink size={12} />
                  <span>
                    <span className={styles.linkLabel}>arXiv</span>
                    <span className={styles.linkSub}>{paper.arxiv}</span>
                  </span>
                </a>
              )}
              {paper.externalUrl && (
                <a href={paper.externalUrl} target="_blank" rel="noopener noreferrer" className={styles.accessLink}>
                  <ExternalLink size={12} />
                  <span>
                    <span className={styles.linkLabel}>Publisher</span>
                    <span className={styles.linkSub}>
                      {(() => { try { return new URL(paper.externalUrl).hostname.replace("www.",""); } catch { return paper.externalUrl; } })()}
                    </span>
                  </span>
                </a>
              )}
              {paper.pdfUrl && (
                <a href={paper.pdfUrl} target="_blank" rel="noopener noreferrer" className={`${styles.accessLink} ${styles.pdfLink}`}>
                  <FileText size={12} />
                  <span>
                    <span className={styles.linkLabel}>Download PDF</span>
                    <span className={styles.linkSub}>Full paper</span>
                  </span>
                </a>
              )}
              {paper.githubUrl && (
                <a href={paper.githubUrl} target="_blank" rel="noopener noreferrer" className={styles.accessLink}>
                  <Github size={12} />
                  <span>
                    <span className={styles.linkLabel}>Code</span>
                    <span className={styles.linkSub}>GitHub</span>
                  </span>
                </a>
              )}
              {paper.datasetUrl && (
                <a href={paper.datasetUrl} target="_blank" rel="noopener noreferrer" className={styles.accessLink}>
                  <Database size={12} />
                  <span>
                    <span className={styles.linkLabel}>Dataset</span>
                    <span className={styles.linkSub}>
                      {(() => { try { return new URL(paper.datasetUrl!).hostname.replace("www.",""); } catch { return "Link"; } })()}
                    </span>
                  </span>
                </a>
              )}
              {!paper.doi && !paper.arxiv && !paper.pdfUrl && !paper.externalUrl && (
                <p className={styles.noLinks}>No external links added.</p>
              )}
            </div>
          </div>

          {/* Details */}
          <div className={styles.sideCard}>
            <p className={styles.sideCardTitle}>Details</p>
            <dl className={styles.detailList}>
              <div className={styles.detailRow}>
                <dt><Calendar size={11} /> Year</dt>
                <dd>{paper.year || "—"}</dd>
              </div>
              <div className={styles.detailRow}>
                <dt><BookOpen size={11} /> Type</dt>
                <dd>{TYPE_LABEL[paper.type] ?? paper.type}</dd>
              </div>
              <div className={styles.detailRow}>
                <dt><Users size={11} /> Authors</dt>
                <dd>{authors.length}</dd>
              </div>
              <div className={styles.detailRow}>
                <dt><Send size={11} /> Submitted</dt>
                <dd>{paper.createdAt.toLocaleDateString("en-GB", { day:"numeric", month:"short", year:"numeric" })}</dd>
              </div>
            </dl>
          </div>

          {/* Eka note */}
          {ekaAuthors.length > 0 && (
            <p className={styles.ekaNote}>
              <span className={styles.ekaNoteDot} />
              Gold names are Eka Research members.
            </p>
          )}
        </aside>
      </div>
    </div>
  );
}
