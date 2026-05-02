export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { sendRoleNotificationEmail } from "@/lib/mail";
import type { UserRole } from "@/lib/access";

const VALID_ROLES: UserRole[] = [
  "FREE_USER",
  "TEACHER",
  "RESEARCHER",
  "MENTOR",
  "PAID_MEMBER",
  "ADMIN",
];

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const body = await req.json();
  const { role, action } = body;

  // Approve pending role request
  if (action === "approve") {
    const user = await db.user.findUnique({
      where: { id },
      select: { email: true, name: true, requestedRole: true },
    });
    if (!user?.requestedRole) {
      return NextResponse.json({ error: "No pending role request" }, { status: 400 });
    }
    const updated = await db.user.update({
      where: { id },
      data: { role: user.requestedRole, requestedRole: null },
    });
    // Notify user — fire-and-forget, don't fail the request if email fails
    sendRoleNotificationEmail(user.email, user.name, user.requestedRole, true).catch(() => null);
    return NextResponse.json(updated);
  }

  // Deny pending role request
  if (action === "deny") {
    const user = await db.user.findUnique({
      where: { id },
      select: { email: true, name: true, requestedRole: true },
    });
    const updated = await db.user.update({
      where: { id },
      data: { requestedRole: null },
    });
    if (user?.requestedRole) {
      sendRoleNotificationEmail(user.email, user.name, user.requestedRole, false).catch(() => null);
    }
    return NextResponse.json(updated);
  }

  // Manual role change
  if (!VALID_ROLES.includes(role as UserRole)) {
    return NextResponse.json({ error: "Invalid role" }, { status: 400 });
  }
  if (id === session.user.id && role !== "ADMIN") {
    return NextResponse.json({ error: "Cannot change your own role" }, { status: 400 });
  }
  // Clear requestedRole to keep it in sync with the new role
  const updated = await db.user.update({
    where: { id },
    data: { role, requestedRole: null },
  });
  return NextResponse.json(updated);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  if (id === session.user.id) {
    return NextResponse.json({ error: "Cannot delete your own account" }, { status: 400 });
  }
  await db.user.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
