import Link from "next/link";
import { auth, signOut } from "@/lib/auth";
import { redirect } from "next/navigation";
import { LogOut } from "lucide-react";
import AdminNav from "./AdminNav";
import styles from "./layout.module.css";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") redirect("/auth/login");

  const user = session.user;

  return (
    <div className={styles.shell}>

      <aside className={styles.sidebar}>
        <div className={styles.sidebarTop}>
          <div className={styles.logoRow}>
            <Link href="/" className={styles.siteName}>
              Eka <span className={styles.siteAccent}>Research</span>
            </Link>
            <span className={styles.adminBadge}>Admin</span>
          </div>

          <AdminNav />
        </div>

        <div className={styles.sidebarBottom}>
          <div className={styles.userRow}>
            <div className={styles.avatar}>
              {user.name?.[0]?.toUpperCase() ?? "A"}
            </div>
            <div className={styles.userInfo}>
              <span className={styles.userName}>{user.name}</span>
              <span className={styles.userRole}>Administrator</span>
            </div>
          </div>
          <form action={async () => {
            "use server";
            await signOut({ redirectTo: "/" });
          }}>
            <button type="submit" className={styles.signOutBtn} title="Sign out">
              <LogOut size={15} />
            </button>
          </form>
        </div>
      </aside>

      <main className={styles.main}>{children}</main>

    </div>
  );
}
