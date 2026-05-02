export const dynamic = "force-dynamic";
import { Suspense } from "react";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { Shield, User, Clock } from "lucide-react";
import { ROLE_LABELS } from "@/lib/access";
import { MemberActions } from "./MemberActions";
import { MemberSearch } from "./MemberSearch";
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

export default async function AdminMembersPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string }>;
}) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") redirect("/admin/login");

  const { search } = await searchParams;

  const members = await db.user.findMany({
    where: search
      ? {
          OR: [
            { name: { contains: search, mode: "insensitive" } },
            { email: { contains: search, mode: "insensitive" } },
          ],
        }
      : undefined,
    orderBy: { createdAt: "desc" },
  });

  const totalCount = search ? undefined : members.length;
  const adminCount = members.filter((m) => m.role === "ADMIN").length;
  const pending = members.filter((m) => m.requestedRole);

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div className={styles.headerText}>
          <h1 className={styles.heading}>Members</h1>
          <p className={styles.sub}>
            {totalCount !== undefined
              ? <>{totalCount} member{totalCount !== 1 ? "s" : ""} &nbsp;·&nbsp; {adminCount} admin{adminCount !== 1 ? "s" : ""}</>
              : <>{members.length} result{members.length !== 1 ? "s" : ""} for &ldquo;{search}&rdquo;</>}
            {pending.length > 0 && !search && (
              <> &nbsp;·&nbsp; <span style={{ color: "var(--color-brand-gold)" }}>{pending.length} pending</span></>
            )}
          </p>
        </div>
        <Suspense>
          <MemberSearch />
        </Suspense>
      </div>

      {/* ── PENDING VERIFICATION ── */}
      {!search && pending.length > 0 && (
        <div style={{ marginBottom: "var(--space-8)" }}>
          <h2 className={styles.sub} style={{ display: "flex", alignItems: "center", gap: "var(--space-2)", marginBottom: "var(--space-4)", color: "var(--color-brand-gold)", fontWeight: "var(--weight-semibold)" }}>
            <Clock size={14} /> Pending verification ({pending.length})
          </h2>
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th className={styles.th}>Name</th>
                  <th className={styles.th}>Email</th>
                  <th className={styles.th}>Requested role</th>
                  <th className={styles.th}>Joined</th>
                  <th className={styles.th}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {pending.map((m) => (
                  <tr key={m.id} className={styles.tr}>
                    <td className={styles.td}>
                      <div className={styles.titleCell}>
                        <div style={{ width: 28, height: 28, borderRadius: "50%", background: "var(--bg-subtle)", color: "var(--text-muted)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: "var(--text-xs)", fontWeight: "var(--weight-bold)" }}>
                          {m.name?.[0]?.toUpperCase() ?? "?"}
                        </div>
                        <span className={styles.titleText}>{m.name}</span>
                      </div>
                    </td>
                    <td className={`${styles.td} ${styles.tdMuted}`}>{m.email}</td>
                    <td className={styles.td}>
                      <span className={styles.badgeDraft}>
                        <Clock size={11} /> {ROLE_LABELS[m.requestedRole as keyof typeof ROLE_LABELS] ?? m.requestedRole}
                      </span>
                    </td>
                    <td className={`${styles.td} ${styles.tdMuted}`}>{formatDate(m.createdAt)}</td>
                    <td className={styles.td}>
                      <MemberActions id={m.id} name={m.name} role={m.role} requestedRole={m.requestedRole ?? undefined} isSelf={m.id === session.user.id} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {members.length === 0 ? (
        <div className={styles.empty}>
          <p>{search ? `No members found for "${search}".` : "No members yet."}</p>
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
                      <MemberActions id={m.id} name={m.name} role={m.role} requestedRole={m.requestedRole ?? undefined} isSelf={isSelf} />
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
