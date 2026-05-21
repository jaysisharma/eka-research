import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

/** GET /api/admin/store/products/[id] */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  const product = await db.storeProduct.findUnique({ where: { id } });
  if (!product) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json(product);
}

/** PATCH /api/admin/store/products/[id] */
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  const body = await req.json() as Record<string, unknown>;

  // Serialize arrays to JSON strings before writing
  const data: Record<string, unknown> = { ...body };
  if (Array.isArray(data.includes)) data.includes = JSON.stringify(data.includes);
  if (Array.isArray(data.variants))  data.variants  = JSON.stringify(data.variants);

  const product = await db.storeProduct.update({ where: { id }, data });
  return NextResponse.json(product);
}

/** DELETE /api/admin/store/products/[id] */
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;

  // Check for existing order items (Restrict constraint)
  const referenced = await db.orderItem.count({ where: { productId: id } });
  if (referenced > 0)
    return NextResponse.json(
      { error: `Cannot delete — product appears in ${referenced} order item(s).` },
      { status: 409 }
    );

  await db.storeProduct.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
