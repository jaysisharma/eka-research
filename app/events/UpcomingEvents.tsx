"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CalendarDays, Clock, MapPin, Users } from "lucide-react";
import styles from "./upcoming.module.css";

type EventType = "workshop" | "observation" | "lecture" | "outreach" | "conference";

export type DisplayEvent = {
  id:               string;
  title:            string;
  description:      string;
  type:             EventType;
  date:             string;
  time:             string;
  location:         string;
  locationDetail?:  string | null;
  seats?:           number | null;
  seatsLeft?:       number | null;
  registrationHref?: string | null;
  featured?:        boolean;
};

const TYPE_LABEL: Record<EventType, string> = {
  observation: "Observation Night",
  workshop:    "Workshop",
  lecture:     "Public Lecture",
  outreach:    "Outreach",
  conference:  "Conference",
};

const EVENT_IMAGES: Record<EventType, string> = {
  observation: "https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?auto=format&fit=crop&w=1200&q=80",
  workshop:    "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=1200&q=80",
  lecture:     "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?auto=format&fit=crop&w=1200&q=80",
  outreach:    "https://images.unsplash.com/photo-1543722530-d2c3201371e7?auto=format&fit=crop&w=1200&q=80",
  conference:  "https://images.unsplash.com/photo-1531366936337-7c912a4589a7?auto=format&fit=crop&w=1200&q=80",
};

function fmtDate(dateStr: string) {
  const d = new Date(dateStr);
  return {
    day:   d.toLocaleDateString("en-US", { day: "numeric" }),
    month: d.toLocaleDateString("en-US", { month: "short" }).toUpperCase(),
    full:  d.toLocaleDateString("en-US", { weekday: "long", day: "numeric", month: "long", year: "numeric" }),
  };
}

