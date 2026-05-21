import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ExternalLink, Lock } from "lucide-react";
import PageHero from "@/components/ui/PageHero";
import { buildMetadata } from "@/lib/seo";
import { getPublishedArticles, type ResearchArticle } from "@/lib/research";
import type { ArticleType } from "@/lib/constants";
import { auth } from "@/lib/auth";
import styles from "./page.module.css";

export const dynamic = "force-dynamic";

export const metadata = buildMetadata({
  title: "Articles",
  description:
    "Peer-reviewed research, conference papers, and preprints authored by Eka Research members — covering meteor science, atmospheric physics, space weather, and more.",
  path: "/articles",
});

/* ── helpers ── */
const TYPE_LABEL: Record<ArticleType, string> = {
  journal:    "Journal",
  conference: "Conference",
  preprint:   "Preprint",
  report:     "Report",
};

const FALLBACK_IMG = "https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?auto=format&fit=crop&w=1200&q=80";

function groupByYear(articles: ResearchArticle[]) {
  const map = new Map<number, ResearchArticle[]>();
  for (const a of articles) {
    if (!map.has(a.year)) map.set(a.year, []);
    map.get(a.year)!.push(a);
  }
  return [...map.entries()].sort((a, b) => b[0] - a[0]);
}

function AuthorList({ authors, ekaAuthors }: { authors: string[]; ekaAuthors: string[] }) {
  const ekaSet = new Set(ekaAuthors);
  return (
    <span className={styles.authors}>
      {authors.map((name, i) => (
        <span key={name}>
          {i > 0 && ", "}
          <span className={ekaSet.has(name) ? styles.authorEka : undefined}>{name}</span>
        </span>
      ))}
    </span>
  );
}

function TypeBadge({ type }: { type: ArticleType }) {
  return (
    <span className={`${styles.badge} ${styles[`badge${type.charAt(0).toUpperCase() + type.slice(1)}`]}`}>
      {TYPE_LABEL[type]}
    </span>
  );
}

