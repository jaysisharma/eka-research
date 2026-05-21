"use client";

import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";
import styles from "@/app/dashboard/layout.module.css";
import { SITE_URL } from "@/lib/constants";

export function LogoutButton() {
  return (
    <button
      type="button"
      className={styles.logoutBtnCompact}
      aria-label="Sign Out"
      onClick={async () => {
        // Bypass next-auth's URL construction — always land on ekaresearch.org
        await signOut({ redirect: false });
        window.location.href = SITE_URL;
      }}
    >
      <LogOut size={16} />
    </button>
  );
}
