"use client";

import { useEffect, useState, useMemo } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Plus, Search, RefreshCw, CheckCircle, XCircle,
  Pencil, Trash2, FileText,
} from "lucide-react";
import styles from "./page.module.css";

/* ── Types ───────────────────────────────────────────────────────────── */

type Status    = "pending" | "approved" | "rejected";
type PaperType = "journal" | "conference" | "preprint" | "report";

interface Submitter { id: string; name: string; email: string; role: string; }

interface Paper {
  id:               string;
  title:            string;
  authors:          string;
  ekaAuthors:       string;
  journal:          string;
  year:             number;
  type:             PaperType;
  submissionStatus: Status;
  submitter:        Submitter | null;
  createdAt:        string;
  isPremium:        boolean;
}

/* ── Helpers ─────────────────────────────────────────────────────────── */

const parseArr = (raw: string): string[] => {
  try { return JSON.parse(raw) as string[]; } catch { return []; }
};

const TYPE_STYLE: Record<PaperType, string> = {
  journal:    styles.typeJournal,
  conference: styles.typeConference,
  preprint:   styles.typePreprint,
  report:     styles.typeReport,
};

const STATUS_STYLE: Record<Status, string> = {
  pending:  styles.statusPending,
  approved: styles.statusApproved,
  rejected: styles.statusRejected,
};

/* ── Component ───────────────────────────────────────────────────────── */

