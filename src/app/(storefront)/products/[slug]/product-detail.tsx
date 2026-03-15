"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Minus, Plus, ShoppingBag, ArrowLeft } from "lucide-react";
import { useCart } from "@/lib/cart";
import { formatMYR } from "@/lib/currency";
import type { Product, ProductVariant } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { trackViewContent } from "@/lib/meta-pixel";

interface ProductDetailProps {
  product: Product;
  variants: ProductVariant[];
}

export function ProductDetail({ product, variants }: ProductDetailProps) {
  const { addItem } = useCart();
  const [selectedVariantId, setSelectedVariantId] = useState(variants[0]?.id ?? null);
  const [quantity, setQuantity] = useState(1);

  const selectedVariant = variants.find((v) => v.id === selectedVariantId);
  const displayPrice = selectedVariant?.price ?? product.price;

  useEffect(() => {
    trackViewContent(product.name_en || product.name, product.id, displayPrice);
  }, [product.id, product.name, product.name_en, displayPrice]);

  const isNavy = product.variant_color === "navy";

  const handleAddToCart = () => {
    addItem(product, selectedVariant, quantity);
    toast.success(`${product.name_en} added to bag`, {
      description: `${selectedVariant?.name ?? "Default"} x ${quantity}`,
    });
  };

  return (
    <section className="py-12">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <Link
          href="/products"
          className="mb-8 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-gold"
        >
          <ArrowLeft className="size-4" />
          Back to Collection
        </Link>

        <div className="mt-4 grid gap-12 lg:grid-cols-2">
          {/* Product image */}
          <div
            className="relative aspect-square overflow-hidden rounded-2xl"
            style={{
              background: isNavy
                ? "linear-gradient(135deg, #0c1a2a 0%, #1a2a3a 40%, #2a3a4a 100%)"
                : "linear-gradient(135deg, #f5f1ea 0%, #e8e4dd 40%, #ddd8d0 100%)",
            }}
          >
            {/* Decorative dewdrop */}
            <div className="absolute inset-0 flex items-center justify-center">
              <svg width="200" height="240" viewBox="0 0 60 72" fill="none" className="opacity-15">
                <path
                  d="M30 4C30 4 6 32 6 46C6 59.2548 16.7452 68 30 68C43.2548 68 54 59.2548 54 46C54 32 30 4 30 4Z"
                  stroke={isNavy ? "#c8a96e" : "#8a7a5a"}
                  strokeWidth="1"
                  fill="none"
                />
              </svg>
            </div>

            {/* Corner ornaments */}
            <svg className="absolute top-6 left-6 size-10 opacity-20" viewBox="0 0 40 40" fill="none" stroke={isNavy ? "#c8a96e" : "#8a7a5a"} strokeWidth="1">
              <path d="M0 20L0 0L20 0" />
            </svg>
            <svg className="absolute top-6 right-6 size-10 opacity-20" viewBox="0 0 40 40" fill="none" stroke={isNavy ? "#c8a96e" : "#8a7a5a"} strokeWidth="1">
              <path d="M40 20L40 0L20 0" />
            </svg>
            <svg className="absolute bottom-6 left-6 size-10 opacity-20" viewBox="0 0 40 40" fill="none" stroke={isNavy ? "#c8a96e" : "#8a7a5a"} strokeWidth="1">
              <path d="M0 20L0 40L20 40" />
            </svg>
            <svg className="absolute right-6 bottom-6 size-10 opacity-20" viewBox="0 0 40 40" fill="none" stroke={isNavy ? "#c8a96e" : "#8a7a5a"} strokeWidth="1">
              <path d="M40 20L40 40L20 40" />
            </svg>

            {product.metadata?.sugar_free && (
              <div className="absolute top-6 left-6 mt-12">
                <Badge className="bg-amrita-teal text-white border-0">Sugar Free</Badge>
              </div>
            )}
          </div>

          {/* Product details */}
          <div className="flex flex-col gap-6">
            <div>
              <h1 className="font-serif-cn text-3xl font-bold text-foreground sm:text-4xl">
                {product.name}
              </h1>
              <p className="mt-1 font-[family-name:var(--font-eb-garamond)] text-xl text-muted-foreground">
                {product.name_en}
              </p>
            </div>

            <p className="text-3xl font-semibold text-gold">
              {formatMYR(displayPrice)}
            </p>

            {product.metadata?.sugar_free && (
              <Badge className="w-fit bg-amrita-teal/10 text-amrita-teal border-amrita-teal/20">
                Sugar Free
              </Badge>
            )}

            <p className="leading-relaxed text-muted-foreground">
              {product.description_en}
            </p>

            <Separator />

            {/* Variant selector */}
            {variants.length > 0 && (
              <div className="space-y-3">
                <label className="text-sm font-medium text-foreground">Package</label>
                <div className="grid grid-cols-3 gap-3">
                  {variants.map((v) => (
                    <button
                      key={v.id}
                      onClick={() => setSelectedVariantId(v.id)}
                      disabled={!v.available}
                      className={`rounded-lg border px-4 py-3 text-center text-sm font-medium transition-all ${
                        selectedVariantId === v.id
                          ? "border-amrita-gold bg-amrita-gold/10 text-gold"
                          : "border-border bg-card text-foreground hover:border-amrita-gold/50"
                      } ${!v.available ? "opacity-50 cursor-not-allowed" : ""}`}
                    >
                      <div>{v.name}</div>
                      <div className="mt-1 text-xs text-muted-foreground">
                        {formatMYR(v.price)}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity selector */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-foreground">Quantity</label>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="flex size-10 items-center justify-center rounded-lg border border-border transition-colors hover:bg-muted"
                  aria-label="Decrease quantity"
                >
                  <Minus className="size-4" />
                </button>
                <span className="w-10 text-center text-lg font-medium">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="flex size-10 items-center justify-center rounded-lg border border-border transition-colors hover:bg-muted"
                  aria-label="Increase quantity"
                >
                  <Plus className="size-4" />
                </button>
              </div>
            </div>

            {/* Add to cart */}
            <Button
              size="lg"
              className="w-full gradient-gold text-amrita-cream text-base hover:opacity-90"
              onClick={handleAddToCart}
            >
              <ShoppingBag className="size-5" />
              Add to Bag — {formatMYR(displayPrice * quantity)}
            </Button>

            <Separator />

            {/* Ingredients */}
            {product.metadata?.ingredients && (
              <div className="space-y-2">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-foreground">
                  Ingredients
                </h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {product.metadata.ingredients.join(", ")}
                </p>
              </div>
            )}

            {/* Benefits */}
            {product.metadata?.benefits && (
              <div className="space-y-2">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-foreground">
                  Benefits
                </h3>
                <ul className="grid grid-cols-2 gap-2">
                  {product.metadata.benefits.map((benefit) => (
                    <li key={benefit} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <svg className="size-4 shrink-0 text-amrita-teal" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                      {benefit}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {product.metadata?.weight && (
              <p className="text-xs text-muted-foreground">
                Net weight: {product.metadata.weight}
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
