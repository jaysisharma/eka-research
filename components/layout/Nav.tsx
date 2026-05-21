"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { Menu, ChevronDown } from "lucide-react";
import { NAV_LINKS } from "@/lib/constants";
import ThemeToggle from "./ThemeToggle";
import NavMobile from "./NavMobile";
import styles from "./Nav.module.css";

function isActive(href: string, pathname: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(href + "/");
}

export default function Nav() {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close dropdown on route change
  useEffect(() => {
    setOpenDropdown(null);
  }, [pathname]);

  return (
    <header className={`${styles.nav} ${scrolled ? styles.scrolled : ""}`}>
      <div className={styles.inner}>

        {/* Logo */}
        <Link href="/" className={styles.logo}>
          <Image
            src="/logo.png"
            alt="Eka Research logo"
            width={32}
            height={32}
            className={styles.logoImg}
            priority
          />
          <span className={styles.logoText}>Eka Research</span>
        </Link>

        {/* Desktop nav links */}
        <nav className={styles.links} aria-label="Main navigation">
          {NAV_LINKS.map((link) => (
            <div
              key={link.label}
              className={styles.linkGroup}
              onMouseEnter={() => link.children && setOpenDropdown(link.label)}
              onMouseLeave={() => setOpenDropdown(null)}
            >
              {link.children ? (
                <>
                  <button
                    className={`${styles.link} ${styles.linkBtn} ${link.highlight ? styles.highlight : ""} ${isActive(link.href, pathname) ? styles.active : ""}`}
                    aria-expanded={openDropdown === link.label}
                    aria-haspopup="true"
                  >
                    <span>{link.label}</span>
                    <ChevronDown
                      size={12}
                      className={`${styles.chevron} ${openDropdown === link.label ? styles.chevronOpen : ""}`}
                    />
                  </button>
                  {openDropdown === link.label && (
                    <div className={styles.dropdown}>
                      <ul className={styles.dropdownList}>
                        {link.children.map((child) => (
                          <li key={child.label}>
                            <Link
                              href={child.href}
                              className={styles.dropdownItem}
                              onClick={() => setOpenDropdown(null)}
                            >
                              <span className={styles.dropdownLabel}>{child.label}</span>
                              {child.description && (
                                <span className={styles.dropdownDesc}>{child.description}</span>
                              )}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </>
              ) : (
                <Link
                  href={link.href}
                  className={`${styles.link} ${link.highlight ? styles.highlight : ""} ${isActive(link.href, pathname) ? styles.active : ""}`}
                >
                  {link.label}
                </Link>
              )}
            </div>
          ))}
        </nav>

        {/* Right actions */}
        <div className={styles.actions}>
          <ThemeToggle />
          {status === "authenticated" ? (
            <div className={styles.authActions}>
              <Link href={session?.user?.role === "ADMIN" ? "/admin/dashboard" : "/dashboard"} className={styles.cta}>
                Dashboard
              </Link>
            </div>
          ) : (
            <>
              <Link href="/auth/login" className={styles.signIn}>
                Sign In
              </Link>
              <Link href="/opportunities/join" className={styles.cta}>
                Join Now
              </Link>
            </>
          )}
          <button
            className={styles.hamburger}
            onClick={() => setMobileOpen(true)}
            aria-label="Open navigation menu"
          >
            <Menu size={20} />
          </button>
        </div>
      </div>

      <NavMobile open={mobileOpen} onClose={() => setMobileOpen(false)} />
    </header>
  );
}
