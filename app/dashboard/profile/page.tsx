"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { 
  Loader2, 
  Award,
} from "lucide-react";
import styles from "./page.module.css";

export default function ProfilePage() {
  const { data: session, update } = useSession();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    level: "",
    interest: "",
  });

  useEffect(() => {
    if (session?.user) {
      setFormData({
        name: session.user.name ?? "",
        email: session.user.email ?? "",
        level: (session.user as any).level ?? "",
        interest: (session.user as any).interest ?? "",
      });
      setLoading(false);
    }
  }, [session]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const res = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update profile");

      await update({
        ...session,
        user: {
          ...session?.user,
          name: formData.name,
          level: formData.level,
          interest: formData.interest,
        },
      });

      setMessage({ type: "success", text: "Profile updated successfully." });
    } catch (err: any) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.loader}>
        <Loader2 size={32} className={styles.spin} />
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.minimalWrapper}>
        {/* Header */}
        <header className={styles.minimalHeader}>
          <div className={styles.avatarLarge}>
            {formData.name?.[0]?.toUpperCase()}
          </div>
          <div className={styles.headerInfo}>
            <h1 className={styles.userNameTitle}>{formData.name}</h1>
            <p className={styles.userRoleText}>
              {(session?.user as any).role === "FREE_USER" ? "Standard Member" : "Researcher"}
            </p>
          </div>
        </header>

        <main className={styles.settingsSections}>
          {/* Profile Section */}
          <section className={styles.minimalSection}>
            <h2 className={styles.sectionHeading}>Profile Settings</h2>
            <form onSubmit={handleSubmit} className={styles.minimalForm}>
              <div className={styles.inputGroup}>
                <label>Full Name</label>
                <input 
                  type="text" 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                />
              </div>

              <div className={styles.inputGroup}>
                <label>Email Address</label>
                <input type="email" value={formData.email} disabled className={styles.disabledInput} />
                <span className={styles.hint}>Institutional email cannot be modified.</span>
              </div>

              <div className={styles.inputGroup}>
                <label>Academic Level</label>
                <select 
                  value={formData.level}
                  onChange={(e) => setFormData({...formData, level: e.target.value})}
                >
                  <option value="High School">High School</option>
                  <option value="Undergraduate">Undergraduate</option>
                  <option value="Graduate">Graduate</option>
                  <option value="PhD">Postgraduate / Researcher</option>
                  <option value="Independent">Independent Observer</option>
                </select>
              </div>

              <div className={styles.inputGroup}>
                <label>Research Interest</label>
                <input 
                  type="text" 
                  value={formData.interest}
                  onChange={(e) => setFormData({...formData, interest: e.target.value})}
                  placeholder="e.g. Space Weather, Astrophysics"
                />
              </div>

              {message && <div className={`${styles.statusMsg} ${styles[message.type]}`}>{message.text}</div>}

              <button type="submit" className={styles.saveAction} disabled={saving}>
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </form>
          </section>

          {/* Membership Section */}
          <section className={styles.minimalSection}>
            <h2 className={styles.sectionHeading}>Membership Status</h2>
            <div className={styles.membershipBox}>
              <div className={styles.boxLeft}>
                <Award size={20} className={styles.goldIcon} />
                <div>
                  <p className={styles.boxTitle}>Researcher Credentials</p>
                  <p className={styles.boxDesc}>Verify your academic identity to unlock research tools.</p>
                </div>
              </div>
              
              {(session?.user as any).requestedRole === "RESEARCHER" ? (
                <span className={styles.statusBadgePending}>Verification Pending</span>
              ) : (session?.user as any).role === "FREE_USER" ? (
                <button 
                  className={styles.upgradeInlineBtn}
                  onClick={async () => {
                    await fetch("/api/user/upgrade", { method: "POST" });
                    await update();
                  }}
                >
                  Apply
                </button>
              ) : (
                <span className={styles.statusBadgeActive}>Verified Researcher</span>
              )}
            </div>
          </section>

          {/* Account Section */}
          <section className={styles.minimalSection}>
            <h2 className={styles.sectionHeading}>Account Control</h2>
            <div className={styles.dangerActions}>
              <button className={styles.textBtn}>Update Password</button>
              <button className={styles.deleteTextBtn}>Deactivate Account</button>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
