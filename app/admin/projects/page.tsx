export const dynamic = "force-dynamic";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { Plus, Pencil, Eye, EyeOff, Star } from "lucide-react";
import { ProjectDeleteBtn } from "./ProjectDeleteBtn";
import { FeaturedToggle } from "../FeaturedToggle";
import styles from "../cms.module.css";

const STATUS_LABEL: Record<string, string> = {
  ongoing:   "Ongoing",
  completed: "Completed",
  upcoming:  "Upcoming",
};

export default async function AdminProjectsPage() {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") redirect("/auth/login");

  const projects = await db.project.findMany({
    orderBy: { createdAt: "desc" },
    include: { category: true },
  });

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div className={styles.headerText}>
          <h1 className={styles.heading}>Projects</h1>
          <p className={styles.sub}>{projects.length} project{projects.length !== 1 ? "s" : ""}</p>
        </div>
        <Link href="/admin/projects/new" className={styles.addBtn}>
          <Plus size={15} /> New project
        </Link>
      </div>

      {projects.length === 0 ? (
        <div className={styles.empty}>
          <p>No projects yet.</p>
          <Link href="/admin/projects/new" className={styles.addBtn}>
            <Plus size={14} /> Create first project
          </Link>
        </div>
      ) : (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th className={styles.th}>Title</th>
                <th className={styles.th}>Category</th>
                <th className={styles.th}>Status</th>
                <th className={styles.th}>Period</th>
                <th className={styles.th}>Visibility</th>
                <th className={styles.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {projects.map((p) => (
                <tr key={p.id} className={styles.tr}>
                  <td className={styles.td}>
                    <div className={styles.titleCell}>
                      {p.imageUrl && (
                        <div className={styles.thumb}>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={p.imageUrl} alt="" className={styles.thumbImg} />
                        </div>
                      )}
                      <div>
                        <span className={styles.titleText}>{p.title}</span>
                        {p.featured && (
                          <span className={styles.badgeFeatured} style={{ marginTop: 4, display: "inline-flex" }}>
                            <Star size={10} /> Featured
                          </span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className={`${styles.td} ${styles.tdMuted}`}>{p.category.name}</td>
                  <td className={`${styles.td} ${styles.tdMuted}`}>
                    {STATUS_LABEL[p.status] ?? p.status}
                  </td>
                  <td className={`${styles.td} ${styles.tdMuted}`}>{p.period}</td>
                  <td className={styles.td}>
                    {p.published
                      ? <span className={styles.badgePublished}><Eye size={12} /> Published</span>
                      : <span className={styles.badgeDraft}><EyeOff size={12} /> Draft</span>}
                  </td>
                  <td className={styles.td}>
                    <div className={styles.actions}>
                      <FeaturedToggle id={p.id} featured={p.featured} endpoint="/api/admin/projects" />
                      <Link href={`/admin/projects/${p.id}/edit`} className={styles.editBtn} title="Edit">
                        <Pencil size={14} />
                      </Link>
                      <ProjectDeleteBtn id={p.id} title={p.title} />
                    </div>
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
