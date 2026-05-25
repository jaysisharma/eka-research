import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft, ExternalLink, Lock, FileText,
  Github, Database, BookOpen, Calendar, Users,
  Tag, ArrowRight,
} from "lucide-react";
import { buildMetadata } from "@/lib/seo";
import { getArticleById, getPublishedArticles } from "@/lib/research";
import { auth } from "@/lib/auth";
import { renderMarkdown } from "@/lib/markdown";
import type { Metadata } from "next";
import styles from "./page.module.css";

/* ── Static params for build-time generation ───────────────── */
// Wrapped in try/catch: during Docker builds the DB isn't available, so we
// return an empty list and let Next.js render pages on-demand at runtime.
export async function generateStaticParams() {
  try {
    const articles = await getPublishedArticles();
    return articles.map((a) => ({ id: a.id }));
  } catch {
    return [];
  }
}

/* ── Per-page SEO ───────────────────────────────────────────── */
type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const article = await getArticleById(id);
  if (!article) return {};
  return buildMetadata({
    title: article.title,
    description: article.abstract.slice(0, 160),
    path: `/articles/${id}`,
  });
}

function safeHostname(url: string): string {
  try { return new URL(url).hostname.replace("www.", ""); }
  catch { return url; }
}

const FALLBACK_IMG =
  "https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?auto=format&fit=crop&w=1200&q=80";

const PUB_STATUS_LABEL: Record<string, string> = {
  draft:        "Draft",
  under_review: "Under Review",
  accepted:     "Accepted",
  published:    "Published",
};

const TYPE_LABEL: Record<string, string> = {
  journal:    "Journal Article",
  conference: "Conference Paper",
  preprint:   "Preprint",
  report:     "Technical Report",
};

