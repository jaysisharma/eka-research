"use client";

import { useEffect, useState, useMemo } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  Plus, Search, RefreshCw, Pencil, Trash2,
  Calendar, Star, Sparkles, X, Eye, EyeOff
} from "lucide-react";
import styles from "./page.module.css";

interface DbEvent {
  id: string;
  slug: string | null;
  title: string;
  description: string;
  type: string;
  date: string;
  time: string;
  location: string;
  locationDetail: string | null;
  seats: number | null;
  seatsLeft: number | null;
  href: string;
  registrationHref: string | null;
  published: boolean;
  featured: boolean;
  createdAt: string;
  updatedAt: string;
}

type FilterType = "ALL" | "FEATURED" | "PUBLISHED" | "DRAFT";

const EVENT_TYPES = [
  { value: "observation", label: "Observation Night" },
  { value: "workshop", label: "Workshop" },
  { value: "lecture", label: "Public Lecture" },
  { value: "outreach", label: "Outreach" },
  { value: "conference", label: "Conference" },
];

export default function AdminEventsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [events, setEvents] = useState<DbEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterType>("ALL");
  const [busy, setBusy] = useState<Record<string, boolean>>({});

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<DbEvent | null>(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [formError, setFormError] = useState("");

  // Form State
  const [formTitle, setFormTitle] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formType, setFormType] = useState("observation");
  const [formDate, setFormDate] = useState("");
  const [formTime, setFormTime] = useState("");
  const [formLocation, setFormLocation] = useState("");
  const [formLocationDetail, setFormLocationDetail] = useState("");
  const [formSeats, setFormSeats] = useState<string>("");
  const [formPublished, setFormPublished] = useState(true);
  const [formFeatured, setFormFeatured] = useState(false);

  /* Auth Guard */
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
    } else if (status === "authenticated" && session?.user?.role !== "ADMIN") {
      router.push("/dashboard");
    }
  }, [status, session, router]);

  /* Fetch Events */
  const fetchEvents = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/events");
      if (res.ok) {
        const data = await res.json();
        setEvents(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error("Error fetching events:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  /* Filter and search derived state */
  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return events.filter((e) => {
      const matchSearch =
        !q ||
        e.title.toLowerCase().includes(q) ||
        e.location.toLowerCase().includes(q) ||
        e.description.toLowerCase().includes(q) ||
        e.type.toLowerCase().includes(q);

      let matchFilter = true;
      if (filter === "FEATURED") matchFilter = e.featured;
      else if (filter === "PUBLISHED") matchFilter = e.published;
      else if (filter === "DRAFT") matchFilter = !e.published;

      return matchSearch && matchFilter;
    });
  }, [events, search, filter]);

  /* Metrics counts */
  const stats = useMemo(() => ({
    total: events.length,
    featured: events.filter((e) => e.featured).length,
    published: events.filter((e) => e.published).length,
    draft: events.filter((e) => !e.published).length,
  }), [events]);

  /* Toggle Featured */
  const toggleFeatured = async (id: string, current: boolean) => {
    setBusy((b) => ({ ...b, [id]: true }));
    try {
      const res = await fetch(`/api/admin/events/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ featured: !current }),
      });
      if (res.ok) {
        const updated = await res.json();
        setEvents((prev) =>
          prev.map((e) => (e.id === id ? { ...e, featured: updated.featured } : e))
        );
      }
    } catch (err) {
      console.error("Failed to toggle featured status:", err);
    } finally {
      setBusy((b) => ({ ...b, [id]: false }));
    }
  };

  /* Toggle Published */
  const togglePublished = async (id: string, current: boolean) => {
    setBusy((b) => ({ ...b, [id]: true }));
    try {
      const res = await fetch(`/api/admin/events/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ published: !current }),
      });
      if (res.ok) {
        const updated = await res.json();
        setEvents((prev) =>
          prev.map((e) => (e.id === id ? { ...e, published: updated.published } : e))
        );
      }
    } catch (err) {
      console.error("Failed to toggle published status:", err);
    } finally {
      setBusy((b) => ({ ...b, [id]: false }));
    }
  };

  /* Open modal for creating */
  const openAddModal = () => {
    setEditingEvent(null);
    setFormTitle("");
    setFormDescription("");
    setFormType("observation");
    setFormDate("");
    setFormTime("");
    setFormLocation("");
    setFormLocationDetail("");
    setFormSeats("");
    setFormPublished(true);
    setFormFeatured(false);
    setFormError("");
    setModalOpen(true);
  };

  /* Open modal for editing */
  const openEditModal = (ev: DbEvent) => {
    setEditingEvent(ev);
    setFormTitle(ev.title);
    setFormDescription(ev.description);
    setFormType(ev.type);
    setFormDate(ev.date);
    setFormTime(ev.time);
    setFormLocation(ev.location);
    setFormLocationDetail(ev.locationDetail || "");
    setFormSeats(ev.seats !== null ? ev.seats.toString() : "");
    setFormPublished(ev.published);
    setFormFeatured(ev.featured);
    setFormError("");
    setModalOpen(true);
  };

  /* Close Modal */
  const closeModal = () => {
    setModalOpen(false);
    setEditingEvent(null);
  };

  /* Handle Form Submit (Create/Update) */
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (
      !formTitle.trim() ||
      !formDescription.trim() ||
      !formType.trim() ||
      !formDate.trim() ||
      !formTime.trim() ||
      !formLocation.trim()
    ) {
      setFormError("All starred (*) fields are required.");
      return;
    }

    setModalLoading(true);

    const payload = {
      title: formTitle.trim(),
      description: formDescription.trim(),
      type: formType.trim(),
      date: formDate.trim(),
      time: formTime.trim(),
      location: formLocation.trim(),
      locationDetail: formLocationDetail.trim() || null,
      seats: formSeats.trim() ? parseInt(formSeats) : null,
      published: formPublished,
      featured: formFeatured,
    };

    try {
      const url = editingEvent
        ? `/api/admin/events/${editingEvent.id}`
        : "/api/admin/events";
      const method = editingEvent ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const saved = await res.json();
        if (editingEvent) {
          setEvents((prev) => prev.map((e) => (e.id === editingEvent.id ? saved : e)));
        } else {
          setEvents((prev) => [saved, ...prev]);
        }
        closeModal();
      } else {
        const errData = await res.json();
        setFormError(errData.error || "Failed to save event.");
      }
    } catch (err) {
      console.error(err);
      setFormError("An unexpected error occurred. Please try again.");
    } finally {
      setModalLoading(false);
    }
  };

  /* Handle Deletion */
  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to cancel and delete "${title}"? This cannot be undone.`)) {
      return;
    }
    setBusy((b) => ({ ...b, [id]: true }));
    try {
      const res = await fetch(`/api/admin/events/${id}`, { method: "DELETE" });
      if (res.ok) {
        setEvents((prev) => prev.filter((e) => e.id !== id));
      } else {
        alert("Failed to delete the event.");
      }
    } catch (err) {
      console.error(err);
      alert("An error occurred while deleting.");
    } finally {
      setBusy((b) => ({ ...b, [id]: false }));
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className={styles.loadingScreen}>
        <RefreshCw className={styles.spinner} size={28} />
        <p>Syncing events database…</p>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      {/* HEADER */}
      <header className={styles.header}>
        <div>
          <h1 className={styles.pageTitle}>Events Console</h1>
          <p className={styles.pageSubtitle}>
            Manage upcoming observation camps, star watches, citizen science workshops, and public outreach events.
          </p>
        </div>
        <button onClick={openAddModal} className={styles.addBtn}>
          <Plus size={15} /> Add New Event
        </button>
      </header>

      {/* STAT PILLS */}
      <div className={styles.statRow}>
        {([
          { label: "Total Events", value: stats.total, f: "ALL" },
          { label: "Featured Events", value: stats.featured, f: "FEATURED" },
          { label: "Published Events", value: stats.published, f: "PUBLISHED" },
          { label: "Drafts / Hidden", value: stats.draft, f: "DRAFT" },
        ] as const).map(({ label, value, f }) => (
          <div
            key={f}
            className={`${styles.statPill} ${filter === f ? styles.statPillActive : ""}`}
            onClick={() => setFilter(f)}
          >
            {f === "FEATURED" && value > 0 && <Star size={12} className={styles.featuredIconStar} />}
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
            placeholder="Search by title, location, or type…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <span className={styles.totalBadge}>
          {filtered.length} event{filtered.length !== 1 && "s"} found
        </span>
      </div>

      {/* TABLE */}
      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Event Info</th>
              <th>Type</th>
              <th>Date & Time</th>
              <th>Location</th>
              <th style={{ textAlign: "center" }}>Seats</th>
              <th style={{ textAlign: "center" }}>Featured</th>
              <th style={{ textAlign: "center" }}>Status</th>
              <th style={{ width: "100px" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={8}>
                  <div className={styles.empty}>
                    <Calendar size={32} style={{ marginBottom: 12, opacity: 0.3 }} />
                    <p>No events match your search or filter.</p>
                  </div>
                </td>
              </tr>
            ) : (
              filtered.map((ev) => {
                const isBusy = busy[ev.id] ?? false;

                return (
                  <tr key={ev.id}>
                    {/* TITLE */}
                    <td className={styles.titleCell}>
                      <div>{ev.title}</div>
                      <div className={styles.descCell}>{ev.description}</div>
                    </td>

                    {/* TYPE */}
                    <td>
                      <span className={`${styles.typeBadge} ${styles[`type_${ev.type}`]}`}>
                        {ev.type}
                      </span>
                    </td>

                    {/* DATE & TIME */}
                    <td className={styles.metaCell}>
                      <strong>{ev.date}</strong>
                      <div style={{ fontSize: "11px", opacity: 0.8 }}>{ev.time}</div>
                    </td>

                    {/* LOCATION */}
                    <td className={styles.metaCell}>
                      {ev.location}
                      {ev.locationDetail && (
                        <div style={{ fontSize: "11px", opacity: 0.8 }}>{ev.locationDetail}</div>
                      )}
                    </td>

                    {/* SEATS */}
                    <td style={{ textAlign: "center" }} className={styles.metaCell}>
                      {ev.seats !== null ? (
                        <>
                          <strong>{ev.seatsLeft}</strong>
                          <span style={{ opacity: 0.6 }}> / {ev.seats}</span>
                        </>
                      ) : (
                        <span style={{ opacity: 0.5 }}>—</span>
                      )}
                    </td>

                    {/* FEATURED */}
                    <td style={{ textAlign: "center" }}>
                      <button
                        className={`${styles.iconBtn} ${ev.featured ? styles.iconBtnOn : ""}`}
                        disabled={isBusy}
                        onClick={() => toggleFeatured(ev.id, ev.featured)}
                        title={ev.featured ? "Demote from Featured" : "Promote to Featured"}
                      >
                        <Star size={16} className={ev.featured ? styles.starFilled : styles.starOutline} />
                      </button>
                    </td>

                    {/* STATUS */}
                    <td style={{ textAlign: "center" }}>
                      <button
                        className={`${styles.iconBtn} ${ev.published ? styles.publishIconOn : ""}`}
                        disabled={isBusy}
                        onClick={() => togglePublished(ev.id, ev.published)}
                        title={ev.published ? "Unpublish event" : "Publish event"}
                      >
                        {ev.published ? <Eye size={16} /> : <EyeOff size={16} />}
                      </button>
                    </td>

                    {/* ACTIONS */}
                    <td>
                      <div className={styles.actions}>
                        <button
                          onClick={() => openEditModal(ev)}
                          className={styles.editBtn}
                          disabled={isBusy}
                          title="Edit event"
                        >
                          <Pencil size={12} />
                        </button>
                        <button
                          className={styles.deleteBtn}
                          disabled={isBusy}
                          onClick={() => handleDelete(ev.id, ev.title)}
                          title="Delete event"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL OVERLAY */}
      {modalOpen && (
        <div className={styles.modalOverlay} onClick={closeModal}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <header className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>
                {editingEvent ? (
                  <>
                    <Sparkles size={16} className={styles.titleIcon} /> Update Event Details
                  </>
                ) : (
                  <>
                    <Calendar size={16} className={styles.titleIcon} /> Schedule New Event
                  </>
                )}
              </h2>
              <button className={styles.closeBtn} onClick={closeModal} aria-label="Close modal">
                <X size={16} />
              </button>
            </header>

            <form onSubmit={handleFormSubmit} className={styles.form}>
              {formError && <div className={styles.formError}>{formError}</div>}

              <div className={styles.inputGroup}>
                <label htmlFor="title">Event Title *</label>
                <input
                  id="title"
                  type="text"
                  required
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="e.g. Lyrid Meteor Watch Night"
                />
              </div>

              <div className={styles.inputGroup}>
                <label htmlFor="description">Event Description *</label>
                <textarea
                  id="description"
                  rows={3}
                  required
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Summarize the activities, highlights, prerequisites, what to bring, tea provided etc..."
                />
              </div>

              <div className={styles.formGrid}>
                <div className={styles.inputGroup}>
                  <label htmlFor="type">Event Type *</label>
                  <select
                    id="type"
                    value={formType}
                    onChange={(e) => setFormType(e.target.value)}
                  >
                    {EVENT_TYPES.map((t) => (
                      <option key={t.value} value={t.value}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className={styles.inputGroup}>
                  <label htmlFor="seats">Maximum Seats Available</label>
                  <input
                    id="seats"
                    type="number"
                    value={formSeats}
                    onChange={(e) => setFormSeats(e.target.value)}
                    placeholder="Leave blank if unlimited"
                    min={0}
                  />
                </div>
              </div>

              <div className={styles.formGrid}>
                <div className={styles.inputGroup}>
                  <label htmlFor="date">Date (YYYY-MM-DD) *</label>
                  <input
                    id="date"
                    type="text"
                    required
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    placeholder="e.g. 2026-04-22"
                  />
                </div>

                <div className={styles.inputGroup}>
                  <label htmlFor="time">Time *</label>
                  <input
                    id="time"
                    type="text"
                    required
                    value={formTime}
                    onChange={(e) => setFormTime(e.target.value)}
                    placeholder="e.g. 8:00 PM NPT"
                  />
                </div>
              </div>

              <div className={styles.formGrid}>
                <div className={styles.inputGroup}>
                  <label htmlFor="location">City / General Location *</label>
                  <input
                    id="location"
                    type="text"
                    required
                    value={formLocation}
                    onChange={(e) => setFormLocation(e.target.value)}
                    placeholder="e.g. Nagarkot, Bhaktapur"
                  />
                </div>

                <div className={styles.inputGroup}>
                  <label htmlFor="locationDetail">Specific Venue / Detail</label>
                  <input
                    id="locationDetail"
                    type="text"
                    value={formLocationDetail}
                    onChange={(e) => setFormLocationDetail(e.target.value)}
                    placeholder="e.g. Dark Sky Site, Eka Centre"
                  />
                </div>
              </div>

              <div className={styles.toggleRow}>
                <label className={styles.toggleLabel}>
                  <input
                    type="checkbox"
                    checked={formFeatured}
                    onChange={(e) => setFormFeatured(e.target.checked)}
                  />
                  <span className={styles.toggleText}>
                    <strong>Featured Event</strong> (Will be pinned/prioritized in the upcoming events section on the homepage)
                  </span>
                </label>
              </div>

              <div className={styles.toggleRow}>
                <label className={styles.toggleLabel}>
                  <input
                    type="checkbox"
                    checked={formPublished}
                    onChange={(e) => setFormPublished(e.target.checked)}
                  />
                  <span className={styles.toggleText}>
                    <strong>Publish Event</strong> (Make this event visible to public immediately on Eka)
                  </span>
                </label>
              </div>

              <footer className={styles.modalFooter}>
                <button type="button" className={styles.cancelBtn} onClick={closeModal} disabled={modalLoading}>
                  Cancel
                </button>
                <button type="submit" className={styles.saveBtn} disabled={modalLoading}>
                  {modalLoading ? "Saving Changes..." : editingEvent ? "Save Changes" : "Create Event"}
                </button>
              </footer>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
