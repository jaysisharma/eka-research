import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const [program, mentors] = await Promise.all([
    prisma.mentoringProgram.findFirst({ orderBy: { createdAt: "asc" } }),
    prisma.mentor.findMany({
      where: { active: true },
      orderBy: { createdAt: "asc" },
    }),
  ]);
  return NextResponse.json({ program, mentors });
}