/* ── Page ───────────────────────────────────────────────────── */
export default async function ArticleDetailPage({ params }: Props) {
  const { id } = await params;

  const [article, session] = await Promise.all([
    getArticleById(id),
    auth(),
  ]);

  if (!article || !article.published) notFound();

  const isPaidUser =
    session?.user?.role === "PAID_MEMBER" || session?.user?.role === "ADMIN";
  const locked = article.isPremium && !isPaidUser;

  const ekaSet = new Set(article.ekaAuthors);

  return (
    <main className={styles.page}>
      {/* ── Atmospheric background ── */}
      <div className={styles.grid} aria-hidden="true" />
      <div className={styles.glow1} aria-hidden="true" />
      <div className={styles.glow2} aria-hidden="true" />

      <div className={styles.inner}>

        {/* ── Back nav ── */}
        <nav className={styles.breadcrumb}>
          <Link href="/articles" className={styles.backLink}>
            <ArrowLeft size={14} strokeWidth={2} />
            All publications
          </Link>
          <span className={styles.breadSep}>/</span>
          <span className={styles.breadCurrent}>
            {TYPE_LABEL[article.type] ?? article.type}
          </span>
        </nav>

        {/* ── HERO CARD ── */}
        <article className={`${styles.hero} ${locked ? styles.heroLocked : ""}`}>

          {/* Cover image strip */}
          <div className={styles.heroImgWrap}>
            <Image
              src={article.imageUrl ?? FALLBACK_IMG}
              alt={article.title}
              fill
              sizes="(max-width: 900px) 100vw, 1200px"
              priority
              className={styles.heroImg}
            />
            <div className={styles.heroImgOverlay} />

            {/* Type + premium badges */}
            <div className={styles.heroBadgeRow}>
              <span className={`${styles.typeBadge} ${styles[`type${article.type.charAt(0).toUpperCase() + article.type.slice(1)}`]}`}>
                {TYPE_LABEL[article.type] ?? article.type}
              </span>
              {article.isPremium && (
                <span className={styles.premiumBadge}>
                  <Lock size={10} strokeWidth={2.5} /> Premium
                </span>
              )}
            </div>

            {/* Year stat */}
            <span className={styles.yearBadge}>{article.year}</span>
          </div>

          {/* ── Content body ── */}
          <div className={styles.body}>

            {/* Title */}
            <h1 className={styles.title}>{article.title}</h1>

            {/* Authors */}
            <p className={styles.authors}>
              {article.authors.map((name, i) => (
                <span key={name}>
                  {i > 0 && <span className={styles.authorSep}>, </span>}
                  <span className={ekaSet.has(name) ? styles.authorEka : styles.authorName}>
                    {name}
                    {ekaSet.has(name) && (
                      <span className={styles.ekaBadge} title="Eka Research Member">Eka</span>
                    )}
                  </span>
                </span>
              ))}
            </p>

            {/* Journal / venue */}
            {article.journal && (
              <p className={styles.journal}>
                <BookOpen size={13} strokeWidth={2} className={styles.metaIcon} />
                <em>{article.journal}</em>
                {article.publicationDate && (
                  <span className={styles.pubDate}> · {article.publicationDate}</span>
                )}
              </p>
            )}

            {/* Divider */}
            <hr className={styles.divider} />

            {/* ── TWO-COLUMN LAYOUT ── */}
            <div className={styles.twoCol}>

              {/* LEFT: Abstract + Disciplines */}
              <div className={styles.mainCol}>

                <section className={styles.section}>
                  <h2 className={styles.sectionTitle}>Abstract</h2>

                  {locked ? (
                    /* ── PREMIUM GATE ── */
                    <div className={styles.abstractGate}>
                      <p className={styles.abstractBlurred}>{article.abstract}</p>
                      <div className={styles.gateOverlay}>
                        <div className={styles.gateIcon}>
                          <Lock size={22} strokeWidth={1.8} />
                        </div>
                        <h3 className={styles.gateTitle}>Premium paper</h3>
                        <p className={styles.gateText}>
                          Full access — including the abstract, all links, and downloadable PDF — is available exclusively to Eka Research paid members.
                        </p>
                        <div className={styles.gateActions}>
                          <Link href="/member-benefits" className={styles.gateUpgradeBtn}>
                            Upgrade to read <ArrowRight size={13} />
                          </Link>
                          {!session && (
                            <Link href="/auth/login" className={styles.gateLoginBtn}>
                              Sign in
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className={styles.abstract}>{article.abstract}</p>
                  )}
                </section>

                {/* Disciplines */}
                {article.disciplines.length > 0 && (
                  <section className={styles.section}>
                    <h2 className={styles.sectionTitle}>
                      <Tag size={13} strokeWidth={2} style={{ display: "inline", marginRight: 6, verticalAlign: "middle" }} />
                      Disciplines
                    </h2>
                    <div className={styles.tagCloud}>
                      {article.disciplines.map((d) => (
                        <span key={d} className={styles.tag}>{d}</span>
                      ))}
                    </div>
                  </section>
                )}

                {/* Full paper body */}
                {article.content && (
                  <section className={styles.section}>
                    <h2 className={styles.sectionTitle}>Full Paper</h2>
                    {locked ? (
                      <div className={styles.contentGate}>
                        <Lock size={14} strokeWidth={2} className={styles.contentGateLock} />
                        <p className={styles.contentGateText}>
                          The full paper is available to premium members only.
                        </p>
                        <Link href="/member-benefits" className={styles.gateUpgradeBtn}>
                          Upgrade to read <ArrowRight size={13} />
                        </Link>
                      </div>
                    ) : (
                      <div
                        className={styles.paperBody}
                        dangerouslySetInnerHTML={{ __html: renderMarkdown(article.content) }}
                      />
                    )}
                  </section>
                )}
              </div>

              {/* RIGHT: Metadata sidebar */}
              <aside className={styles.sidebar}>

                {/* Access links */}
                <div className={styles.sideCard}>
                  <p className={styles.sideCardTitle}>Access paper</p>

                  {locked ? (
                    <div className={styles.sideGate}>
                      <Lock size={13} strokeWidth={2} className={styles.sideLock} />
                      <span className={styles.sideGateText}>Premium members only</span>
                      <Link href="/member-benefits" className={styles.sideGateBtn}>
                        Upgrade <ArrowRight size={10} />
                      </Link>
                    </div>
                  ) : (
                    <div className={styles.linkStack}>
                      {article.doi && (
                        <a
                          href={`https://doi.org/${article.doi}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={styles.accessLink}
                        >
                          <ExternalLink size={12} strokeWidth={2} />
                          <span>
                            <span className={styles.accessLinkLabel}>DOI</span>
                            <span className={styles.accessLinkSub}>{article.doi}</span>
                          </span>
                        </a>
                      )}
                      {article.arxiv && (
                        <a
                          href={`https://arxiv.org/abs/${article.arxiv}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={styles.accessLink}
                        >
                          <ExternalLink size={12} strokeWidth={2} />
                          <span>
                            <span className={styles.accessLinkLabel}>arXiv</span>
                            <span className={styles.accessLinkSub}>{article.arxiv}</span>
                          </span>
                        </a>
                      )}
                      {article.externalUrl && (
                        <a
                          href={article.externalUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={styles.accessLink}
                        >
                          <ExternalLink size={12} strokeWidth={2} />
                          <span>
                            <span className={styles.accessLinkLabel}>Publisher link</span>
                            <span className={styles.accessLinkSub}>
                              {safeHostname(article.externalUrl)}
                            </span>
                          </span>
                        </a>
                      )}
                      {article.pdfUrl && (
                        <a
                          href={article.pdfUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`${styles.accessLink} ${styles.accessLinkPdf}`}
                        >
                          <FileText size={12} strokeWidth={2} />
                          <span>
                            <span className={styles.accessLinkLabel}>Download PDF</span>
                            <span className={styles.accessLinkSub}>Full paper</span>
                          </span>
                        </a>
                      )}
                      {article.githubUrl && (
                        <a
                          href={article.githubUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={styles.accessLink}
                        >
                          <Github size={12} strokeWidth={2} />
                          <span>
                            <span className={styles.accessLinkLabel}>Code repository</span>
                            <span className={styles.accessLinkSub}>GitHub</span>
                          </span>
                        </a>
                      )}
                      {article.datasetUrl && (
                        <a
                          href={article.datasetUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={styles.accessLink}
                        >
                          <Database size={12} strokeWidth={2} />
                          <span>
                            <span className={styles.accessLinkLabel}>Dataset</span>
                            <span className={styles.accessLinkSub}>
                              {safeHostname(article.datasetUrl)}
                            </span>
                          </span>
                        </a>
                      )}
                      {!article.doi && !article.arxiv && !article.pdfUrl && !article.externalUrl && (
                        <p className={styles.noLinks}>No public links yet.</p>
                      )}
                    </div>
                  )}
                </div>

                {/* Details */}
                <div className={styles.sideCard}>
                  <p className={styles.sideCardTitle}>Details</p>
                  <dl className={styles.detailList}>
                    <div className={styles.detailRow}>
                      <dt className={styles.detailKey}>
                        <Calendar size={11} strokeWidth={2} /> Year
                      </dt>
                      <dd className={styles.detailVal}>{article.year || "—"}</dd>
                    </div>
                    <div className={styles.detailRow}>
                      <dt className={styles.detailKey}>
                        <BookOpen size={11} strokeWidth={2} /> Type
                      </dt>
                      <dd className={styles.detailVal}>{TYPE_LABEL[article.type] ?? article.type}</dd>
                    </div>
                    <div className={styles.detailRow}>
                      <dt className={styles.detailKey}>
                        <Users size={11} strokeWidth={2} /> Authors
                      </dt>
                      <dd className={styles.detailVal}>{article.authors.length}</dd>
                    </div>
                    {article.publicationStatus && (
                      <div className={styles.detailRow}>
                        <dt className={styles.detailKey}>Status</dt>
                        <dd className={styles.detailVal}>
                          <span className={`${styles.statusPill} ${styles[`status_${article.publicationStatus}`]}`}>
                            {PUB_STATUS_LABEL[article.publicationStatus] ?? article.publicationStatus}
                          </span>
                        </dd>
                      </div>
                    )}
                  </dl>
                </div>

                {/* Eka authors note */}
                {article.ekaAuthors.length > 0 && (
                  <p className={styles.ekaNote}>
                    <span className={styles.ekaNoteDot} />
                    Names highlighted in gold are Eka Research members.
                  </p>
                )}
              </aside>
            </div>
          </div>
        </article>

        {/* ── Bottom CTA ── */}
        <div className={styles.bottomCta}>
          <Link href="/articles" className={styles.ctaBack}>
            <ArrowLeft size={13} /> Back to all publications
          </Link>
          {locked && (
            <Link href="/member-benefits" className={styles.ctaUpgrade}>
              Unlock full access <ArrowRight size={13} />
            </Link>
          )}
        </div>

      </div>
    </main>
  );
}
