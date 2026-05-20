import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST() {
  try {
    const session = await auth();

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Set the requested role to RESEARCHER
    // An admin can then review this request and update the actual 'role' field.
    await db.user.update({
      where: { id: session.user.id },
      data: {
        requestedRole: "RESEARCHER",
      },
    });

    return NextResponse.json({
      message: "Upgrade request submitted successfully",
    });
  } catch (error) {
    console.error("[USER_UPGRADE_POST]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
