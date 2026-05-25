import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

type Params = { params: Promise<{ id: string }> };

/** GET /api/admin/partners/[id] — retrieve a specific partner's details (admin only) */
export async function GET(_req: Request, { params }: Params) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const { id } = await params;
    const partner = await db.partner.findUnique({
      where: { id },
    });

    if (!partner) {
      return NextResponse.json({ error: "Partner not found" }, { status: 404 });
    }

    return NextResponse.json(partner);
  } catch (error) {
    console.error("Failed to fetch partner:", error);
    return NextResponse.json({ error: "Failed to fetch partner." }, { status: 500 });
  }
}

/** PATCH /api/admin/partners/[id] — update details of a specific partner (admin only) */
export async function PATCH(req: Request, { params }: Params) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const { id } = await params;
    const body = await req.json();
    const { name, website, logoUrl, featured, order } = body;

    const existing = await db.partner.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Partner not found." }, { status: 404 });
    }

    const updated = await db.partner.update({
      where: { id },
      data: {
        ...(name !== undefined && { name: name.trim() }),
        ...(website !== undefined && { website: website ? website.trim() : null }),
        ...(logoUrl !== undefined && { logoUrl: logoUrl ? logoUrl.trim() : null }),
        ...(featured !== undefined && { featured }),
        ...(order !== undefined && { order: typeof order === "number" ? order : existing.order }),
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Failed to update partner:", error);
    return NextResponse.json({ error: "Failed to update partner." }, { status: 500 });
  }
}

/** DELETE /api/admin/partners/[id] — delete a specific partner (admin only) */
export async function DELETE(_req: Request, { params }: Params) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const { id } = await params;

    const existing = await db.partner.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Partner not found." }, { status: 404 });
    }

    await db.partner.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Failed to delete partner:", error);
    return NextResponse.json({ error: "Failed to delete partner." }, { status: 500 });
  }
}
