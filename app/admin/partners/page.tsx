"use client";

import { useEffect, useState, useMemo } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  Plus, Search, RefreshCw, Pencil, Trash2,
  Award, Star, Sparkles, X, ChevronUp, ChevronDown, ExternalLink
} from "lucide-react";
import styles from "./page.module.css";
import ImageUpload from "@/components/ui/ImageUpload";

interface Partner {
  id: string;
  name: string;
  logoUrl: string | null;
  website: string | null;
  featured: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}

const FALLBACK_LOGO =
  "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=120&q=80";

type FilterType = "ALL" | "FEATURED" | "STANDARD";

export default function AdminPartnersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterType>("ALL");
  const [busy, setBusy] = useState<Record<string, boolean>>({});

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPartner, setEditingPartner] = useState<Partner | null>(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [formError, setFormError] = useState("");

  // Form State
  const [formName, setFormName] = useState("");
  const [formWebsite, setFormWebsite] = useState("");
  const [formLogoUrl, setFormLogoUrl] = useState("");
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

  /* Fetch Partners */
  const fetchPartners = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/partners");
      if (res.ok) {
        const data = await res.json();
        setPartners(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error("Error fetching partners:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPartners();
  }, []);

  /* Filter and search derived state */
  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return partners.filter((p) => {
      const matchSearch =
        !q ||
        p.name.toLowerCase().includes(q) ||
        (p.website && p.website.toLowerCase().includes(q));

      let matchFilter = true;
      if (filter === "FEATURED") matchFilter = p.featured;
      else if (filter === "STANDARD") matchFilter = !p.featured;

      return matchSearch && matchFilter;
    });
  }, [partners, search, filter]);

  /* Metrics counts */
  const stats = useMemo(() => ({
    total: partners.length,
    featured: partners.filter((p) => p.featured).length,
    standard: partners.filter((p) => !p.featured).length,
  }), [partners]);

  /* Toggle Featured */
  const toggleFeatured = async (id: string, current: boolean) => {
    setBusy((b) => ({ ...b, [id]: true }));
    try {
      const res = await fetch(`/api/admin/partners/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ featured: !current }),
      });
      if (res.ok) {
        const updated = await res.json();
        setPartners((prev) =>
          prev.map((p) => (p.id === id ? { ...p, featured: updated.featured } : p))
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
    setEditingPartner(null);
    setFormName("");
    setFormWebsite("");
    setFormLogoUrl("");
    setFormFeatured(false);
    setFormOrder(partners.length > 0 ? Math.max(...partners.map((p) => p.order)) + 1 : 1);
    setFormError("");
    setModalOpen(true);
  };

  /* Open modal for editing */
  const openEditModal = (partner: Partner) => {
    setEditingPartner(partner);
    setFormName(partner.name);
    setFormWebsite(partner.website || "");
    setFormLogoUrl(partner.logoUrl || "");
    setFormFeatured(partner.featured);
    setFormOrder(partner.order);
    setFormError("");
    setModalOpen(true);
  };

  /* Close Modal */
  const closeModal = () => {
    setModalOpen(false);
    setEditingPartner(null);
  };

  /* Handle Form Submit (Create/Update) */
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!formName.trim()) {
      setFormError("Partner name is required.");
      return;
    }

    setModalLoading(true);

    const payload = {
      name: formName.trim(),
      website: formWebsite.trim() || null,
      logoUrl: formLogoUrl.trim() || null,
      featured: formFeatured,
      order: formOrder,
    };

    try {
      const url = editingPartner
        ? `/api/admin/partners/${editingPartner.id}`
        : "/api/admin/partners";
      const method = editingPartner ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const saved = await res.json();
        if (editingPartner) {
          setPartners((prev) => prev.map((p) => (p.id === editingPartner.id ? saved : p)));
        } else {
          setPartners((prev) => [...prev, saved]);
        }
        closeModal();
      } else {
        const errData = await res.json();
        setFormError(errData.error || "Failed to save partner.");
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
    if (!confirm(`Are you sure you want to remove partner "${name}"? This cannot be undone.`)) {
      return;
    }
    setBusy((b) => ({ ...b, [id]: true }));
    try {
      const res = await fetch(`/api/admin/partners/${id}`, { method: "DELETE" });
      if (res.ok) {
        setPartners((prev) => prev.filter((p) => p.id !== id));
      } else {
        alert("Failed to delete the partner.");
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
      const res = await fetch(`/api/admin/partners/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order: newOrder }),
      });
      if (res.ok) {
        const updated = await res.json();
        setPartners((prev) =>
          prev.map((p) => (p.id === id ? { ...p, order: updated.order } : p))
        );
      }
    } catch (err) {
      console.error("Failed to update ordering:", err);
    } finally {
      setBusy((b) => ({ ...b, [id]: false }));
    }
  };

  const sortedPartners = useMemo(() => {
    return [...filtered].sort((a, b) => a.order - b.order);
  }, [filtered]);

  if (status === "loading" || loading) {
    return (
      <div className={styles.loadingScreen}>
        <RefreshCw className={styles.spinner} size={28} />
        <p>Syncing partner database…</p>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      {/* HEADER */}
      <header className={styles.header}>
        <div>
          <h1 className={styles.pageTitle}>Partners & Affiliations</h1>
          <p className={styles.pageSubtitle}>
            Manage academic partnerships, research agreements, and international affiliations represented on the Eka portal.
          </p>
        </div>
        <button onClick={openAddModal} className={styles.addBtn}>
          <Plus size={15} /> Add Partner
        </button>
      </header>

      {/* STAT PILLS */}
      <div className={styles.statRow}>
        {([
          { label: "Total Partners", value: stats.total, f: "ALL" },
          { label: "Featured Affiliations", value: stats.featured, f: "FEATURED" },
          { label: "Standard Partners", value: stats.standard, f: "STANDARD" },
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
            placeholder="Search by partner name or website url…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <span className={styles.totalBadge}>
          {sortedPartners.length} partner{sortedPartners.length !== 1 && "s"} found
        </span>
      </div>

      {/* TABLE */}
      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th style={{ width: "80px", textAlign: "center" }}>Order</th>
              <th>Partner</th>
              <th>Website</th>
              <th>Featured</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {sortedPartners.length === 0 ? (
              <tr>
                <td colSpan={5}>
                  <div className={styles.empty}>
                    <Award size={32} style={{ marginBottom: 12, opacity: 0.3 }} />
                    <p>No partners match your filters.</p>
                  </div>
                </td>
              </tr>
            ) : (
              sortedPartners.map((partner) => {
                const isBusy = busy[partner.id] ?? false;

                return (
                  <tr key={partner.id}>
                    {/* ORDERING INPUT */}
                    <td>
                      <div className={styles.orderControl}>
                        <button
                          className={styles.orderArrow}
                          disabled={isBusy}
                          onClick={() => handleOrderChange(partner.id, partner.order - 1)}
                          title="Move up"
                        >
                          <ChevronUp size={12} />
                        </button>
                        <span className={styles.orderVal}>{partner.order}</span>
                        <button
                          className={styles.orderArrow}
                          disabled={isBusy}
                          onClick={() => handleOrderChange(partner.id, partner.order + 1)}
                          title="Move down"
                        >
                          <ChevronDown size={12} />
                        </button>
                      </div>
                    </td>

                    {/* PARTNER CARD INFO & LOGO */}
                    <td className={styles.titleCell}>
                      <div className={styles.partnerCard}>
                        <div className={styles.thumbWrap}>
                          <Image
                            src={partner.logoUrl ?? FALLBACK_LOGO}
                            alt={partner.name}
                            width={36}
                            height={36}
                            className={styles.thumb}
                            unoptimized
                          />
                        </div>
                        <div className={styles.partnerInfoText}>
                          <div className={partner.logoUrl ? styles.partnerName : styles.partnerName}>
                            {partner.name}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* WEBSITE */}
                    <td className={styles.websiteCell}>
                      {partner.website ? (
                        <a
                          href={partner.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={styles.websiteLink}
                        >
                          {partner.website.replace(/^https?:\/\/(www\.)?/, "")} <ExternalLink size={10} />
                        </a>
                      ) : (
                        <span className={styles.noWebsite}>None</span>
                      )}
                    </td>

                    {/* FEATURED STATUS TOGGLE */}
                    <td>
                      <button
                        className={`${styles.iconBtn} ${partner.featured ? styles.iconBtnOn : ""}`}
                        disabled={isBusy}
                        onClick={() => toggleFeatured(partner.id, partner.featured)}
                        title={partner.featured ? "Demote from Featured" : "Promote to Featured"}
                      >
                        <Star size={16} className={partner.featured ? styles.starFilled : styles.starOutline} />
                      </button>
                    </td>

                    {/* ACTIONS */}
                    <td>
                      <div className={styles.actions}>
                        <button
                          onClick={() => openEditModal(partner)}
                          className={styles.editBtn}
                          disabled={isBusy}
                          title="Edit partner"
                        >
                          <Pencil size={12} />
                        </button>
                        <button
                          className={styles.deleteBtn}
                          disabled={isBusy}
                          onClick={() => handleDelete(partner.id, partner.name)}
                          title="Remove partner"
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
                {editingPartner ? (
                  <>
                    <Sparkles size={16} className={styles.titleIcon} /> Update Partner Entry
                  </>
                ) : (
                  <>
                    <Award size={16} className={styles.titleIcon} /> Add Partner Organization
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
                  <label htmlFor="name">Partner Name *</label>
                  <input
                    id="name"
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="e.g. Tribhuvan University"
                  />
                </div>

                <div className={styles.inputGroup}>
                  <label htmlFor="website">Website Link (URL)</label>
                  <input
                    id="website"
                    type="url"
                    value={formWebsite}
                    onChange={(e) => setFormWebsite(e.target.value)}
                    placeholder="e.g. https://tu.edu.np"
                  />
                </div>
              </div>

              <div className={styles.inputGroup}>
                <label>Partner Logo</label>
                <ImageUpload
                  value={formLogoUrl}
                  onChange={setFormLogoUrl}
                  label="Upload Partner Logo"
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
                    <strong>Featured Partner</strong> (If selected, this partner will be highlighted as a key institutional affiliation)
                  </span>
                </label>
              </div>

              <footer className={styles.modalFooter}>
                <button type="button" className={styles.cancelBtn} onClick={closeModal} disabled={modalLoading}>
                  Cancel
                </button>
                <button type="submit" className={styles.saveBtn} disabled={modalLoading}>
                  {modalLoading ? "Saving Changes..." : editingPartner ? "Save Changes" : "Add Partner"}
                </button>
              </footer>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
