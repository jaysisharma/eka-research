"use client";

import { useEffect, useState, useMemo } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { RefreshCw, Search, Inbox, MailOpen, Mail } from "lucide-react";
import styles from "./page.module.css";

/* ── Types ───────────────────────────────────────────────────────────── */

type AppKind = "vacancy" | "mentoring";

interface VacancyApp {
  kind:      "vacancy";
  id:        string;
  name:      string;
  email:     string;
  phone:     string | null;
  message:   string | null;
  read:      boolean;
  createdAt: string;
  vacancy:   { id: string; title: string; type: string } | null;
}

interface MentoringApp {
  kind:       "mentoring";
  id:         string;
  name:       string;
  email:      string;
  phone:      string | null;
  background: string | null;
  goals:      string | null;
  read:       boolean;
  createdAt:  string;
}

type Application = VacancyApp | MentoringApp;

/* ── Helpers ─────────────────────────────────────────────────────────── */

const TYPE_LABELS: Record<string, string> = {
  FULL_TIME: "Full-time", PART_TIME: "Part-time",
  INTERNSHIP: "Internship", VOLUNTEER: "Volunteer",
};

/* ── Component ───────────────────────────────────────────────────────── */

export default function AdminApplicationsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [apps,      setApps]      = useState<Application[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [search,    setSearch]    = useState("");
  const [kindFilter, setKindFilter] = useState<AppKind | "ALL">("ALL");
  const [readFilter, setReadFilter] = useState<"ALL" | "unread" | "read">("ALL");
  const [expanded,   setExpanded]  = useState<Set<string>>(new Set());
  const [marking,    setMarking]   = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (status === "unauthenticated") router.push("/auth/login");
    else if (status === "authenticated" && session?.user?.role !== "ADMIN") router.push("/dashboard");
  }, [status, session, router]);

  const fetchApps = async () => {
    setLoading(true);
    try {
      const res  = await fetch("/api/admin/opportunities/applications");
      const data = await res.json();
      setApps(Array.isArray(data) ? data : []);
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchApps(); }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return apps.filter((a) => {
      const matchSearch = !q ||
        a.name.toLowerCase().includes(q) ||
        a.email.toLowerCase().includes(q) ||
        (a.kind === "vacancy" && a.vacancy?.title.toLowerCase().includes(q));
      const matchKind = kindFilter === "ALL" || a.kind === kindFilter;
      const matchRead =
        readFilter === "ALL"    ? true :
        readFilter === "unread" ? !a.read :
        a.read;
      return matchSearch && matchKind && matchRead;
    });
  }, [apps, search, kindFilter, readFilter]);

  const stats = useMemo(() => ({
    total:    apps.length,
    unread:   apps.filter((a) => !a.read).length,
    vacancy:  apps.filter((a) => a.kind === "vacancy").length,
    mentoring: apps.filter((a) => a.kind === "mentoring").length,
  }), [apps]);

  const toggleExpand = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
    // Auto-mark as read on expand
    const app = apps.find((a) => a.id === id);
    if (app && !app.read) markRead(id, app.kind, true);
  };

  const markRead = async (id: string, kind: AppKind, read: boolean) => {
    setMarking((m) => ({ ...m, [id]: true }));
    try {
      const res = await fetch("/api/admin/opportunities/applications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, kind, read }),
      });
      if (res.ok) {
        setApps((prev) => prev.map((a) => a.id === id ? { ...a, read } : a));
      }
    } finally { setMarking((m) => ({ ...m, [id]: false })); }
  };

  if (status === "loading" || loading) {
    return (
      <div className={styles.loadingScreen}>
        <RefreshCw className={styles.spinner} size={28} />
        <p>Loading applications…</p>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      {/* HEADER */}
      <header className={styles.header}>
        <div>
          <h1 className={styles.pageTitle}>Applications</h1>
          <p className={styles.pageSubtitle}>
            Unified inbox for vacancy and mentoring program applications.
          </p>
        </div>
        <button onClick={fetchApps} className={styles.refreshBtn}>
          <RefreshCw size={13} /> Refresh
        </button>
      </header>

      {/* STATS */}
      <div className={styles.statRow}>
        {([
          { label: "Total",     value: stats.total     },
          { label: "Unread",    value: stats.unread    },
          { label: "Vacancies", value: stats.vacancy   },
          { label: "Mentoring", value: stats.mentoring },
        ]).map(({ label, value }) => (
          <div key={label} className={`${styles.statPill} ${label === "Unread" && stats.unread > 0 ? styles.statPillUnread : ""}`}>
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
            placeholder="Search name, email, position…"
            value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>

        <div className={styles.filterGroup}>
          {(["ALL", "vacancy", "mentoring"] as const).map((f) => (
            <button key={f}
              className={`${styles.filterBtn} ${kindFilter === f ? styles.filterActive : ""}`}
              onClick={() => setKindFilter(f)}>
              {f === "ALL" ? "All" : f === "vacancy" ? "Vacancies" : "Mentoring"}
            </button>
          ))}
        </div>

        <div className={styles.filterGroup}>
          {(["ALL", "unread", "read"] as const).map((f) => (
            <button key={f}
              className={`${styles.filterBtn} ${readFilter === f ? styles.filterActive : ""}`}
              onClick={() => setReadFilter(f)}>
              {f === "ALL" ? "All" : f === "unread" ? "Unread" : "Read"}
            </button>
          ))}
        </div>

        <span className={styles.totalBadge}>
          {filtered.length} result{filtered.length !== 1 && "s"}
        </span>
      </div>

      {/* LIST */}
      <div className={styles.list}>
        {filtered.length === 0 ? (
          <div className={styles.empty}>
            <Inbox size={32} style={{ marginBottom: 12, opacity: 0.3 }} />
            <p>No applications match your filter.</p>
          </div>
        ) : filtered.map((app) => {
          const isExpanded = expanded.has(app.id);
          return (
            <div key={app.id} className={`${styles.item} ${!app.read ? styles.itemUnread : ""} ${isExpanded ? styles.itemExpanded : ""}`}>
              {/* SUMMARY ROW */}
              <div className={styles.itemRow} onClick={() => toggleExpand(app.id)}>
                <div className={styles.itemLeft}>
                  <div className={styles.unreadDot} data-visible={!app.read} />
                  <div>
                    <div className={styles.itemName}>{app.name}</div>
                    <div className={styles.itemEmail}>{app.email}</div>
                  </div>
                </div>

                <div className={styles.itemMeta}>
                  <span className={`${styles.kindBadge} ${app.kind === "vacancy" ? styles.kindVacancy : styles.kindMentoring}`}>
                    {app.kind === "vacancy" ? "Vacancy" : "Mentoring"}
                  </span>
                  {app.kind === "vacancy" && app.vacancy && (
                    <span className={styles.positionLabel}>
                      {app.vacancy.title}
                      {app.vacancy.type && (
                        <span className={styles.typeLabel}> · {TYPE_LABELS[app.vacancy.type] ?? app.vacancy.type}</span>
                      )}
                    </span>
                  )}
                </div>

                <div className={styles.itemRight}>
                  <span className={styles.dateLabel}>
                    {new Date(app.createdAt).toLocaleDateString("en-GB", {
                      day: "2-digit", month: "short", year: "numeric",
                    })}
                  </span>
                  <button
                    className={styles.readBtn}
                    onClick={(e) => { e.stopPropagation(); markRead(app.id, app.kind, !app.read); }}
                    disabled={marking[app.id]}
                    title={app.read ? "Mark as unread" : "Mark as read"}>
                    {app.read ? <MailOpen size={13} /> : <Mail size={13} />}
                  </button>
                </div>
              </div>

              {/* EXPANDED DETAIL */}
              {isExpanded && (
                <div className={styles.detail}>
                  {app.phone && (
                    <div className={styles.detailRow}>
                      <span className={styles.detailKey}>Phone</span>
                      <span className={styles.detailVal}>{app.phone}</span>
                    </div>
                  )}

                  {app.kind === "vacancy" && app.message && (
                    <div className={styles.detailRow}>
                      <span className={styles.detailKey}>Cover note</span>
                      <span className={`${styles.detailVal} ${styles.detailText}`}>{app.message}</span>
                    </div>
                  )}

                  {app.kind === "mentoring" && (
                    <>
                      {app.background && (
                        <div className={styles.detailRow}>
                          <span className={styles.detailKey}>Background</span>
                          <span className={`${styles.detailVal} ${styles.detailText}`}>{app.background}</span>
                        </div>
                      )}
                      {app.goals && (
                        <div className={styles.detailRow}>
                          <span className={styles.detailKey}>Goals</span>
                          <span className={`${styles.detailVal} ${styles.detailText}`}>{app.goals}</span>
                        </div>
                      )}
                    </>
                  )}

                  <div className={styles.detailRow}>
                    <span className={styles.detailKey}>Submitted</span>
                    <span className={styles.detailVal}>
                      {new Date(app.createdAt).toLocaleString("en-GB", {
                        day: "2-digit", month: "short", year: "numeric",
                        hour: "2-digit", minute: "2-digit",
                      })}
                    </span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
