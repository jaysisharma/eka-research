export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

function requireAdmin() {
  return auth().then((session) => {
    if (!session || session.user.role !== "ADMIN") {
      throw new Error("UNAUTHORIZED");
    }
  });
}

export async function GET() {
  try {
    await requireAdmin();
    const products = await db.storeProduct.findMany({ orderBy: { createdAt: "desc" } });
    return NextResponse.json(products);
  } catch (err) {
    if (err instanceof Error && err.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
    const body = await req.json();
    const {
      slug, name, tagline, category, priceNpr, description,
      includes, variants, badge, inStock, digital, imageUrl, gradient,
    } = body;

    if (!slug || !name || !tagline || !category || !priceNpr || !description) {
      return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
    }

    const product = await db.storeProduct.create({
      data: {
        slug,
        name,
        tagline,
        category,
        priceNpr: Number(priceNpr),
        description,
        includes: includes ? JSON.stringify(includes) : null,
        variants: variants ? JSON.stringify(variants) : null,
        badge: badge || null,
        inStock: Boolean(inStock),
        digital: Boolean(digital),
        imageUrl: imageUrl || null,
        gradient: gradient || "linear-gradient(135deg, #1a2060 0%, #0a0d22 100%)",
      },
    });

    return NextResponse.json(product, { status: 201 });
  } catch (err) {
    if (err instanceof Error && err.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
