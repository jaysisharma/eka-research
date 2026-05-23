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
  featured: boolean;
};

const VALID_EVENT_TYPES: EventType[] = ["workshop", "observation", "lecture", "outreach", "conference"];

function toSiteEvent(e: any): SiteEvent {
  const type = VALID_EVENT_TYPES.includes(e.type as EventType)
    ? (e.type as EventType)
    : "observation";
  return {
    id: e.id,
    title: e.title,
    description: e.description,
    type,
    date: e.date,
    time: e.time,
    location: e.location,
    locationDetail: e.locationDetail ?? null,
    seats: e.seats ?? null,
    seatsLeft: e.seatsLeft ?? null,
    href: e.href,
    registrationHref: e.registrationHref ?? null,
    published: e.published ?? true,
    featured: e.featured ?? false,
  };
}

function getLocalTodayString(): string {
  const now = new Date();
  const offset = now.getTimezoneOffset();
  const localDate = new Date(now.getTime() - (offset * 60 * 1000));
  return localDate.toISOString().split("T")[0];
}

export async function getUpcomingEvents(limit = 3): Promise<SiteEvent[]> {
  const today = getLocalTodayString();

  // 1. Fetch upcoming, published featured events
  const featured = await db.event.findMany({
    where: { published: true, featured: true, date: { gte: today } } as any,
    orderBy: { date: "asc" } as any,
    take: limit,
  });

  if (featured.length >= limit) {
    return featured.map(toSiteEvent);
  }

  // 2. Fill remaining slot(s) with regular upcoming, published events
  const remainingLimit = limit - featured.length;
  const featuredIds = featured.map((f) => f.id);

  const others = await db.event.findMany({
    where: {
      published: true,
      date: { gte: today },
      ...(featuredIds.length > 0 && { id: { notIn: featuredIds } }),
    } as any,
    orderBy: { date: "asc" } as any,
    take: remainingLimit,
  });

  return [...featured, ...others].map(toSiteEvent);
}

export async function getAllEvents(): Promise<SiteEvent[]> {
  const today = getLocalTodayString();
  const rows = await db.event.findMany({
    where: { published: true, date: { gte: today } } as any,
    orderBy: { date: "asc" } as any,
  });
  return rows.map(toSiteEvent);
}
