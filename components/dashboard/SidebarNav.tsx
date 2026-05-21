"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Users, BookOpen, MessageSquare,
  FolderKanban, ShoppingBag, Receipt,
  Briefcase, GraduationCap, Inbox, Newspaper, Contact,
  Calendar, User, Award, FileText,
} from "lucide-react";
import styles from "@/app/dashboard/layout.module.css";

interface SidebarNavProps {
  role: string;
  adminMode?: boolean;
}

export function SidebarNav({ role, adminMode = false }: SidebarNavProps) {
  const pathname = usePathname();

  const isActive = (href: string) =>
    href === "/dashboard"
      ? pathname === "/dashboard"
      : pathname.startsWith(href);

  const dashboardHref = adminMode ? "/admin/dashboard" : "/dashboard";

  /* ── ADMIN sidebar ───────────────────────────────────────── */
  if (adminMode) {
    return (
      <nav className={styles.nav}>
        <div className={styles.navGroup} style={{ marginBottom: 0 }}>
          <Link href={dashboardHref} className={styles.navLink} data-active={isActive(dashboardHref)}>
            <LayoutDashboard size={18} /><span>Dashboard</span>
          </Link>
          <Link href="/admin/users" className={styles.navLink} data-active={isActive("/admin/users")}>
            <Users size={18} /><span>Users</span>
          </Link>
          <Link href="/admin/team" className={styles.navLink} data-active={isActive("/admin/team")}>
            <Contact size={18} /><span>Team</span>
          </Link>
          <Link href="/admin/papers" className={styles.navLink} data-active={isActive("/admin/papers")}>
            <BookOpen size={18} /><span>Papers</span>
          </Link>
          <Link href="/admin/projects" className={styles.navLink} data-active={isActive("/admin/projects")}>
            <FolderKanban size={18} /><span>Projects</span>
          </Link>
          <Link href="/admin/store/products" className={styles.navLink} data-active={isActive("/admin/store/products")}>
            <ShoppingBag size={18} /><span>Products</span>
          </Link>
          <Link href="/admin/store/orders" className={styles.navLink} data-active={isActive("/admin/store/orders")}>
            <Receipt size={18} /><span>Orders</span>
          </Link>
          <Link href="/admin/messages" className={styles.navLink} data-active={isActive("/admin/messages")}>
            <MessageSquare size={18} /><span>Messages</span>
          </Link>
          <Link href="/admin/news" className={styles.navLink} data-active={isActive("/admin/news")}>
            <Newspaper size={18} /><span>News</span>
          </Link>
          <Link href="/admin/events" className={styles.navLink} data-active={isActive("/admin/events")}>
            <Calendar size={18} /><span>Events</span>
          </Link>
          <Link href="/admin/opportunities/vacancies" className={styles.navLink} data-active={isActive("/admin/opportunities/vacancies")}>
            <Briefcase size={18} /><span>Vacancies</span>
          </Link>
          <Link href="/admin/opportunities/mentoring" className={styles.navLink} data-active={isActive("/admin/opportunities/mentoring")}>
            <GraduationCap size={18} /><span>Mentoring</span>
          </Link>
          <Link href="/admin/opportunities/applications" className={styles.navLink} data-active={isActive("/admin/opportunities/applications")}>
            <Inbox size={18} /><span>Applications</span>
          </Link>
        </div>
      </nav>
    );
  }

  /* ── helpers ──────────────────────────────────────────────── */
  const isResearcher  = role === "RESEARCHER";
  const isPremium     = role === "PAID_MEMBER";
  const showResearch  = isResearcher || isPremium;

  /* ── USER sidebar ────────────────────────────────────────── */
  return (
    <nav className={styles.nav}>

      {/* ── Main ── */}
      <div className={styles.navGroup}>
        <p className={styles.navGroupLabel}>Main</p>

        <Link
          href="/dashboard"
          className={styles.navLink}
          data-active={isActive("/dashboard")}
        >
          <LayoutDashboard size={18} />
          <span>Overview</span>
        </Link>

        {showResearch && (
          <Link
            href="/dashboard/research"
            className={styles.navLink}
            data-active={isActive("/dashboard/research")}
          >
            <BookOpen size={18} />
            <span>My Research</span>
          </Link>
        )}

        <Link
          href="/dashboard/events"
          className={styles.navLink}
          data-active={isActive("/dashboard/events")}
        >
          <Calendar size={18} />
          <span>My Events</span>
        </Link>

        <Link
          href="/dashboard/applications"
          className={styles.navLink}
          data-active={isActive("/dashboard/applications")}
        >
          <Inbox size={18} />
          <span>Applications</span>
        </Link>
      </div>

      {/* ── Account ── */}
      <div className={styles.navGroup}>
        <p className={styles.navGroupLabel}>Account</p>

        <Link
          href="/dashboard/orders"
          className={styles.navLink}
          data-active={isActive("/dashboard/orders")}
        >
          <Receipt size={18} />
          <span>My Orders</span>
        </Link>

        <Link
          href="/dashboard/profile"
          className={styles.navLink}
          data-active={isActive("/dashboard/profile")}
        >
          <User size={18} />
          <span>Profile</span>
        </Link>
      </div>

      {/* ── Upgrade CTA for FREE_USER ── */}
      {role === "FREE_USER" && (
        <div className={styles.navGroup}>
          <p className={styles.navGroupLabel}>Membership</p>
          <Link
            href="/upgrade"
            className={styles.navLinkUpgrade}
            data-active={isActive("/upgrade")}
          >
            <Award size={18} />
            <span>Upgrade to Pro</span>
          </Link>
        </div>
      )}
    </nav>
  );
}
