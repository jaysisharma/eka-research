"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import styles from "../cms.module.css";
import type { UserRole } from "@/lib/access";

const ALL_ROLES: UserRole[] = [
  "FREE_USER",
  "TEACHER",
  "RESEARCHER",
  "MENTOR",
  "PAID_MEMBER",
  "ADMIN",
];

const ROLE_LABELS: Record<UserRole, string> = {
  FREE_USER:   "Free Member",
  TEACHER:     "Teacher",
  RESEARCHER:  "Researcher",
  MENTOR:      "Mentor",
  PAID_MEMBER: "Premium Member",
  ADMIN:       "Admin",
};

interface Props {
  id: string;
  role: string;
  isSelf: boolean;
}

export function MemberActions({ id, role, isSelf }: Props) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [selectedRole, setSelectedRole] = useState<UserRole>(
    ALL_ROLES.includes(role as UserRole) ? (role as UserRole) : "FREE_USER"
  );

  async function handleRoleChange(newRole: UserRole) {
    if (newRole === role) return;
    setBusy(true);
    await fetch(`/api/admin/members/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role: newRole }),
    });
    setSelectedRole(newRole);
    router.refresh();
    setBusy(false);
  }

  async function deleteMember() {
    if (!confirm("Delete this member? This cannot be undone.")) return;
    setBusy(true);
    await fetch(`/api/admin/members/${id}`, { method: "DELETE" });
    router.refresh();
    setBusy(false);
  }

  if (isSelf) {
    return (
      <div className={styles.actions}>
        <span className={styles.tdMuted} style={{ fontSize: "var(--text-xs)" }}>you</span>
      </div>
    );
  }

  return (
    <div className={styles.actions}>
      <select
        value={selectedRole}
        onChange={(e) => handleRoleChange(e.target.value as UserRole)}
        disabled={busy}
        className={styles.select}
        style={{ padding: "var(--space-1) var(--space-2)", fontSize: "var(--text-xs)", minWidth: 130 }}
      >
        {ALL_ROLES.map((r) => (
          <option key={r} value={r}>{ROLE_LABELS[r]}</option>
        ))}
      </select>
      <button
        onClick={deleteMember}
        disabled={busy}
        className={styles.deleteBtn}
        title="Delete member"
      >
        <Trash2 size={14} />
      </button>
    </div>
  );
}
