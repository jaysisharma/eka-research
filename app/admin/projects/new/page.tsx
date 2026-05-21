"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { RefreshCw } from "lucide-react";
import ProjectForm, {
  BLANK_FORM,
  ProjectFormData,
  CategoryOption,
} from "@/app/admin/projects/ProjectForm";
import formStyles from "@/app/admin/projects/form.module.css";

export default function NewProjectPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [form,       setForm]       = useState<ProjectFormData>(BLANK_FORM);
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [saving,     setSaving]     = useState(false);
  const [error,      setError]      = useState("");

  /* auth guard */
  useEffect(() => {
    if (status === "unauthenticated") router.push("/auth/login");
    else if (status === "authenticated" && session?.user?.role !== "ADMIN") router.push("/dashboard");
  }, [status, session, router]);

  /* fetch categories */
  useEffect(() => {
    fetch("/api/admin/projects/categories")
      .then((r) => r.json())
      .then((data: CategoryOption[]) => setCategories(Array.isArray(data) ? data : []))
      .catch(() => {});
  }, []);

  const handleChange = (
    key: keyof ProjectFormData,
    value: ProjectFormData[keyof ProjectFormData]
  ) => setForm((f) => ({ ...f, [key]: value }));

  const handleSave = async () => {
    setError("");
    if (!form.title.trim())       { setError("Title is required.");       return; }
    if (!form.description.trim()) { setError("Description is required."); return; }
    if (!form.categoryId)         { setError("Category is required.");    return; }
    if (!form.period.trim())      { setError("Period is required.");      return; }
    if (!form.href.trim())        { setError("Project URL is required."); return; }

    setSaving(true);
    try {
      const res = await fetch("/api/admin/projects", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title:        form.title,
          description:  form.description,
          status:       form.status,
          categoryId:   form.categoryId,
          period:       form.period,
          tags:         form.tags,
          imageUrl:     form.imageUrl  || null,
          href:         form.href,
          featured:     form.featured,
          outcome:      form.outcome      || null,
          phase:        form.phase        || null,
          launchTarget: form.launchTarget || null,
          published:    form.published,
        }),
      });

      if (!res.ok) {
        const data = await res.json() as { error?: string };
        setError(data.error ?? "Something went wrong.");
        return;
      }

      router.push("/admin/projects");
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
    <ProjectForm
      mode="new"
      form={form}
      saving={saving}
      error={error}
      categories={categories}
      onCategoryCreated={(cat) => setCategories((prev) => [...prev, cat])}
      onChange={handleChange}
      onSave={handleSave}
    />
  );
}
