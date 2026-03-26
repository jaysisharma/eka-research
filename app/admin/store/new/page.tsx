export const dynamic = "force-dynamic";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ProductForm } from "../ProductForm";
import styles from "./page.module.css";

export default async function NewProductPage() {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") redirect("/auth/login");

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.heading}>New product</h1>
        <p className={styles.sub}>Add a new item to the Eka Research store.</p>
      </div>
      <ProductForm mode="create" />
    </div>
  );
}
