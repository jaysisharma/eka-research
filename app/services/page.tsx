export const dynamic = "force-dynamic";
import Link from "next/link";
import { ArrowRight, Users, School, FlaskConical, Camera, CloudRain, GraduationCap, CheckCircle } from "lucide-react";
import PageHero from "@/components/ui/PageHero";
import { buildMetadata } from "@/lib/seo";
import styles from "./page.module.css";

export const metadata = buildMetadata({
  title: "Services",
  description:
    "Eka Research offers science outreach, educational workshops, research support, instrument access, and mentoring — tailored for the public, schools, and researchers across Nepal.",
  path: "/services",
});

const AUDIENCES = [
  {
    icon: Users,
    tag: "The Public",
    href: "/services/public",
    title: "Science for every curious mind",
    description:
      "Whether you spotted a meteor last night or just want to understand what a solar storm is — our public programmes are designed to be welcoming, jargon-free, and genuinely interesting.",
    items: [
      "Guided meteor observation nights at dark-sky sites",
      "Free public lectures on physics, astrophysics, and space science",
      "Scientific writing and research communication workshops",
      "Citizen science campaigns — contribute real data from anywhere",
    ],
    cta: "Explore public events",
  },
  {
    icon: School,
    tag: "Schools",
    href: "/services/schools",
    title: "Bringing the universe into the classroom",
    description:
      "Aligned with Nepal's science curriculum, our school programmes give students hands-on access to telescopes, real datasets, and active researchers — at no cost to the school.",
    items: [
      "Full-day workshops on observation, physics, and mathematics",
      "Curriculum-linked resource packs for science teachers",
      "Telescope loan programme for rural and provincial schools",
      "Scientific writing workshops: how to read and write research",
    ],
    cta: "Book a school workshop",
  },
  {
    icon: FlaskConical,
    tag: "Researchers",
    href: "/services/researchers",
    title: "Tools and access for serious science",
    description:
      "Researchers and students get dedicated instrument time, raw data access, remote internship opportunities, and a network of collaborators — plus mentoring from scientists who have published in international journals.",
    items: [
      "All Sky Camera and weather station data feeds",
      "Observation slot booking at Eka's Nagarkot site",
      "Remote internships in physics, astrophysics, and data science",
      "Co-authorship and international collaboration pathways",
    ],
    cta: "Researcher access",
  },
];

const CAPABILITIES = [
  {
    icon: Camera,
    title: "All Sky Camera Network",
    href: "/services/allsky",
    description:
      "Five wide-field cameras covering Nepal's mid-hill region capture 170° of sky continuously — day and night. The live feed is used for meteor detection, aurora monitoring, and cloud cover reporting.",
    stat: "5 stations",
    statLabel: "nationwide",
    image:
      "https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?auto=format&fit=crop&w=900&q=80",
  },
  {
    icon: CloudRain,
    title: "Weather Station Array",
    href: "/services/weather",
    description:
      "Real-time atmospheric sensors across the Kathmandu valley measure temperature, pressure, humidity, and wind speed — with data published openly and used for space weather correlation studies.",
    stat: "Real-time",
    statLabel: "data feed",
    image:
      "https://images.unsplash.com/photo-1504608524841-42584120d693?auto=format&fit=crop&w=900&q=80",
  },
  {
    icon: GraduationCap,
    title: "Mentoring Programme",
    href: "/services/mentoring",
    description:
      "Get matched with a researcher or academic mentor for one-on-one guidance on projects, papers, and career paths in space science — open to students from Class 10 through postgraduate level.",
    stat: "1-on-1",
    statLabel: "mentoring",
    image:
      "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=900&q=80",
  },
];