export default async function ArticlesPage() {
  const [articles, session] = await Promise.all([
    getPublishedArticles(),
    auth(),
  ]);
  const isPaidUser = session?.user?.role === "PAID_MEMBER" || session?.user?.role === "ADMIN";
  const featured = articles.find((a) => a.featured) ?? articles[0];
  const listed = articles.filter((a) => a.id !== featured?.id);
  const grouped = groupByYear(listed);

  const totalJournals = new Set(articles.map((a) => a.journal)).size;
  const yearStart = articles.length ? Math.min(...articles.map((a) => a.year)) : new Date().getFullYear();

  return (
    <main>

      {/* ── 1. Hero ── */}
      <PageHero
        label="Publications"
        title="Research from Nepal's "
        accentWord="skies"
        description="Peer-reviewed papers, conference proceedings, and preprints published by Eka Research members. Open science — always."
        align="left"
        variant="dark"
      />

      {/* ── 2. Stats strip ── */}
      <div className={styles.statsStrip}>
        <div className={styles.statsInner}>
          {[
            { v: String(articles.length), l: "Publications" },
            { v: String(totalJournals),   l: "Journals & venues" },
            { v: `${yearStart}–`,         l: "Publishing since" },
          ].map(({ v, l }) => (
            <div key={l} className={styles.stat}>
              <span className={styles.statVal}>{v}</span>
              <span className={styles.statLbl}>{l}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── 3. Featured article ── */}
      {featured && (() => {
        const featuredLocked = featured.isPremium && !isPaidUser;
        return (
          <section className={styles.featuredSection}>
            <div className={styles.sectionInner}>
              <span className={styles.sectionLabel}>
                <span className={styles.labelLine} />
                Featured paper
              </span>

              <article className={`${styles.featuredCard} ${featuredLocked ? styles.featuredLocked : ""}`}>
                <div className={styles.featuredImgWrap}>
                  <Image
                    src={featured.imageUrl ?? FALLBACK_IMG}
                    alt={featured.title}
                    fill
                    sizes="(max-width: 900px) 100vw, 40vw"
                    className={styles.featuredImg}
                  />
                  <div className={styles.featuredImgOverlay} />
                  {featured.isPremium && (
                    <span className={styles.featuredPremiumTag}>
                      <Lock size={10} strokeWidth={2.5} /> Premium
                    </span>
                  )}
                </div>

                <div className={styles.featuredContent}>
                  <div className={styles.featuredMain}>
                    <TypeBadge type={featured.type} />
                    <h2 className={styles.featuredTitle}>
                      <Link href={`/articles/${featured.id}`} className={styles.titleLink}>
                        {featured.title}
                      </Link>
                    </h2>
                    <p className={styles.featuredMeta}>
                      <AuthorList authors={featured.authors} ekaAuthors={featured.ekaAuthors} />
                      {" — "}
                      <em>{featured.journal}</em>, {featured.year}
                    </p>
                    {featuredLocked ? (
                      <div className={styles.abstractGate}>
                        <p className={styles.abstractBlurred}>{featured.abstract}</p>
                        <div className={styles.abstractOverlay}>
                          <Lock size={16} strokeWidth={2} className={styles.abstractLock} />
                          <p className={styles.abstractGateText}>Full abstract available to premium members</p>
                          <Link href="/member-benefits" className={styles.abstractGateBtn}>
                            Upgrade to read <ArrowRight size={12} />
                          </Link>
                        </div>
                      </div>
                    ) : (
                      <p className={styles.featuredAbstract}>{featured.abstract}</p>
                    )}
                    <div className={styles.featuredTags}>
                      {featured.disciplines.map((d) => (
                        <span key={d} className={styles.tag}>{d}</span>
                      ))}
                    </div>
                  </div>

                  <div className={styles.featuredLinks}>
                    <div className={styles.featuredLinksHead}>
                      <span className={styles.featuredLinksLabel}>Access paper</span>
                    </div>
                    {featuredLocked ? (
                      <div className={styles.linksGate}>
                        <Lock size={12} strokeWidth={2.5} className={styles.gateLockIcon} />
                        <span className={styles.linksGateText}>Unlock full access</span>
                        <Link href="/member-benefits" className={styles.linksGateBtn}>
                          Upgrade <ArrowRight size={11} />
                        </Link>
                      </div>
                    ) : (
                      <>
                        {featured.doi && (
                          <a
                            href={`https://doi.org/${featured.doi}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={styles.linkBtn}
                          >
                            <ExternalLink size={13} />
                            DOI
                          </a>
                        )}
                        {featured.arxiv && (
                          <a
                            href={`https://arxiv.org/abs/${featured.arxiv}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`${styles.linkBtn} ${styles.linkBtnGhost}`}
                          >
                            <ExternalLink size={13} />
                            arXiv
                          </a>
                        )}
                      </>
                    )}
                    <div className={styles.featuredLinksNote}>
                      Gold names are Eka Research members.
                    </div>
                    <Link href={`/articles/${featured.id}`} className={styles.readFullBtn}>
                      Read full paper <ArrowRight size={12} />
                    </Link>
                  </div>
                </div>
              </article>
            </div>
          </section>
        );
      })()}

      {/* ── 4. Year-grouped list ── */}
      {grouped.length > 0 && (
        <section className={styles.listSection}>
          <div className={styles.sectionInner}>
            <span className={styles.sectionLabel}>
              <span className={styles.labelLine} />
              All publications
            </span>

            {grouped.map(([year, yearArticles]) => (
              <div key={year} className={styles.yearGroup}>
                <div className={styles.yearHeading} aria-label={`Publications from ${year}`}>
                  {year}
                </div>

                <div className={styles.yearArticles}>
                  {yearArticles.map((a) => {
                    const locked = a.isPremium && !isPaidUser;
                    return (
                      <article key={a.id} className={`${styles.articleRow} ${locked ? styles.articleRowLocked : ""}`}>
                        <div className={styles.thumbWrap}>
                          <Image
                            src={a.imageUrl ?? FALLBACK_IMG}
                            alt={a.title}
                            fill
                            sizes="120px"
                            className={styles.thumbImg}
                          />
                          <div className={styles.thumbOverlay} />
                          <TypeBadge type={a.type} />
                          {a.isPremium && (
                            <span className={styles.thumbPremium}>
                              <Lock size={9} strokeWidth={2.5} />
                            </span>
                          )}
                        </div>

                        <div className={styles.articleBody}>
                          <h3 className={styles.articleTitle}>
                            <Link href={`/articles/${a.id}`} className={styles.titleLink}>{a.title}</Link>
                          </h3>
                          <p className={styles.articleMeta}>
                            <AuthorList authors={a.authors} ekaAuthors={a.ekaAuthors} />
                            {" — "}
                            <em>{a.journal}</em>
                          </p>
                          <div className={styles.articleTags}>
                            {a.disciplines.map((d) => (
                              <span key={d} className={styles.tag}>{d}</span>
                            ))}
                          </div>
                        </div>

                        <div className={styles.articleLinks}>
                          {locked ? (
                            <Link href="/member-benefits" className={styles.linkPremiumGate}>
                              <Lock size={10} strokeWidth={2.5} />
                              Premium
                            </Link>
                          ) : (
                            <>
                              <Link href={`/articles/${a.id}`} className={styles.linkReadPill}>
                                Read <ArrowRight size={11} />
                              </Link>
                              {a.doi && (
                                <a
                                  href={`https://doi.org/${a.doi}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className={styles.linkPill}
                                >
                                  DOI <ExternalLink size={11} />
                                </a>
                              )}
                              {a.arxiv && (
                                <a
                                  href={`https://arxiv.org/abs/${a.arxiv}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className={`${styles.linkPill} ${styles.linkPillGhost}`}
                                >
                                  arXiv <ExternalLink size={11} />
                                </a>
                              )}
                            </>
                          )}
                        </div>
                      </article>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── 5. CTA strip ── */}
      <section className={styles.ctaStrip}>
        <div className={styles.ctaInner}>
          <div className={styles.ctaText}>
            <h2 className={styles.ctaHeading}>Want to collaborate on research?</h2>
            <p className={styles.ctaSub}>We work with universities, institutions, and independent researchers.</p>
          </div>
          <Link href="/contact" className={styles.ctaBtn}>
            Get in touch <ArrowRight size={16} />
          </Link>
        </div>
      </section>

    </main>
  );
}
