export const dynamic = "force-dynamic";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, MapPin, Clock, Users, CalendarDays } from "lucide-react";
import PageHero from "@/components/ui/PageHero";
import { buildMetadata } from "@/lib/seo";
import { EVENTS, type EventType } from "@/lib/constants";
import styles from "./page.module.css";

export const metadata = buildMetadata({
  title: "Events",
  description:
    "Upcoming observation nights, workshops, public lectures, and outreach events from Eka Research — open to students, researchers, and the public.",
  path: "/events",
});

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

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return {
    day:   d.toLocaleDateString("en-US", { day: "numeric" }),
    month: d.toLocaleDateString("en-US", { month: "short" }).toUpperCase(),
    full:  d.toLocaleDateString("en-US", { weekday: "long", day: "numeric", month: "long", year: "numeric" }),
  };
}

const PAST_EVENTS = [
  {
    title: "Mars Opposition Watch",
    type: "Observation Night",
    date: "Dec 2025",
    location: "Nagarkot",
    image: "https://images.unsplash.com/photo-1614730321146-b6fa6a46bcb4?auto=format&fit=crop&w=600&q=80",
  },
  {
    title: "Young Astronomers Bootcamp",
    type: "Workshop",
    date: "Nov 2025",
    location: "Kathmandu",
    image: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=600&q=80",
  },
  {
    title: "Perseid Meteor Night 2025",
    type: "Observation Night",
    date: "Aug 2025",
    location: "Nagarkot",
    image: "https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?auto=format&fit=crop&w=600&q=80",
  },
  {
    title: "Space Careers Panel",
    type: "Lecture",
    date: "Jul 2025",
    location: "Online",
    image: "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?auto=format&fit=crop&w=600&q=80",
  },
];

