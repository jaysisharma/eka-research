import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const project = await db.project.findUnique({
    where: { id },
    include: { category: true },
  });

  if (!project) {
    return NextResponse.json({ error: "Project not found." }, { status: 404 });
  }

  return NextResponse.json(project);
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const body = await req.json();
    const {
      title, description, status, categoryId,
      period, tags, imageUrl, href, featured,
      outcome, phase, launchTarget, published,
    } = body;

    if (!title || !description || !status || !categoryId || !period || !href) {
      return NextResponse.json({ error: "Required fields missing." }, { status: 400 });
    }

    const project = await db.project.update({
      where: { id },
      data: {
        title,
        description,
        status,
        categoryId,
        period,
        tags: tags ?? "",
        imageUrl: imageUrl ?? null,
        href,
        featured: featured ?? false,
        outcome: outcome ?? null,
        phase: phase ?? null,
        launchTarget: launchTarget ?? null,
        published: published ?? true,
      },
      include: { category: true },
    });

    return NextResponse.json(project);
  } catch {
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  await db.project.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
