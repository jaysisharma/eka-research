"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, Globe, ShoppingBag, Newspaper, FlaskConical, CalendarDays, Tag, FolderOpen, ClipboardList } from "lucide-react";
import styles from "./layout.module.css";

const NAV_ITEMS = [
  { href: "/admin",            label: "Overview",    icon: LayoutDashboard, exact: true },
  { href: "/admin/members",    label: "Members",     icon: Users },
  { href: "/admin/orders",     label: "Orders",      icon: ClipboardList },
  { href: "/admin/store",      label: "Store",       icon: ShoppingBag },
  { href: "/admin/news",       label: "News",        icon: Newspaper },
  { href: "/admin/research",   label: "Research",    icon: FlaskConical },
  { href: "/admin/events",     label: "Events",      icon: CalendarDays },
  { href: "/admin/categories", label: "Categories",  icon: Tag },
  { href: "/admin/projects",   label: "Projects",    icon: FolderOpen },
  { href: "/",                 label: "View site",   icon: Globe, exact: true },
];

export default function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className={styles.nav}>
      {NAV_ITEMS.map(({ href, label, icon: Icon, exact }) => {
        const active = exact
          ? pathname === href
          : pathname === href || pathname.startsWith(href + "/");
        return (
          <Link
            key={href}
            href={href}
            className={`${styles.navItem} ${active ? styles.navItemActive : ""}`}
          >
            <Icon size={16} />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
