export const dynamic = "force-dynamic";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Telescope, BookOpen, Users } from "lucide-react";
import PageHero from "@/components/ui/PageHero";
import { buildMetadata } from "@/lib/seo";
import { SITE } from "@/lib/constants";
import styles from "./page.module.css";

export const metadata = buildMetadata({
  title: "About",
  description:
    "Eka Research is an interdisciplinary research and outreach organisation based in Kathmandu — advancing physics, astrophysics, mathematics, and space science for students and researchers across Nepal and beyond.",
  path: "/about",
});

const VALUES = [
  {
    icon: Telescope,
    title: "Research",
    body: "We conduct and facilitate original scientific research — from meteor detection and atmospheric physics to astrophysics, mathematics, and space weather — publishing all findings openly.",
  },
  {
    icon: BookOpen,
    title: "Mentoring",
    body: "Every student in Nepal deserves a research mentor. We match motivated learners with scientists and academics guiding them through projects, publications, and career paths.",
  },
  {
    icon: Users,
    title: "Outreach",
    body: "Science lives in communities. We run observation nights, public lectures, scientific writing workshops, and citizen science campaigns that make physics and astronomy approachable to anyone.",
  },
];

const TEAM = [
  {
    name: "Placeholder Name",
    role: "Founder & Director",
    bio: "Astrophysicist. Founded Eka Research in 2020 with the goal of building Nepal's first independent space science institution. Previously researcher at [Institution].",
    img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80",
    featured: true,
  },
  {
    name: "Placeholder Name",
    role: "Head of Research",
    bio: "Atmospheric physicist focused on high-altitude balloon payloads and cosmic ray detection above the Himalayas.",
    img: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80",
    featured: false,
  },
  {
    name: "Placeholder Name",
    role: "Outreach Coordinator",
    bio: "Science communicator and educator designing all public programmes and community partnerships.",
    img: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80",
    featured: false,
  },
  {
    name: "Placeholder Name",
    role: "Instrumentation Lead",
    bio: "Electronics engineer responsible for the All Sky Camera network and all on-site instrumentation across Nepal.",
    img: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=400&q=80",
    featured: false,
  },
  {
    name: "Placeholder Name",
    role: "Data Scientist",
    bio: "Processes and archives meteor, space weather, and atmospheric datasets. Builds the tools members use to access research data.",
    img: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=400&q=80",
    featured: false,
  },
  {
    name: "Placeholder Name",
    role: "Education Research Lead",
    bio: "Develops evidence-based science communication methods tailored to the Nepali curriculum and classroom context.",
    img: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80",
    featured: false,
  },
];

const TIMELINE = [
  { year: "2020", event: "Eka Research founded in Kathmandu by a small team of astronomers and educators with a single telescope and a shared mission." },
  { year: "2021", event: "First stratospheric balloon launch — StratoNepal 01 — reaches 28 km altitude above the Himalayas, carrying atmospheric and cosmic ray sensors." },
  { year: "2022", event: "All Sky Camera network goes live. Nepal's first continuous sky monitoring system begins detecting meteors and atmospheric transients." },
  { year: "2023", event: "100th member joins. Eka launches its formal mentoring programme, matching students with researchers across 6 disciplines." },
  { year: "2024", event: "Partnership formalised with Tribhuvan University Physics Department. First co-authored research paper published by Eka members." },
];

const PARTNERS = [
  "Tribhuvan University",
  "Nepal Academy of Science & Technology",
  "Astronomical Society of Nepal",
  "International Meteor Organization",
  "UNOOSA Partner",
];

const featured = TEAM.find((m) => m.featured)!;
const restTeam  = TEAM.filter((m) => !m.featured);

