import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

type Params = { params: Promise<{ id: string }> };

const slugify = (s: string) =>
  s.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

/** GET /api/admin/news/[id] */
export async function GET(_req: Request, { params }: Params) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const post = await db.newsPost.findUnique({
    where: { id },
  });

  if (!post) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(post);
}

/** PATCH /api/admin/news/[id] */
export async function PATCH(req: Request, { params }: Params) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const { id } = await params;
    const body = await req.json();
    const { title, excerpt, category, date, imageUrl, featured, published } = body;

    // Retrieve existing post to compare
    const existingPost = await db.newsPost.findUnique({ where: { id } });
    if (!existingPost) {
      return NextResponse.json({ error: "News post not found." }, { status: 404 });
    }

    let slug = existingPost.slug;
    let href = existingPost.href;

    if (body.slug !== undefined || title !== undefined) {
      const rawSlug = body.slug !== undefined ? body.slug.trim() : (title || existingPost.title);
      const newSlug = slugify(rawSlug);

      if (!newSlug) {
        return NextResponse.json({ error: "Invalid slug or title." }, { status: 400 });
      }

      if (newSlug !== existingPost.slug) {
        // Ensure slug is unique
        const taken = await db.newsPost.findUnique({ where: { slug: newSlug } });
        if (taken && taken.id !== id) {
          return NextResponse.json({ error: "Slug already exists. Please choose a different slug." }, { status: 400 });
        }
        slug = newSlug;
        href = `/news/${newSlug}`;
      }
    }

    const updated = await db.newsPost.update({
      where: { id },
      data: {
        ...(title !== undefined && { title }),
        ...(excerpt !== undefined && { excerpt }),
        ...(category !== undefined && { category }),
        ...(date !== undefined && { date }),
        ...(imageUrl !== undefined && { imageUrl: imageUrl || null }),
        featured: featured ?? existingPost.featured,
        published: published ?? existingPost.published,
        slug,
        href,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Failed to update news post:", error);
    return NextResponse.json({ error: "Failed to update news post." }, { status: 500 });
  }
}

/** DELETE /api/admin/news/[id] */
export async function DELETE(_req: Request, { params }: Params) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const { id } = await params;
    await db.newsPost.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Failed to delete news post:", error);
    return NextResponse.json({ error: "Failed to delete news post." }, { status: 500 });
  }
}
