"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";

export type CartItem = {
  productId: string;
  name: string;
  priceNpr: number;
  quantity: number;
  variant?: string;
};

type CartContextType = {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "quantity">, qty?: number) => void;
  removeItem: (productId: string, variant?: string) => void;
  updateQty: (productId: string, variant: string | undefined, qty: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalNpr: number;
  hydrated: boolean;
};

const CartContext = createContext<CartContextType | null>(null);

const STORAGE_KEY = "eka-cart";

function itemKey(productId: string, variant?: string) {
  return `${productId}__${variant ?? ""}`;
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setItems(JSON.parse(raw) as CartItem[]);
    } catch {
      // ignore
    }
    setHydrated(true);
  }, []);

  // Persist to localStorage whenever items change (after hydration)
  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items, hydrated]);

  const addItem = useCallback(
    (item: Omit<CartItem, "quantity">, qty = 1) => {
      setItems((prev) => {
        const key = itemKey(item.productId, item.variant);
        const existing = prev.find(
          (i) => itemKey(i.productId, i.variant) === key
        );
        if (existing) {
          return prev.map((i) =>
            itemKey(i.productId, i.variant) === key
              ? { ...i, quantity: i.quantity + qty }
              : i
          );
        }
        return [...prev, { ...item, quantity: qty }];
      });
    },
    []
  );

  const removeItem = useCallback((productId: string, variant?: string) => {
    const key = itemKey(productId, variant);
    setItems((prev) => prev.filter((i) => itemKey(i.productId, i.variant) !== key));
  }, []);

  const updateQty = useCallback(
    (productId: string, variant: string | undefined, qty: number) => {
      if (qty < 1) {
        removeItem(productId, variant);
        return;
      }
      const key = itemKey(productId, variant);
      setItems((prev) =>
        prev.map((i) =>
          itemKey(i.productId, i.variant) === key ? { ...i, quantity: qty } : i
        )
      );
    },
    [removeItem]
  );

  const clearCart = useCallback(() => setItems([]), []);

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
  const totalNpr = items.reduce((sum, i) => sum + i.priceNpr * i.quantity, 0);

  return (
    <CartContext.Provider
      value={{ items, addItem, removeItem, updateQty, clearCart, totalItems, totalNpr, hydrated }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
