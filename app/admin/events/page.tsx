import Link from "next/link";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { Plus, Pencil, Eye, EyeOff, CalendarDays, Users } from "lucide-react";
import { DeleteBtn } from "../news/DeleteBtn";
import styles from "../cms.module.css";

const TYPE_LABEL: Record<string, string> = {
  observation: "Observation", workshop: "Workshop",
  lecture: "Lecture", outreach: "Outreach", conference: "Conference",
};

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" });
}

export default async function AdminEventsPage() {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") redirect("/auth/login");

  const events = await db.event.findMany({
    orderBy: { date: "asc" },
    include: { _count: { select: { registrations: true } } },
  });
  const today = new Date().toISOString().split("T")[0];

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div className={styles.headerText}>
          <h1 className={styles.heading}>Events</h1>
          <p className={styles.sub}>{events.length} event{events.length !== 1 ? "s" : ""}</p>
        </div>
        <Link href="/admin/events/new" className={styles.addBtn}>
          <Plus size={15} /> New event
        </Link>
      </div>

      {events.length === 0 ? (
        <div className={styles.empty}>
          <p>No events yet.</p>
          <Link href="/admin/events/new" className={styles.addBtn}><Plus size={14} /> Create first event</Link>
        </div>
      ) : (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th className={styles.th}>Title</th>
                <th className={styles.th}>Type</th>
                <th className={styles.th}>Date</th>
                <th className={styles.th}>Location</th>
                <th className={styles.th}>Seats</th>
                <th className={styles.th}>Registrants</th>
                <th className={styles.th}>Status</th>
                <th className={styles.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {events.map((ev) => {
                const isPast = ev.date < today;
                return (
                  <tr key={ev.id} className={styles.tr}>
                    <td className={styles.td}>
                      <div className={styles.titleCell}>
                        <CalendarDays size={14} style={{ color: "var(--text-muted)", flexShrink: 0 }} />
                        <span className={styles.titleText}>{ev.title}</span>
                      </div>
                    </td>
                    <td className={`${styles.td} ${styles.tdMuted}`}>{TYPE_LABEL[ev.type] ?? ev.type}</td>
                    <td className={`${styles.td} ${styles.tdMuted}`}>
                      <span style={{ color: isPast ? "var(--text-muted)" : "var(--text-secondary)" }}>
                        {formatDate(ev.date)}
                      </span>
                    </td>
                    <td className={`${styles.td} ${styles.tdMuted}`}>
                      {ev.locationDetail ? `${ev.locationDetail}, ${ev.location}` : ev.location}
                    </td>
                    <td className={`${styles.td} ${styles.tdMuted}`}>
                      {ev.seats ? `${ev.seatsLeft ?? ev.seats} / ${ev.seats}` : "—"}
                    </td>
                    <td className={styles.td}>
                      <Link
                        href={`/admin/events/${ev.id}/registrants`}
                        style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "var(--text-sm)", color: ev._count.registrations > 0 ? "var(--color-brand-gold)" : "var(--text-muted)", textDecoration: "none" }}
                      >
                        <Users size={13} />
                        {ev._count.registrations}
                      </Link>
                    </td>
                    <td className={styles.td}>
                      <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                        {ev.published
                          ? <span className={styles.badgePublished}><Eye size={12} /> Published</span>
                          : <span className={styles.badgeDraft}><EyeOff size={12} /> Draft</span>}
                        {isPast && <span className={styles.badgeDraft}>Past</span>}
                      </div>
                    </td>
                    <td className={styles.td}>
                      <div className={styles.actions}>
                        <Link href={`/admin/events/${ev.id}/edit`} className={styles.editBtn} title="Edit"><Pencil size={14} /></Link>
                        <DeleteBtn id={ev.id} title={ev.title} endpoint="/api/admin/events" />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
