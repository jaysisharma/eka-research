import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

const slugify = (s: string) =>
  s.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

/** GET /api/admin/store/products */
export async function GET() {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const products = await db.storeProduct.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { orderItems: true } } },
  });

  return NextResponse.json(products);
}

/** POST /api/admin/store/products */
export async function POST(req: Request) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json() as {
    name?: string; slug?: string; tagline?: string;
    category?: string; priceNpr?: number; description?: string;
    includes?: string[]; variants?: { name: string; options: string[] }[];
    badge?: string | null; inStock?: boolean; digital?: boolean;
    imageUrl?: string | null; gradient?: string;
  };

  const { name, tagline, category, priceNpr, description } = body;
  if (!name || !tagline || !category || !priceNpr || !description)
    return NextResponse.json({ error: "Missing required fields." }, { status: 400 });

  const slug = body.slug?.trim() || slugify(name);

  const product = await db.storeProduct.create({
    data: {
      name, tagline, category, priceNpr, description,
      slug,
      includes:  body.includes?.length  ? JSON.stringify(body.includes)  : null,
      variants:  body.variants?.length   ? JSON.stringify(body.variants)  : null,
      badge:     body.badge     || null,
      inStock:   body.inStock   ?? true,
      digital:   body.digital   ?? false,
      imageUrl:  body.imageUrl  || null,
      gradient:  body.gradient  || "linear-gradient(135deg, #1a2060 0%, #0a0d22 100%)",
    },
  });

  return NextResponse.json(product, { status: 201 });
}
