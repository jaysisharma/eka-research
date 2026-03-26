import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

async function requireAdmin() {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") throw new Error("UNAUTHORIZED");
}

export async function GET() {
  try {
    await requireAdmin();
    const posts = await db.newsPost.findMany({ orderBy: { date: "desc" } });
    return NextResponse.json(posts);
  } catch (err) {
    if (err instanceof Error && err.message === "UNAUTHORIZED")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
    const body = await req.json();
    const { slug, title, excerpt, category, date, imageUrl, href, featured, published } = body;

    if (!slug || !title || !excerpt || !category || !date || !href) {
      return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
    }

    const post = await db.newsPost.create({
      data: { slug, title, excerpt, category, date, imageUrl: imageUrl || null, href, featured: Boolean(featured), published: Boolean(published) },
    });
    return NextResponse.json(post, { status: 201 });
  } catch (err) {
    if (err instanceof Error && err.message === "UNAUTHORIZED")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const msg = err instanceof Error ? err.message : "Server error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
