"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Upload, Plus, Trash2, Loader2 } from "lucide-react";
import styles from "./ProductForm.module.css";

type VariantGroup = { name: string; options: string };

type FormValues = {
  slug: string;
  name: string;
  tagline: string;
  category: string;
  priceNpr: string;
  description: string;
  includes: string;
  badge: string;
  inStock: boolean;
  digital: boolean;
  imageUrl: string;
  gradient: string;
  variants: VariantGroup[];
};

type Props = {
  mode: "create" | "edit";
  productId?: string;
  initial?: Partial<FormValues>;
};

function slugify(str: string) {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function ProductForm({ mode, productId, initial }: Props) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);

  const [values, setValues] = useState<FormValues>({
    slug: initial?.slug ?? "",
    name: initial?.name ?? "",
    tagline: initial?.tagline ?? "",
    category: initial?.category ?? "apparel",
    priceNpr: initial?.priceNpr ?? "",
    description: initial?.description ?? "",
    includes: initial?.includes ?? "",
    badge: initial?.badge ?? "",
    inStock: initial?.inStock ?? true,
    digital: initial?.digital ?? false,
    imageUrl: initial?.imageUrl ?? "",
    gradient: initial?.gradient ?? "linear-gradient(135deg, #1a2060 0%, #0a0d22 100%)",
    variants: initial?.variants ?? [],
  });

  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function set<K extends keyof FormValues>(key: K, val: FormValues[K]) {
    setValues((v) => ({ ...v, [key]: val }));
  }

  function handleNameChange(name: string) {
    set("name", name);
    if (mode === "create") set("slug", slugify(name));
  }

  async function handleImageUpload(file: File) {
    setUploading(true);
    setError("");
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Upload failed");
      set("imageUrl", data.url);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  function addVariant() {
    set("variants", [...values.variants, { name: "", options: "" }]);
  }

  function updateVariant(i: number, field: keyof VariantGroup, val: string) {
    const updated = values.variants.map((v, idx) =>
      idx === i ? { ...v, [field]: val } : v
    );
    set("variants", updated);
  }

  function removeVariant(i: number) {
    set("variants", values.variants.filter((_, idx) => idx !== i));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      const includesArr = values.includes
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean);

      const variantsArr = values.variants
        .filter((v) => v.name.trim())
        .map((v) => ({
          name: v.name.trim(),
          options: v.options.split(",").map((o) => o.trim()).filter(Boolean),
        }));

      const payload = {
        slug: values.slug,
        name: values.name,
        tagline: values.tagline,
        category: values.category,
        priceNpr: Number(values.priceNpr),
        description: values.description,
        includes: includesArr.length ? includesArr : null,
        variants: variantsArr.length ? variantsArr : null,
        badge: values.badge || null,
        inStock: values.inStock,
        digital: values.digital,
        imageUrl: values.imageUrl || null,
        gradient: values.gradient,
      };

      const url =
        mode === "create"
          ? "/api/admin/products"
          : `/api/admin/products/${productId}`;
      const method = mode === "create" ? "POST" : "PUT";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Save failed");

      router.push("/admin/store");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed");
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className={styles.form}>

      {error && <p className={styles.error}>{error}</p>}

      {/* Row 1: Name + Slug */}
      <div className={styles.row}>
        <div className={styles.field}>
          <label className={styles.label}>Product name *</label>
          <input
            className={styles.input}
            value={values.name}
            onChange={(e) => handleNameChange(e.target.value)}
            required
            placeholder="Eka Research Classic Tee"
          />
        </div>
        <div className={styles.field}>
          <label className={styles.label}>Slug *</label>
          <input
            className={styles.input}
            value={values.slug}
            onChange={(e) => set("slug", e.target.value)}
            required
            placeholder="eka-classic-tee"
          />
        </div>
      </div>

      {/* Row 2: Tagline + Category */}
      <div className={styles.row}>
        <div className={styles.field}>
          <label className={styles.label}>Tagline *</label>
          <input
            className={styles.input}
            value={values.tagline}
            onChange={(e) => set("tagline", e.target.value)}
            required
            placeholder="Wear the mission"
          />
        </div>
        <div className={styles.field}>
          <label className={styles.label}>Category *</label>
          <select
            className={styles.select}
            value={values.category}
            onChange={(e) => set("category", e.target.value)}
          >
            <option value="apparel">Apparel</option>
            <option value="educational">Educational</option>
            <option value="kits">Kits</option>
            <option value="digital">Digital</option>
          </select>
        </div>
      </div>

      {/* Row 3: Price + Badge */}
      <div className={styles.row}>
        <div className={styles.field}>
          <label className={styles.label}>Price (NPR) *</label>
          <input
            className={styles.input}
            type="number"
            min={1}
            value={values.priceNpr}
            onChange={(e) => set("priceNpr", e.target.value)}
            required
            placeholder="1200"
          />
        </div>
        <div className={styles.field}>
          <label className={styles.label}>Badge <span className={styles.optional}>(optional)</span></label>
          <input
            className={styles.input}
            value={values.badge}
            onChange={(e) => set("badge", e.target.value)}
            placeholder="Popular, New, Best seller…"
          />
        </div>
      </div>

      {/* Description */}
      <div className={styles.field}>
        <label className={styles.label}>Description *</label>
        <textarea
          className={styles.textarea}
          rows={4}
          value={values.description}
          onChange={(e) => set("description", e.target.value)}
          required
          placeholder="Full product description…"
        />
      </div>

      {/* Includes */}
      <div className={styles.field}>
        <label className={styles.label}>
          What&apos;s included <span className={styles.optional}>(one item per line)</span>
        </label>
        <textarea
          className={styles.textarea}
          rows={3}
          value={values.includes}
          onChange={(e) => set("includes", e.target.value)}
          placeholder={"Nepal Sky Map\nMeteor Field Journal\nDrawstring carry bag"}
        />
      </div>

      {/* Variants */}
      <div className={styles.field}>
        <div className={styles.fieldHeadRow}>
          <label className={styles.label}>Variants</label>
          <button type="button" className={styles.addBtn} onClick={addVariant}>
            <Plus size={13} /> Add variant group
          </button>
        </div>
        {values.variants.map((v, i) => (
          <div key={i} className={styles.variantRow}>
            <input
              className={styles.input}
              placeholder="Group name (e.g. Size)"
              value={v.name}
              onChange={(e) => updateVariant(i, "name", e.target.value)}
            />
            <input
              className={styles.input}
              placeholder="Options, comma-separated (e.g. S, M, L, XL)"
              value={v.options}
              onChange={(e) => updateVariant(i, "options", e.target.value)}
            />
            <button
              type="button"
              className={styles.removeBtn}
              onClick={() => removeVariant(i)}
              aria-label="Remove variant"
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}
      </div>

      {/* Image upload */}
      <div className={styles.field}>
        <label className={styles.label}>Product image</label>
        <div className={styles.uploadArea}>
          {values.imageUrl ? (
            <div className={styles.imagePreview}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={values.imageUrl} alt="Product" className={styles.previewImg} />
              <button
                type="button"
                className={styles.changeImageBtn}
                onClick={() => fileRef.current?.click()}
              >
                Change image
              </button>
            </div>
          ) : (
            <button
              type="button"
              className={styles.uploadBtn}
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
            >
              {uploading ? (
                <><Loader2 size={16} className={styles.spin} /> Uploading…</>
              ) : (
                <><Upload size={16} /> Upload image</>
              )}
            </button>
          )}
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className={styles.hidden}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleImageUpload(file);
            }}
          />
        </div>
        <p className={styles.hint}>
          Or use a gradient fallback:
        </p>
        <input
          className={styles.input}
          value={values.gradient}
          onChange={(e) => set("gradient", e.target.value)}
          placeholder="linear-gradient(135deg, #1a2060 0%, #0a0d22 100%)"
        />
      </div>

      {/* Checkboxes */}
      <div className={styles.checkRow}>
        <label className={styles.checkLabel}>
          <input
            type="checkbox"
            checked={values.inStock}
            onChange={(e) => set("inStock", e.target.checked)}
            className={styles.checkbox}
          />
          In stock
        </label>
        <label className={styles.checkLabel}>
          <input
            type="checkbox"
            checked={values.digital}
            onChange={(e) => set("digital", e.target.checked)}
            className={styles.checkbox}
          />
          Digital product
        </label>
      </div>

      {/* Actions */}
      <div className={styles.actions}>
        <button
          type="button"
          className={styles.cancelBtn}
          onClick={() => router.back()}
        >
          Cancel
        </button>
        <button type="submit" className={styles.saveBtn} disabled={saving}>
          {saving ? <><Loader2 size={15} className={styles.spin} /> Saving…</> : mode === "create" ? "Create product" : "Save changes"}
        </button>
      </div>

    </form>
  );
}
