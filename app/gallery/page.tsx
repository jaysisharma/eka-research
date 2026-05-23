export const dynamic = "force-dynamic";
import { buildMetadata } from "@/lib/seo";
import { db } from "@/lib/db";
import GalleryClient from "./GalleryClient";

export const metadata = buildMetadata({
  title: "Science Gallery",
  description: "Explore astrophotography, research telemetry images, observatories, and outreach snapshots captured by Eka Research.",
  path: "/gallery",
});

export default async function GalleryPage() {
  // Fetch published gallery images directly on the server
  const images = await db.galleryImage.findMany({
    where: { published: true },
    orderBy: { createdAt: "desc" },
  });

  // Convert Date objects to strings for Client Component serialization
  const serializedImages = images.map((img) => ({
    ...img,
    createdAt: img.createdAt.toISOString(),
    updatedAt: img.updatedAt.toISOString(),
  }));

  return <GalleryClient initialImages={serializedImages} />;
}
