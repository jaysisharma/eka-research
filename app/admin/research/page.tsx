import Link from "next/link";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { Plus, Pencil, Eye, EyeOff, ExternalLink } from "lucide-react";
import { DeleteBtn } from "../news/DeleteBtn";
import { FeaturedToggle } from "../FeaturedToggle";
import styles from "../cms.module.css";

const TYPE_LABEL: Record<string, string> = {
  journal: "Journal", conference: "Conference", preprint: "Preprint", report: "Report",
};

export default async function AdminResearchPage() {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") redirect("/auth/login");

  const articles = await db.researchArticle.findMany({ orderBy: [{ year: "desc" }, { date: "desc" }] });

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div className={styles.headerText}>
          <h1 className={styles.heading}>Research articles</h1>
          <p className={styles.sub}>{articles.length} article{articles.length !== 1 ? "s" : ""}</p>
        </div>
        <Link href="/admin/research/new" className={styles.addBtn}>
          <Plus size={15} /> New article
        </Link>
      </div>

      {articles.length === 0 ? (
        <div className={styles.empty}>
          <p>No research articles yet.</p>
          <Link href="/admin/research/new" className={styles.addBtn}><Plus size={14} /> Add first article</Link>
        </div>
      ) : (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th className={styles.th}>Title</th>
                <th className={styles.th}>Type</th>
                <th className={styles.th}>Journal</th>
                <th className={styles.th}>Year</th>
                <th className={styles.th}>Status</th>
                <th className={styles.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {articles.map((a) => (
                <tr key={a.id} className={styles.tr}>
                  <td className={styles.td}>
                    <div className={styles.titleCell}>
                      {a.imageUrl && (
                        <div className={styles.thumb}>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={a.imageUrl} alt="" className={styles.thumbImg} />
                        </div>
                      )}
                      <span className={styles.titleText}>{a.title}</span>
                    </div>
                  </td>
                  <td className={`${styles.td} ${styles.tdMuted}`}>{TYPE_LABEL[a.type] ?? a.type}</td>
                  <td className={`${styles.td} ${styles.tdMuted}`}>
                    <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                      <span style={{ maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {a.journal}
                      </span>
                      {a.doi && (
                        <a href={`https://doi.org/${a.doi}`} target="_blank" rel="noopener noreferrer" style={{ color: "var(--text-muted)", flexShrink: 0 }}>
                          <ExternalLink size={11} />
                        </a>
                      )}
                    </span>
                  </td>
                  <td className={`${styles.td} ${styles.tdMuted}`}>{a.year}</td>
                  <td className={styles.td}>
                    <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                      {a.published
                        ? <span className={styles.badgePublished}><Eye size={12} /> Published</span>
                        : <span className={styles.badgeDraft}><EyeOff size={12} /> Draft</span>}
                    </div>
                  </td>
                  <td className={styles.td}>
                    <div className={styles.actions}>
                      <FeaturedToggle id={a.id} featured={a.featured} endpoint="/api/admin/research" />
                      <Link href={`/admin/research/${a.id}/edit`} className={styles.editBtn} title="Edit"><Pencil size={14} /></Link>
                      <DeleteBtn id={a.id} title={a.title} endpoint="/api/admin/research" />
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
