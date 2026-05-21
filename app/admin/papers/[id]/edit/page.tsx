"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import { RefreshCw } from "lucide-react";
import PaperForm, { PaperFormData, PaperType, PublicationStatus, UserOption } from "@/app/admin/papers/PaperForm";
import formStyles from "@/app/admin/papers/form.module.css";

const parseArr = (raw: string | undefined | null): string[] => {
  if (!raw) return [];
  try { return JSON.parse(raw) as string[]; } catch { return []; }
};

export default function EditPaperPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { id } = useParams<{ id: string }>();

  const [form,    setForm]    = useState<PaperFormData | null>(null);
  const [users,   setUsers]   = useState<UserOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving,  setSaving]  = useState(false);
  const [error,   setError]   = useState("");

  /* auth guard */
  useEffect(() => {
    if (status === "unauthenticated") router.push("/auth/login");
    else if (status === "authenticated" && session?.user?.role !== "ADMIN") router.push("/dashboard");
  }, [status, session, router]);

  /* fetch paper + users in parallel */
  useEffect(() => {
    if (!id) return;
    Promise.all([
      fetch(`/api/admin/papers/${id}`).then((r) => r.json()),
      fetch("/api/admin/users").then((r) => r.json()),
    ])
      .then(([paper, allUsers]) => {
        setUsers(Array.isArray(allUsers) ? allUsers : []);
        setForm({
          title:                paper.title        ?? "",
          abstract:             paper.abstract      ?? "",
          type:                 (paper.type as PaperType) ?? "journal",
          publicationStatus:    (paper.publicationStatus as PublicationStatus) ?? "draft",
          authors:              parseArr(paper.authors).join("\n"),
          internalContributors: parseArr(paper.internalContributors),
          journal:              paper.journal        ?? "",
          publicationDate:      paper.publicationDate ?? paper.date ?? "",
          doi:                  paper.doi            ?? "",
          arxiv:                paper.arxiv          ?? "",
          disciplines:          parseArr(paper.disciplines),
          pdfUrl:               paper.pdfUrl         ?? "",
          externalUrl:          paper.externalUrl    ?? "",
          githubUrl:            paper.githubUrl      ?? "",
          datasetUrl:           paper.datasetUrl     ?? "",
          featured:             paper.featured       ?? false,
          published:            paper.published      ?? true,
          isPremium:            paper.isPremium      ?? false,
          content:              paper.content        ?? "",
        });
      })
      .catch(() => setError("Failed to load paper."))
      .finally(() => setLoading(false));
  }, [id]);

  const handleChange = (key: keyof PaperFormData, value: PaperFormData[keyof PaperFormData]) =>
    setForm((f) => f ? { ...f, [key]: value } : f);

  const handleSave = async () => {
    if (!form) return;
    setError("");
    if (!form.title.trim())           { setError("Title is required.");            return; }
    if (!form.abstract.trim())        { setError("Abstract is required.");          return; }
    if (!form.authors.trim())         { setError("At least one author is required."); return; }
    if (!form.publicationDate.trim()) { setError("Publication date is required."); return; }

    setSaving(true);
    try {
      const res = await fetch(`/api/admin/papers/${id}`, {
        method:  "PATCH",
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
          isPremium:            form.isPremium,
          content:              form.content || null,
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

  if (loading || !form) {
    return (
      <div className={formStyles.loadingScreen}>
        <RefreshCw className={formStyles.spinner} size={28} />
        <p>{error || "Loading paper…"}</p>
      </div>
    );
  }

  return (
    <PaperForm
      mode="edit"
      form={form}
      saving={saving}
      error={error}
      users={users}
      onChange={handleChange}
      onSave={handleSave}
    />
  );
}
