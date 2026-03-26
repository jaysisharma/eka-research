export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { name, email, phone, message } = await req.json();

  if (!name?.trim() || !email?.trim()) {
    return NextResponse.json({ error: "Name and email are required." }, { status: 400 });
  }

  const event = await db.event.findUnique({ where: { id } });
  if (!event || !event.published) {
    return NextResponse.json({ error: "Event not found." }, { status: 404 });
  }

  // Check if fully booked
  if (event.seats !== null && event.seatsLeft !== null && event.seatsLeft <= 0) {
    return NextResponse.json({ error: "This event is fully booked." }, { status: 409 });
  }

  // Check duplicate
  const duplicate = await db.eventRegistration.findFirst({
    where: { eventId: id, email: email.toLowerCase().trim() },
  });
  if (duplicate) {
    return NextResponse.json({ error: "You're already registered for this event." }, { status: 409 });
  }

  // Attach user if logged in
  const session = await auth();
  const userId = session?.user?.id ?? null;

  const registration = await db.eventRegistration.create({
    data: {
      eventId: id,
      userId,
      name: name.trim(),
      email: email.toLowerCase().trim(),
      phone: phone?.trim() || null,
      message: message?.trim() || null,
      status: "confirmed",
    },
  });

  // Decrement seatsLeft
  if (event.seats !== null && event.seatsLeft !== null) {
    await db.event.update({
      where: { id },
      data: { seatsLeft: Math.max(0, event.seatsLeft - 1) },
    });
  }

  return NextResponse.json({ ok: true, registrationId: registration.id });
}
