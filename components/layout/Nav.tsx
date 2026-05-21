"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { Menu } from "lucide-react";
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
            <div key={link.label} className={styles.linkGroup}>
              <Link
                href={link.href}
                className={`${styles.link} ${link.highlight ? styles.highlight : ""} ${isActive(link.href, pathname) ? styles.active : ""}`}
              >
                {link.label}
              </Link>
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
