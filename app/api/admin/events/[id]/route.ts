import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

type Params = { params: Promise<{ id: string }> };

/** GET /api/admin/events/[id] — Retrieve a specific event (admin only) */
export async function GET(_req: Request, { params }: Params) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const { id } = await params;
    const event = await db.event.findUnique({
      where: { id },
    });

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    return NextResponse.json(event);
  } catch (error) {
    console.error("Failed to fetch event:", error);
    return NextResponse.json({ error: "Failed to fetch event." }, { status: 500 });
  }
}

/** PATCH /api/admin/events/[id] — Update event details (admin only) */
export async function PATCH(req: Request, { params }: Params) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const { id } = await params;
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

    const existing = await db.event.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Event not found." }, { status: 404 });
    }

    if (type !== undefined) {
      const trimmedType = type.trim().toLowerCase();
      const validTypes = ["observation", "workshop", "lecture", "outreach", "conference"];
      if (!validTypes.includes(trimmedType)) {
        return NextResponse.json(
          { error: `Invalid event type "${type}". Must be one of: ${validTypes.join(", ")}` },
          { status: 400 }
        );
      }
    }

    const parsedSeats =
      seats !== undefined
        ? seats !== null && seats !== ""
          ? (typeof seats === "number" ? seats : parseInt(seats.toString(), 10))
          : null
        : undefined;

    let seatsLeftUpdate = undefined;
    if (parsedSeats !== undefined) {
      if (parsedSeats === null) {
        seatsLeftUpdate = null;
      } else {
        const registeredCount = await db.eventRegistration.count({
          where: { eventId: id, status: "confirmed" },
        });
        seatsLeftUpdate = Math.max(0, parsedSeats - registeredCount);
      }
    }

    const updated = await db.event.update({
      where: { id },
      data: {
        ...(title !== undefined && { title: title.trim() }),
        ...(description !== undefined && { description: description.trim() }),
        ...(type !== undefined && { type: type.trim().toLowerCase() }),
        ...(date !== undefined && { date: date.trim() }),
        ...(time !== undefined && { time: time.trim() }),
        ...(location !== undefined && { location: location.trim() }),
        ...(locationDetail !== undefined && {
          locationDetail: locationDetail ? locationDetail.trim() : null,
        }),
        ...(parsedSeats !== undefined && {
          seats: parsedSeats,
          seatsLeft: seatsLeftUpdate,
        }),
        ...(published !== undefined && { published }),
        ...(featured !== undefined && { featured }),
      } as any,
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Failed to update event:", error);
    return NextResponse.json({ error: "Failed to update event." }, { status: 500 });
  }
}

/** DELETE /api/admin/events/[id] — Delete event (admin only) */
export async function DELETE(_req: Request, { params }: Params) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const { id } = await params;

    const existing = await db.event.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Event not found." }, { status: 404 });
    }

    await db.event.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Failed to delete event:", error);
    return NextResponse.json({ error: "Failed to delete event." }, { status: 500 });
  }
}
