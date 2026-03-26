import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { Shield, User } from "lucide-react";
import { ROLE_LABELS } from "@/lib/access";
import { MemberActions } from "./MemberActions";
import styles from "../cms.module.css";

function formatDate(d: Date) {
  return new Date(d).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" });
}

const LEVEL_LABEL: Record<string, string> = {
  student: "Student",
  researcher: "Researcher",
  professional: "Professional",
  enthusiast: "Enthusiast",
};

export default async function AdminMembersPage() {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") redirect("/auth/login");

  const members = await db.user.findMany({ orderBy: { createdAt: "desc" } });
  const adminCount = members.filter((m) => m.role === "ADMIN").length;

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div className={styles.headerText}>
          <h1 className={styles.heading}>Members</h1>
          <p className={styles.sub}>
            {members.length} member{members.length !== 1 ? "s" : ""} &nbsp;·&nbsp; {adminCount} admin{adminCount !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      {members.length === 0 ? (
        <div className={styles.empty}>
          <p>No members yet.</p>
        </div>
      ) : (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th className={styles.th}>Name</th>
                <th className={styles.th}>Email</th>
                <th className={styles.th}>Role</th>
                <th className={styles.th}>Level</th>
                <th className={styles.th}>Joined</th>
                <th className={styles.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {members.map((m) => {
                const isSelf = m.id === session.user.id;
                return (
                  <tr key={m.id} className={styles.tr}>
                    <td className={styles.td}>
                      <div className={styles.titleCell}>
                        <div style={{
                          width: 28, height: 28, borderRadius: "50%",
                          background: m.role === "ADMIN" ? "var(--color-brand-gold)" : "var(--bg-subtle)",
                          color: m.role === "ADMIN" ? "var(--color-brand-navy)" : "var(--text-muted)",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          flexShrink: 0, fontSize: "var(--text-xs)", fontWeight: "var(--weight-bold)",
                        }}>
                          {m.name?.[0]?.toUpperCase() ?? "?"}
                        </div>
                        <span className={styles.titleText}>{m.name}</span>
                      </div>
                    </td>
                    <td className={`${styles.td} ${styles.tdMuted}`}>{m.email}</td>
                    <td className={styles.td}>
                      {m.role === "ADMIN" ? (
                        <span className={styles.badgePublished}>
                          <Shield size={11} /> {ROLE_LABELS["ADMIN"]}
                        </span>
                      ) : (
                        <span className={styles.badgeDraft}>
                          <User size={11} /> {ROLE_LABELS[m.role as keyof typeof ROLE_LABELS] ?? m.role}
                        </span>
                      )}
                    </td>
                    <td className={`${styles.td} ${styles.tdMuted}`}>
                      {m.level ? (LEVEL_LABEL[m.level] ?? m.level) : "—"}
                    </td>
                    <td className={`${styles.td} ${styles.tdMuted}`}>{formatDate(m.createdAt)}</td>
                    <td className={styles.td}>
                      <MemberActions id={m.id} role={m.role} isSelf={isSelf} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
