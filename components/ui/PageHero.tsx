import Link from "next/link";
import { ArrowRight } from "lucide-react";
import styles from "./PageHero.module.css";

interface PageHeroProps {
  label: string;
  title: string;
  accentWord?: string;
  description: string;
  cta?: { label: string; href: string };
  ctaSecondary?: { label: string; href: string };
  align?: "center" | "left";
  /** "navy" = brand blue (vibrant, for CTAs). "dark" = near-black (subtle, for content pages). */
  variant?: "navy" | "dark";
}

export default function PageHero({
  label,
  title,
  accentWord,
  description,
  cta,
  ctaSecondary,
  align = "center",
  variant = "navy",
}: PageHeroProps) {
  const parts = accentWord ? title.split(accentWord) : [title];

  return (
    <section className={`${styles.hero} ${styles[variant]} ${align === "left" ? styles.left : styles.center}`}>
      {/* Decorative glows */}
      <div className={styles.glowLeft}  aria-hidden="true" />
      <div className={styles.glowRight} aria-hidden="true" />

      <div className={styles.inner}>
        <span className={styles.label}>
          <span className={styles.labelLine} />
          {label}
          <span className={styles.labelLine} />
        </span>

        <h1 className={styles.title}>
          {accentWord ? (
            <>
              {parts[0]}
              <span className={styles.accent}>{accentWord}</span>
              {parts[1]}
            </>
          ) : title}
        </h1>

        <p className={styles.description}>{description}</p>

        {(cta || ctaSecondary) && (
          <div className={styles.actions}>
            {cta && (
              <Link href={cta.href} className={styles.btnPrimary}>
                {cta.label} <ArrowRight size={16} />
              </Link>
            )}
            {ctaSecondary && (
              <Link href={ctaSecondary.href} className={styles.btnSecondary}>
                {ctaSecondary.label}
              </Link>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
