"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import { RefreshCw } from "lucide-react";
import VacancyForm, {
  VacancyFormData, VacancyType, VacancyStatus,
} from "@/app/admin/opportunities/vacancies/VacancyForm";
import formStyles from "@/app/admin/opportunities/vacancies/form.module.css";

export default function EditVacancyPage() {
  const { data: session, status } = useSession();
  const router  = useRouter();
  const { id }  = useParams<{ id: string }>();

  const [form,    setForm]    = useState<VacancyFormData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving,  setSaving]  = useState(false);
  const [error,   setError]   = useState("");

  useEffect(() => {
    if (status === "unauthenticated") router.push("/auth/login");
    else if (status === "authenticated" && session?.user?.role !== "ADMIN") router.push("/dashboard");
  }, [status, session, router]);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/admin/opportunities/vacancies/${id}`)
      .then((r) => r.json())
      .then((v) => {
        setForm({
          title:       v.title       ?? "",
          type:        (v.type        as VacancyType)   ?? "INTERNSHIP",
          department:  v.department  ?? "",
          description: v.description ?? "",
          deadline:    v.deadline ? new Date(v.deadline).toISOString().slice(0, 10) : "",
          status:      (v.status as VacancyStatus) ?? "DRAFT",
        });
      })
      .catch(() => setError("Failed to load vacancy."))
      .finally(() => setLoading(false));
  }, [id]);

  const handleChange = (key: keyof VacancyFormData, value: VacancyFormData[keyof VacancyFormData]) =>
    setForm((f) => f ? { ...f, [key]: value } : f);

  const handleSave = async () => {
    if (!form) return;
    setError("");
    if (!form.title.trim())       { setError("Title is required.");       return; }
    if (!form.department.trim())  { setError("Department is required.");  return; }
    if (!form.description.trim()) { setError("Description is required."); return; }

    setSaving(true);
    try {
      const res = await fetch(`/api/admin/opportunities/vacancies/${id}`, {
        method:  "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, deadline: form.deadline || null }),
      });
      if (!res.ok) {
        const data = await res.json() as { error?: string };
        setError(data.error ?? "Something went wrong.");
        return;
      }
      router.push("/admin/opportunities/vacancies");
    } finally { setSaving(false); }
  };

  if (loading || !form) {
    return (
      <div className={formStyles.loadingScreen}>
        <RefreshCw size={28} style={{ animation: "spin 0.8s linear infinite" }} />
        <p>{error || "Loading vacancy…"}</p>
      </div>
    );
  }

  return (
    <VacancyForm
      mode="edit" form={form} saving={saving} error={error}
      onChange={handleChange} onSave={handleSave}
    />
  );
}
