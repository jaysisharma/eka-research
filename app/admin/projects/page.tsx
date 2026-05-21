"use client";

import { useEffect, useState, useMemo } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Plus, Search, RefreshCw, Pencil, Trash2, FolderKanban,
  CheckCircle, Clock, Pause, Rocket,
} from "lucide-react";
import styles from "./page.module.css";

/* ── Types ───────────────────────────────────────────────────────────── */

type ProjectStatus = "active" | "completed" | "planned" | "on_hold";

interface Category { id: string; name: string; slug: string; }

interface Project {
  id:          string;
  title:       string;
  description: string;
  status:      ProjectStatus;
  category:    Category;
  period:      string;
  tags:        string;   // JSON string[]
  imageUrl:    string | null;
  href:        string;
  featured:    boolean;
  published:   boolean;
  outcome:     string | null;
  phase:       string | null;
  launchTarget: string | null;
  createdAt:   string;
}

/* ── Helpers ─────────────────────────────────────────────────────────── */

const parseTags = (raw: string): string[] => {
  try { return JSON.parse(raw) as string[]; } catch { return []; }
};

const STATUS_META: Record<ProjectStatus, { label: string; cls: string; Icon: React.FC<{ size?: number }> }> = {
  active:    { label: "Active",    cls: styles.statusActive,    Icon: Rocket    },
  completed: { label: "Completed", cls: styles.statusCompleted, Icon: CheckCircle },
  planned:   { label: "Planned",   cls: styles.statusPlanned,   Icon: Clock      },
  on_hold:   { label: "On Hold",   cls: styles.statusOnHold,    Icon: Pause      },
};

/* ── Component ───────────────────────────────────────────────────────── */

