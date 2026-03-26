export const dynamic = "force-dynamic";
"use client";

import { Suspense, useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Check, Loader2, MapPin, Clock, CalendarDays } from "lucide-react";
import styles from "./page.module.css";

type EventInfo = {
  id: string;
  title: string;
  type: string;
  date: string;
  time: string;
  location: string;
  locationDetail: string | null;
  seats: number | null;
  seatsLeft: number | null;
  slug: string;
};

const TYPE_LABEL: Record<string, string> = {
  observation: "Observation", workshop: "Workshop",
  lecture: "Lecture", outreach: "Outreach", conference: "Conference",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });
}

function RegisterForm() {
  const params = useParams<{ slug: string }>();
  const router = useRouter();

  const [event, setEvent] = useState<EventInfo | null>(null);
  const [loadingEvent, setLoadingEvent] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetch(`/api/events/by-slug/${params.slug}`)
      .then(r => r.json())
      .then(data => {
        if (data.error) { setNotFound(true); }
        else { setEvent(data); }
        setLoadingEvent(false);
      })
      .catch(() => { setNotFound(true); setLoadingEvent(false); });
  }, [params.slug]);

  // Pre-fill from session
  useEffect(() => {
    fetch("/api/auth/session")
      .then(r => r.json())
      .then(s => {
        if (s?.user) {
          setName(s.user.name ?? "");
          setEmail(s.user.email ?? "");
        }
      })
      .catch(() => {});
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!event) return;
    setError("");
    setLoading(true);
    const res = await fetch(`/api/events/${event.id}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, phone, message }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) { setError(data.error ?? "Registration failed. Please try again."); return; }
    setSuccess(true);
  }

  if (loadingEvent) {
    return <div className={styles.skeleton} />;
  }

  if (notFound || !event) {
    return (
      <div className={styles.notFound}>
        <p>Event not found.</p>
        <Link href="/events" className={styles.back}><ArrowLeft size={14} /> All events</Link>
      </div>
    );
  }

  const fullyBooked = event.seats !== null && event.seatsLeft !== null && event.seatsLeft <= 0;

  if (success) {
    return (
      <div className={styles.successWrap}>
        <span className={styles.successIcon}><Check size={24} strokeWidth={2.5} /></span>
        <h1 className={styles.successHeading}>You&apos;re registered!</h1>
        <p className={styles.successSub}>
          We&apos;ve saved your spot for <strong>{event.title}</strong>.
          Check your email for confirmation details.
        </p>
        <Link href={`/events/${event.slug}`} className={styles.backLink}>
          <ArrowLeft size={14} /> Back to event
        </Link>
      </div>
    );
  }

  return (
    <div className={styles.layout}>

      {/* Left — event summary */}
      <div className={styles.summary}>
        <Link href={`/events/${event.slug}`} className={styles.back}>
          <ArrowLeft size={14} /> Back to event
        </Link>

        <div className={styles.summaryCard}>
          <span className={styles.typeBadge}>{TYPE_LABEL[event.type] ?? event.type}</span>
          <h2 className={styles.eventTitle}>{event.title}</h2>

          <div className={styles.metaList}>
            <div className={styles.metaItem}>
              <CalendarDays size={14} />
              {formatDate(event.date)}
            </div>
            <div className={styles.metaItem}>
              <Clock size={14} />
              {event.time}
            </div>
            <div className={styles.metaItem}>
              <MapPin size={14} />
              {event.locationDetail
                ? `${event.locationDetail}, ${event.location}`
                : event.location}
            </div>
          </div>

          {event.seats !== null && event.seatsLeft !== null && (
            <div className={styles.seatsInfo}>
              <div className={styles.seatsBar}>
                <div
                  className={styles.seatsFill}
                  style={{ width: `${Math.round(((event.seats - event.seatsLeft) / event.seats) * 100)}%` }}
                />
              </div>
              <span className={styles.seatsText}>
                {event.seatsLeft > 0 ? `${event.seatsLeft} spots left` : "Fully booked"}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Right — form */}
      <div className={styles.formWrap}>
        <div className={styles.formHeader}>
          <h1 className={styles.heading}>Reserve your spot</h1>
          <p className={styles.sub}>Free to attend. Takes 30 seconds.</p>
        </div>

        {fullyBooked ? (
          <div className={styles.fullyBooked}>
            This event is fully booked. Check back for cancellations or{" "}
            <Link href="/events" className={styles.link}>browse other events</Link>.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className={styles.form} noValidate>
            <div className={styles.field}>
              <label htmlFor="name" className={styles.label}>Full name</label>
              <input id="name" type="text" required value={name}
                onChange={e => setName(e.target.value)}
                className={styles.input} placeholder="Your name" />
            </div>

            <div className={styles.field}>
              <label htmlFor="email" className={styles.label}>Email address</label>
              <input id="email" type="email" required value={email}
                onChange={e => setEmail(e.target.value)}
                className={styles.input} placeholder="you@example.com" />
            </div>

            <div className={styles.field}>
              <label htmlFor="phone" className={styles.label}>
                Phone <span className={styles.optional}>(optional)</span>
              </label>
              <input id="phone" type="tel" value={phone}
                onChange={e => setPhone(e.target.value)}
                className={styles.input} placeholder="+977 98XXXXXXXX" />
            </div>

            <div className={styles.field}>
              <label htmlFor="message" className={styles.label}>
                Message <span className={styles.optional}>(optional)</span>
              </label>
              <textarea id="message" value={message}
                onChange={e => setMessage(e.target.value)}
                className={styles.textarea} placeholder="Any questions or notes for us?" rows={3} />
            </div>

            {error && <p className={styles.errorBanner} role="alert">{error}</p>}

            <button type="submit" className={styles.submitBtn} disabled={loading}>
              {loading
                ? <Loader2 size={16} className={styles.spinner} />
                : "Confirm registration"}
            </button>

            <p className={styles.terms}>
              Free to attend. We&apos;ll only use your details to confirm your spot.
            </p>
          </form>
        )}
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <div className={styles.page}>
      <Suspense fallback={<div className={styles.skeleton} />}>
        <RegisterForm />
      </Suspense>
    </div>
  );
}
