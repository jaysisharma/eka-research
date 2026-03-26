import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect, notFound } from "next/navigation";
import { ProductForm } from "../../ProductForm";
import styles from "../../new/page.module.css";

type Props = { params: Promise<{ id: string }> };

export default async function EditProductPage({ params }: Props) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") redirect("/auth/login");

  const { id } = await params;
  const product = await db.storeProduct.findUnique({ where: { id } });
  if (!product) notFound();

  // Parse stored JSON strings back to typed values
  const variants: { name: string; options: string }[] = product.variants
    ? (JSON.parse(product.variants) as { name: string; options: string[] }[]).map((v) => ({
        name: v.name,
        options: v.options.join(", "),
      }))
    : [];

  const includesArr: string[] = product.includes
    ? (JSON.parse(product.includes) as string[])
    : [];

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.heading}>Edit product</h1>
        <p className={styles.sub}>{product.name}</p>
      </div>
      <ProductForm
        mode="edit"
        productId={product.id}
        initial={{
          slug: product.slug,
          name: product.name,
          tagline: product.tagline,
          category: product.category,
          priceNpr: String(product.priceNpr),
          description: product.description,
          includes: includesArr.join("\n"),
          badge: product.badge ?? "",
          inStock: product.inStock,
          digital: product.digital,
          imageUrl: product.imageUrl ?? "",
          gradient: product.gradient,
          variants,
        }}
      />
    </div>
  );
}
