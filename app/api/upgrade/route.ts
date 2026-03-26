import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { plan } = await req.json();

    if (plan !== "monthly" && plan !== "yearly") {
      return NextResponse.json({ error: "Invalid plan. Must be 'monthly' or 'yearly'." }, { status: 400 });
    }

    const userId = session.user.id;

    // Update user role to PAID_MEMBER
    await db.user.update({
      where: { id: userId },
      data: { role: "PAID_MEMBER" },
    });

    // Upsert subscription record
    await db.subscription.upsert({
      where: { userId },
      update: { plan, status: "active", updatedAt: new Date() },
      create: { userId, plan, status: "active" },
    });

    return NextResponse.json({ ok: true, role: "PAID_MEMBER" });
  } catch {
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
