import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Telescope, BookOpen, Users } from "lucide-react";
import { SITE } from "@/lib/constants";
import { SlideIn, FadeIn } from "@/components/ui/motion";
import styles from "./About.module.css";

const PILLARS = [
  { icon: Telescope, label: "Research" },
  { icon: BookOpen,  label: "Education" },
  { icon: Users,     label: "Outreach" },
] as const;

const STATS = [
  { value: "2020",  label: "Founded" },
  { value: "All",   label: "Open to" },
  { value: "Open",  label: "Science" },
  { value: "3",     label: "Countries" },
] as const;

export default function About() {
  return (
    <section className={styles.section} id="about">
      <div className={styles.inner}>

        <div className={styles.split}>

          {/* ── Text column ── */}
          <SlideIn from="left">
          <div className={styles.textCol}>
            <span className={styles.label}>
              <span className={styles.labelLine} />
              About Eka Research
              <span className={styles.labelLine} />
            </span>

            <h2 className={styles.heading}>
              Science,{" "}
              <span className={styles.accentWord}>rooted in the Himalayas</span>
            </h2>

            <p className={styles.lead}>
              Nepal has some of the clearest skies on Earth — and a generation
              of students who deserve to do real science beneath them.
              Eka Research exists to make that possible.
            </p>

            <p className={styles.body}>
              We are an interdisciplinary organisation advancing
              physics, astrophysics, mathematics, and space science through
              research, mentoring, and community outreach. Our programs are
              open to anyone with a passion for discovery.
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
          </SlideIn>

          {/* ── Visual column ── */}
          <SlideIn from="right" delay={0.15}>
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
                <span className={styles.badgePlace}>
                  Headquartered in {SITE.hq}<br />
                  International Presence: {SITE.presence}
                </span>
              </div>
            </div>

            {/* Decorative orbit ring */}
            <div className={styles.orbit} aria-hidden="true">
              <div className={styles.orbitDot} />
            </div>
          </div>
          </SlideIn>

        </div>
      </div>
    </section>
  );
}
