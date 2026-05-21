"use client";

import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";
import styles from "@/app/dashboard/layout.module.css";

export function LogoutButton() {
  return (
    <button
      type="button"
      className={styles.logoutBtnCompact}
      aria-label="Sign Out"
      onClick={() =>
        signOut({
          callbackUrl: "/",   // full-page reload to "/"
          redirect: true,
        })
      }
    >
      <LogOut size={16} />
    </button>
  );
}
