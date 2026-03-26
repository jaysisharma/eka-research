export const dynamic = "force-dynamic";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect, notFound } from "next/navigation";
import { ResearchForm } from "../../ResearchForm";
import styles from "../../../cms.module.css";

type Props = { params: Promise<{ id: string }> };

export default async function EditResearchPage({ params }: Props) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") redirect("/auth/login");

  const { id } = await params;
  const article = await db.researchArticle.findUnique({ where: { id } });
  if (!article) notFound();

  const authors = (JSON.parse(article.authors) as string[]).join("\n");
  const ekaAuthors = (JSON.parse(article.ekaAuthors) as string[]).join("\n");
  const disciplines = (JSON.parse(article.disciplines) as string[]).join(", ");

  return (
    <div className={styles.formPage}>
      <div className={styles.formHeader}>
        <h1 className={styles.heading}>Edit article</h1>
        <p className={styles.sub}>{article.title}</p>
      </div>
      <ResearchForm
        mode="edit"
        articleId={article.id}
        initial={{
          title: article.title,
          authors,
          ekaAuthors,
          journal: article.journal,
          year: String(article.year),
          date: article.date,
          type: article.type,
          disciplines,
          abstract: article.abstract,
          imageUrl: article.imageUrl ?? "",
          doi: article.doi ?? "",
          arxiv: article.arxiv ?? "",
          featured: article.featured,
          published: article.published,
        }}
      />
    </div>
  );
}
