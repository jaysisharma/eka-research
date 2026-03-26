import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Check, Package, Download } from "lucide-react";
import { buildMetadata } from "@/lib/seo";
import { getStoreProductBySlug, getStoreProducts } from "@/lib/products";
import ProductDetail from "./ProductDetail";
import styles from "./page.module.css";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getStoreProductBySlug(slug);
  if (!product) return {};
  return buildMetadata({
    title: product.name,
    description: product.description,
    path: `/store/${product.slug}`,
  });
}

function formatPrice(npr: number) {
  return `NPR ${npr.toLocaleString("en-NP")}`;
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getStoreProductBySlug(slug);
  if (!product) notFound();

  const allProducts = await getStoreProducts();
  const related = allProducts
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 3);

  return (
    <main>

      {/* Breadcrumb */}
      <div className={styles.breadcrumb}>
        <div className={styles.breadcrumbInner}>
          <Link href="/store" className={styles.backLink}>
            <ArrowLeft size={14} />
            Back to store
          </Link>
        </div>
      </div>

      {/* ── PRODUCT ── */}
      <section className={styles.productSection}>
        <div className={styles.productInner}>

          {/* Image */}
          <div
            className={styles.productImage}
            style={product.imageUrl ? undefined : { background: product.gradient }}
            aria-hidden="true"
          >
            {product.imageUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={product.imageUrl} alt={product.name} className={styles.productImg} />
            )}
            {product.badge && (
              <span className={styles.badge}>{product.badge}</span>
            )}
          </div>

          {/* Details */}
          <div className={styles.productDetails}>
            <div className={styles.detailTop}>
              <span className={styles.category}>{product.category}</span>
              <h1 className={styles.name}>{product.name}</h1>
              <p className={styles.tagline}>{product.tagline}</p>
              <p className={styles.price}>{formatPrice(product.priceNpr)}</p>
            </div>

            {/* Interactive: variant picker + add to cart */}
            <ProductDetail product={product} />

            {/* Delivery info */}
            <div className={styles.deliveryInfo}>
              {product.digital ? (
                <div className={styles.deliveryRow}>
                  <Download size={14} />
                  <span>Instant download after order confirmation</span>
                </div>
              ) : (
                <>
                  <div className={styles.deliveryRow}>
                    <Package size={14} />
                    <span>Dispatched within 3 working days</span>
                  </div>
                  <div className={styles.deliveryRow}>
                    <Check size={14} />
                    <span>Free shipping on orders over NPR 2,000 (Kathmandu valley)</span>
                  </div>
                </>
              )}
            </div>

            {/* Description */}
            <div className={styles.description}>
              <h2 className={styles.descHeading}>About this product</h2>
              <p className={styles.descText}>{product.description}</p>
              {product.includes && product.includes.length > 0 && (
                <>
                  <h3 className={styles.includesHeading}>What&apos;s included</h3>
                  <ul className={styles.includesList}>
                    {product.includes.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </>
              )}
            </div>

          </div>
        </div>
      </section>

      {/* ── RELATED PRODUCTS ── */}
      {related.length > 0 && (
        <section className={styles.relatedSection}>
          <div className={styles.relatedInner}>
            <h2 className={styles.relatedHeading}>More in {product.category}</h2>
            <div className={styles.relatedGrid}>
              {related.map((p) => (
                <Link key={p.id} href={`/store/${p.slug}`} className={styles.relatedCard}>
                  <div
                    className={styles.relatedImage}
                    style={p.imageUrl ? undefined : { background: p.gradient }}
                  >
                    {p.imageUrl && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={p.imageUrl} alt={p.name} className={styles.relatedImg} />
                    )}
                  </div>
                  <div className={styles.relatedBody}>
                    <span className={styles.relatedName}>{p.name}</span>
                    <span className={styles.relatedPrice}>{formatPrice(p.priceNpr)}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

    </main>
  );
}
