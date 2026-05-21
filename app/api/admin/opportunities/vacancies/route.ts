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

export async function GET() {
  const err = await guard(); if (err) return err;
  const vacancies = await prisma.vacancy.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { applications: true } } },
  });
  return NextResponse.json(vacancies);
}

export async function POST(req: NextRequest) {
  const err = await guard(); if (err) return err;
  const body = await req.json() as {
    title?: string; type?: string; department?: string;
    description?: string; deadline?: string | null; status?: string;
  };

  if (!body.title?.trim())       return NextResponse.json({ error: "Title is required."      }, { status: 400 });
  if (!body.department?.trim())  return NextResponse.json({ error: "Department is required." }, { status: 400 });
  if (!body.description?.trim()) return NextResponse.json({ error: "Description is required."}, { status: 400 });
  if (!VALID_TYPES.includes(body.type as VacancyType))
    return NextResponse.json({ error: "Invalid type." }, { status: 400 });

  const status = VALID_STATUSES.includes(body.status as VacancyStatus)
    ? (body.status as VacancyStatus) : "DRAFT";

  const vacancy = await prisma.vacancy.create({
    data: {
      title:       body.title.trim(),
      type:        body.type as VacancyType,
      department:  body.department.trim(),
      description: body.description.trim(),
      deadline:    body.deadline ? new Date(body.deadline) : null,
      status,
    },
  });
  return NextResponse.json(vacancy, { status: 201 });
}
