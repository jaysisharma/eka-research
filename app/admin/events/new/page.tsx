export const dynamic = "force-dynamic";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { EventForm } from "../EventForm";
import styles from "../../cms.module.css";

export default async function NewEventPage() {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") redirect("/auth/login");

  return (
    <div className={styles.formPage}>
      <div className={styles.formHeader}>
        <Link href="/admin/events" className={styles.backLink}>
          <ChevronLeft size={15} /> Events
        </Link>
        <h1 className={styles.formHeading}>New event</h1>
      </div>
      <EventForm mode="create" />
    </div>
  );
}
