export const dynamic = "force-dynamic";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { Plus, Pencil, Eye, EyeOff } from "lucide-react";
import { DeleteBtn } from "./DeleteBtn";
import { FeaturedToggle } from "../FeaturedToggle";
import styles from "../cms.module.css";

const CATEGORY_LABEL: Record<string, string> = {
  announcement: "Announcement", publication: "Publication",
  milestone: "Milestone", event: "Event", media: "Media",
};

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" });
}

export default async function AdminNewsPage() {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") redirect("/auth/login");

  const posts = await db.newsPost.findMany({ orderBy: { date: "desc" } });

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div className={styles.headerText}>
          <h1 className={styles.heading}>News</h1>
          <p className={styles.sub}>{posts.length} post{posts.length !== 1 ? "s" : ""}</p>
        </div>
        <Link href="/admin/news/new" className={styles.addBtn}>
          <Plus size={15} /> New post
        </Link>
      </div>

      {posts.length === 0 ? (
        <div className={styles.empty}>
          <p>No news posts yet.</p>
          <Link href="/admin/news/new" className={styles.addBtn}><Plus size={14} /> Create first post</Link>
        </div>
      ) : (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th className={styles.th}>Title</th>
                <th className={styles.th}>Category</th>
                <th className={styles.th}>Date</th>
                <th className={styles.th}>Status</th>
                <th className={styles.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {posts.map((p) => (
                <tr key={p.id} className={styles.tr}>
                  <td className={styles.td}>
                    <div className={styles.titleCell}>
                      {p.imageUrl && (
                        <div className={styles.thumb}>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={p.imageUrl} alt="" className={styles.thumbImg} />
                        </div>
                      )}
                      <span className={styles.titleText}>{p.title}</span>
                    </div>
                  </td>
                  <td className={`${styles.td} ${styles.tdMuted}`}>{CATEGORY_LABEL[p.category] ?? p.category}</td>
                  <td className={`${styles.td} ${styles.tdMuted}`}>{formatDate(p.date)}</td>
                  <td className={styles.td}>
                    <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                      {p.published
                        ? <span className={styles.badgePublished}><Eye size={12} /> Published</span>
                        : <span className={styles.badgeDraft}><EyeOff size={12} /> Draft</span>}
                    </div>
                  </td>
                  <td className={styles.td}>
                    <div className={styles.actions}>
                      <FeaturedToggle id={p.id} featured={p.featured} endpoint="/api/admin/news" />
                      <Link href={`/admin/news/${p.id}/edit`} className={styles.editBtn} title="Edit"><Pencil size={14} /></Link>
                      <DeleteBtn id={p.id} title={p.title} endpoint="/api/admin/news" />
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
