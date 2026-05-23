"use client";

import { useEffect, useState, useMemo } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  Plus, Search, RefreshCw, Pencil, Trash2,
  Image as ImageIcon, Star, Sparkles, X, Eye, EyeOff,
  ChevronDown, Settings
} from "lucide-react";
import styles from "./page.module.css";
import ImageUpload from "@/components/ui/ImageUpload";

interface GalleryImage {
  id: string;
  title: string;
  description: string | null;
  imageUrl: string;
  category: string;
  featured: boolean;
  published: boolean;
  createdAt: string;
  updatedAt: string;
}

const CATEGORY_LABELS: Record<string, string> = {
  astrophotography: "Astrophotography",
  research: "Research Operations",
  facilities: "Facilities & Labs",
  community: "Community & Outreach",
};

const CATEGORY_OPTIONS = [
  { value: "astrophotography", label: "Astrophotography" },
  { value: "research", label: "Research Operations" },
  { value: "facilities", label: "Facilities & Labs" },
  { value: "community", label: "Community & Outreach" },
];

const FALLBACK_IMG =
  "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=120&q=80";

type FilterType = "ALL" | "PUBLISHED" | "DRAFT" | "FEATURED" | "ASTROPHOTOGRAPHY" | "RESEARCH" | "FACILITIES" | "COMMUNITY";

