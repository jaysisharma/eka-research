"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, ChevronRight, RefreshCw, Plus, X, AlertCircle, Wand2 } from "lucide-react";
import styles from "./form.module.css";
import ImageUpload from "@/components/ui/ImageUpload";


/* ── Types ───────────────────────────────────────────────────────────── */

export type ProductCategory = "apparel" | "educational" | "kits" | "digital";

export type VariantGroup = {
  name:    string;
  options: string;   // comma-separated; parsed to string[] on save
};

export type ProductFormData = {
  name:        string;
  slug:        string;
  tagline:     string;
  category:    ProductCategory;
  priceNpr:    string;
  description: string;
  includes:    string;   // one item per line
  variants:    VariantGroup[];
  badge:       string;
  inStock:     boolean;
  digital:     boolean;
  imageUrl:    string;
  gradient:    string;
};

export const BLANK_FORM: ProductFormData = {
  name: "", slug: "", tagline: "", category: "apparel",
  priceNpr: "", description: "", includes: "",
  variants: [], badge: "", inStock: true, digital: false,
  imageUrl: "",
  gradient: "linear-gradient(135deg, #1a2060 0%, #0a0d22 100%)",
};

export const CATEGORIES: { value: ProductCategory; label: string }[] = [
  { value: "apparel",     label: "Apparel"     },
  { value: "educational", label: "Educational" },
  { value: "kits",        label: "Kits"        },
  { value: "digital",     label: "Digital"     },
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
  const add    = () => onChange([...groups, { name: "", options: "" }]);
  const remove = (i: number) => onChange(groups.filter((_, idx) => idx !== i));
  const set    = (i: number, key: keyof VariantGroup, val: string) =>
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
  mode:     "new" | "edit";
  form:     ProductFormData;
  saving:   boolean;
  error?:   string;
  onChange: (key: keyof ProductFormData, value: ProductFormData[keyof ProductFormData]) => void;
  onSave:   () => void;
}

