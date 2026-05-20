"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Calendar, 
  Database, 
  Users, 
  Telescope,
  Settings,
  BookOpen,
  Archive,
  HelpCircle,
  ShieldCheck,
  Zap
} from "lucide-react";
import styles from "@/app/dashboard/layout.module.css";

export function SidebarNav({ role }: { role: string }) {
  const pathname = usePathname();
  
  // Smart active check so subpaths also trigger the active state
  const isActive = (path: string) => {
    if (path === "/dashboard") {
      return pathname === "/dashboard";
    }
    return pathname.startsWith(path);
  };

  return (
    <nav className={styles.nav}>
      {role === "ADMIN" && (
        <div className={styles.navGroup}>
          <span className={styles.navGroupLabel}>Administration</span>
          <Link href="/admin/dashboard" className={styles.navLinkAdmin} data-active={isActive("/admin/dashboard")}>
            <ShieldCheck size={18} />
            <span>Admin Console</span>
          </Link>
        </div>
      )}

      <div className={styles.navGroup}>
        <span className={styles.navGroupLabel}>Workspace</span>
        
        <Link href="/dashboard" className={styles.navLink} data-active={isActive("/dashboard")}>
          <LayoutDashboard size={18} />
          <span>Dashboard</span>
        </Link>
        
        <Link href="/dashboard/observations" className={styles.navLink} data-active={isActive("/dashboard/observations")}>
          <Zap size={18} />
          <span>Observations</span>
        </Link>
        
        <Link href="/research" className={styles.navLink} data-active={isActive("/research")}>
          <Database size={18} />
          <span>Data</span>
        </Link>
        
        <Link href="/projects" className={styles.navLink} data-active={isActive("/projects")}>
          <Telescope size={18} />
          <span>Projects</span>
        </Link>
        
        <Link href="/events" className={styles.navLink} data-active={isActive("/events")}>
          <Calendar size={18} />
          <span>Calendar</span>
        </Link>
      </div>

      <div className={styles.navGroup}>
        <span className={styles.navGroupLabel}>Resources</span>
        
        <Link href="/publications" className={styles.navLink} data-active={isActive("/publications")}>
          <BookOpen size={18} />
          <span>Papers</span>
        </Link>
        
        <Link href="/archive" className={styles.navLink} data-active={isActive("/archive")}>
          <Archive size={18} />
          <span>History</span>
        </Link>
      </div>

      <div className={styles.navGroup}>
        <span className={styles.navGroupLabel}>Support & System</span>
        
        <Link href="/team" className={styles.navLink} data-active={isActive("/team")}>
          <Users size={18} />
          <span>Team</span>
        </Link>
        
        <Link href="/docs" className={styles.navLink} data-active={isActive("/docs")}>
          <HelpCircle size={18} />
          <span>Help</span>
        </Link>
        
        <Link href="/dashboard/settings" className={styles.navLink} data-active={isActive("/dashboard/settings")}>
          <Settings size={18} />
          <span>Settings</span>
        </Link>
      </div>
    </nav>
  );
}

