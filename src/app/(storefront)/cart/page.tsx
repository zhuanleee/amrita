"use client";

import Link from "next/link";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useCart } from "@/lib/cart";
import { formatMYR } from "@/lib/currency";
import { getShippingFee, getFreeShippingProgress } from "@/lib/shipping";
import { MALAYSIAN_STATES, type MalaysianState } from "@/lib/types";
import { useState } from "react";

export default function CartPage() {
  const { items, updateQuantity, removeItem, subtotal, itemCount } = useCart();
  const [shippingState, setShippingState] = useState<MalaysianState>("Kuala Lumpur");

  const shippingFee = getShippingFee(shippingState, subtotal);
  const total = subtotal + shippingFee;
  const { remaining, percentage, isFree } = getFreeShippingProgress(subtotal);

  if (items.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-6 px-4">
        <ShoppingBag className="w-16 h-16 text-muted-foreground/40" />
        <h1 className="text-2xl font-[family-name:var(--font-eb-garamond)] text-gold">
          Your cart is empty
        </h1>
        <p className="text-muted-foreground">Discover our premium herbal mint candy collection</p>
        <Button asChild className="bg-amrita-gold hover:bg-amrita-gold/90 text-white">
          <Link href="/products">Continue Shopping</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-[family-name:var(--font-eb-garamond)] text-gold mb-8">
        Shopping Cart
      </h1>

      {/* Free shipping progress */}
      {!isFree && (
        <Card className="p-4 mb-6 bg-card">
          <p className="text-sm text-muted-foreground mb-2">
            Add <span className="font-semibold text-foreground">{formatMYR(remaining)}</span> more for free shipping!
          </p>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-amrita-teal rounded-full transition-all duration-500"
              style={{ width: `${percentage}%` }}
            />
          </div>
        </Card>
      )}
      {isFree && (
        <Card className="p-4 mb-6 bg-amrita-teal/10 border-amrita-teal/20">
          <p className="text-sm text-amrita-teal font-medium">You&apos;ve unlocked free shipping!</p>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => {
            const price = item.variant?.price ?? item.product?.price ?? 0;
            return (
              <Card key={`${item.product_id}-${item.variant_id}`} className="p-4 bg-card">
                <div className="flex gap-4">
                  <div
                    className="w-20 h-20 rounded-lg flex-shrink-0 flex items-center justify-center"
                    style={{
                      background:
                        item.product?.variant_color === "navy"
                          ? "linear-gradient(135deg, #0c1a2a, #1a2a3a)"
                          : "linear-gradient(135deg, #f5f1ea, #e8e4dd)",
                    }}
                  >
                    <span className="text-2xl font-serif-cn opacity-60">
                      {item.product?.variant_color === "navy" ? "菊" : "薄"}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium truncate">{item.product?.name_en ?? "Product"}</h3>
                    <p className="text-sm text-muted-foreground font-serif-cn">
                      {item.product?.name ?? ""}
                    </p>
                    {item.variant && (
                      <p className="text-xs text-muted-foreground mt-0.5">{item.variant.name}</p>
                    )}
                    <p className="text-sm font-medium mt-1">{formatMYR(price)}</p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      onClick={() => removeItem(item.product_id, item.variant_id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                    <div className="flex items-center gap-1 border rounded-md">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() =>
                          updateQuantity(item.product_id, item.variant_id, item.quantity - 1)
                        }
                      >
                        <Minus className="w-3 h-3" />
                      </Button>
                      <span className="w-8 text-center text-sm">{item.quantity}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() =>
                          updateQuantity(item.product_id, item.variant_id, item.quantity + 1)
                        }
                      >
                        <Plus className="w-3 h-3" />
                      </Button>
                    </div>
                    <p className="text-sm font-semibold">{formatMYR(price * item.quantity)}</p>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Order summary */}
        <div>
          <Card className="p-6 bg-card sticky top-24">
            <h2 className="text-lg font-[family-name:var(--font-eb-garamond)] text-gold mb-4">
              Order Summary
            </h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal ({itemCount} items)</span>
                <span>{formatMYR(subtotal)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Shipping to</span>
                <Select
                  value={shippingState}
                  onValueChange={(v) => setShippingState(v as MalaysianState)}
                >
                  <SelectTrigger className="w-40 h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {MALAYSIAN_STATES.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Shipping fee</span>
                <span>{isFree ? <span className="text-amrita-teal">Free</span> : formatMYR(shippingFee)}</span>
              </div>
              <Separator />
              <div className="flex justify-between text-base font-semibold">
                <span>Total</span>
                <span>{formatMYR(total)}</span>
              </div>
            </div>
            <Button
              asChild
              className="w-full mt-6 bg-amrita-gold hover:bg-amrita-gold/90 text-white"
            >
              <Link href="/checkout">Proceed to Checkout</Link>
            </Button>
            <Button asChild variant="ghost" className="w-full mt-2 text-muted-foreground">
              <Link href="/products">Continue Shopping</Link>
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
}
