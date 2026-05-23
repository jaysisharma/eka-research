"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { RefreshCw } from "lucide-react";
import ProductForm, { BLANK_FORM, ProductFormData } from "@/app/admin/store/products/ProductForm";
import formStyles from "@/app/admin/store/products/form.module.css";

export default function NewProductPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [form,   setForm]   = useState<ProductFormData>(BLANK_FORM);
  const [saving, setSaving] = useState(false);
  const [error,  setError]  = useState("");

  useEffect(() => {
    if (status === "unauthenticated") router.push("/auth/login");
    else if (status === "authenticated" && session?.user?.role !== "ADMIN") router.push("/dashboard");
  }, [status, session, router]);

  const handleChange = (key: keyof ProductFormData, value: ProductFormData[keyof ProductFormData]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const handleSave = async () => {
    setError("");
    if (!form.name.trim())        { setError("Name is required.");        return; }
    if (!form.slug.trim())        { setError("Slug is required.");        return; }
    if (!form.tagline.trim())     { setError("Tagline is required.");     return; }
    if (!form.description.trim()) { setError("Description is required."); return; }
    if (!form.priceNpr)           { setError("Price is required.");       return; }

    setSaving(true);
    try {
      const res = await fetch("/api/admin/store/products", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name:        form.name,
          slug:        form.slug,
          tagline:     form.tagline,
          category:    form.category,
          priceNpr:    Number(form.priceNpr),
          description: form.description,
          includes:    form.includes.split("\n").map((s) => s.trim()).filter(Boolean),
          variants:    form.variants.map((g) => ({
            name:    g.name,
            options: g.options.split(",").map((s) => s.trim()).filter(Boolean),
          })),
          badge:     form.badge    || null,
          inStock:   form.inStock,
          digital:   form.digital,
          imageUrl:  form.imageUrl || null,
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

  if (status === "loading") {
    return (
      <div className={formStyles.loadingScreen}>
        <RefreshCw className={formStyles.spinner} size={28} />
      </div>
    );
  }

  return (
    <ProductForm
      mode="new" form={form} saving={saving} error={error}
      onChange={handleChange} onSave={handleSave}
    />
  );
}
