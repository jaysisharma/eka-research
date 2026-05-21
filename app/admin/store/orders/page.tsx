"use client";

import { useEffect, useState, useMemo } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Search, RefreshCw, ChevronDown, ChevronUp, Receipt } from "lucide-react";
import styles from "./page.module.css";

/* ── Types ───────────────────────────────────────────────────────────── */

type OrderStatus = "pending" | "processing" | "shipped" | "delivered" | "cancelled";

interface OrderItem {
  id:       string;
  name:     string;
  priceNpr: number;
  quantity: number;
  variant:  string | null;
  product:  { name: string; slug: string } | null;
}

interface Order {
  id:        string;
  name:      string;
  email:     string;
  phone:     string | null;
  address:   string;
  district:  string;
  province:  string;
  notes:     string | null;
  totalNpr:  number;
  status:    OrderStatus;
  items:     OrderItem[];
  user:      { id: string; name: string; email: string } | null;
  createdAt: string;
}

/* ── Constants ───────────────────────────────────────────────────────── */

const STATUS_FLOW: OrderStatus[] = ["pending", "processing", "shipped", "delivered", "cancelled"];

const STATUS_META: Record<OrderStatus, { cls: string; label: string }> = {
  pending:    { cls: styles.statusPending,    label: "Pending"    },
  processing: { cls: styles.statusProcessing, label: "Processing" },
  shipped:    { cls: styles.statusShipped,    label: "Shipped"    },
  delivered:  { cls: styles.statusDelivered,  label: "Delivered"  },
  cancelled:  { cls: styles.statusCancelled,  label: "Cancelled"  },
};

/* ── Component ───────────────────────────────────────────────────────── */

