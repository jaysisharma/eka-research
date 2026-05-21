import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

/** GET /api/admin/projects/[id] */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const project = await db.project.findUnique({
    where: { id },
    include: { category: true },
  });
  if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json(project);
}

/** PATCH /api/admin/projects/[id] — update */
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
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

  const project = await db.project.update({
    where: { id },
    data: {
      ...(body.title        !== undefined && { title:        body.title        }),
      ...(body.description  !== undefined && { description:  body.description  }),
      ...(body.status       !== undefined && { status:       body.status       }),
      ...(body.categoryId   !== undefined && { categoryId:   body.categoryId   }),
      ...(body.period       !== undefined && { period:       body.period       }),
      ...(body.tags         !== undefined && { tags:         JSON.stringify(body.tags) }),
      ...(body.imageUrl     !== undefined && { imageUrl:     body.imageUrl     }),
      ...(body.href         !== undefined && { href:         body.href         }),
      ...(body.featured     !== undefined && { featured:     body.featured     }),
      ...(body.outcome      !== undefined && { outcome:      body.outcome      }),
      ...(body.phase        !== undefined && { phase:        body.phase        }),
      ...(body.launchTarget !== undefined && { launchTarget: body.launchTarget }),
      ...(body.published    !== undefined && { published:    body.published    }),
    },
    include: { category: true },
  });

  return NextResponse.json(project);
}

/** DELETE /api/admin/projects/[id] */
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  await db.project.delete({ where: { id } });

  return NextResponse.json({ ok: true });
}
