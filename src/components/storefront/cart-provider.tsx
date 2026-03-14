"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import { CartContext, loadCart, saveCart } from "@/lib/cart";
import type { CartItem, Product, ProductVariant } from "@/lib/types";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setItems(loadCart());
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) saveCart(items);
  }, [items, loaded]);

  const addItem = useCallback(
    (product: Product, variant?: ProductVariant, quantity = 1) => {
      setItems((prev) => {
        const variantId = variant?.id ?? null;
        const existing = prev.find(
          (i) => i.product_id === product.id && i.variant_id === variantId
        );
        if (existing) {
          return prev.map((i) =>
            i.product_id === product.id && i.variant_id === variantId
              ? { ...i, quantity: i.quantity + quantity }
              : i
          );
        }
        return [
          ...prev,
          {
            product_id: product.id,
            variant_id: variantId,
            quantity,
            product,
            variant,
          },
        ];
      });
    },
    []
  );

  const removeItem = useCallback(
    (productId: string, variantId?: string | null) => {
      setItems((prev) =>
        prev.filter(
          (i) => !(i.product_id === productId && i.variant_id === (variantId ?? null))
        )
      );
    },
    []
  );

  const updateQuantity = useCallback(
    (productId: string, variantId: string | null, quantity: number) => {
      if (quantity <= 0) {
        removeItem(productId, variantId);
        return;
      }
      setItems((prev) =>
        prev.map((i) =>
          i.product_id === productId && i.variant_id === variantId
            ? { ...i, quantity }
            : i
        )
      );
    },
    [removeItem]
  );

  const clearCart = useCallback(() => setItems([]), []);

  const itemCount = useMemo(
    () => items.reduce((sum, i) => sum + i.quantity, 0),
    [items]
  );

  const subtotal = useMemo(
    () =>
      items.reduce((sum, i) => {
        const price = i.variant?.price ?? i.product?.price ?? 0;
        return sum + price * i.quantity;
      }, 0),
    [items]
  );

  return (
    <CartContext.Provider
      value={{ items, addItem, removeItem, updateQuantity, clearCart, itemCount, subtotal }}
    >
      {children}
    </CartContext.Provider>
  );
}
