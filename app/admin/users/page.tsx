"use client";

import { useEffect, useState, useMemo } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Search, RefreshCw, CheckCircle, ShieldAlert } from "lucide-react";
import styles from "./page.module.css";

/* ── Types ───────────────────────────────────────────────────────────── */

type Role = "FREE_USER" | "TEACHER" | "RESEARCHER" | "MENTOR" | "PAID_MEMBER" | "ADMIN";

interface UserRow {
  id: string;
  name: string;
  email: string;
  role: Role;
  level:         string | null;
  interest:      string | null;
  emailVerified: boolean;
  createdAt:     string;
  _count: {
    orders:              number;
    registrations:       number;
    researchSubmissions: number;
  };
}

/* ── Constants ───────────────────────────────────────────────────────── */

const ROLES: Role[] = ["FREE_USER", "TEACHER", "RESEARCHER", "MENTOR", "PAID_MEMBER", "ADMIN"];

const ROLE_FILTERS: { label: string; value: Role | "ALL" }[] = [
  { label: "All",         value: "ALL"        },
  { label: "Free",        value: "FREE_USER"  },
  { label: "Teacher",     value: "TEACHER"    },
  { label: "Researcher",  value: "RESEARCHER" },
  { label: "Mentor",      value: "MENTOR"     },
  { label: "Paid",        value: "PAID_MEMBER"},
  { label: "Admin",       value: "ADMIN"      },
];

const ROLE_LABEL: Record<Role, string> = {
  FREE_USER:  "Free",
  TEACHER:    "Teacher",
  RESEARCHER: "Researcher",
  MENTOR:     "Mentor",
  PAID_MEMBER:"Paid",
  ADMIN:      "Admin",
};

const ROLE_CLASS: Record<Role, string> = {
  ADMIN:      styles.roleAdmin,
  PAID_MEMBER:styles.rolePaid,
  RESEARCHER: styles.roleResearcher,
  TEACHER:    styles.roleTeacher,
  MENTOR:     styles.roleMentor,
  FREE_USER:  styles.roleFree,
};

/* ── Component ───────────────────────────────────────────────────────── */

