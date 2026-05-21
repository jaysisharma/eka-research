export const dynamic = "force-dynamic";

import Link from "next/link";
import { Lock } from "lucide-react";
import { buildMetadata } from "@/lib/seo";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import VacancyList from "./VacancyList";
import styles from "./page.module.css";

export const metadata = buildMetadata({
  title: "Vacancies",
  description:
    "Open positions at Eka Research — internships, part-time roles, and full-time opportunities in space science, education, and research in Nepal.",
  path: "/opportunities/vacancy",
});

export default async function VacancyPage() {
  const session = await auth();
  const isLoggedIn = !!session;

  // Fetch open vacancies from the PostgreSQL database
  const dbVacancies = await prisma.vacancy.findMany({
    where: { status: "OPEN" },
    orderBy: { createdAt: "desc" },
  });

  // Serialize complex dates before passing to client components
  const vacancies = dbVacancies.map((v) => ({
    id: v.id,
    title: v.title,
    type: v.type,
    department: v.department,
    description: v.description,
    deadline: v.deadline ? v.deadline.toISOString() : null,
    status: v.status,
    createdAt: v.createdAt.toISOString(),
  }));

  return (
    <main>
      {/* ── HERO ── */}
      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <span className={styles.label}>
            <span className={styles.labelLine} />
            Vacancies
          </span>
          <h1 className={styles.heroHeading}>
            Work with us on{" "}
            <span className={styles.accent}>Nepal&apos;s space frontier</span>
          </h1>
          <p className={styles.heroDesc}>
            Explore exciting opportunities across research, science education, and instrumentation engineering.
            Join us in advancing citizen science and scientific inquiry in Nepal.
          </p>
        </div>
      </section>

      {/* ── AUTH NOTICE (for guests) ── */}
      {!isLoggedIn && (
        <div className={styles.authBanner}>
          <div className={styles.authBannerInner}>
            <Lock size={15} strokeWidth={2} />
            <p className={styles.authBannerText}>
              You need a free Eka account to apply.{" "}
              <Link
                href="/auth/signup?callbackUrl=/opportunities/vacancy"
                className={styles.authBannerLink}
              >
                Create your account
              </Link>{" "}
              or{" "}
              <Link
                href="/auth/login?callbackUrl=/opportunities/vacancy"
                className={styles.authBannerLink}
              >
                sign in
              </Link>{" "}
              — it takes under 2 minutes.
            </p>
          </div>
        </div>
      )}

      {/* ── DYNAMIC VACANCY LIST & INTERACTIVE MODAL ── */}
      <section className={styles.listSection}>
        <div className={styles.listInner}>
          <VacancyList
            vacancies={vacancies}
            isLoggedIn={isLoggedIn}
            user={session?.user}
          />
        </div>
      </section>
    </main>
  );
}
