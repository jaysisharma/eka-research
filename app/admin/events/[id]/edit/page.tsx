export const dynamic = "force-dynamic";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { EventForm } from "../../EventForm";
import styles from "../../../cms.module.css";

export default async function EditEventPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") redirect("/auth/login");

  const { id } = await params;
  const ev = await db.event.findUnique({ where: { id } });
  if (!ev) notFound();

  return (
    <div className={styles.formPage}>
      <div className={styles.formHeader}>
        <Link href="/admin/events" className={styles.backLink}>
          <ChevronLeft size={15} /> Events
        </Link>
        <h1 className={styles.formHeading}>Edit event</h1>
      </div>
      <EventForm
        mode="edit"
        eventId={ev.id}
        initial={{
          title: ev.title,
          description: ev.description,
          type: ev.type,
          date: ev.date,
          time: ev.time,
          location: ev.location,
          locationDetail: ev.locationDetail ?? "",
          seats: ev.seats?.toString() ?? "",
          seatsLeft: ev.seatsLeft?.toString() ?? "",
          href: ev.href,
          registrationHref: ev.registrationHref ?? "",
          published: ev.published,
        }}
      />
    </div>
  );
}
