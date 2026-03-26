import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect, notFound } from "next/navigation";
import { NewsForm } from "../../NewsForm";
import styles from "../../../cms.module.css";

type Props = { params: Promise<{ id: string }> };

export default async function EditNewsPage({ params }: Props) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") redirect("/auth/login");

  const { id } = await params;
  const post = await db.newsPost.findUnique({ where: { id } });
  if (!post) notFound();

  return (
    <div className={styles.formPage}>
      <div className={styles.formHeader}>
        <h1 className={styles.heading}>Edit news post</h1>
        <p className={styles.sub}>{post.title}</p>
      </div>
      <NewsForm
        mode="edit"
        postId={post.id}
        initial={{
          slug: post.slug,
          title: post.title,
          excerpt: post.excerpt,
          category: post.category,
          date: post.date,
          imageUrl: post.imageUrl ?? "",
          href: post.href,
          featured: post.featured,
          published: post.published,
        }}
      />
    </div>
  );
}
