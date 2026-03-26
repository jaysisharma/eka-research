import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { buildMetadata } from "@/lib/seo";
import { type ProductCategory } from "@/lib/constants";
import { getStoreProducts } from "@/lib/products";
import AddToCartBtn from "@/components/store/AddToCartBtn";
import CartCount from "@/components/store/CartCount";
import styles from "./page.module.css";

export const metadata = buildMetadata({
  title: "Store",
  description:
    "Support Eka Research and take a piece of the mission home — apparel, star maps, observer kits, and digital downloads.",
  path: "/store",
});

const CATEGORIES: { id: ProductCategory | "all"; label: string }[] = [
  { id: "all",         label: "All" },
  { id: "apparel",     label: "Apparel" },
  { id: "educational", label: "Educational" },
  { id: "kits",        label: "Kits" },
  { id: "digital",     label: "Digital" },
];

function formatPrice(npr: number) {
  return `NPR ${npr.toLocaleString("en-NP")}`;
}

export const dynamic = "force-dynamic";

export default async function StorePage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category } = await searchParams;
  const active = (category ?? "all") as ProductCategory | "all";

  const allProducts = await getStoreProducts();
  const filtered =
    active === "all"
      ? allProducts
      : allProducts.filter((p) => p.category === active);

  return (
    <main>

      {/* ── HEADER ── */}
      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <div className={styles.heroPitch}>
            <span className={styles.label}>
              <span className={styles.labelLine} />
              Eka Research Store
            </span>
            <h1 className={styles.heroHeading}>
              Take a piece of the{" "}
              <span className={styles.accent}>mission home</span>
            </h1>
            <p className={styles.heroDesc}>
              Every purchase supports space science research and education in Nepal.
            </p>
          </div>
          <CartCount />
        </div>
      </section>

      {/* ── CATALOG ── */}
      <section className={styles.catalog}>
        <div className={styles.catalogInner}>

          {/* Category filter */}
          <div className={styles.filters} role="navigation" aria-label="Product categories">
            {CATEGORIES.map(({ id, label }) => (
              <Link
                key={id}
                href={id === "all" ? "/store" : `/store?category=${id}`}
                className={`${styles.filterPill} ${active === id ? styles.filterActive : ""}`}
              >
                {label}
              </Link>
            ))}
          </div>

          {/* Grid */}
          {filtered.length === 0 ? (
            <p className={styles.empty}>No products in this category yet.</p>
          ) : (
            <div className={styles.grid}>
              {filtered.map((product) => (
                <article key={product.id} className={styles.card}>

                  <Link href={`/store/${product.slug}`} className={styles.cardImageLink}>
                    <div
                      className={styles.cardImage}
                      style={product.imageUrl ? undefined : { background: product.gradient }}
                    >
                      {product.imageUrl && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={product.imageUrl} alt={product.name} className={styles.cardImg} />
                      )}
                      {product.badge && (
                        <span className={styles.badge}>{product.badge}</span>
                      )}
                      {product.digital && (
                        <span className={`${styles.badge} ${styles.badgeDigital}`}>
                          Digital
                        </span>
                      )}
                    </div>
                  </Link>

                  <div className={styles.cardBody}>
                    <span className={styles.cardCategory}>{product.category}</span>
                    <Link href={`/store/${product.slug}`} className={styles.cardNameLink}>
                      <h2 className={styles.cardName}>{product.name}</h2>
                    </Link>
                    <p className={styles.cardTagline}>{product.tagline}</p>

                    <div className={styles.cardFooter}>
                      <span className={styles.price}>{formatPrice(product.priceNpr)}</span>
                      <AddToCartBtn product={product} />
                    </div>
                  </div>

                </article>
              ))}
            </div>
          )}

        </div>
      </section>

      {/* ── SHIPPING NOTE ── */}
      <section className={styles.noteSection}>
        <div className={styles.noteInner}>
          <p className={styles.note}>
            <ShoppingCart size={14} aria-hidden="true" />
            Free shipping on orders over NPR 2,000 within Kathmandu valley.
            All orders are packed and dispatched within 3 working days.{" "}
            <Link href="/contact" className={styles.noteLink}>Questions?</Link>
          </p>
        </div>
      </section>

    </main>
  );
}
