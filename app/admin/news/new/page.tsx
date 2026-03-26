import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { NewsForm } from "../NewsForm";
import styles from "../../cms.module.css";

export default async function NewNewsPage() {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") redirect("/auth/login");

  return (
    <div className={styles.formPage}>
      <div className={styles.formHeader}>
        <h1 className={styles.heading}>New news post</h1>
        <p className={styles.sub}>Add an update to the Eka Research news feed.</p>
      </div>
      <NewsForm mode="create" />
    </div>
  );
}
