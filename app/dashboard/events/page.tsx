import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Calendar, MapPin, Clock, ArrowRight } from "lucide-react";
import { buildMetadata } from "@/lib/seo";
import styles from "./page.module.css";

export const metadata = buildMetadata({
  title: "My Events",
  description: "Events you have registered for at Eka Research.",
  path: "/dashboard/events",
});

const EVENT_TYPE_COLORS: Record<string, string> = {
  Workshop:   "workshop",
  Seminar:    "seminar",
  Conference: "conference",
  Webinar:    "webinar",
  Observation:"observation",
};

export default async function MyEventsPage() {
  const session = await auth();
  if (!session) redirect("/auth/login");

  const userId = (session.user as { id: string }).id;

  const registrations = await db.eventRegistration.findMany({
    where: { userId },
    include: { event: true },
    orderBy: { createdAt: "desc" },
  });

  const now = new Date();

  // Split into upcoming and past using a simple date comparison
  const upcoming: typeof registrations = [];
  const past:     typeof registrations = [];

  for (const reg of registrations) {
    // event.date is a string like "2025-06-12" or "June 12, 2025"
    // Attempt to parse; if invalid fall into upcoming by default
    const parsed = new Date(reg.event.date);
    const bucket = !isNaN(parsed.getTime()) && parsed < now ? past : upcoming;
    bucket.push(reg);
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.heading}>My Events</h1>
          <p className={styles.sub}>
            {registrations.length} event{registrations.length !== 1 ? "s" : ""} registered
          </p>
        </div>
        <Link href="/events" className={styles.browseBtn}>
          Browse Events <ArrowRight size={14} />
        </Link>
      </header>

      {registrations.length === 0 ? (
        <div className={styles.emptyFull}>
          <Calendar size={40} strokeWidth={1} />
          <p className={styles.emptyTitle}>No events registered yet</p>
          <p className={styles.emptySub}>
            Join workshops, seminars, and observation sessions hosted by Eka Research.
          </p>
          <Link href="/events" className={styles.emptyBtn}>
            Browse Upcoming Events
          </Link>
        </div>
      ) : (
        <>
          {/* UPCOMING */}
          {upcoming.length > 0 && (
            <section>
              <h2 className={styles.sectionHeading}>Upcoming</h2>
              <div className={styles.list}>
                {upcoming.map((reg) => (
                  <EventCard key={reg.id} reg={reg} />
                ))}
              </div>
            </section>
          )}

          {/* PAST */}
          {past.length > 0 && (
            <section>
              <h2 className={styles.sectionHeading}>Past</h2>
              <div className={styles.list}>
                {past.map((reg) => (
                  <EventCard key={reg.id} reg={reg} dimmed />
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}

type RegWithEvent = {
  id: string;
  event: {
    title: string;
    date: string;
    time: string;
    location: string;
    type: string;
    description: string;
    seatsLeft: number | null;
  };
};

function EventCard({
  reg,
  dimmed = false,
}: {
  reg: RegWithEvent;
  dimmed?: boolean;
}) {
  const ev = reg.event;
  if (!ev) return null;

  const typeKey = EVENT_TYPE_COLORS[ev.type] ?? "default";

  return (
    <div className={`${styles.card} ${dimmed ? styles.dimmed : ""}`}>
      <div className={styles.cardLeft}>
        <div className={`${styles.typeBadge} ${styles[`type_${typeKey}`]}`}>
          {ev.type}
        </div>
        <h3 className={styles.eventTitle}>{ev.title}</h3>
        <div className={styles.eventMeta}>
          <span className={styles.metaItem}>
            <Calendar size={13} />
            {ev.date}
          </span>
          <span className={styles.metaDivider}>·</span>
          <span className={styles.metaItem}>
            <Clock size={13} />
            {ev.time}
          </span>
          <span className={styles.metaDivider}>·</span>
          <span className={styles.metaItem}>
            <MapPin size={13} />
            {ev.location}
          </span>
        </div>
        {ev.description && (
          <p className={styles.eventDesc}>
            {ev.description.length > 140
              ? ev.description.slice(0, 140) + "…"
              : ev.description}
          </p>
        )}
      </div>

      <div className={styles.cardRight}>
        <span className={styles.registeredBadge}>Registered</span>
        {ev.seatsLeft !== null && ev.seatsLeft !== undefined && (
          <span className={styles.seatsLabel}>
            {ev.seatsLeft} seat{ev.seatsLeft !== 1 ? "s" : ""} left
          </span>
        )}
      </div>
    </div>
  );
}