export default function AdminOrdersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [orders,       setOrders]       = useState<Order[]>([]);
  const [loading,      setLoading]      = useState(true);
  const [search,       setSearch]       = useState("");
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "ALL">("ALL");
  const [expanded,     setExpanded]     = useState<Set<string>>(new Set());
  const [pendingStatus, setPendingStatus] = useState<Record<string, OrderStatus>>({});
  const [saving,       setSaving]       = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (status === "unauthenticated") router.push("/auth/login");
    else if (status === "authenticated" && session?.user?.role !== "ADMIN") router.push("/dashboard");
  }, [status, session, router]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res  = await fetch("/api/admin/store/orders");
      const data = await res.json();
      setOrders(Array.isArray(data) ? data : []);
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchOrders(); }, []);

  /* derived */
  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return orders.filter((o) => {
      const matchSearch = !q ||
        o.name.toLowerCase().includes(q) ||
        o.email.toLowerCase().includes(q) ||
        o.id.toLowerCase().includes(q);
      const matchStatus = statusFilter === "ALL" || o.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [orders, search, statusFilter]);

  const stats = useMemo(() => ({
    total:     orders.length,
    revenue:   orders.filter((o) => o.status !== "cancelled").reduce((s, o) => s + o.totalNpr, 0),
    pending:   orders.filter((o) => o.status === "pending").length,
    delivered: orders.filter((o) => o.status === "delivered").length,
  }), [orders]);

  /* expand/collapse row */
  const toggleExpand = (id: string) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  /* save status */
  const saveStatus = async (id: string) => {
    const newStatus = pendingStatus[id];
    if (!newStatus) return;
    setSaving((s) => ({ ...s, [id]: true }));
    try {
      const res = await fetch(`/api/admin/store/orders/${id}`, {
        method:  "PATCH",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setOrders((prev) => prev.map((o) => o.id === id ? { ...o, status: newStatus } : o));
        setPendingStatus((p) => { const n = { ...p }; delete n[id]; return n; });
      }
    } finally { setSaving((s) => ({ ...s, [id]: false })); }
  };

  if (status === "loading" || loading) {
    return (
      <div className={styles.loadingScreen}>
        <RefreshCw className={styles.spinner} size={28} />
        <p>Loading orders…</p>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      {/* HEADER */}
      <header className={styles.header}>
        <div>
          <h1 className={styles.pageTitle}>Orders</h1>
          <p className={styles.pageSubtitle}>
            Track customer purchases, update fulfilment status, and review order details.
          </p>
        </div>
        <button onClick={fetchOrders} className={styles.refreshBtn}>
          <RefreshCw size={13} /> Refresh
        </button>
      </header>

      {/* STATS */}
      <div className={styles.statRow}>
        {([
          { label: "Total Orders",   value: stats.total.toString() },
          { label: "Revenue",        value: `NPR ${stats.revenue.toLocaleString("en-NP")}` },
          { label: "Pending",        value: stats.pending.toString() },
          { label: "Delivered",      value: stats.delivered.toString() },
        ] as const).map(({ label, value }) => (
          <div key={label} className={styles.statPill}>
            <span className={styles.statPillValue}>{value}</span>
            <span className={styles.statPillLabel}>{label}</span>
          </div>
        ))}
      </div>

      {/* TOOLBAR */}
      <div className={styles.toolbar}>
        <div className={styles.searchWrap}>
          <Search size={13} className={styles.searchIcon} />
          <input className={styles.searchInput}
            placeholder="Search name, email or order ID…"
            value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>

        <div className={styles.statusFilters}>
          {(["ALL", ...STATUS_FLOW] as const).map((s) => (
            <button key={s}
              className={`${styles.statusFilterBtn} ${statusFilter === s ? styles.statusFilterActive : ""}`}
              onClick={() => setStatusFilter(s)}>
              {s === "ALL" ? "All" : STATUS_META[s].label}
            </button>
          ))}
        </div>

        <span className={styles.totalBadge}>
          {filtered.length} result{filtered.length !== 1 && "s"}
        </span>
      </div>

      {/* TABLE */}
      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Customer</th>
              <th>Items</th>
              <th>Total</th>
              <th>Status</th>
              <th>Date</th>
              <th>Update Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6}>
                  <div className={styles.empty}>
                    <Receipt size={32} style={{ marginBottom: 12, opacity: 0.3 }} />
                    <p>No orders match your filter.</p>
                  </div>
                </td>
              </tr>
            ) : filtered.map((order) => {
              const isExpanded = expanded.has(order.id);
              const currentStatus = pendingStatus[order.id] ?? order.status;
              const isDirty = pendingStatus[order.id] != null && pendingStatus[order.id] !== order.status;
              const isSaving = saving[order.id] ?? false;

              return (
                <>
                  <tr key={order.id} className={isExpanded ? styles.rowExpanded : ""}>
                    {/* CUSTOMER */}
                    <td>
                      <button className={styles.expandBtn} onClick={() => toggleExpand(order.id)}>
                        {isExpanded
                          ? <ChevronUp size={13} className={styles.expandIcon} />
                          : <ChevronDown size={13} className={styles.expandIcon} />}
                      </button>
                      <div className={styles.customerName}>{order.name}</div>
                      <div className={styles.customerEmail}>{order.email}</div>
                      {order.phone && <div className={styles.customerPhone}>{order.phone}</div>}
                    </td>

                    {/* ITEMS SUMMARY */}
                    <td className={styles.itemsCell}>
                      <span className={styles.itemCount}>{order.items.length} item{order.items.length !== 1 && "s"}</span>
                      <div className={styles.itemNames}>
                        {order.items.slice(0, 2).map((item) => (
                          <span key={item.id} className={styles.itemName}>
                            {item.quantity}× {item.name}
                            {item.variant && ` (${item.variant})`}
                          </span>
                        ))}
                        {order.items.length > 2 && (
                          <span className={styles.itemName}>+{order.items.length - 2} more</span>
                        )}
                      </div>
                    </td>

                    {/* TOTAL */}
                    <td className={styles.totalCell}>
                      NPR {order.totalNpr.toLocaleString("en-NP")}
                    </td>

                    {/* STATUS */}
                    <td>
                      <span className={`${styles.statusBadge} ${STATUS_META[order.status].cls}`}>
                        {STATUS_META[order.status].label}
                      </span>
                    </td>

                    {/* DATE */}
                    <td className={styles.dateCell}>
                      {new Date(order.createdAt).toLocaleDateString("en-GB", {
                        day: "2-digit", month: "short", year: "numeric",
                      })}
                    </td>

                    {/* UPDATE STATUS */}
                    <td>
                      <div className={styles.statusUpdate}>
                        <select
                          className={styles.statusSelect}
                          value={currentStatus}
                          disabled={isSaving}
                          onChange={(e) => setPendingStatus((p) => ({
                            ...p, [order.id]: e.target.value as OrderStatus,
                          }))}
                        >
                          {STATUS_FLOW.map((s) => (
                            <option key={s} value={s}>{STATUS_META[s].label}</option>
                          ))}
                        </select>
                        {isDirty && (
                          <button className={styles.saveStatusBtn}
                            disabled={isSaving} onClick={() => saveStatus(order.id)}>
                            {isSaving ? "…" : "Save"}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>

                  {/* EXPANDED DETAIL ROW */}
                  {isExpanded && (
                    <tr key={`${order.id}-detail`} className={styles.detailRow}>
                      <td colSpan={6}>
                        <div className={styles.detailGrid}>
                          {/* ITEMS */}
                          <div className={styles.detailBlock}>
                            <p className={styles.detailBlockTitle}>Order Items</p>
                            <div className={styles.detailItems}>
                              {order.items.map((item) => (
                                <div key={item.id} className={styles.detailItem}>
                                  <div className={styles.detailItemName}>
                                    {item.name}
                                    {item.variant && <span className={styles.detailVariant}>{item.variant}</span>}
                                  </div>
                                  <div className={styles.detailItemMeta}>
                                    {item.quantity}× · NPR {item.priceNpr.toLocaleString("en-NP")}
                                  </div>
                                </div>
                              ))}
                              <div className={styles.detailItemTotal}>
                                Total — NPR {order.totalNpr.toLocaleString("en-NP")}
                              </div>
                            </div>
                          </div>

                          {/* SHIPPING */}
                          <div className={styles.detailBlock}>
                            <p className={styles.detailBlockTitle}>Shipping Address</p>
                            <div className={styles.detailAddress}>
                              <div>{order.address}</div>
                              <div>{order.district}, {order.province}</div>
                              {order.phone && <div>{order.phone}</div>}
                            </div>
                          </div>

                          {/* NOTES */}
                          {order.notes && (
                            <div className={styles.detailBlock}>
                              <p className={styles.detailBlockTitle}>Notes</p>
                              <p className={styles.detailNotes}>{order.notes}</p>
                            </div>
                          )}

                          {/* ORDER ID */}
                          <div className={styles.detailBlock}>
                            <p className={styles.detailBlockTitle}>Order ID</p>
                            <p className={styles.detailOrderId}>{order.id}</p>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