export default function AdminPapersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [papers,  setPapers]  = useState<Paper[]>([]);
  const [loading, setLoading] = useState(true);
  const [search,  setSearch]  = useState("");
  const [filter,  setFilter]  = useState<Status | "ALL">("ALL");
  const [busy,    setBusy]    = useState<Record<string, boolean>>({});

  /* auth guard */
  useEffect(() => {
    if (status === "unauthenticated") router.push("/auth/login");
    else if (status === "authenticated" && session?.user?.role !== "ADMIN") router.push("/dashboard");
  }, [status, session, router]);

  /* fetch */
  const fetchPapers = async () => {
    setLoading(true);
    try {
      const res  = await fetch("/api/admin/papers");
      const data = await res.json();
      setPapers(Array.isArray(data) ? data : []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPapers(); }, []);

  /* derived */
  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return papers.filter((p) => {
      const matchSearch =
        !q ||
        p.title.toLowerCase().includes(q) ||
        p.journal.toLowerCase().includes(q) ||
        (p.submitter?.name ?? "").toLowerCase().includes(q);
      const matchStatus = filter === "ALL" || p.submissionStatus === filter;
      return matchSearch && matchStatus;
    });
  }, [papers, search, filter]);

  const stats = useMemo(() => ({
    total:    papers.length,
    pending:  papers.filter((p) => p.submissionStatus === "pending").length,
    approved: papers.filter((p) => p.submissionStatus === "approved").length,
    rejected: papers.filter((p) => p.submissionStatus === "rejected").length,
  }), [papers]);

  /* actions */
  const verify = async (id: string, action: "approve" | "reject") => {
    setBusy((b) => ({ ...b, [id]: true }));
    try {
      const res = await fetch(`/api/admin/papers/${id}/verify`, {
        method:  "PATCH",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ action }),
      });
      if (res.ok) {
        const updated = await res.json() as { submissionStatus: Status; published: boolean };
        setPapers((prev) => prev.map((p) =>
          p.id === id
            ? { ...p, submissionStatus: updated.submissionStatus }
            : p
        ));
      }
    } finally {
      setBusy((b) => ({ ...b, [id]: false }));
    }
  };

  const deletePaper = async (id: string) => {
    if (!confirm("Delete this paper? This cannot be undone.")) return;
    setBusy((b) => ({ ...b, [id]: true }));
    try {
      const res = await fetch(`/api/admin/papers/${id}`, { method: "DELETE" });
      if (res.ok) setPapers((prev) => prev.filter((p) => p.id !== id));
    } finally {
      setBusy((b) => ({ ...b, [id]: false }));
    }
  };

  /* loading */
  if (status === "loading" || loading) {
    return (
      <div className={styles.loadingScreen}>
        <RefreshCw className={styles.spinner} size={28} />
        <p>Loading papers…</p>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      {/* HEADER */}
      <header className={styles.header}>
        <div>
          <h1 className={styles.pageTitle}>Research Papers</h1>
          <p className={styles.pageSubtitle}>
            Manage all papers, verify researcher submissions, and publish approved work.
          </p>
        </div>
        <Link href="/admin/papers/new" className={styles.addBtn}>
          <Plus size={15} /> Add Paper
        </Link>
      </header>

      {/* STAT PILLS */}
      <div className={styles.statRow}>
        {([
          { label: "Total",    value: stats.total,    f: "ALL"      },
          { label: "Pending",  value: stats.pending,  f: "pending"  },
          { label: "Approved", value: stats.approved, f: "approved" },
          { label: "Rejected", value: stats.rejected, f: "rejected" },
        ] as const).map(({ label, value, f }) => (
          <div
            key={f}
            className={`${styles.statPill} ${filter === f ? styles.statPillActive : ""}`}
            onClick={() => setFilter(f)}
          >
            {f === "pending" && value > 0 && <span className={styles.pendingDot} />}
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
            placeholder="Search title, journal, or submitter…"
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
              <th>Paper</th>
              <th>Type</th>
              <th>Submitted by</th>
              <th>Year</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6}>
                  <div className={styles.empty}>
                    <FileText size={32} style={{ marginBottom: 12, opacity: 0.3 }} />
                    <p>No papers match your filter.</p>
                  </div>
                </td>
              </tr>
            ) : filtered.map((paper) => {
              const authors = parseArr(paper.authors);
              const isBusy  = busy[paper.id] ?? false;

              return (
                <tr key={paper.id}>
                  {/* PAPER */}
                  <td className={styles.titleCell}>
                    <div className={styles.paperTitle}>
                      {paper.title}
                      {paper.isPremium && (
                        <span className={styles.premiumBadge} title="Premium — paid members only">
                          👑 Premium
                        </span>
                      )}
                    </div>
                    <div className={styles.paperJournal}>
                      {paper.journal}
                      {authors.length > 0 && (
                        <> · {authors.slice(0, 2).join(", ")}
                          {authors.length > 2 && ` +${authors.length - 2}`}
                        </>
                      )}
                    </div>
                  </td>

                  {/* TYPE */}
                  <td>
                    <span className={`${styles.typeBadge} ${TYPE_STYLE[paper.type] ?? ""}`}>
                      {paper.type}
                    </span>
                  </td>

                  {/* SUBMITTED BY */}
                  <td>
                    {paper.submitter ? (
                      <>
                        <div className={styles.submitterName}>{paper.submitter.name}</div>
                        <div className={styles.submitterEmail}>{paper.submitter.email}</div>
                        <span className={styles.submitterRole}>
                          {paper.submitter.role.replace("_", " ")}
                        </span>
                      </>
                    ) : (
                      <span className={styles.submitterRole}>Admin</span>
                    )}
                  </td>

                  {/* YEAR */}
                  <td style={{ fontSize: 13, color: "var(--text-muted)", fontWeight: 600 }}>
                    {paper.year}
                  </td>

                  {/* STATUS */}
                  <td>
                    <span className={`${styles.statusBadge} ${STATUS_STYLE[paper.submissionStatus]}`}>
                      {paper.submissionStatus === "approved" && <CheckCircle size={11} />}
                      {paper.submissionStatus === "rejected"  && <XCircle     size={11} />}
                      {paper.submissionStatus.charAt(0).toUpperCase() + paper.submissionStatus.slice(1)}
                    </span>
                  </td>

                  {/* ACTIONS */}
                  <td>
                    <div className={styles.actions}>
                      {paper.submissionStatus !== "approved" && (
                        <button
                          className={styles.approveBtn}
                          disabled={isBusy}
                          onClick={() => verify(paper.id, "approve")}
                        >
                          ✓ Approve
                        </button>
                      )}
                      {paper.submissionStatus !== "rejected" && (
                        <button
                          className={styles.rejectBtn}
                          disabled={isBusy}
                          onClick={() => verify(paper.id, "reject")}
                        >
                          ✗ Reject
                        </button>
                      )}
                      <Link
                        href={`/admin/papers/${paper.id}/edit`}
                        className={styles.editBtn}
                      >
                        <Pencil size={12} />
                      </Link>
                      <button
                        className={styles.deleteBtn}
                        disabled={isBusy}
                        onClick={() => deletePaper(paper.id)}
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
