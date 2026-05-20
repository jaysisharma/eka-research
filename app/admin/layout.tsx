import Link from "next/link";
import { auth, signOut } from "@/lib/auth";
import { redirect } from "next/navigation";
import { LogOut } from "lucide-react";
import styles from "@/app/dashboard/layout.module.css";
import { SidebarNav } from "@/components/dashboard/SidebarNav";

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
          <div className={styles.userCard}>
            <Link href="/dashboard/profile" className={styles.userInfo}>
              <div className={styles.avatar}>
                {user.name?.[0]?.toUpperCase()}
              </div>

              <div>
                <h3 className={styles.userName}>
                  {user.name}
                </h3>

                <p className={styles.userRole}>
                  Administrator
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
              <button type="submit" className={styles.logoutBtn}>
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
