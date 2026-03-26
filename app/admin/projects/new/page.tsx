export const dynamic = "force-dynamic";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ProjectForm } from "../ProjectForm";
import styles from "../../cms.module.css";

export default async function NewProjectPage() {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") redirect("/auth/login");

  const categories = await db.projectCategory.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });

  return (
    <div className={styles.formPage}>
      <div className={styles.formHeader}>
        <Link href="/admin/projects" style={{ display: "inline-flex", alignItems: "center", gap: "var(--space-1)", fontSize: "var(--text-sm)", color: "var(--text-muted)", textDecoration: "none", marginBottom: "var(--space-4)" }}>
          <ArrowLeft size={14} /> Back to projects
        </Link>
        <h1 className={styles.heading}>New project</h1>
      </div>
      <ProjectForm mode="create" categories={categories} />
    </div>
  );
}
