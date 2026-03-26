import Link from "next/link";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { Plus, Pencil, Trash2, PackageCheck, PackageX } from "lucide-react";
import { DeleteProductBtn } from "./DeleteProductBtn";
import styles from "./page.module.css";

function formatPrice(n: number) {
  return `NPR ${n.toLocaleString("en-NP")}`;
}

export default async function AdminStorePage() {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") redirect("/auth/login");

  const products = await db.storeProduct.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div className={styles.page}>

      <div className={styles.header}>
        <div>
          <h1 className={styles.heading}>Store products</h1>
          <p className={styles.sub}>{products.length} product{products.length !== 1 ? "s" : ""} in catalogue</p>
        </div>
        <Link href="/admin/store/new" className={styles.addBtn}>
          <Plus size={15} />
          Add product
        </Link>
      </div>

      {products.length === 0 ? (
        <div className={styles.empty}>
          <p>No products yet.</p>
          <Link href="/admin/store/new" className={styles.addBtnEmpty}>
            <Plus size={14} /> Add your first product
          </Link>
        </div>
      ) : (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th className={styles.th}>Product</th>
                <th className={styles.th}>Category</th>
                <th className={styles.th}>Price</th>
                <th className={styles.th}>Status</th>
                <th className={styles.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id} className={styles.tr}>
                  <td className={styles.td}>
                    <div className={styles.productCell}>
                      <div
                        className={styles.thumb}
                        style={
                          p.imageUrl
                            ? undefined
                            : { background: p.gradient }
                        }
                      >
                        {p.imageUrl && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={p.imageUrl} alt={p.name} className={styles.thumbImg} />
                        )}
                      </div>
                      <div>
                        <span className={styles.productName}>{p.name}</span>
                        <span className={styles.productSlug}>/{p.slug}</span>
                      </div>
                    </div>
                  </td>
                  <td className={`${styles.td} ${styles.tdMuted}`}>{p.category}</td>
                  <td className={`${styles.td} ${styles.tdMuted}`}>{formatPrice(p.priceNpr)}</td>
                  <td className={styles.td}>
                    {p.inStock ? (
                      <span className={styles.badgeIn}>
                        <PackageCheck size={12} /> In stock
                      </span>
                    ) : (
                      <span className={styles.badgeOut}>
                        <PackageX size={12} /> Out of stock
                      </span>
                    )}
                  </td>
                  <td className={styles.td}>
                    <div className={styles.actions}>
                      <Link
                        href={`/admin/store/${p.id}/edit`}
                        className={styles.editBtn}
                        title="Edit"
                      >
                        <Pencil size={14} />
                      </Link>
                      <DeleteProductBtn id={p.id} name={p.name} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

    </div>
  );
}