export default function AdminUsersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [users,       setUsers]       = useState<UserRow[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [search,      setSearch]      = useState("");
  const [roleFilter,  setRoleFilter]  = useState<Role | "ALL">("ALL");
  // map of userId → pending new role (before save)
  const [pendingRole, setPendingRole] = useState<Record<string, Role>>({});
  // map of userId → saving state
  const [saving,      setSaving]      = useState<Record<string, boolean>>({});

  /* auth guard */
  useEffect(() => {
    if (status === "unauthenticated") router.push("/auth/login");
    else if (status === "authenticated" && session?.user?.role !== "ADMIN") router.push("/dashboard");
  }, [status, session, router]);

  /* fetch users */
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res  = await fetch("/api/admin/users");
      const data = await res.json();
      setUsers(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  /* filtered list */
  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return users.filter((u) => {
      const matchSearch =
        !q ||
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q);
      const matchRole =
        roleFilter === "ALL" || u.role === roleFilter;
      return matchSearch && matchRole;
    });
  }, [users, search, roleFilter]);

  /* role stats */
  const stats = useMemo(() => ({
    total:  users.length,
    admins: users.filter((u) => u.role === "ADMIN").length,
    paid:   users.filter((u) => u.role === "PAID_MEMBER").length,
    free:   users.filter((u) => u.role === "FREE_USER").length,
  }), [users]);

  /* save a role change */
  const saveRole = async (userId: string) => {
    const newRole = pendingRole[userId];
    if (!newRole) return;

    setSaving((p) => ({ ...p, [userId]: true }));
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method:  "PATCH",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ role: newRole }),
      });
      if (res.ok) {
        setUsers((prev) =>
          prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
        );
        setPendingRole((p) => {
          const next = { ...p };
          delete next[userId];
          return next;
        });
      }
    } finally {
      setSaving((p) => ({ ...p, [userId]: false }));
    }
  };

  /* ── Loading / auth guard ── */
  if (status === "loading" || loading) {
    return (
      <div className={styles.loadingScreen}>
        <RefreshCw className={styles.spinner} size={28} />
        <p>Loading users…</p>
      </div>
    );
  }

  /* ── Render ── */
  return (
    <div className={styles.page}>
      {/* HEADER */}
      <header className={styles.header}>
        <div>
          <h1 className={styles.pageTitle}>Users</h1>
          <p className={styles.pageSubtitle}>
            Manage accounts, roles, and permissions across the platform.
          </p>
        </div>
        <button onClick={fetchUsers} className={styles.saveBtn} style={{ marginTop: 6 }}>
          <RefreshCw size={13} style={{ display: "inline", marginRight: 6 }} />
          Refresh
        </button>
      </header>

      {/* STAT PILLS */}
      <div className={styles.statRow}>
        <div className={styles.statPill}>
          <span className={styles.statPillValue}>{stats.total}</span>
          <span className={styles.statPillLabel}>Total users</span>
        </div>
        <div className={styles.statPill}>
          <span className={styles.statPillValue}>{stats.paid}</span>
          <span className={styles.statPillLabel}>Paid members</span>
        </div>
        <div className={styles.statPill}>
          <span className={styles.statPillValue}>{stats.free}</span>
          <span className={styles.statPillLabel}>Free accounts</span>
        </div>
        <div className={styles.statPill}>
          <span className={styles.statPillValue}>{stats.admins}</span>
          <span className={styles.statPillLabel}>Admins</span>
        </div>
      </div>

      {/* TOOLBAR */}
      <div className={styles.toolbar}>
        {/* SEARCH */}
        <div className={styles.searchWrap}>
          <Search size={14} className={styles.searchIcon} />
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Search name or email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* ROLE FILTERS */}
        <div className={styles.filterGroup}>
          {ROLE_FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setRoleFilter(f.value)}
              className={[
                styles.filterBtn,
                roleFilter === f.value ? styles.filterBtnActive : "",
              ].join(" ")}
            >
              {f.label}
            </button>
          ))}
        </div>

        <span className={styles.totalBadge}>{filtered.length} result{filtered.length !== 1 && "s"}</span>
      </div>

      {/* TABLE */}
      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>User</th>
              <th>Role</th>
              <th>Verified</th>
              <th>Joined</th>
              <th>Activity</th>
              <th>Change Role</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6}>
                  <div className={styles.empty}>No users match your filter.</div>
                </td>
              </tr>
            ) : (
              filtered.map((user) => {
                const currentRole = pendingRole[user.id] ?? user.role;
                const isDirty     = pendingRole[user.id] != null && pendingRole[user.id] !== user.role;
                const isSaving    = saving[user.id] ?? false;

                return (
                  <tr key={user.id}>
                    {/* USER */}
                    <td>
                      <div className={styles.userCell}>
                        <div className={styles.avatar}>
                          {user.name[0]?.toUpperCase()}
                        </div>
                        <div>
                          <div className={styles.userName}>{user.name}</div>
                          <div className={styles.userEmail}>{user.email}</div>
                        </div>
                      </div>
                    </td>

                    {/* CURRENT ROLE BADGE */}
                    <td>
                      <span className={`${styles.roleBadge} ${ROLE_CLASS[user.role]}`}>
                        {ROLE_LABEL[user.role]}
                      </span>
                    </td>

                    {/* VERIFIED */}
                    <td>
                      {user.emailVerified ? (
                        <span className={styles.verified}>
                          <CheckCircle size={13} /> Yes
                        </span>
                      ) : (
                        <span className={styles.unverified}>No</span>
                      )}
                    </td>

                    {/* JOINED */}
                    <td style={{ fontSize: 13, color: "var(--text-muted)", whiteSpace: "nowrap" }}>
                      {new Date(user.createdAt).toLocaleDateString("en-GB", {
                        day: "2-digit", month: "short", year: "numeric",
                      })}
                    </td>

                    {/* ACTIVITY COUNTS */}
                    <td style={{ fontSize: 12, color: "var(--text-muted)" }}>
                      {user._count.orders} orders · {user._count.registrations} events · {user._count.researchSubmissions} papers
                    </td>

                    {/* CHANGE ROLE */}
                    <td>
                      <div className={styles.actionsCell}>
                        <select
                          className={styles.roleSelect}
                          value={currentRole}
                          disabled={isSaving}
                          onChange={(e) =>
                            setPendingRole((p) => ({ ...p, [user.id]: e.target.value as Role }))
                          }
                        >
                          {ROLES.map((r) => (
                            <option key={r} value={r}>{ROLE_LABEL[r]}</option>
                          ))}
                        </select>

                        {isDirty && (
                          <button
                            className={styles.saveBtn}
                            disabled={isSaving}
                            onClick={() => saveRole(user.id)}
                          >
                            {isSaving ? "…" : "Save"}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
