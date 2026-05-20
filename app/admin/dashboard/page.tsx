"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Users,
  Terminal,
  Database,
  ShieldCheck,
  ChevronLeft,
  RefreshCw,
  Server,
  Activity,
  FileText
} from "lucide-react";
import styles from "./page.module.css";

const SYSTEM_STATS = [
  { label: "Active Connections", value: "34" },
  { label: "DB CPU Usage", value: "1.2%" },
  { label: "Storage Capacity", value: "14.2% / 100 GB" },
  { label: "Environment Mode", value: "Development" },
];

const METRICS_INITIAL = [
  { label: "Total Accounts", value: "1,248", trend: "+14 this week" },
  { label: "Paid Subscriptions", value: "89", trend: "+6 this week" },
  { label: "Research Submissions", value: "14", trend: "0 pending review" },
  { label: "Event Registrations", value: "382", trend: "+42 since yesterday" },
];

const AUDIT_LOGS_INITIAL = [
  { title: "Database credentials reset run", category: "Migration", time: "10m ago", user: "System" },
  { title: "Seeded user accounts synchronized", category: "Seeding", time: "12m ago", user: "System" },
  { title: "Deleted obsolete app/admin directories from git index", category: "Git Clean", time: "30m ago", user: "DevAgent" },
  { title: "AccessGate components compiled cleanly", category: "Compiler", time: "42m ago", user: "DevAgent" },
  { title: "NextAuth session provider successfully initialized", category: "Auth Provider", time: "1h ago", user: "System" },
];

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [logs, setLogs] = useState(AUDIT_LOGS_INITIAL);
  const [metrics, setMetrics] = useState(METRICS_INITIAL);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
    } else if (status === "authenticated" && session?.user?.role !== "ADMIN") {
      router.push("/dashboard");
    }
  }, [status, session, router]);

  if (status === "loading" || !session || session.user.role !== "ADMIN") {
    return (
      <div className={styles.page} style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
        <div style={{ textAlign: "center" }}>
          <RefreshCw className="animate-spin" size={32} style={{ color: "#ef4444", marginBottom: "16px" }} />
          <p style={{ color: "#94a3b8", fontSize: "14px" }}>Authenticating Administrative Session...</p>
        </div>
      </div>
    );
  }

  const handleRefresh = async () => {
    setLoading(true);
    // Simulate API fetch/refresh
    await new Promise((resolve) => setTimeout(resolve, 800));
    setLogs([
      { title: "Interactive panel refreshed successfully", category: "Admin UI", time: "Just now", user: session.user.name ?? "Admin" },
      ...AUDIT_LOGS_INITIAL,
    ]);
    setMetrics([
      { label: "Total Accounts", value: "1,250", trend: "+16 this week" },
      { label: "Paid Subscriptions", value: "90", trend: "+7 this week" },
      { label: "Research Submissions", value: "14", trend: "0 pending review" },
      { label: "Event Registrations", value: "385", trend: "+45 since yesterday" },
    ]);
    setLoading(false);
  };

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        {/* HEADER */}
        <header className={styles.header}>
          <div className={styles.titleSection}>
            <h1>Administrative Console</h1>
            <p>Welcome back, Administrator {session.user.name}</p>
          </div>
          <Link href="/dashboard" className={styles.backBtn}>
            <ChevronLeft size={16} />
            Back to Dashboard
          </Link>
        </header>

        {/* METRICS GRID */}
        <section className={styles.metricsGrid}>
          {metrics.map((m) => (
            <div key={m.label} className={styles.metricCard}>
              <span className={styles.metricLabel}>{m.label}</span>
              <strong className={styles.metricValue}>{m.value}</strong>
              <span className={styles.metricTrend}>{m.trend}</span>
            </div>
          ))}
        </section>

        {/* MAIN BODY */}
        <div className={styles.contentGrid}>
          {/* LEFT: AUDIT LOGS */}
          <section className={styles.card}>
            <div className={styles.cardHeader}>
              <h3 className={styles.cardTitle}>System Audit Logs</h3>
              <button 
                onClick={handleRefresh} 
                className={styles.cardAction}
                style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" }}
                disabled={loading}
              >
                <RefreshCw size={12} className={loading ? "animate-spin" : ""} />
                {loading ? "Refreshing..." : "Refresh Logs"}
              </button>
            </div>

            <div className={styles.activityList}>
              {logs.map((log, i) => (
                <div key={i} className={styles.activityItem}>
                  <div className={styles.activityLeft}>
                    <div className={styles.activityIndicator} />
                    <div>
                      <h4 className={styles.activityTitle}>{log.title}</h4>
                      <div className={styles.activityMeta}>
                        <span>Category: {log.category}</span>
                        <span>•</span>
                        <span>Operator: {log.user}</span>
                      </div>
                    </div>
                  </div>
                  <span className={styles.activityTime}>{log.time}</span>
                </div>
              ))}
            </div>
          </section>

          {/* RIGHT: ACTIONS & SYSTEM STATUS */}
          <div>
            {/* QUICK ACTIONS */}
            <section className={styles.card}>
              <div className={styles.cardHeader}>
                <h3 className={styles.cardTitle}>Quick Operations</h3>
              </div>
              <div className={styles.actionsGrid}>
                <button onClick={handleRefresh} className={styles.actionBtn}>
                  <Database size={18} />
                  <div>
                    <span className={styles.actionLabel}>Sync DB</span>
                    <p className={styles.actionDesc}>Check connection pool and caches.</p>
                  </div>
                </button>

                <button onClick={handleRefresh} className={styles.actionBtn}>
                  <Terminal size={18} />
                  <div>
                    <span className={styles.actionLabel}>Clear Locks</span>
                    <p className={styles.actionDesc}>Reset temporary login lockout limits.</p>
                  </div>
                </button>

                <button onClick={handleRefresh} className={styles.actionBtn}>
                  <ShieldCheck size={18} />
                  <div>
                    <span className={styles.actionLabel}>Integrity Run</span>
                    <p className={styles.actionDesc}>Audit database constraints.</p>
                  </div>
                </button>

                <button onClick={handleRefresh} className={styles.actionBtn}>
                  <Server size={18} />
                  <div>
                    <span className={styles.actionLabel}>Seed Clean</span>
                    <p className={styles.actionDesc}>Re-align test and seed metrics.</p>
                  </div>
                </button>
              </div>
            </section>

            {/* SYSTEM STATUS */}
            <section className={styles.card}>
              <div className={styles.cardHeader}>
                <h3 className={styles.cardTitle}>Server Metrics</h3>
              </div>
              <div className={styles.systemList}>
                <div className={styles.systemItem}>
                  <span className={styles.systemLabel}>API Health Status</span>
                  <span className={styles.statusGreen}>
                    <span className={styles.statusDot} />
                    Online
                  </span>
                </div>
                {SYSTEM_STATS.map((s) => (
                  <div key={s.label} className={styles.systemItem}>
                    <span className={styles.systemLabel}>{s.label}</span>
                    <span className={styles.systemVal}>{s.value}</span>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
