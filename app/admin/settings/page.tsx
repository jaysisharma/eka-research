import { auth } from "@/lib/auth";
import { buildMetadata } from "@/lib/seo";
import PasswordForm from "./PasswordForm";
import styles from "./page.module.css";

export const metadata = buildMetadata({
  title: "Settings",
  description: "Admin account settings.",
  path: "/admin/settings",
  noIndex: true,
});

export default async function AdminSettingsPage() {
  // Admin role is enforced in app/admin/layout.tsx
  const session = await auth();
  const user = session?.user;

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.pageTitle}>Settings</h1>
        <p className={styles.pageSubtitle}>Manage your admin account.</p>
      </header>

      <section className={styles.card}>
        <h2 className={styles.cardTitle}>Account</h2>
        <dl className={styles.details}>
          <div className={styles.detailRow}>
            <dt>Name</dt>
            <dd>{user?.name}</dd>
          </div>
          <div className={styles.detailRow}>
            <dt>Email</dt>
            <dd>{user?.email}</dd>
          </div>
          <div className={styles.detailRow}>
            <dt>Role</dt>
            <dd>Administrator</dd>
          </div>
        </dl>
      </section>

      <section className={styles.card}>
        <h2 className={styles.cardTitle}>Change password</h2>
        <p className={styles.cardSubtitle}>
          Enter your current password, then choose a new one.
        </p>
        <PasswordForm />
      </section>
    </div>
  );
}
