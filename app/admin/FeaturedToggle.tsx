"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Star } from "lucide-react";
import styles from "./cms.module.css";

type Props = { id: string; featured: boolean; endpoint: string };

export function FeaturedToggle({ id, featured, endpoint }: Props) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function toggle() {
    setBusy(true);
    try {
      await fetch(`${endpoint}/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ featured: !featured }),
      });
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      className={featured ? styles.starBtnActive : styles.starBtn}
      onClick={toggle}
      disabled={busy}
      title={featured ? "Remove from featured" : "Mark as featured"}
    >
      <Star size={14} />
    </button>
  );
}
