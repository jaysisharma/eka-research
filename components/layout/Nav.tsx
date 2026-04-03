"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { ChevronDown, Menu } from "lucide-react";
import { NAV_LINKS } from "@/lib/constants";
import ThemeToggle from "./ThemeToggle";
import NavDropdown from "./NavDropdown";
import NavMobile from "./NavMobile";
import styles from "./Nav.module.css";

function isActive(href: string, pathname: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(href + "/");
}

export default function Nav() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

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
              onMouseEnter={() => link.children && setActiveDropdown(link.label)}
              onMouseLeave={() => setActiveDropdown(null)}
            >
              {link.children ? (
                <button
                  className={`${styles.link} ${styles.linkBtn} ${link.highlight ? styles.highlight : ""} ${isActive(link.href, pathname) ? styles.active : ""}`}
                  aria-expanded={activeDropdown === link.label}
                  aria-haspopup="true"
                >
                  {link.label}
                  <ChevronDown
                    size={13}
                    className={`${styles.chevron} ${activeDropdown === link.label ? styles.chevronOpen : ""}`}
                  />
                </button>
              ) : (
                <Link
                  href={link.href}
                  className={`${styles.link} ${link.highlight ? styles.highlight : ""} ${isActive(link.href, pathname) ? styles.active : ""}`}
                >
                  {link.label}
                </Link>
              )}

              {link.children && activeDropdown === link.label && (
                <NavDropdown
                  items={link.children}
                  wide={link.label === "Services"}
                />
              )}
            </div>
          ))}
        </nav>

        {/* Right actions */}
        <div className={styles.actions}>
          <ThemeToggle />
          <Link href="/auth/login" className={styles.signIn}>
            Sign In
          </Link>
          <Link href="/opportunities/join" className={styles.cta}>
            Join Now
          </Link>
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
