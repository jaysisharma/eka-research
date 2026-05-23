import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function guard() {
  const session = await auth();
  if (!session || session.user?.role !== "ADMIN")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  return null;
}

// GET — all applications (both types), newest first
// Query: ?type=vacancy|mentoring&read=true|false
export async function GET(req: NextRequest) {
  const err = await guard(); if (err) return err;
  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type");       // "vacancy" | "mentoring" | null (both)
  const readQ = searchParams.get("read");      // "true" | "false" | null (all)
  const readFilter = readQ === "true" ? true : readQ === "false" ? false : undefined;

  const [vacancyApps, mentoringApps] = await Promise.all([
    type === "mentoring" ? [] : prisma.vacancyApplication.findMany({
      where: readFilter !== undefined ? { read: readFilter } : {},
      orderBy: { createdAt: "desc" },
      include: { vacancy: { select: { id: true, title: true, type: true } } },
    }),
    type === "vacancy" ? [] : prisma.mentoringApplication.findMany({
      where: readFilter !== undefined ? { read: readFilter } : {},
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const combined = [
    ...vacancyApps.map((a: any) => ({ ...a, kind: "vacancy"  as const })),
    ...mentoringApps.map((a: any) => ({ ...a, kind: "mentoring" as const })),
  ].sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return NextResponse.json(combined);
}

// PATCH — mark single application as read/unread
// Body: { kind: "vacancy"|"mentoring", id: string, read: boolean }
export async function PATCH(req: NextRequest) {
  const err = await guard(); if (err) return err;
  const body = await req.json() as { kind?: string; id?: string; read?: boolean };

  if (!body.id) return NextResponse.json({ error: "id required" }, { status: 400 });

  if (body.kind === "vacancy") {
    const updated = await prisma.vacancyApplication.update({
      where: { id: body.id }, data: { read: body.read ?? true },
    });
    return NextResponse.json(updated);
  } else if (body.kind === "mentoring") {
    const updated = await prisma.mentoringApplication.update({
      where: { id: body.id }, data: { read: body.read ?? true },
    });
    return NextResponse.json(updated);
  }
  return NextResponse.json({ error: "Invalid kind" }, { status: 400 });
}
