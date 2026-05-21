import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

const VALID_ROLES = ["FREE_USER", "TEACHER", "RESEARCHER", "MENTOR", "PAID_MEMBER", "ADMIN"];

/** PATCH /api/admin/users/[id] — update a user's role */
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();

  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const { role } = await req.json();

  if (!VALID_ROLES.includes(role)) {
    return NextResponse.json({ error: "Invalid role" }, { status: 400 });
  }

  const updated = await db.user.update({
    where: { id },
    data:  { role },
    select: { id: true, name: true, role: true },
  });

  return NextResponse.json(updated);
}
