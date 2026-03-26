"use client";

import { useState } from "react";
import { ShoppingCart, Check } from "lucide-react";
import { useCart } from "./CartProvider";
import type { Product } from "@/lib/constants";
import styles from "./AddToCartBtn.module.css";

type Props = {
  product: Product;
  selectedVariant?: string;
  qty?: number;
  fullWidth?: boolean;
};

export default function AddToCartBtn({ product, selectedVariant, qty = 1, fullWidth }: Props) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);

  function handleClick() {
    addItem(
      {
        productId: product.id,
        name: product.name,
        priceNpr: product.priceNpr,
        variant: selectedVariant,
      },
      qty
    );
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  }

  return (
    <button
      onClick={handleClick}
      className={`${styles.btn} ${added ? styles.added : ""} ${fullWidth ? styles.fullWidth : ""}`}
      disabled={!product.inStock}
    >
      {added ? (
        <>
          <Check size={14} strokeWidth={2.5} />
          Added
        </>
      ) : (
        <>
          <ShoppingCart size={14} />
          {product.inStock ? "Add to cart" : "Out of stock"}
        </>
      )}
    </button>
  );
}
