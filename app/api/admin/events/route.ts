import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

// Helper to slugify a string
function slugify(text: string) {
  return text
    .toString()
    .toLowerCase()
    .replace(/\s+/g, "-") // Replace spaces with -
    .replace(/[^\w\-]+/g, "") // Remove all non-word chars
    .replace(/\-\-+/g, "-") // Replace multiple - with single -
    .replace(/^-+/, "") // Trim - from start of text
    .replace(/-+$/, ""); // Trim - from end of text
}

/** GET /api/admin/events — Retrieve all events, sorted by date asc (admin only) */
export async function GET() {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const events = await db.event.findMany({
      orderBy: { date: "desc" },
    });
    return NextResponse.json(events);
  } catch (error) {
    console.error("Failed to fetch events:", error);
    return NextResponse.json({ error: "Failed to fetch events." }, { status: 500 });
  }
}

/** POST /api/admin/events — Create a new event (admin only) */
export async function POST(req: Request) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const {
      title,
      description,
      type,
      date,
      time,
      location,
      locationDetail,
      seats,
      published,
      featured,
    } = body;

    if (!title || !description || !type || !date || !time || !location) {
      return NextResponse.json(
        { error: "Missing required fields." },
        { status: 400 }
      );
    }

    const trimmedType = type.trim().toLowerCase();
    const validTypes = ["observation", "workshop", "lecture", "outreach", "conference"];
    if (!validTypes.includes(trimmedType)) {
      return NextResponse.json(
        { error: `Invalid event type "${type}". Must be one of: ${validTypes.join(", ")}` },
        { status: 400 }
      );
    }

    const baseSlug = slugify(title);
    const slug = `${baseSlug}-${Math.floor(1000 + Math.random() * 9000)}`;
    const parsedSeats = seats !== undefined && seats !== null && seats !== ""
      ? (typeof seats === "number" ? seats : parseInt(seats.toString(), 10))
      : null;

    const event = await db.event.create({
      data: {
        slug,
        title: title.trim(),
        description: description.trim(),
        type: trimmedType,
        date: date.trim(),
        time: time.trim(),
        location: location.trim(),
        locationDetail: locationDetail ? locationDetail.trim() : null,
        seats: parsedSeats,
        seatsLeft: parsedSeats,
        href: `/events/${slug}`,
        registrationHref: `/events/${slug}/register`,
        published: published ?? true,
        featured: featured ?? false,
      } as any,
    });

    return NextResponse.json(event, { status: 201 });
  } catch (error) {
    console.error("Failed to create event:", error);
    return NextResponse.json({ error: "Failed to create event." }, { status: 500 });
  }
}
