import Link from "next/link";
import { auth, signOut } from "@/lib/auth";
import { redirect } from "next/navigation";
import { LogOut, LayoutDashboard, Calendar, Database, Users, ShoppingBag, Shield } from "lucide-react";
import styles from "./layout.module.css";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session) redirect("/auth/login");

  const user = session.user;

  return (
    <div className={styles.shell}>

      {/* Sidebar */}
      <aside className={styles.sidebar}>
        <div className={styles.sidebarTop}>
          <Link href="/" className={styles.siteName}>
            Eka <span className={styles.siteAccent}>Research</span>
          </Link>

          <nav className={styles.nav}>
            <Link href="/dashboard" className={styles.navItem}>
              <LayoutDashboard size={16} />
              Dashboard
            </Link>
            <Link href="/events" className={styles.navItem}>
              <Calendar size={16} />
              Events
            </Link>
            <Link href="/research" className={styles.navItem}>
              <Database size={16} />
              Research
            </Link>
            <Link href="/team" className={styles.navItem}>
              <Users size={16} />
              Team
            </Link>
            <Link href="/dashboard/orders" className={styles.navItem}>
              <ShoppingBag size={16} />
              My Orders
            </Link>
            {user.role === "ADMIN" && (
              <Link href="/admin" className={styles.navItemAdmin}>
                <Shield size={16} />
                Admin Panel
              </Link>
            )}
          </nav>
        </div>

        <div className={styles.sidebarBottom}>
          <div className={styles.userRow}>
            <div className={styles.avatar}>
              {user.name?.[0]?.toUpperCase() ?? "U"}
            </div>
            <div className={styles.userInfo}>
              <span className={styles.userName}>{user.name}</span>
              <span className={styles.userRole}>Member</span>
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

      {/* Main */}
      <main className={styles.main}>{children}</main>

    </div>
  );
}
