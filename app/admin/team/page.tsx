"use client";

import { useEffect, useState, useMemo } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  Plus, Search, RefreshCw, Pencil, Trash2,
  Contact, Star, Sparkles, X, ChevronUp, ChevronDown
} from "lucide-react";
import styles from "./page.module.css";
import ImageUpload from "@/components/ui/ImageUpload";


interface TeamMember {
  id: string;
  name: string;
  role: string;
  bio: string;
  imageUrl: string | null;
  featured: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}

const FALLBACK_IMG =
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80";

type FilterType = "ALL" | "FEATURED" | "STANDARD";

export default function AdminTeamPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterType>("ALL");
  const [busy, setBusy] = useState<Record<string, boolean>>({});

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [formError, setFormError] = useState("");

  // Form State
  const [formName, setFormName] = useState("");
  const [formRole, setFormRole] = useState("");
  const [formBio, setFormBio] = useState("");
  const [formImageUrl, setFormImageUrl] = useState("");
  const [formFeatured, setFormFeatured] = useState(false);
  const [formOrder, setFormOrder] = useState<number>(0);

  /* Auth Guard */
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
    } else if (status === "authenticated" && session?.user?.role !== "ADMIN") {
      router.push("/dashboard");
    }
  }, [status, session, router]);

  /* Fetch Team Members */
  const fetchMembers = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/team");
      if (res.ok) {
        const data = await res.json();
        setMembers(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error("Error fetching team members:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  /* Filter and search derived state */
  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return members.filter((m) => {
      const matchSearch =
        !q ||
        m.name.toLowerCase().includes(q) ||
        m.role.toLowerCase().includes(q) ||
        m.bio.toLowerCase().includes(q);

      let matchFilter = true;
      if (filter === "FEATURED") matchFilter = m.featured;
      else if (filter === "STANDARD") matchFilter = !m.featured;

      return matchSearch && matchFilter;
    });
  }, [members, search, filter]);

  /* Metrics counts */
  const stats = useMemo(() => ({
    total: members.length,
    featured: members.filter((m) => m.featured).length,
    standard: members.filter((m) => !m.featured).length,
  }), [members]);

  /* Toggle Featured */
  const toggleFeatured = async (id: string, current: boolean) => {
    setBusy((b) => ({ ...b, [id]: true }));
    try {
      const res = await fetch(`/api/admin/team/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ featured: !current }),
      });
      if (res.ok) {
        const updated = await res.json();
        setMembers((prev) =>
          prev.map((m) => (m.id === id ? { ...m, featured: updated.featured } : m))
        );
      }
    } catch (err) {
      console.error("Failed to toggle featured status:", err);
    } finally {
      setBusy((b) => ({ ...b, [id]: false }));
    }
  };

  /* Open modal for creating */
  const openAddModal = () => {
    setEditingMember(null);
    setFormName("");
    setFormRole("");
    setFormBio("");
    setFormImageUrl("");
    setFormFeatured(false);
    setFormOrder(members.length > 0 ? Math.max(...members.map((m) => m.order)) + 1 : 1);
    setFormError("");
    setModalOpen(true);
  };

  /* Open modal for editing */
  const openEditModal = (member: TeamMember) => {
    setEditingMember(member);
    setFormName(member.name);
    setFormRole(member.role);
    setFormBio(member.bio);
    setFormImageUrl(member.imageUrl || "");
    setFormFeatured(member.featured);
    setFormOrder(member.order);
    setFormError("");
    setModalOpen(true);
  };

  /* Close Modal */
  const closeModal = () => {
    setModalOpen(false);
    setEditingMember(null);
  };

  /* Handle Form Submit (Create/Update) */
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!formName.trim() || !formRole.trim() || !formBio.trim()) {
      setFormError("Name, role, and biography are required.");
      return;
    }

    setModalLoading(true);

    const payload = {
      name: formName.trim(),
      role: formRole.trim(),
      bio: formBio.trim(),
      imageUrl: formImageUrl.trim() || null,
      featured: formFeatured,
      order: formOrder,
    };

    try {
      const url = editingMember
        ? `/api/admin/team/${editingMember.id}`
        : "/api/admin/team";
      const method = editingMember ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const saved = await res.json();
        if (editingMember) {
          setMembers((prev) => prev.map((m) => (m.id === editingMember.id ? saved : m)));
        } else {
          setMembers((prev) => [...prev, saved]);
        }
        closeModal();
      } else {
        const errData = await res.json();
        setFormError(errData.error || "Failed to save team member.");
      }
    } catch (err) {
      console.error(err);
      setFormError("An unexpected error occurred. Please try again.");
    } finally {
      setModalLoading(false);
    }
  };

  /* Handle Deletion */
  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to remove "${name}" from the team? This cannot be undone.`)) {
      return;
    }
    setBusy((b) => ({ ...b, [id]: true }));
    try {
      const res = await fetch(`/api/admin/team/${id}`, { method: "DELETE" });
      if (res.ok) {
        setMembers((prev) => prev.filter((m) => m.id !== id));
      } else {
        alert("Failed to delete the team member.");
      }
    } catch (err) {
      console.error(err);
      alert("An error occurred while deleting.");
    } finally {
      setBusy((b) => ({ ...b, [id]: false }));
    }
  };

  /* Sort order helper (Inline quick order update) */
  const handleOrderChange = async (id: string, newOrder: number) => {
    setBusy((b) => ({ ...b, [id]: true }));
    try {
      const res = await fetch(`/api/admin/team/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order: newOrder }),
      });
      if (res.ok) {
        const updated = await res.json();
        setMembers((prev) =>
          prev.map((m) => (m.id === id ? { ...m, order: updated.order } : m))
        );
      }
    } catch (err) {
      console.error("Failed to update ordering:", err);
    } finally {
      setBusy((b) => ({ ...b, [id]: false }));
    }
  };

  const sortedMembers = useMemo(() => {
    return [...filtered].sort((a, b) => a.order - b.order);
  }, [filtered]);

  if (status === "loading" || loading) {
    return (
      <div className={styles.loadingScreen}>
        <RefreshCw className={styles.spinner} size={28} />
        <p>Syncing team database…</p>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      {/* HEADER */}
      <header className={styles.header}>
        <div>
          <h1 className={styles.pageTitle}>Team Roster Console</h1>
          <p className={styles.pageSubtitle}>
            Manage researchers, outreach coordinators, education leads, and scientific contributors on the Eka team.
          </p>
        </div>
        <button onClick={openAddModal} className={styles.addBtn}>
          <Plus size={15} /> Add Team Member
        </button>
      </header>

      {/* STAT PILLS */}
      <div className={styles.statRow}>
        {([
          { label: "Total Members", value: stats.total, f: "ALL" },
          { label: "Featured / Leadership", value: stats.featured, f: "FEATURED" },
          { label: "Standard Members", value: stats.standard, f: "STANDARD" },
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
            placeholder="Search by name, role, or background bio…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <span className={styles.totalBadge}>
          {sortedMembers.length} member{sortedMembers.length !== 1 && "s"} found
        </span>
      </div>

      {/* TABLE */}
      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th style={{ width: "80px", textAlign: "center" }}>Order</th>
              <th>Member</th>
              <th>Role</th>
              <th>Biography Snippet</th>
              <th>Featured</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {sortedMembers.length === 0 ? (
              <tr>
                <td colSpan={6}>
                  <div className={styles.empty}>
                    <Contact size={32} style={{ marginBottom: 12, opacity: 0.3 }} />
                    <p>No team members match your filters.</p>
                  </div>
                </td>
              </tr>
            ) : (
              sortedMembers.map((member) => {
                const isBusy = busy[member.id] ?? false;

                return (
                  <tr key={member.id}>
                    {/* ORDERING INPUT */}
                    <td>
                      <div className={styles.orderControl}>
                        <button
                          className={styles.orderArrow}
                          disabled={isBusy}
                          onClick={() => handleOrderChange(member.id, member.order - 1)}
                          title="Move up"
                        >
                          <ChevronUp size={12} />
                        </button>
                        <span className={styles.orderVal}>{member.order}</span>
                        <button
                          className={styles.orderArrow}
                          disabled={isBusy}
                          onClick={() => handleOrderChange(member.id, member.order + 1)}
                          title="Move down"
                        >
                          <ChevronDown size={12} />
                        </button>
                      </div>
                    </td>

                    {/* MEMBER CARD INFO & THUMB */}
                    <td className={styles.titleCell}>
                      <div className={styles.memberCard}>
                        <div className={styles.thumbWrap}>
                          <Image
                            src={member.imageUrl ?? FALLBACK_IMG}
                            alt={member.name}
                            width={40}
                            height={40}
                            className={styles.thumb}
                            unoptimized
                          />
                        </div>
                        <div className={styles.memberInfoText}>
                          <div className={styles.memberName}>{member.name}</div>
                        </div>
                      </div>
                    </td>

                    {/* ROLE */}
                    <td>
                      <span className={styles.roleBadge}>
                        {member.role}
                      </span>
                    </td>

                    {/* BIO SNIPPET */}
                    <td className={styles.bioCell}>
                      <div className={styles.bioText} title={member.bio}>
                        {member.bio}
                      </div>
                    </td>

                    {/* FEATURED STATUS TOGGLE */}
                    <td>
                      <button
                        className={`${styles.iconBtn} ${member.featured ? styles.iconBtnOn : ""}`}
                        disabled={isBusy}
                        onClick={() => toggleFeatured(member.id, member.featured)}
                        title={member.featured ? "Demote from Featured" : "Promote to Featured"}
                      >
                        <Star size={16} className={member.featured ? styles.starFilled : styles.starOutline} />
                      </button>
                    </td>

                    {/* ACTIONS */}
                    <td>
                      <div className={styles.actions}>
                        <button
                          onClick={() => openEditModal(member)}
                          className={styles.editBtn}
                          disabled={isBusy}
                          title="Edit member"
                        >
                          <Pencil size={12} />
                        </button>
                        <button
                          className={styles.deleteBtn}
                          disabled={isBusy}
                          onClick={() => handleDelete(member.id, member.name)}
                          title="Remove team member"
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
                {editingMember ? (
                  <>
                    <Sparkles size={16} className={styles.titleIcon} /> Update Roster Member
                  </>
                ) : (
                  <>
                    <Contact size={16} className={styles.titleIcon} /> Add Roster Member
                  </>
                )}
              </h2>
              <button className={styles.closeBtn} onClick={closeModal} aria-label="Close modal">
                <X size={16} />
              </button>
            </header>

            <form onSubmit={handleFormSubmit} className={styles.form}>
              {formError && <div className={styles.formError}>{formError}</div>}

              <div className={styles.formGrid}>
                <div className={styles.inputGroup}>
                  <label htmlFor="name">Full Name *</label>
                  <input
                    id="name"
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="e.g. Dr. Jaysi Sharma"
                  />
                </div>

                <div className={styles.inputGroup}>
                  <label htmlFor="role">Role / Title *</label>
                  <input
                    id="role"
                    type="text"
                    required
                    value={formRole}
                    onChange={(e) => setFormRole(e.target.value)}
                    placeholder="e.g. Lead Atmospheric Scientist"
                  />
                </div>
              </div>

              <div className={styles.inputGroup}>
                <label htmlFor="bio">Biography Background *</label>
                <textarea
                  id="bio"
                  rows={4}
                  required
                  value={formBio}
                  onChange={(e) => setFormBio(e.target.value)}
                  placeholder="Summarize scientific projects, publications, background, or educational coordinate missions..."
                />
              </div>

              <div className={styles.inputGroup}>
                <label>Profile Image</label>
                <ImageUpload
                  value={formImageUrl}
                  onChange={setFormImageUrl}
                  label="Upload Profile Image"
                />
              </div>

              <div className={styles.inputGroup} style={{ maxWidth: "120px" }}>
                <label htmlFor="order">Display Order</label>
                <input
                  id="order"
                  type="number"
                  value={formOrder}
                  onChange={(e) => setFormOrder(parseInt(e.target.value) || 0)}
                  min={0}
                />
              </div>

              <div className={styles.toggleRow}>
                <label className={styles.toggleLabel}>
                  <input
                    type="checkbox"
                    checked={formFeatured}
                    onChange={(e) => setFormFeatured(e.target.checked)}
                  />
                  <span className={styles.toggleText}>
                    <strong>Featured Member</strong> (Will be featured in the leadership / larger profile showcase at the top of the About page)
                  </span>
                </label>
              </div>

              <footer className={styles.modalFooter}>
                <button type="button" className={styles.cancelBtn} onClick={closeModal} disabled={modalLoading}>
                  Cancel
                </button>
                <button type="submit" className={styles.saveBtn} disabled={modalLoading}>
                  {modalLoading ? "Saving Changes..." : editingMember ? "Save Changes" : "Add Member"}
                </button>
              </footer>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
