import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

/** GET /api/admin/gallery — retrieve all gallery images, including drafts, ordered by creation date descending */
export async function GET() {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const images = await db.galleryImage.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(images);
  } catch (error) {
    console.error("Failed to fetch admin gallery images:", error);
    return NextResponse.json({ error: "Failed to fetch gallery images." }, { status: 500 });
  }
}

/** POST /api/admin/gallery — create a new gallery image */
export async function POST(req: Request) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { title, description, imageUrl, category, featured, published } = body;

    if (!title || !imageUrl) {
      return NextResponse.json({ error: "Title and Image URL are required." }, { status: 400 });
    }

    const image = await db.galleryImage.create({
      data: {
        title: title.trim(),
        description: description?.trim() || null,
        imageUrl: imageUrl.trim(),
        category: category || "astrophotography",
        featured: featured ?? false,
        published: published ?? true,
      },
    });

    return NextResponse.json(image, { status: 201 });
  } catch (error) {
    console.error("Failed to create gallery image:", error);
    return NextResponse.json({ error: "Failed to create gallery image." }, { status: 500 });
  }
}
