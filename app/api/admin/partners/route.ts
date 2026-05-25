import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

/** GET /api/admin/partners — retrieve all partners, ordered by order asc, then createdAt asc (admin only) */
export async function GET() {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const partners = await db.partner.findMany({
      orderBy: [
        { order: "asc" },
        { createdAt: "asc" },
      ],
    });
    return NextResponse.json(partners);
  } catch (error) {
    console.error("Failed to fetch partners:", error);
    return NextResponse.json({ error: "Failed to fetch partners." }, { status: 500 });
  }
}

/** POST /api/admin/partners — create a new partner (admin only) */
export async function POST(req: Request) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { name, website, logoUrl, featured, order } = body;

    if (!name) {
      return NextResponse.json({ error: "Missing required field (name)." }, { status: 400 });
    }

    const partner = await db.partner.create({
      data: {
        name: name.trim(),
        website: website ? website.trim() : null,
        logoUrl: logoUrl ? logoUrl.trim() : null,
        featured: featured ?? false,
        order: typeof order === "number" ? order : 0,
      },
    });

    return NextResponse.json(partner, { status: 201 });
  } catch (error) {
    console.error("Failed to create partner:", error);
    return NextResponse.json({ error: "Failed to create partner." }, { status: 500 });
  }
}