export default function ServicesPage() {
  return (
    <main>

      {/* ── 1. Hero ── */}
      <PageHero
        label="Services"
        title="Science that reaches "
        accentWord="everyone"
        description="From guided observation nights and scientific writing workshops for the public, to instrument access and remote internships for researchers — Eka runs programmes for every curious mind."
        align="center"
        variant="dark"
        cta={{ label: "View upcoming events", href: "/events" }}
        ctaSecondary={{ label: "Join as a member", href: "/opportunities/join" }}
      />

      {/* ── 2. Who we serve ── */}
      <section className={styles.audienceSection}>
        <div className={styles.sectionInner}>
          <div className={styles.sectionHeader}>
            <span className={styles.label}>
              <span className={styles.labelLine} />
              Who We Serve
            </span>
            <h2 className={styles.sectionHeading}>Built for three audiences</h2>
            <p className={styles.sectionSub}>
              Each programme is designed specifically for its audience — not one-size-fits-all science communication, but focused, useful, and Nepal-rooted.
            </p>
          </div>

          <div className={styles.audienceGrid}>
            {AUDIENCES.map(({ icon: Icon, tag, href, title, description, items, cta }) => (
              <div key={tag} className={styles.audienceCard}>
                <div className={styles.audienceTop}>
                  <div className={styles.audienceIconWrap}>
                    <Icon size={22} strokeWidth={1.75} />
                  </div>
                  <span className={styles.audienceTag}>{tag}</span>
                </div>
                <h3 className={styles.audienceTitle}>{title}</h3>
                <p className={styles.audienceDesc}>{description}</p>
                <ul className={styles.audienceList}>
                  {items.map((item) => (
                    <li key={item} className={styles.audienceItem}>
                      <CheckCircle size={14} className={styles.checkIcon} />
                      {item}
                    </li>
                  ))}
                </ul>
                <Link href={href} className={styles.audienceCta}>
                  {cta} <ArrowRight size={14} />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 3. Capabilities ── */}
      <section className={`${styles.section} ${styles.sectionSurface}`}>
        <div className={styles.sectionInner}>
          <div className={styles.sectionHeader}>
            <span className={styles.label}>
              <span className={styles.labelLine} />
              Capabilities
            </span>
            <h2 className={styles.sectionHeading}>What we have to offer</h2>
            <p className={styles.sectionSub}>
              Our instruments and programmes are open to members and collaborators — access them directly or through a guided programme.
            </p>
          </div>

          <div className={styles.capabilitiesGrid}>
            {CAPABILITIES.map(({ icon: Icon, title, href, description, stat, statLabel, image }) => (
              <Link key={title} href={href} className={styles.capCard}>
                <div className={styles.capImgWrap}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={image} alt={title} className={styles.capImg} />
                  <div className={styles.capImgOverlay} />
                  <div className={styles.capStat}>
                    <span className={styles.capStatVal}>{stat}</span>
                    <span className={styles.capStatLbl}>{statLabel}</span>
                  </div>
                </div>
                <div className={styles.capBody}>
                  <div className={styles.capIconWrap}>
                    <Icon size={18} strokeWidth={1.75} />
                  </div>
                  <div>
                    <h3 className={styles.capTitle}>{title}</h3>
                    <p className={styles.capDesc}>{description}</p>
                  </div>
                  <span className={styles.capArrow}>
                    Learn more <ArrowRight size={13} />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── 4. Stats strip ── */}
      <section className={styles.statsSection}>
        <div className={styles.statsInner}>
          {[
            { val: "1,400+", label: "Students reached" },
            { val: "18",     label: "Schools equipped" },
            { val: "120",    label: "Citizen scientists" },
            { val: "3",      label: "Provinces covered" },
          ].map(({ val, label }) => (
            <div key={label} className={styles.stat}>
              <span className={styles.statVal}>{val}</span>
              <span className={styles.statLabel}>{label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── 5. CTA ── */}
      <section className={styles.ctaSection}>
        <div className={styles.ctaInner}>
          <div className={styles.ctaGlow} aria-hidden="true" />
          <h2 className={styles.ctaHeading}>
            Not sure where to{" "}
            <span className={styles.ctaAccent}>start?</span>
          </h2>
          <p className={styles.ctaSub}>
            Join as a member and get access to all programmes, instruments, and mentoring — or just show up to a public event first.
          </p>
          <div className={styles.ctaActions}>
            <Link href="/events" className={styles.ctaBtn}>
              See upcoming events <ArrowRight size={16} />
            </Link>
            <Link href="/opportunities/join" className={styles.ctaBtnGhost}>
              Become a member
            </Link>
          </div>
        </div>
      </section>

    </main>
  );
}
