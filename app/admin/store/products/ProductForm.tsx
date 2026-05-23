"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, ChevronRight, RefreshCw, Plus, X, AlertCircle, Wand2 } from "lucide-react";
import styles from "./form.module.css";
import ImageUpload from "@/components/ui/ImageUpload";

/* ── Types ───────────────────────────────────────────────────────────── */

export type ProductCategory = string;

export type VariantGroup = {
  name: string;
  options: string;   // comma-separated; parsed to string[] on save
};

export type ProductFormData = {
  name: string;
  slug: string;
  tagline: string;
  category: ProductCategory;
  priceNpr: string;
  description: string;
  includes: string;   // one item per line
  variants: VariantGroup[];
  badge: string;
  inStock: boolean;
  digital: boolean;
  imageUrl: string;
};

export const BLANK_FORM: ProductFormData = {
  name: "", slug: "", tagline: "", category: "apparel",
  priceNpr: "", description: "", includes: "",
  variants: [], badge: "", inStock: true, digital: false,
  imageUrl: "",
};

export const CATEGORIES: { value: ProductCategory; label: string }[] = [
  { value: "apparel", label: "Apparel" },
  { value: "educational", label: "Educational" },
  { value: "kits", label: "Kits" },
  { value: "digital", label: "Digital" },
];

/* ── Helpers ─────────────────────────────────────────────────────────── */

const slugify = (s: string) =>
  s.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

/* ── Toggle switch ───────────────────────────────────────────────────── */

function Toggle({ on, onChange, label, sub }: {
  on: boolean; onChange: () => void; label: string; sub?: string;
}) {
  return (
    <div className={styles.toggleItem}>
      <div>
        <div className={styles.toggleLabel}>{label}</div>
        {sub && <div className={styles.toggleSub}>{sub}</div>}
      </div>
      <button
        type="button" role="switch" aria-checked={on}
        className={`${styles.switchTrack} ${on ? styles.switchOn : ""}`}
        onClick={onChange}
      >
        <span className={styles.switchKnob} />
      </button>
    </div>
  );
}

/* ── Variant group builder ───────────────────────────────────────────── */

function VariantBuilder({
  groups, onChange,
}: {
  groups: VariantGroup[];
  onChange: (next: VariantGroup[]) => void;
}) {
  const add = () => onChange([...groups, { name: "", options: "" }]);
  const remove = (i: number) => onChange(groups.filter((_, idx) => idx !== i));
  const set = (i: number, key: keyof VariantGroup, val: string) =>
    onChange(groups.map((g, idx) => idx === i ? { ...g, [key]: val } : g));

  return (
    <div className={styles.variantBuilder}>
      {groups.map((g, i) => (
        <div key={i} className={styles.variantGroup}>
          <div className={styles.variantGroupRow}>
            <input
              className={`${styles.input} ${styles.variantNameInput}`}
              placeholder="Group name e.g. Size, Colour"
              value={g.name}
              onChange={(e) => set(i, "name", e.target.value)}
            />
            <button type="button" className={styles.variantRemove} onClick={() => remove(i)}>
              <X size={13} />
            </button>
          </div>
          <input
            className={styles.input}
            placeholder="Options — comma separated: S, M, L, XL"
            value={g.options}
            onChange={(e) => set(i, "options", e.target.value)}
          />
        </div>
      ))}
      <button type="button" className={styles.addVariantBtn} onClick={add}>
        <Plus size={12} /> Add variant group
      </button>
    </div>
  );
}

/* ── Main form ───────────────────────────────────────────────────────── */

interface Props {
  mode: "new" | "edit";
  form: ProductFormData;
  saving: boolean;
  error?: string;
  onChange: (key: keyof ProductFormData, value: ProductFormData[keyof ProductFormData]) => void;
  onSave: () => void;
}

