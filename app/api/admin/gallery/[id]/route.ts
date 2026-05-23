import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

type Params = { params: Promise<{ id: string }> };

/** GET /api/admin/gallery/[id] — retrieve a specific image details (admin only) */
export async function GET(_req: Request, { params }: Params) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  try {
    const image = await db.galleryImage.findUnique({
      where: { id },
    });

    if (!image) {
      return NextResponse.json({ error: "Image not found." }, { status: 404 });
    }

    return NextResponse.json(image);
  } catch (error) {
    console.error("Failed to fetch gallery image details:", error);
    return NextResponse.json({ error: "Failed to fetch gallery image." }, { status: 500 });
  }
}

/** PATCH /api/admin/gallery/[id] — update a specific image details or toggles (admin only) */
export async function PATCH(req: Request, { params }: Params) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const { id } = await params;
    const body = await req.json();
    const { title, description, imageUrl, category, featured, published } = body;

    const existing = await db.galleryImage.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Gallery image not found." }, { status: 404 });
    }

    const updated = await db.galleryImage.update({
      where: { id },
      data: {
        ...(title !== undefined && { title: title.trim() }),
        ...(description !== undefined && { description: description?.trim() || null }),
        ...(imageUrl !== undefined && { imageUrl: imageUrl.trim() }),
        ...(category !== undefined && { category }),
        featured: featured ?? existing.featured,
        published: published ?? existing.published,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Failed to update gallery image:", error);
    return NextResponse.json({ error: "Failed to update gallery image." }, { status: 500 });
  }
}

/** DELETE /api/admin/gallery/[id] — delete a specific image (admin only) */
export async function DELETE(_req: Request, { params }: Params) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const { id } = await params;
    await db.galleryImage.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Failed to delete gallery image:", error);
    return NextResponse.json({ error: "Failed to delete gallery image." }, { status: 500 });
  }
}
