"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import styles from "../cms.module.css";

export function DeleteBtn({ id, title, endpoint }: { id: string; title: string; endpoint: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function handleDelete() {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;
    setBusy(true);
    try {
      await fetch(`${endpoint}/${id}`, { method: "DELETE" });
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <button className={styles.deleteBtn} onClick={handleDelete} disabled={busy} title="Delete">
      <Trash2 size={14} />
    </button>
  );
}
