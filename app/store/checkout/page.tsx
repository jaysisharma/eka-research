"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Loader2, Check, Package } from "lucide-react";
import { useCart } from "@/components/store/CartProvider";
import styles from "./page.module.css";

const PROVINCES = [
  "Koshi Province",
  "Madhesh Province",
  "Bagmati Province",
  "Gandaki Province",
  "Lumbini Province",
  "Karnali Province",
  "Sudurpashchim Province",
];

function formatPrice(npr: number) {
  return `NPR ${npr.toLocaleString("en-NP")}`;
}

type OrderSuccess = { orderId: string; totalNpr: number };

export default function CheckoutPage() {
  const { items, totalNpr, totalItems, clearCart } = useCart();

  const shipping = totalNpr >= 2000 ? 0 : 200;
  const grandTotal = totalNpr + shipping;

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    district: "",
    province: "",
    notes: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState<OrderSuccess | null>(null);

  function update(field: keyof typeof form, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, items }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error ?? "Failed to place order. Please try again.");
      return;
    }

    setSuccess({ orderId: data.orderId, totalNpr: data.totalNpr });
    clearCart();
  }

  // Success screen
  if (success) {
    return (
      <main className={styles.page}>
        <div className={styles.successWrap}>
          <span className={styles.successIcon}><Check size={28} strokeWidth={2.5} /></span>
          <h1 className={styles.successHeading}>Order placed!</h1>
          <p className={styles.successSub}>
            Order <strong className={styles.orderId}>#{success.orderId.slice(-8).toUpperCase()}</strong> — {formatPrice(success.totalNpr)}
          </p>
          <p className={styles.successNote}>
            We&apos;ll confirm your order by email at <strong>{form.email}</strong> and
            dispatch within 3 working days.
          </p>
          <Link href="/store" className={styles.successBtn}>
            Back to store <ArrowRight size={14} />
          </Link>
        </div>
      </main>
    );
  }

  // Empty cart guard
  if (items.length === 0) {
    return (
      <main className={styles.page}>
        <div className={styles.emptyWrap}>
          <p className={styles.emptyText}>Your cart is empty.</p>
          <Link href="/store" className={styles.successBtn}>Browse the store</Link>
        </div>
      </main>
    );
  }

  return (
    <main className={styles.page}>
      <div className={styles.inner}>

        <div className={styles.header}>
          <Link href="/store/cart" className={styles.backLink}>
            <ArrowLeft size={14} />
            Back to cart
          </Link>
          <h1 className={styles.heading}>Checkout</h1>
        </div>

        <div className={styles.layout}>

          {/* Form */}
          <form onSubmit={handleSubmit} className={styles.form} noValidate>
            {error && <p className={styles.errorBanner} role="alert">{error}</p>}

            <fieldset className={styles.fieldset}>
              <legend className={styles.legend}>Contact details</legend>

              <div className={styles.fieldRow}>
                <div className={styles.field}>
                  <label htmlFor="name" className={styles.label}>Full name</label>
                  <input id="name" type="text" required autoComplete="name"
                    className={styles.input} value={form.name}
                    onChange={(e) => update("name", e.target.value)} />
                </div>
                <div className={styles.field}>
                  <label htmlFor="email" className={styles.label}>Email address</label>
                  <input id="email" type="email" required autoComplete="email"
                    className={styles.input} value={form.email}
                    onChange={(e) => update("email", e.target.value)} />
                </div>
              </div>

              <div className={styles.field} style={{ maxWidth: 240 }}>
                <label htmlFor="phone" className={styles.label}>
                  Phone <span className={styles.optional}>(optional)</span>
                </label>
                <input id="phone" type="tel" autoComplete="tel"
                  className={styles.input} value={form.phone}
                  onChange={(e) => update("phone", e.target.value)} />
              </div>
            </fieldset>

            <fieldset className={styles.fieldset}>
              <legend className={styles.legend}>Delivery address</legend>

              <div className={styles.field}>
                <label htmlFor="address" className={styles.label}>Street / area</label>
                <input id="address" type="text" required autoComplete="street-address"
                  className={styles.input} placeholder="e.g. Thamel, Kathmandu"
                  value={form.address}
                  onChange={(e) => update("address", e.target.value)} />
              </div>

              <div className={styles.fieldRow}>
                <div className={styles.field}>
                  <label htmlFor="district" className={styles.label}>District</label>
                  <input id="district" type="text" required
                    className={styles.input} placeholder="e.g. Kathmandu"
                    value={form.district}
                    onChange={(e) => update("district", e.target.value)} />
                </div>
                <div className={styles.field}>
                  <label htmlFor="province" className={styles.label}>Province</label>
                  <select id="province" required className={styles.select}
                    value={form.province}
                    onChange={(e) => update("province", e.target.value)}
                  >
                    <option value="">Select province</option>
                    {PROVINCES.map((p) => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
              </div>

              <div className={styles.field}>
                <label htmlFor="notes" className={styles.label}>
                  Order notes <span className={styles.optional}>(optional)</span>
                </label>
                <textarea id="notes" rows={3} className={styles.textarea}
                  placeholder="Any special instructions or delivery notes"
                  value={form.notes}
                  onChange={(e) => update("notes", e.target.value)}
                />
              </div>
            </fieldset>

            <button type="submit" className={styles.submitBtn} disabled={loading}>
              {loading ? (
                <Loader2 size={16} className={styles.spinner} />
              ) : (
                <>Place order · {formatPrice(grandTotal)} <ArrowRight size={14} /></>
              )}
            </button>
          </form>

          {/* Order summary sidebar */}
          <div className={styles.summary}>
            <h2 className={styles.summaryHeading}>Order summary</h2>

            <div className={styles.itemsList}>
              {items.map((item) => (
                <div key={`${item.productId}__${item.variant ?? ""}`} className={styles.summaryItem}>
                  <div className={styles.summaryItemInfo}>
                    <span className={styles.summaryItemName}>{item.name}</span>
                    {item.variant && <span className={styles.summaryItemVariant}>{item.variant}</span>}
                  </div>
                  <div className={styles.summaryItemRight}>
                    <span className={styles.summaryItemQty}>×{item.quantity}</span>
                    <span className={styles.summaryItemPrice}>
                      {formatPrice(item.priceNpr * item.quantity)}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className={styles.summaryTotals}>
              <div className={styles.summaryLine}>
                <span>Subtotal ({totalItems} item{totalItems !== 1 ? "s" : ""})</span>
                <span>{formatPrice(totalNpr)}</span>
              </div>
              <div className={styles.summaryLine}>
                <span>Shipping</span>
                <span className={shipping === 0 ? styles.free : ""}>
                  {shipping === 0 ? "Free" : formatPrice(shipping)}
                </span>
              </div>
              <div className={styles.summaryDivider} />
              <div className={`${styles.summaryLine} ${styles.summaryGrand}`}>
                <span>Total</span>
                <span>{formatPrice(grandTotal)}</span>
              </div>
            </div>

            <div className={styles.dispatchNote}>
              <Package size={14} />
              Dispatched within 3 working days
            </div>
          </div>

        </div>
      </div>
    </main>
  );
}
