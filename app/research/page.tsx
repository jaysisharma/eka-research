import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ExternalLink, Telescope, Sparkles, Sun, Wind, Atom, BookOpen } from "lucide-react";
import PageHero from "@/components/ui/PageHero";
import { buildMetadata } from "@/lib/seo";
import { RESEARCH_AREAS } from "@/lib/constants";
import { getPublishedArticles } from "@/lib/research";
import styles from "./page.module.css";

export const metadata = buildMetadata({
  title: "Research",
  description:
    "Eka Research conducts original science across six disciplines — from meteor detection and atmospheric physics to space weather monitoring and science education research.",
  path: "/research",
});

const ICON_MAP: Record<string, React.ElementType> = {
  Telescope, Sparkles, Sun, Wind, Atom, BookOpen,
};

const INSTRUMENTS = [
  {
    title: "All Sky Camera Network",
    description:
      "Five wide-field cameras covering Nepal's mid-hill region, capturing 170° of sky continuously. Records meteors, fireballs, and transient atmospheric events.",
    image:
      "https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?auto=format&fit=crop&w=900&q=80",
    stat: "5 stations",
    statLabel: "nationwide",
  },
  {
    title: "Weather Station Array",
    description:
      "High-resolution atmospheric sensors measuring temperature, pressure, humidity, and wind across the Kathmandu valley for space weather correlation studies.",
    image:
      "https://images.unsplash.com/photo-1504608524841-42584120d693?auto=format&fit=crop&w=900&q=80",
    stat: "Real-time",
    statLabel: "data feed",
  },
  {
    title: "Stratospheric Balloons",
    description:
      "Recoverable high-altitude balloon payloads reaching 28 km above the Himalayas — our platform for cosmic ray, UV, and ozone measurements.",
    image:
      "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&w=900&q=80",
    stat: "28 km",
    statLabel: "max altitude",
  },
];

export const dynamic = "force-dynamic";

