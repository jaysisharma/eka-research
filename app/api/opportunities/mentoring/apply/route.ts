import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const body = await req.json() as {
    name?: string; email?: string; phone?: string;
    background?: string; goals?: string;
  };

  if (!body.name?.trim() || !body.email?.trim()) {
    return NextResponse.json({ error: "Name and email are required." }, { status: 400 });
  }

  const program = await prisma.mentoringProgram.findFirst({ orderBy: { createdAt: "asc" } });
  if (!program) {
    return NextResponse.json({ error: "Program not configured." }, { status: 404 });
  }
  if (!program.isOpen) {
    return NextResponse.json({ error: "Applications are currently closed." }, { status: 409 });
  }

  const application = await prisma.mentoringApplication.create({
    data: {
      programId:  program.id,
      name:       body.name.trim(),
      email:      body.email.trim(),
      phone:      body.phone?.trim()      || null,
      background: body.background?.trim() || null,
      goals:      body.goals?.trim()      || null,
    },
  });

  return NextResponse.json({ ok: true, id: application.id }, { status: 201 });
}
