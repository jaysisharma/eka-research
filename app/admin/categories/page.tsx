import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { Tag } from "lucide-react";
import { CategoryActions, CategoryDeleteClient } from "./CategoryActions";
import styles from "../cms.module.css";

export default async function AdminCategoriesPage() {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") redirect("/auth/login");

  const categories = await db.projectCategory.findMany({
    orderBy: { createdAt: "asc" },
    include: { _count: { select: { projects: true } } },
  });

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div className={styles.headerText}>
          <h1 className={styles.heading}>Project Categories</h1>
          <p className={styles.sub}>{categories.length} categor{categories.length !== 1 ? "ies" : "y"}</p>
        </div>
      </div>

      <CategoryActions />

      {categories.length === 0 ? (
        <div className={styles.empty} style={{ marginTop: "var(--space-6)" }}>
          <Tag size={24} />
          <p>No categories yet. Add your first one above.</p>
        </div>
      ) : (
        <div className={styles.tableWrap} style={{ marginTop: "var(--space-6)" }}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th className={styles.th}>Name</th>
                <th className={styles.th}>Slug</th>
                <th className={styles.th}>Projects</th>
                <th className={styles.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((cat: any) => (
                <tr key={cat.id} className={styles.tr}>
                  <td className={styles.td}>
                    <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
                      <Tag size={14} style={{ color: "var(--text-muted)" }} />
                      <span style={{ fontWeight: "var(--weight-medium)" }}>{cat.name}</span>
                    </div>
                  </td>
                  <td className={`${styles.td} ${styles.tdMuted}`}>
                    <code style={{ fontSize: "var(--text-xs)", background: "var(--bg-subtle)", padding: "2px 6px", borderRadius: "var(--radius-sm)" }}>
                      {cat.slug}
                    </code>
                  </td>
                  <td className={`${styles.td} ${styles.tdMuted}`}>{cat._count.projects}</td>
                  <td className={styles.td}>
                    <CategoryDeleteClient
                      id={cat.id}
                      name={cat.name}
                      disabled={cat._count.projects > 0}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
