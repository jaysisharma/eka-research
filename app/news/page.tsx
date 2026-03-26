import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CalendarDays, Tag } from "lucide-react";
import PageHero from "@/components/ui/PageHero";
import { buildMetadata } from "@/lib/seo";
import { getPublishedNews, type NewsCategory } from "@/lib/news";
import styles from "./page.module.css";

export const dynamic = "force-dynamic";

export const metadata = buildMetadata({
  title: "News",
  description:
    "The latest updates from Eka Research — new publications, project milestones, event announcements, and science news from Nepal.",
  path: "/news",
});

const CATEGORY_LABEL: Record<NewsCategory, string> = {
  announcement: "Announcement",
  publication:  "Publication",
  milestone:    "Milestone",
  event:        "Event",
  media:        "Media",
};

const FALLBACK_IMG =
  "https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?auto=format&fit=crop&w=1200&q=80";

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default async function NewsPage() {
  const allNews = await getPublishedNews();
  const featured = allNews.find((n) => n.featured) ?? allNews[0];
  const restNews = allNews.filter((n) => n.id !== featured?.id);

  if (!featured) {
    return (
      <main>
        <PageHero
          label="News"
          title="What&apos;s happening at "
          accentWord="Eka Research"
          description="Publications, project milestones, event announcements, and science updates from our team in Kathmandu."
          align="left"
          variant="dark"
        />
        <section className={styles.featuredSection}>
          <div className={styles.sectionInner}>
            <p style={{ color: "var(--text-muted)" }}>No news posts yet.</p>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main>

      {/* ── 1. Hero ── */}
      <PageHero
        label="News"
        title="What&apos;s happening at "
        accentWord="Eka Research"
        description="Publications, project milestones, event announcements, and science updates from our team in Kathmandu."
        align="left"
        variant="dark"
      />

      {/* ── 2. Featured story ── */}
      <section className={styles.featuredSection}>
        <div className={styles.sectionInner}>
          <div className={styles.sectionHeader}>
            <span className={styles.label}>
              <span className={styles.labelLine} />
              Latest
            </span>
          </div>

          <Link href={featured.href} className={styles.featuredCard}>
            <div className={styles.featuredImgWrap}>
              <Image
                src={featured.imageUrl ?? FALLBACK_IMG}
                alt={featured.title}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 60vw"
                className={styles.featuredImg}
              />
              <div className={styles.featuredImgOverlay} />
              <div className={styles.featuredCategoryBadge}>
                {CATEGORY_LABEL[featured.category]}
              </div>
            </div>
            <div className={styles.featuredBody}>
              <div className={styles.featuredMeta}>
                <CalendarDays size={13} />
                <span>{formatDate(featured.date)}</span>
              </div>
              <h2 className={styles.featuredTitle}>{featured.title}</h2>
              <p className={styles.featuredExcerpt}>{featured.excerpt}</p>
              <span className={styles.readMore}>
                Read full story <ArrowRight size={14} />
              </span>
            </div>
          </Link>
        </div>
      </section>

      {/* ── 3. News grid ── */}
      {restNews.length > 0 && (
        <section className={`${styles.section} ${styles.sectionSurface}`}>
          <div className={styles.sectionInner}>
            <div className={styles.sectionHeader}>
              <span className={styles.label}>
                <span className={styles.labelLine} />
                All News
              </span>
              <h2 className={styles.sectionHeading}>Updates from the team</h2>
            </div>

            <div className={styles.newsGrid}>
              {restNews.map((item) => (
                <Link key={item.id} href={item.href} className={styles.newsCard}>
                  <div className={styles.newsImgWrap}>
                    <Image
                      src={item.imageUrl ?? FALLBACK_IMG}
                      alt={item.title}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className={styles.newsImg}
                    />
                    <div className={styles.newsImgOverlay} />
                    <span className={styles.newsCategoryBadge}>
                      {CATEGORY_LABEL[item.category]}
                    </span>
                  </div>
                  <div className={styles.newsBody}>
                    <span className={styles.newsDate}>
                      <CalendarDays size={12} />
                      {formatDate(item.date)}
                    </span>
                    <h3 className={styles.newsTitle}>{item.title}</h3>
                    <p className={styles.newsExcerpt}>{item.excerpt}</p>
                    <span className={styles.newsReadMore}>
                      Read more <ArrowRight size={13} />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── 4. Categories filter strip ── */}
      <section className={styles.section}>
        <div className={styles.sectionInner}>
          <div className={styles.categoryStrip}>
            <span className={styles.categoryLabel}>Browse by type:</span>
            <div className={styles.categoryTags}>
              {(Object.keys(CATEGORY_LABEL) as NewsCategory[]).map((cat) => (
                <span key={cat} className={styles.categoryTag}>
                  <Tag size={11} />
                  {CATEGORY_LABEL[cat]}
                  <span className={styles.categoryCount}>
                    {allNews.filter((n) => n.category === cat).length}
                  </span>
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── 5. CTA ── */}
      <section className={styles.ctaSection}>
        <div className={styles.ctaInner}>
          <div className={styles.ctaGlow} aria-hidden="true" />
          <h2 className={styles.ctaHeading}>
            Follow our{" "}
            <span className={styles.ctaAccent}>science</span>
          </h2>
          <p className={styles.ctaSub}>
            Members get updates before anything goes public — new papers, event registrations, and project data releases.
          </p>
          <div className={styles.ctaActions}>
            <Link href="/member-benefits" className={styles.ctaBtn}>
              Join Eka Research <ArrowRight size={16} />
            </Link>
            <Link href="/articles" className={styles.ctaBtnGhost}>
              Read our publications
            </Link>
          </div>
        </div>
      </section>

    </main>
  );
}
