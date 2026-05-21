"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Users,
  Database,
  ShieldCheck,
  RefreshCw,
  Server,
  Terminal,
  TrendingUp,
  Calendar,
  Activity,
} from "lucide-react";
import styles from "./page.module.css";

/* ── Static placeholder data ─────────────────────────────────────────── */

const SITE_STATS = [
  { label: "Total Users",           value: "1,248", trend: "+14 this week",       icon: Users       },
  { label: "Active Subscriptions",  value: "89",    trend: "+6 this week",        icon: TrendingUp  },
  { label: "Research Submissions",  value: "14",    trend: "0 pending review",    icon: Database    },
  { label: "Event Registrations",   value: "382",   trend: "+42 since yesterday", icon: Calendar    },
];

const AUDIT_LOGS_INITIAL = [
  { title: "Database credentials reset",               category: "Migration",     time: "10m ago",  user: "System"   },
  { title: "Seeded user accounts synchronised",        category: "Seeding",       time: "12m ago",  user: "System"   },
  { title: "Removed obsolete admin directories",       category: "Git Clean",     time: "30m ago",  user: "DevAgent" },
  { title: "AccessGate components compiled cleanly",   category: "Compiler",      time: "42m ago",  user: "DevAgent" },
  { title: "NextAuth session provider initialised",    category: "Auth Provider", time: "1h ago",   user: "System"   },
];

const SITE_ACTIVITY = [
  { title: "Lyrid Meteor Observation Completed",     type: "Research Session", time: "2h ago"   },
  { title: "Atmospheric Dataset Uploaded",           type: "Dataset",          time: "5h ago"   },
  { title: "New Member Registration: A. Sherpa",     type: "Account",          time: "6h ago"   },
  { title: "Calibration Suite Execution Finished",   type: "System Run",       time: "8h ago"   },
  { title: "Observation Validation Completed",       type: "Verification",     time: "Yesterday" },
];

const SYSTEM_STATS = [
  { label: "Active Connections",  value: "34"              },
  { label: "DB CPU Usage",        value: "1.2%"            },
  { label: "Storage Capacity",    value: "14.2 / 100 GB"   },
  { label: "Environment",         value: "Development"     },
];

const QUICK_OPS = [
  { label: "Sync DB",        desc: "Check connection pool and caches.",    icon: Database    },
  { label: "Clear Locks",    desc: "Reset temporary login lockout limits.", icon: Terminal    },
  { label: "Integrity Run",  desc: "Audit database constraints.",           icon: ShieldCheck },
  { label: "Seed Clean",     desc: "Re-align test and seed metrics.",       icon: Server      },
];

