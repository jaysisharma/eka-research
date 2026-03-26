export const dynamic = "force-dynamic";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { ArrowLeft, Users, Phone, Mail, CheckCircle, Clock } from "lucide-react";
import styles from "./page.module.css";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    day: "numeric", month: "short", year: "numeric",
  });
}

function formatRegDate(d: Date) {
  return new Date(d).toLocaleDateString("en-US", {
    day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
  });
}

export default async function RegistrantsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") redirect("/auth/login");

  const { id } = await params;

  const event = await db.event.findUnique({
    where: { id },
    include: {
      registrations: {
        orderBy: { createdAt: "asc" },
        include: { user: { select: { id: true, role: true } } },
      },
    },
  });

  if (!event) redirect("/admin/events");

  const confirmed  = event.registrations.filter(r => r.status === "confirmed");
  const waitlisted = event.registrations.filter(r => r.status === "waitlisted");

  return (
    <div className={styles.page}>

      <div className={styles.header}>
        <Link href="/admin/events" className={styles.back}>
          <ArrowLeft size={14} /> Events
        </Link>

        <div className={styles.headerMain}>
          <div className={styles.headerText}>
            <h1 className={styles.heading}>{event.title}</h1>
            <p className={styles.sub}>
              {formatDate(event.date)} · {event.time} · {event.locationDetail ? `${event.locationDetail}, ` : ""}{event.location}
            </p>
          </div>

          <div className={styles.stats}>
            <div className={styles.stat}>
              <Users size={14} />
              <span>{event.registrations.length} registered</span>
            </div>
            {event.seats !== null && (
              <div className={styles.stat}>
                <span>{event.seatsLeft} / {event.seats} seats left</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {event.registrations.length === 0 ? (
        <div className={styles.empty}>
          <Users size={32} />
          <p>No registrations yet.</p>
        </div>
      ) : (
        <>
          {confirmed.length > 0 && (
            <div className={styles.group}>
              <div className={styles.groupHeader}>
                <CheckCircle size={15} className={styles.confirmedIcon} />
                <span>Confirmed ({confirmed.length})</span>
              </div>
              <div className={styles.tableWrap}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th className={styles.th}>#</th>
                      <th className={styles.th}>Name</th>
                      <th className={styles.th}>Email</th>
                      <th className={styles.th}>Phone</th>
                      <th className={styles.th}>Member</th>
                      <th className={styles.th}>Message</th>
                      <th className={styles.th}>Registered</th>
                    </tr>
                  </thead>
                  <tbody>
                    {confirmed.map((r, i) => (
                      <tr key={r.id} className={styles.tr}>
                        <td className={`${styles.td} ${styles.tdMuted}`}>{i + 1}</td>
                        <td className={styles.td}>
                          <span className={styles.name}>{r.name}</span>
                        </td>
                        <td className={styles.td}>
                          <a href={`mailto:${r.email}`} className={styles.emailLink}>
                            <Mail size={12} />{r.email}
                          </a>
                        </td>
                        <td className={`${styles.td} ${styles.tdMuted}`}>
                          {r.phone
                            ? <span className={styles.phone}><Phone size={12} />{r.phone}</span>
                            : <span className={styles.tdMuted}>—</span>}
                        </td>
                        <td className={styles.td}>
                          {r.user
                            ? <span className={styles.memberBadge}>{r.user.role}</span>
                            : <span className={styles.tdMuted}>Guest</span>}
                        </td>
                        <td className={`${styles.td} ${styles.tdMuted}`}>
                          {r.message
                            ? <span title={r.message} className={styles.message}>{r.message.slice(0, 40)}{r.message.length > 40 ? "…" : ""}</span>
                            : "—"}
                        </td>
                        <td className={`${styles.td} ${styles.tdMuted}`}>
                          {formatRegDate(r.createdAt)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {waitlisted.length > 0 && (
            <div className={styles.group}>
              <div className={styles.groupHeader}>
                <Clock size={15} className={styles.waitlistIcon} />
                <span>Waitlisted ({waitlisted.length})</span>
              </div>
              <div className={styles.tableWrap}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th className={styles.th}>#</th>
                      <th className={styles.th}>Name</th>
                      <th className={styles.th}>Email</th>
                      <th className={styles.th}>Registered</th>
                    </tr>
                  </thead>
                  <tbody>
                    {waitlisted.map((r, i) => (
                      <tr key={r.id} className={styles.tr}>
                        <td className={`${styles.td} ${styles.tdMuted}`}>{i + 1}</td>
                        <td className={styles.td}><span className={styles.name}>{r.name}</span></td>
                        <td className={styles.td}>
                          <a href={`mailto:${r.email}`} className={styles.emailLink}>
                            <Mail size={12} />{r.email}
                          </a>
                        </td>
                        <td className={`${styles.td} ${styles.tdMuted}`}>{formatRegDate(r.createdAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
