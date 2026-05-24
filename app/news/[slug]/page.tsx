import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, CalendarDays, Tag } from "lucide-react";
import { buildMetadata } from "@/lib/seo";
import { getNewsBySlug, getPublishedNews } from "@/lib/news";
import type { Metadata } from "next";
import styles from "./page.module.css";

/* ── Static params for build-time generation ───────────────── */
export async function generateStaticParams() {
  try {
    const news = await getPublishedNews();
    return news.map((n) => ({ slug: n.slug }));
  } catch {
    return [];
  }
}

/* ── Per-page SEO ───────────────────────────────────────────── */
type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getNewsBySlug(slug);
  if (!post) return {};
  return buildMetadata({
    title: post.title,
    description: post.excerpt.slice(0, 160),
    path: `/news/${slug}`,
  });
}

const FALLBACK_IMG =
  "https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?auto=format&fit=crop&w=1200&q=80";

const CATEGORY_LABEL: Record<string, string> = {
  announcement: "Announcement",
  publication: "Publication",
  milestone: "Milestone",
  event: "Event",
  media: "Media",
};

export default async function NewsDetailPage({ params }: Props) {
  const { slug } = await params;
  const post = await getNewsBySlug(slug);

  if (!post || !post.published) notFound();

  return (
    <main className={styles.page}>
      <div className={styles.grid} aria-hidden="true" />
      <div className={styles.glow1} aria-hidden="true" />

      <div className={styles.inner}>
        {/* ── Back nav ── */}
        <nav className={styles.breadcrumb}>
          <Link href="/news" className={styles.backLink}>
            <ArrowLeft size={14} strokeWidth={2} />
            Back to News
          </Link>
          <span className={styles.breadSep}>/</span>
          <span className={styles.breadCurrent}>
            {CATEGORY_LABEL[post.category] ?? post.category}
          </span>
        </nav>

        {/* ── HERO CARD ── */}
        <article className={styles.hero}>
          {/* Cover image strip */}
          <div className={styles.heroImgWrap}>
            <Image
              src={post.imageUrl ?? FALLBACK_IMG}
              alt={post.title}
              fill
              sizes="(max-width: 900px) 100vw, 1200px"
              priority
              className={styles.heroImg}
              style={{ objectFit: "cover" }}
            />
            <div className={styles.heroImgOverlay} />

            <div className={styles.heroBadgeRow}>
              <span className={styles.typeBadge}>
                {CATEGORY_LABEL[post.category] ?? post.category}
              </span>
            </div>
          </div>

          {/* ── Content body ── */}
          <div className={styles.body}>
            <div className={styles.mainCol} style={{ padding: "0" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", color: "var(--text-muted)", fontSize: "14px", marginBottom: "16px", fontWeight: "600" }}>
                <CalendarDays size={16} />
                <span>{new Date(post.date).toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric" })}</span>
              </div>
              
              <h1 className={styles.title}>{post.title}</h1>
              
              <hr className={styles.divider} style={{ margin: "32px 0" }} />
              
              <div className={styles.abstract} style={{ fontSize: "18px", lineHeight: "1.7", color: "var(--text-secondary)" }}>
                {post.excerpt}
              </div>
            </div>
          </div>
        </article>
      </div>
    </main>
  );
}