export default async function ResearchPage() {
  const allArticles = await getPublishedArticles();
  const recentArticles = allArticles.slice(0, 3);
  return (
    <main>

      {/* ── 1. Hero ── */}
      <PageHero
        label="Research"
        title="Science rooted in "
        accentWord="Nepal's skies"
        description="Six active research disciplines. Original data. Open publication. Eka Research conducts real science from the heart of the Himalayas."
        align="left"
        variant="dark"
        cta={{ label: "Read our publications", href: "/articles" }}
        ctaSecondary={{ label: "View projects", href: "/projects" }}
      />

      {/* ── 2. Research areas grid ── */}
      <section className={styles.areasSection} id="research-areas">
        <div className={styles.sectionInner}>
          <div className={styles.sectionHeader}>
            <span className={styles.label}>
              <span className={styles.labelLine} />
              Our Disciplines
            </span>
            <h2 className={styles.sectionHeading}>Six fields. One mission.</h2>
            <p className={styles.sectionSub}>
              From the edge of the atmosphere to the depths of the cosmos — every line of inquiry connects back to Nepal.
            </p>
          </div>

          <div className={styles.areasGrid}>
            {RESEARCH_AREAS.map((area, i) => {
              const Icon = ICON_MAP[area.icon] ?? Telescope;
              return (
                <Link key={area.id} href={area.href} className={styles.areaCard} id={area.id}>
                  <div className={styles.areaImgWrap}>
                    <Image
                      src={area.image}
                      alt={area.title}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className={styles.areaImg}
                    />
                    <div className={styles.areaImgOverlay} />
                    <span className={styles.areaIndex}>{String(i + 1).padStart(2, "0")}</span>
                  </div>
                  <div className={styles.areaBody}>
                    <div className={styles.areaIconWrap}>
                      <Icon size={20} strokeWidth={1.75} />
                    </div>
                    <div className={styles.areaText}>
                      <h3 className={styles.areaTitle}>{area.title}</h3>
                      <p className={styles.areaDesc}>{area.description}</p>
                    </div>
                    <span className={styles.areaArrow}>
                      <ArrowRight size={16} />
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── 3. Featured research highlight ── */}
      <section className={`${styles.section} ${styles.sectionSurface}`}>
        <div className={styles.highlightInner}>
          <div className={styles.highlightText}>
            <span className={styles.label}>
              <span className={styles.labelLine} />
              Featured Work
            </span>
            <h2 className={styles.highlightHeading}>
              Nepal&rsquo;s first{" "}
              <span className={styles.accent}>multi-station</span>{" "}
              meteor network
            </h2>
            <p className={styles.highlightBody}>
              Since 2022, Eka&rsquo;s All Sky Camera network has been recording
              Nepal&rsquo;s skies around the clock. In its first operational year,
              the network detected <strong>3,847 meteors</strong> and precisely
              triangulated the orbits of 89 sporadic meteors — data that had
              never existed for this region.
            </p>
            <p className={styles.highlightBody}>
              This work was published in the <em>Monthly Notices of the Royal
              Astronomical Society</em> in 2024 — Eka&rsquo;s first peer-reviewed
              publication in a high-impact journal.
            </p>
            <div className={styles.highlightStats}>
              {[
                { v: "3,847", l: "Meteors detected" },
                { v: "89",    l: "Orbital solutions" },
                { v: "5",     l: "Camera stations" },
              ].map(({ v, l }) => (
                <div key={l} className={styles.hStat}>
                  <span className={styles.hStatVal}>{v}</span>
                  <span className={styles.hStatLbl}>{l}</span>
                </div>
              ))}
            </div>
            <div className={styles.highlightActions}>
              <Link href="/articles/meteor-network-nepal-2024" className={styles.btnPrimary}>
                Read the paper <ExternalLink size={14} />
              </Link>
              <Link href="/projects/allsky-camera-network" className={styles.btnGhost}>
                About the project <ArrowRight size={14} />
              </Link>
            </div>
          </div>

          <div className={styles.highlightVisual}>
            <div className={styles.highlightImgFrame}>
              <Image
                src="https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?auto=format&fit=crop&w=1000&q=80"
                alt="Meteor streak above Himalayan mountains at night"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className={styles.highlightImg}
              />
              <div className={styles.highlightImgOverlay} />
              <div className={styles.highlightBadge}>
                <span className={styles.highlightBadgeTop}>MNRAS 2024</span>
                <span className={styles.highlightBadgeBot}>Peer-reviewed</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 4. Instruments ── */}
      <section className={styles.section} id="instruments">
        <div className={styles.sectionInner}>
          <div className={styles.sectionHeader}>
            <span className={styles.label}>
              <span className={styles.labelLine} />
              Infrastructure
            </span>
            <h2 className={styles.sectionHeading}>Built for Nepal&apos;s environment</h2>
            <p className={styles.sectionSub}>
              Our instruments are designed and operated in-house — calibrated for high-altitude, monsoon-season, and low-power conditions.
            </p>
          </div>

          <div className={styles.instrumentsGrid}>
            {INSTRUMENTS.map((inst) => (
              <div key={inst.title} className={styles.instrumentCard}>
                <div className={styles.instrumentImgWrap}>
                  <Image
                    src={inst.image}
                    alt={inst.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className={styles.instrumentImg}
                  />
                  <div className={styles.instrumentImgOverlay} />
                  <div className={styles.instrumentBadge}>
                    <span className={styles.instrumentBadgeVal}>{inst.stat}</span>
                    <span className={styles.instrumentBadgeLbl}>{inst.statLabel}</span>
                  </div>
                </div>
                <div className={styles.instrumentBody}>
                  <h3 className={styles.instrumentTitle}>{inst.title}</h3>
                  <p className={styles.instrumentDesc}>{inst.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 5. Recent publications ── */}
      <section className={`${styles.section} ${styles.sectionSurface}`} id="publications">
        <div className={styles.sectionInner}>
          <div className={styles.pubHeader}>
            <div>
              <span className={styles.label}>
                <span className={styles.labelLine} />
                Publications
              </span>
              <h2 className={styles.sectionHeading}>Recent research output</h2>
            </div>
            <Link href="/articles" className={styles.pubSeeAll}>
              All publications <ArrowRight size={14} />
            </Link>
          </div>

          <div className={styles.pubList}>
            {recentArticles.map((article) => (
              <article key={article.id} className={styles.pubItem}>
                <div className={styles.pubImgWrap}>
                  <Image
                    src={article.imageUrl ?? "https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?auto=format&fit=crop&w=1200&q=80"}
                    alt={article.title}
                    fill
                    sizes="120px"
                    className={styles.pubImg}
                  />
                </div>
                <div className={styles.pubContent}>
                  <div className={styles.pubMeta}>
                    <span className={styles.pubType}>{article.type}</span>
                    <span className={styles.pubYear}>{article.year}</span>
                    <span className={styles.pubDisciplines}>
                      {article.disciplines.join(" · ")}
                    </span>
                  </div>
                  <h3 className={styles.pubTitle}>{article.title}</h3>
                  <p className={styles.pubAuthors}>
                    {article.authors.map((a, i) => (
                      <span key={a}>
                        <span className={article.ekaAuthors.includes(a) ? styles.ekaAuthor : undefined}>
                          {a}
                        </span>
                        {i < article.authors.length - 1 && ", "}
                      </span>
                    ))}
                  </p>
                  <p className={styles.pubJournal}>{article.journal}</p>
                  <div className={styles.pubLinks}>
                    {article.doi && (
                      <a
                        href={`https://doi.org/${article.doi}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.pubLink}
                      >
                        DOI <ExternalLink size={11} />
                      </a>
                    )}
                    {article.arxiv && (
                      <a
                        href={`https://arxiv.org/abs/${article.arxiv}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.pubLink}
                      >
                        arXiv <ExternalLink size={11} />
                      </a>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ── 6. CTA ── */}
      <section className={styles.ctaSection}>
        <div className={styles.ctaInner}>
          <div className={styles.ctaGlow} aria-hidden="true" />
          <h2 className={styles.ctaHeading}>
            Collaborate with{" "}
            <span className={styles.ctaAccent}>Eka Research</span>
          </h2>
          <p className={styles.ctaSub}>
            We welcome partnerships with universities, research institutes, and individual scientists. Open science is not just a principle — it&apos;s our practice.
          </p>
          <div className={styles.ctaActions}>
            <Link href="/contact" className={styles.ctaBtn}>
              Get in touch <ArrowRight size={16} />
            </Link>
            <Link href="/member-benefits" className={styles.ctaBtnGhost}>
              Join as a member
            </Link>
          </div>
        </div>
      </section>

    </main>
  );
}