export default function AdminProjectsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [projects, setProjects] = useState<Project[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [search,   setSearch]   = useState("");
  const [filter,   setFilter]   = useState<ProjectStatus | "ALL">("ALL");
  const [busy,     setBusy]     = useState<Record<string, boolean>>({});

  /* auth guard */
  useEffect(() => {
    if (status === "unauthenticated") router.push("/auth/login");
    else if (status === "authenticated" && session?.user?.role !== "ADMIN") router.push("/dashboard");
  }, [status, session, router]);

  /* fetch */
  const fetchProjects = async () => {
    setLoading(true);
    try {
      const res  = await fetch("/api/admin/projects");
      const data = await res.json();
      setProjects(Array.isArray(data) ? data : []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProjects(); }, []);

  /* derived */
  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return projects.filter((p) => {
      const matchSearch =
        !q ||
        p.title.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.category.name.toLowerCase().includes(q) ||
        parseTags(p.tags).some((t) => t.toLowerCase().includes(q));
      const matchStatus = filter === "ALL" || p.status === filter;
      return matchSearch && matchStatus;
    });
  }, [projects, search, filter]);

  const stats = useMemo(() => ({
    total:     projects.length,
    active:    projects.filter((p) => p.status === "active").length,
    completed: projects.filter((p) => p.status === "completed").length,
    planned:   projects.filter((p) => p.status === "planned").length,
    on_hold:   projects.filter((p) => p.status === "on_hold").length,
  }), [projects]);

  /* actions */
  const togglePublished = async (id: string, published: boolean) => {
    setBusy((b) => ({ ...b, [id]: true }));
    try {
      const res = await fetch(`/api/admin/projects/${id}`, {
        method:  "PATCH",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ published: !published }),
      });
      if (res.ok) {
        setProjects((prev) =>
          prev.map((p) => p.id === id ? { ...p, published: !published } : p)
        );
      }
    } finally {
      setBusy((b) => ({ ...b, [id]: false }));
    }
  };

  const deleteProject = async (id: string) => {
    if (!confirm("Delete this project? This cannot be undone.")) return;
    setBusy((b) => ({ ...b, [id]: true }));
    try {
      const res = await fetch(`/api/admin/projects/${id}`, { method: "DELETE" });
      if (res.ok) setProjects((prev) => prev.filter((p) => p.id !== id));
    } finally {
      setBusy((b) => ({ ...b, [id]: false }));
    }
  };

  /* loading */
  if (status === "loading" || loading) {
    return (
      <div className={styles.loadingScreen}>
        <RefreshCw className={styles.spinner} size={28} />
        <p>Loading projects…</p>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      {/* HEADER */}
      <header className={styles.header}>
        <div>
          <h1 className={styles.pageTitle}>Projects</h1>
          <p className={styles.pageSubtitle}>
            Manage all research projects, their status, categories, and public visibility.
          </p>
        </div>
        <Link href="/admin/projects/new" className={styles.addBtn}>
          <Plus size={15} /> Add Project
        </Link>
      </header>

      {/* STAT PILLS */}
      <div className={styles.statRow}>
        {([
          { label: "All",       value: stats.total,     f: "ALL"       },
          { label: "Active",    value: stats.active,    f: "active"    },
          { label: "Planned",   value: stats.planned,   f: "planned"   },
          { label: "Completed", value: stats.completed, f: "completed" },
          { label: "On Hold",   value: stats.on_hold,   f: "on_hold"   },
        ] as const).map(({ label, value, f }) => (
          <div
            key={f}
            className={`${styles.statPill} ${filter === f ? styles.statPillActive : ""}`}
            onClick={() => setFilter(f)}
          >
            <span className={styles.statPillValue}>{value}</span>
            <span className={styles.statPillLabel}>{label}</span>
          </div>
        ))}
      </div>

      {/* TOOLBAR */}
      <div className={styles.toolbar}>
        <div className={styles.searchWrap}>
          <Search size={13} className={styles.searchIcon} />
          <input
            className={styles.searchInput}
            placeholder="Search title, category, or tag…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
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
              <th>Project</th>
              <th>Category</th>
              <th>Status</th>
              <th>Period</th>
              <th>Visibility</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6}>
                  <div className={styles.empty}>
                    <FolderKanban size={32} style={{ marginBottom: 12, opacity: 0.3 }} />
                    <p>No projects match your filter.</p>
                  </div>
                </td>
              </tr>
            ) : filtered.map((project) => {
              const tags   = parseTags(project.tags);
              const meta   = STATUS_META[project.status] ?? STATUS_META.planned;
              const StatusIcon = meta.Icon;
              const isBusy = busy[project.id] ?? false;

              return (
                <tr key={project.id}>
                  {/* PROJECT */}
                  <td className={styles.titleCell}>
                    <div className={styles.projectTitle}>
                      {project.title}
                      {project.featured && (
                        <span className={styles.featuredBadge}>★ Featured</span>
                      )}
                    </div>
                    <div className={styles.projectDesc}>{project.description}</div>
                    {tags.length > 0 && (
                      <div className={styles.tagRow}>
                        {tags.slice(0, 4).map((tag) => (
                          <span key={tag} className={styles.tag}>{tag}</span>
                        ))}
                        {tags.length > 4 && (
                          <span className={styles.tag}>+{tags.length - 4}</span>
                        )}
                      </div>
                    )}
                  </td>

                  {/* CATEGORY */}
                  <td>
                    <span className={styles.categoryBadge}>{project.category.name}</span>
                  </td>

                  {/* STATUS */}
                  <td>
                    <span className={`${styles.statusBadge} ${meta.cls}`}>
                      <StatusIcon size={11} />
                      {meta.label}
                    </span>
                    {project.phase && (
                      <div className={styles.phaseLine}>{project.phase}</div>
                    )}
                  </td>

                  {/* PERIOD */}
                  <td className={styles.periodCell}>
                    {project.period}
                    {project.launchTarget && (
                      <div className={styles.launchLine}>🎯 {project.launchTarget}</div>
                    )}
                  </td>

                  {/* VISIBILITY */}
                  <td>
                    <button
                      className={`${styles.visBtn} ${project.published ? styles.visBtnOn : styles.visBtnOff}`}
                      disabled={isBusy}
                      onClick={() => togglePublished(project.id, project.published)}
                    >
                      {project.published ? "Public" : "Hidden"}
                    </button>
                  </td>

                  {/* ACTIONS */}
                  <td>
                    <div className={styles.actions}>
                      <Link
                        href={`/admin/projects/${project.id}/edit`}
                        className={styles.editBtn}
                      >
                        <Pencil size={12} />
                      </Link>
                      <button
                        className={styles.deleteBtn}
                        disabled={isBusy}
                        onClick={() => deleteProject(project.id)}
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
