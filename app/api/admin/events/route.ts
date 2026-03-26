import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

async function requireAdmin() {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") throw new Error("UNAUTHORIZED");
}

export async function GET() {
  try {
    await requireAdmin();
    const events = await db.event.findMany({ orderBy: { date: "asc" } });
    return NextResponse.json(events);
  } catch (err) {
    if (err instanceof Error && err.message === "UNAUTHORIZED")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
    const body = await req.json();
    const { title, description, type, date, time, location, locationDetail, seats, seatsLeft, href, registrationHref, published } = body;

    if (!title || !description || !type || !date || !time || !location || !href) {
      return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
    }

    const event = await db.event.create({
      data: {
        title,
        description,
        type,
        date,
        time,
        location,
        locationDetail: locationDetail || null,
        seats: seats ? Number(seats) : null,
        seatsLeft: seatsLeft ? Number(seatsLeft) : null,
        href,
        registrationHref: registrationHref || null,
        published: Boolean(published),
      },
    });
    return NextResponse.json(event, { status: 201 });
  } catch (err) {
    if (err instanceof Error && err.message === "UNAUTHORIZED")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const msg = err instanceof Error ? err.message : "Server error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
