import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import styles from "../../cms.module.css";
import orderStyles from "../orders.module.css";
import { OrderStatusSelect } from "./OrderStatusSelect";

function formatDate(d: Date) {
  return new Date(d).toLocaleDateString("en-US", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });
}

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") redirect("/auth/login");

  const { id } = await params;
  const order = await db.order.findUnique({
    where: { id },
    include: { items: true, user: { select: { id: true, name: true, email: true, role: true } } },
  });
  if (!order) notFound();

  return (
    <div className={styles.page}>

      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerText}>
          <Link href="/admin/orders" className={orderStyles.backLink}>
            <ArrowLeft size={14} /> All orders
          </Link>
          <h1 className={styles.heading} style={{ marginTop: "var(--space-2)" }}>
            Order #{order.id.slice(-8).toUpperCase()}
          </h1>
          <p className={styles.sub}>Placed on {formatDate(order.createdAt)}</p>
        </div>
        <OrderStatusSelect orderId={order.id} currentStatus={order.status} />
      </div>

      {/* Two-column layout */}
      <div className={orderStyles.detailGrid}>

        {/* Left — items */}
        <section className={orderStyles.detailCard}>
          <h2 className={orderStyles.cardHeading}>Items ordered</h2>
          <table className={styles.table}>
            <thead>
              <tr>
                <th className={styles.th}>Product</th>
                <th className={styles.th}>Variant</th>
                <th className={styles.th}>Qty</th>
                <th className={styles.th}>Unit price</th>
                <th className={styles.th}>Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((item) => (
                <tr key={item.id} className={styles.tr}>
                  <td className={styles.td}>{item.name}</td>
                  <td className={`${styles.td} ${styles.tdMuted}`}>{item.variant ?? "—"}</td>
                  <td className={`${styles.td} ${styles.tdMuted}`}>{item.quantity}</td>
                  <td className={`${styles.td} ${styles.tdMuted}`}>NPR {item.priceNpr.toLocaleString()}</td>
                  <td className={styles.td}>NPR {(item.priceNpr * item.quantity).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className={orderStyles.totalRow}>
            <span>Total</span>
            <span className={orderStyles.totalValue}>NPR {order.totalNpr.toLocaleString()}</span>
          </div>
        </section>

        {/* Right — customer + delivery */}
        <div className={orderStyles.detailSide}>

          <section className={orderStyles.detailCard}>
            <h2 className={orderStyles.cardHeading}>Customer</h2>
            <dl className={orderStyles.dl}>
              <div className={orderStyles.dlRow}>
                <dt>Name</dt><dd>{order.name}</dd>
              </div>
              <div className={orderStyles.dlRow}>
                <dt>Email</dt><dd>{order.email}</dd>
              </div>
              {order.phone && (
                <div className={orderStyles.dlRow}>
                  <dt>Phone</dt><dd>{order.phone}</dd>
                </div>
              )}
              {order.user && (
                <div className={orderStyles.dlRow}>
                  <dt>Account</dt>
                  <dd>
                    <Link href={`/admin/members`} className={orderStyles.memberLink}>
                      {order.user.name}
                    </Link>
                  </dd>
                </div>
              )}
            </dl>
          </section>

          <section className={orderStyles.detailCard}>
            <h2 className={orderStyles.cardHeading}>Delivery address</h2>
            <dl className={orderStyles.dl}>
              <div className={orderStyles.dlRow}>
                <dt>Address</dt><dd>{order.address}</dd>
              </div>
              <div className={orderStyles.dlRow}>
                <dt>District</dt><dd>{order.district}</dd>
              </div>
              <div className={orderStyles.dlRow}>
                <dt>Province</dt><dd>{order.province}</dd>
              </div>
              {order.notes && (
                <div className={orderStyles.dlRow}>
                  <dt>Notes</dt><dd>{order.notes}</dd>
                </div>
              )}
            </dl>
          </section>

        </div>
      </div>
    </div>
  );
}
