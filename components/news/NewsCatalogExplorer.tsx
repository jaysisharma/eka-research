"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { 
  Search, 
  CalendarDays, 
  Tag, 
  ArrowRight, 
  X, 
  Sparkles, 
  Inbox,
  BookOpen
} from "lucide-react";
import { type NewsPost, type NewsCategory } from "@/lib/news";
import styles from "@/app/news/page.module.css";

const CATEGORY_LABEL: Record<NewsCategory, string> = {
  announcement: "Announcement",
  publication:  "Publication",
  milestone:    "Milestone",
  event:        "Event",
  media:        "Media",
};

const CATEGORY_CLASS: Record<NewsCategory, string> = {
  announcement: "catAnnouncement",
  publication:  "catPublication",
  milestone:    "catMilestone",
  event:        "catEvent",
  media:        "catMedia",
};

const FALLBACK_IMG = "https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?auto=format&fit=crop&w=1200&q=80";

function formatDate(dateStr: string) {
  try {
    return new Date(dateStr).toLocaleDateString("en-US", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  } catch (e) {
    return dateStr;
  }
}

interface NewsCatalogExplorerProps {
  newsPosts: NewsPost[];
}

export default function NewsCatalogExplorer({ newsPosts }: NewsCatalogExplorerProps) {
  // 1. Filter States
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  // 2. Compute dynamic counters for each category
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: newsPosts.length };
    (Object.keys(CATEGORY_LABEL) as NewsCategory[]).forEach(cat => {
      counts[cat] = newsPosts.filter(n => n.category === cat).length;
    });
    return counts;
  }, [newsPosts]);

  // 3. Highlighted Featured Post (most recent featured=true, or just the first post)
  const featuredPost = useMemo(() => {
    return newsPosts.find(n => n.featured) ?? newsPosts[0] ?? null;
  }, [newsPosts]);

  // 4. Client-side Search and Filter Execution
  const filteredNews = useMemo(() => {
    return newsPosts.filter(post => {
      // Filter by category
      if (activeCategory !== "all" && post.category !== activeCategory) {
        return false;
      }

      // Filter by keyword query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = post.title.toLowerCase().includes(q);
        const matchesExcerpt = post.excerpt.toLowerCase().includes(q);
        const matchesCat = CATEGORY_LABEL[post.category].toLowerCase().includes(q);
        if (!matchesTitle && !matchesExcerpt && !matchesCat) {
          return false;
        }
      }

      return true;
    });
  }, [newsPosts, activeCategory, searchQuery]);

  // Determine what news to show in the list/grid
  // If no filters are active, we highlight the featured post at the top, and put the rest below.
  // If filters ARE active, we show all matching items in the main grid directly.
  const hasActiveFilters = searchQuery.trim() !== "" || activeCategory !== "all";

  const listItems = useMemo(() => {
    if (hasActiveFilters) {
      return filteredNews;
    }
    // Exclude featured post from grid if featured is displayed separately at the top
    return filteredNews.filter(n => n.id !== featuredPost?.id);
  }, [filteredNews, featuredPost, hasActiveFilters]);

  // Reset Filters helper
  const handleResetFilters = () => {
    setSearchQuery("");
    setActiveCategory("all");
  };

  return (
    <div className={styles.explorerWrapper}>
      
      {/* ── Search & Glassmorphic Segment Navigation ── */}
      <div className={styles.controlsGrid}>
        
        {/* Search Bar */}
        <div className={styles.searchContainer}>
          <div className={styles.searchBox}>
            <Search className={styles.searchIcon} size={18} />
            <input
              type="text"
              placeholder="Search news, announcements, publications..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={styles.searchInput}
              aria-label="Search news"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery("")} 
                className={styles.searchClearBtn}
                title="Clear search"
              >
                <X size={15} />
              </button>
            )}
          </div>
        </div>

        {/* Categories Tabs Selector */}
        <div className={styles.tabsContainer}>
          <div className={styles.tabsWrapper}>
            <button
              onClick={() => setActiveCategory("all")}
              className={`${styles.tabBtn} ${activeCategory === "all" ? styles.activeTab : ""}`}
            >
              All updates <span className={styles.counterBadge}>{categoryCounts.all}</span>
            </button>
            {(Object.keys(CATEGORY_LABEL) as NewsCategory[]).map((catKey) => (
              <button
                key={catKey}
                onClick={() => setActiveCategory(catKey)}
                className={`${styles.tabBtn} ${activeCategory === catKey ? styles.activeTab : ""}`}
              >
                {CATEGORY_LABEL[catKey]}
                {categoryCounts[catKey] > 0 && (
                  <span className={styles.counterBadge}>{categoryCounts[catKey]}</span>
                )}
              </button>
            ))}
          </div>
        </div>

      </div>

      {/* ── Match Row ── */}
      {(searchQuery || activeCategory !== "all") && (
        <div className={styles.matchBar}>
          <div className={styles.matchCount}>
            <Sparkles size={13} className={styles.sparkleIcon} />
            Found <span className={styles.highlightCount}>{filteredNews.length}</span> update{filteredNews.length === 1 ? "" : "s"} matching your filters
          </div>
          <button onClick={handleResetFilters} className={styles.resetAllBtn}>
            Reset filters
          </button>
        </div>
      )}

      {/* ── FEATURED STORY SHOWCASE (only shown when no filters are active) ── */}
      {!hasActiveFilters && featuredPost && (
        <section className={styles.featuredSection}>
          <div className={styles.featuredHeader}>
            <span className={styles.badgeLine} />
            <span className={styles.featuredLabel}>Featured Story</span>
          </div>
          <Link href={featuredPost.href} className={styles.featuredCard}>
            <div className={styles.featuredImgWrap}>
              <Image
                src={featuredPost.imageUrl ?? FALLBACK_IMG}
                alt={featuredPost.title}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 60vw"
                className={styles.featuredImg}
              />
              <div className={styles.featuredImgOverlay} />
              <div className={`${styles.categoryBadge} ${styles[CATEGORY_CLASS[featuredPost.category]]}`}>
                {CATEGORY_LABEL[featuredPost.category]}
              </div>
            </div>
            <div className={styles.featuredBody}>
              <div className={styles.featuredMeta}>
                <CalendarDays size={13} />
                <span>{formatDate(featuredPost.date)}</span>
              </div>
              <h2 className={styles.featuredTitle}>{featuredPost.title}</h2>
              <p className={styles.featuredExcerpt}>{featuredPost.excerpt}</p>
              <span className={styles.readMore}>
                Read full story <ArrowRight size={14} className={styles.arrowIcon} />
              </span>
            </div>
          </Link>
        </section>
      )}

      {/* ── MAIN NEWS GRID ── */}
      {listItems.length > 0 ? (
        <div className={styles.gridSection}>
          {!hasActiveFilters && <h3 className={styles.gridSectionTitle}>More Updates</h3>}
          <div className={styles.newsGrid}>
            {listItems.map((item) => (
              <Link key={item.id} href={item.href} className={styles.newsCard}>
                
                {/* Cover Frame */}
                <div className={styles.newsImgWrap}>
                  <Image
                    src={item.imageUrl ?? FALLBACK_IMG}
                    alt={item.title}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className={styles.newsImg}
                  />
                  <div className={styles.newsImgOverlay} />
                  <span className={`${styles.newsCategoryBadge} ${styles[CATEGORY_CLASS[item.category]]}`}>
                    {CATEGORY_LABEL[item.category]}
                  </span>
                </div>

                {/* Body Content */}
                <div className={styles.newsBody}>
                  <span className={styles.newsDate}>
                    <CalendarDays size={12} />
                    {formatDate(item.date)}
                  </span>
                  <h3 className={styles.newsTitle}>{item.title}</h3>
                  <p className={styles.newsExcerpt}>{item.excerpt}</p>
                  <span className={styles.newsReadMore}>
                    Read more <ArrowRight size={13} className={styles.cardArrowIcon} />
                  </span>
                </div>

              </Link>
            ))}
          </div>
        </div>
      ) : (
        // Empty Search State
        hasActiveFilters && (
          <div className={styles.emptyState}>
            <Inbox size={48} className={styles.emptyIcon} />
            <h3 className={styles.emptyTitle}>No updates found</h3>
            <p className={styles.emptyDesc}>
              No articles or publications match your keyword query and selected categories.
            </p>
            <button onClick={handleResetFilters} className={styles.emptyBtn}>
              Clear all filters
            </button>
          </div>
        )
      )}

      {/* ── Premium Roster Call to Action ── */}
      <section className={styles.cta}>
        <div className={styles.ctaInner}>
          <div className={styles.ctaGlow} aria-hidden="true" />
          <div className={styles.ctaContent}>
            <div className={styles.ctaIconWrap}>
              <BookOpen size={22} className={styles.ctaIcon} />
            </div>
            <h2 className={styles.ctaHeading}>
              Follow our <span className={styles.ctaGoldAccent}>science.</span>
            </h2>
            <p className={styles.ctaSub}>
              Members get critical bulletins and datasets before anything goes public — including orbital solvers and balloon payload telemetry.
            </p>
          </div>
          <div className={styles.ctaActions}>
            <Link href="/member-benefits" className={styles.ctaBtn}>
              Join Eka Research <ArrowRight size={15} />
            </Link>
            <Link href="/articles" className={styles.ctaBtnGhost}>
              Read publications
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
