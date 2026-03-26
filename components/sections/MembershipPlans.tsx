import Link from "next/link";
import { Check, ArrowRight, GraduationCap } from "lucide-react";
import { FadeUp, ScaleIn } from "@/components/ui/motion";
import styles from "./MembershipPlans.module.css";

const FREE_FEATURES = [
  "Events, news & projects",
  "Community store",
  "Volunteering opportunities",
  "Public outreach programmes",
];

const EDU_FEATURES = [
  "Everything in Free",
  "All research papers",
  "Curriculum materials (Teachers)",
  "Research datasets",
];

const PREMIUM_FEATURES = [
  "Everything in Free",
  "All research papers",
  "Research datasets",
  "Exclusive member benefits",
  "Priority event registration",
  "Official member certificate",
];

export default function MembershipPlans() {
  return (
    <section className={styles.section}>
      <div className={styles.inner}>

        <FadeUp>
        {/* Header */}
        <div className={styles.header}>
          <span className={styles.label}>
            <span className={styles.labelLine} />
            Membership
            <span className={styles.labelLine} />
          </span>
          <h2 className={styles.heading}>
            Simple, transparent <span className={styles.accent}>access</span>
          </h2>
          <p className={styles.sub}>
            Start free. Upgrade when you need more. Teachers and researchers get premium free with a .edu email.
          </p>
        </div>
        </FadeUp>

        {/* Plans grid */}
        <div className={styles.plans}>

          {/* Free */}
          <ScaleIn delay={0.05}>
          <div className={styles.plan}>
            <div className={styles.planTop}>
              <span className={styles.planName}>Free Member</span>
              <div className={styles.planPrice}>
                <span className={styles.planAmount}>Free</span>
                <span className={styles.planPeriod}>always</span>
              </div>
              <p className={styles.planDesc}>
                For students, enthusiasts, and anyone curious about space science.
              </p>
            </div>
            <ul className={styles.features}>
              {FREE_FEATURES.map((f) => (
                <li key={f} className={styles.feature}>
                  <Check size={13} className={styles.checkIcon} />
                  {f}
                </li>
              ))}
            </ul>
            <Link href="/auth/signup" className={styles.planCta}>
              Join free <ArrowRight size={14} />
            </Link>
          </div>
          </ScaleIn>

          {/* Premium — highlighted */}
          <ScaleIn delay={0.15}>
          <div className={`${styles.plan} ${styles.planFeatured}`}>
            <div className={styles.featuredBadge}>Most popular</div>
            <div className={styles.planTop}>
              <span className={styles.planName}>Premium Member</span>
              <div className={styles.planPrice}>
                <span className={styles.planAmount}>NPR 299</span>
                <span className={styles.planPeriod}>/month</span>
              </div>
              <p className={styles.planDesc}>
                Full access to research content, datasets, and exclusive member benefits.
              </p>
            </div>
            <ul className={styles.features}>
              {PREMIUM_FEATURES.map((f) => (
                <li key={f} className={`${styles.feature} ${styles.featureFeatured}`}>
                  <Check size={13} className={styles.checkIconFeatured} />
                  {f}
                </li>
              ))}
            </ul>
            <Link href="/pricing" className={styles.planCtaFeatured}>
              See plans <ArrowRight size={14} />
            </Link>
            <p className={styles.planNote}>NPR 2,499/year — save 30%</p>
          </div>
          </ScaleIn>

          {/* Teacher / Researcher */}
          <ScaleIn delay={0.25}>
          <div className={`${styles.plan} ${styles.planEdu}`}>
            <div className={styles.eduBadge}>
              <GraduationCap size={13} />
              .edu email
            </div>
            <div className={styles.planTop}>
              <span className={styles.planName}>Teacher / Researcher</span>
              <div className={styles.planPrice}>
                <span className={styles.planAmount}>Free</span>
                <span className={styles.planPeriod}>with .edu</span>
              </div>
              <p className={styles.planDesc}>
                Official institution email? Get premium research access at no cost.
              </p>
            </div>
            <ul className={styles.features}>
              {EDU_FEATURES.map((f) => (
                <li key={f} className={styles.feature}>
                  <Check size={13} className={styles.checkIcon} />
                  {f}
                </li>
              ))}
            </ul>
            <Link href="/auth/signup" className={styles.planCta}>
              Sign up with .edu <ArrowRight size={14} />
            </Link>
          </div>
          </ScaleIn>

        </div>

      </div>
    </section>
  );
}
