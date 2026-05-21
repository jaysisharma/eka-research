import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

/** GET /api/admin/users — list all users (admin only) */
export async function GET() {
  const session = await auth();

  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const users = await db.user.findMany({
    select: {
      id:            true,
      name:          true,
      email:         true,
      role:          true,
      level:         true,
      interest:      true,
      emailVerified: true,
      createdAt:     true,
      _count: {
        select: {
          orders:              true,
          registrations:       true,
          researchSubmissions: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(users);
}