export default function ProductForm({ mode, form, saving, error, onChange, onSave }: Props) {

  /* Auto-generate slug from name silently for new products */
  useEffect(() => {
    if (mode === "new" && form.name) {
      onChange("slug", slugify(form.name));
    }
  }, [form.name, mode]); // eslint-disable-line react-hooks/exhaustive-deps

  const str = (key: keyof ProductFormData) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      onChange(key, e.target.value);
  const bool = (key: "inStock" | "digital") => () => onChange(key, !form[key]);

  return (
    <div className={styles.shell}>

      {/* ── TOPBAR ── */}
      <header className={styles.topBar}>
        <div className={styles.topBarLeft}>
          <Link href="/admin/store/products" className={styles.backBtn}>
            <ArrowLeft size={14} /> Products
          </Link>
          <ChevronRight size={12} className={styles.breadSep} />
          <span className={styles.topBarTitle}>
            {mode === "new" ? "New Product" : "Edit Product"}
          </span>
        </div>
        <div className={styles.topBarRight}>
          <Link href="/admin/store/products" className={styles.cancelBtn}>Cancel</Link>
          <button className={styles.saveBtn} onClick={onSave} disabled={saving}>
            {saving
              ? <><RefreshCw size={13} className={styles.spinSm} /> Saving…</>
              : mode === "new" ? "Add Product" : "Save Changes"}
          </button>
        </div>
      </header>

      {/* ── UNIFIED BODY ── */}
      <div className={styles.body}>

        {/* LEFT COLUMN: Main Form Details */}
        <div className={styles.main}>
          {error && (
            <div className={styles.errorBanner} style={{ marginBottom: "20px" }}>
              <AlertCircle size={14} /> {error}
            </div>
          )}

          <div className={styles.mainCard}>
            {/* 1. Cover/Product Image Banner */}
            <div className={styles.section} style={{ padding: "24px 32px" }}>
              <div className={styles.field}>
                <label className={styles.label}>Product Image</label>
                <ImageUpload
                  value={form.imageUrl || ""}
                  onChange={(url) => onChange("imageUrl", url)}
                  label="Upload Product Image"
                />
                <span className={styles.hint}>
                  Supports PNG, JPG, WebP. Recommended: 800x800px square frame.
                </span>
              </div>
            </div>

            {/* 2. Core Information */}
            <div className={styles.section}>
              <div className={styles.fields}>
                <div className={styles.field}>
                  <label className={styles.label}>
                    Product Name <span className={styles.req}>*</span>
                  </label>
                  <input
                    className={styles.input}
                    value={form.name}
                    onChange={str("name")}
                    placeholder="e.g. Eka Observation Hoodie"
                    style={{ fontSize: "16px", fontWeight: "600", padding: "12px 16px" }}
                  />
                </div>

                <div className={styles.field} style={{ marginTop: "14px" }}>
                  <label className={styles.label}>
                    Tagline <span className={styles.req}>*</span>
                  </label>
                  <input
                    className={styles.input}
                    value={form.tagline}
                    onChange={str("tagline")}
                    placeholder="A catchy, one-line pitch shown on catalog cards..."
                  />
                </div>

                <div className={styles.field} style={{ marginTop: "14px" }}>
                  <label className={styles.label}>
                    Description <span className={styles.req}>*</span>
                  </label>
                  <textarea
                    className={styles.textarea}
                    value={form.description}
                    onChange={str("description")}
                    placeholder="Provide a comprehensive product description including material quality, fit, educational contents, or digital specifications..."
                    style={{ minHeight: "260px", resize: "none", fontSize: "14px", lineHeight: "1.7" }}
                  />
                </div>
              </div>
            </div>

            {/* 3. Included Items */}
            <div className={styles.section}>
              <div className={styles.fields}>
                <div className={styles.field}>
                  <label className={styles.label}>Included Items / Package Contents</label>
                  <textarea
                    className={styles.textarea}
                    value={form.includes}
                    onChange={str("includes")}
                    placeholder={"e.g.\n1× Nepal Sky Map (A2 Poster)\n1× Red-light Observation Torch\nObserver Guideline Leaflet"}
                    style={{ minHeight: "120px", resize: "none", fontSize: "14px", lineHeight: "1.6" }}
                  />
                  <span className={styles.hint}>
                    Specify items one per line. These will render as a beautiful premium bulleted checklist.
                  </span>
                </div>
              </div>
            </div>

            {/* 4. Product Variants */}
            <div className={styles.section}>
              <div className={styles.fields}>
                <div className={styles.field}>
                  <label className={styles.label} style={{ marginBottom: "10px" }}>Variant Options Matrix</label>
                  <VariantBuilder
                    groups={form.variants}
                    onChange={(v) => onChange("variants", v)}
                  />
                  <span className={styles.hint} style={{ marginTop: "6px" }}>
                    Configure groups like 'Size' (e.g. S, M, L, XL) or 'Colour' (e.g. Navy Blue, Matte Black) to let buyers select their preferences.
                  </span>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* RIGHT COLUMN: Sidebar Settings */}
        <aside className={styles.sidebar}>

          {/* Card 1: Pricing & Classification */}
          <div className={styles.card}>
            <div className={styles.cardTitle}>Pricing &amp; Details</div>

            <div className={styles.field}>
              <label className={styles.label}>
                Price (NPR) <span className={styles.req}>*</span>
              </label>
              <div className={styles.priceWrap}>
                <span className={styles.pricePre}>NPR</span>
                <input
                  className={`${styles.input} ${styles.priceInput}`}
                  type="number"
                  min="0"
                  step="1"
                  value={form.priceNpr}
                  onChange={str("priceNpr")}
                  placeholder="0"
                />
              </div>
            </div>

            <div className={styles.field} style={{ marginTop: "8px" }}>
              <label className={styles.label}>
                Category <span className={styles.req}>*</span>
              </label>
              <input
                className={styles.input}
                list="category-suggestions"
                value={form.category}
                onChange={(e) => onChange("category", e.target.value)}
                placeholder="e.g. Apparel, Educational, Kits…"
              />
              <datalist id="category-suggestions">
                {CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value} />
                ))}
              </datalist>
            </div>

            <div className={styles.field} style={{ marginTop: "8px" }}>
              <label className={styles.label}>Badge Label</label>
              <input
                className={styles.input}
                value={form.badge}
                onChange={str("badge")}
                placeholder="e.g. Popular, Limited, Sale"
              />
              <span className={styles.hint}>Optional callout shown on catalog cards</span>
            </div>
          </div>

          {/* Card 2: Availability & Switches */}
          <div className={styles.card}>
            <div className={styles.cardTitle}>Status &amp; Delivery</div>

            <Toggle
              on={form.inStock}
              onChange={bool("inStock")}
              label="In Stock"
              sub="Available to purchase immediately"
            />

            <div className={styles.toggleDivider} />

            <Toggle
              on={form.digital}
              onChange={bool("digital")}
              label="Digital Product"
              sub="Direct download — no physical shipping"
            />
          </div>

        </aside>
      </div>
    </div>
  );
}
