"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { Search, Lock, ExternalLink, ArrowRight, X } from "lucide-react";
import type { ResearchArticle } from "@/lib/research";
import styles from "./page.module.css";

/* ── Types ──────────────────────────────────────────────── */

type FilterType = "ALL" | "journal" | "conference" | "preprint" | "report";

const TYPE_LABELS: Record<FilterType, string> = {
  ALL:        "All",
  journal:    "Journal",
  conference: "Conference",
  preprint:   "Preprint",
  report:     "Report",
};

const FALLBACK_IMG =
  "https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?auto=format&fit=crop&w=800&q=80";

/* ── Component ──────────────────────────────────────────── */

interface Props {
  articles: ResearchArticle[];
  isPaidUser: boolean;
}

export default function PapersList({ articles, isPaidUser }: Props) {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<FilterType>("ALL");

  /* counts for filter tabs */
  const counts = useMemo(() => {
    const base = { ALL: articles.length, journal: 0, conference: 0, preprint: 0, report: 0 };
    for (const a of articles) {
      if (a.type in base) base[a.type as keyof typeof base]++;
    }
    return base;
  }, [articles]);

  /* filtered list */
  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return articles.filter((a) => {
      const matchType = typeFilter === "ALL" || a.type === typeFilter;
      const matchSearch =
        !q ||
        a.title.toLowerCase().includes(q) ||
        a.authors.some((au) => au.toLowerCase().includes(q)) ||
        a.journal.toLowerCase().includes(q) ||
        a.disciplines.some((d) => d.toLowerCase().includes(q));
      return matchType && matchSearch;
    });
  }, [articles, search, typeFilter]);

  /* group by year */
  const grouped = useMemo(() => {
    const map = new Map<number, ResearchArticle[]>();
    for (const a of filtered) {
      if (!map.has(a.year)) map.set(a.year, []);
      map.get(a.year)!.push(a);
    }
    return [...map.entries()].sort((a, b) => b[0] - a[0]);
  }, [filtered]);

  return (
    <div className={styles.listRoot}>

      {/* ── Filters row ── */}
      <div className={styles.filterBar}>

        {/* Type tabs */}
        <div className={styles.typeTabs}>
          {(Object.keys(TYPE_LABELS) as FilterType[]).map((t) => (
            <button
              key={t}
              className={`${styles.typeTab} ${typeFilter === t ? styles.typeTabActive : ""}`}
              onClick={() => setTypeFilter(t)}
            >
              {TYPE_LABELS[t]}
              <span className={styles.typeTabCount}>{counts[t]}</span>
            </button>
          ))}
        </div>

        {/* Search */}
        <div className={styles.searchWrap}>
          <Search size={13} className={styles.searchIcon} />
          <input
            className={styles.searchInput}
            placeholder="Search title, author, journal…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button className={styles.searchClear} onClick={() => setSearch("")}>
              <X size={12} />
            </button>
          )}
        </div>
      </div>

      {/* ── Results ── */}
      {filtered.length === 0 ? (
        <div className={styles.empty}>
          <p className={styles.emptyTitle}>No papers match your search.</p>
          <button className={styles.emptyReset} onClick={() => { setSearch(""); setTypeFilter("ALL"); }}>
            Clear filters
          </button>
        </div>
      ) : (
        <div className={styles.yearGroups}>
          {grouped.map(([year, yearArticles]) => (
            <div key={year} className={styles.yearGroup}>
              <div className={styles.yearLabel}>{year}</div>
              <div className={styles.paperList}>
                {yearArticles.map((article) => {
                  const locked = article.isPremium && !isPaidUser;
                  const ekaSet = new Set(article.ekaAuthors);

                  return (
                    <article
                      key={article.id}
                      className={`${styles.paperCard} ${locked ? styles.paperCardLocked : ""}`}
                    >
                      {/* Thumbnail */}
                      <div className={styles.thumb}>
                        <Image
                          src={article.imageUrl ?? FALLBACK_IMG}
                          alt={article.title}
                          fill
                          sizes="96px"
                          className={styles.thumbImg}
                        />
                        <div className={styles.thumbOverlay} />
                        {article.isPremium && (
                          <span className={styles.thumbLock}>
                            <Lock size={9} strokeWidth={2.5} />
                          </span>
                        )}
                      </div>

                      {/* Content */}
                      <div className={styles.paperContent}>

                        {/* Meta row */}
                        <div className={styles.metaRow}>
                          <span className={`${styles.typePill} ${styles[`pill_${article.type}`]}`}>
                            {TYPE_LABELS[article.type as FilterType] ?? article.type}
                          </span>
                          {article.isPremium && (
                            <span className={styles.premiumPill}>
                              <Lock size={8} strokeWidth={2.5} /> Premium
                            </span>
                          )}
                          <span className={styles.metaYear}>{article.year}</span>
                          {article.disciplines.length > 0 && (
                            <span className={styles.metaDisciplines}>
                              {article.disciplines.slice(0, 2).join(" · ")}
                              {article.disciplines.length > 2 && ` +${article.disciplines.length - 2}`}
                            </span>
                          )}
                        </div>

                        {/* Title */}
                        <h2 className={styles.paperTitle}>
                          <Link href={`/articles/${article.id}`} className={styles.paperTitleLink}>
                            {article.title}
                          </Link>
                        </h2>

                        {/* Authors */}
                        <p className={styles.authors}>
                          {article.authors.map((name, i) => {
                            const isEka = ekaSet.has(name);
                            return (
                              <span key={name}>
                                {i > 0 && <span className={styles.authorSep}>, </span>}
                                <span className={isEka ? styles.authorEka : undefined}>
                                  {name}
                                  {isEka && (
                                    <span className={styles.ekaBadge} title="Eka Research Member">Eka</span>
                                  )}
                                </span>
                              </span>
                            );
                          })}
                        </p>

                        {/* Journal */}
                        {article.journal && (
                          <p className={styles.journal}>
                            <em>{article.journal}</em>
                            {article.publicationDate && ` · ${article.publicationDate}`}
                          </p>
                        )}

                        {/* Links / gate */}
                        {locked ? (
                          <div className={styles.lockGate}>
                            <Lock size={11} strokeWidth={2.5} className={styles.lockIcon} />
                            <span className={styles.lockText}>Full access for premium members</span>
                            <Link href="/member-benefits" className={styles.lockBtn}>
                              Upgrade <ArrowRight size={10} />
                            </Link>
                          </div>
                        ) : (
                          <div className={styles.linkRow}>
                            <Link href={`/articles/${article.id}`} className={styles.readBtn}>
                              Read paper <ArrowRight size={11} />
                            </Link>
                            {article.doi && (
                              <a
                                href={`https://doi.org/${article.doi}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={styles.extLink}
                              >
                                DOI <ExternalLink size={10} />
                              </a>
                            )}
                            {article.arxiv && (
                              <a
                                href={`https://arxiv.org/abs/${article.arxiv}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={styles.extLink}
                              >
                                arXiv <ExternalLink size={10} />
                              </a>
                            )}
                          </div>
                        )}
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Result count */}
      {filtered.length > 0 && (search || typeFilter !== "ALL") && (
        <p className={styles.resultCount}>
          {filtered.length} paper{filtered.length !== 1 && "s"} found
        </p>
      )}
    </div>
  );
}
