"use client";

import {
  createContext,
  useContext,
  useCallback,
  useState,
  useMemo,
  type ReactNode,
} from "react";

export type CartLine = {
  variantId: string;
  quantity: number;
  productHandle: string;
  productTitle: string;
  variantTitle?: string | null;
  price: {
    amount: number;
    currencyCode: string;
  };
  image?: {
    url: string;
    alt?: string | null;
  };
};

type AddItemInput = {
  variantId: string;
  quantity?: number;
  productHandle: string;
  productTitle: string;
  variantTitle?: string | null;
  price: {
    amount: number;
    currencyCode: string;
  };
  image?: {
    url?: string | null;
    alt?: string | null;
  };
};

type CartContextValue = {
  items: CartLine[];
  itemCount: number;
  addItem: (input: AddItemInput) => void;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartLine[]>([]);

  const addItem = useCallback((input: AddItemInput) => {
    const quantity = input.quantity ?? 1;
    setItems((prev) => {
      const i = prev.findIndex((l) => l.variantId === input.variantId);
      if (i >= 0) {
        const next = [...prev];
        next[i] = { ...next[i], quantity: next[i].quantity + quantity };
        return next;
      }

      const image =
        input.image?.url && typeof input.image.url === "string"
          ? { url: input.image.url, alt: input.image.alt ?? null }
          : undefined;

      return [
        ...prev,
        {
          variantId: input.variantId,
          quantity,
          productHandle: input.productHandle,
          productTitle: input.productTitle,
          variantTitle: input.variantTitle ?? null,
          price: input.price,
          image,
        },
      ];
    });
  }, []);

  const itemCount = useMemo(
    () => items.reduce((n, l) => n + l.quantity, 0),
    [items]
  );

  const value = useMemo(
    () => ({ items, itemCount, addItem }),
    [items, itemCount, addItem]
  );

  return (
    <CartContext.Provider value={value}>{children}</CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
