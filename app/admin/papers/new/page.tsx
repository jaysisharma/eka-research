"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { RefreshCw } from "lucide-react";
import PaperForm, { BLANK_FORM, PaperFormData, UserOption } from "@/app/admin/papers/PaperForm";
import formStyles from "@/app/admin/papers/form.module.css";

export default function NewPaperPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [form,   setForm]   = useState<PaperFormData>(BLANK_FORM);
  const [users,  setUsers]  = useState<UserOption[]>([]);
  const [saving, setSaving] = useState(false);
  const [error,  setError]  = useState("");

  /* auth guard */
  useEffect(() => {
    if (status === "unauthenticated") router.push("/auth/login");
    else if (status === "authenticated" && session?.user?.role !== "ADMIN") router.push("/dashboard");
  }, [status, session, router]);

  /* fetch users for contributor picker */
  useEffect(() => {
    fetch("/api/admin/users")
      .then((r) => r.json())
      .then((data: UserOption[]) => setUsers(Array.isArray(data) ? data : []))
      .catch(() => {});
  }, []);

  const handleChange = (key: keyof PaperFormData, value: PaperFormData[keyof PaperFormData]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const handleSave = async () => {
    setError("");
    if (!form.title.trim())           { setError("Title is required.");            return; }
    if (!form.abstract.trim())        { setError("Abstract is required.");          return; }
    if (!form.authors.trim())         { setError("At least one author is required."); return; }
    if (!form.publicationDate.trim()) { setError("Publication date is required."); return; }

    setSaving(true);
    try {
      const res = await fetch("/api/admin/papers", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title:                form.title,
          abstract:             form.abstract,
          type:                 form.type,
          publicationStatus:    form.publicationStatus,
          authors:              form.authors.split("\n").map((s) => s.trim()).filter(Boolean),
          internalContributors: form.internalContributors,
          journal:              form.journal,
          publicationDate:      form.publicationDate,
          doi:                  form.doi        || null,
          arxiv:                form.arxiv      || null,
          disciplines:          form.disciplines,
          pdfUrl:               form.pdfUrl     || null,
          externalUrl:          form.externalUrl || null,
          githubUrl:            form.githubUrl   || null,
          datasetUrl:           form.datasetUrl  || null,
          featured:             form.featured,
          published:            form.published,
        }),
      });

      if (!res.ok) {
        const data = await res.json() as { error?: string };
        setError(data.error ?? "Something went wrong.");
        return;
      }

      router.push("/admin/papers");
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
    <PaperForm
      mode="new"
      form={form}
      saving={saving}
      error={error}
      users={users}
      onChange={handleChange}
      onSave={handleSave}
    />
  );
}
