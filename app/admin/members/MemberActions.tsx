"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2, CheckCircle, XCircle } from "lucide-react";
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
  name: string;
  role: string;
  requestedRole?: string;
  isSelf: boolean;
}

export function MemberActions({ id, name, role, requestedRole, isSelf }: Props) {
  const router = useRouter();
  const [activeAction, setActiveAction] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [selectedRole, setSelectedRole] = useState<UserRole>(
    ALL_ROLES.includes(role as UserRole) ? (role as UserRole) : "FREE_USER"
  );

  async function request(action: string, body: object) {
    setActiveAction(action);
    setError("");
    try {
      const res = await fetch(`/api/admin/members/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "Action failed. Please try again.");
        return;
      }
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setActiveAction(null);
    }
  }

  async function handleRoleChange(newRole: UserRole) {
    if (newRole === role) return;
    setSelectedRole(newRole);
    await request("role", { role: newRole });
  }

  async function approveRequest() {
    await request("approve", { action: "approve" });
  }

  async function denyRequest() {
    await request("deny", { action: "deny" });
  }

  async function deleteMember() {
    if (!confirm(`Delete ${name}? This cannot be undone.`)) return;
    setActiveAction("delete");
    setError("");
    try {
      const res = await fetch(`/api/admin/members/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "Delete failed.");
        return;
      }
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setActiveAction(null);
    }
  }

  if (isSelf) {
    return (
      <div className={styles.actions}>
        <span className={styles.tdMuted} style={{ fontSize: "var(--text-xs)" }}>you</span>
      </div>
    );
  }

  const busy = activeAction !== null;

  return (
    <div>
      <div className={styles.actions}>
        {requestedRole && (
          <>
            <button
              onClick={approveRequest}
              disabled={busy}
              className={styles.approveBtn}
              title={`Approve as ${ROLE_LABELS[requestedRole as UserRole] ?? requestedRole}`}
            >
              {activeAction === "approve" ? "…" : <><CheckCircle size={14} /> Approve</>}
            </button>
            <button
              onClick={denyRequest}
              disabled={busy}
              className={styles.deleteBtn}
              title="Deny request"
            >
              {activeAction === "deny" ? "…" : <XCircle size={14} />}
            </button>
          </>
        )}
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
          title={`Delete ${name}`}
        >
          {activeAction === "delete" ? "…" : <Trash2 size={14} />}
        </button>
      </div>
      {error && (
        <p style={{ fontSize: "var(--text-xs)", color: "#f87171", marginTop: "var(--space-1)" }} role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
