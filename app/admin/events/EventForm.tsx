"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import styles from "../cms.module.css";

type FormValues = {
  title: string;
  description: string;
  type: string;
  date: string;
  time: string;
  location: string;
  locationDetail: string;
  seats: string;
  seatsLeft: string;
  href: string;
  registrationHref: string;
  published: boolean;
};

type Props = {
  mode: "create" | "edit";
  eventId?: string;
  initial?: Partial<FormValues>;
};

export function EventForm({ mode, eventId, initial }: Props) {
  const router = useRouter();

  const [values, setValues] = useState<FormValues>({
    title: initial?.title ?? "",
    description: initial?.description ?? "",
    type: initial?.type ?? "observation",
    date: initial?.date ?? new Date().toISOString().split("T")[0],
    time: initial?.time ?? "6:00 PM NPT",
    location: initial?.location ?? "",
    locationDetail: initial?.locationDetail ?? "",
    seats: initial?.seats ?? "",
    seatsLeft: initial?.seatsLeft ?? "",
    href: initial?.href ?? "",
    registrationHref: initial?.registrationHref ?? "",
    published: initial?.published ?? true,
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
      const url = mode === "create" ? "/api/admin/events" : `/api/admin/events/${eventId}`;
      const method = mode === "create" ? "POST" : "PUT";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...values,
          seats: values.seats ? Number(values.seats) : null,
          seatsLeft: values.seatsLeft ? Number(values.seatsLeft) : null,
          locationDetail: values.locationDetail || null,
          registrationHref: values.registrationHref || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Save failed");
      router.push("/admin/events");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed");
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      {error && <p className={styles.error}>{error}</p>}

      {/* Title */}
      <div className={styles.field}>
        <label className={styles.label}>Title *</label>
        <input className={styles.input} value={values.title} onChange={(e) => set("title", e.target.value)} required placeholder="Lyrid Meteor Watch Night" />
      </div>

      {/* Description */}
      <div className={styles.field}>
        <label className={styles.label}>Description *</label>
        <textarea className={styles.textarea} rows={4} value={values.description} onChange={(e) => set("description", e.target.value)} required placeholder="A short description shown on the events listing…" />
      </div>

      {/* Type + Date + Time */}
      <div className={styles.row3}>
        <div className={styles.field}>
          <label className={styles.label}>Type *</label>
          <select className={styles.select} value={values.type} onChange={(e) => set("type", e.target.value)}>
            <option value="observation">Observation</option>
            <option value="workshop">Workshop</option>
            <option value="lecture">Lecture</option>
            <option value="outreach">Outreach</option>
            <option value="conference">Conference</option>
          </select>
        </div>
        <div className={styles.field}>
          <label className={styles.label}>Date *</label>
          <input className={styles.input} type="date" value={values.date} onChange={(e) => set("date", e.target.value)} required />
        </div>
        <div className={styles.field}>
          <label className={styles.label}>Time *</label>
          <input className={styles.input} value={values.time} onChange={(e) => set("time", e.target.value)} required placeholder="8:00 PM NPT" />
        </div>
      </div>

      {/* Location + Detail */}
      <div className={styles.row}>
        <div className={styles.field}>
          <label className={styles.label}>Location *</label>
          <input className={styles.input} value={values.location} onChange={(e) => set("location", e.target.value)} required placeholder="Nagarkot, Bhaktapur" />
        </div>
        <div className={styles.field}>
          <label className={styles.label}>Location detail <span className={styles.optional}>(venue name)</span></label>
          <input className={styles.input} value={values.locationDetail} onChange={(e) => set("locationDetail", e.target.value)} placeholder="Dark Sky Site" />
        </div>
      </div>

      {/* Seats */}
      <div className={styles.row}>
        <div className={styles.field}>
          <label className={styles.label}>Total seats <span className={styles.optional}>(leave blank for unlimited)</span></label>
          <input className={styles.input} type="number" min={1} value={values.seats} onChange={(e) => set("seats", e.target.value)} placeholder="40" />
        </div>
        <div className={styles.field}>
          <label className={styles.label}>Seats remaining</label>
          <input className={styles.input} type="number" min={0} value={values.seatsLeft} onChange={(e) => set("seatsLeft", e.target.value)} placeholder="12" />
        </div>
      </div>

      {/* Href + Registration */}
      <div className={styles.row}>
        <div className={styles.field}>
          <label className={styles.label}>Event page path *</label>
          <input className={styles.input} value={values.href} onChange={(e) => set("href", e.target.value)} required placeholder="/events/lyrid-2026" />
        </div>
        <div className={styles.field}>
          <label className={styles.label}>Registration link <span className={styles.optional}>(optional)</span></label>
          <input className={styles.input} value={values.registrationHref} onChange={(e) => set("registrationHref", e.target.value)} placeholder="/events/lyrid-2026#register" />
        </div>
      </div>

      {/* Published */}
      <div className={styles.checkRow}>
        <label className={styles.checkLabel}>
          <input type="checkbox" checked={values.published} onChange={(e) => set("published", e.target.checked)} className={styles.checkbox} />
          Published (visible on site)
        </label>
      </div>

      {/* Actions */}
      <div className={styles.formActions}>
        <button type="button" className={styles.cancelBtn} onClick={() => router.back()}>Cancel</button>
        <button type="submit" className={styles.saveBtn} disabled={saving}>
          {saving ? <><Loader2 size={15} className={styles.spin} /> Saving…</> : mode === "create" ? "Create event" : "Save changes"}
        </button>
      </div>
    </form>
  );
}
