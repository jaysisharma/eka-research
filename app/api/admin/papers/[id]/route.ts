import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

type Params = { params: Promise<{ id: string }> };

const yearFromDate = (d: string): number => {
  const m = d.match(/\b(19|20)\d{2}\b/);
  return m ? parseInt(m[0], 10) : new Date().getFullYear();
};

/** GET /api/admin/papers/[id] */
export async function GET(_req: Request, { params }: Params) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const { id } = await params;
  const paper = await db.researchArticle.findUnique({
    where: { id },
    include: { submitter: { select: { id: true, name: true, email: true, role: true } } },
  });
  if (!paper) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(paper);
}

/** PATCH /api/admin/papers/[id] */
export async function PATCH(req: Request, { params }: Params) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const body   = await req.json();
  const {
    title, abstract, type, publicationStatus,
    authors, internalContributors,
    journal, publicationDate, doi, arxiv,
    disciplines,
    pdfUrl, externalUrl, githubUrl, datasetUrl,
    featured, published,
  } = body;

  const paper = await db.researchArticle.update({
    where: { id },
    data: {
      ...(title             !== undefined && { title }),
      ...(abstract          !== undefined && { abstract }),
      ...(type              !== undefined && { type }),
      ...(publicationStatus !== undefined && { publicationStatus }),
      ...(authors           !== undefined && { authors:              JSON.stringify(authors) }),
      ...(internalContributors !== undefined && { internalContributors: JSON.stringify(internalContributors) }),
      ...(journal           !== undefined && { journal }),
      ...(publicationDate   !== undefined && {
        publicationDate,
        date: publicationDate,
        year: yearFromDate(publicationDate),
      }),
      ...(doi               !== undefined && { doi:         doi         || null }),
      ...(arxiv             !== undefined && { arxiv:       arxiv       || null }),
      ...(disciplines       !== undefined && { disciplines: JSON.stringify(disciplines) }),
      ...(pdfUrl            !== undefined && { pdfUrl:      pdfUrl      || null }),
      ...(externalUrl       !== undefined && { externalUrl: externalUrl || null }),
      ...(githubUrl         !== undefined && { githubUrl:   githubUrl   || null }),
      ...(datasetUrl        !== undefined && { datasetUrl:  datasetUrl  || null }),
      ...(featured          !== undefined && { featured }),
      ...(published         !== undefined && { published }),
    },
  });

  return NextResponse.json(paper);
}

/** DELETE /api/admin/papers/[id] */
export async function DELETE(_req: Request, { params }: Params) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const { id } = await params;
  await db.researchArticle.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
