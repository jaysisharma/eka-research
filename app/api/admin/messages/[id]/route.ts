import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

/** PATCH /api/admin/messages/:id — toggle read status */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const body = await req.json() as { read?: boolean };

  if (typeof body.read !== "boolean") {
    return NextResponse.json({ error: "Expected { read: boolean }" }, { status: 400 });
  }

  const updated = await db.contactMessage.update({
    where: { id },
    data:  { read: body.read },
  });

  return NextResponse.json(updated);
}

/** DELETE /api/admin/messages/:id — permanently delete */
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  await db.contactMessage.delete({ where: { id } });

  return NextResponse.json({ ok: true });
}
