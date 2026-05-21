"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { RefreshCw } from "lucide-react";
import NewsForm, { BLANK_FORM, NewsFormData } from "@/app/admin/news/NewsForm";
import formStyles from "@/app/admin/news/form.module.css";

export default function NewNewsPostPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [form, setForm] = useState<NewsFormData>(BLANK_FORM);
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

  const handleChange = (key: keyof NewsFormData, value: NewsFormData[keyof NewsFormData]) => {
    setForm((f) => ({ ...f, [key]: value }));
  };

  const handleSave = async () => {
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
      const res = await fetch("/api/admin/news", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const data = await res.json() as { error?: string };
        setError(data.error ?? "Failed to publish news post.");
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

  if (status === "loading") {
    return (
      <div className={formStyles.loadingScreen}>
        <RefreshCw className={formStyles.spinner} size={28} />
      </div>
    );
  }

  return (
    <NewsForm
      mode="new"
      form={form}
      saving={saving}
      error={error}
      onChange={handleChange}
      onSave={handleSave}
    />
  );
}
