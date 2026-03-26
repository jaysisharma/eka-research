"use client";

import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { useCart } from "./CartProvider";
import styles from "./CartCount.module.css";

export default function CartCount() {
  const { totalItems, hydrated } = useCart();

  return (
    <Link href="/store/cart" className={styles.btn} aria-label={`Cart (${hydrated ? totalItems : 0} items)`}>
      <ShoppingCart size={18} />
      {hydrated && totalItems > 0 && (
        <span className={styles.badge}>{totalItems > 99 ? "99+" : totalItems}</span>
      )}
    </Link>
  );
}
