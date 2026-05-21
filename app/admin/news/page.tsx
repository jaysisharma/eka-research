"use client";

import { useEffect, useState, useMemo } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  Plus, Search, RefreshCw, CheckCircle, Eye, EyeOff,
  Pencil, Trash2, Newspaper, Star, Sparkles,
} from "lucide-react";
import styles from "./page.module.css";

/* ── Types & Categories ────────────────────────────────────────────────── */

type Category = "announcement" | "publication" | "milestone" | "event" | "media";

interface NewsPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  date: string;
  imageUrl: string | null;
  href: string;
  featured: boolean;
  published: boolean;
}

const CATEGORY_LABEL: Record<string, string> = {
  announcement: "Announcement",
  publication: "Publication",
  milestone: "Milestone",
  event: "Event",
  media: "Media",
};

const CATEGORY_STYLE: Record<string, string> = {
  announcement: styles.catAnnouncement,
  publication: styles.catPublication,
  milestone: styles.catMilestone,
  event: styles.catEvent,
  media: styles.catMedia,
};

const FALLBACK_IMG =
  "https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?auto=format&fit=crop&w=120&q=80";

type FilterType = "ALL" | "PUBLISHED" | "DRAFT" | "FEATURED";

export default function AdminNewsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [posts, setPosts] = useState<NewsPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterType>("ALL");
  const [busy, setBusy] = useState<Record<string, boolean>>({});

  /* Auth Guard */
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
    } else if (status === "authenticated" && session?.user?.role !== "ADMIN") {
      router.push("/dashboard");
    }
  }, [status, session, router]);

  /* Fetch posts */
  const fetchPosts = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/news");
      if (res.ok) {
        const data = await res.json();
        setPosts(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error("Error fetching news posts:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  /* Filter and search derived state */
  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return posts.filter((p) => {
      const matchSearch =
        !q ||
        p.title.toLowerCase().includes(q) ||
        p.excerpt.toLowerCase().includes(q) ||
        (CATEGORY_LABEL[p.category] || "").toLowerCase().includes(q);

      let matchFilter = true;
      if (filter === "PUBLISHED") matchFilter = p.published;
      else if (filter === "DRAFT") matchFilter = !p.published;
      else if (filter === "FEATURED") matchFilter = p.featured;

      return matchSearch && matchFilter;
    });
  }, [posts, search, filter]);

  /* Metrics counts */
  const stats = useMemo(() => ({
    total: posts.length,
    published: posts.filter((p) => p.published).length,
    drafts: posts.filter((p) => !p.published).length,
    featured: posts.filter((p) => p.featured).length,
  }), [posts]);

  /* Toggles */
  const toggleFeatured = async (id: string, current: boolean) => {
    setBusy((b) => ({ ...b, [id]: true }));
    try {
      const res = await fetch(`/api/admin/news/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ featured: !current }),
      });
      if (res.ok) {
        const updated = await res.json();
        setPosts((prev) => prev.map((p) => (p.id === id ? { ...p, featured: updated.featured } : p)));
      }
    } finally {
      setBusy((b) => ({ ...b, [id]: false }));
    }
  };

  const togglePublished = async (id: string, current: boolean) => {
    setBusy((b) => ({ ...b, [id]: true }));
    try {
      const res = await fetch(`/api/admin/news/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ published: !current }),
      });
      if (res.ok) {
        const updated = await res.json();
        setPosts((prev) => prev.map((p) => (p.id === id ? { ...p, published: updated.published } : p)));
      }
    } finally {
      setBusy((b) => ({ ...b, [id]: false }));
    }
  };

  /* Deletion */
  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"? This cannot be undone.`)) {
      return;
    }
    setBusy((b) => ({ ...b, [id]: true }));
    try {
      const res = await fetch(`/api/admin/news/${id}`, { method: "DELETE" });
      if (res.ok) {
        setPosts((prev) => prev.filter((p) => p.id !== id));
      } else {
        alert("Failed to delete the article.");
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
        <p>Loading news updates…</p>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      {/* HEADER */}
      <header className={styles.header}>
        <div>
          <h1 className={styles.pageTitle}>News Feed Console</h1>
          <p className={styles.pageSubtitle}>
            Publish and manage news updates, press releases, events, and scientific milestone announcements.
          </p>
        </div>
        <Link href="/admin/news/new" className={styles.addBtn}>
          <Plus size={15} /> Write News Post
        </Link>
      </header>

      {/* STAT PILLS */}
      <div className={styles.statRow}>
        {([
          { label: "Total Posts", value: stats.total, f: "ALL" },
          { label: "Published", value: stats.published, f: "PUBLISHED" },
          { label: "Drafts", value: stats.drafts, f: "DRAFT" },
          { label: "Featured", value: stats.featured, f: "FEATURED" },
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
            placeholder="Search title, category, or summary…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <span className={styles.totalBadge}>
          {filtered.length} article{filtered.length !== 1 && "s"} found
        </span>
      </div>

      {/* TABLE */}
      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Article</th>
              <th>Category</th>
              <th>Publish Date</th>
              <th>Featured</th>
              <th>Visibility</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6}>
                  <div className={styles.empty}>
                    <Newspaper size={32} style={{ marginBottom: 12, opacity: 0.3 }} />
                    <p>No news articles match your selection.</p>
                  </div>
                </td>
              </tr>
            ) : (
              filtered.map((post) => {
                const isBusy = busy[post.id] ?? false;

                return (
                  <tr key={post.id}>
                    {/* ARTICLE INFO & IMAGE */}
                    <td className={styles.titleCell}>
                      <div className={styles.articleCard}>
                        <div className={styles.thumbWrap}>
                          <Image
                            src={post.imageUrl ?? FALLBACK_IMG}
                            alt={post.title}
                            width={40}
                            height={40}
                            className={styles.thumb}
                          />
                        </div>
                        <div>
                          <div className={styles.articleTitle}>{post.title}</div>
                          <div className={styles.articleExcerpt} title={post.excerpt}>
                            {post.excerpt}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* CATEGORY */}
                    <td>
                      <span className={`${styles.catBadge} ${CATEGORY_STYLE[post.category] ?? ""}`}>
                        {CATEGORY_LABEL[post.category] ?? post.category}
                      </span>
                    </td>

                    {/* DATE */}
                    <td className={styles.dateCell}>
                      {post.date}
                    </td>

                    {/* FEATURED STATUS */}
                    <td>
                      <button
                        className={`${styles.iconBtn} ${post.featured ? styles.iconBtnOn : ""}`}
                        disabled={isBusy}
                        onClick={() => toggleFeatured(post.id, post.featured)}
                        title={post.featured ? "Unfeature this article" : "Feature this article"}
                      >
                        <Star size={16} className={post.featured ? styles.starFilled : styles.starOutline} />
                      </button>
                    </td>

                    {/* PUBLISHED / VISIBILITY STATUS */}
                    <td>
                      <button
                        className={`${styles.statusBadge} ${post.published ? styles.statusPub : styles.statusDraft}`}
                        disabled={isBusy}
                        onClick={() => togglePublished(post.id, post.published)}
                        title={post.published ? "Switch to Draft" : "Publish article"}
                      >
                        {post.published ? (
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
                        <Link href={`/admin/news/${post.id}/edit`} className={styles.editBtn}>
                          <Pencil size={12} />
                        </Link>
                        <button
                          className={styles.deleteBtn}
                          disabled={isBusy}
                          onClick={() => handleDelete(post.id, post.title)}
                          title="Delete news article"
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
    </div>
  );
}
