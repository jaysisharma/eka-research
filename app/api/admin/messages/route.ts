import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

/** GET /api/admin/messages — list all contact messages (admin only) */
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const filter = searchParams.get("filter"); // "unread" | "read" | null = all

  const messages = await db.contactMessage.findMany({
    where: filter === "unread" ? { read: false }
         : filter === "read"   ? { read: true  }
         : undefined,
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(messages);
}
