"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import { RefreshCw } from "lucide-react";
import ProjectForm, {
  ProjectFormData,
  ProjectStatus,
  CategoryOption,
} from "@/app/admin/projects/ProjectForm";
import formStyles from "@/app/admin/projects/form.module.css";

const parseArr = (raw: string | undefined | null): string[] => {
  if (!raw) return [];
  try { return JSON.parse(raw) as string[]; } catch { return []; }
};

export default function EditProjectPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { id } = useParams<{ id: string }>();

  const [form,       setForm]       = useState<ProjectFormData | null>(null);
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [saving,     setSaving]     = useState(false);
  const [error,      setError]      = useState("");

  /* auth guard */
  useEffect(() => {
    if (status === "unauthenticated") router.push("/auth/login");
    else if (status === "authenticated" && session?.user?.role !== "ADMIN") router.push("/dashboard");
  }, [status, session, router]);

  /* fetch project + categories in parallel */
  useEffect(() => {
    if (!id) return;
    Promise.all([
      fetch(`/api/admin/projects/${id}`).then((r) => r.json()),
      fetch("/api/admin/projects/categories").then((r) => r.json()),
    ])
      .then(([project, allCategories]) => {
        setCategories(Array.isArray(allCategories) ? allCategories : []);
        setForm({
          title:        project.title        ?? "",
          description:  project.description  ?? "",
          status:       (project.status as ProjectStatus) ?? "planned",
          categoryId:   project.categoryId   ?? "",
          period:       project.period       ?? "",
          tags:         parseArr(project.tags),
          imageUrl:     project.imageUrl     ?? "",
          images:       parseArr(project.images),
          href:         project.href         ?? "",
          featured:     project.featured     ?? false,
          outcome:      project.outcome      ?? "",
          phase:        project.phase        ?? "",
          launchTarget: project.launchTarget ?? "",
          published:    project.published    ?? true,
        });
      })
      .catch(() => setError("Failed to load project."))
      .finally(() => setLoading(false));
  }, [id]);

  const handleChange = (
    key: keyof ProjectFormData,
    value: ProjectFormData[keyof ProjectFormData]
  ) => setForm((f) => f ? { ...f, [key]: value } : f);

  const handleSave = async () => {
    if (!form) return;
    setError("");
    if (!form.title.trim())       { setError("Title is required.");       return; }
    if (!form.description.trim()) { setError("Description is required."); return; }
    if (!form.categoryId)         { setError("Category is required.");    return; }
    if (!form.period.trim())      { setError("Period is required.");      return; }
    if (!form.href.trim())        { setError("Project URL is required."); return; }

    setSaving(true);
    try {
      const res = await fetch(`/api/admin/projects/${id}`, {
        method:  "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title:        form.title,
          description:  form.description,
          status:       form.status,
          categoryId:   form.categoryId,
          period:       form.period,
          tags:         form.tags,
          imageUrl:     form.imageUrl      || null,
          images:       form.images,
          href:         form.href,
          featured:     form.featured,
          outcome:      form.outcome       || null,
          phase:        form.phase         || null,
          launchTarget: form.launchTarget  || null,
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

  if (loading || !form) {
    return (
      <div className={formStyles.loadingScreen}>
        <RefreshCw className={formStyles.spinner} size={28} />
        <p>{error || "Loading project…"}</p>
      </div>
    );
  }

  return (
    <ProjectForm
      mode="edit"
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
