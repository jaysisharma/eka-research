import { NextResponse } from "next/server";
import { db } from "@/lib/db";

/** GET /api/gallery — retrieve all published gallery images */
export async function GET() {
  try {
    const images = await db.galleryImage.findMany({
      where: { published: true },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(images);
  } catch (error) {
    console.error("Failed to fetch gallery images:", error);
    return NextResponse.json({ error: "Failed to fetch gallery images." }, { status: 500 });
  }
}
