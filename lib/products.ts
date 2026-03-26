import { db } from "@/lib/db";
import type { Product, ProductCategory, ProductVariantGroup } from "@/lib/constants";

type DbProduct = {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  category: string;
  priceNpr: number;
  description: string;
  includes: string | null;
  variants: string | null;
  badge: string | null;
  inStock: boolean;
  digital: boolean;
  imageUrl: string | null;
  gradient: string;
};

export function dbProductToProduct(p: DbProduct): Product {
  const includes: string[] | undefined = p.includes
    ? (JSON.parse(p.includes) as string[])
    : undefined;

  const variants: ProductVariantGroup[] | undefined = p.variants
    ? (JSON.parse(p.variants) as ProductVariantGroup[])
    : undefined;

  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    tagline: p.tagline,
    category: p.category as ProductCategory,
    priceNpr: p.priceNpr,
    description: p.description,
    includes,
    variants,
    badge: p.badge ?? undefined,
    inStock: p.inStock,
    digital: p.digital,
    gradient: p.gradient,
    imageUrl: p.imageUrl ?? undefined,
  };
}

export async function getStoreProducts(): Promise<Product[]> {
  const rows = await db.storeProduct.findMany({ orderBy: { createdAt: "desc" } });
  return rows.map(dbProductToProduct);
}

export async function getStoreProductBySlug(slug: string): Promise<Product | null> {
  const row = await db.storeProduct.findUnique({ where: { slug } });
  return row ? dbProductToProduct(row) : null;
}
