"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Search } from "lucide-react";
import { useTransition } from "react";
import styles from "../cms.module.css";

export function MemberSearch() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [, startTransition] = useTransition();

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const q = e.target.value;
    const next = new URLSearchParams(params.toString());
    if (q) next.set("search", q);
    else next.delete("search");
    startTransition(() => router.replace(`${pathname}?${next.toString()}`));
  }

  return (
    <div className={styles.searchWrap}>
      <Search size={14} className={styles.searchIcon} />
      <input
        type="search"
        placeholder="Search by name or email…"
        defaultValue={params.get("search") ?? ""}
        onChange={handleChange}
        className={styles.searchInput}
      />
    </div>
  );
}
