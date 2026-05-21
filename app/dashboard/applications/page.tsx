import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  Briefcase, GraduationCap, ArrowRight,
  Clock, CheckCircle2, MapPin,
} from "lucide-react";
import { buildMetadata } from "@/lib/seo";
import styles from "./page.module.css";

export const metadata = buildMetadata({
  title: "My Applications",
  description: "Track your job and mentoring applications at Eka Research.",
  path: "/dashboard/applications",
});

function formatDate(date: Date) {
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

const VACANCY_TYPE_LABEL: Record<string, string> = {
  FULL_TIME:  "Full-time",
  PART_TIME:  "Part-time",
  INTERNSHIP: "Internship",
  VOLUNTEER:  "Volunteer",
};

export default async function ApplicationsPage() {
  const session = await auth();
  if (!session) redirect("/auth/login");

  const userEmail = (session.user as { email: string }).email;

  const [vacancyApps, mentoringApps] = await Promise.all([
    db.vacancyApplication.findMany({
      where: { email: userEmail },
      include: { vacancy: true },
      orderBy: { createdAt: "desc" },
    }),
    db.mentoringApplication.findMany({
      where: { email: userEmail },
      include: { program: true },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const totalApps = vacancyApps.length + mentoringApps.length;

  return (
    <div className={styles.page}>

      {/* ── HEADER ── */}
      <header className={styles.header}>
        <div>
          <h1 className={styles.heading}>My Applications</h1>
          <p className={styles.sub}>
            {totalApps} application{totalApps !== 1 ? "s" : ""} submitted
          </p>
        </div>
        <Link href="/opportunities/vacancy" className={styles.browseBtn}>
          Browse Openings <ArrowRight size={14} />
        </Link>
      </header>

      {totalApps === 0 ? (
        <div className={styles.emptyFull}>
          <Briefcase size={40} strokeWidth={1} />
          <p className={styles.emptyTitle}>No applications yet</p>
          <p className={styles.emptySub}>
            Apply for vacancies or mentoring programs to see them tracked here.
          </p>
          <div className={styles.emptyActions}>
            <Link href="/opportunities/vacancy" className={styles.emptyBtn}>
              View Vacancies
            </Link>
            <Link href="/opportunities/mentoring" className={styles.emptyBtnOutline}>
              View Mentoring
            </Link>
          </div>
        </div>
      ) : (
        <div className={styles.sections}>

          {/* ── JOB APPLICATIONS ── */}
          <section>
            <div className={styles.sectionHeader}>
              <div className={styles.sectionTitleRow}>
                <Briefcase size={16} className={styles.sectionIcon} />
                <h2 className={styles.sectionTitle}>Job Applications</h2>
                <span className={styles.countBadge}>{vacancyApps.length}</span>
              </div>
              <Link href="/opportunities/vacancy" className={styles.sectionLink}>
                Browse <ArrowRight size={13} />
              </Link>
            </div>

            {vacancyApps.length === 0 ? (
              <div className={styles.emptyInline}>
                <p>No job applications yet.</p>
                <Link href="/opportunities/vacancy" className={styles.inlineBtn}>View vacancies</Link>
              </div>
            ) : (
              <div className={styles.list}>
                {vacancyApps.map((app) => (
                  <div key={app.id} className={styles.card}>
                    <div className={styles.cardTop}>
                      <div className={styles.cardInfo}>
                        <div className={styles.cardBadgeRow}>
                          <span className={`${styles.typeBadge} ${styles[`vtype_${app.vacancy.type}`]}`}>
                            {VACANCY_TYPE_LABEL[app.vacancy.type] ?? app.vacancy.type}
                          </span>
                          <span className={styles.deptBadge}>
                            <MapPin size={11} />
                            {app.vacancy.department}
                          </span>
                        </div>
                        <h3 className={styles.cardTitle}>{app.vacancy.title}</h3>
                        {app.message && (
                          <p className={styles.cardNote}>
                            {app.message.length > 120
                              ? app.message.slice(0, 120) + "…"
                              : app.message}
                          </p>
                        )}
                      </div>
                      <div className={styles.cardMeta}>
                        <span className={styles.submittedDate}>
                          <Clock size={12} />
                          {formatDate(app.createdAt)}
                        </span>
                        {app.vacancy.status === "OPEN" ? (
                          <span className={styles.openBadge}>
                            <CheckCircle2 size={12} /> Still Open
                          </span>
                        ) : (
                          <span className={styles.closedBadge}>Closed</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* ── MENTORING APPLICATIONS ── */}
          <section>
            <div className={styles.sectionHeader}>
              <div className={styles.sectionTitleRow}>
                <GraduationCap size={16} className={styles.sectionIcon} />
                <h2 className={styles.sectionTitle}>Mentoring Applications</h2>
                <span className={styles.countBadge}>{mentoringApps.length}</span>
              </div>
              <Link href="/opportunities/mentoring" className={styles.sectionLink}>
                Browse <ArrowRight size={13} />
              </Link>
            </div>

            {mentoringApps.length === 0 ? (
              <div className={styles.emptyInline}>
                <p>No mentoring applications yet.</p>
                <Link href="/opportunities/mentoring" className={styles.inlineBtn}>View programs</Link>
              </div>
            ) : (
              <div className={styles.list}>
                {mentoringApps.map((app) => (
                  <div key={app.id} className={styles.card}>
                    <div className={styles.cardTop}>
                      <div className={styles.cardInfo}>
                        <div className={styles.cardBadgeRow}>
                          <span className={styles.mentoringBadge}>
                            <GraduationCap size={11} /> Mentoring Program
                          </span>
                          {app.program.isOpen && (
                            <span className={styles.openBadge}>
                              <CheckCircle2 size={12} /> Open
                            </span>
                          )}
                        </div>
                        <h3 className={styles.cardTitle}>
                          {app.program.duration} Mentoring Program
                        </h3>
                        {app.goals && (
                          <p className={styles.cardNote}>
                            <span className={styles.noteLabel}>Goals: </span>
                            {app.goals.length > 140
                              ? app.goals.slice(0, 140) + "…"
                              : app.goals}
                          </p>
                        )}
                        {app.background && (
                          <p className={styles.cardNote}>
                            <span className={styles.noteLabel}>Background: </span>
                            {app.background.length > 120
                              ? app.background.slice(0, 120) + "…"
                              : app.background}
                          </p>
                        )}
                      </div>
                      <div className={styles.cardMeta}>
                        <span className={styles.submittedDate}>
                          <Clock size={12} />
                          {formatDate(app.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

        </div>
      )}
    </div>
  );
}
