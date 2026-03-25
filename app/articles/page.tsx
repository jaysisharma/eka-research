import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ExternalLink } from "lucide-react";
import PageHero from "@/components/ui/PageHero";
import { buildMetadata } from "@/lib/seo";
import { ARTICLES, type Article, type ArticleType } from "@/lib/constants";
import styles from "./page.module.css";

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

function groupByYear(articles: Article[]) {
  const map = new Map<number, Article[]>();
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

const featured = ARTICLES.find((a) => a.featured)!;
const listed   = ARTICLES.filter((a) => !a.featured);
const grouped  = groupByYear(listed);

const totalJournals = new Set(ARTICLES.map((a) => a.journal)).size;
const yearStart     = Math.min(...ARTICLES.map((a) => a.year));

export default function ArticlesPage() {
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
            { v: String(ARTICLES.length), l: "Publications" },
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
      <section className={styles.featuredSection}>
        <div className={styles.sectionInner}>
          <span className={styles.sectionLabel}>
            <span className={styles.labelLine} />
            Featured paper
          </span>

          <article className={styles.featuredCard}>
            <div className={styles.featuredImgWrap}>
              <Image
                src={featured.image}
                alt={featured.title}
                fill
                sizes="(max-width: 900px) 100vw, 40vw"
                className={styles.featuredImg}
              />
              <div className={styles.featuredImgOverlay} />
            </div>

            <div className={styles.featuredContent}>
              <div className={styles.featuredMain}>
                <TypeBadge type={featured.type} />
                <h2 className={styles.featuredTitle}>{featured.title}</h2>
                <p className={styles.featuredMeta}>
                  <AuthorList authors={featured.authors} ekaAuthors={featured.ekaAuthors} />
                  {" — "}
                  <em>{featured.journal}</em>, {featured.year}
                </p>
                <p className={styles.featuredAbstract}>{featured.abstract}</p>
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
                <div className={styles.featuredLinksNote}>
                  Gold names are Eka Research members.
                </div>
              </div>
            </div>
          </article>
        </div>
      </section>

      {/* ── 4. Year-grouped list ── */}
      <section className={styles.listSection}>
        <div className={styles.sectionInner}>
          <span className={styles.sectionLabel}>
            <span className={styles.labelLine} />
            All publications
          </span>

          {grouped.map(([year, articles]) => (
            <div key={year} className={styles.yearGroup}>
              <div className={styles.yearHeading} aria-label={`Publications from ${year}`}>
                {year}
              </div>

              <div className={styles.yearArticles}>
                {articles.map((a) => (
                  <article key={a.id} className={styles.articleRow}>
                    <div className={styles.thumbWrap}>
                      <Image
                        src={a.image}
                        alt={a.title}
                        fill
                        sizes="120px"
                        className={styles.thumbImg}
                      />
                      <div className={styles.thumbOverlay} />
                      <TypeBadge type={a.type} />
                    </div>

                    <div className={styles.articleBody}>
                      <h3 className={styles.articleTitle}>{a.title}</h3>
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
                    </div>
                  </article>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

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
