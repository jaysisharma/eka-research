import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { ShoppingBag } from "lucide-react";
import Link from "next/link";
import styles from "./page.module.css";

function formatDate(date: Date): string {
  return date.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

const STATUS_LABEL: Record<string, string> = {
  pending:    "Pending",
  confirmed:  "Confirmed",
  shipped:    "Shipped",
  delivered:  "Delivered",
  cancelled:  "Cancelled",
};

export default async function OrdersPage() {
  const session = await auth();
  if (!session) redirect("/auth/login");

  const orders = await db.order.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    include: { items: true },
  });

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.heading}>My Orders</h1>
        <p className={styles.sub}>{orders.length} order{orders.length !== 1 ? "s" : ""} placed</p>
      </div>

      {orders.length === 0 ? (
        <div className={styles.empty}>
          <ShoppingBag size={32} strokeWidth={1.25} />
          <p>No orders yet.</p>
          <Link href="/store" className={styles.shopLink}>Browse the store</Link>
        </div>
      ) : (
        <div className={styles.list}>
          {orders.map((order) => (
            <div key={order.id} className={styles.card}>
              <div className={styles.cardHead}>
                <div>
                  <span className={styles.orderId}>Order #{order.id.slice(-8).toUpperCase()}</span>
                  <span className={styles.orderDate}>{formatDate(order.createdAt)}</span>
                </div>
                <span className={`${styles.statusBadge} ${styles[`status_${order.status}`]}`}>
                  {STATUS_LABEL[order.status] ?? order.status}
                </span>
              </div>

              <ul className={styles.itemList}>
                {order.items.map((item) => (
                  <li key={item.id} className={styles.item}>
                    <span className={styles.itemName}>
                      {item.name}
                      {item.variant && <span className={styles.itemVariant}> — {item.variant}</span>}
                    </span>
                    <span className={styles.itemQty}>×{item.quantity}</span>
                    <span className={styles.itemPrice}>NPR {(item.priceNpr * item.quantity).toLocaleString()}</span>
                  </li>
                ))}
              </ul>

              <div className={styles.cardFoot}>
                <span className={styles.totalLabel}>Total</span>
                <span className={styles.totalValue}>NPR {order.totalNpr.toLocaleString()}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