export default function ProductForm({ mode, form, saving, error, onChange, onSave }: Props) {
  const [slugEdited, setSlugEdited] = useState(mode === "edit");

  /* Auto-generate slug from name until the user manually edits it */
  useEffect(() => {
    if (!slugEdited && form.name) onChange("slug", slugify(form.name));
  }, [form.name, slugEdited]); // eslint-disable-line react-hooks/exhaustive-deps

  const str  = (key: keyof ProductFormData) =>
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

      {/* ── 2-COL BODY ── */}
      <div className={styles.body}>

        {/* LEFT: MAIN */}
        <div className={styles.main}>
          {error && (
            <div className={styles.errorBanner}>
              <AlertCircle size={14} /> {error}
            </div>
          )}

          <div className={styles.mainCard}>

            {/* 01 · Core */}
            <section className={styles.section}>
              <header className={styles.sectionHead}>
                <span className={styles.sectionNum}>01</span>
                <span className={styles.sectionName}>Core</span>
              </header>
              <div className={styles.fields}>
                <div className={styles.field}>
                  <label className={styles.label}>
                    Name <span className={styles.req}>*</span>
                  </label>
                  <input className={styles.input} value={form.name}
                    onChange={str("name")} placeholder="Product name" />
                </div>

                <div className={styles.field}>
                  <label className={styles.label}>
                    Slug <span className={styles.req}>*</span>
                    {!slugEdited && (
                      <span className={styles.autoSlugNote}>
                        <Wand2 size={10} /> auto-generated
                      </span>
                    )}
                  </label>
                  <input
                    className={styles.input}
                    value={form.slug}
                    onChange={(e) => {
                      setSlugEdited(true);
                      onChange("slug", e.target.value);
                    }}
                    placeholder="product-url-slug"
                  />
                  {!slugEdited && (
                    <span className={styles.hint}>
                      Editing the name will update the slug automatically.{" "}
                      <button type="button" className={styles.inlineBtn}
                        onClick={() => setSlugEdited(true)}>
                        Lock it now
                      </button>
                    </span>
                  )}
                </div>

                <div className={styles.field}>
                  <label className={styles.label}>
                    Tagline <span className={styles.req}>*</span>
                  </label>
                  <input className={styles.input} value={form.tagline}
                    onChange={str("tagline")} placeholder="One-line product pitch" />
                </div>
              </div>
            </section>

            {/* 02 · Description */}
            <section className={styles.section}>
              <header className={styles.sectionHead}>
                <span className={styles.sectionNum}>02</span>
                <span className={styles.sectionName}>Description</span>
              </header>
              <div className={styles.fields}>
                <div className={styles.field}>
                  <label className={styles.label}>
                    Description <span className={styles.req}>*</span>
                  </label>
                  <textarea className={`${styles.textarea} ${styles.xl}`}
                    value={form.description} onChange={str("description")}
                    placeholder="Full product description shown on the product page…" />
                </div>
              </div>
            </section>

            {/* 03 · Pricing */}
            <section className={styles.section}>
              <header className={styles.sectionHead}>
                <span className={styles.sectionNum}>03</span>
                <span className={styles.sectionName}>Pricing</span>
              </header>
              <div className={styles.fields}>
                <div className={styles.row}>
                  <div className={styles.field}>
                    <label className={styles.label}>
                      Price (NPR) <span className={styles.req}>*</span>
                    </label>
                    <div className={styles.priceWrap}>
                      <span className={styles.pricePre}>NPR</span>
                      <input
                        className={`${styles.input} ${styles.priceInput}`}
                        type="number" min="0" step="1"
                        value={form.priceNpr}
                        onChange={str("priceNpr")}
                        placeholder="0"
                      />
                    </div>
                  </div>
                  <div className={styles.field}>
                    <label className={styles.label}>Badge Label</label>
                    <input className={styles.input} value={form.badge}
                      onChange={str("badge")} placeholder="New, Sale, Limited…" />
                    <span className={styles.hint}>Short text shown on the product card (optional)</span>
                  </div>
                </div>
              </div>
            </section>

            {/* 04 · Media */}
            <section className={styles.section}>
              <header className={styles.sectionHead}>
                <span className={styles.sectionNum}>04</span>
                <span className={styles.sectionName}>Media</span>
              </header>
              <div className={styles.fields}>
                <div className={styles.field}>
                  <label className={styles.label}>Product Image</label>
                  <ImageUpload
                    value={form.imageUrl}
                    onChange={(url) => onChange("imageUrl", url)}
                    label="Upload Product Image"
                  />
                  <span className={styles.hint}>
                    Leave blank to use the gradient background instead
                  </span>
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>Gradient Background</label>
                  <div className={styles.gradientRow}>
                    <div
                      className={styles.gradientSwatch}
                      style={{ background: form.gradient || "var(--bg-inset)" }}
                    />
                    <input className={styles.input} value={form.gradient}
                      onChange={str("gradient")}
                      placeholder="linear-gradient(135deg, #1a2060 0%, #0a0d22 100%)" />
                  </div>
                  <span className={styles.hint}>
                    Used as the card background when no image is set
                  </span>
                </div>
              </div>
            </section>

            {/* 05 · What's Included */}
            <section className={styles.section}>
              <header className={styles.sectionHead}>
                <span className={styles.sectionNum}>05</span>
                <span className={styles.sectionName}>What&apos;s Included</span>
              </header>
              <div className={styles.fields}>
                <div className={styles.field}>
                  <label className={styles.label}>Included Items</label>
                  <textarea className={styles.textarea} value={form.includes}
                    onChange={str("includes")}
                    placeholder={"1× Star map (A2 poster)\n1× Protective tube\nDigital download code"} />
                  <span className={styles.hint}>One item per line — shown as a bullet list on the product page</span>
                </div>
              </div>
            </section>

            {/* 06 · Variants */}
            <section className={styles.section}>
              <header className={styles.sectionHead}>
                <span className={styles.sectionNum}>06</span>
                <span className={styles.sectionName}>Variants</span>
              </header>
              <div className={styles.fields}>
                <VariantBuilder
                  groups={form.variants}
                  onChange={(v) => onChange("variants", v)}
                />
              </div>
            </section>

          </div>
        </div>

        {/* RIGHT: SIDEBAR */}
        <aside className={styles.sidebar}>

          {/* AVAILABILITY */}
          <div className={styles.card}>
            <p className={styles.cardTitle}>Availability</p>
            <Toggle
              on={form.inStock}
              onChange={bool("inStock")}
              label="In Stock"
              sub="Product can be added to cart"
            />
            <div className={styles.toggleDivider} />
            <Toggle
              on={form.digital}
              onChange={bool("digital")}
              label="Digital Product"
              sub="No shipping — instant download"
            />
          </div>

          {/* CATEGORY */}
          <div className={styles.card}>
            <p className={styles.cardTitle}>Category</p>
            <div className={styles.field}>
              <label className={styles.label}>
                Category <span className={styles.req}>*</span>
              </label>
              <select className={styles.select} value={form.category}
                onChange={(e) => onChange("category", e.target.value as ProductCategory)}>
                {CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>
          </div>

        </aside>
      </div>
    </div>
  );
}
