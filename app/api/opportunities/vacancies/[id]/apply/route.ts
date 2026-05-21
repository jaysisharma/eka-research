import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const body = await req.json() as {
    name?: string; email?: string; phone?: string; message?: string;
  };

  if (!body.name?.trim() || !body.email?.trim()) {
    return NextResponse.json({ error: "Name and email are required." }, { status: 400 });
  }

  // vacancy must exist and be OPEN
  const vacancy = await prisma.vacancy.findUnique({ where: { id } });
  if (!vacancy || vacancy.status !== "OPEN") {
    return NextResponse.json({ error: "Vacancy not found or closed." }, { status: 404 });
  }

  const application = await prisma.vacancyApplication.create({
    data: {
      vacancyId: id,
      name:    body.name.trim(),
      email:   body.email.trim(),
      phone:   body.phone?.trim() || null,
      message: body.message?.trim() || null,
    },
  });

  return NextResponse.json({ ok: true, id: application.id }, { status: 201 });
}
