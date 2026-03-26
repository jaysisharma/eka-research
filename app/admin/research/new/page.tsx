import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ResearchForm } from "../ResearchForm";
import styles from "../../cms.module.css";

export default async function NewResearchPage() {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") redirect("/auth/login");

  return (
    <div className={styles.formPage}>
      <div className={styles.formHeader}>
        <h1 className={styles.heading}>New research article</h1>
        <p className={styles.sub}>Add a publication to the Eka Research catalogue.</p>
      </div>
      <ResearchForm mode="create" />
    </div>
  );
}
