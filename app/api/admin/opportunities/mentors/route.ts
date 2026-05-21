import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function guard() {
  const session = await auth();
  if (!session || session.user?.role !== "ADMIN")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  return null;
}

export async function GET() {
  const err = await guard(); if (err) return err;
  const mentors = await prisma.mentor.findMany({ orderBy: { createdAt: "asc" } });
  return NextResponse.json(mentors);
}

export async function POST(req: NextRequest) {
  const err = await guard(); if (err) return err;
  const body = await req.json() as {
    name?: string; expertise?: string; bio?: string;
    imageUrl?: string; linkedIn?: string; active?: boolean;
  };

  if (!body.name?.trim())      return NextResponse.json({ error: "Name is required."      }, { status: 400 });
  if (!body.expertise?.trim()) return NextResponse.json({ error: "Expertise is required." }, { status: 400 });

  const mentor = await prisma.mentor.create({
    data: {
      name:      body.name.trim(),
      expertise: body.expertise.trim(),
      bio:       body.bio?.trim()      || null,
      imageUrl:  body.imageUrl?.trim() || null,
      linkedIn:  body.linkedIn?.trim() || null,
      active:    body.active ?? true,
    },
  });
  return NextResponse.json(mentor, { status: 201 });
}
