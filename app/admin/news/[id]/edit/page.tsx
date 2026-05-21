"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import { RefreshCw } from "lucide-react";
import NewsForm, { NewsFormData, NewsCategory } from "@/app/admin/news/NewsForm";
import formStyles from "@/app/admin/news/form.module.css";

export default function EditNewsPostPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { id } = useParams<{ id: string }>();

  const [form, setForm] = useState<NewsFormData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  /* Auth Guard */
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
    } else if (status === "authenticated" && session?.user?.role !== "ADMIN") {
      router.push("/dashboard");
    }
  }, [status, session, router]);

  /* Fetch post data */
  useEffect(() => {
    if (!id) return;
    setLoading(true);
    fetch(`/api/admin/news/${id}`)
      .then((r) => {
        if (!r.ok) throw new Error("Failed to load post.");
        return r.json();
      })
      .then((post) => {
        setForm({
          title: post.title ?? "",
          slug: post.slug ?? "",
          excerpt: post.excerpt ?? "",
          category: (post.category as NewsCategory) ?? "announcement",
          date: post.date ?? "",
          imageUrl: post.imageUrl ?? "",
          featured: post.featured ?? false,
          published: post.published ?? true,
        });
      })
      .catch((err) => {
        console.error(err);
        setError("Failed to load the news post.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [id]);

  const handleChange = (key: keyof NewsFormData, value: NewsFormData[keyof NewsFormData]) => {
    setForm((f) => (f ? { ...f, [key]: value } : null));
  };

  const handleSave = async () => {
    if (!form || !id) return;
    setError("");

    // Core validations
    if (!form.title.trim()) {
      setError("Title is required.");
      return;
    }
    if (!form.slug.trim()) {
      setError("Slug is required.");
      return;
    }
    if (!form.excerpt.trim()) {
      setError("Excerpt summary is required.");
      return;
    }
    if (!form.date.trim()) {
      setError("Publish date is required.");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(`/api/admin/news/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const data = await res.json() as { error?: string };
        setError(data.error ?? "Failed to update news post.");
        return;
      }

      router.push("/admin/news");
    } catch (err) {
      console.error(err);
      setError("An unexpected network error occurred.");
    } finally {
      setSaving(false);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className={formStyles.loadingScreen}>
        <RefreshCw className={formStyles.spinner} size={28} />
        <p>{error || "Loading news post details…"}</p>
      </div>
    );
  }

  if (!form) {
    return (
      <div className={formStyles.loadingScreen}>
        <p>{error || "News post not found."}</p>
      </div>
    );
  }

  return (
    <NewsForm
      mode="edit"
      form={form}
      saving={saving}
      error={error}
      onChange={handleChange}
      onSave={handleSave}
    />
  );
}
