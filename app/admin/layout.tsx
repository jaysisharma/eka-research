import Link from "next/link";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import styles from "@/app/dashboard/layout.module.css";
import { SidebarNav } from "@/components/dashboard/SidebarNav";
import { LogoutButton } from "@/components/dashboard/LogoutButton";
import ThemeToggle from "@/components/layout/ThemeToggle";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session) {
    redirect("/auth/login");
  }

  const user = session.user;

  // Enforce ADMIN role security at layout level
  if (user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  return (
    <div className={styles.container}>
      {/* ───────────────────── */}
      {/* SIDEBAR — always dark */}
      {/* ───────────────────── */}
      <aside className={styles.sidebar}>
        {/* LOGO */}
        <div className={styles.sidebarBrand}>
          <Link href="/" className={styles.logo}>
            EKA<span className={styles.logoDot}>.</span>
          </Link>
        </div>

        {/* NAVIGATION — adminMode collapses the redundant "Admin Console" entry
             and points "Dashboard" to /admin/dashboard */}
        <SidebarNav role={user.role as string} adminMode />

        {/* COMPACT FOOTER */}
        <div className={styles.sidebarFooterCompact}>
          <Link href="/dashboard/profile" className={styles.userInfoCompact}>
            <div className={styles.avatar}>
              {user.name?.[0]?.toUpperCase()}
            </div>
            <div className={styles.userTextCompact}>
              <span className={styles.userNameCompact}>{user.name}</span>
              <span className={styles.userRoleCompact}>Administrator</span>
            </div>
          </Link>

          <div className={styles.footerActionsCompact}>
            <ThemeToggle />
            <LogoutButton />
          </div>
        </div>
      </aside>

      {/* ───────────────────── */}
      {/* MAIN CONTENT         */}
      {/* ───────────────────── */}
      <div className={styles.viewport}>
        <main className={styles.content}>
          {children}
        </main>
      </div>
    </div>
  );
}
