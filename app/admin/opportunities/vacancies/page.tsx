"use client";

import { useEffect, useState, useMemo } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Plus, Search, RefreshCw, Pencil, Trash2, Briefcase,
} from "lucide-react";
import styles from "./page.module.css";

type VacancyType   = "FULL_TIME" | "PART_TIME" | "INTERNSHIP" | "VOLUNTEER";
type VacancyStatus = "DRAFT" | "OPEN" | "CLOSED";

interface Vacancy {
  id:          string;
  title:       string;
  type:        VacancyType;
  department:  string;
  description: string;
  deadline:    string | null;
  status:      VacancyStatus;
  createdAt:   string;
  _count:      { applications: number };
}

const TYPE_LABELS: Record<VacancyType, string> = {
  FULL_TIME:  "Full-time",
  PART_TIME:  "Part-time",
  INTERNSHIP: "Internship",
  VOLUNTEER:  "Volunteer",
};

const STATUS_META: Record<VacancyStatus, { label: string; cls: string }> = {
  DRAFT:  { label: "Draft",  cls: styles.statusDraft  },
  OPEN:   { label: "Open",   cls: styles.statusOpen   },
  CLOSED: { label: "Closed", cls: styles.statusClosed },
};

const FILTERS: Array<VacancyStatus | "ALL"> = ["ALL", "OPEN", "DRAFT", "CLOSED"];

export default function AdminVacanciesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [vacancies,    setVacancies]    = useState<Vacancy[]>([]);
  const [loading,      setLoading]      = useState(true);
  const [search,       setSearch]       = useState("");
  const [statusFilter, setStatusFilter] = useState<VacancyStatus | "ALL">("ALL");
  const [busy,         setBusy]         = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (status === "unauthenticated") router.push("/auth/login");
    else if (status === "authenticated" && session?.user?.role !== "ADMIN") router.push("/dashboard");
  }, [status, session, router]);

  const fetchVacancies = async () => {
    setLoading(true);
    try {
      const res  = await fetch("/api/admin/opportunities/vacancies");
      const data = await res.json();
      setVacancies(Array.isArray(data) ? data : []);
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchVacancies(); }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return vacancies.filter((v) => {
      const matchSearch = !q ||
        v.title.toLowerCase().includes(q) ||
        v.department.toLowerCase().includes(q);
      const matchStatus = statusFilter === "ALL" || v.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [vacancies, search, statusFilter]);

  const stats = useMemo(() => ({
    total:  vacancies.length,
    open:   vacancies.filter((v) => v.status === "OPEN").length,
    draft:  vacancies.filter((v) => v.status === "DRAFT").length,
    closed: vacancies.filter((v) => v.status === "CLOSED").length,
  }), [vacancies]);

  const deleteVacancy = async (id: string) => {
    if (!confirm("Delete this vacancy? All applications will also be deleted.")) return;
    setBusy((b) => ({ ...b, [id]: true }));
    try {
      const res = await fetch(`/api/admin/opportunities/vacancies/${id}`, { method: "DELETE" });
      if (res.ok) setVacancies((prev) => prev.filter((v) => v.id !== id));
    } finally { setBusy((b) => ({ ...b, [id]: false })); }
  };

  const closingSoon = (deadline: string | null) => {
    if (!deadline) return false;
    const diff = new Date(deadline).getTime() - Date.now();
    return diff > 0 && diff < 7 * 24 * 60 * 60 * 1000;
  };

  if (status === "loading" || loading) {
    return (
      <div className={styles.loadingScreen}>
        <RefreshCw className={styles.spinner} size={28} />
        <p>Loading vacancies…</p>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      {/* HEADER */}
      <header className={styles.header}>
        <div>
          <h1 className={styles.pageTitle}>Vacancies</h1>
          <p className={styles.pageSubtitle}>
            Manage open positions, internships, and volunteer roles at Eka Research.
          </p>
        </div>
        <Link href="/admin/opportunities/vacancies/new" className={styles.addBtn}>
          <Plus size={15} /> Add Vacancy
        </Link>
      </header>

      {/* STAT PILLS */}
      <div className={styles.statRow}>
        {([
          { label: "Total",  value: stats.total  },
          { label: "Open",   value: stats.open   },
          { label: "Draft",  value: stats.draft  },
          { label: "Closed", value: stats.closed },
        ]).map(({ label, value }) => (
          <div key={label} className={styles.statPill}>
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
            placeholder="Search title or department…"
            value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>

        <div className={styles.filterBtns}>
          {FILTERS.map((f) => (
            <button key={f}
              className={`${styles.filterBtn} ${statusFilter === f ? styles.filterActive : ""}`}
              onClick={() => setStatusFilter(f)}>
              {f === "ALL" ? "All" : STATUS_META[f].label}
            </button>
          ))}
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
              <th>Position</th>
              <th>Type</th>
              <th>Deadline</th>
              <th>Applications</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6}>
                  <div className={styles.empty}>
                    <Briefcase size={32} style={{ marginBottom: 12, opacity: 0.3 }} />
                    <p>No vacancies match your filter.</p>
                  </div>
                </td>
              </tr>
            ) : filtered.map((vacancy) => {
              const isBusy  = busy[vacancy.id] ?? false;
              const soon    = closingSoon(vacancy.deadline);

              return (
                <tr key={vacancy.id}>
                  {/* POSITION */}
                  <td>
                    <div className={styles.positionName}>{vacancy.title}</div>
                    <div className={styles.positionDept}>{vacancy.department}</div>
                  </td>

                  {/* TYPE */}
                  <td>
                    <span className={styles.typeBadge}>{TYPE_LABELS[vacancy.type]}</span>
                  </td>

                  {/* DEADLINE */}
                  <td className={styles.deadlineCell}>
                    <div className={styles.deadlineWrap}>
                      {vacancy.deadline ? (
                        <>
                          <span>{new Date(vacancy.deadline).toLocaleDateString("en-GB", {
                            day: "2-digit", month: "short", year: "numeric",
                          })}</span>
                          {soon && <span className={styles.soonBadge}>Closing soon</span>}
                        </>
                      ) : (
                        <span className={styles.rollingText}>Rolling</span>
                      )}
                    </div>
                  </td>

                  {/* APPLICATIONS */}
                  <td className={styles.appsCell}>
                    {vacancy._count.applications}
                  </td>

                  {/* STATUS */}
                  <td>
                    <span className={`${styles.statusBadge} ${STATUS_META[vacancy.status].cls}`}>
                      {STATUS_META[vacancy.status].label}
                    </span>
                  </td>

                  {/* ACTIONS */}
                  <td>
                    <div className={styles.actions}>
                      <Link
                        href={`/admin/opportunities/vacancies/${vacancy.id}/edit`}
                        className={styles.editBtn}>
                        <Pencil size={12} />
                      </Link>
                      <button className={styles.deleteBtn} disabled={isBusy}
                        onClick={() => deleteVacancy(vacancy.id)}>
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
