import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const projects = await db.project.findMany({
    orderBy: { createdAt: "desc" },
    include: { category: true },
  });

  return NextResponse.json(projects);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

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

    const project = await db.project.create({
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

    return NextResponse.json(project, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}
