"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import { RefreshCw } from "lucide-react";
import ProductForm, { ProductFormData, VariantGroup } from "@/app/admin/store/products/ProductForm";
import formStyles from "@/app/admin/store/products/form.module.css";

const parseArr = <T,>(raw: string | null | undefined, fallback: T[]): T[] => {
  if (!raw) return fallback;
  try { return JSON.parse(raw) as T[]; } catch { return fallback; }
};


export default function EditProductPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { id } = useParams<{ id: string }>();

  const [form, setForm] = useState<ProductFormData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") router.push("/auth/login");
    else if (status === "authenticated" && session?.user?.role !== "ADMIN") router.push("/dashboard");
  }, [status, session, router]);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/admin/store/products/${id}`)
      .then((r) => r.json())
      .then((p) => {
        const rawVariants = parseArr<{ name: string; options: string[] }>(p.variants, []);
        setForm({
          name: p.name ?? "",
          slug: p.slug ?? "",
          tagline: p.tagline ?? "",
          category: p.category ?? "apparel",
          priceNpr: String(p.priceNpr ?? ""),
          description: p.description ?? "",
          includes: parseArr<string>(p.includes, []).join("\n"),
          variants: rawVariants.map((g) => ({
            name: g.name,
            options: g.options.join(", "),
          })) as VariantGroup[],
          badge: p.badge ?? "",
          inStock: p.inStock ?? true,
          digital: p.digital ?? false,
          imageUrl: p.imageUrl ?? "",
        });
      })
      .catch(() => setError("Failed to load product."))
      .finally(() => setLoading(false));
  }, [id]);

  const handleChange = (key: keyof ProductFormData, value: ProductFormData[keyof ProductFormData]) =>
    setForm((f) => f ? { ...f, [key]: value } : f);

  const handleSave = async () => {
    if (!form) return;
    setError("");
    if (!form.name.trim()) { setError("Name is required."); return; }
    if (!form.slug.trim()) { setError("Slug is required."); return; }
    if (!form.tagline.trim()) { setError("Tagline is required."); return; }
    if (!form.description.trim()) { setError("Description is required."); return; }
    if (!form.priceNpr) { setError("Price is required."); return; }

    setSaving(true);
    try {
      const res = await fetch(`/api/admin/store/products/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          slug: form.slug,
          tagline: form.tagline,
          category: form.category,
          priceNpr: Number(form.priceNpr),
          description: form.description,
          includes: form.includes.split("\n").map((s) => s.trim()).filter(Boolean),
          variants: form.variants.map((g) => ({
            name: g.name,
            options: g.options.split(",").map((s) => s.trim()).filter(Boolean),
          })),
          badge: form.badge || null,
          inStock: form.inStock,
          digital: form.digital,
          imageUrl: form.imageUrl || null,
        }),
      });
      if (!res.ok) {
        const data = await res.json() as { error?: string };
        setError(data.error ?? "Something went wrong.");
        return;
      }
      router.push("/admin/store/products");
    } finally { setSaving(false); }
  };

  if (loading || !form) {
    return (
      <div className={formStyles.loadingScreen}>
        <RefreshCw className={formStyles.spinner} size={28} />
        <p>{error || "Loading product…"}</p>
      </div>
    );
  }

  return (
    <ProductForm
      mode="edit" form={form} saving={saving} error={error}
      onChange={handleChange} onSave={handleSave}
    />
  );
}
