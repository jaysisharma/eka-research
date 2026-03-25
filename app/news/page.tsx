import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CalendarDays, Tag } from "lucide-react";
import PageHero from "@/components/ui/PageHero";
import { buildMetadata } from "@/lib/seo";
import styles from "./page.module.css";

export const metadata = buildMetadata({
  title: "News",
  description:
    "The latest updates from Eka Research — new publications, project milestones, event announcements, and science news from Nepal.",
  path: "/news",
});

type NewsCategory = "announcement" | "publication" | "milestone" | "event" | "media";

type NewsItem = {
  id: string;
  title: string;
  excerpt: string;
  category: NewsCategory;
  date: string;
  image: string;
  href: string;
  featured?: boolean;
};

const CATEGORY_LABEL: Record<NewsCategory, string> = {
  announcement: "Announcement",
  publication:  "Publication",
  milestone:    "Milestone",
  event:        "Event",
  media:        "Media",
};

const NEWS: NewsItem[] = [
  {
    id: "meteor-paper-mnras-2024",
    title: "Eka Research publishes first paper in Monthly Notices of the Royal Astronomical Society",
    excerpt:
      "Our All Sky Camera network study — documenting 3,847 meteors and 89 precise orbital solutions in its first year — has been accepted and published in MNRAS, one of the world's leading astronomy journals.",
    category: "publication",
    date: "2024-09-15",
    image: "https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?auto=format&fit=crop&w=1200&q=80",
    href: "/articles/meteor-network-nepal-2024",
    featured: true,
  },
  {
    id: "tribhuvan-partnership-2024",
    title: "Formal partnership signed with Tribhuvan University Physics Department",
    excerpt:
      "Eka Research and the TU Physics Department have formalised a research collaboration agreement, opening pathways for joint publications, shared instrumentation access, and student placements.",
    category: "announcement",
    date: "2024-07-03",
    image: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=900&q=80",
    href: "/news/tribhuvan-partnership-2024",
  },
  {
    id: "geomagnetic-storm-paper-2024",
    title: "New paper: ionospheric response to the May 2024 geomagnetic superstorm over South Asia",
    excerpt:
      "Using our ground-based magnetometer array and dual-frequency GPS data, we've characterised the strongest geomagnetic storm in two decades as it passed over Nepal and northern India.",
    category: "publication",
    date: "2024-11-03",
    image: "https://images.unsplash.com/photo-1531366936337-7c912a4589a7?auto=format&fit=crop&w=900&q=80",
    href: "/articles/geomagnetic-south-asia-2024",
  },
  {
    id: "100th-member-2023",
    title: "Eka Research reaches 100 members — mentoring programme launches",
    excerpt:
      "We're proud to welcome our 100th member. To mark the milestone, we've launched our formal mentoring programme — matching students with researchers across all six of our disciplines.",
    category: "milestone",
    date: "2023-10-14",
    image: "https://images.unsplash.com/photo-1543722530-d2c3201371e7?auto=format&fit=crop&w=900&q=80",
    href: "/news/100th-member-mentoring-launch",
  },
  {
    id: "stratonepal-paper-2023",
    title: "StratoNepal-01 findings published in Atmospheric Measurement Techniques",
    excerpt:
      "Our stratospheric balloon mission results — including temperature profiles, ozone data, and cosmic ray counts from 28 km above the Himalayas — are now open access.",
    category: "publication",
    date: "2023-06-22",
    image: "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&w=900&q=80",
    href: "/articles/stratonepal-01-2023",
  },
  {
    id: "allsky-network-live-2022",
    title: "All Sky Camera network goes live — Nepal's first continuous meteor monitoring system",
    excerpt:
      "After two years of development and field testing, the five-station All Sky Camera network is now operational. The cameras run 24/7, automatically detecting and archiving every meteor bright enough to record.",
    category: "milestone",
    date: "2022-03-01",
    image: "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?auto=format&fit=crop&w=900&q=80",
    href: "/news/allsky-network-live-2022",
  },
  {
    id: "eclipse-expedition-announced-2024",
    title: "Eclipse Expedition 2027 announced — targeting 500 students across 15 districts",
    excerpt:
      "We're planning Nepal's first coordinated total solar eclipse observation campaign for August 2027. Applications for school partnerships and volunteer coordinators open next quarter.",
    category: "event",
    date: "2024-12-01",
    image: "https://images.unsplash.com/photo-1614730321146-b6fa6a46bcb4?auto=format&fit=crop&w=900&q=80",
    href: "/projects/eclipse-expedition-2027",
  },
  {
    id: "fireball-kathmandu-2023",
    title: "Kathmandu fireball spectroscopy paper accepted — chondritic composition confirmed",
    excerpt:
      "A magnitude −7 fireball captured on 14 March 2023 by three Eka cameras has been analysed via diffraction-grating spectroscopy. Sodium, magnesium, and iron lines confirm a chondritic parent body.",
    category: "publication",
    date: "2023-08-11",
    image: "https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?auto=format&fit=crop&w=900&q=80",
    href: "/articles/fireball-spectroscopy-2023",
  },
];

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

const featured   = NEWS.find((n) => n.featured)!;
const restNews   = NEWS.filter((n) => !n.featured);

export default function NewsPage() {
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
                src={featured.image}
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
                    src={item.image}
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
                    {NEWS.filter((n) => n.category === cat).length}
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
