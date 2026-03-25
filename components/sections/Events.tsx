import Link from "next/link";
import { ArrowRight, MapPin, Clock, Users } from "lucide-react";
import { EVENTS, type EkaEvent } from "@/lib/constants";
import styles from "./Events.module.css";

const TYPE_LABEL: Record<EkaEvent["type"], string> = {
  observation:  "Observation",
  workshop:     "Workshop",
  lecture:      "Lecture",
  outreach:     "Outreach",
  conference:   "Conference",
};

function formatDate(iso: string) {
  const d = new Date(iso);
  return {
    day:   d.toLocaleDateString("en-US", { day: "2-digit" }),
    month: d.toLocaleDateString("en-US", { month: "short" }).toUpperCase(),
    full:  d.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" }),
  };
}

function SeatsBar({ seats, seatsLeft }: { seats: number; seatsLeft: number }) {
  const pct = Math.round(((seats - seatsLeft) / seats) * 100);
  const urgent = seatsLeft <= 10;
  return (
    <div className={styles.seatsRow}>
      <div className={styles.seatsBar}>
        <div
          className={`${styles.seatsFill} ${urgent ? styles.seatsFillUrgent : ""}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className={`${styles.seatsText} ${urgent ? styles.seatsTextUrgent : ""}`}>
        {seatsLeft} seat{seatsLeft !== 1 ? "s" : ""} left
      </span>
    </div>
  );
}

export default function Events() {
  return (
    <section className={styles.section} id="events">
      <div className={styles.inner}>

        {/* Header */}
        <div className={styles.header}>
          <span className={styles.label}>
            <span className={styles.labelLine} />
            Upcoming Events
            <span className={styles.labelLine} />
          </span>
          <div className={styles.headerRow}>
            <h2 className={styles.heading}>Come join us in person</h2>
            <Link href="/events" className={styles.viewAll}>
              All events <ArrowRight size={14} />
            </Link>
          </div>
          <p className={styles.subheading}>
            Observation nights, workshops, and public lectures — open to students,
            researchers, and the curious alike.
          </p>
        </div>

        {/* Event list */}
        <div className={styles.list}>
          {EVENTS.map((event) => {
            const date = formatDate(event.date);
            return (
              <article key={event.id} className={styles.card}>

                {/* Date block */}
                <div className={styles.dateBlock} aria-label={date.full}>
                  <span className={styles.dateDay}>{date.day}</span>
                  <span className={styles.dateMonth}>{date.month}</span>
                </div>

                {/* Divider */}
                <div className={styles.divider} aria-hidden="true" />

                {/* Content */}
                <div className={styles.content}>
                  <div className={styles.topRow}>
                    <span className={`${styles.typeBadge} ${styles[`type_${event.type}`]}`}>
                      {TYPE_LABEL[event.type]}
                    </span>
                    {event.seats && event.seatsLeft !== undefined && (
                      <SeatsBar seats={event.seats} seatsLeft={event.seatsLeft} />
                    )}
                  </div>

                  <Link href={event.href} className={styles.title}>
                    {event.title}
                  </Link>

                  <p className={styles.description}>{event.description}</p>

                  <div className={styles.meta}>
                    <span className={styles.metaItem}>
                      <Clock size={13} />
                      {event.time}
                    </span>
                    <span className={styles.metaDot} aria-hidden="true" />
                    <span className={styles.metaItem}>
                      <MapPin size={13} />
                      {event.locationDetail
                        ? `${event.locationDetail}, ${event.location}`
                        : event.location}
                    </span>
                    {event.seats && (
                      <>
                        <span className={styles.metaDot} aria-hidden="true" />
                        <span className={styles.metaItem}>
                          <Users size={13} />
                          {event.seats} seats
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {/* CTA */}
                {event.registrationHref && (
                  <Link href={event.registrationHref} className={styles.register}>
                    Register
                  </Link>
                )}

              </article>
            );
          })}
        </div>

        {/* Bottom CTA strip */}
        <div className={styles.footer}>
          <p className={styles.footerText}>
            Can&apos;t make these? We run events year-round.
          </p>
          <Link href="/events" className={styles.footerLink}>
            Browse all events <ArrowRight size={14} />
          </Link>
        </div>

      </div>
    </section>
  );
}
