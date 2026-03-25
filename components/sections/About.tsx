import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Telescope, BookOpen, Users } from "lucide-react";
import { SITE } from "@/lib/constants";
import styles from "./About.module.css";

const PILLARS = [
  { icon: Telescope, label: "Research" },
  { icon: BookOpen,  label: "Education" },
  { icon: Users,     label: "Outreach" },
] as const;

const STATS = [
  { value: "6",     label: "Research disciplines" },
  { value: "200+",  label: "Outreach events" },
  { value: "2020",  label: "Year founded" },
  { value: "9–PhD", label: "Open to all levels" },
] as const;

export default function About() {
  return (
    <section className={styles.section} id="about">
      <div className={styles.inner}>

        <div className={styles.split}>

          {/* ── Text column ── */}
          <div className={styles.textCol}>
            <span className={styles.label}>
              <span className={styles.labelLine} />
              About Eka Research
              <span className={styles.labelLine} />
            </span>

            <h2 className={styles.heading}>
              Space science,{" "}
              <span className={styles.accentWord}>rooted in the Himalayas</span>
            </h2>

            <p className={styles.lead}>
              Nepal has some of the clearest skies on Earth. For too long, the
              science happening beneath them stayed out of reach. Eka Research
              exists to change that.
            </p>

            <p className={styles.body}>
              We bring together students, educators, and researchers across Nepal
              to observe, discover, and publish — together. From Class&nbsp;9
              curiosity to PhD‑level rigour, every level of engagement has a
              place here.
            </p>

            {/* Pillars */}
            <div className={styles.pillars}>
              {PILLARS.map(({ icon: Icon, label }) => (
                <span key={label} className={styles.pillar}>
                  <Icon size={14} strokeWidth={2} />
                  {label}
                </span>
              ))}
            </div>

            {/* Stats */}
            <div className={styles.stats}>
              {STATS.map(({ value, label }) => (
                <div key={label} className={styles.stat}>
                  <span className={styles.statValue}>{value}</span>
                  <span className={styles.statLabel}>{label}</span>
                </div>
              ))}
            </div>

            <Link href="/about" className={styles.cta}>
              Our full story <ArrowRight size={15} />
            </Link>
          </div>

          {/* ── Visual column ── */}
          <div className={styles.visual}>
            <div className={styles.imageFrame}>
              <Image
                src="https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=900&q=80"
                alt="Starry night sky over Himalayan peaks — the backdrop for Eka Research"
                fill
                sizes="(max-width: 1024px) 100vw, 45vw"
                className={styles.image}
              />
              <div className={styles.imageOverlay} aria-hidden="true" />

              {/* Founded badge */}
              <div className={styles.badge} aria-hidden="true">
                <span className={styles.badgeYear}>Est. {SITE.foundedYear}</span>
                <span className={styles.badgePlace}>Kathmandu, Nepal</span>
              </div>
            </div>

            {/* Decorative orbit ring */}
            <div className={styles.orbit} aria-hidden="true">
              <div className={styles.orbitDot} />
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
