export const dynamic = "force-dynamic";
import Link from "next/link";
import { Check } from "lucide-react";
import { buildMetadata } from "@/lib/seo";
import styles from "./page.module.css";

export const metadata = buildMetadata({
  title: "Membership",
  description: "Support space research in Nepal. Get full access to every paper we publish, our open datasets, and exclusive member benefits.",
  path: "/pricing",
});

const FEATURES = [
  "Every paper our team has published — full text, no paywall",
  "Download our meteor, atmospheric, and space weather datasets",
  "Register for observation nights before public spots open",
  "Members-only benefits: instrument access, mentoring priority",
  "Official Eka Research certificate — recognised by partner institutions",
];

export default function PricingPage() {
  return (
    <div className={styles.page}>
      <div className={styles.hero}>
        <span className={styles.eyebrow}>Membership</span>
        <h1 className={styles.heading}>Support real science. Get real access.</h1>
        <p className={styles.sub}>
          Every membership directly funds space research happening in Nepal right now.
          In return, you get full access to everything we publish, build, and discover.
        </p>
      </div>

      <div className={styles.plans}>
        {/* Monthly plan */}
        <div className={styles.card}>
          <div className={styles.cardTop}>
            <div className={styles.cardTitleRow}>
              <h2 className={styles.cardTitle}>Monthly</h2>
            </div>
            <div className={styles.priceRow}>
              <span className={styles.currency}>NPR</span>
              <span className={styles.price}>299</span>
              <span className={styles.period}>/mo</span>
            </div>
            <span className={styles.billing}>Billed monthly</span>
          </div>

          <ul className={styles.features}>
            {FEATURES.map((f) => (
              <li key={f} className={styles.feature}>
                <Check size={15} className={styles.featureIcon} />
                {f}
              </li>
            ))}
          </ul>

          <Link href="/upgrade?plan=monthly" className={styles.ctaBtn}>
            Start monthly
          </Link>
        </div>

        {/* Yearly plan */}
        <div className={`${styles.card} ${styles.cardFeatured}`}>
          <div className={styles.cardTop}>
            <div className={styles.cardTitleRow}>
              <h2 className={styles.cardTitle}>Yearly</h2>
              <span className={styles.badge}>Best value</span>
            </div>
            <div className={styles.priceRow}>
              <span className={styles.currency}>NPR</span>
              <span className={styles.price}>2,499</span>
              <span className={styles.period}>/yr</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
              <span className={styles.billing}>Billed annually</span>
              <span className={styles.saveBadge}>Save 30%</span>
            </div>
          </div>

          <ul className={styles.features}>
            {FEATURES.map((f) => (
              <li key={f} className={styles.feature}>
                <Check size={15} className={styles.featureIcon} />
                {f}
              </li>
            ))}
          </ul>

          <Link href="/upgrade?plan=yearly" className={`${styles.ctaBtn} ${styles.ctaBtnPrimary}`}>
            Start yearly — save 30%
          </Link>
        </div>
      </div>

      <p className={styles.bottomNote}>
        Are you a teacher or researcher?{" "}
        <Link href="/auth/signup" className={styles.bottomNoteLink}>Sign up with your institutional .edu email</Link>
        {" "}and get everything above for free — no card needed. Our way of giving back to the academic community.
      </p>
    </div>
  );
}
