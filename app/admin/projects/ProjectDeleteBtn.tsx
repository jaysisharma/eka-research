"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Loader2 } from "lucide-react";
import styles from "../cms.module.css";

interface Props {
  id: string;
  title: string;
}

export function ProjectDeleteBtn({ id, title }: Props) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function handleDelete() {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;
    setBusy(true);
    await fetch(`/api/admin/projects/${id}`, { method: "DELETE" });
    router.refresh();
    setBusy(false);
  }

  return (
    <button
      onClick={handleDelete}
      disabled={busy}
      className={styles.deleteBtn}
      title="Delete project"
    >
      {busy ? <Loader2 size={14} className={styles.spin} /> : <Trash2 size={14} />}
    </button>
  );
}
