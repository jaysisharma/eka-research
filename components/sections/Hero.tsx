import Link from "next/link";
import { ArrowRight, Telescope } from "lucide-react";
import StarField from "@/components/ui/StarField";
import { FadeUp } from "@/components/ui/motion";
import styles from "./Hero.module.css";

export default function Hero() {
  return (
    <section className={styles.hero}>

      {/* ── Background layers ── */}
      <div className={styles.nebula1} aria-hidden="true" />
      <div className={styles.nebula2} aria-hidden="true" />
      <div className={styles.nebula3} aria-hidden="true" />
      <div className={styles.grid}    aria-hidden="true" />

      {/* Orbital rings — brand-tied decorative element */}
      <div className={styles.orbitals} aria-hidden="true">
        <svg
          viewBox="0 0 900 900"
          width="900"
          height="900"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{ position: "absolute", opacity: 0.18 }}
        >
          {/* Outer ring */}
          <g className={styles.ringOuter}>
            <ellipse
              cx="450" cy="450"
              rx="420" ry="200"
              stroke="#162161"
              strokeWidth="1.2"
              transform="rotate(-28 450 450)"
            />
            <ellipse
              cx="450" cy="450"
              rx="420" ry="200"
              stroke="#FEC73E"
              strokeWidth="0.4"
              strokeDasharray="6 18"
              transform="rotate(-28 450 450)"
            />
          </g>
          {/* Inner ring */}
          <g className={styles.ringInner}>
            <ellipse
              cx="450" cy="450"
              rx="260" ry="120"
              stroke="#1E2E82"
              strokeWidth="0.8"
              transform="rotate(-28 450 450)"
            />
          </g>
          {/* Brand dot — the gold dot from the logo */}
          <circle cx="608" cy="512" r="6" fill="#FEC73E" opacity="0.5" />
        </svg>
      </div>

      {/* Star field canvas */}
      <StarField />

      {/* Bottom dissolve */}
      <div className={styles.fade} aria-hidden="true" />

      {/* ── Content ── */}
      <div className={styles.content}>

        <FadeUp delay={0.05}>
          <div className={styles.tag}>
            <span className={styles.tagDot} />
            Physics · Astrophysics · Mathematics · Space Science
          </div>
        </FadeUp>

        <FadeUp delay={0.18}>
          <h1 className={styles.headline}>
            <span className={styles.headlineLine}>Expanding the Frontiers of</span>
            <span className={styles.accentWord}>Space Science</span>
          </h1>
        </FadeUp>

        <FadeUp delay={0.3}>
          <p className={styles.subtitle}>
            A nonprofit research and outreach organisation rooted in Nepal —
            making physics, astrophysics, and mathematics accessible
            to every curious mind, from Class&nbsp;9 to PhD.
          </p>
        </FadeUp>

        <FadeUp delay={0.42}>
          <div className={styles.ctas}>
            <Link href="/research" className={styles.ctaPrimary}>
              <Telescope size={16} />
              Explore Our Research
            </Link>
            <Link href="/opportunities/join" className={styles.ctaSecondary}>
              Join the Community
              <ArrowRight size={15} />
            </Link>
          </div>
        </FadeUp>

        <FadeUp delay={0.54}>
          <div className={styles.stats}>
            <div className={styles.stat}>
              <span className={styles.statValue}>2020</span>
              <span className={styles.statLabel}>Founded</span>
            </div>
            <div className={styles.statDivider} />
            <div className={styles.stat}>
              <span className={styles.statValue}>Cl. 9 → PhD</span>
              <span className={styles.statLabel}>Open to all</span>
            </div>
            <div className={styles.statDivider} />
            <div className={styles.stat}>
              <span className={styles.statValue}>Nonprofit</span>
              <span className={styles.statLabel}>Open science</span>
            </div>
            <div className={styles.statDivider} />
            <div className={styles.stat}>
              <span className={styles.statValue}>3</span>
              <span className={styles.statLabel}>Countries</span>
            </div>
          </div>
        </FadeUp>

      </div>

      {/* Scroll indicator */}
      <div className={styles.scrollIndicator} aria-hidden="true">
        <span className={styles.scrollText}>Scroll</span>
        <div className={styles.scrollLine} />
      </div>

    </section>
  );
}
