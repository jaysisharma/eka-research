"use client";

import Link from "next/link";
import { ArrowLeft, ArrowRight, Trash2, Minus, Plus, ShoppingCart } from "lucide-react";
import { useCart } from "@/components/store/CartProvider";
import styles from "./page.module.css";

function formatPrice(npr: number) {
  return `NPR ${npr.toLocaleString("en-NP")}`;
}

export default function CartPage() {
  const { items, removeItem, updateQty, totalNpr, totalItems } = useCart();

  return (
    <main className={styles.page}>
      <div className={styles.inner}>

        <div className={styles.header}>
          <Link href="/store" className={styles.backLink}>
            <ArrowLeft size={14} />
            Continue shopping
          </Link>
          <h1 className={styles.heading}>Your cart</h1>
        </div>

        {items.length === 0 ? (
          <div className={styles.empty}>
            <ShoppingCart size={40} className={styles.emptyIcon} />
            <p className={styles.emptyHeading}>Your cart is empty</p>
            <p className={styles.emptySub}>Add some items from the store.</p>
            <Link href="/store" className={styles.shopBtn}>
              Browse the store <ArrowRight size={14} />
            </Link>
          </div>
        ) : (
          <div className={styles.layout}>

            {/* Items list */}
            <div className={styles.itemsList}>
              {items.map((item) => (
                <div
                  key={`${item.productId}__${item.variant ?? ""}`}
                  className={styles.item}
                >
                  <div className={styles.itemInfo}>
                    <p className={styles.itemName}>{item.name}</p>
                    {item.variant && (
                      <p className={styles.itemVariant}>{item.variant}</p>
                    )}
                    <p className={styles.itemUnitPrice}>
                      {formatPrice(item.priceNpr)} each
                    </p>
                  </div>

                  <div className={styles.itemControls}>
                    <div className={styles.qtyRow}>
                      <button
                        className={styles.qtyBtn}
                        onClick={() => updateQty(item.productId, item.variant, item.quantity - 1)}
                        aria-label="Decrease"
                      >
                        <Minus size={12} />
                      </button>
                      <span className={styles.qtyNum}>{item.quantity}</span>
                      <button
                        className={styles.qtyBtn}
                        onClick={() => updateQty(item.productId, item.variant, item.quantity + 1)}
                        aria-label="Increase"
                      >
                        <Plus size={12} />
                      </button>
                    </div>

                    <span className={styles.itemTotal}>
                      {formatPrice(item.priceNpr * item.quantity)}
                    </span>

                    <button
                      className={styles.removeBtn}
                      onClick={() => removeItem(item.productId, item.variant)}
                      aria-label="Remove item"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Order summary */}
            <div className={styles.summary}>
              <h2 className={styles.summaryHeading}>Order summary</h2>

              <div className={styles.summaryLines}>
                <div className={styles.summaryLine}>
                  <span>Subtotal ({totalItems} item{totalItems !== 1 ? "s" : ""})</span>
                  <span>{formatPrice(totalNpr)}</span>
                </div>
                <div className={styles.summaryLine}>
                  <span>Shipping</span>
                  <span className={styles.shippingVal}>
                    {totalNpr >= 2000 ? "Free" : formatPrice(200)}
                  </span>
                </div>
                <div className={styles.summaryDivider} />
                <div className={`${styles.summaryLine} ${styles.summaryTotal}`}>
                  <span>Total</span>
                  <span>
                    {formatPrice(totalNpr + (totalNpr >= 2000 ? 0 : 200))}
                  </span>
                </div>
              </div>

              {totalNpr < 2000 && (
                <p className={styles.freeShipNote}>
                  Add {formatPrice(2000 - totalNpr)} more for free Kathmandu valley delivery.
                </p>
              )}

              <Link href="/store/checkout" className={styles.checkoutBtn}>
                Proceed to checkout <ArrowRight size={14} />
              </Link>
            </div>

          </div>
        )}

      </div>
    </main>
  );
}
