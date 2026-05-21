import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

/** GET /api/admin/projects — all projects, newest first (admin only) */
export async function GET() {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const projects = await db.project.findMany({
    orderBy: { createdAt: "desc" },
    include: { category: true },
  });

  return NextResponse.json(projects);
}

/** POST /api/admin/projects — create a project */
export async function POST(req: Request) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json() as {
    title?: string;
    description?: string;
    status?: string;
    categoryId?: string;
    period?: string;
    tags?: string[];
    imageUrl?: string | null;
    href?: string;
    featured?: boolean;
    outcome?: string | null;
    phase?: string | null;
    launchTarget?: string | null;
    published?: boolean;
  };

  const {
    title, description, status, categoryId, period,
    tags, imageUrl, href, featured, outcome, phase,
    launchTarget, published,
  } = body;

  if (!title || !description || !categoryId || !period || !href) {
    return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
  }

  const project = await db.project.create({
    data: {
      title,
      description,
      status:      status      ?? "planned",
      categoryId,
      period,
      tags:        JSON.stringify(tags ?? []),
      imageUrl:    imageUrl    ?? null,
      href,
      featured:    featured    ?? false,
      outcome:     outcome     ?? null,
      phase:       phase       ?? null,
      launchTarget: launchTarget ?? null,
      published:   published   ?? true,
    },
    include: { category: true },
  });

  return NextResponse.json(project, { status: 201 });
}
