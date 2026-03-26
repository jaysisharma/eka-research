import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { Users, UserCheck, TrendingUp, Clock } from "lucide-react";
import styles from "./page.module.css";

function formatDate(date: Date): string {
  return date.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

function formatRelative(date: Date): string {
  const diff = Date.now() - date.getTime();
  const days = Math.floor(diff / 86_400_000);
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;
  return formatDate(date);
}

export default async function AdminPage() {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") redirect("/auth/login");

  const now = new Date();
  const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [totalMembers, newThisMonth, recentUsers] = await Promise.all([
    db.user.count({ where: { role: { not: "ADMIN" } } }),
    db.user.count({ where: { role: { not: "ADMIN" }, createdAt: { gte: firstOfMonth } } }),
    db.user.findMany({
      where: { role: { not: "ADMIN" } },
      orderBy: { createdAt: "desc" },
      take: 20,
      select: { id: true, name: true, email: true, level: true, interest: true, createdAt: true },
    }),
  ]);

  const stats = [
    { Icon: Users,     label: "Total members",    value: totalMembers,   color: "gold" },
    { Icon: TrendingUp, label: "Joined this month", value: newThisMonth,  color: "green" },
    { Icon: UserCheck, label: "Admins",            value: await db.user.count({ where: { role: "ADMIN" } }), color: "muted" },
    { Icon: Clock,     label: "All time",          value: totalMembers,  color: "muted" },
  ] as const;

  return (
    <div className={styles.page}>

      <div className={styles.header}>
        <h1 className={styles.heading}>Admin overview</h1>
        <p className={styles.sub}>Manage members and monitor activity</p>
      </div>

      {/* Stats */}
      <section className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={`${styles.statIcon} ${styles.statIconGold}`}>
            <Users size={18} strokeWidth={1.75} />
          </div>
          <span className={styles.statValue}>{totalMembers}</span>
          <span className={styles.statLabel}>Total members</span>
        </div>
        <div className={styles.statCard}>
          <div className={`${styles.statIcon} ${styles.statIconGreen}`}>
            <TrendingUp size={18} strokeWidth={1.75} />
          </div>
          <span className={styles.statValue}>{newThisMonth}</span>
          <span className={styles.statLabel}>Joined this month</span>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <UserCheck size={18} strokeWidth={1.75} />
          </div>
          <span className={styles.statValue}>{await db.user.count({ where: { role: "ADMIN" } })}</span>
          <span className={styles.statLabel}>Administrators</span>
        </div>
      </section>

      {/* Members table */}
      <section className={styles.section}>
        <div className={styles.sectionHead}>
          <h2 className={styles.sectionHeading}>Recent registrations</h2>
          <span className={styles.sectionCount}>{totalMembers} total</span>
        </div>

        {recentUsers.length === 0 ? (
          <p className={styles.empty}>No members yet.</p>
        ) : (
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th className={styles.th}>Name</th>
                  <th className={styles.th}>Email</th>
                  <th className={styles.th}>Level</th>
                  <th className={styles.th}>Interest</th>
                  <th className={styles.th}>Joined</th>
                </tr>
              </thead>
              <tbody>
                {recentUsers.map((u) => (
                  <tr key={u.id} className={styles.tr}>
                    <td className={styles.td}>
                      <div className={styles.nameCell}>
                        <span className={styles.miniAvatar}>{u.name[0].toUpperCase()}</span>
                        <span className={styles.nameText}>{u.name}</span>
                      </div>
                    </td>
                    <td className={`${styles.td} ${styles.tdMuted}`}>{u.email}</td>
                    <td className={`${styles.td} ${styles.tdMuted}`}>{u.level ?? "—"}</td>
                    <td className={`${styles.td} ${styles.tdMuted}`}>{u.interest ?? "—"}</td>
                    <td className={`${styles.td} ${styles.tdMuted}`}>
                      <span title={formatDate(u.createdAt)}>{formatRelative(u.createdAt)}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

    </div>
  );
}
