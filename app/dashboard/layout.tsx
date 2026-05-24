import Link from "next/link";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

import styles from "./layout.module.css";

import { SidebarNav } from "@/components/dashboard/SidebarNav";
import { UpgradeCard } from "@/components/dashboard/UpgradeCard";
import { LogoutButton } from "@/components/dashboard/LogoutButton";
import ThemeToggle from "@/components/layout/ThemeToggle";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session) {
    redirect("/auth/login");
  }

  const user = session.user;

  return (
    <div className={styles.container}>

      {/* ───────────────────── */}
      {/* SIDEBAR */}
      {/* ───────────────────── */}

      <aside className={styles.sidebar}>

        {/* LOGO */}

        <div className={styles.sidebarTop}>
          <Link href="/" className={styles.logo}>
            EKA<span>.</span>
          </Link>
        </div>

        {/* NAVIGATION */}

        <SidebarNav role={user.role as string} />

        {/* FOOTER */}
        <div className={styles.sidebarFooter} style={{ borderTop: "none", padding: 0 }}>
          {user.role === "FREE_USER" && (
            <UpgradeCard />
          )}

          {/* COMPACT FOOTER */}
          <div className={styles.sidebarFooterCompact}>
            <Link href="/dashboard/profile" className={styles.userInfoCompact}>
              <div className={styles.avatar}>
                {user.name?.[0]?.toUpperCase()}
              </div>
              <div className={styles.userTextCompact}>
                <span className={styles.userNameCompact}>{user.name}</span>
                <span className={styles.userRoleCompact}>
                  {user.role === "ADMIN" ? "Administrator" :
                    user.role === "FREE_USER" ? "Regular User" :
                      user.role === "PAID_MEMBER" ? "Premium Member" :
                        user.role.charAt(0) + user.role.slice(1).toLowerCase().replace("_", " ")}
                </span>
              </div>
            </Link>


            <div className={styles.footerActionsCompact}>
              <ThemeToggle />
              <LogoutButton />
            </div>


          </div>
        </div>
      </aside>



      {/* ───────────────────── */}
      {/* MAIN CONTENT */}
      {/* ───────────────────── */}

      <div className={styles.viewport}>
        <main className={styles.content}>
          {children}
        </main>
      </div>
    </div>
  );
}