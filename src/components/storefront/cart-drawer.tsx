"use client";

import Link from "next/link";
import { Minus, Plus, Trash2 } from "lucide-react";
import { useCart } from "@/lib/cart";
import { formatMYR } from "@/lib/currency";
import { getFreeShippingProgress, FREE_SHIPPING_THRESHOLD } from "@/lib/shipping";
import { Button } from "@/components/ui/button";
import {
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
  SheetDescription,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";

interface CartDrawerProps {
  onClose: () => void;
}

export function CartDrawer({ onClose }: CartDrawerProps) {
  const { items, updateQuantity, removeItem, subtotal, itemCount } = useCart();
  const progress = getFreeShippingProgress(subtotal);

  return (
    <SheetContent side="right" className="flex w-full flex-col bg-amrita-cream sm:max-w-md">
      <SheetHeader>
        <SheetTitle className="font-[family-name:var(--font-eb-garamond)] text-xl tracking-wide">
          Shopping Bag
        </SheetTitle>
        <SheetDescription className="text-sm text-muted-foreground">
          {itemCount === 0
            ? "Your bag is empty"
            : `${itemCount} item${itemCount > 1 ? "s" : ""} in your bag`}
        </SheetDescription>
      </SheetHeader>

      {items.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-4 px-4">
          <div className="flex size-20 items-center justify-center rounded-full bg-muted">
            <svg className="size-8 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
            </svg>
          </div>
          <p className="text-center text-sm text-muted-foreground">
            Your shopping bag is empty.
          </p>
          <Button asChild variant="outline" onClick={onClose}>
            <Link href="/products">Continue Shopping</Link>
          </Button>
        </div>
      ) : (
        <>
          {/* Free shipping progress */}
          <div className="px-4">
            {progress.isFree ? (
              <div className="rounded-lg bg-amrita-teal/10 px-3 py-2 text-center text-sm font-medium text-amrita-teal">
                You have free shipping!
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-center text-xs text-muted-foreground">
                  Add <span className="font-semibold text-foreground">{formatMYR(progress.remaining)}</span> more for free shipping
                </p>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-amrita-teal transition-all duration-500"
                    style={{ width: `${progress.percentage}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Cart items */}
          <div className="flex-1 overflow-y-auto px-4">
            <div className="space-y-4">
              {items.map((item) => {
                const price = item.variant?.price ?? item.product?.price ?? 0;
                const name = item.product?.name ?? "Product";
                const nameEn = item.product?.name_en ?? "";
                const variantColor = item.product?.variant_color;

                return (
                  <div key={`${item.product_id}-${item.variant_id}`} className="flex gap-3">
                    {/* Product thumbnail */}
                    <div
                      className="size-16 shrink-0 rounded-lg"
                      style={{
                        background:
                          variantColor === "navy"
                            ? "linear-gradient(135deg, #0c1a2a, #1a2a3a)"
                            : "linear-gradient(135deg, #f5f1ea, #e8e4dd)",
                      }}
                    />

                    <div className="flex flex-1 flex-col gap-1">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-serif-cn text-sm font-medium leading-tight">
                            {name}
                          </p>
                          <p className="text-xs text-muted-foreground">{nameEn}</p>
                          {item.variant && (
                            <p className="text-xs text-muted-foreground">
                              {item.variant.name}
                            </p>
                          )}
                        </div>
                        <button
                          onClick={() => removeItem(item.product_id, item.variant_id)}
                          className="shrink-0 p-0.5 text-muted-foreground transition-colors hover:text-destructive"
                          aria-label="Remove item"
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() =>
                              updateQuantity(item.product_id, item.variant_id, item.quantity - 1)
                            }
                            className="flex size-6 items-center justify-center rounded border border-border text-xs transition-colors hover:bg-muted"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="size-3" />
                          </button>
                          <span className="w-6 text-center text-sm">{item.quantity}</span>
                          <button
                            onClick={() =>
                              updateQuantity(item.product_id, item.variant_id, item.quantity + 1)
                            }
                            className="flex size-6 items-center justify-center rounded border border-border text-xs transition-colors hover:bg-muted"
                            aria-label="Increase quantity"
                          >
                            <Plus className="size-3" />
                          </button>
                        </div>
                        <p className="text-sm font-medium text-gold">
                          {formatMYR(price * item.quantity)}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Footer */}
          <SheetFooter className="border-t border-border pt-4">
            <div className="w-full space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Subtotal</span>
                <span className="text-base font-semibold">{formatMYR(subtotal)}</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Shipping calculated at checkout
              </p>
              <Separator />
              <Button
                asChild
                className="w-full gradient-gold text-amrita-cream hover:opacity-90"
                size="lg"
                onClick={onClose}
              >
                <Link href="/checkout">Checkout</Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="w-full"
                onClick={onClose}
              >
                <Link href="/cart">View Full Cart</Link>
              </Button>
            </div>
          </SheetFooter>
        </>
      )}
    </SheetContent>
  );
}
