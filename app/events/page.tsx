export const dynamic = "force-dynamic";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { buildMetadata } from "@/lib/seo";
import { EVENTS } from "@/lib/constants";
import { getAllEvents } from "@/lib/events";
import UpcomingEvents, { type DisplayEvent } from "./UpcomingEvents";
import styles from "./page.module.css";

export const metadata = buildMetadata({
  title: "Events",
  description:
    "Upcoming observation nights, workshops, public lectures, and outreach events from Eka Research — open to students, researchers, and the public.",
  path: "/events",
});

export default async function EventsPage() {
  const dbEvents = await getAllEvents();
  const displayEvents: DisplayEvent[] =
    (dbEvents.length > 0 ? dbEvents : EVENTS) as DisplayEvent[];

  return (
    <main>

      {/* ── 1. Page header ──────────────────────────────────────────── */}
      <div className={styles.pageHeader}>
        <div className={styles.pageHeaderInner}>
          <span className={styles.eyebrow}>
            <span className={styles.eyebrowLine} />
            Eka Research
          </span>
          <h1 className={styles.pageTitle}>Events</h1>
          <p className={styles.pageDesc}>
            Observation nights, workshops, and public lectures — open to students,
            researchers, and anyone curious about the sky.
          </p>
        </div>
      </div>

      {/* ── 2. Upcoming events ──────────────────────────────────────── */}
      <UpcomingEvents events={displayEvents} />

      {/* ── 3. Never-miss strip ─────────────────────────────────────── */}
      <section className={styles.notifySection}>
        <div className={styles.notifyInner}>
          <div className={styles.notifyText}>
            <h2 className={styles.notifyHeading}>Never miss an event</h2>
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