export default function AdminGalleryPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterType>("ALL");
  const [busy, setBusy] = useState<Record<string, boolean>>({});

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingImage, setEditingImage] = useState<GalleryImage | null>(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [formError, setFormError] = useState("");
  const [advancedOpen, setAdvancedOpen] = useState(false);

  // Form State
  const [formTitle, setFormTitle] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formImageUrl, setFormImageUrl] = useState("");
  const [formCategory, setFormCategory] = useState("astrophotography");
  const [formFeatured, setFormFeatured] = useState(false);
  const [formPublished, setFormPublished] = useState(true);

  /* Auth Guard */
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
    } else if (status === "authenticated" && session?.user?.role !== "ADMIN") {
      router.push("/dashboard");
    }
  }, [status, session, router]);

  /* Fetch Gallery Images */
  const fetchImages = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/gallery");
      if (res.ok) {
        const data = await res.json();
        setImages(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error("Error fetching gallery images:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchImages();
  }, []);

  /* Filter and search derived state */
  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return images.filter((img) => {
      const matchSearch =
        !q ||
        img.title.toLowerCase().includes(q) ||
        (img.description || "").toLowerCase().includes(q) ||
        (CATEGORY_LABELS[img.category] || "").toLowerCase().includes(q);

      let matchFilter = true;
      if (filter === "PUBLISHED") matchFilter = img.published;
      else if (filter === "DRAFT") matchFilter = !img.published;
      else if (filter === "FEATURED") matchFilter = img.featured;
      else if (filter === "ASTROPHOTOGRAPHY") matchFilter = img.category === "astrophotography";
      else if (filter === "RESEARCH") matchFilter = img.category === "research";
      else if (filter === "FACILITIES") matchFilter = img.category === "facilities";
      else if (filter === "COMMUNITY") matchFilter = img.category === "community";

      return matchSearch && matchFilter;
    });
  }, [images, search, filter]);

  /* Metrics counts */
  const stats = useMemo(() => ({
    total: images.length,
    published: images.filter((img) => img.published).length,
    drafts: images.filter((img) => !img.published).length,
    featured: images.filter((img) => img.featured).length,
  }), [images]);

  /* Toggle Featured */
  const toggleFeatured = async (id: string, current: boolean) => {
    setBusy((b) => ({ ...b, [id]: true }));
    try {
      const res = await fetch(`/api/admin/gallery/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ featured: !current }),
      });
      if (res.ok) {
        const updated = await res.json();
        setImages((prev) =>
          prev.map((img) => (img.id === id ? { ...img, featured: updated.featured } : img))
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
      const res = await fetch(`/api/admin/gallery/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ published: !current }),
      });
      if (res.ok) {
        const updated = await res.json();
        setImages((prev) =>
          prev.map((img) => (img.id === id ? { ...img, published: updated.published } : img))
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
    setEditingImage(null);
    setFormTitle("");
    setFormDescription("");
    setFormImageUrl("");
    setFormCategory("astrophotography");
    setFormFeatured(false);
    setFormPublished(true);
    setFormError("");
    setModalOpen(true);
  };

  /* Open modal for editing */
  const openEditModal = (image: GalleryImage) => {
    setEditingImage(image);
    setFormTitle(image.title);
    setFormDescription(image.description || "");
    setFormImageUrl(image.imageUrl);
    setFormCategory(image.category);
    setFormFeatured(image.featured);
    setFormPublished(image.published);
    setFormError("");
    setModalOpen(true);
  };

  /* Close Modal */
  const closeModal = () => {
    setModalOpen(false);
    setEditingImage(null);
  };

  /* Handle Form Submit (Create/Update) */
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!formTitle.trim()) {
      setFormError("Image title is required.");
      return;
    }
    if (!formImageUrl.trim()) {
      setFormError("An image must be uploaded or paste a direct URL.");
      return;
    }

    setModalLoading(true);

    const payload = {
      title: formTitle.trim(),
      description: formDescription.trim() || null,
      imageUrl: formImageUrl.trim(),
      category: formCategory,
      featured: formFeatured,
      published: formPublished,
    };

    try {
      const url = editingImage
        ? `/api/admin/gallery/${editingImage.id}`
        : "/api/admin/gallery";
      const method = editingImage ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const saved = await res.json();
        if (editingImage) {
          setImages((prev) => prev.map((img) => (img.id === editingImage.id ? saved : img)));
        } else {
          setImages((prev) => [saved, ...prev]);
        }
        closeModal();
      } else {
        const errData = await res.json();
        setFormError(errData.error || "Failed to save gallery entry.");
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
    if (!confirm(`Are you sure you want to remove the image "${title}" from the gallery? This cannot be undone.`)) {
      return;
    }
    setBusy((b) => ({ ...b, [id]: true }));
    try {
      const res = await fetch(`/api/admin/gallery/${id}`, { method: "DELETE" });
      if (res.ok) {
        setImages((prev) => prev.filter((img) => img.id !== id));
      } else {
        alert("Failed to delete the gallery image.");
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
        <p>Syncing gallery database…</p>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      {/* HEADER */}
      <header className={styles.header}>
        <div>
          <h1 className={styles.pageTitle}>Science Gallery Console</h1>
          <p className={styles.pageSubtitle}>
            Publish stellar astrophotography, operational research images, observatories, and community outreach snapshots.
          </p>
        </div>
        <button onClick={openAddModal} className={styles.addBtn}>
          <Plus size={15} /> Add Gallery Image
        </button>
      </header>

      {/* STAT PILLS */}
      <div className={styles.statRow}>
        {([
          { label: "Total Images", value: stats.total, f: "ALL" },
          { label: "Published", value: stats.published, f: "PUBLISHED" },
          { label: "Drafts", value: stats.drafts, f: "DRAFT" },
          { label: "Featured Highlights", value: stats.featured, f: "FEATURED" },
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
            placeholder="Search by title, category, or description…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <span className={styles.totalBadge}>
          {filtered.length} image{filtered.length !== 1 && "s"} found
        </span>
      </div>

      {/* TABLE */}
      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Image details</th>
              <th>Category</th>
              <th>Featured</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={5}>
                  <div className={styles.empty}>
                    <ImageIcon size={32} style={{ marginBottom: 12, opacity: 0.3 }} />
                    <p>No gallery images match your current filters.</p>
                  </div>
                </td>
              </tr>
            ) : (
              filtered.map((img) => {
                const isBusy = busy[img.id] ?? false;

                return (
                  <tr key={img.id}>
                    {/* GALLERY INFO CARD & THUMB */}
                    <td className={styles.titleCell}>
                      <div className={styles.galleryCard}>
                        <div className={styles.thumbWrap}>
                          <Image
                            src={img.imageUrl || FALLBACK_IMG}
                            alt={img.title}
                            fill
                            sizes="72px"
                            className={styles.thumb}
                            unoptimized
                          />
                        </div>
                        <div>
                          <div className={styles.imageTitle}>{img.title}</div>
                          {img.description && (
                            <div className={styles.imageDesc} title={img.description}>
                              {img.description}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* CATEGORY */}
                    <td>
                      <span className={styles.categoryBadge}>
                        {CATEGORY_LABELS[img.category] || img.category}
                      </span>
                    </td>

                    {/* FEATURED STATUS TOGGLE */}
                    <td>
                      <button
                        className={`${styles.iconBtn} ${img.featured ? styles.iconBtnOn : ""}`}
                        disabled={isBusy}
                        onClick={() => toggleFeatured(img.id, img.featured)}
                        title={img.featured ? "Demote from Featured" : "Promote to Featured"}
                      >
                        <Star size={16} className={img.featured ? styles.starFilled : styles.starOutline} />
                      </button>
                    </td>

                    {/* PUBLISHED VISIBILITY STATUS */}
                    <td>
                      <button
                        className={`${styles.statusBadge} ${img.published ? styles.statusPublished : styles.statusDraft}`}
                        disabled={isBusy}
                        onClick={() => togglePublished(img.id, img.published)}
                        title={img.published ? "Change to Draft" : "Publish Image"}
                      >
                        {img.published ? (
                          <>
                            <Eye size={12} />
                            <span>Published</span>
                          </>
                        ) : (
                          <>
                            <EyeOff size={12} />
                            <span>Draft</span>
                          </>
                        )}
                      </button>
                    </td>

                    {/* ACTIONS */}
                    <td>
                      <div className={styles.actions}>
                        <button
                          onClick={() => openEditModal(img)}
                          className={styles.editBtn}
                          disabled={isBusy}
                          title="Edit metadata"
                        >
                          <Pencil size={12} />
                        </button>
                        <button
                          className={styles.deleteBtn}
                          disabled={isBusy}
                          onClick={() => handleDelete(img.id, img.title)}
                          title="Remove image"
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
                {editingImage ? (
                  <>
                    <Sparkles size={16} className={styles.titleIcon} /> Update Gallery Image
                  </>
                ) : (
                  <>
                    <ImageIcon size={16} className={styles.titleIcon} /> Add Gallery Image
                  </>
                )}
              </h2>
              <button className={styles.closeBtn} onClick={closeModal} aria-label="Close modal">
                <X size={16} />
              </button>
            </header>

            <form onSubmit={handleFormSubmit} className={styles.form}>
              {formError && <div className={styles.formError}>{formError}</div>}

              {/* 1. Large focal upload zone at the top */}
              <div className={styles.inputGroup}>
                <label>Media File *</label>
                <ImageUpload
                  value={formImageUrl}
                  onChange={setFormImageUrl}
                  label="Upload Image File"
                />
              </div>

              {/* 2. Symmetric two-column metadata inputs */}
              <div className={styles.formGrid}>
                <div className={styles.inputGroup}>
                  <label htmlFor="title">Image Title *</label>
                  <input
                    id="title"
                    type="text"
                    required
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    placeholder="e.g. Geminids meteor shower over Langtang"
                  />
                </div>

                <div className={styles.inputGroup}>
                  <label htmlFor="category">Gallery Category *</label>
                  <select
                    id="category"
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                  >
                    {CATEGORY_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* 3. Collapsible Advanced Settings */}
              <div className={styles.advancedSection}>
                <button
                  type="button"
                  onClick={() => setAdvancedOpen(!advancedOpen)}
                  className={styles.advancedToggle}
                >
                  <div className={styles.advancedToggleLeft}>
                    <Settings size={14} className={styles.advancedIcon} />
                    <span>Advanced Details &amp; Visibility</span>
                  </div>
                  <ChevronDown
                    size={14}
                    style={{
                      transform: advancedOpen ? "rotate(180deg)" : "rotate(0deg)",
                      transition: "transform 0.2s ease",
                    }}
                  />
                </button>

                {advancedOpen && (
                  <div className={styles.advancedContent}>
                    <div className={styles.inputGroup}>
                      <label htmlFor="description">Context Backstory (Optional)</label>
                      <textarea
                        id="description"
                        rows={3.5}
                        value={formDescription}
                        onChange={(e) => setFormDescription(e.target.value)}
                        placeholder="Provide technical context (e.g. camera, exposure) or scientific details..."
                        style={{ resize: "none" }}
                      />
                    </div>

                    <div style={{ display: "flex", gap: "24px", padding: "12px 0 4px 0", borderTop: "1px dashed var(--border-default)" }}>
                      <label className={styles.toggleLabel}>
                        <input
                          type="checkbox"
                          checked={formPublished}
                          onChange={(e) => setFormPublished(e.target.checked)}
                        />
                        <span className={styles.toggleText}>
                          <strong>Visible on live feed</strong>
                        </span>
                      </label>

                      <label className={styles.toggleLabel}>
                        <input
                          type="checkbox"
                          checked={formFeatured}
                          onChange={(e) => setFormFeatured(e.target.checked)}
                        />
                        <span className={styles.toggleText}>
                          <strong>Featured highlight</strong>
                        </span>
                      </label>
                    </div>
                  </div>
                )}
              </div>

              <footer className={styles.modalFooter}>
                <button type="button" className={styles.cancelBtn} onClick={closeModal} disabled={modalLoading}>
                  Cancel
                </button>
                <button type="submit" className={styles.saveBtn} disabled={modalLoading}>
                  {modalLoading ? "Saving Changes..." : editingImage ? "Save Changes" : "Publish Image"}
                </button>
              </footer>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
