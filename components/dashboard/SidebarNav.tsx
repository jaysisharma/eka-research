"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Users, BookOpen, MessageSquare,
  FolderKanban, ShoppingBag, Receipt,
  Briefcase, GraduationCap, Inbox, Newspaper, Contact,
  Calendar, User, Award, FileText, Image as ImageIcon,
  ChevronRight,
} from "lucide-react";
import styles from "@/app/dashboard/layout.module.css";

interface SidebarNavProps {
  role: string;
  adminMode?: boolean;
}

export function SidebarNav({ role, adminMode = false }: SidebarNavProps) {
  const pathname = usePathname();

  const [researchOpen, setResearchOpen] = useState(false);
  const [storeOpen, setStoreOpen] = useState(false);
  const [oppsOpen, setOppsOpen] = useState(false);

  // Auto-expand dropdowns based on path
  useEffect(() => {
    if (
      pathname.startsWith("/admin/papers") ||
      pathname.startsWith("/admin/projects") ||
      pathname.startsWith("/admin/gallery") ||
      pathname.startsWith("/admin/news") ||
      pathname.startsWith("/admin/events")
    ) {
      setResearchOpen(true);
    }
    if (pathname.startsWith("/admin/store")) {
      setStoreOpen(true);
    }
    if (pathname.startsWith("/admin/opportunities")) {
      setOppsOpen(true);
    }
  }, [pathname]);

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
          <Link href="/admin/messages" className={styles.navLink} data-active={isActive("/admin/messages")}>
            <MessageSquare size={18} /><span>Messages</span>
          </Link>

          {/* dropdown: Research Hub */}
          <button
            type="button"
            className={styles.dropdownToggle}
            onClick={() => setResearchOpen(!researchOpen)}
          >
            <BookOpen size={18} />
            <span>Research Hub</span>
            <ChevronRight
              size={14}
              className={`${styles.chevronRight} ${researchOpen ? styles.chevronOpen : ""}`}
            />
          </button>
          {researchOpen && (
            <div className={styles.submenu}>
              <Link href="/admin/papers" className={styles.subLink} data-active={isActive("/admin/papers")}>
                <span>Research Papers</span>
              </Link>
              <Link href="/admin/projects" className={styles.subLink} data-active={isActive("/admin/projects")}>
                <span>Projects</span>
              </Link>
              <Link href="/admin/gallery" className={styles.subLink} data-active={isActive("/admin/gallery")}>
                <span>Gallery</span>
              </Link>
              <Link href="/admin/news" className={styles.subLink} data-active={isActive("/admin/news")}>
                <span>News</span>
              </Link>
              <Link href="/admin/events" className={styles.subLink} data-active={isActive("/admin/events")}>
                <span>Events</span>
              </Link>
            </div>
          )}

          {/* dropdown: Store */}
          <button
            type="button"
            className={styles.dropdownToggle}
            onClick={() => setStoreOpen(!storeOpen)}
          >
            <ShoppingBag size={18} />
            <span>E-Store</span>
            <ChevronRight
              size={14}
              className={`${styles.chevronRight} ${storeOpen ? styles.chevronOpen : ""}`}
            />
          </button>
          {storeOpen && (
            <div className={styles.submenu}>
              <Link href="/admin/store/products" className={styles.subLink} data-active={isActive("/admin/store/products")}>
                <span>Products</span>
              </Link>
              <Link href="/admin/store/orders" className={styles.subLink} data-active={isActive("/admin/store/orders")}>
                <span>Orders</span>
              </Link>
            </div>
          )}

          {/* dropdown: Opportunities */}
          <button
            type="button"
            className={styles.dropdownToggle}
            onClick={() => setOppsOpen(!oppsOpen)}
          >
            <Briefcase size={18} />
            <span>Opportunities</span>
            <ChevronRight
              size={14}
              className={`${styles.chevronRight} ${oppsOpen ? styles.chevronOpen : ""}`}
            />
          </button>
          {oppsOpen && (
            <div className={styles.submenu}>
              <Link href="/admin/opportunities/vacancies" className={styles.subLink} data-active={isActive("/admin/opportunities/vacancies")}>
                <span>Vacancies</span>
              </Link>
              <Link href="/admin/opportunities/mentoring" className={styles.subLink} data-active={isActive("/admin/opportunities/mentoring")}>
                <span>Mentoring</span>
              </Link>
              <Link href="/admin/opportunities/applications" className={styles.subLink} data-active={isActive("/admin/opportunities/applications")}>
                <span>Applications</span>
              </Link>
            </div>
          )}
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
