"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Users, BookOpen, MessageSquare,
  FolderKanban, ShoppingBag, Receipt,
  Briefcase, GraduationCap, Inbox, Newspaper,
} from "lucide-react";
import styles from "@/app/dashboard/layout.module.css";

interface SidebarNavProps {
  role: string;
  adminMode?: boolean;
}

export function SidebarNav({ adminMode = false }: SidebarNavProps) {
  const pathname = usePathname();

  const isActive = (href: string) => pathname.startsWith(href);

  const dashboardHref = adminMode ? "/admin/dashboard" : "/dashboard";

  if (adminMode) {
    return (
      <nav className={styles.nav}>
        {/* Render a flat sidebar without section titles or extra margin spacing between groups */}
        <div className={styles.navGroup} style={{ marginBottom: 0 }}>
          <Link
            href={dashboardHref}
            className={styles.navLink}
            data-active={isActive(dashboardHref)}
          >
            <LayoutDashboard size={18} />
            <span>Dashboard</span>
          </Link>

          <Link
            href="/admin/users"
            className={styles.navLink}
            data-active={isActive("/admin/users")}
          >
            <Users size={18} />
            <span>Users</span>
          </Link>

          <Link
            href="/admin/papers"
            className={styles.navLink}
            data-active={isActive("/admin/papers")}
          >
            <BookOpen size={18} />
            <span>Papers</span>
          </Link>

          <Link
            href="/admin/projects"
            className={styles.navLink}
            data-active={isActive("/admin/projects")}
          >
            <FolderKanban size={18} />
            <span>Projects</span>
          </Link>

          <Link
            href="/admin/store/products"
            className={styles.navLink}
            data-active={isActive("/admin/store/products")}
          >
            <ShoppingBag size={18} />
            <span>Products</span>
          </Link>

          <Link
            href="/admin/store/orders"
            className={styles.navLink}
            data-active={isActive("/admin/store/orders")}
          >
            <Receipt size={18} />
            <span>Orders</span>
          </Link>

          <Link
            href="/admin/messages"
            className={styles.navLink}
            data-active={isActive("/admin/messages")}
          >
            <MessageSquare size={18} />
            <span>Messages</span>
          </Link>

          <Link
            href="/admin/news"
            className={styles.navLink}
            data-active={isActive("/admin/news")}
          >
            <Newspaper size={18} />
            <span>News</span>
          </Link>

          <Link
            href="/admin/opportunities/vacancies"
            className={styles.navLink}
            data-active={isActive("/admin/opportunities/vacancies")}
          >
            <Briefcase size={18} />
            <span>Vacancies</span>
          </Link>

          <Link
            href="/admin/opportunities/mentoring"
            className={styles.navLink}
            data-active={isActive("/admin/opportunities/mentoring")}
          >
            <GraduationCap size={18} />
            <span>Mentoring</span>
          </Link>

          <Link
            href="/admin/opportunities/applications"
            className={styles.navLink}
            data-active={isActive("/admin/opportunities/applications")}
          >
            <Inbox size={18} />
            <span>Applications</span>
          </Link>
        </div>
      </nav>
    );
  }

  return (
    <nav className={styles.nav}>
      {/* ── Main ── */}
      <div className={styles.navGroup}>
        <Link
          href={dashboardHref}
          className={styles.navLink}
          data-active={isActive(dashboardHref)}
        >
          <LayoutDashboard size={18} />
          <span>Dashboard</span>
        </Link>
      </div>
    </nav>
  );
}
