import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function guard() {
  const session = await auth();
  if (!session || session.user?.role !== "ADMIN")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  return null;
}

// GET — program settings + application counts
export async function GET() {
  const err = await guard(); if (err) return err;
  const program = await prisma.mentoringProgram.findFirst({
    orderBy: { createdAt: "asc" },
    include: { _count: { select: { applications: true } } },
  });
  return NextResponse.json(program ?? null);
}

// POST — create the (singleton) program if it doesn't exist
export async function POST(req: NextRequest) {
  const err = await guard(); if (err) return err;
  const existing = await prisma.mentoringProgram.findFirst();
  if (existing) return NextResponse.json({ error: "Program already exists." }, { status: 409 });

  const body = await req.json() as {
    description?: string; duration?: string; structure?: string;
    nextCohort?: string | null; isOpen?: boolean;
  };
  if (!body.description?.trim()) return NextResponse.json({ error: "Description is required." }, { status: 400 });
  if (!body.duration?.trim())    return NextResponse.json({ error: "Duration is required."    }, { status: 400 });

  const program = await prisma.mentoringProgram.create({
    data: {
      description: body.description.trim(),
      duration:    body.duration.trim(),
      structure:   body.structure?.trim() || null,
      nextCohort:  body.nextCohort ? new Date(body.nextCohort) : null,
      isOpen:      body.isOpen ?? false,
    },
  });
  return NextResponse.json(program, { status: 201 });
}

// PATCH — update the singleton
export async function PATCH(req: NextRequest) {
  const err = await guard(); if (err) return err;
  const program = await prisma.mentoringProgram.findFirst({ orderBy: { createdAt: "asc" } });
  if (!program) return NextResponse.json({ error: "No program found." }, { status: 404 });

  const body = await req.json() as Partial<{
    description: string; duration: string; structure: string | null;
    nextCohort: string | null; isOpen: boolean;
  }>;

  const data: Record<string, unknown> = {};
  if (body.description !== undefined) data.description = body.description?.trim() ?? "";
  if (body.duration    !== undefined) data.duration    = body.duration?.trim()    ?? "";
  if (body.structure   !== undefined) data.structure   = body.structure?.trim()   || null;
  if (body.nextCohort  !== undefined) data.nextCohort  = body.nextCohort ? new Date(body.nextCohort) : null;
  if (body.isOpen      !== undefined) data.isOpen      = body.isOpen;

  const updated = await prisma.mentoringProgram.update({ where: { id: program.id }, data });
  return NextResponse.json(updated);
}
