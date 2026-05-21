import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

const yearFromDate = (d: string): number => {
  const m = d.match(/\b(19|20)\d{2}\b/);
  return m ? parseInt(m[0], 10) : new Date().getFullYear();
};

/** GET /api/admin/papers — all papers, newest first (admin only) */
export async function GET() {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const papers = await db.researchArticle.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      submitter: { select: { id: true, name: true, email: true, role: true } },
    },
  });

  return NextResponse.json(papers);
}

/** POST /api/admin/papers — create a paper (admin-authored, auto-approved) */
export async function POST(req: Request) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const {
    title, abstract, type, publicationStatus,
    authors, internalContributors,
    journal, publicationDate, doi, arxiv,
    disciplines,
    pdfUrl, externalUrl, githubUrl, datasetUrl,
    featured, published, isPremium, content,
  } = body;

  if (!title || !abstract || !authors || !publicationDate || !type) {
    return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
  }

  const paper = await db.researchArticle.create({
    data: {
      title,
      abstract,
      type,
      publicationStatus: publicationStatus ?? "draft",
      authors:              JSON.stringify(authors),
      internalContributors: JSON.stringify(internalContributors ?? []),
      ekaAuthors:           JSON.stringify([]),
      journal:              journal  ?? "",
      publicationDate:      publicationDate,
      date:                 publicationDate,
      year:                 yearFromDate(publicationDate),
      doi:         doi         || null,
      arxiv:       arxiv       || null,
      disciplines: JSON.stringify(disciplines ?? []),
      pdfUrl:      pdfUrl      || null,
      externalUrl: externalUrl || null,
      githubUrl:   githubUrl   || null,
      datasetUrl:  datasetUrl  || null,
      featured:    featured    ?? false,
      published:   published   ?? true,
      isPremium:   isPremium   ?? false,
      content:     content     ?? null,
      submittedBy:      session.user.id,
      submissionStatus: "approved",
    },
  });

  return NextResponse.json(paper, { status: 201 });
}
