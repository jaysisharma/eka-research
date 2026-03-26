"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import styles from "../cms.module.css";

type Category = {
  id: string;
  name: string;
};

type FormValues = {
  title: string;
  description: string;
  status: string;
  categoryId: string;
  period: string;
  tags: string;
  imageUrl: string;
  href: string;
  featured: boolean;
  published: boolean;
  outcome: string;
  phase: string;
  launchTarget: string;
};

type Props = {
  mode: "create" | "edit";
  projectId?: string;
  initial?: Partial<FormValues>;
  categories: Category[];
};

export function ProjectForm({ mode, projectId, initial, categories }: Props) {
  const router = useRouter();

  const [values, setValues] = useState<FormValues>({
    title:        initial?.title ?? "",
    description:  initial?.description ?? "",
    status:       initial?.status ?? "ongoing",
    categoryId:   initial?.categoryId ?? (categories[0]?.id ?? ""),
    period:       initial?.period ?? "",
    tags:         initial?.tags ?? "",
    imageUrl:     initial?.imageUrl ?? "",
    href:         initial?.href ?? "",
    featured:     initial?.featured ?? false,
    published:    initial?.published ?? true,
    outcome:      initial?.outcome ?? "",
    phase:        initial?.phase ?? "",
    launchTarget: initial?.launchTarget ?? "",
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function set<K extends keyof FormValues>(k: K, v: FormValues[K]) {
    setValues((prev) => ({ ...prev, [k]: v }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      const url = mode === "create" ? "/api/admin/projects" : `/api/admin/projects/${projectId}`;
      const method = mode === "create" ? "POST" : "PUT";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Save failed");

      router.push("/admin/projects");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
      setSaving(false);
    }
  }

  const showOutcome = values.status === "completed";
  const showPhase = values.status === "upcoming";

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      {error && <p className={styles.error}>{error}</p>}

      {/* Title */}
      <div className={styles.field}>
        <label className={styles.label}>Title *</label>
        <input
          className={styles.input}
          value={values.title}
          onChange={(e) => set("title", e.target.value)}
          required
          placeholder="Nepal Meteor Network Phase II…"
        />
      </div>

      {/* Description */}
      <div className={styles.field}>
        <label className={styles.label}>Description *</label>
        <textarea
          className={styles.textarea}
          rows={4}
          value={values.description}
          onChange={(e) => set("description", e.target.value)}
          required
          placeholder="A detailed description of the project…"
        />
      </div>

      {/* Status + Category */}
      <div className={styles.row}>
        <div className={styles.field}>
          <label className={styles.label}>Status *</label>
          <select
            className={styles.select}
            value={values.status}
            onChange={(e) => set("status", e.target.value)}
          >
            <option value="ongoing">Ongoing</option>
            <option value="completed">Completed</option>
            <option value="upcoming">Upcoming</option>
          </select>
        </div>
        <div className={styles.field}>
          <label className={styles.label}>Category *</label>
          {categories.length === 0 ? (
            <p className={styles.hint}>
              No categories yet.{" "}
              <a href="/admin/categories" style={{ color: "var(--color-brand-gold)" }}>
                Create one first.
              </a>
            </p>
          ) : (
            <select
              className={styles.select}
              value={values.categoryId}
              onChange={(e) => set("categoryId", e.target.value)}
              required
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Period + Tags */}
      <div className={styles.row}>
        <div className={styles.field}>
          <label className={styles.label}>Period *</label>
          <input
            className={styles.input}
            value={values.period}
            onChange={(e) => set("period", e.target.value)}
            required
            placeholder="2023 – present"
          />
        </div>
        <div className={styles.field}>
          <label className={styles.label}>
            Tags <span className={styles.optional}>(comma-separated)</span>
          </label>
          <input
            className={styles.input}
            value={values.tags}
            onChange={(e) => set("tags", e.target.value)}
            placeholder="meteor, detection, atmospheric"
          />
        </div>
      </div>

      {/* Image URL + Href */}
      <div className={styles.row}>
        <div className={styles.field}>
          <label className={styles.label}>
            Image URL <span className={styles.optional}>(optional)</span>
          </label>
          <input
            className={styles.input}
            value={values.imageUrl}
            onChange={(e) => set("imageUrl", e.target.value)}
            placeholder="https://…"
          />
        </div>
        <div className={styles.field}>
          <label className={styles.label}>Link (href) *</label>
          <input
            className={styles.input}
            value={values.href}
            onChange={(e) => set("href", e.target.value)}
            required
            placeholder="/projects/nepal-meteor-network"
          />
        </div>
      </div>

      {/* Conditional: outcome (completed) */}
      {showOutcome && (
        <div className={styles.field}>
          <label className={styles.label}>
            Outcome <span className={styles.optional}>(optional)</span>
          </label>
          <textarea
            className={styles.textarea}
            rows={3}
            value={values.outcome}
            onChange={(e) => set("outcome", e.target.value)}
            placeholder="Key results and outcomes of this completed project…"
          />
        </div>
      )}

      {/* Conditional: phase + launch target (upcoming) */}
      {showPhase && (
        <div className={styles.row}>
          <div className={styles.field}>
            <label className={styles.label}>
              Phase <span className={styles.optional}>(optional)</span>
            </label>
            <input
              className={styles.input}
              value={values.phase}
              onChange={(e) => set("phase", e.target.value)}
              placeholder="Planning / Development / Testing"
            />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>
              Launch target <span className={styles.optional}>(optional)</span>
            </label>
            <input
              className={styles.input}
              value={values.launchTarget}
              onChange={(e) => set("launchTarget", e.target.value)}
              placeholder="Q3 2026"
            />
          </div>
        </div>
      )}

      {/* Checkboxes */}
      <div className={styles.checkRow}>
        <label className={styles.checkLabel}>
          <input
            type="checkbox"
            checked={values.featured}
            onChange={(e) => set("featured", e.target.checked)}
            className={styles.checkbox}
          />
          Featured (shown on homepage)
        </label>
        <label className={styles.checkLabel}>
          <input
            type="checkbox"
            checked={values.published}
            onChange={(e) => set("published", e.target.checked)}
            className={styles.checkbox}
          />
          Published (visible on site)
        </label>
      </div>

      {/* Actions */}
      <div className={styles.formActions}>
        <button type="button" className={styles.cancelBtn} onClick={() => router.back()}>
          Cancel
        </button>
        <button type="submit" className={styles.saveBtn} disabled={saving || categories.length === 0}>
          {saving
            ? <><Loader2 size={15} className={styles.spin} /> Saving…</>
            : mode === "create" ? "Create project" : "Save changes"}
        </button>
      </div>
    </form>
  );
}
