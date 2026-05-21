import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sendContactNotification } from "@/lib/mail";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, topic, organisation, message } = body as {
      name?: string;
      email?: string;
      topic?: string;
      organisation?: string;
      message?: string;
    };

    // Basic validation
    if (!name?.trim() || !email?.trim() || !topic?.trim() || !message?.trim()) {
      return NextResponse.json(
        { error: "name, email, topic, and message are required." },
        { status: 400 }
      );
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: "Invalid email address." },
        { status: 400 }
      );
    }

    // Persist to DB
    const record = await db.contactMessage.create({
      data: {
        name:         name.trim(),
        email:        email.trim().toLowerCase(),
        topic:        topic.trim(),
        organisation: organisation?.trim() || null,
        message:      message.trim(),
      },
    });

    // Fire-and-forget email — don't let a mail failure kill the response
    sendContactNotification({
      name:         record.name,
      email:        record.email,
      topic:        record.topic,
      organisation: record.organisation,
      message:      record.message,
    }).catch((err) => {
      console.error("[contact] email send failed:", err);
    });

    return NextResponse.json({ ok: true, id: record.id }, { status: 201 });
  } catch (err) {
    console.error("[contact] POST error:", err);
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}