/* ── Component ───────────────────────────────────────────────────────── */

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [logs,    setLogs]    = useState(AUDIT_LOGS_INITIAL);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/auth/login");
    else if (status === "authenticated" && session?.user?.role !== "ADMIN") router.push("/dashboard");
  }, [status, session, router]);

  if (status === "loading" || !session || session.user.role !== "ADMIN") {
    return (
      <div className={styles.loadingScreen}>
        <RefreshCw className={styles.spinner} size={28} />
        <p>Authenticating admin session…</p>
      </div>
    );
  }

  const handleRefresh = async () => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    setLogs([
      { title: "Admin panel refreshed", category: "Admin UI", time: "Just now", user: session.user.name ?? "Admin" },
      ...AUDIT_LOGS_INITIAL,
    ]);
    setLoading(false);
  };

  return (
    <div className={styles.page}>
      {/* ── HEADER ── */}
      <header className={styles.header}>
        <div>
          <h1 className={styles.pageTitle}>Admin Dashboard</h1>
          <p className={styles.pageSubtitle}>
            Welcome back, <strong>{session.user.name}</strong> — here's what's happening across the platform.
          </p>
        </div>

        <button onClick={handleRefresh} className={styles.refreshBtn} disabled={loading}>
          <RefreshCw size={15} className={loading ? styles.spinning : undefined} />
          {loading ? "Refreshing…" : "Refresh"}
        </button>
      </header>

      {/* ── SITE STATS ── */}
      <section className={styles.statsGrid}>
        {SITE_STATS.map(({ label, value, trend, icon: Icon }) => (
          <div key={label} className={styles.statCard}>
            <div className={styles.statTop}>
              <span className={styles.statLabel}>{label}</span>
              <span className={styles.statIcon}><Icon size={16} /></span>
            </div>
            <strong className={styles.statValue}>{value}</strong>
            <span className={styles.statTrend}><Activity size={10} />{trend}</span>
          </div>
        ))}
      </section>

      {/* ── MAIN GRID ── */}
      <div className={styles.mainGrid}>

        {/* LEFT COLUMN */}
        <div className={styles.leftCol}>

          {/* AUDIT LOGS */}
          <section className={styles.card}>
            <div className={styles.cardHeader}>
              <h2 className={styles.cardTitle}>System Audit Logs</h2>
              <button onClick={handleRefresh} className={styles.cardAction} disabled={loading}>
                <RefreshCw size={12} className={loading ? styles.spinning : undefined} />
                {loading ? "Refreshing…" : "Refresh logs"}
              </button>
            </div>

            <div className={styles.logList}>
              {logs.map((log, i) => (
                <div key={i} className={styles.logItem}>
                  <div className={styles.logLeft}>
                    <span className={styles.logDot} />
                    <div>
                      <p className={styles.logTitle}>{log.title}</p>
                      <p className={styles.logMeta}>
                        <span>{log.category}</span>
                        <span>·</span>
                        <span>{log.user}</span>
                      </p>
                    </div>
                  </div>
                  <span className={styles.logTime}>{log.time}</span>
                </div>
              ))}
            </div>
          </section>

          {/* SITE ACTIVITY */}
          <section className={styles.card}>
            <div className={styles.cardHeader}>
              <h2 className={styles.cardTitle}>Site Activity</h2>
            </div>

            <div className={styles.activityList}>
              {SITE_ACTIVITY.map((item, i) => (
                <div key={i} className={styles.activityItem}>
                  <div className={styles.activityLeft}>
                    <span className={styles.activityDot} />
                    <div>
                      <p className={styles.activityTitle}>{item.title}</p>
                      <p className={styles.activityMeta}>{item.type}</p>
                    </div>
                  </div>
                  <span className={styles.activityTime}>{item.time}</span>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* RIGHT COLUMN */}
        <div className={styles.rightCol}>

          {/* QUICK OPERATIONS */}
          <section className={styles.card}>
            <div className={styles.cardHeader}>
              <h2 className={styles.cardTitle}>Quick Operations</h2>
            </div>

            <div className={styles.opsGrid}>
              {QUICK_OPS.map(({ label, desc, icon: Icon }) => (
                <button key={label} onClick={handleRefresh} className={styles.opBtn}>
                  <span className={styles.opIcon}><Icon size={16} /></span>
                  <div>
                    <span className={styles.opLabel}>{label}</span>
                    <p className={styles.opDesc}>{desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </section>

          {/* SYSTEM HEALTH */}
          <section className={styles.card}>
            <div className={styles.cardHeader}>
              <h2 className={styles.cardTitle}>System Health</h2>
            </div>

            <div className={styles.healthList}>
              {/* API status row */}
              <div className={styles.healthItem}>
                <span className={styles.healthLabel}>API Status</span>
                <span className={styles.healthOnline}>
                  <span className={styles.onlineDot} />
                  Online
                </span>
              </div>

              {SYSTEM_STATS.map((s) => (
                <div key={s.label} className={styles.healthItem}>
                  <span className={styles.healthLabel}>{s.label}</span>
                  <span className={styles.healthValue}>{s.value}</span>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
