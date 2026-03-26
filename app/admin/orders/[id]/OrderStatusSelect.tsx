"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import orderStyles from "../orders.module.css";

const STATUSES = ["pending", "confirmed", "shipped", "delivered", "cancelled"] as const;

const STATUS_LABEL: Record<string, string> = {
  pending:   "Pending",
  confirmed: "Confirmed",
  shipped:   "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

export function OrderStatusSelect({
  orderId,
  currentStatus,
}: {
  orderId: string;
  currentStatus: string;
}) {
  const router = useRouter();
  const [status, setStatus] = useState(currentStatus);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleChange(next: string) {
    setSaving(true);
    setError("");
    const res = await fetch(`/api/admin/orders/${orderId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: next }),
    });
    setSaving(false);
    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Failed to update status.");
      return;
    }
    setStatus(next);
    router.refresh();
  }

  return (
    <div className={orderStyles.statusControl}>
      <span className={`${orderStyles.statusBadge} ${orderStyles[`status_${status}`]}`}>
        {STATUS_LABEL[status] ?? status}
      </span>
      <div className={orderStyles.statusDropdownWrap}>
        {saving && <Loader2 size={14} className={orderStyles.spin} />}
        <select
          value={status}
          onChange={(e) => handleChange(e.target.value)}
          disabled={saving}
          className={orderStyles.statusSelect}
        >
          {STATUSES.map((s) => (
            <option key={s} value={s}>{STATUS_LABEL[s]}</option>
          ))}
        </select>
      </div>
      {error && <p className={orderStyles.statusError}>{error}</p>}
    </div>
  );
}
