import Link from "next/link";
import { Lock } from "lucide-react";
import { hasAccess, ACCESS } from "@/lib/access";
import type { AccessFeature } from "@/lib/access";
import styles from "./AccessGate.module.css";

const FEATURE_DESCRIPTIONS: Record<AccessFeature, string> = {
  volunteering:        "Sign in to access volunteering opportunities.",
  researchPapers:      "Research papers are available to Teachers, Researchers, Mentors, and Premium Members.",
  curriculumMaterials: "Curriculum materials are available to Teachers and Admins.",
  mentorProfile:       "Mentor profile pages are only accessible to Mentors.",
  manageMentees:       "Managing mentees requires a Mentor account.",
  memberBenefits:      "Member benefits are exclusive to Premium Members.",
  adminPanel:          "The admin panel requires an Admin account.",
};

function roleList(feature: AccessFeature): string {
  return ACCESS[feature].join(", ").toLowerCase().replace(/_/g, " ");
}

interface Props {
  feature: AccessFeature;
  role: string | null;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function AccessGate({ feature, role, children, fallback }: Props) {
  if (hasAccess(role, feature)) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  return (
    <div className={styles.lockCard}>
      <span className={styles.lockIcon}>
        <Lock size={22} />
      </span>
      <h2 className={styles.lockHeading}>Premium Content</h2>
      <p className={styles.lockDesc}>
        {FEATURE_DESCRIPTIONS[feature]}{" "}
        Requires: {roleList(feature)}.
      </p>
      <div className={styles.lockActions}>
        <Link href="/pricing" className={styles.upgradeBtn}>
          Upgrade to Premium
        </Link>
        {!role && (
          <Link href="/auth/login" className={styles.signInBtn}>
            Sign in
          </Link>
        )}
      </div>
    </div>
  );
}