/* ── Filter tabs ─────────────────────────────────────────────────────── */
function FilterTabs({
  active, types, onSelect,
}: {
  active: EventType | "all";
  types: EventType[];
  onSelect: (t: EventType | "all") => void;
}) {
  const tabs: { value: EventType | "all"; label: string }[] = [
    { value: "all", label: "All" },
    ...types.map(t => ({ value: t, label: TYPE_LABEL[t] })),
  ];
  return (
    <div className={styles.filterRow}>
      {tabs.map(tab => (
        <button
          key={tab.value}
          className={`${styles.filterTab} ${active === tab.value ? styles.filterTabActive : ""}`}
          onClick={() => onSelect(tab.value)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}

/* ── Date stamp (shared) ─────────────────────────────────────────────── */
function DateStamp({ date, size = "lg" }: { date: string; size?: "sm" | "lg" }) {
  const d = fmtDate(date);
  return (
    <div className={size === "lg" ? styles.stampLg : styles.stampSm}>
      <span className={styles.stampDay}>{d.day}</span>
      <span className={styles.stampMonth}>{d.month}</span>
    </div>
  );
}

/* ── Featured card ───────────────────────────────────────────────────── */
function FeaturedCard({ event }: { event: DisplayEvent }) {
  const d        = fmtDate(event.date);
  const hasSeats = event.seats && event.seatsLeft != null;
  const filled   = hasSeats
    ? Math.round(((event.seats! - event.seatsLeft!) / event.seats!) * 100)
    : 0;
  const urgent   = (event.seatsLeft ?? Infinity) <= 10;

  return (
    <article className={styles.featuredCard}>

      {/* ── Image panel ── */}
      <div className={styles.featuredImgWrap}>
        <Image
          src={EVENT_IMAGES[event.type]}
          alt={event.title}
          fill priority
          sizes="(max-width: 1024px) 100vw, 55vw"
          className={styles.featuredImg}
        />
        <div className={styles.featuredOverlay} />
        <span className={styles.featuredTypePill}>{TYPE_LABEL[event.type]}</span>
        <DateStamp date={event.date} size="lg" />
      </div>

      {/* ── Content panel ── */}
      <div className={styles.featuredBody}>
        <div className={styles.featuredTop}>
          <span className={styles.featuredEyebrow}>{TYPE_LABEL[event.type]}</span>
          <h2 className={styles.featuredTitle}>{event.title}</h2>
          <p className={styles.featuredDesc}>{event.description}</p>
        </div>

        <div className={styles.featuredMeta}>
          <div className={styles.metaRow}><CalendarDays size={14} /><span>{d.full}</span></div>
          <div className={styles.metaRow}><Clock size={14} /><span>{event.time}</span></div>
          <div className={styles.metaRow}>
            <MapPin size={14} />
            <span>{event.location}{event.locationDetail && ` — ${event.locationDetail}`}</span>
          </div>

          {hasSeats && (
            <div className={styles.seatsBlock}>
              <div className={styles.seatsBar}>
                <div
                  className={styles.seatsFill}
                  style={{
                    width: `${filled}%`,
                    background: urgent ? "var(--color-warning)" : "var(--color-success)",
                  }}
                />
              </div>
              <span className={`${styles.seatsLabel} ${urgent ? styles.seatsUrgent : ""}`}>
                <Users size={12} />
                {urgent
                  ? `Only ${event.seatsLeft} seats left!`
                  : `${event.seatsLeft} of ${event.seats} seats remaining`}
              </span>
            </div>
          )}
        </div>

        {event.registrationHref && (
          <Link href={event.registrationHref} className={styles.registerBtn}>
            Register now <ArrowRight size={14} />
          </Link>
        )}
      </div>
    </article>
  );
}

/* ── Event card (grid) ───────────────────────────────────────────────── */
function EventCard({ event }: { event: DisplayEvent }) {
  const urgent = (event.seatsLeft ?? Infinity) <= 10;

  return (
    <article className={styles.card}>
      <div className={styles.cardImgWrap}>
        <Image
          src={EVENT_IMAGES[event.type]}
          alt={event.title}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className={styles.cardImg}
        />
        <div className={styles.cardImgOverlay} />
        <DateStamp date={event.date} size="sm" />
      </div>

      <div className={styles.cardBody}>
        <span className={styles.cardTypePill}>{TYPE_LABEL[event.type]}</span>
        <h3 className={styles.cardTitle}>{event.title}</h3>
        <p className={styles.cardDesc}>{event.description}</p>

        <div className={styles.cardMeta}>
          <span className={styles.cardMetaItem}><Clock size={12} />{event.time}</span>
          <span className={styles.cardMetaItem}>
            <MapPin size={12} />
            {event.location}{event.locationDetail && ` — ${event.locationDetail}`}
          </span>
          {event.seats && event.seatsLeft != null && (
            <span className={`${styles.cardMetaItem} ${urgent ? styles.seatsUrgent : ""}`}>
              <Users size={12} />{event.seatsLeft} seats left
            </span>
          )}
        </div>

        {event.registrationHref && (
          <Link href={event.registrationHref} className={styles.cardBtn}>
            Register <ArrowRight size={12} />
          </Link>
        )}
      </div>
    </article>
  );
}

/* ── Main export ─────────────────────────────────────────────────────── */
export default function UpcomingEvents({ events }: { events: DisplayEvent[] }) {
  const [filter, setFilter] = useState<EventType | "all">("all");

  const types    = [...new Set(events.map(e => e.type))] as EventType[];
  const filtered = filter === "all" ? events : events.filter(e => e.type === filter);
  const featured = filtered.find(e => e.featured) ?? filtered[0];
  const rest     = filtered.filter(e => e.id !== featured?.id);

  return (
    <section className={styles.section} id="upcoming">
      <div className={styles.inner}>

        {/* Head row: title left, filters right */}
        <div className={styles.sectionHead}>
          <div className={styles.headLeft}>
            <span className={styles.eyebrow}>
              <span className={styles.eyebrowLine} />
              Upcoming Events
            </span>
            <h2 className={styles.heading}>Don&rsquo;t miss what&rsquo;s next</h2>
          </div>
          {types.length > 0 && (
            <FilterTabs active={filter} types={types} onSelect={setFilter} />
          )}
        </div>

        {filtered.length === 0 ? (
          <div className={styles.empty}>
            No {filter !== "all" ? TYPE_LABEL[filter as EventType] : ""} events right now — check back soon.
          </div>
        ) : (
          <>
            {featured && <FeaturedCard event={featured} />}
            {rest.length > 0 && (
              <div className={styles.grid}>
                {rest.map(ev => <EventCard key={ev.id} event={ev} />)}
              </div>
            )}
          </>
        )}

      </div>
    </section>
  );
}
