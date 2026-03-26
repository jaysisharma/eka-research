"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, Loader2 } from "lucide-react";
import styles from "../cms.module.css";
import catStyles from "./categories.module.css";


// Category Actions
export function CategoryActions() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    setError("");

    try {
      const res = await fetch("/api/admin/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to create category");
      setName("");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create category");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className={catStyles.addForm}>
      <form onSubmit={handleAdd} className={catStyles.addRow}>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="New category name…"
          className={styles.input}
          style={{ maxWidth: 320 }}
        />
        <button type="submit" className={styles.addBtn} disabled={saving || !name.trim()}>
          {saving ? <Loader2 size={14} className={styles.spin} /> : <Plus size={14} />}
          Add category
        </button>
      </form>
      {error && <p className={styles.error} style={{ marginTop: "var(--space-2)" }}>{error}</p>}
    </div>
  );
}

interface DeleteProps {
  id: string;
  name: string;
  disabled?: boolean;
}

export function CategoryDeleteClient({ id, name, disabled = false }: DeleteProps) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function handleDelete() {
    if (!confirm(`Delete category "${name}"? This cannot be undone.`)) return;
    setBusy(true);
    const res = await fetch(`/api/admin/categories/${id}`, { method: "DELETE" });
    if (!res.ok) {
      const data = await res.json();
      alert(data.error ?? "Failed to delete.");
    } else {
      router.refresh();
    }
    setBusy(false);
  }

  return (
    <button
      onClick={handleDelete}
      disabled={busy || disabled}
      className={styles.deleteBtn}
      title={disabled ? "Cannot delete: category has projects" : "Delete category"}
    >
      {busy ? <Loader2 size={14} className={styles.spin} /> : <Trash2 size={14} />}
    </button>
  );
}
