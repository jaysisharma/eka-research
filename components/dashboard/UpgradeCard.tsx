"use client";

import { useState } from "react";
import Link from "next/link";
import { Award, X } from "lucide-react";
import styles from "@/app/dashboard/layout.module.css";

export function UpgradeCard() {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <div className={styles.upgradeCard}>
      <button 
        className={styles.closeUpgrade} 
        onClick={() => setIsVisible(false)}
        aria-label="Dismiss upgrade prompt"
      >
        <X size={14} />
      </button>
      
      <div className={styles.upgradeCardHeader}>
        <Award size={16} className={styles.gold} />
        <span>Go Pro</span>
      </div>
      <p className={styles.upgradeCardText}>Unlock researcher status & advanced data tools.</p>
      <Link href="/dashboard/profile" className={styles.upgradeCardBtn}>
        Upgrade Now
      </Link>
    </div>
  );
}
