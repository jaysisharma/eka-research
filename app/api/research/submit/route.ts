import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

const ALLOWED_ROLES = ["PAID_MEMBER", "TEACHER", "RESEARCHER", "MENTOR", "ADMIN"];

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Sign in to submit research." }, { status: 401 });
    if (!ALLOWED_ROLES.includes(session.user.role)) {
      return NextResponse.json({ error: "A Premium membership is required to submit research." }, { status: 403 });
    }

    const body = await req.json();
    const { title, authors, journal, year, date, type, disciplines, abstract, doi, arxiv } = body;

    if (!title || !authors || !journal || !year || !date || !type || !abstract) {
      return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
    }

    const authorList = (authors as string).split("\n").map((s: string) => s.trim()).filter(Boolean);
    if (authorList.length === 0) {
      return NextResponse.json({ error: "At least one author is required." }, { status: 400 });
    }

    const disciplineList = disciplines
      ? (disciplines as string).split(",").map((s: string) => s.trim()).filter(Boolean)
      : [];

    const article = await db.researchArticle.create({
      data: {
        title,
        authors: JSON.stringify(authorList),
        ekaAuthors: JSON.stringify([]),
        journal,
        year: Number(year),
        date,
        type,
        disciplines: JSON.stringify(disciplineList),
        abstract,
        doi: doi || null,
        arxiv: arxiv || null,
        featured: false,
        published: false,
        submittedBy: session.user.id,
        submissionStatus: "pending",
      },
    });

    return NextResponse.json({ id: article.id }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
