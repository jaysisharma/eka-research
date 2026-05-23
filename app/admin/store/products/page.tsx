"use client";

import { useEffect, useState, useMemo } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Plus, Search, RefreshCw, Pencil, Trash2,
  Package, ShoppingBag, Zap,
} from "lucide-react";
import styles from "./page.module.css";

/* ── Types ───────────────────────────────────────────────────────────── */

type ProductCategory = string;

interface Product {
  id:          string;
  slug:        string;
  name:        string;
  tagline:     string;
  category:    ProductCategory;
  priceNpr:    number;
  badge:       string | null;
  inStock:     boolean;
  digital:     boolean;
  imageUrl:    string | null;
  gradient?:   string;
  createdAt:   string;
  _count:      { orderItems: number };
}

/* ── Constants ───────────────────────────────────────────────────────── */

const CATEGORY_LABEL: Record<string, string> = {
  apparel:     "Apparel",
  educational: "Educational",
  kits:        "Kits",
  digital:     "Digital",
};

const CATEGORY_CLS: Record<string, string> = {
  apparel:     styles.catApparel,
  educational: styles.catEducational,
  kits:        styles.catKits,
  digital:     styles.catDigital,
};

/* ── Component ───────────────────────────────────────────────────────── */

export default function AdminProductsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [search,   setSearch]   = useState("");
  const [catFilter, setCatFilter] = useState<ProductCategory | "ALL">("ALL");
  const [busy,     setBusy]     = useState<Record<string, boolean>>({});
  const [deleteErr, setDeleteErr] = useState<Record<string, string>>({});

  useEffect(() => {
    if (status === "unauthenticated") router.push("/auth/login");
    else if (status === "authenticated" && session?.user?.role !== "ADMIN") router.push("/dashboard");
  }, [status, session, router]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res  = await fetch("/api/admin/store/products");
      const data = await res.json();
      setProducts(Array.isArray(data) ? data : []);
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchProducts(); }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return products.filter((p) => {
      const matchSearch = !q ||
        p.name.toLowerCase().includes(q) ||
        p.tagline.toLowerCase().includes(q) ||
        p.slug.toLowerCase().includes(q);
      const matchCat = catFilter === "ALL" || p.category === catFilter;
      return matchSearch && matchCat;
    });
  }, [products, search, catFilter]);

  const stats = useMemo(() => ({
    total:    products.length,
    inStock:  products.filter((p) => p.inStock).length,
    outStock: products.filter((p) => !p.inStock).length,
    digital:  products.filter((p) => p.digital).length,
  }), [products]);

  /* toggle inStock */
  const toggleStock = async (id: string, inStock: boolean) => {
    setBusy((b) => ({ ...b, [id]: true }));
    try {
      const res = await fetch(`/api/admin/store/products/${id}`, {
        method:  "PATCH",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ inStock: !inStock }),
      });
      if (res.ok) setProducts((prev) =>
        prev.map((p) => p.id === id ? { ...p, inStock: !inStock } : p)
      );
    } finally { setBusy((b) => ({ ...b, [id]: false })); }
  };

  /* delete */
  const deleteProduct = async (id: string) => {
    if (!confirm("Delete this product?")) return;
    setBusy((b) => ({ ...b, [id]: true }));
    setDeleteErr((e) => { const n = { ...e }; delete n[id]; return n; });
    try {
      const res  = await fetch(`/api/admin/store/products/${id}`, { method: "DELETE" });
      const data = await res.json() as { ok?: boolean; error?: string };
      if (res.ok) {
        setProducts((prev) => prev.filter((p) => p.id !== id));
      } else {
        setDeleteErr((e) => ({ ...e, [id]: data.error ?? "Delete failed." }));
      }
    } finally { setBusy((b) => ({ ...b, [id]: false })); }
  };

  if (status === "loading" || loading) {
    return (
      <div className={styles.loadingScreen}>
        <RefreshCw className={styles.spinner} size={28} />
        <p>Loading products…</p>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      {/* HEADER */}
      <header className={styles.header}>
        <div>
          <h1 className={styles.pageTitle}>Products</h1>
          <p className={styles.pageSubtitle}>
            Manage store inventory — apparel, kits, educational materials, and digital downloads.
          </p>
        </div>
        <Link href="/admin/store/products/new" className={styles.addBtn}>
          <Plus size={15} /> Add Product
        </Link>
      </header>

      {/* STAT PILLS */}
      <div className={styles.statRow}>
        {([
          { label: "All",       value: stats.total,    f: "ALL",         icon: <Package size={13}/> },
          { label: "In Stock",  value: stats.inStock,  f: "ALL",         icon: null },
          { label: "Out",       value: stats.outStock, f: "ALL",         icon: null },
          { label: "Digital",   value: stats.digital,  f: "digital",     icon: <Zap size={13}/> },
        ] as const).map(({ label, value, f, icon }, i) => (
          <div key={i} className={`${styles.statPill} ${catFilter === f && i === 0 ? styles.statPillActive : ""}`}
            onClick={() => i === 0 && setCatFilter("ALL")}>
            {icon}
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
            placeholder="Search name or slug…"
            value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>

        <div className={styles.catFilters}>
          {(["ALL", "apparel", "educational", "kits", "digital"] as const).map((c) => (
            <button key={c}
              className={`${styles.catBtn} ${catFilter === c ? styles.catBtnActive : ""}`}
              onClick={() => setCatFilter(c)}>
              {c === "ALL" ? "All" : CATEGORY_LABEL[c]}
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
              <th>Product</th>
              <th>Category</th>
              <th>Price</th>
              <th>Orders</th>
              <th>Stock</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6}>
                  <div className={styles.empty}>
                    <ShoppingBag size={32} style={{ marginBottom: 12, opacity: 0.3 }} />
                    <p>No products match your filter.</p>
                  </div>
                </td>
              </tr>
            ) : filtered.map((product) => {
              const isBusy = busy[product.id] ?? false;
              return (
                <tr key={product.id}>
                  {/* PRODUCT */}
                  <td className={styles.productCell}>
                    <div className={styles.productThumb}
                      style={{ background: product.imageUrl ? undefined : product.gradient }}>
                      {product.imageUrl && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={product.imageUrl} alt={product.name} className={styles.thumbImg} />
                      )}
                    </div>
                    <div className={styles.productInfo}>
                      <div className={styles.productName}>
                        {product.name}
                        {product.badge && (
                          <span className={styles.badgePill}>{product.badge}</span>
                        )}
                        {product.digital && (
                          <span className={`${styles.badgePill} ${styles.badgeDigital}`}>
                            <Zap size={9} /> Digital
                          </span>
                        )}
                      </div>
                      <div className={styles.productTagline}>{product.tagline}</div>
                      <div className={styles.productSlug}>/{product.slug}</div>
                      {deleteErr[product.id] && (
                        <div className={styles.deleteErrLine}>{deleteErr[product.id]}</div>
                      )}
                    </div>
                  </td>

                  {/* CATEGORY */}
                  <td>
                    <span className={`${styles.catBadge} ${CATEGORY_CLS[product.category] ?? ""}`}>
                      {CATEGORY_LABEL[product.category] ?? product.category}
                    </span>
                  </td>

                  {/* PRICE */}
                  <td className={styles.priceCell}>
                    NPR {product.priceNpr.toLocaleString("en-NP")}
                  </td>

                  {/* ORDERS */}
                  <td className={styles.ordersCell}>
                    {product._count.orderItems}
                  </td>

                  {/* STOCK */}
                  <td>
                    <button
                      disabled={isBusy}
                      onClick={() => toggleStock(product.id, product.inStock)}
                      className={`${styles.stockBtn} ${product.inStock ? styles.stockOn : styles.stockOff}`}
                    >
                      {product.inStock ? "In Stock" : "Out of Stock"}
                    </button>
                  </td>

                  {/* ACTIONS */}
                  <td>
                    <div className={styles.actions}>
                      <Link href={`/admin/store/products/${product.id}/edit`} className={styles.editBtn}>
                        <Pencil size={12} />
                      </Link>
                      <button className={styles.deleteBtn} disabled={isBusy}
                        onClick={() => deleteProduct(product.id)}>
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
