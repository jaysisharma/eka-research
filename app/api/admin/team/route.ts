import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

/** GET /api/admin/team — retrieve all team members, ordered by order asc, then createdAt asc (admin only) */
export async function GET() {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const members = await db.teamMember.findMany({
      orderBy: [
        { order: "asc" },
        { createdAt: "asc" },
      ],
    });
    return NextResponse.json(members);
  } catch (error) {
    console.error("Failed to fetch team members:", error);
    return NextResponse.json({ error: "Failed to fetch team members." }, { status: 500 });
  }
}

/** POST /api/admin/team — create a new team member (admin only) */
export async function POST(req: Request) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { name, role, bio, imageUrl, featured, order } = body;

    if (!name || !role || !bio) {
      return NextResponse.json({ error: "Missing required fields (name, role, bio)." }, { status: 400 });
    }

    const member = await db.teamMember.create({
      data: {
        name: name.trim(),
        role: role.trim(),
        bio: bio.trim(),
        imageUrl: imageUrl ? imageUrl.trim() : null,
        featured: featured ?? false,
        order: typeof order === "number" ? order : 0,
      },
    });

    return NextResponse.json(member, { status: 201 });
  } catch (error) {
    console.error("Failed to create team member:", error);
    return NextResponse.json({ error: "Failed to create team member." }, { status: 500 });
  }
}
