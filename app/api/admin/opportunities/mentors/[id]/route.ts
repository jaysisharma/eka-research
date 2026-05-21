import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function guard() {
  const session = await auth();
  if (!session || session.user?.role !== "ADMIN")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  return null;
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const err = await guard(); if (err) return err;
  const { id } = await params;
  const mentor = await prisma.mentor.findUnique({ where: { id } });
  if (!mentor) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(mentor);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const err = await guard(); if (err) return err;
  const { id } = await params;
  const body = await req.json() as Partial<{
    name: string; expertise: string; bio: string | null;
    imageUrl: string | null; linkedIn: string | null; active: boolean;
  }>;

  const data: Record<string, unknown> = {};
  if (body.name      !== undefined) data.name      = body.name?.trim()      ?? "";
  if (body.expertise !== undefined) data.expertise = body.expertise?.trim() ?? "";
  if (body.bio       !== undefined) data.bio       = body.bio?.trim()       || null;
  if (body.imageUrl  !== undefined) data.imageUrl  = body.imageUrl?.trim()  || null;
  if (body.linkedIn  !== undefined) data.linkedIn  = body.linkedIn?.trim()  || null;
  if (body.active    !== undefined) data.active    = body.active;

  const updated = await prisma.mentor.update({ where: { id }, data });
  return NextResponse.json(updated);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const err = await guard(); if (err) return err;
  const { id } = await params;
  await prisma.mentor.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
