"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Check, CreditCard, Loader2 } from "lucide-react";
import styles from "./page.module.css";

const PLAN_INFO = {
  monthly: { label: "Monthly Plan", price: "NPR 299", billing: "Billed every month" },
  yearly:  { label: "Yearly Plan",  price: "NPR 2,499", billing: "Billed once per year — save 30%" },
} as const;

function formatCardNumber(raw: string): string {
  return raw.replace(/\D/g, "").slice(0, 16).replace(/(.{4})/g, "$1 ").trim();
}

function formatExpiry(raw: string): string {
  const digits = raw.replace(/\D/g, "").slice(0, 4);
  if (digits.length >= 3) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return digits;
}

export default function UpgradeClient({ plan }: { plan: "monthly" | "yearly" }) {
  const router = useRouter();
  const info = PLAN_INFO[plan];

  const [cardName, setCardName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        router.push("/dashboard");
        router.refresh();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [success, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/upgrade", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Payment failed.");
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Payment failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className={styles.card}>
        <div className={styles.successState}>
          <span className={styles.successIcon}><Check size={24} strokeWidth={2.5} /></span>
          <h1 className={styles.successHeading}>You&apos;re in.</h1>
          <p className={styles.successSub}>
            Welcome to the inner circle. Full access is now yours — taking you to your dashboard.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.card}>
      <Link href="/pricing" className={styles.back}>
        <ArrowLeft size={14} /> Back to pricing
      </Link>

      <div className={styles.cardHeader}>
        <Link href="/" className={styles.logo}>
          Eka <span className={styles.logoAccent}>Research</span>
        </Link>
        <h1 className={styles.heading}>Complete your membership</h1>
      </div>

      <div className={styles.planSummary}>
        <div>
          <p className={styles.planName}>{info.label}</p>
          <p className={styles.planBilling}>{info.billing}</p>
        </div>
        <span className={styles.planPrice}>{info.price}</span>
      </div>

      <form onSubmit={handleSubmit} className={styles.form} noValidate>
        {error && <p className={styles.errorBanner} role="alert">{error}</p>}

        <div className={styles.field}>
          <label htmlFor="cardName" className={styles.label}>Cardholder name</label>
          <input id="cardName" type="text" autoComplete="cc-name" required value={cardName}
            onChange={(e) => setCardName(e.target.value)} className={styles.input}
            placeholder="Name on card" />
        </div>

        <div className={styles.field}>
          <label htmlFor="cardNumber" className={styles.label}>Card number</label>
          <input id="cardNumber" type="text" inputMode="numeric" autoComplete="cc-number"
            required value={cardNumber}
            onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
            className={styles.input} placeholder="1234 5678 9012 3456" maxLength={19} />
        </div>

        <div className={styles.fieldRow}>
          <div className={styles.field}>
            <label htmlFor="expiry" className={styles.label}>Expiry MM/YY</label>
            <input id="expiry" type="text" inputMode="numeric" autoComplete="cc-exp"
              required value={expiry}
              onChange={(e) => setExpiry(formatExpiry(e.target.value))}
              className={styles.input} placeholder="MM/YY" maxLength={5} />
          </div>
          <div className={styles.field}>
            <label htmlFor="cvv" className={styles.label}>CVV</label>
            <input id="cvv" type="text" inputMode="numeric" autoComplete="cc-csc"
              required value={cvv}
              onChange={(e) => setCvv(e.target.value.replace(/\D/g, "").slice(0, 4))}
              className={styles.input} placeholder="•••" maxLength={4} />
          </div>
        </div>

        <button type="submit" className={styles.submitBtn} disabled={loading}>
          {loading
            ? <Loader2 size={16} className={styles.spinner} />
            : <><CreditCard size={15} /> Pay {info.price}</>}
        </button>

        <p className={styles.disclaimer}>
          This is a demo payment form. No real transaction will occur.
        </p>
      </form>
    </div>
  );
}
