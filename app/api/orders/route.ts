import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

type CartItemPayload = {
  productId: string;
  name: string;
  priceNpr: number;
  quantity: number;
  variant?: string;
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, phone, address, district, province, notes, items } = body as {
      name: string;
      email: string;
      phone?: string;
      address: string;
      district: string;
      province: string;
      notes?: string;
      items: CartItemPayload[];
    };

    if (!name || !email || !address || !district || !province || !items?.length) {
      return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
    }

    // Validate prices server-side against DB products
    const productIds = items.map((i) => i.productId);
    const dbProducts = await db.storeProduct.findMany({
      where: { id: { in: productIds } },
      select: { id: true, name: true, priceNpr: true },
    });

    const validatedItems = items.map((item) => {
      const product = dbProducts.find((p) => p.id === item.productId);
      if (!product) throw new Error(`Unknown product: ${item.productId}`);
      return {
        productId: item.productId,
        name: product.name,
        priceNpr: product.priceNpr,
        quantity: Math.max(1, Math.floor(item.quantity)),
        variant: item.variant ?? null,
      };
    });

    const totalNpr = validatedItems.reduce(
      (sum, i) => sum + i.priceNpr * i.quantity,
      0
    );

    // Optionally link to logged-in user
    const session = await auth();
    const userId = session?.user?.id ?? null;

    const order = await db.order.create({
      data: {
        name,
        email,
        phone: phone ?? null,
        address,
        district,
        province,
        notes: notes ?? null,
        totalNpr,
        userId,
        items: {
          create: validatedItems,
        },
      },
      select: { id: true, totalNpr: true, createdAt: true },
    });

    return NextResponse.json({ orderId: order.id, totalNpr: order.totalNpr }, { status: 201 });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Something went wrong.";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
