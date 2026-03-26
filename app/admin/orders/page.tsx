import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Package } from "lucide-react";
import styles from "../cms.module.css";
import orderStyles from "./orders.module.css";

function formatDate(d: Date) {
  return new Date(d).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" });
}

const STATUS_LABEL: Record<string, string> = {
  pending:   "Pending",
  confirmed: "Confirmed",
  shipped:   "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

export default async function AdminOrdersPage() {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") redirect("/auth/login");

  const orders = await db.order.findMany({
    orderBy: { createdAt: "desc" },
    include: { items: true },
  });

  const totalRevenue = orders
    .filter((o) => o.status !== "cancelled")
    .reduce((sum, o) => sum + o.totalNpr, 0);

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div className={styles.headerText}>
          <h1 className={styles.heading}>Orders</h1>
          <p className={styles.sub}>
            {orders.length} order{orders.length !== 1 ? "s" : ""} &nbsp;·&nbsp; NPR {totalRevenue.toLocaleString()} total revenue
          </p>
        </div>
      </div>

      {orders.length === 0 ? (
        <div className={styles.empty}>
          <Package size={28} strokeWidth={1.25} />
          <p>No orders yet.</p>
        </div>
      ) : (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th className={styles.th}>Order</th>
                <th className={styles.th}>Customer</th>
                <th className={styles.th}>Items</th>
                <th className={styles.th}>Total</th>
                <th className={styles.th}>Status</th>
                <th className={styles.th}>Date</th>
                <th className={styles.th}></th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id} className={styles.tr}>
                  <td className={styles.td}>
                    <span className={orderStyles.orderId}>#{order.id.slice(-8).toUpperCase()}</span>
                  </td>
                  <td className={styles.td}>
                    <div className={orderStyles.customerName}>{order.name}</div>
                    <div className={orderStyles.customerEmail}>{order.email}</div>
                  </td>
                  <td className={`${styles.td} ${styles.tdMuted}`}>
                    {order.items.length} item{order.items.length !== 1 ? "s" : ""}
                  </td>
                  <td className={styles.td}>
                    <span className={orderStyles.total}>NPR {order.totalNpr.toLocaleString()}</span>
                  </td>
                  <td className={styles.td}>
                    <span className={`${orderStyles.statusBadge} ${orderStyles[`status_${order.status}`]}`}>
                      {STATUS_LABEL[order.status] ?? order.status}
                    </span>
                  </td>
                  <td className={`${styles.td} ${styles.tdMuted}`}>{formatDate(order.createdAt)}</td>
                  <td className={styles.td}>
                    <Link href={`/admin/orders/${order.id}`} className={styles.editBtn}>
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
