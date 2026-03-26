export const dynamic = "force-dynamic";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Calendar, Database, BookOpen, Users, ArrowRight } from "lucide-react";
import styles from "./page.module.css";

function formatDate(date: Date): string {
  return date.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
}

const QUICK_LINKS = [
  { Icon: Calendar,  label: "Upcoming events",    href: "/events",    desc: "Observation nights and workshops" },
  { Icon: Database,  label: "Research data",      href: "/research",  desc: "Datasets and publications" },
  { Icon: BookOpen,  label: "Articles",            href: "/articles",  desc: "Latest from the team" },
  { Icon: Users,     label: "Team",                href: "/team",      desc: "Meet the researchers" },
];

export default async function DashboardPage() {
  const session = await auth();
  if (!session) redirect("/auth/login");

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { name: true, email: true, level: true, interest: true, createdAt: true },
  });

  if (!user) redirect("/auth/login");

  const firstName = user.name.split(" ")[0];

  return (
    <div className={styles.page}>

      {/* ── HEADER ── */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.heading}>Welcome back, {firstName}</h1>
          <p className={styles.sub}>Member since {formatDate(user.createdAt)}</p>
        </div>
        <span className={styles.memberBadge}>Active member</span>
      </div>

      {/* ── PROFILE CARD ── */}
      <section className={styles.section}>
        <h2 className={styles.sectionHeading}>Your profile</h2>
        <div className={styles.profileCard}>
          <div className={styles.profileAvatar}>
            {user.name[0].toUpperCase()}
          </div>
          <dl className={styles.profileGrid}>
            <div className={styles.profileItem}>
              <dt className={styles.profileKey}>Full name</dt>
              <dd className={styles.profileVal}>{user.name}</dd>
            </div>
            <div className={styles.profileItem}>
              <dt className={styles.profileKey}>Email</dt>
              <dd className={styles.profileVal}>{user.email}</dd>
            </div>
            {user.level && (
              <div className={styles.profileItem}>
                <dt className={styles.profileKey}>Academic level</dt>
                <dd className={styles.profileVal}>{user.level}</dd>
              </div>
            )}
            {user.interest && (
              <div className={styles.profileItem}>
                <dt className={styles.profileKey}>Area of interest</dt>
                <dd className={styles.profileVal}>{user.interest}</dd>
              </div>
            )}
          </dl>
        </div>
      </section>

      {/* ── QUICK LINKS ── */}
      <section className={styles.section}>
        <h2 className={styles.sectionHeading}>Explore</h2>
        <div className={styles.linkGrid}>
          {QUICK_LINKS.map(({ Icon, label, href, desc }) => (
            <Link key={href} href={href} className={styles.linkCard}>
              <div className={styles.linkIcon}>
                <Icon size={18} strokeWidth={1.75} />
              </div>
              <div className={styles.linkBody}>
                <span className={styles.linkLabel}>{label}</span>
                <span className={styles.linkDesc}>{desc}</span>
              </div>
              <ArrowRight size={14} className={styles.linkArrow} />
            </Link>
          ))}
        </div>
      </section>

      {/* ── MENTORING CTA ── */}
      <section className={styles.section}>
        <div className={styles.mentorCta}>
          <div>
            <h3 className={styles.mentorCtaHeading}>Apply for mentoring</h3>
            <p className={styles.mentorCtaDesc}>
              Get matched 1-on-1 with an active researcher or academic. Free for all members.
            </p>
          </div>
          <Link href="/opportunities/mentoring" className={styles.mentorCtaBtn}>
            Learn more <ArrowRight size={14} />
          </Link>
        </div>
      </section>

    </div>
  );
}
