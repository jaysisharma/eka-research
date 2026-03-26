import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

async function requireAdmin() {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") throw new Error("UNAUTHORIZED");
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    const { id } = await params;
    const article = await db.researchArticle.findUnique({ where: { id } });
    if (!article) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(article);
  } catch (err) {
    if (err instanceof Error && err.message === "UNAUTHORIZED")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    const { id } = await params;
    const body = await req.json();
    const { title, authors, ekaAuthors, journal, year, date, type, disciplines, abstract, imageUrl, doi, arxiv, featured, published } = body;

    const article = await db.researchArticle.update({
      where: { id },
      data: {
        title,
        authors: JSON.stringify(authors),
        ekaAuthors: JSON.stringify(ekaAuthors ?? []),
        journal,
        year: Number(year),
        date,
        type,
        disciplines: JSON.stringify(disciplines ?? []),
        abstract,
        imageUrl: imageUrl || null,
        doi: doi || null,
        arxiv: arxiv || null,
        featured: Boolean(featured),
        published: Boolean(published),
      },
    });
    return NextResponse.json(article);
  } catch (err) {
    if (err instanceof Error && err.message === "UNAUTHORIZED")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const msg = err instanceof Error ? err.message : "Server error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    const { id } = await params;
    const body = await req.json();

    // Build update payload from whichever fields are present
    const data: Record<string, unknown> = {};
    if (typeof body.featured === "boolean") data.featured = body.featured;
    if (body.submissionStatus === "approved") {
      data.submissionStatus = "approved";
      data.published = true;
    } else if (body.submissionStatus === "rejected") {
      data.submissionStatus = "rejected";
      data.published = false;
    }

    const article = await db.researchArticle.update({ where: { id }, data });
    return NextResponse.json(article);
  } catch (err) {
    if (err instanceof Error && err.message === "UNAUTHORIZED")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    const { id } = await params;
    await db.researchArticle.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof Error && err.message === "UNAUTHORIZED")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
