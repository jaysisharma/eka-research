import { db } from "@/lib/db";

export type EventType = "workshop" | "observation" | "lecture" | "outreach" | "conference";

export type SiteEvent = {
  id: string;
  title: string;
  description: string;
  type: EventType;
  date: string;
  time: string;
  location: string;
  locationDetail: string | null;
  seats: number | null;
  seatsLeft: number | null;
  href: string;
  registrationHref: string | null;
  published: boolean;
};

type DbEvent = {
  id: string;
  title: string;
  description: string;
  type: string;
  date: string;
  time: string;
  location: string;
  locationDetail: string | null;
  seats: number | null;
  seatsLeft: number | null;
  href: string;
  registrationHref: string | null;
  published: boolean;
};

function toSiteEvent(e: DbEvent): SiteEvent {
  return { ...e, type: e.type as EventType };
}

export async function getUpcomingEvents(limit = 3): Promise<SiteEvent[]> {
  const today = new Date().toISOString().split("T")[0];
  const rows = await db.event.findMany({
    where: { published: true, date: { gte: today } },
    orderBy: { date: "asc" },
    take: limit,
  });
  return rows.map(toSiteEvent);
}

export async function getAllEvents(): Promise<SiteEvent[]> {
  const rows = await db.event.findMany({
    where: { published: true },
    orderBy: { date: "asc" },
  });
  return rows.map(toSiteEvent);
}
