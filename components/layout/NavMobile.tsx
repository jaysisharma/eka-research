"use client";

import { useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { X } from "lucide-react";
import { NAV_LINKS } from "@/lib/constants";
import ThemeToggle from "./ThemeToggle";
import styles from "./Nav.module.css";

function isActive(href: string, pathname: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(href + "/");
}

interface NavMobileProps {
  open: boolean;
  onClose: () => void;
}

export default function NavMobile({ open, onClose }: NavMobileProps) {
  const pathname = usePathname();
  const { data: session, status } = useSession();

  /* Lock body scroll when open */
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  /* Close on Escape */
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <div
      className={`${styles.mobileOverlay} ${open ? styles.mobileOverlayOpen : ""}`}
      aria-hidden={!open}
    >
      {/* Header */}
      <div className={styles.mobileHeader}>
        <Link href="/" onClick={onClose} className={styles.logo}>
          <Image src="/logo.png" alt="Eka Research" width={30} height={30} className={styles.logoImg} />
          <span className={styles.logoText}>Eka Research</span>
        </Link>
        <button onClick={onClose} className={styles.closeBtn} aria-label="Close menu">
          <X size={22} />
        </button>
      </div>

      {/* Links */}
      <nav className={styles.mobileLinks}>
        {NAV_LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            onClick={onClose}
            className={`${styles.mobileLink} ${link.highlight ? styles.highlight : ""} ${isActive(link.href, pathname) ? styles.active : ""}`}
          >
            {link.label}
          </Link>
        ))}
      </nav>

      {/* Footer actions */}
      <div className={styles.mobileFooter}>
        <div className={styles.mobileToggleRow}>
          <span className={styles.mobileToggleLabel}>Switch theme</span>
          <ThemeToggle />
        </div>
        {status === "authenticated" ? (
          <div className={styles.mobileAuthActions}>
            <Link href={session?.user?.role === "ADMIN" ? "/admin/dashboard" : "/dashboard"} onClick={onClose} className={styles.mobileCta}>
              Dashboard
            </Link>
          </div>
        ) : (
          <>
            <Link href="/auth/login" onClick={onClose} className={styles.mobileSignIn}>
              Sign In
            </Link>
            <Link href="/opportunities/join" onClick={onClose} className={styles.mobileCta}>
              Join Now
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
