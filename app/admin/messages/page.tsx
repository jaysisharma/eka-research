"use client";

import { useEffect, useState, useMemo } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  RefreshCw,
  Search,
  Mail,
  MailOpen,
  Trash2,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import styles from "./page.module.css";

/* ── Types ────────────────────────────────────────────────────── */

interface Message {
  id:           string;
  name:         string;
  email:        string;
  topic:        string;
  organisation: string | null;
  message:      string;
  read:         boolean;
  createdAt:    string;
}

type Filter = "all" | "unread" | "read";

const TOPIC_LABEL: Record<string, string> = {
  research:   "Research collaboration",
  media:      "Media & press",
  school:     "School / institution",
  membership: "Membership",
  sponsorship:"Sponsorship",
  other:      "Other",
};

const TOPIC_CLASS: Record<string, string> = {
  research:    styles.topicResearch,
  media:       styles.topicMedia,
  school:      styles.topicSchool,
  membership:  styles.topicMembership,
  sponsorship: styles.topicSponsorship,
  other:       styles.topicOther,
};

/* ── Component ────────────────────────────────────────────────── */

export default function AdminMessagesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [messages,  setMessages]  = useState<Message[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [search,    setSearch]    = useState("");
  const [filter,    setFilter]    = useState<Filter>("all");
  const [expanded,  setExpanded]  = useState<Record<string, boolean>>({});
  const [deleting,  setDeleting]  = useState<Record<string, boolean>>({});

  /* auth guard */
  useEffect(() => {
    if (status === "unauthenticated") router.push("/auth/login");
    else if (status === "authenticated" && session?.user?.role !== "ADMIN") router.push("/dashboard");
  }, [status, session, router]);

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const res  = await fetch("/api/admin/messages");
      const data = await res.json() as Message[];
      setMessages(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchMessages(); }, []);

  /* filtered list */
  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return messages.filter((m) => {
      const matchFilter =
        filter === "all"    ? true :
        filter === "unread" ? !m.read :
                               m.read;
      const matchSearch =
        !q ||
        m.name.toLowerCase().includes(q)    ||
        m.email.toLowerCase().includes(q)   ||
        m.message.toLowerCase().includes(q) ||
        m.topic.toLowerCase().includes(q);
      return matchFilter && matchSearch;
    });
  }, [messages, search, filter]);

  /* stats */
  const unreadCount = useMemo(() => messages.filter((m) => !m.read).length, [messages]);

  /* toggle read */
  const toggleRead = async (msg: Message) => {
    const newRead = !msg.read;
    setMessages((prev) =>
      prev.map((m) => (m.id === msg.id ? { ...m, read: newRead } : m))
    );
    await fetch(`/api/admin/messages/${msg.id}`, {
      method:  "PATCH",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ read: newRead }),
    }).catch(() => {
      // revert on failure
      setMessages((prev) =>
        prev.map((m) => (m.id === msg.id ? { ...m, read: msg.read } : m))
      );
    });
  };

  /* delete */
  const deleteMsg = async (id: string) => {
    if (!confirm("Delete this message? This cannot be undone.")) return;
    setDeleting((p) => ({ ...p, [id]: true }));
    try {
      const res = await fetch(`/api/admin/messages/${id}`, { method: "DELETE" });
      if (res.ok) setMessages((prev) => prev.filter((m) => m.id !== id));
    } finally {
      setDeleting((p) => ({ ...p, [id]: false }));
    }
  };

  /* expand/collapse body */
  const toggleExpand = (id: string) =>
    setExpanded((p) => ({ ...p, [id]: !p[id] }));

  /* ── Loading ── */
  if (status === "loading" || loading) {
    return (
      <div className={styles.loadingScreen}>
        <RefreshCw className={styles.spinner} size={28} />
        <p>Loading messages…</p>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      {/* HEADER */}
      <header className={styles.header}>
        <div>
          <h1 className={styles.pageTitle}>Messages</h1>
          <p className={styles.pageSubtitle}>
            Contact form submissions from the website.
          </p>
        </div>
        <button onClick={fetchMessages} className={styles.refreshBtn}>
          <RefreshCw size={13} />
          Refresh
        </button>
      </header>

      {/* STATS */}
      <div className={styles.statRow}>
        <div className={styles.statPill}>
          <span className={styles.statValue}>{messages.length}</span>
          <span className={styles.statLabel}>Total</span>
        </div>
        <div className={styles.statPill}>
          <span className={styles.statValue}>{unreadCount}</span>
          <span className={styles.statLabel}>Unread</span>
        </div>
        <div className={styles.statPill}>
          <span className={styles.statValue}>{messages.length - unreadCount}</span>
          <span className={styles.statLabel}>Read</span>
        </div>
      </div>

      {/* TOOLBAR */}
      <div className={styles.toolbar}>
        <div className={styles.searchWrap}>
          <Search size={14} className={styles.searchIcon} />
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Search name, email, message…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className={styles.filterGroup}>
          {(["all", "unread", "read"] as Filter[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={[styles.filterBtn, filter === f ? styles.filterBtnActive : ""].join(" ")}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
              {f === "unread" && unreadCount > 0 && (
                <span className={styles.badge}>{unreadCount}</span>
              )}
            </button>
          ))}
        </div>
        <span className={styles.totalBadge}>
          {filtered.length} result{filtered.length !== 1 && "s"}
        </span>
      </div>

      {/* LIST */}
      {filtered.length === 0 ? (
        <div className={styles.empty}>
          No messages{filter !== "all" ? ` marked as ${filter}` : ""}.
        </div>
      ) : (
        <div className={styles.list}>
          {filtered.map((msg) => {
            const isExpanded = expanded[msg.id] ?? false;
            const isDeleting = deleting[msg.id] ?? false;
            const topicLabel = TOPIC_LABEL[msg.topic] ?? msg.topic;
            const topicClass = TOPIC_CLASS[msg.topic] ?? styles.topicOther;

            return (
              <div
                key={msg.id}
                className={[styles.card, !msg.read ? styles.cardUnread : ""].join(" ")}
              >
                {/* Row 1: meta + actions */}
                <div className={styles.cardHeader}>
                  <div className={styles.cardMeta}>
                    {/* unread dot */}
                    {!msg.read && <span className={styles.unreadDot} aria-label="Unread" />}

                    <div className={styles.senderInfo}>
                      <span className={styles.senderName}>{msg.name}</span>
                      <a href={`mailto:${msg.email}`} className={styles.senderEmail}>
                        {msg.email}
                      </a>
                    </div>

                    {msg.organisation && (
                      <span className={styles.orgBadge}>{msg.organisation}</span>
                    )}

                    <span className={`${styles.topicBadge} ${topicClass}`}>
                      {topicLabel}
                    </span>

                    <time className={styles.time}>
                      {new Date(msg.createdAt).toLocaleDateString("en-GB", {
                        day: "2-digit", month: "short", year: "numeric",
                      })}
                    </time>
                  </div>

                  <div className={styles.cardActions}>
                    <button
                      className={styles.iconBtn}
                      title={msg.read ? "Mark as unread" : "Mark as read"}
                      onClick={() => toggleRead(msg)}
                    >
                      {msg.read
                        ? <Mail size={15} />
                        : <MailOpen size={15} />}
                    </button>
                    <button
                      className={[styles.iconBtn, styles.iconBtnDanger].join(" ")}
                      title="Delete message"
                      disabled={isDeleting}
                      onClick={() => deleteMsg(msg.id)}
                    >
                      <Trash2 size={15} />
                    </button>
                    <button
                      className={styles.iconBtn}
                      title={isExpanded ? "Collapse" : "Expand"}
                      onClick={() => {
                        toggleExpand(msg.id);
                        if (!msg.read) toggleRead(msg);
                      }}
                    >
                      {isExpanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                    </button>
                  </div>
                </div>

                {/* Row 2: message preview / expanded */}
                <div
                  className={[styles.cardBody, isExpanded ? styles.cardBodyExpanded : ""].join(" ")}
                  onClick={() => {
                    toggleExpand(msg.id);
                    if (!msg.read) toggleRead(msg);
                  }}
                >
                  <p className={styles.messageText}>{msg.message}</p>
                </div>

                {/* Expanded: reply link */}
                {isExpanded && (
                  <div className={styles.cardFooter}>
                    <a
                      href={`mailto:${msg.email}?subject=Re: ${topicLabel} — Eka Research`}
                      className={styles.replyBtn}
                    >
                      <Mail size={13} />
                      Reply to {msg.name}
                    </a>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
