import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

const slugify = (s: string) =>
  s.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

/** GET /api/admin/news — retrieve all news posts, ordered by date descending (admin only) */
export async function GET() {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const posts = await db.newsPost.findMany({
    orderBy: { date: "desc" },
  });

  return NextResponse.json(posts);
}

/** POST /api/admin/news — create a news post (admin only) */
export async function POST(req: Request) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { title, excerpt, category, date, imageUrl, featured, published } = body;

    if (!title || !excerpt || !category || !date) {
      return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
    }

    // Format & validate slug
    let rawSlug = body.slug?.trim() || title;
    let slug = slugify(rawSlug);
    if (!slug) {
      return NextResponse.json({ error: "Invalid title or slug." }, { status: 400 });
    }

    // Ensure slug is unique
    const existing = await db.newsPost.findUnique({ where: { slug } });
    if (existing) {
      return NextResponse.json({ error: "Slug already exists. Please choose a different slug." }, { status: 400 });
    }

    const post = await db.newsPost.create({
      data: {
        title,
        slug,
        excerpt,
        category,
        date,
        imageUrl: imageUrl || null,
        href: `/news/${slug}`,
        featured: featured ?? false,
        published: published ?? true,
      },
    });

    return NextResponse.json(post, { status: 201 });
  } catch (error) {
    console.error("Failed to create news post:", error);
    return NextResponse.json({ error: "Failed to create news post." }, { status: 500 });
  }
}
