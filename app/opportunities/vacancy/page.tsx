export const dynamic = "force-dynamic";
import Link from "next/link";
import { ArrowRight, MapPin, Clock, Calendar, Wifi, WifiOff, Lock } from "lucide-react";
import { buildMetadata } from "@/lib/seo";
import { VACANCIES, SITE } from "@/lib/constants";
import { auth } from "@/lib/auth";
import styles from "./page.module.css";

export const metadata = buildMetadata({
  title: "Vacancies",
  description:
    "Open positions at Eka Research — internships, part-time roles, and full-time opportunities in space science, education, and research in Nepal.",
  path: "/opportunities/vacancy",
});

const TYPE_LABELS: Record<string, string> = {
  "full-time": "Full-time",
  "part-time": "Part-time",
  internship: "Internship",
  volunteer: "Volunteer",
  contract: "Contract",
};

function formatDeadline(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default async function VacancyPage() {
  const session = await auth();
  const isLoggedIn = !!session;
  const open = VACANCIES.filter((v) => v.status === "open");

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
            {open.length} open position{open.length !== 1 ? "s" : ""} across
            research, education, and engineering. Part-time, full-time, and
            internship opportunities based in Kathmandu and remote.
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

      {/* ── VACANCY LIST ── */}
      <section className={styles.listSection}>
        <div className={styles.listInner}>

          {open.length === 0 ? (
            <p className={styles.empty}>No open positions right now. Check back soon.</p>
          ) : (
            <div className={styles.list}>
              {open.map((vacancy) => {
                const applyHref = isLoggedIn
                  ? `mailto:${SITE.email}?subject=Application — ${encodeURIComponent(vacancy.title)}`
                  : `/auth/login?callbackUrl=${encodeURIComponent("/opportunities/vacancy")}`;

                return (
                  <article key={vacancy.id} className={styles.card}>

                    {/* Card header */}
                    <div className={styles.cardHead}>
                      <div className={styles.cardMeta}>
                        <span className={styles.typeBadge}>
                          {TYPE_LABELS[vacancy.type] ?? vacancy.type}
                        </span>
                        <span className={styles.metaDot} aria-hidden="true" />
                        <span className={styles.dept}>{vacancy.department}</span>
                      </div>
                      <div className={styles.cardAttrs}>
                        <span className={styles.attr}>
                          <MapPin size={12} strokeWidth={2} />
                          {vacancy.location}
                        </span>
                        {vacancy.remote && (
                          <span className={styles.attr}>
                            <Wifi size={12} strokeWidth={2} />
                            Remote ok
                          </span>
                        )}
                        {!vacancy.remote && (
                          <span className={styles.attr}>
                            <WifiOff size={12} strokeWidth={2} />
                            On-site
                          </span>
                        )}
                        <span className={styles.attr}>
                          <Calendar size={12} strokeWidth={2} />
                          Deadline {formatDeadline(vacancy.deadline)}
                        </span>
                      </div>
                    </div>

                    {/* Title + summary */}
                    <h2 className={styles.cardTitle}>{vacancy.title}</h2>
                    <p className={styles.cardSummary}>{vacancy.summary}</p>

                    {/* Requirements */}
                    <div className={styles.cardSection}>
                      <h3 className={styles.cardSectionLabel}>Requirements</h3>
                      <ul className={styles.cardList}>
                        {vacancy.requirements.map((req) => (
                          <li key={req} className={styles.cardListItem}>
                            <span className={styles.bullet} aria-hidden="true" />
                            {req}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Preferred (if any) */}
                    {vacancy.preferred && vacancy.preferred.length > 0 && (
                      <div className={styles.cardSection}>
                        <h3 className={styles.cardSectionLabel}>Nice to have</h3>
                        <ul className={styles.cardList}>
                          {vacancy.preferred.map((p) => (
                            <li key={p} className={styles.cardListItem}>
                              <span className={styles.bulletGhost} aria-hidden="true" />
                              {p}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Apply CTA */}
                    <div className={styles.cardFooter}>
                      <a href={applyHref} className={styles.applyBtn}>
                        {isLoggedIn ? "Apply now" : "Sign in to apply"}
                        <ArrowRight size={14} />
                      </a>
                      {!isLoggedIn && (
                        <p className={styles.applyNote}>
                          No account?{" "}
                          <Link
                            href={`/auth/signup?callbackUrl=${encodeURIComponent("/opportunities/vacancy")}`}
                            className={styles.applyNoteLink}
                          >
                            Create one free
                          </Link>
                        </p>
                      )}
                    </div>

                  </article>
                );
              })}
            </div>
          )}

        </div>
      </section>

    </main>
  );
}
