import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

const VALID_STATUSES = ["pending", "processing", "shipped", "delivered", "cancelled"] as const;
type OrderStatus = typeof VALID_STATUSES[number];

/** PATCH /api/admin/store/orders/[id] — update status */
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  const { status } = await req.json() as { status?: string };

  if (!status || !VALID_STATUSES.includes(status as OrderStatus))
    return NextResponse.json({ error: "Invalid status." }, { status: 400 });

  const order = await db.order.update({
    where: { id },
    data: { status },
    select: { id: true, status: true },
  });

  return NextResponse.json(order);
}
