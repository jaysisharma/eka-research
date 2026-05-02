export const dynamic = "force-dynamic";
import Link from "next/link";
import {
  Check,
  CalendarCheck,
  Telescope,
  GraduationCap,
  Database,
  Network,
  Award,
  ArrowRight,
} from "lucide-react";
import { buildMetadata } from "@/lib/seo";
import { SITE } from "@/lib/constants";
import styles from "./page.module.css";

export const metadata = buildMetadata({
  title: "Join Us",
  description:
    "Join Eka Research for free. Unlock events, telescope time, mentoring, research data, and more.",
  path: "/opportunities/join",
});

const HERO_PERKS = [
  "Priority access to observation nights and workshops",
  "Telescope and instrument booking slots",
  "1-on-1 mentoring from active researchers",
  "Full access to Eka's research datasets",
  "Official member certificate",
];

const QUICK_STATS = [
  { value: "500+", label: "Members" },
  { value: "Free", label: "Always" },
  { value: "3+", label: "Countries" },
  { value: `Est. ${SITE.foundedYear}`, label: "Nepal" },
];

const BENEFITS = [
  {
    Icon: CalendarCheck,
    title: "Priority Event Access",
    desc: "Register for observation nights, meteor watches, and workshops before they open to the public.",
  },
  {
    Icon: Telescope,
    title: "Instrument Time",
    desc: "Book dedicated slots on Eka's All Sky Camera network, weather station, and telescopes.",
  },
  {
    Icon: GraduationCap,
    title: "Mentoring Program",
    desc: "Get matched with a researcher or academic for guidance on projects, papers, and career paths.",
  },
  {
    Icon: Database,
    title: "Research Data Access",
    desc: "Full access to Eka's cleaned, documented meteor, atmospheric, and space weather datasets.",
  },
  {
    Icon: Network,
    title: "Researcher Network",
    desc: "Join a growing community of Nepali scientists, students, and international collaborators.",
  },
  {
    Icon: Award,
    title: "Member Certificate",
    desc: "Official certificate recognised by partner universities and institutions across Nepal.",
  },
];

const FAQ = [
  {
    q: "Is membership really free — forever?",
    a: "Yes, always. Eka Research is committed to keeping individual membership free. No subscriptions, no hidden fees.",
  },
  {
    q: "Who can join?",
    a: "Anyone curious about space science. No qualifications or prior experience required.",
  },
  {
    q: "Do I need to be based in Nepal?",
    a: "No. Nepali diaspora, international students, and global collaborators interested in South Asian space science are all welcome.",
  },
  {
    q: "Is there a time commitment?",
    a: "None whatsoever. Participate as much or as little as you like. There are no mandatory activities or dues.",
  },
];

export default function JoinPage() {
  return (
    <main>

      {/* ════════════════════════════════════════
          1. HERO — pitch left + form right
      ════════════════════════════════════════ */}
      <section className={styles.hero}>
        <div className={styles.heroGlowA} aria-hidden="true" />
        <div className={styles.heroGlowB} aria-hidden="true" />

        <div className={styles.heroInner}>

          {/* Left — pitch */}
          <div className={styles.heroPitch}>
            <span className={styles.heroLabel}>
              <span className={styles.labelLine} />
              Join Eka Research
            </span>

            <h1 className={styles.heroHeading}>
              Space science,{" "}
              <span className={styles.heroAccent}>open to everyone</span>
            </h1>

            <p className={styles.heroSub}>
              From students to researchers — membership is
              free, instant, and comes with real access to instruments, data,
              and people doing active research in Nepal.
            </p>

            <ul className={styles.heroPerks}>
              {HERO_PERKS.map((perk) => (
                <li key={perk} className={styles.heroPerk}>
                  <span className={styles.perkBubble}>
                    <Check size={11} strokeWidth={3} />
                  </span>
                  {perk}
                </li>
              ))}
            </ul>

            <p className={styles.heroMicro}>
              Already a member?{" "}
              <a href={`mailto:${SITE.email}`} className={styles.heroLink}>
                Contact us
              </a>
            </p>
          </div>

          {/* Right — form card */}
          <div className={styles.formWrap}>
            <div className={styles.formCard}>
              <div className={styles.formCardGlow} aria-hidden="true" />
              <div className={styles.formCardHeader}>
                <h2 className={styles.formCardHeading}>Create your free membership</h2>
                <p className={styles.formCardSub}>Takes under 2 minutes. No approval needed.</p>
              </div>
              <Link href="/auth/signup" className={styles.formCardBtn}>
                Create your free account <ArrowRight size={16} />
              </Link>
            </div>
          </div>

        </div>
      </section>

      {/* ════════════════════════════════════════
          2. STATS BAR
      ════════════════════════════════════════ */}
      <div className={styles.statsBar}>
        <div className={styles.statsInner}>
          {QUICK_STATS.map(({ value, label }) => (
            <div key={label} className={styles.stat}>
              <span className={styles.statValue}>{value}</span>
              <span className={styles.statLabel}>{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ════════════════════════════════════════
          3. WHAT YOU UNLOCK
      ════════════════════════════════════════ */}
      <section className={styles.benefitsSection}>
        <div className={styles.sectionInner}>
          <div className={styles.sectionHeader}>
            <span className={styles.label}>
              <span className={styles.labelLine} />
              What you unlock
            </span>
            <h2 className={styles.sectionHeading}>
              Six things that open up the moment you join
            </h2>
          </div>

          <div className={styles.benefitsList}>
            {BENEFITS.map(({ Icon, title, desc }, i) => (
              <div key={title} className={styles.benefitRow}>
                <span className={styles.benefitNum}>
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div className={styles.benefitMeta}>
                  <div className={styles.benefitIcon}>
                    <Icon size={18} strokeWidth={1.75} />
                  </div>
                  <h3 className={styles.benefitTitle}>{title}</h3>
                </div>
                <p className={styles.benefitDesc}>{desc}</p>
              </div>
            ))}
          </div>

          <div className={styles.benefitsCta}>
            <Link href="/member-benefits" className={styles.benefitsLink}>
              See full member benefits →
            </Link>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════
          4. FAQ
      ════════════════════════════════════════ */}
      <section className={styles.faqSection}>
        <div className={styles.sectionInner}>
          <div className={styles.faqHeader}>
            <span className={styles.label}>
              <span className={styles.labelLine} />
              FAQ
            </span>
            <h2 className={styles.faqHeading}>Common questions</h2>
          </div>

          <div className={styles.faqList}>
            {FAQ.map(({ q, a }) => (
              <details key={q} className={styles.faqItem}>
                <summary className={styles.faqQ}>
                  {q}
                  <span className={styles.faqIcon} aria-hidden="true" />
                </summary>
                <p className={styles.faqA}>{a}</p>
              </details>
            ))}
          </div>

          <p className={styles.faqContact}>
            Still have questions?{" "}
            <a href={`mailto:${SITE.email}`} className={styles.faqEmail}>
              {SITE.email}
            </a>
          </p>
        </div>
      </section>

    </main>
  );
}
