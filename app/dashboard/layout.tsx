import Link from "next/link";
import { auth, signOut } from "@/lib/auth";
import { redirect } from "next/navigation";

import {
  LogOut,
} from "lucide-react";

import styles from "./layout.module.css";

import { SidebarNav } from "@/components/dashboard/SidebarNav";
import { UpgradeCard } from "@/components/dashboard/UpgradeCard";

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

        <div className={styles.sidebarFooter}>

          {user.role === "FREE_USER" && (
            <UpgradeCard />
          )}

          <div className={styles.userCard}>

            <Link
              href="/dashboard/profile"
              className={styles.userInfo}
            >
              <div className={styles.avatar}>
                {user.name?.[0]?.toUpperCase()}
              </div>

              <div>
                <h3 className={styles.userName}>
                  {user.name}
                </h3>

                <p className={styles.userRole}>
                  {user.role === "ADMIN" ? "Administrator" :
                   user.role === "FREE_USER" ? "Regular User" :
                   user.role === "PAID_MEMBER" ? "Premium Member" :
                   user.role.charAt(0) + user.role.slice(1).toLowerCase().replace("_", " ")}
                </p>
              </div>
            </Link>

            <form
              action={async () => {
                "use server";

                await signOut({
                  redirectTo: "/",
                });
              }}
            >
              <button
                type="submit"
                className={styles.logoutBtn}
              >
                <LogOut size={16} />

                <span>Sign Out</span>
              </button>
            </form>
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