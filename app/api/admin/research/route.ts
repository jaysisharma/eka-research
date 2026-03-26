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
    const articles = await db.researchArticle.findMany({ orderBy: [{ year: "desc" }, { date: "desc" }] });
    return NextResponse.json(articles);
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
    const { title, authors, ekaAuthors, journal, year, date, type, disciplines, abstract, imageUrl, doi, arxiv, featured, published } = body;

    if (!title || !authors || !journal || !year || !date || !type || !abstract) {
      return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
    }

    const article = await db.researchArticle.create({
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
    return NextResponse.json(article, { status: 201 });
  } catch (err) {
    if (err instanceof Error && err.message === "UNAUTHORIZED")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const msg = err instanceof Error ? err.message : "Server error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