export default function EventsPage() {
  const featured = EVENTS[0];
  const rest = EVENTS.slice(1);

  return (
    <main>

      {/* ── 1. Hero ── */}
      <PageHero
        label="Events"
        title="Science you can "
        accentWord="experience"
        description="Observation nights under Nepal's darkest skies. Hands-on workshops. Public lectures. Every event is designed to bring you closer to real science."
        align="left"
        variant="dark"
        cta={{ label: "See upcoming events", href: "#upcoming" }}
        ctaSecondary={{ label: "Become a member", href: "/member-benefits" }}
      />

      {/* ── 2. Stats strip ── */}
      <section className={styles.statsStrip}>
        <div className={styles.statsInner}>
          {[
            { value: "200+", label: "Events hosted" },
            { value: "3",    label: "Upcoming this season" },
            { value: "40",   label: "Max seats (observation)" },
            { value: "Free", label: "Member entry" },
          ].map(({ value, label }) => (
            <div key={label} className={styles.statItem}>
              <span className={styles.statValue}>{value}</span>
              <span className={styles.statLabel}>{label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── 3. Featured upcoming event ── */}
      <section className={styles.section} id="upcoming">
        <div className={styles.sectionInner}>
          <div className={styles.sectionHeader}>
            <span className={styles.label}>
              <span className={styles.labelLine} />
              Upcoming Events
            </span>
            <h2 className={styles.sectionHeading}>Don&rsquo;t miss what&rsquo;s next</h2>
          </div>

          {/* Featured event — large immersive card */}
          <div className={styles.featuredCard}>
            <div className={styles.featuredImgWrap}>
              <Image
                src={EVENT_IMAGES[featured.type]}
                alt={featured.title}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 55vw"
                className={styles.featuredImg}
              />
              <div className={styles.featuredImgOverlay} />
              <div className={styles.featuredTypeBadge}>{TYPE_LABEL[featured.type]}</div>
              <div className={styles.featuredDateBlock}>
                <span className={styles.featuredDay}>{formatDate(featured.date).day}</span>
                <span className={styles.featuredMonth}>{formatDate(featured.date).month}</span>
              </div>
            </div>

            <div className={styles.featuredBody}>
              <div className={styles.featuredType}>{TYPE_LABEL[featured.type]}</div>
              <h2 className={styles.featuredTitle}>{featured.title}</h2>
              <p className={styles.featuredDesc}>{featured.description}</p>

              <div className={styles.featuredMeta}>
                <div className={styles.metaItem}>
                  <CalendarDays size={14} />
                  <span>{formatDate(featured.date).full}</span>
                </div>
                <div className={styles.metaItem}>
                  <Clock size={14} />
                  <span>{featured.time}</span>
                </div>
                <div className={styles.metaItem}>
                  <MapPin size={14} />
                  <span>
                    {featured.location}
                    {featured.locationDetail && ` — ${featured.locationDetail}`}
                  </span>
                </div>
                {featured.seats && featured.seatsLeft !== undefined && (
                  <div className={styles.seatsWrap}>
                    <div className={styles.seatsBar}>
                      <div
                        className={styles.seatsFill}
                        style={{
                          width: `${Math.round(((featured.seats - featured.seatsLeft) / featured.seats) * 100)}%`,
                          background: featured.seatsLeft <= 10 ? "var(--color-warning)" : "var(--color-success)",
                        }}
                      />
                    </div>
                    <span className={styles.seatsText}>
                      <Users size={12} />
                      {featured.seatsLeft} of {featured.seats} seats left
                    </span>
                  </div>
                )}
              </div>

              {featured.registrationHref && (
                <Link href={featured.registrationHref} className={styles.registerBtn}>
                  Register now <ArrowRight size={14} />
                </Link>
              )}
            </div>
          </div>

          {/* Remaining upcoming events */}
          {rest.length > 0 && (
            <div className={styles.eventsList}>
              {rest.map((ev) => {
                const d = formatDate(ev.date);
                return (
                  <div key={ev.id} className={styles.eventRow}>
                    <div className={styles.eventDateBlock}>
                      <span className={styles.eventDay}>{d.day}</span>
                      <span className={styles.eventMonth}>{d.month}</span>
                    </div>
                    <div className={styles.eventImgWrap}>
                      <Image
                        src={EVENT_IMAGES[ev.type]}
                        alt={ev.title}
                        fill
                        sizes="80px"
                        className={styles.eventImg}
                      />
                    </div>
                    <div className={styles.eventContent}>
                      <div className={styles.eventTypeBadge}>{TYPE_LABEL[ev.type]}</div>
                      <h3 className={styles.eventTitle}>{ev.title}</h3>
                      <p className={styles.eventDesc}>{ev.description}</p>
                      <div className={styles.eventMeta}>
                        <span className={styles.eventMetaItem}>
                          <Clock size={12} /> {ev.time}
                        </span>
                        <span className={styles.eventMetaItem}>
                          <MapPin size={12} />
                          {ev.location}
                          {ev.locationDetail && ` — ${ev.locationDetail}`}
                        </span>
                        {ev.seats && ev.seatsLeft !== undefined && (
                          <span className={`${styles.eventMetaItem} ${ev.seatsLeft <= 10 ? styles.urgentSeats : ""}`}>
                            <Users size={12} /> {ev.seatsLeft} seats left
                          </span>
                        )}
                      </div>
                    </div>
                    {ev.registrationHref && (
                      <Link href={ev.registrationHref} className={styles.eventRegBtn}>
                        Register <ArrowRight size={13} />
                      </Link>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* ── 4. Past events gallery ── */}
      <section className={`${styles.section} ${styles.sectionSurface}`} id="past">
        <div className={styles.sectionInner}>
          <div className={styles.sectionHeader}>
            <span className={styles.label}>
              <span className={styles.labelLine} />
              Past Events
            </span>
            <h2 className={styles.sectionHeading}>More than 200 events since 2020</h2>
            <p className={styles.sectionSub}>
              A snapshot of what we&apos;ve organised — from mountain observation camps to city-wide science fairs.
            </p>
          </div>

          <div className={styles.pastGrid}>
            {PAST_EVENTS.map((ev) => (
              <div key={ev.title} className={styles.pastCard}>
                <div className={styles.pastImgWrap}>
                  <Image
                    src={ev.image}
                    alt={ev.title}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    className={styles.pastImg}
                  />
                  <div className={styles.pastImgOverlay} />
                  <div className={styles.pastMeta}>
                    <span className={styles.pastType}>{ev.type}</span>
                    <span className={styles.pastDate}>{ev.date}</span>
                  </div>
                </div>
                <div className={styles.pastBody}>
                  <h3 className={styles.pastTitle}>{ev.title}</h3>
                  <span className={styles.pastLocation}>
                    <MapPin size={12} />
                    {ev.location}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 5. Newsletter / notify strip ── */}
      <section className={styles.notifySection}>
        <div className={styles.notifyInner}>
          <div className={styles.notifyText}>
            <h2 className={styles.notifyHeading}>
              Never miss an event
            </h2>
            <p className={styles.notifySub}>
              Members are notified first when seats open. Events fill fast — especially observation nights.
            </p>
          </div>
          <div className={styles.notifyActions}>
            <Link href="/member-benefits" className={styles.notifyBtn}>
              Join for free <ArrowRight size={14} />
            </Link>
            <Link href="/contact" className={styles.notifyLink}>
              Host an event with us
            </Link>
          </div>
        </div>
      </section>

    </main>
  );
}
