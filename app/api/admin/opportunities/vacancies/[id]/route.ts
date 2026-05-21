import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { VacancyStatus, VacancyType } from "@prisma/client";

const VALID_TYPES:    VacancyType[]   = ["FULL_TIME", "PART_TIME", "INTERNSHIP", "VOLUNTEER"];
const VALID_STATUSES: VacancyStatus[] = ["DRAFT", "OPEN", "CLOSED"];

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
  const vacancy = await prisma.vacancy.findUnique({
    where: { id },
    include: {
      applications: { orderBy: { createdAt: "desc" } },
      _count: { select: { applications: true } },
    },
  });
  if (!vacancy) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(vacancy);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const err = await guard(); if (err) return err;
  const { id } = await params;
  const body = await req.json() as Partial<{
    title: string; type: string; department: string;
    description: string; deadline: string | null; status: string;
  }>;

  const data: Record<string, unknown> = {};
  if (body.title       !== undefined) data.title       = body.title.trim();
  if (body.department  !== undefined) data.department  = body.department.trim();
  if (body.description !== undefined) data.description = body.description.trim();
  if (body.deadline    !== undefined) data.deadline    = body.deadline ? new Date(body.deadline) : null;
  if (body.type && VALID_TYPES.includes(body.type as VacancyType))
    data.type = body.type;
  if (body.status && VALID_STATUSES.includes(body.status as VacancyStatus))
    data.status = body.status;

  const updated = await prisma.vacancy.update({ where: { id }, data });
  return NextResponse.json(updated);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const err = await guard(); if (err) return err;
  const { id } = await params;
  await prisma.vacancy.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
