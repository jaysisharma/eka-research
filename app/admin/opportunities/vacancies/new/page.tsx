"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import VacancyForm, { VacancyFormData } from "@/app/admin/opportunities/vacancies/VacancyForm";

const DEFAULT: VacancyFormData = {
  title:       "",
  type:        "INTERNSHIP",
  department:  "",
  description: "",
  deadline:    "",
  status:      "DRAFT",
};

export default function NewVacancyPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [form,   setForm]   = useState<VacancyFormData>(DEFAULT);
  const [saving, setSaving] = useState(false);
  const [error,  setError]  = useState("");

  useEffect(() => {
    if (status === "unauthenticated") router.push("/auth/login");
    else if (status === "authenticated" && session?.user?.role !== "ADMIN") router.push("/dashboard");
  }, [status, session, router]);

  const handleChange = (key: keyof VacancyFormData, value: VacancyFormData[keyof VacancyFormData]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const handleSave = async () => {
    setError("");
    if (!form.title.trim())       { setError("Title is required.");       return; }
    if (!form.department.trim())  { setError("Department is required.");  return; }
    if (!form.description.trim()) { setError("Description is required."); return; }

    setSaving(true);
    try {
      const res = await fetch("/api/admin/opportunities/vacancies", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          deadline: form.deadline || null,
        }),
      });
      if (!res.ok) {
        const data = await res.json() as { error?: string };
        setError(data.error ?? "Something went wrong.");
        return;
      }
      router.push("/admin/opportunities/vacancies");
    } finally { setSaving(false); }
  };

  return (
    <VacancyForm
      mode="new" form={form} saving={saving} error={error}
      onChange={handleChange} onSave={handleSave}
    />
  );
}
