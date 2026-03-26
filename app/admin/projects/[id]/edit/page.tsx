import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ProjectForm } from "../../ProjectForm";
import styles from "../../../cms.module.css";

export default async function EditProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") redirect("/auth/login");

  const { id } = await params;

  const [project, categories] = await Promise.all([
    db.project.findUnique({ where: { id } }),
    db.projectCategory.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
  ]);

  if (!project) notFound();

  return (
    <div className={styles.formPage}>
      <div className={styles.formHeader}>
        <Link href="/admin/projects" style={{ display: "inline-flex", alignItems: "center", gap: "var(--space-1)", fontSize: "var(--text-sm)", color: "var(--text-muted)", textDecoration: "none", marginBottom: "var(--space-4)" }}>
          <ArrowLeft size={14} /> Back to projects
        </Link>
        <h1 className={styles.heading}>Edit project</h1>
        <p className={styles.sub}>{project.title}</p>
      </div>
      <ProjectForm
        mode="edit"
        projectId={project.id}
        categories={categories}
        initial={{
          title:        project.title,
          description:  project.description,
          status:       project.status,
          categoryId:   project.categoryId,
          period:       project.period,
          tags:         project.tags,
          imageUrl:     project.imageUrl ?? "",
          href:         project.href,
          featured:     project.featured,
          published:    project.published,
          outcome:      project.outcome ?? "",
          phase:        project.phase ?? "",
          launchTarget: project.launchTarget ?? "",
        }}
      />
    </div>
  );
}
