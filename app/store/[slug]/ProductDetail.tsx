"use client";

import { useState } from "react";
import Link from "next/link";
import { Minus, Plus } from "lucide-react";
import type { Product } from "@/lib/constants";
import AddToCartBtn from "@/components/store/AddToCartBtn";
import styles from "./ProductDetail.module.css";

export default function ProductDetail({ product }: { product: Product }) {
  const [selections, setSelections] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {};
    product.variants?.forEach((v) => {
      init[v.name] = v.options[0];
    });
    return init;
  });
  const [qty, setQty] = useState(1);

  const variantLabel = product.variants
    ? product.variants.map((v) => `${v.name}: ${selections[v.name]}`).join(" / ")
    : undefined;

  return (
    <div className={styles.wrap}>

      {/* Variant pickers */}
      {product.variants && product.variants.length > 0 && (
        <div className={styles.variants}>
          {product.variants.map((group) => (
            <div key={group.name} className={styles.variantGroup}>
              <span className={styles.variantLabel}>{group.name}</span>
              <div className={styles.variantOptions}>
                {group.options.map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    className={`${styles.variantBtn} ${
                      selections[group.name] === opt ? styles.variantBtnActive : ""
                    }`}
                    onClick={() =>
                      setSelections((prev) => ({ ...prev, [group.name]: opt }))
                    }
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Quantity + Add to cart */}
      <div className={styles.actions}>
        <div className={styles.qtyRow}>
          <button
            type="button"
            className={styles.qtyBtn}
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            aria-label="Decrease quantity"
          >
            <Minus size={14} />
          </button>
          <span className={styles.qtyNum}>{qty}</span>
          <button
            type="button"
            className={styles.qtyBtn}
            onClick={() => setQty((q) => q + 1)}
            aria-label="Increase quantity"
          >
            <Plus size={14} />
          </button>
        </div>

        <AddToCartBtn
          product={product}
          selectedVariant={variantLabel}
          qty={qty}
          fullWidth
        />
      </div>

      <Link href="/store/cart" className={styles.viewCartLink}>
        View cart →
      </Link>
    </div>
  );
}
