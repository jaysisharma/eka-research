import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const vacancies = await prisma.vacancy.findMany({
    where: { status: "OPEN" },
    orderBy: [{ deadline: "asc" }, { createdAt: "desc" }],
    select: {
      id: true, title: true, type: true, department: true,
      description: true, deadline: true, status: true, createdAt: true,
    },
  });
  return NextResponse.json(vacancies);
}