export default function AboutPage() {
  return (
    <main>

      {/* ── 1. Hero ── */}
      <PageHero
        label="About Us"
        title="We exist because Nepal's scientists "
        accentWord="deserve a home"
        description="Eka Research is an interdisciplinary organisation based in Kathmandu — advancing physics, astrophysics, mathematics, and space science through research, mentoring, and public outreach."
        align="left"
        variant="dark"
      />

      {/* ── 2. Mission ── */}
      <section className={styles.missionSection}>
        <div className={styles.missionInner}>

          {/* Text column */}
          <div className={styles.missionText}>
            <span className={styles.label}>
              <span className={styles.labelLine} />
              Our Mission
            </span>

            <blockquote className={styles.pullQuote}>
              Advanced science has always lived far from Nepal.
              We&rsquo;re changing that — one student,
              one paper, one discovery at a time.
            </blockquote>

            <p className={styles.missionBody}>
              Founded in {SITE.foundedYear} in Kathmandu, Eka Research combines
              original research in physics, astrophysics, mathematics, and space
              science with a deep commitment to mentoring and public engagement.
              Our goal is to strengthen Nepal&rsquo;s scientific ecosystem — not
              just produce research, but build the people who will carry it forward.
            </p>

            <div className={styles.missionStats}>
              {[
                { v: "2020",   l: "Founded" },
                { v: "All",    l: "Open to" },
                { v: "Open",   l: "Science" },
                { v: "3",      l: "Countries" },
              ].map(({ v, l }) => (
                <div key={l} className={styles.missionStat}>
                  <span className={styles.missionStatVal}>{v}</span>
                  <span className={styles.missionStatLbl}>{l}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Image column */}
          <div className={styles.missionVisual}>
            <div className={styles.missionImgFrame}>
              <Image
                src="https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=900&q=80"
                alt="Starry night sky over Himalayan peaks"
                fill
                sizes="(max-width: 1024px) 100vw, 45vw"
                className={styles.missionImg}
              />
              <div className={styles.missionImgOverlay} />
              <div className={styles.missionImgBadge}>
                <span className={styles.missionImgBadgeVal}>Est. {SITE.foundedYear}</span>
                <span className={styles.missionImgBadgeLbl}>
                  Headquartered in {SITE.hq}<br />
                  International Presence: {SITE.presence}
                </span>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ── 3. Values ── */}
      <section className={`${styles.section} ${styles.sectionSurface}`}>
        <div className={styles.sectionInner}>
          <div className={styles.sectionHeader}>
            <span className={styles.label}>
              <span className={styles.labelLine} />
              What we stand for
            </span>
            <h2 className={styles.sectionHeading}>Research. Mentoring. Outreach.</h2>
          </div>

          <div className={styles.values}>
            {VALUES.map(({ icon: Icon, title, body }, i) => (
              <div key={title} className={styles.value}>
                <span className={styles.valueN}>{String(i + 1).padStart(2, "0")}</span>
                <div className={styles.valueIconWrap}>
                  <Icon size={22} strokeWidth={1.75} />
                </div>
                <div className={styles.valueText}>
                  <h3 className={styles.valueTitle}>{title}</h3>
                  <p className={styles.valueBody}>{body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 4. Team ── */}
      <section className={styles.section} id="team">
        <div className={styles.sectionInner}>
          <div className={styles.sectionHeader}>
            <span className={styles.label}>
              <span className={styles.labelLine} />
              Our Team
            </span>
            <h2 className={styles.sectionHeading}>The people behind Eka</h2>
            <p className={styles.sectionSub}>
              Researchers, educators, engineers, and communicators united by curiosity.
            </p>
          </div>

          {/* Featured founder — large horizontal card */}
          <div className={styles.featuredCard}>
            <div className={styles.featuredImgWrap}>
              <Image
                src={featured.img}
                alt={featured.name}
                fill
                sizes="(max-width: 1024px) 100vw, 45vw"
                className={styles.featuredImg}
              />
              <div className={styles.featuredImgOverlay} />
            </div>
            <div className={styles.featuredBody}>
              <span className={styles.featuredRole}>{featured.role}</span>
              <h3 className={styles.featuredName}>{featured.name}</h3>
              <p className={styles.featuredBio}>{featured.bio}</p>
              <div className={styles.featuredBadge}>
                <span className={styles.badgeDot} />
                Founder
              </div>
            </div>
          </div>

          {/* Rest of team */}
          <div className={styles.teamGrid}>
            {restTeam.map((m) => (
              <div key={m.role} className={styles.teamCard}>
                <div className={styles.teamImgWrap}>
                  <Image
                    src={m.img}
                    alt={m.name}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    className={styles.teamImg}
                  />
                  <div className={styles.teamImgOverlay} />
                </div>
                <div className={styles.teamBody}>
                  <div>
                    <h3 className={styles.teamName}>{m.name}</h3>
                    <span className={styles.teamRole}>{m.role}</span>
                  </div>
                  <p className={styles.teamBio}>{m.bio}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 5. Timeline ── */}
      <section className={`${styles.section} ${styles.sectionSurface}`}>
        <div className={styles.sectionInner}>
          <div className={styles.sectionHeader}>
            <span className={styles.label}>
              <span className={styles.labelLine} />
              Our History
            </span>
            <h2 className={styles.sectionHeading}>From a single telescope to a national network</h2>
          </div>

          <div className={styles.timeline}>
            <div className={styles.timelineRule} aria-hidden="true" />
            {TIMELINE.map(({ year, event }) => (
              <div key={year} className={styles.timelineItem}>
                <div className={styles.timelineYear}>
                  <span>{year}</span>
                  <div className={styles.timelineDot} />
                </div>
                <p className={styles.timelineEvent}>{event}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 6. Partners ── */}
      <section className={styles.section} id="partners">
        <div className={styles.sectionInner}>
          <div className={styles.sectionHeader}>
            <span className={styles.label}>
              <span className={styles.labelLine} />
              Partners & Affiliations
            </span>
            <h2 className={styles.sectionHeading}>Working with institutions that share our values</h2>
          </div>

          <div className={styles.partners}>
            {PARTNERS.map((p) => (
              <div key={p} className={styles.partner}>{p}</div>
            ))}
          </div>

          <p className={styles.partnerNote}>
            Interested in collaborating?{" "}
            <Link href="/contact" className={styles.partnerLink}>
              Get in touch <ArrowRight size={13} />
            </Link>
          </p>
        </div>
      </section>

      {/* ── 7. CTA ── */}
      <section className={styles.ctaSection}>
        <div className={styles.ctaInner}>
          <div className={styles.ctaGlow} aria-hidden="true" />
          <h2 className={styles.ctaHeading}>
            Be part of what comes{" "}
            <span className={styles.ctaAccent}>next</span>
          </h2>
          <p className={styles.ctaSub}>
            Free membership. Join the community that&apos;s building Nepal&apos;s space science future.
          </p>
          <div className={styles.ctaActions}>
            <Link href="/opportunities/join" className={styles.ctaBtn}>
              Join Eka Research <ArrowRight size={16} />
            </Link>
            <Link href="/contact" className={styles.ctaBtnGhost}>
              Contact us
            </Link>
          </div>
        </div>
      </section>

    </main>
  );
}
